/**
 * Dragon & Fairy expansion configuration (C3.1).
 *
 * This expansion does NOT change base scoring rules.
 * Fairy scoring (+3 bonus) is handled as a post-processing step in GameEngine.
 * Dragon/Fairy mechanics are handled in GameEngine turn flow.
 */

import { ScoringRule, countAdjacentCompletedCities } from '../engine/ScoreCalculator.ts'
import type { Direction } from '../types/tile.ts'
import { DF_TILES } from '../data/dragonFairyTiles.ts'

// ─── Dragon & Fairy expansion state (stored in GameState.expansionData) ──────

export interface DragonFairyState {
  /** Whether the dragon has entered play (first Dragon Hoard placed). */
  dragonInPlay: boolean
  /** Whether the current player can move the fairy this turn. */
  canMoveFairy: boolean
  /** Whether a dragon movement is pending after meeple placement. */
  pendingMovement?: boolean
  /** Dragon movement state during DRAGON_MOVEMENT phase. */
  dragonMovement: {
    movesRemaining: number  // 2, 1, or 0
    nextPhase: 'PLACE_TILE' | 'PLACE_MEEPLE' | 'SCORE' // Where to go after movement ends
  } | null
  /** Whether the Double Lake tile is available to be played (if River is active) */
  doubleLakeAvailable?: boolean
  /** Dragon's current facing direction. null = not yet oriented. (facing is not a location property) */
  dragonFacing: Direction | null
}

export function createInitialDragonFairyState(): DragonFairyState {
  return {
    dragonInPlay: false,
    canMoveFairy: false,
    dragonMovement: null,
    doubleLakeAvailable: false,
    dragonFacing: null,
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
    featureType: 'GARDEN',
    scoreComplete: () => 9,
    scoreIncomplete: (f) => f.tileCount,
  },
  {
    featureType: 'FIELD',
    scoreComplete: (f, state) => countAdjacentCompletedCities(f, state) * 3,
    scoreIncomplete: (f, state) => countAdjacentCompletedCities(f, state) * 3,
  },
]

// ─── Expansion config ────────────────────────────────────────────────────────

export const DRAGON_FAIRY_C31_EXPANSION = {
  id: 'dragon-fairy-c31' as const,
  tiles: DF_TILES,
  scoringRules: DF_SCORING_RULES,
  enableBigMeeple: false,
  enableDragonAndFairy: true,
}

/** @deprecated use DRAGON_FAIRY_C31_EXPANSION */
export const DRAGON_FAIRY_EXPANSION = DRAGON_FAIRY_C31_EXPANSION
