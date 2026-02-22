/**
 * GameEngine: Pure orchestrator for Carcassonne game logic.
 *
 * All public methods take a GameState and return a new GameState (immutable).
 * No side effects, no UI dependencies — fully unit-testable.
 */

import type { GameState } from '../types/game.ts'
import type { Coordinate } from '../types/board.ts'
import type { TileDefinition, Rotation, Direction } from '../types/tile.ts'
import type { Player, MeepleType } from '../types/player.ts'
import { coordKey, emptyBoard, keyToCoord } from '../types/board.ts'
import { emptyUnionFindState } from '../types/feature.ts'
import { createPlayer, PLAYER_COLORS } from '../types/player.ts'
import { getFallbackBaseTiles } from '../../services/tileRegistry.ts'
import { getExpansionConfig } from '../expansions/registry.ts'
import { buildCombinedIcTbRules } from '../expansions/tradersBuilders.ts'
import { createInitialDragonFairyState, type DragonFairyState } from '../expansions/dragonFairy.ts'
import { createTileBag, drawTile as drawFromBag } from './TileBag.ts'
import {
  isValidPlacement,
  getValidPositions,
  getValidRotations,
  getAllPotentialPlacements,
  hasAnyValidPlacement,
} from './TilePlacement.ts'

// Re-export specifically for GameStore usage
export {
  isValidPlacement,
  getAllPotentialPlacements,
  canPlaceMeeple,
  canPlaceBuilderOrPig,
}

import { addTileToUnionFind, updateFeatureMeeples, findRoot, getFeature } from './FeatureDetector.ts'
import { canPlaceMeeple, getPlaceableSegments, createMeeplePlacement, canPlaceBuilderOrPig } from './MeeplePlacement.ts'
import {
  scoreCompletedFeatures,
  scoreAllRemainingFeatures,
  applyScoreEvents,
  distributeCommodityTokens,
  scoreTradersBonus,
  BASE_SCORING_RULES,
  type ScoringRule,
} from './ScoreCalculator.ts'
import { nodeKey } from '../types/feature.ts'

// ─── Initialization ───────────────────────────────────────────────────────────

export interface GameConfig {
  playerNames: string[]
  extraTileDefinitions?: TileDefinition[]
  baseDefinitions?: TileDefinition[]
  scoringRules?: ScoringRule[]
  expansions?: string[]
  debugPrioritizeExpansions?: boolean
}

export function initGame(config: GameConfig): GameState {
  const {
    playerNames,
    extraTileDefinitions = [],
    baseDefinitions = getFallbackBaseTiles(),
    scoringRules = BASE_SCORING_RULES,
    expansions = [],
    debugPrioritizeExpansions = false,
  } = config

  if (playerNames.length < 2 || playerNames.length > 6) {
    throw new Error('Carcassonne supports 2–6 players')
  }

  // Resolve expansion configs
  const hasIc = expansions.includes('inns-cathedrals') || expansions.includes('inns-cathedrals-c31')
  const hasTb = expansions.includes('traders-builders') || expansions.includes('traders-builders-c31')
  const hasDf = expansions.includes('dragon-fairy')
  const enableBigMeeple = hasIc
  const enableBuilderAndPig = hasTb

  // Filter extra tiles to only include tiles from enabled expansions
  let allExtraTiles = extraTileDefinitions.filter(
    t => !t.expansionId || expansions.includes(t.expansionId)
  )
  let activeRules = scoringRules

  if (hasIc) {
    const icId = expansions.includes('inns-cathedrals-c31') ? 'inns-cathedrals-c31' : 'inns-cathedrals'
    const ic = getExpansionConfig(icId)
    if (ic) {
      // Only add hardcoded IC tiles if none were provided via extraTileDefinitions (DB)
      const hasDbIcTiles = allExtraTiles.some(t => t.expansionId === icId)
      if (!hasDbIcTiles) {
        allExtraTiles = [...allExtraTiles, ...ic.tiles]
      }
      activeRules = ic.scoringRules
    }
  }

  if (hasTb) {
    const tbId = expansions.includes('traders-builders-c31') ? 'traders-builders-c31' : 'traders-builders'
    const tb = getExpansionConfig(tbId)
    if (tb) {
      const hasDbTbTiles = allExtraTiles.some(t => t.expansionId === tbId)
      if (!hasDbTbTiles) {
        allExtraTiles = [...allExtraTiles, ...tb.tiles]
      }
      if (hasIc) {
        // Both expansions: IC rules for ROAD/CITY/CLOISTER + pig-aware FIELD
        activeRules = buildCombinedIcTbRules(activeRules)
      } else {
        activeRules = tb.scoringRules
      }
    }
  }

  if (hasDf) {
    const df = getExpansionConfig('dragon-fairy')
    if (df) {
      const hasDbDfTiles = allExtraTiles.some(t => t.expansionId === 'dragon-fairy')
      if (!hasDbDfTiles) {
        allExtraTiles = [...allExtraTiles, ...df.tiles]
      }
      // D&F doesn't change scoring rules — fairy +3 is handled separately
    }
  }

  const players: Player[] = playerNames.map((name, i) =>
    createPlayer(`player_${i}`, name, PLAYER_COLORS[i], enableBigMeeple, enableBuilderAndPig)
  )

  const allDefs = [...baseDefinitions, ...allExtraTiles]
  const tileMap: Record<string, TileDefinition> = {}
  allDefs.forEach(d => { tileMap[d.id] = d })

  const { bag, startingTile } = createTileBag(allDefs, [], debugPrioritizeExpansions)

  const board = emptyBoard()
  board.tiles['0,0'] = {
    coordinate: { x: 0, y: 0 },
    definitionId: startingTile.definitionId,
    rotation: startingTile.rotation,
    meeples: {},
  }

  // Initialize union-find with the starting tile's segments
  const ufState = emptyUnionFindState()
  const { state: initialUfState } = addTileToUnionFind(ufState, board, tileMap, board.tiles['0,0'])

  return {
    phase: 'PLAYING',
    turnPhase: 'DRAW_TILE',
    players,
    currentPlayerIndex: 0,
    board,
    tileBag: bag,
    currentTile: null,
    lastPlacedCoord: null,
    completedFeatureIds: [],
    featureUnionFind: initialUfState,
    lastScoreEvents: [],
    boardMeeples: {},
    expansionData: {
      scoringRules: activeRules,
      expansions,
      ...(hasTb ? { tradersBuilders: { isBuilderBonusTurn: false, pendingBuilderBonus: false } } : {}),
      ...(hasDf ? { dragonFairy: createInitialDragonFairyState() } : {}),
    },
    staticTileMap: tileMap,

  }
}

// ─── Turn actions (pure functions: state → newState) ──────────────────────────

export function drawTile(state: GameState): GameState {
  if (state.turnPhase !== 'DRAW_TILE') return state

  const result = drawFromBag(state.tileBag)
  if (!result) {
    // Bag is empty — end the game
    return endGame(state)
  }

  // Check if this tile has any valid placement; if not, discard and draw again
  if (!hasAnyValidPlacement(state.board, state.staticTileMap, result.tile)) {
    // Discard this tile and try the next
    return drawTile({ ...state, tileBag: result.remaining })
  }

  const newState: GameState = {
    ...state,
    tileBag: result.remaining,
    currentTile: result.tile,
    turnPhase: 'PLACE_TILE',
    lastScoreEvents: [],
  }

  // ── Dragon & Fairy: Dragon tile movement (C3.1: moves BEFORE placement) ──
  const dfData = getDfState(newState)
  const tileDef = newState.staticTileMap[result.tile.definitionId]
  if (dfData && dfData.dragonInPlay && dfData.dragonPosition && tileDef?.hasDragon) {
    return {
      ...newState,
      turnPhase: 'DRAGON_MOVEMENT',
      expansionData: {
        ...newState.expansionData,
        dragonFairy: {
          ...dfData,
          dragonMovement: { movesRemaining: 2, nextPhase: 'PLACE_TILE' }
        }
      }
    }
  }

  return newState
}

