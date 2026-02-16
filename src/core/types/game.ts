import type { Board } from './board.ts'
import type { Player } from './player.ts'
import type { TileInstance, FeatureType } from './tile.ts'
import type { Coordinate, MeeplePlacement } from './board.ts'
import type { UnionFindState } from './feature.ts'

export type GamePhase = 'SETUP' | 'PLAYING' | 'END'

export type TurnPhase =
  | 'DRAW_TILE'
  | 'PLACE_TILE'
  | 'PLACE_MEEPLE'
  | 'SCORE'
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
}

// Stubbed for future AI phase
export interface AiPhaseData {
  isActive: boolean
  narrative?: string
  objectives?: unknown[]
  mechanics?: unknown[]
}
