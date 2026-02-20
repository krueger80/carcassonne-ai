/**
 * GameEngine: Pure orchestrator for Carcassonne game logic.
 *
 * All public methods take a GameState and return a new GameState (immutable).
 * No side effects, no UI dependencies — fully unit-testable.
 */

import type { GameState } from '../types/game.ts'
import type { Coordinate } from '../types/board.ts'
import type { TileDefinition, Rotation } from '../types/tile.ts'
import type { Player, MeepleType } from '../types/player.ts'
import { coordKey, emptyBoard } from '../types/board.ts'
import { emptyUnionFindState } from '../types/feature.ts'
import { createPlayer, PLAYER_COLORS } from '../types/player.ts'
import { getFallbackBaseTiles } from '../../services/tileRegistry.ts'
import { getExpansionConfig } from '../expansions/registry.ts'
import { buildCombinedIcTbRules } from '../expansions/tradersBuilders.ts'
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
  const hasIc = expansions.includes('inns-cathedrals')
  const hasTb = expansions.includes('traders-builders')
  const enableBigMeeple = hasIc || hasTb
  const enableBuilderAndPig = hasTb

  // Filter extra tiles to only include tiles from enabled expansions
  let allExtraTiles = extraTileDefinitions.filter(
    t => !t.expansionId || expansions.includes(t.expansionId)
  )
  let activeRules = scoringRules

  if (hasIc) {
    const ic = getExpansionConfig('inns-cathedrals')
    if (ic) {
      // Only add hardcoded IC tiles if none were provided via extraTileDefinitions (DB)
      const hasDbIcTiles = allExtraTiles.some(t => t.expansionId === 'inns-cathedrals')
      if (!hasDbIcTiles) {
        allExtraTiles = [...allExtraTiles, ...ic.tiles]
      }
      activeRules = ic.scoringRules
    }
  }

  if (hasTb) {
    const tb = getExpansionConfig('traders-builders')
    if (tb) {
      const hasDbTbTiles = allExtraTiles.some(t => t.expansionId === 'traders-builders')
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
  // (simplified: in real Carcassonne you can look for a valid tile)
  if (!hasAnyValidPlacement(state.board, state.staticTileMap, result.tile)) {
    // Discard this tile and try the next
    return drawTile({ ...state, tileBag: result.remaining })
  }

  return {
    ...state,
    tileBag: result.remaining,
    currentTile: result.tile,
    turnPhase: 'PLACE_TILE',
    lastScoreEvents: [],
  }
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

  return {
    ...state,
    board: newBoard,
    currentTile: state.currentTile,  // keep for reference
    lastPlacedCoord: coord,
    completedFeatureIds,
    featureUnionFind: newUfState,
    lastScoreEvents: [],
    turnPhase: 'PLACE_MEEPLE',
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
  // We need to find which tile was just placed. The board was just updated.
  // We track this via the fact that the currentTile is still set.
  // Find the tile on the board that matches currentTile.definitionId and was just placed.
  // Since multiple copies of the same tile can be on the board, we need another approach.
  const lastCoord = state.lastPlacedCoord ?? findLastPlacedCoord(state)
  if (!lastCoord) return state

  const player = state.players[state.currentPlayerIndex]

  if (!canPlaceMeeple(state.featureUnionFind, player, lastCoord, segmentId, meepleType)) {
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

  if (!canPlaceBuilderOrPig(state.featureUnionFind, player, coord, segmentId, meepleType)) {
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
  const hasIc = expansions.includes('inns-cathedrals')
  const hasTb = expansions.includes('traders-builders')

  if (hasIc) {
    const ic = getExpansionConfig('inns-cathedrals')
    if (ic) activeRules = ic.scoringRules
  }

  if (hasTb) {
    const tb = getExpansionConfig('traders-builders')
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

export function endTurn(state: GameState): GameState {
  if (state.turnPhase !== 'SCORE') return state

  // Score completed features NOW (after meeple placement), then return meeples.
  // Scoring here instead of in placeTile means any meeple placed on a just-completed
  // feature is correctly included in the scoring.
  // We resolve rules from expansions (robust against rehydration loss)
  const rules = resolveScoringRules(state.expansionData.expansions as string[] ?? [])

  const scoreEvents = scoreCompletedFeatures(
    state.completedFeatureIds,
    state.featureUnionFind,
    state.players,
    rules,
  )

  let updatedPlayers = [...state.players]
  let updatedBoardMeeples = { ...state.boardMeeples }
  let updatedUfState = { ...state.featureUnionFind }
  let updatedBoardTiles = { ...state.board.tiles }

  for (const event of scoreEvents) {
    updatedPlayers = applyScoreEvents(updatedPlayers, [event])

    // Return meeples from the completed feature
    const feature = state.featureUnionFind.featureData[event.featureId]
    if (!feature) continue

    // Build a set of all node keys belonging to this feature so we can find
    // the exact node where each meeple was placed (feature.nodes[0] is not
    // reliable for multi-tile features).
    const featureNodeKeys = new Set(
      feature.nodes.map(n => nodeKey(n.coordinate, n.segmentId))
    )

    for (const meeple of feature.meeples) {
      // Find the exact key stored in the player's onBoard list that belongs
      // to this feature — this is the coordinate-qualified node key.
      const owner = updatedPlayers.find(p => p.id === meeple.playerId)
      const nKey = owner?.meeples.onBoard.find(k => featureNodeKeys.has(k))
      if (!nKey) continue

      delete updatedBoardMeeples[nKey]

      // Remove the meeple from board.tiles so the SVG clears visually.
      // nKey format is "x,y:segmentId"
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

    // Clear meeples from completed feature in union-find
    updatedUfState = updateFeatureMeeples(updatedUfState, event.featureId, [])
  }

  // ── Commodity token distribution (T&B) ──────────────────────────────────
  const tbData = state.expansionData['tradersBuilders'] as
    { isBuilderBonusTurn: boolean; pendingBuilderBonus: boolean } | undefined

  if (tbData) {
    for (const featureId of state.completedFeatureIds) {
      const feature = state.featureUnionFind.featureData[featureId]
      if (!feature || feature.type !== 'CITY') continue

      const tokenDist = distributeCommodityTokens(feature)
      updatedPlayers = updatedPlayers.map(p => {
        const tokens = tokenDist[p.id]
        if (!tokens) return p
        return {
          ...p,
          traderTokens: {
            CLOTH: p.traderTokens.CLOTH + tokens.CLOTH,
            WHEAT: p.traderTokens.WHEAT + tokens.WHEAT,
            WINE: p.traderTokens.WINE + tokens.WINE,
          },
        }
      })
    }
  }

  // ── Builder bonus turn logic ────────────────────────────────────────────
  const pendingBonus = tbData?.pendingBuilderBonus ?? false
  const isAlreadyBonusTurn = tbData?.isBuilderBonusTurn ?? false

  let nextPlayerIndex: number
  let nextTbData: typeof tbData

  if (pendingBonus && !isAlreadyBonusTurn) {
    // Grant bonus turn: same player, mark it as the bonus turn
    nextPlayerIndex = state.currentPlayerIndex
    nextTbData = { isBuilderBonusTurn: true, pendingBuilderBonus: false }
  } else {
    // Normal advance (covers regular turns and the bonus turn itself)
    nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length
    nextTbData = tbData ? { isBuilderBonusTurn: false, pendingBuilderBonus: false } : undefined
  }

  return {
    ...state,
    board: { ...state.board, tiles: updatedBoardTiles },
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    featureUnionFind: updatedUfState,
    boardMeeples: updatedBoardMeeples,
    currentTile: null,
    lastPlacedCoord: null,
    completedFeatureIds: [],
    lastScoreEvents: scoreEvents,
    turnPhase: 'DRAW_TILE',
    expansionData: {
      ...state.expansionData,
      ...(tbData !== undefined ? { tradersBuilders: nextTbData } : {}),
    },
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
  return getPlaceableSegments(state.featureUnionFind, state.staticTileMap, state.board, lastCoord, player)
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

export function getValidMeepleTypes(state: GameState): MeepleType[] {
  if (state.turnPhase !== 'PLACE_MEEPLE' || !state.currentTile) return []

  const lastCoord = state.lastPlacedCoord ?? findLastPlacedCoord(state)
  if (!lastCoord) return []

  const player = state.players[state.currentPlayerIndex]
  const validTypes: MeepleType[] = []

  // Get all segments from the tile definition
  const def = state.staticTileMap[state.currentTile.definitionId]
  if (!def) return []

  // Distinct segment IDs on this tile
  const segments = Array.from(new Set(def.segments.map(n => n.id)))

  // Check NORMAL
  if (player.meeples.available.NORMAL > 0) {
    const canPlace = segments.some(segId => canPlaceMeeple(state.featureUnionFind, player, lastCoord, segId, 'NORMAL'))
    if (canPlace) validTypes.push('NORMAL')
  }

  // Check BIG
  if ((player.meeples.available.BIG ?? 0) > 0) {
    const canPlace = segments.some(segId => canPlaceMeeple(state.featureUnionFind, player, lastCoord, segId, 'BIG'))
    if (canPlace) validTypes.push('BIG')
  }

  // Check BUILDER
  if ((player.meeples.available.BUILDER ?? 0) > 0) {
    const canPlace = segments.some(segId => canPlaceBuilderOrPig(state.featureUnionFind, player, lastCoord, segId, 'BUILDER'))
    if (canPlace) validTypes.push('BUILDER')
  }

  // Check PIG
  if ((player.meeples.available.PIG ?? 0) > 0) {
    const canPlace = segments.some(segId => canPlaceBuilderOrPig(state.featureUnionFind, player, lastCoord, segId, 'PIG'))
    if (canPlace) validTypes.push('PIG')
  }

  return validTypes
}