export function rotateTile(state: GameState): GameState {
  if (state.turnPhase !== 'PLACE_TILE' || !state.currentTile) return state

  const rotations: Rotation[] = [0, 90, 180, 270]
  const currentIdx = rotations.indexOf(state.currentTile.rotation)
  const nextRotation = rotations[(currentIdx + 1) % 4]

  return {
    ...state,
    currentTile: { ...state.currentTile, rotation: nextRotation },
  }
}

export function placeTile(state: GameState, coord: Coordinate): GameState {
  if (state.turnPhase !== 'PLACE_TILE' || !state.currentTile) return state

  if (!isValidPlacement(state.board, state.staticTileMap, state.currentTile, coord)) {
    return state  // invalid placement — no change
  }

  const placedTile = {
    coordinate: coord,
    definitionId: state.currentTile.definitionId,
    rotation: state.currentTile.rotation,
    meeples: {},
  }

  const newBoard = {
    ...state.board,
    tiles: { ...state.board.tiles, [coordKey(coord)]: placedTile },
    minX: Math.min(state.board.minX, coord.x),
    maxX: Math.max(state.board.maxX, coord.x),
    minY: Math.min(state.board.minY, coord.y),
    maxY: Math.max(state.board.maxY, coord.y),
  }

  const { state: newUfState, completedFeatureIds } = addTileToUnionFind(
    state.featureUnionFind,
    newBoard,
    state.staticTileMap,
    placedTile,
  )

  // ── Builder bonus detection (T&B) ─────────────────────────────────────────
  const tbData = state.expansionData['tradersBuilders'] as
    { isBuilderBonusTurn: boolean; pendingBuilderBonus: boolean } | undefined

  let newExpansionData = state.expansionData

  if (tbData && !tbData.isBuilderBonusTurn) {
    const currentPlayer = state.players[state.currentPlayerIndex]

    // Find if the current player has a builder on the board
    const builderNodeKey = Object.entries(state.boardMeeples).find(
      ([, mp]) => mp.playerId === currentPlayer.id && mp.meepleType === 'BUILDER',
    )?.[0]

    if (builderNodeKey) {
      // Get the builder's feature root in the NEW state (after this tile was placed)
      const builderRoot = findRoot(newUfState, builderNodeKey)
      const builderFeature = newUfState.featureData[builderRoot]

      if (builderFeature) {
        // Builder bonus triggers if:
        // 1. The placed tile is now part of the builder's feature
        // 2. The feature is NOT complete (otherwise builder returns normally)
        const tileIsInFeature = builderFeature.nodes.some(
          n => n.coordinate.x === coord.x && n.coordinate.y === coord.y,
        )
        if (tileIsInFeature && !builderFeature.isComplete) {
          newExpansionData = {
            ...state.expansionData,
            tradersBuilders: { ...tbData, pendingBuilderBonus: true },
          }
        }
      }
    }
  }

  // ── Dragon & Fairy: Dragon Hoard and Dragon tile detection ─────────────────
  const dfData = newExpansionData['dragonFairy'] as DragonFairyState | undefined
  const tileDef = state.staticTileMap[state.currentTile.definitionId]
  let nextTurnPhase: GameState['turnPhase'] = 'PLACE_MEEPLE'

  if (dfData && tileDef) {
    if (tileDef.isDragonHoard) {
      // Dragon Hoard: dragon spawns here, player orients, no meeple placement
      const updatedDf: DragonFairyState = {
        ...dfData,
        dragonPosition: coord,
        dragonInPlay: true,
        dragonFacing: null,  // Player must choose
        dragonMovement: null, // Ensure no movement state
      }
      newExpansionData = { ...newExpansionData, dragonFairy: updatedDf }
      nextTurnPhase = 'DRAGON_ORIENT'
    }
  }

  return {
    ...state,
    board: newBoard,
    currentTile: state.currentTile,  // keep for reference
    lastPlacedCoord: coord,
    completedFeatureIds,
    featureUnionFind: newUfState,
    lastScoreEvents: [],
    turnPhase: nextTurnPhase,
    expansionData: newExpansionData,
  }
}

export function placeMeeple(
  state: GameState,
  segmentId: string,
  meepleType: MeepleType = 'NORMAL',
): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE' || !state.currentTile) return state

  // Find the coordinate of the just-placed tile (last tile placed before meeple phase)
  const lastCoord = state.lastPlacedCoord ?? findLastPlacedCoord(state)
  if (!lastCoord) return state

  const player = state.players[state.currentPlayerIndex]
  const dfData = getDfState(state)

  if (!canPlaceMeeple(state.featureUnionFind, player, lastCoord, segmentId, meepleType, dfData?.dragonPosition)) {
    return state  // invalid meeple placement
  }

  const meepleData = createMeeplePlacement(player.id, meepleType, segmentId)
  const nKey = nodeKey(lastCoord, segmentId)

  // Update the board tile's meeples record
  const existingTile = state.board.tiles[coordKey(lastCoord)]!
  const updatedTile = {
    ...existingTile,
    meeples: { ...existingTile.meeples, [segmentId]: meepleData },
  }

  // Update the union-find feature's meeples list
  const feature = state.featureUnionFind.featureData[nKey]
    ?? state.featureUnionFind.featureData[state.featureUnionFind.parent[nKey]]
  const updatedMeeples = [...(feature?.meeples ?? []), meepleData]
  const newUfState = updateFeatureMeeples(state.featureUnionFind, nKey, updatedMeeples)

  // Deduct meeple from player
  const updatedPlayers = state.players.map(p =>
    p.id === player.id
      ? {
        ...p,
        meeples: {
          ...p.meeples,
          available: {
            ...p.meeples.available,
            [meepleType]: p.meeples.available[meepleType] - 1,
          },
          onBoard: [...p.meeples.onBoard, nKey],
        },
      }
      : p
  )

  // Reorient dragon if meeple not in straight line from dragon
  let updatedExpansionData = state.expansionData
  if (dfData?.dragonPosition) {
    const dragonCoord = dfData.dragonPosition
    const isInStraightLine = lastCoord.x === dragonCoord.x || lastCoord.y === dragonCoord.y
    if (!isInStraightLine) {
      const newFacing = findNearestMeepleDirection(
        state.board, { ...state.boardMeeples, [nKey]: meepleData },
        dragonCoord, dfData.fairyPosition,
      )
      if (newFacing) {
        updatedExpansionData = {
          ...updatedExpansionData,
          dragonFairy: { ...dfData, dragonFacing: newFacing },
        }
      }
    }
  }

  return {
    ...state,
    board: {
      ...state.board,
      tiles: { ...state.board.tiles, [coordKey(lastCoord)]: updatedTile },
    },
    featureUnionFind: newUfState,
    players: updatedPlayers,
    boardMeeples: { ...state.boardMeeples, [nKey]: meepleData },
    turnPhase: 'SCORE',
    expansionData: updatedExpansionData,
  }
}

/**
 * Place a BUILDER or PIG on a tile that already exists on the board (not the last-placed tile).
 * Uses inverse placement rules: the feature must already contain a meeple from the player.
 */
