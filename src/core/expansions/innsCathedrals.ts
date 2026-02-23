/**
 * Inns & Cathedrals expansion configuration.
 *
 * Scoring changes:
 *  - Roads with an inn: 2 pts/tile when complete, 0 when incomplete
 *  - Cities with a cathedral: 3 pts/(tile+pennant) when complete, 0 when incomplete
 *  - All other features score normally
 */

import { ScoringRule, countAdjacentCompletedCities } from '../engine/ScoreCalculator.ts'
import { IC_TILES } from '../data/innsCathedralsTiles.ts'
import { IC1_TILES } from '../data/innsCathedralsTilesC1.ts'
import { IC2_TILES } from '../data/innsCathedralsTilesC2.ts'

export const IC_SCORING_RULES: ScoringRule[] = [
  {
    featureType: 'ROAD',
    scoreComplete: (f) => (f.metadata as any)?.hasInn ? f.tileCount * 2 : f.tileCount,
    scoreIncomplete: (f) => (f.metadata as any)?.hasInn ? 0 : f.tileCount,
  },
  {
    featureType: 'CITY',
    scoreComplete: (f) => {
      const base = f.tileCount + f.pennantCount
      return (f.metadata as any)?.hasCathedral ? base * 3 : base * 2
    },
    scoreIncomplete: (f) => {
      return (f.metadata as any)?.hasCathedral ? 0 : f.tileCount + f.pennantCount
    },
  },
  {
    featureType: 'CLOISTER',
    scoreComplete: () => 9,
    scoreIncomplete: (f) => f.tileCount,
  },
  {
    featureType: 'FIELD',
    scoreComplete: (f, state) => countAdjacentCompletedCities(f, state) * 3,
    scoreIncomplete: (f, state) => countAdjacentCompletedCities(f, state) * 3,
  },
]

export const INNS_CATHEDRALS_C1_EXPANSION = {
  id: 'inns-cathedrals-c1' as const,
  tiles: IC1_TILES,
  scoringRules: IC_SCORING_RULES,
  enableBigMeeple: true,
}

export const INNS_CATHEDRALS_C2_EXPANSION = {
  id: 'inns-cathedrals-c2' as const,
  tiles: IC2_TILES,
  scoringRules: IC_SCORING_RULES,
  enableBigMeeple: true,
}

export const INNS_CATHEDRALS_C3_EXPANSION = {
  id: 'inns-cathedrals-c3' as const,
  tiles: IC_TILES,
  scoringRules: IC_SCORING_RULES,
  enableBigMeeple: true,
}

/** @deprecated use INNS_CATHEDRALS_C3_EXPANSION */
export const INNS_CATHEDRALS_EXPANSION = INNS_CATHEDRALS_C3_EXPANSION
