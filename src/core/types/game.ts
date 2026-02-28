import type { Board } from './board.ts'
import type { Player } from './player.ts'
import type { TileDefinition, TileInstance, FeatureType } from './tile.ts'
import type { Coordinate, MeeplePlacement } from './board.ts'
import type { UnionFindState } from './feature.ts'

export type GamePhase = 'SETUP' | 'PLAYING' | 'END'

export type TurnPhase =
  | 'DRAW_TILE'
  | 'PLACE_TILE'
  | 'DRAGON_PLACE'       // D&F: player must place captured dragon on a Dragon Hoard tile
  | 'DRAGON_ORIENT'      // D&F: player orients dragon on Dragon Hoard tile
  | 'DRAGON_MOVEMENT'    // D&F: dragon straight-line movement after Dragon tile
  | 'PLACE_MEEPLE'
  | 'FAIRY_MOVE'         // D&F: player may move fairy after scoring 0 from a completed feature
  | 'SCORE'
  | 'RETURN_FARMER'      // T&B: returning farmers after Pig mid-game scoring
  | 'NEXT_PLAYER'

export interface ScoreEvent {
  featureId: string
  featureType: FeatureType
  // playerId → points awarded
  scores: Record<string, number>
  // which tile coordinates are part of the scored feature (for UI highlighting)
  tiles: Coordinate[]
  isEndGame: boolean
}

export interface AiPhaseData {
  isActive: boolean
  narrative?: string
  objectives?: unknown[]
  mechanics?: unknown[]
}

export interface GameState {
  phase: GamePhase
  turnPhase: TurnPhase
  players: Player[]
  currentPlayerIndex: number
  board: Board
  tileBag: TileInstance[]
  currentTile: TileInstance | null
  /** Coordinate of the tile placed this turn (set by placeTile, cleared by endTurn). */
  lastPlacedCoord: Coordinate | null
  /** Last tile placed by each player (playerId → coordinate). Persists across turns. */
  lastPlacedCoordByPlayer: Record<string, Coordinate>
  /** Feature root IDs that completed this turn — scored in endTurn (after meeple placement). */
  completedFeatureIds: string[]
  featureUnionFind: UnionFindState
  lastScoreEvents: ScoreEvent[]
  // Tracks all meeples currently on the board across all players
  // key = "x,y:segmentId" (same as node key)
  boardMeeples: Record<string, MeeplePlacement>
  // Extension data for expansions and AI phase
  expansionData: Record<string, unknown>
  aiPhaseData?: AiPhaseData
  staticTileMap: Record<string, TileDefinition>
}