export function placeMeepleOnExistingTile(
  state: GameState,
  coord: Coordinate,
  segmentId: string,
  meepleType: 'BUILDER' | 'PIG',
): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state

  const player = state.players[state.currentPlayerIndex]
  const dfData = getDfState(state)

  if (!canPlaceBuilderOrPig(state.featureUnionFind, player, coord, segmentId, meepleType, dfData?.dragonPosition)) {
    return state
  }

  const meepleData = createMeeplePlacement(player.id, meepleType, segmentId)
  const nKey = nodeKey(coord, segmentId)

  // Update the board tile's meeples record
  const tileKey = `${coord.x},${coord.y}`
  const existingTile = state.board.tiles[tileKey]!
  const updatedTile = {
    ...existingTile,
    meeples: { ...existingTile.meeples, [segmentId]: meepleData },
  }

  // Update the union-find feature's meeples list
  const feature = getFeature(state.featureUnionFind, nKey)
  const updatedMeeples = [...(feature?.meeples ?? []), meepleData]
  const newUfState = updateFeatureMeeples(state.featureUnionFind, nKey, updatedMeeples)

  // Deduct meeple from player
  const updatedPlayers = state.players.map(p =>
    p.id === player.id
      ? {
        ...p,
        meeples: {
          ...p.meeples,
          available: {
            ...p.meeples.available,
            [meepleType]: p.meeples.available[meepleType] - 1,
          },
          onBoard: [...p.meeples.onBoard, nKey],
        },
      }
      : p,
  )

  return {
    ...state,
    board: {
      ...state.board,
      tiles: { ...state.board.tiles, [tileKey]: updatedTile },
    },
    featureUnionFind: newUfState,
    players: updatedPlayers,
    boardMeeples: { ...state.boardMeeples, [nKey]: meepleData },
    turnPhase: 'SCORE',
  }
}

export function skipMeeple(state: GameState): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state
  return { ...state, turnPhase: 'SCORE' }
}

// ─── Rule Resolution ──────────────────────────────────────────────────────────

function resolveScoringRules(expansions: string[]): ScoringRule[] {
  let activeRules = BASE_SCORING_RULES
  const hasIc = expansions.includes('inns-cathedrals') || expansions.includes('inns-cathedrals-c31')
  const hasTb = expansions.includes('traders-builders') || expansions.includes('traders-builders-c31')

  if (hasIc) {
    const icId = expansions.includes('inns-cathedrals-c31') ? 'inns-cathedrals-c31' : 'inns-cathedrals'
    const ic = getExpansionConfig(icId)
    if (ic) activeRules = ic.scoringRules
  }

  if (hasTb) {
    const tbId = expansions.includes('traders-builders-c31') ? 'traders-builders-c31' : 'traders-builders'
    const tb = getExpansionConfig(tbId)
    if (tb) {
      if (hasIc) {
        activeRules = buildCombinedIcTbRules(activeRules)
      } else {
        activeRules = tb.scoringRules
      }
    }
  }
  return activeRules
}

export function scoreFeatureCompletion(state: GameState, featureId: string): { state: GameState; event: ScoreEvent | null } {
  const rules = resolveScoringRules(state.expansionData.expansions as string[] ?? [])
  const events = scoreCompletedFeatures([featureId], state.featureUnionFind, state.players, rules)
  if (events.length === 0) return { state, event: null }

  const event = events[0]
  let updatedPlayers = applyScoreEvents(state.players, [event])
  let updatedBoardMeeples = { ...state.boardMeeples }
  let updatedUfState = { ...state.featureUnionFind }
  let updatedBoardTiles = { ...state.board.tiles }

  const feature = state.featureUnionFind.featureData[featureId]
  if (feature) {
    const featureNodeKeys = new Set(
      feature.nodes.map(n => nodeKey(n.coordinate, n.segmentId))
    )

    for (const meeple of feature.meeples) {
      const owner = updatedPlayers.find(p => p.id === meeple.playerId)
      const nKey = owner?.meeples.onBoard.find(k => featureNodeKeys.has(k))
      if (!nKey) continue

      delete updatedBoardMeeples[nKey]

      const [tileCoordKey, segmentId] = nKey.split(':') as [string, string]
      const tile = updatedBoardTiles[tileCoordKey]
      if (tile) {
        const { [segmentId]: _removed, ...remainingMeeples } = tile.meeples
        updatedBoardTiles = {
          ...updatedBoardTiles,
          [tileCoordKey]: { ...tile, meeples: remainingMeeples },
        }
      }

      updatedPlayers = updatedPlayers.map(p =>
        p.id === meeple.playerId
          ? {
            ...p,
            meeples: {
              ...p.meeples,
              available: {
                ...p.meeples.available,
                [meeple.meepleType]: p.meeples.available[meeple.meepleType as MeepleType] + 1,
              },
              onBoard: p.meeples.onBoard.filter(k => k !== nKey),
            },
          }
          : p
      )
    }

    updatedUfState = updateFeatureMeeples(updatedUfState, featureId, [])
  }

  // Handle commodity tokens (T&B)
  if (feature && feature.type === 'CITY' && feature.isComplete) {
    const tokenDist = distributeCommodityTokens(feature)
    updatedPlayers = updatedPlayers.map(p => {
      const tokens = tokenDist[p.id]
      if (!tokens) return p
      return {
        ...p,
        traderTokens: {
          WINE: p.traderTokens.WINE + (tokens.WINE ?? 0),
          WHEAT: p.traderTokens.WHEAT + (tokens.WHEAT ?? 0),
          CLOTH: p.traderTokens.CLOTH + (tokens.CLOTH ?? 0),
        }
      }
    })
  }

  return {
    state: {
      ...state,
      players: updatedPlayers,
      board: { ...state.board, tiles: updatedBoardTiles },
      boardMeeples: updatedBoardMeeples,
      featureUnionFind: updatedUfState,
      completedFeatureIds: state.completedFeatureIds.filter(fid => fid !== featureId),
    },
    event
  }
}

