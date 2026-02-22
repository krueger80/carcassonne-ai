/**
 * Dragon & Fairy expansion configuration (C3.1).
 *
 * This expansion does NOT change base scoring rules.
 * Fairy scoring (+3 bonus) is handled as a post-processing step in GameEngine.
 * Dragon/Fairy mechanics are handled in GameEngine turn flow.
 */

import type { ScoringRule } from '../engine/ScoreCalculator.ts'
import type { Coordinate } from '../types/board.ts'
import type { Direction } from '../types/tile.ts'
import { DF_TILES } from '../data/dragonFairyTiles.ts'

// ─── Dragon & Fairy expansion state (stored in GameState.expansionData) ──────

export interface DragonFairyState {
  /** Dragon's current position on the board. null = off board / removed. */
  dragonPosition: Coordinate | null
  /** Dragon's current facing direction. null = not yet oriented. */
  dragonFacing: Direction | null
  /** Fairy's current position. null = not yet placed. */
  fairyPosition: { coordinate: Coordinate; segmentId: string } | null
  /** Whether the dragon has entered play (first Dragon Hoard placed). */
  dragonInPlay: boolean
  /** Whether the current player can move the fairy this turn. */
  canMoveFairy: boolean
  /** Player ID holding the captured dragon (fairy hit). null = nobody. */
  dragonHeldBy: string | null
  /** Whether a dragon movement is pending after meeple placement. */
  pendingMovement?: boolean
  /** Dragon movement state during DRAGON_MOVEMENT phase. */
  dragonMovement: {
    movesRemaining: number  // 2, 1, or 0
    nextPhase: 'PLACE_TILE' | 'SCORE' // Where to go after movement ends
  } | null
}

export function createInitialDragonFairyState(): DragonFairyState {
  return {
    dragonPosition: null,
    dragonFacing: null,
    fairyPosition: null,
    dragonInPlay: false,
    canMoveFairy: false,
    dragonHeldBy: null,
    dragonMovement: null,
  }
}

// ─── Scoring rules: pass-through (D&F doesn't modify base scoring) ──────────

// D&F uses whatever scoring rules are active from other expansions.
// We provide base rules as a fallback; GameEngine will combine with IC/TB if active.
export const DF_SCORING_RULES: ScoringRule[] = [
  {
    featureType: 'ROAD',
    scoreComplete: (f) => f.tileCount,
    scoreIncomplete: (f) => f.tileCount,
  },
  {
    featureType: 'CITY',
    scoreComplete: (f) => (f.tileCount + f.pennantCount) * 2,
    scoreIncomplete: (f) => f.tileCount + f.pennantCount,
  },
  {
    featureType: 'CLOISTER',
    scoreComplete: () => 9,
    scoreIncomplete: (f) => f.tileCount,
  },
  {
    featureType: 'FIELD',
    scoreComplete: (f) => f.adjacentCompletedCities * 3,
    scoreIncomplete: (f) => f.adjacentCompletedCities * 3,
  },
]

// ─── Expansion config ────────────────────────────────────────────────────────

export const DRAGON_FAIRY_EXPANSION = {
  id: 'dragon-fairy' as const,
  tiles: DF_TILES,
  scoringRules: DF_SCORING_RULES,
  enableBigMeeple: false,
  enableDragonAndFairy: true,
}
