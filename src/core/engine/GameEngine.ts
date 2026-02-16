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
import { BASE_TILES, TILE_MAP, registerTiles } from '../data/baseTiles.ts'
export { TILE_MAP } // Re-export for GameStore
import { getExpansionConfig } from '../expansions/registry.ts'
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

import { addTileToUnionFind, updateFeatureMeeples } from './FeatureDetector.ts'
import { canPlaceMeeple, getPlaceableSegments, createMeeplePlacement } from './MeeplePlacement.ts'
import {
  scoreCompletedFeatures,
  scoreAllRemainingFeatures,
  applyScoreEvents,
  BASE_SCORING_RULES,
  type ScoringRule,
} from './ScoreCalculator.ts'
import { nodeKey } from '../types/feature.ts'

// ─── Initialization ───────────────────────────────────────────────────────────

export interface GameConfig {
  playerNames: string[]
  extraTileDefinitions?: TileDefinition[]
  scoringRules?: ScoringRule[]
  expansions?: string[]
}

export function initGame(config: GameConfig): GameState {
  const {
    playerNames,
    extraTileDefinitions = [],
    scoringRules = BASE_SCORING_RULES,
    expansions = [],
  } = config

  if (playerNames.length < 2 || playerNames.length > 6) {
    throw new Error('Carcassonne supports 2–6 players')
  }

  // Resolve expansion configs
  const enableBigMeeple = expansions.includes('inns-cathedrals')
  let allExtraTiles = [...extraTileDefinitions]
  let activeRules = scoringRules

  if (expansions.includes('inns-cathedrals')) {
    // Lazy import avoided — use the expansion registry
    const ic = getExpansionConfig('inns-cathedrals')
    if (ic) {
      allExtraTiles = [...allExtraTiles, ...ic.tiles]
      activeRules = ic.scoringRules
      registerTiles(ic.tiles)
    }
  }

  const players: Player[] = playerNames.map((name, i) =>
    createPlayer(`player_${i}`, name, PLAYER_COLORS[i], enableBigMeeple)
  )

  const allDefs = [...BASE_TILES, ...allExtraTiles]
  const { bag, startingTile } = createTileBag(allDefs)

  // Place the starting tile at (0,0)
  const board = emptyBoard()
  board.tiles['0,0'] = {
    coordinate: { x: 0, y: 0 },
    definitionId: startingTile.definitionId,
    rotation: startingTile.rotation,
    meeples: {},
  }

  // Initialize union-find with the starting tile's segments
  const ufState = emptyUnionFindState()
  const { state: initialUfState } = addTileToUnionFind(ufState, board, TILE_MAP, board.tiles['0,0'])

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
    },
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
  if (!hasAnyValidPlacement(state.board, TILE_MAP, result.tile)) {
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

  if (!isValidPlacement(state.board, TILE_MAP, state.currentTile, coord)) {
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
    TILE_MAP,
    placedTile,
  )

  return {
    ...state,
    board: newBoard,
    currentTile: state.currentTile,  // keep for reference
    lastPlacedCoord: coord,
    completedFeatureIds,
    featureUnionFind: newUfState,
    lastScoreEvents: [],
    turnPhase: 'PLACE_MEEPLE',
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

export function skipMeeple(state: GameState): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state
  return { ...state, turnPhase: 'SCORE' }
}

export function endTurn(state: GameState): GameState {
  if (state.turnPhase !== 'SCORE') return state

  // Score completed features NOW (after meeple placement), then return meeples.
  // Scoring here instead of in placeTile means any meeple placed on a just-completed
  // feature is correctly included in the scoring.
  const rules = (state.expansionData.scoringRules as ScoringRule[] | undefined) ?? BASE_SCORING_RULES
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

  // Advance to next player
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length

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
  }
}

// ─── End game ─────────────────────────────────────────────────────────────────

export function endGame(state: GameState): GameState {
  const completedFeatureIds = new Set(
    Object.keys(state.featureUnionFind.featureData).filter(
      k => state.featureUnionFind.featureData[k]?.isComplete
    )
  )

  const rules = (state.expansionData.scoringRules as ScoringRule[] | undefined) ?? BASE_SCORING_RULES
  const endGameEvents = scoreAllRemainingFeatures(
    state.featureUnionFind,
    completedFeatureIds,
    state.players,
    rules,
  )

  const finalPlayers = applyScoreEvents(state.players, endGameEvents)

  return {
    ...state,
    phase: 'END',
    turnPhase: 'NEXT_PLAYER',
    players: finalPlayers,
    lastScoreEvents: endGameEvents,
  }
}

// ─── Query functions ──────────────────────────────────────────────────────────

export function getValidPlacements(state: GameState): Coordinate[] {
  if (!state.currentTile || state.turnPhase !== 'PLACE_TILE') return []
  return getValidPositions(state.board, TILE_MAP, state.currentTile)
}

export function getValidTileRotations(state: GameState, coord: Coordinate): Rotation[] {
  if (!state.currentTile) return []
  return getValidRotations(state.board, TILE_MAP, state.currentTile, coord)
}

export function getAvailableSegmentsForMeeple(state: GameState): string[] {
  const lastCoord = state.lastPlacedCoord ?? findLastPlacedCoord(state)
  if (!lastCoord) return []

  const player = state.players[state.currentPlayerIndex]
  return getPlaceableSegments(state.featureUnionFind, TILE_MAP, state.board, lastCoord, player)
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Find the coordinate of the tile placed this turn.
 * Heuristic: find the tile on the board that matches currentTile.definitionId
 * and has no meeples (freshly placed).
 *
 * TODO: replace with explicit lastPlacedCoord field on GameState.
 */
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