export function endTurn(state: GameState): GameState {
  if (state.turnPhase !== 'SCORE') return state

  let currentState = state
  const featureIds = [...state.completedFeatureIds]
  const allEvents: ScoreEvent[] = []

  for (const id of featureIds) {
    const { state: nextState, event } = scoreFeatureCompletion(currentState, id)
    currentState = nextState
    if (event) allEvents.push(event)
  }

  // ── Builder bonus turn logic (T&B) ───────────────────────────────────────
  const tbData = state.expansionData['tradersBuilders'] as
    { isBuilderBonusTurn: boolean; pendingBuilderBonus: boolean } | undefined
  const pendingBonus = tbData?.pendingBuilderBonus ?? false
  const isAlreadyBonusTurn = tbData?.isBuilderBonusTurn ?? false

  let nextPlayerIndex: number
  let nextTbData: typeof tbData

  if (pendingBonus && !isAlreadyBonusTurn) {
    nextPlayerIndex = state.currentPlayerIndex
    nextTbData = { isBuilderBonusTurn: true, pendingBuilderBonus: false }
  } else {
    nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length
    nextTbData = tbData ? { isBuilderBonusTurn: false, pendingBuilderBonus: false } : undefined
  }

  // ── Dragon & Fairy: fairy scoring & fairy move opportunity ──────────────
  const dfData = state.expansionData['dragonFairy'] as DragonFairyState | undefined
  let dfUpdated: DragonFairyState | undefined

  if (dfData) {
    let currentDf = { ...dfData }
    let fairyPlayers = [...currentState.players]

    if (currentDf.fairyPosition) {
      const { coordinate: fCoord, segmentId: fSegId } = currentDf.fairyPosition
      const fNodeKey = nodeKey(fCoord, fSegId)
      let fairyScoredThisTurn = false

      for (const event of allEvents) {
        const feature = state.featureUnionFind.featureData[event.featureId]
        if (!feature) continue

        const fairyInFeature = feature.nodes.some(
          n => n.coordinate.x === fCoord.x && n.coordinate.y === fCoord.y && n.segmentId === fSegId
        )

        if (fairyInFeature) {
          const meeple = state.boardMeeples[fNodeKey]
          if (meeple) {
            fairyPlayers = fairyPlayers.map(p =>
              p.id === meeple.playerId ? { ...p, score: p.score + 3 } : p
            )
          }
          fairyScoredThisTurn = true
          break
        }
      }

      if (fairyScoredThisTurn) {
        currentDf.fairyPosition = null
      }
    }

    const currentPlayer = state.players[state.currentPlayerIndex]
    const scoredZeroOnRoadOrCity = allEvents.some(e =>
      (e.featureType === 'ROAD' || e.featureType === 'CITY') && (e.scores[currentPlayer.id] ?? 0) === 0
    )

    if (scoredZeroOnRoadOrCity && !currentDf.canMoveFairy) {
      currentDf.canMoveFairy = true
    }
    dfUpdated = currentDf
    currentState = { ...currentState, players: fairyPlayers }
  }

  const nextExpansionData = {
    ...state.expansionData,
    ...(tbData !== undefined ? { tradersBuilders: nextTbData } : {}),
    ...(dfUpdated ? { dragonFairy: dfUpdated } : {}),
  }

  const updatedBoardTiles = currentState.board.tiles
  const updatedPlayers = currentState.players
  const updatedUfState = currentState.featureUnionFind
  const updatedBoardMeeples = currentState.boardMeeples

  if (dfUpdated?.canMoveFairy) {
    const targets = getFairyMoveTargets(currentState);
    if (targets.length > 0) {
      return {
        ...currentState,
        board: { ...currentState.board, tiles: updatedBoardTiles },
        players: updatedPlayers,
        currentPlayerIndex: state.currentPlayerIndex,
        featureUnionFind: updatedUfState,
        boardMeeples: updatedBoardMeeples,
        currentTile: state.currentTile,
        lastPlacedCoord: null,
        completedFeatureIds: [],
        lastScoreEvents: allEvents,
        turnPhase: 'FAIRY_MOVE',
        expansionData: nextExpansionData,
      }
    } else {
      if (dfUpdated) dfUpdated.canMoveFairy = false;
    }
  }

  const dfFinal = (nextExpansionData['dragonFairy'] as DragonFairyState | undefined)
  const nextPlayer = updatedPlayers[nextPlayerIndex]
  let nextTurnPhase: GameState['turnPhase'] = 'DRAW_TILE'
  if (dfFinal?.dragonHeldBy === nextPlayer?.id) {
    nextTurnPhase = 'DRAGON_PLACE'
  }

  return {
    ...currentState,
    board: { ...currentState.board, tiles: updatedBoardTiles },
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    featureUnionFind: updatedUfState,
    boardMeeples: updatedBoardMeeples,
    currentTile: null,
    lastPlacedCoord: null,
    completedFeatureIds: [],
    lastScoreEvents: allEvents,
    turnPhase: nextTurnPhase,
    expansionData: nextExpansionData,
  }
}

// ─── End game ─────────────────────────────────────────────────────────────────

export function endGame(state: GameState): GameState {
  const completedFeatureIds = new Set(
    Object.keys(state.featureUnionFind.featureData).filter(
      k => state.featureUnionFind.featureData[k]?.isComplete
    )
  )

  const rules = resolveScoringRules(state.expansionData.expansions as string[] ?? [])
  const endGameEvents = scoreAllRemainingFeatures(
    state.featureUnionFind,
    completedFeatureIds,
    state.players,
    rules,
  )

  let finalPlayers = applyScoreEvents(state.players, endGameEvents)
  let allEndGameEvents = endGameEvents

  // ── Trader bonus (T&B) ───────────────────────────────────────────────────
  const expansions = state.expansionData.expansions as string[] | undefined
  if (expansions?.includes('traders-builders')) {
    const traderBonusEvents = scoreTradersBonus(finalPlayers)
    if (traderBonusEvents.length > 0) {
      finalPlayers = applyScoreEvents(finalPlayers, traderBonusEvents)
      allEndGameEvents = [...endGameEvents, ...traderBonusEvents]
    }
  }

  return {
    ...state,
    phase: 'END',
    turnPhase: 'NEXT_PLAYER',
    players: finalPlayers,
    lastScoreEvents: allEndGameEvents,
  }
}

// ─── Query functions ──────────────────────────────────────────────────────────

export function getValidPlacements(state: GameState): Coordinate[] {
  if (!state.currentTile || state.turnPhase !== 'PLACE_TILE') return []
  return getValidPositions(state.board, state.staticTileMap, state.currentTile)
}

export function getValidTileRotations(state: GameState, coord: Coordinate): Rotation[] {
  if (!state.currentTile) return []
  return getValidRotations(state.board, state.staticTileMap, state.currentTile, coord)
}

export function getAvailableSegmentsForMeeple(state: GameState): string[] {
  const lastCoord = state.lastPlacedCoord ?? findLastPlacedCoord(state)
  if (!lastCoord) return []

  const player = state.players[state.currentPlayerIndex]
  const dfData = getDfState(state)
  return getPlaceableSegments(state.featureUnionFind, state.staticTileMap, state.board, lastCoord, player, dfData?.dragonPosition)
}

// ─── Private helpers ──────────────────────────────────────────────────────────

// ... (existing helper)
function findLastPlacedCoord(state: GameState): Coordinate | null {
  if (!state.currentTile) return null

  // The last placed tile is the one matching currentTile that has an empty meeples record
  // and whose definitionId matches. In case of ties (multiple same tiles), return the last one
  // that was added — but since we don't have a timestamp, we rely on the board structure.
  // This is a known limitation; adding lastPlacedCoord to GameState would fix it cleanly.

  for (const tile of Object.values(state.board.tiles)) {
    if (
      tile.definitionId === state.currentTile.definitionId &&
      tile.rotation === state.currentTile.rotation &&
      Object.keys(tile.meeples).length === 0 &&
      // Must be recently placed (not on the board meeples yet from this turn)
      !state.boardMeeples[coordKey(tile.coordinate)]
    ) {
      return tile.coordinate
    }
  }
  return null
}

// ─── Dragon & Fairy functions ──────────────────────────────────────────────

const DIRECTION_DELTAS: Record<Direction, { dx: number; dy: number }> = {
  NORTH: { dx: 0, dy: -1 },
  EAST: { dx: 1, dy: 0 },
  SOUTH: { dx: 0, dy: 1 },
  WEST: { dx: -1, dy: 0 },
}

const PERPENDICULAR_DIRS: Record<Direction, Direction[]> = {
  NORTH: ['EAST', 'WEST'],
  SOUTH: ['EAST', 'WEST'],
  EAST: ['NORTH', 'SOUTH'],
  WEST: ['NORTH', 'SOUTH'],
}

function getDfState(state: GameState): DragonFairyState | undefined {
  return state.expansionData['dragonFairy'] as DragonFairyState | undefined
}

/**
 * Find the cardinal direction from `from` toward the nearest meeple on the board.
 * Looks in all 4 directions along straight lines. Returns null if no meeple found.
 */
function findNearestMeepleDirection(
  board: GameState['board'],
  boardMeeples: GameState['boardMeeples'],
  from: Coordinate,
  _fairyPos: DragonFairyState['fairyPosition'],
): Direction | null {
  let bestDir: Direction | null = null
  let bestDist = Infinity

  for (const dir of ['NORTH', 'EAST', 'SOUTH', 'WEST'] as Direction[]) {
    const { dx, dy } = DIRECTION_DELTAS[dir]
    let x = from.x + dx
    let y = from.y + dy
    let dist = 1

    while (board.tiles[coordKey({ x, y })]) {
      const tileKey = coordKey({ x, y })
      // Check if any meeple exists on this tile
      const hasMeeple = Object.keys(boardMeeples).some(k => k.startsWith(tileKey + ':'))
      if (hasMeeple && dist < bestDist) {
        bestDist = dist
        bestDir = dir
        break
      }
      x += dx
      y += dy
      dist++
    }
  }

  return bestDir
}

/**
 * Get valid dragon orientations (C3.1 rules).
 * 1. Must face a direction with a directly adjacent tile.
 * 2. If any such direction has a meeple in unbroken line of sight,
 *    restrict to only those directions (gaps interrupt LoS).
 */
export function getValidDragonOrientations(state: GameState): Direction[] {
  const dfData = getDfState(state)
  if (!dfData?.dragonPosition) return []

  const pos = dfData.dragonPosition

  // Step 1: directions with an adjacent tile
  const adjacentDirs: Direction[] = []
  for (const dir of ['NORTH', 'EAST', 'SOUTH', 'WEST'] as Direction[]) {
    const { dx, dy } = DIRECTION_DELTAS[dir]
    if (state.board.tiles[coordKey({ x: pos.x + dx, y: pos.y + dy })]) {
      adjacentDirs.push(dir)
    }
  }

  if (adjacentDirs.length === 0) return []

  // Step 2: of those, which have a meeple in unbroken LoS?
  const dirsWithMeeple: Direction[] = []
  for (const dir of adjacentDirs) {
    const { dx, dy } = DIRECTION_DELTAS[dir]
    let x = pos.x + dx
    let y = pos.y + dy

    while (state.board.tiles[coordKey({ x, y })]) {
      const tileKey = coordKey({ x, y })
      const hasMeeple = Object.keys(state.boardMeeples).some(k => k.startsWith(tileKey + ':'))
      if (hasMeeple) {
        dirsWithMeeple.push(dir)
        break
      }
      x += dx
      y += dy
    }
  }

  // If any direction has a meeple in LoS, restrict to those; otherwise all adjacent dirs are valid
  return dirsWithMeeple.length > 0 ? dirsWithMeeple : adjacentDirs
}

/**
 * Set the dragon's facing direction, execute movement, then skip to SCORE
 * (no meeple placement allowed on Dragon Hoard tiles).
 */
export function orientDragon(state: GameState, direction: Direction): GameState {
  if (state.turnPhase !== 'DRAGON_ORIENT') return state

  const dfData = getDfState(state)
  if (!dfData?.dragonPosition) return state

  const updatedDf: DragonFairyState = {
    ...dfData,
    dragonFacing: direction,
  }

  // If we are in a movement sequence, determine next phase
  if (dfData.dragonMovement) {
    const remaining = dfData.dragonMovement.movesRemaining
    if (remaining > 0) {
      // Immediately execute the next movement step with the new facing
      const nextState = {
        ...state,
        expansionData: { ...state.expansionData, dragonFairy: updatedDf },
      }
      return executeDragonMovement(nextState)
    } else {
      return {
        ...state,
        turnPhase: dfData.dragonMovement.nextPhase,
        expansionData: { ...state.expansionData, dragonFairy: { ...updatedDf, dragonMovement: null } },
      }
    }
  }

  // Fallback for Dragon Hoard or other orientation triggers
  return {
    ...state,
    turnPhase: 'SCORE',
    expansionData: { ...state.expansionData, dragonFairy: updatedDf },
  }
}

/**
 * Get all coordinates of Dragon Hoard tiles currently on the board.
 */
export function getDragonHoardTilesOnBoard(state: GameState): Coordinate[] {
  const coords: Coordinate[] = []
  for (const [key, tile] of Object.entries(state.board.tiles)) {
    const def = state.staticTileMap[tile.definitionId]
    if (def?.isDragonHoard) {
      coords.push(keyToCoord(key))
    }
  }
  return coords
}

/**
 * Place the captured dragon on a Dragon Hoard tile and enter orientation phase.
 */
export function placeDragonOnHoard(state: GameState, coord: Coordinate): GameState {
  if (state.turnPhase !== 'DRAGON_PLACE') return state

  const dfData = getDfState(state)
  if (!dfData) return state

  // Validate the target is a Dragon Hoard tile on the board
  const tileKey = coordKey(coord)
  const tile = state.board.tiles[tileKey]
  if (!tile) return state
  const def = state.staticTileMap[tile.definitionId]
  if (!def?.isDragonHoard) return state

  const updatedDf: DragonFairyState = {
    ...dfData,
    dragonPosition: coord,
    dragonFacing: null,  // Player must orient
    dragonHeldBy: null,  // Dragon is no longer held
    dragonInPlay: true,
  }

  return {
    ...state,
    turnPhase: 'DRAGON_ORIENT',
    expansionData: { ...state.expansionData, dragonFairy: updatedDf },
  }
}

/**
 * Execute a SINGLE TILE step of the dragon's movement.
 * Used for animating the path tile-by-tile.
 * Returns null if the dragon cannot move forward (hit edge or fairy).
 */
export function executeDragonTileStep(state: GameState): { state: GameState; eatenMeeples: { playerId: string; meepleType: MeepleType; segmentId: string; coordinate: Coordinate }[] } | null {
  const dfData = getDfState(state)
  if (!dfData?.dragonPosition || !dfData.dragonMovement || !dfData.dragonFacing) return null

  const { dx, dy } = DIRECTION_DELTAS[dfData.dragonFacing]
  const nextX = dfData.dragonPosition.x + dx
  const nextY = dfData.dragonPosition.y + dy
  const nextKey = coordKey({ x: nextX, y: nextY })
  const nextTile = state.board.tiles[nextKey]

  if (!nextTile) return null // Edge of board

  // Fairy contact
  if (dfData.fairyPosition && coordKey(dfData.fairyPosition.coordinate) === nextKey) {
    // Handle fairy contact: remove dragon from board
    let dragonHeldBy: string | null = dfData.dragonHeldBy
    const fairyKey = `${coordKey(dfData.fairyPosition.coordinate)}:${dfData.fairyPosition.segmentId}`
    const fairyMeeple = state.boardMeeples[fairyKey]
    if (fairyMeeple) dragonHeldBy = fairyMeeple.playerId

    const updatedDf: DragonFairyState = {
      ...dfData,
      dragonPosition: null,
      dragonFacing: null,
      dragonHeldBy,
      dragonMovement: null, // Stop movement sequence
    }
    return {
      state: {
        ...state,
        turnPhase: dfData.dragonMovement.nextPhase,
        expansionData: { ...state.expansionData, dragonFairy: updatedDf }
      },
      eatenMeeples: []
    }
  }

  // Move to next tile and eat meeples
  const result = eatMeeplesOnTile(
    { x: nextX, y: nextY },
    [...state.players],
    { ...state.boardMeeples },
    { ...state.featureUnionFind },
    { ...state.board.tiles },
  )

  const updatedDf: DragonFairyState = {
    ...dfData,
    dragonPosition: { x: nextX, y: nextY },
  }

  return {
    state: {
      ...state,
      board: { ...state.board, tiles: result.boardTiles },
      players: result.players,
      boardMeeples: result.boardMeeples,
      featureUnionFind: result.ufState,
      expansionData: { ...state.expansionData, dragonFairy: updatedDf },
    },
    eatenMeeples: result.eatenMeeples.map(m => ({ ...m, coordinate: { x: nextX, y: nextY } }))
  }
}

/**
 * Perform reorientation logic after a straight-line movement step is finished.
 */
export function finishDragonMovementStep(state: GameState): GameState {
  const dfData = getDfState(state)
  if (!dfData || !dfData.dragonMovement) return state

  const remaining = dfData.dragonMovement.movesRemaining - 1
  const dragonRemoved = dfData.dragonPosition === null

  const baseNextDf: DragonFairyState = {
    ...dfData,
    dragonMovement: dragonRemoved || remaining <= 0 ? null : { ...dfData.dragonMovement, movesRemaining: remaining },
  }

  const nextState: GameState = {
    ...state,
    expansionData: { ...state.expansionData, dragonFairy: baseNextDf },
  }

  if (dragonRemoved || (remaining <= 0)) {
    // Movement sequence finished
    const opts = dragonRemoved ? [] : getValidDragonOrientations(nextState)
    if (opts.length > 1) {
      return { ...nextState, turnPhase: 'DRAGON_ORIENT' }
    } else {
      const finalDf = { ...baseNextDf, dragonFacing: opts.length === 1 ? opts[0] : baseNextDf.dragonFacing }
      return {
        ...nextState,
        turnPhase: dfData.dragonMovement.nextPhase,
        expansionData: { ...nextState.expansionData, dragonFairy: finalDf }
      }
    }
  } else {
    // Intermediate step: Check orientations for next move
    const opts = getValidDragonOrientations(nextState)
    if (opts.length > 1) {
      return { ...nextState, turnPhase: 'DRAGON_ORIENT' }
    } else {
      const finalDf = { ...baseNextDf, dragonFacing: opts.length === 1 ? opts[0] : baseNextDf.dragonFacing }
      return {
        ...nextState,
        turnPhase: 'DRAGON_MOVEMENT',
        expansionData: { ...nextState.expansionData, dragonFairy: finalDf }
      }
    }
  }
}

/**
 * Execute ONE straight-line step of the dragon's movement (C3.1 rules).
 * Moves straight in current facing until no more tiles or fairy hit.
 * Eats all meeples on tiles entered.
 * Then checks if further moves or reorientation is needed.
 */
export function executeDragonMovement(state: GameState): GameState {
  const dfData = getDfState(state)
  if (!dfData?.dragonPosition || !dfData.dragonMovement) {
    return { ...state, turnPhase: 'PLACE_TILE' }
  }

  let current = { ...state }
  let dragonPos = { ...dfData.dragonPosition }
  let dragonFacing = dfData.dragonFacing
  let updatedPlayers = [...state.players]
  let updatedBoardMeeples = { ...state.boardMeeples }
  let updatedUfState = { ...state.featureUnionFind }
  let updatedBoardTiles = { ...state.board.tiles }
  let dragonRemoved = false

  // If dragon has no facing, pick a default or fallback
  if (!dragonFacing) {
    const adjacent = getValidDragonOrientations(state)
    dragonFacing = adjacent.length > 0 ? adjacent[0] : 'NORTH'
  }

  // 1. Move straight forward tile by tile until no more tiles or fairy hit
  const { dx, dy } = DIRECTION_DELTAS[dragonFacing]
  let x = dragonPos.x + dx
  let y = dragonPos.y + dy

  while (true) {
    const nextKey = coordKey({ x, y })
    const nextTile = updatedBoardTiles[nextKey]
    if (!nextTile) break

    // Fairy contact
    if (dfData.fairyPosition && coordKey(dfData.fairyPosition.coordinate) === nextKey) {
      dragonRemoved = true
      break
    }

    // Enter tile and eat meeples
    dragonPos = { x, y }
    const result = eatMeeplesOnTile(
      dragonPos, updatedPlayers, updatedBoardMeeples, updatedUfState, updatedBoardTiles,
    )
    updatedPlayers = result.players
    updatedBoardMeeples = result.boardMeeples
    updatedUfState = result.ufState
    updatedBoardTiles = result.boardTiles

    x += dx
    y += dy
  }

  // 2. Post-movement logic
  const remaining = dfData.dragonMovement.movesRemaining - 1
  const finalBoard = { ...current.board, tiles: updatedBoardTiles }

  // Fairy hit logic
  let dragonHeldBy: string | null = dfData.dragonHeldBy ?? null
  if (dragonRemoved && dfData.fairyPosition) {
    const fairyKey = `${coordKey(dfData.fairyPosition.coordinate)}:${dfData.fairyPosition.segmentId}`
    const fairyMeeple = updatedBoardMeeples[fairyKey] ?? current.boardMeeples[fairyKey]
    if (fairyMeeple) dragonHeldBy = fairyMeeple.playerId
  }

  const baseNextDf: DragonFairyState = {
    ...dfData,
    dragonPosition: dragonRemoved ? null : dragonPos,
    dragonFacing: dragonRemoved ? null : dragonFacing,
    dragonHeldBy,
    dragonMovement: dragonRemoved || remaining <= 0 ? null : { ...dfData.dragonMovement, movesRemaining: remaining },
  }

  const nextState: GameState = {
    ...current,
    board: finalBoard,
    players: updatedPlayers,
    boardMeeples: updatedBoardMeeples,
    featureUnionFind: updatedUfState,
    expansionData: { ...current.expansionData, dragonFairy: baseNextDf },
  }

  if (dragonRemoved || (remaining <= 0)) {
    // Movement sequence finished
    // Check if player needs to choose final orientation
    const opts = dragonRemoved ? [] : getValidDragonOrientations(nextState)
    if (opts.length > 1) {
      return { ...nextState, turnPhase: 'DRAGON_ORIENT' }
    } else {
      const finalDf = { ...baseNextDf, dragonFacing: opts.length === 1 ? opts[0] : baseNextDf.dragonFacing }
      return {
        ...nextState,
        turnPhase: dfData.dragonMovement.nextPhase,
        expansionData: { ...nextState.expansionData, dragonFairy: finalDf }
      }
    }
  } else {
    // Intermediate step: Check orientations for next move
    const opts = getValidDragonOrientations(nextState)
    if (opts.length > 1) {
      return { ...nextState, turnPhase: 'DRAGON_ORIENT' }
    } else {
      // Automatic reorientation and stay in DRAGON_MOVEMENT to allow user to trigger next step
      const finalDf = { ...baseNextDf, dragonFacing: opts.length === 1 ? opts[0] : baseNextDf.dragonFacing }
      return {
        ...nextState,
        turnPhase: 'DRAGON_MOVEMENT',
        expansionData: { ...nextState.expansionData, dragonFairy: finalDf }
      }
    }
  }
}

/**
 * Remove all meeples from a tile (dragon eating them).
 * Returns meeples to owners' supplies without scoring.
 */
function eatMeeplesOnTile(
  coord: Coordinate,
  players: Player[],
  boardMeeples: Record<string, import('../types/board.ts').MeeplePlacement>,
  ufState: import('../types/feature.ts').UnionFindState,
  boardTiles: Record<string, import('../types/board.ts').PlacedTile>,
): {
  players: Player[]
  boardMeeples: typeof boardMeeples
  ufState: typeof ufState
  boardTiles: typeof boardTiles
  eatenMeeples: { playerId: string; meepleType: MeepleType; segmentId: string; coordinate: Coordinate }[]
} {
  const tileKey = coordKey(coord)
  const tile = boardTiles[tileKey]
  const eatenMeeples: { playerId: string; meepleType: MeepleType; segmentId: string; coordinate: Coordinate }[] = []
  if (!tile || Object.keys(tile.meeples).length === 0) {
    return { players, boardMeeples, ufState, boardTiles, eatenMeeples }
  }

  let updatedPlayers = [...players]
  let updatedBoardMeeples = { ...boardMeeples }
  let updatedUfState = { ...ufState, featureData: { ...ufState.featureData } }
  let updatedBoardTiles = { ...boardTiles }

  const affectedFeatureIds = new Set<string>()
  const affectedPlayerIds = new Set<string>()

  // 1. Eat the meeples physically on the tile
  for (const [segmentId, meeple] of Object.entries(tile.meeples)) {
    const nKey = `${tileKey}:${segmentId}`
    eatenMeeples.push({ playerId: meeple.playerId, meepleType: meeple.meepleType as MeepleType, segmentId, coordinate: coord })

    affectedPlayerIds.add(meeple.playerId)
    const root = findRoot(updatedUfState, nKey)
    affectedFeatureIds.add(root)

    // Remove from player's onBoard list
    updatedPlayers = updatedPlayers.map(p =>
      p.id === meeple.playerId
        ? {
          ...p,
          meeples: {
            ...p.meeples,
            available: {
              ...p.meeples.available,
              [meeple.meepleType]: p.meeples.available[meeple.meepleType as MeepleType] + 1,
            },
            onBoard: p.meeples.onBoard.filter(k => k !== nKey),
          },
        }
        : p,
    )

    // Remove from board meeples
    delete updatedBoardMeeples[nKey]

    // Remove from union-find feature
    const feature = updatedUfState.featureData[root]
    if (feature) {
      updatedUfState = updateFeatureMeeples(
        updatedUfState, root,
        feature.meeples.filter(m =>
          !(coordKey(m.coordinate) === tileKey && m.segmentId === segmentId)
        ),
      )
    }
  }

  // 2. Clear meeples from the specific tile in the board record
  updatedBoardTiles[tileKey] = { ...tile, meeples: {} }

  // 3. Check for orphaned Builders/Pigs on affected features
  for (const featureId of affectedFeatureIds) {
    const feature = updatedUfState.featureData[featureId]
    if (!feature) continue

    for (const playerId of affectedPlayerIds) {
      // Check if this player still has any regular meeples on this feature
      const hasRegularMeeple = feature.meeples.some(m =>
        m.playerId === playerId && (m.meepleType === 'NORMAL' || m.meepleType === 'BIG')
      )

      if (!hasRegularMeeple) {
        // Player has no regular meeples left on this feature -> remove their Builder/Pig too
        const specialMeeples = feature.meeples.filter(m =>
          m.playerId === playerId && (m.meepleType === 'BUILDER' || m.meepleType === 'PIG')
        )

        for (const special of specialMeeples) {
          const sTileKey = coordKey(special.coordinate)
          const sNodeKey = `${sTileKey}:${special.segmentId}`

          eatenMeeples.push({
            playerId: special.playerId,
            meepleType: special.meepleType as MeepleType,
            segmentId: special.segmentId,
            coordinate: special.coordinate
          })

          // Return special meeple to owner
          updatedPlayers = updatedPlayers.map(p =>
            p.id === playerId
              ? {
                ...p,
                meeples: {
                  ...p.meeples,
                  available: {
                    ...p.meeples.available,
                    [special.meepleType]: p.meeples.available[special.meepleType as MeepleType] + 1,
                  },
                  onBoard: p.meeples.onBoard.filter(k => k !== sNodeKey),
                },
              }
              : p,
          )

          // Remove from board records
          delete updatedBoardMeeples[sNodeKey]
          const sTile = updatedBoardTiles[sTileKey]
          if (sTile) {
            const { [special.segmentId]: _removed, ...remMeeples } = sTile.meeples
            updatedBoardTiles[sTileKey] = { ...sTile, meeples: remMeeples }
          }
        }

        // Clean up union-find feature
        updatedUfState = updateFeatureMeeples(
          updatedUfState, featureId,
          feature.meeples.filter(m =>
            !(m.playerId === playerId && (m.meepleType === 'BUILDER' || m.meepleType === 'PIG'))
          )
        )
      }
    }
  }

  return {
    players: updatedPlayers,
    boardMeeples: updatedBoardMeeples,
    ufState: updatedUfState,
    boardTiles: updatedBoardTiles,
    eatenMeeples,
  }
}

/**
 * Move fairy to a tile with one of the current player's meeples.
 */
export function moveFairy(state: GameState, coord: Coordinate, segmentId: string): GameState {
  if (state.turnPhase !== 'FAIRY_MOVE') return state

  const dfData = getDfState(state)
  if (!dfData) return state

  const player = state.players[state.currentPlayerIndex]
  const nKey = `${coordKey(coord)}:${segmentId}`
  const meeple = state.boardMeeples[nKey]

  // Must be the current player's meeple
  if (!meeple || meeple.playerId !== player.id) return state

  const updatedDf: DragonFairyState = {
    ...dfData,
    fairyPosition: { coordinate: coord, segmentId },
    canMoveFairy: false,
  }

  // After fairy move, reorient dragon if needed (meeple didn't change but fairy moved)
  let dragonFacing = updatedDf.dragonFacing
  if (updatedDf.dragonPosition) {
    dragonFacing = findNearestMeepleDirection(
      state.board, state.boardMeeples, updatedDf.dragonPosition, updatedDf.fairyPosition,
    ) ?? dragonFacing
  }

  return {
    ...state,
    turnPhase: 'SCORE',
    expansionData: {
      ...state.expansionData,
      dragonFairy: { ...updatedDf, dragonFacing },
    },
  }
}

/**
 * Skip fairy movement.
 */
export function skipFairyMove(state: GameState): GameState {
  if (state.turnPhase !== 'FAIRY_MOVE') return state

  const dfData = getDfState(state)
  if (!dfData) return { ...state, turnPhase: 'SCORE' }

  return {
    ...state,
    turnPhase: 'SCORE',
    expansionData: {
      ...state.expansionData,
      dragonFairy: { ...dfData, canMoveFairy: false },
    },
  }
}

/**
 * Transition from PLACE_MEEPLE to FAIRY_MOVE.
 */
export function prepareFairyMove(state: GameState): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state
  return { ...state, turnPhase: 'FAIRY_MOVE' }
}

/**
 * Get all board positions where the current player has a meeple (for fairy placement targets).
 */
export function getFairyMoveTargets(state: GameState): { coordinate: Coordinate; segmentId: string }[] {
  const dfData = getDfState(state)
  if (!dfData) return []

  const player = state.players[state.currentPlayerIndex]
  const targets: { coordinate: Coordinate; segmentId: string }[] = []

  for (const [nKey, meeple] of Object.entries(state.boardMeeples)) {
    if (meeple.playerId === player.id) {
      const [coordStr, segmentId] = nKey.split(':') as [string, string]
      targets.push({ coordinate: keyToCoord(coordStr), segmentId })
    }
  }

  return targets
}

/**
 * Get all segments on the board where a meeple can be placed via magic portal.
 * Returns segments from ALL tiles (not just last-placed) that are in unoccupied, incomplete features.
 */
export function getMagicPortalPlacements(state: GameState): { coordinate: Coordinate; segmentId: string }[] {
  const player = state.players[state.currentPlayerIndex]
  const results: { coordinate: Coordinate; segmentId: string }[] = []
  const dfData = getDfState(state)
  const dragonPos = dfData?.dragonPosition

  for (const [tileKey, tile] of Object.entries(state.board.tiles)) {
    const def = state.staticTileMap[tile.definitionId]
    if (!def) continue

    const coord = keyToCoord(tileKey)

    // Cannot place on tile occupied by the dragon
    if (dragonPos && coord.x === dragonPos.x && coord.y === dragonPos.y) {
      continue
    }

    for (const seg of def.segments) {
      const nKey = nodeKey(coord, seg.id)
      const feature = getFeature(state.featureUnionFind, nKey)
      if (!feature) continue
      if (feature.isComplete) continue  // Can't place on completed features
      if (feature.meeples.length > 0) continue  // Feature already occupied

      // Check player has meeples available
      if (player.meeples.available.NORMAL <= 0 && (player.meeples.available.BIG ?? 0) <= 0) continue

      results.push({ coordinate: coord, segmentId: seg.id })
    }
  }

  return results
}

/**
 * Place a meeple via magic portal on any qualifying tile on the board.
 */
export function placeMeepleViaPortal(
  state: GameState,
  coord: Coordinate,
  segmentId: string,
  meepleType: MeepleType = 'NORMAL',
): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state

  const player = state.players[state.currentPlayerIndex]
  const dfData = getDfState(state)
  const dragonPos = dfData?.dragonPosition

  // Cannot place on tile occupied by the dragon
  if (dragonPos && coord.x === dragonPos.x && coord.y === dragonPos.y) {
    return state
  }

  const nKey = nodeKey(coord, segmentId)

  // Validate: feature must be unoccupied and incomplete
  const feature = getFeature(state.featureUnionFind, nKey)
  if (!feature || feature.isComplete || feature.meeples.length > 0) return state

  // Validate: player has meeples available
  if (player.meeples.available[meepleType] <= 0) return state

  const meepleData = createMeeplePlacement(player.id, meepleType, segmentId)

  // Update the board tile's meeples record
  const tileKey = coordKey(coord)
  const existingTile = state.board.tiles[tileKey]
  if (!existingTile) return state

  const updatedTile = {
    ...existingTile,
    meeples: { ...existingTile.meeples, [segmentId]: meepleData },
  }

  // Update the union-find feature's meeples list
  const updatedMeeples = [...feature.meeples, meepleData]
  const newUfState = updateFeatureMeeples(state.featureUnionFind, nKey, updatedMeeples)

  // Deduct meeple from player
  const updatedPlayers = state.players.map(p =>
    p.id === player.id
      ? {
        ...p,
        meeples: {
          ...p.meeples,
          available: {
            ...p.meeples.available,
            [meepleType]: p.meeples.available[meepleType] - 1,
          },
          onBoard: [...p.meeples.onBoard, nKey],
        },
      }
      : p,
  )

  // Reorient dragon if meeple not in straight line
  let dfUpdate: Partial<DragonFairyState> = {}
  if (dfData?.dragonPosition) {
    const dragonCoord = dfData.dragonPosition
    const isInStraightLine = coord.x === dragonCoord.x || coord.y === dragonCoord.y
    if (!isInStraightLine) {
      const newFacing = findNearestMeepleDirection(
        state.board, { ...state.boardMeeples, [nKey]: meepleData },
        dragonCoord, dfData.fairyPosition,
      )
      if (newFacing) dfUpdate = { dragonFacing: newFacing }
    }
  }

  return {
    ...state,
    board: {
      ...state.board,
      tiles: { ...state.board.tiles, [tileKey]: updatedTile },
    },
    featureUnionFind: newUfState,
    players: updatedPlayers,
    boardMeeples: { ...state.boardMeeples, [nKey]: meepleData },
    turnPhase: 'SCORE',
    expansionData: dfData ? {
      ...state.expansionData,
      dragonFairy: { ...dfData, ...dfUpdate },
    } : state.expansionData,
  }
}

/**
 * Check if the current tile is a magic portal tile.
 */
export function isMagicPortalTile(state: GameState): boolean {
  if (!state.currentTile) return false
  const def = state.staticTileMap[state.currentTile.definitionId]
  return def?.hasMagicPortal ?? false
}

/**
 * Check if the current tile is a Dragon Hoard tile (no meeple placement).
 */
export function isDragonHoardTile(state: GameState): boolean {
  if (!state.currentTile) return false
  const def = state.staticTileMap[state.currentTile.definitionId]
  return def?.isDragonHoard ?? false
}

/**
 * Reorient dragon after a meeple is placed (if not in straight line from dragon).
 */
export function maybeReorientDragon(state: GameState, meepleCoord: Coordinate): GameState {
  const dfData = getDfState(state)
  if (!dfData?.dragonPosition) return state

  const dragonCoord = dfData.dragonPosition
  const isInStraightLine = meepleCoord.x === dragonCoord.x || meepleCoord.y === dragonCoord.y
  if (isInStraightLine) return state  // No reorientation

  const newFacing = findNearestMeepleDirection(
    state.board, state.boardMeeples, dragonCoord, dfData.fairyPosition,
  )
  if (!newFacing || newFacing === dfData.dragonFacing) return state

  return {
    ...state,
    expansionData: {
      ...state.expansionData,
      dragonFairy: { ...dfData, dragonFacing: newFacing },
    },
  }
}

export function getValidMeepleTypes(state: GameState): MeepleType[] {
  if (state.turnPhase !== 'PLACE_MEEPLE' || !state.currentTile) return []

  const lastCoord = state.lastPlacedCoord ?? findLastPlacedCoord(state)
  if (!lastCoord) return []

  const player = state.players[state.currentPlayerIndex]
  const validTypes: MeepleType[] = []
  const dfData = getDfState(state)
  const dragonPos = dfData?.dragonPosition

  // Cannot place anything if dragon is on this tile
  if (dragonPos && lastCoord.x === dragonPos.x && lastCoord.y === dragonPos.y) {
    return []
  }

  // Get all segments from the tile definition
  const def = state.staticTileMap[state.currentTile.definitionId]
  if (!def) return []

  // Distinct segment IDs on this tile
  const segments = Array.from(new Set(def.segments.map(n => n.id)))

  // Check NORMAL
  if (player.meeples.available.NORMAL > 0) {
    const canPlace = segments.some(segId => canPlaceMeeple(state.featureUnionFind, player, lastCoord, segId, 'NORMAL', dragonPos))
    if (canPlace) validTypes.push('NORMAL')
  }

  // Check BIG
  if ((player.meeples.available.BIG ?? 0) > 0) {
    const canPlace = segments.some(segId => canPlaceMeeple(state.featureUnionFind, player, lastCoord, segId, 'BIG', dragonPos))
    if (canPlace) validTypes.push('BIG')
  }

  // Check BUILDER
  if ((player.meeples.available.BUILDER ?? 0) > 0) {
    const canPlace = segments.some(segId => canPlaceBuilderOrPig(state.featureUnionFind, player, lastCoord, segId, 'BUILDER', dragonPos))
    if (canPlace) validTypes.push('BUILDER')
  }

  // Check PIG
  if ((player.meeples.available.PIG ?? 0) > 0) {
    const canPlace = segments.some(segId => canPlaceBuilderOrPig(state.featureUnionFind, player, lastCoord, segId, 'PIG', dragonPos))
    if (canPlace) validTypes.push('PIG')
  }

  return validTypes
}
