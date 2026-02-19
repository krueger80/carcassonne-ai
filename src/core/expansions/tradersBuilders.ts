/**
 * Traders & Builders expansion configuration.
 *
 * Scoring changes:
 *  - Farm scoring: players with a pig on the farm score 4pts/city instead of 3pts.
 *  - Commodity tokens distributed on city completion (handled in GameEngine).
 *  - Trader bonus: 10pts to the commodity majority holder(s) at end of game.
 *  - All other features score per base rules.
 */

import type { ScoringRule } from '../engine/ScoreCalculator.ts'
import type { Feature } from '../types/feature.ts'
import type { Player } from '../types/player.ts'
import { TB_TILES } from '../data/tradersBuildersTiles.ts'

// ─── Pig-aware farm scoring ────────────────────────────────────────────────────

/**
 * Farm scoring with pig support.
 * Pig owners (who are also majority holders) score 4pts/adjacent city instead of 3pts.
 * BUILDER and PIG are excluded from majority calculation.
 */
function farmDistributeScore(
  feature: Feature,
  _isComplete: boolean,
  _players: Player[],
): Record<string, number> {
  if (feature.meeples.length === 0) return {}

  // Count meeples for majority (BUILDER and PIG excluded)
  const counts: Record<string, number> = {}
  const pigOwners = new Set<string>()

  for (const meeple of feature.meeples) {
    if (meeple.meepleType === 'PIG') {
      pigOwners.add(meeple.playerId)
      continue
    }
    if (meeple.meepleType === 'BUILDER') continue
    const weight = meeple.meepleType === 'BIG' ? 2 : 1
    counts[meeple.playerId] = (counts[meeple.playerId] ?? 0) + weight
  }

  if (Object.keys(counts).length === 0) return {}
  const maxCount = Math.max(...Object.values(counts))
  const result: Record<string, number> = {}

  for (const [playerId, count] of Object.entries(counts)) {
    if (count === maxCount) {
      const ptsPerCity = pigOwners.has(playerId) ? 4 : 3
      result[playerId] = feature.adjacentCompletedCities * ptsPerCity
    }
  }

  return result
}

// ─── T&B scoring rules ────────────────────────────────────────────────────────

export const TB_SCORING_RULES: ScoringRule[] = [
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
    distributeScore: farmDistributeScore,
  },
]

/**
 * Build combined scoring rules for when both Inns & Cathedrals and
 * Traders & Builders are active. IC rules apply for ROAD/CITY/CLOISTER;
 * the pig-aware farm rule replaces the IC FIELD rule.
 */
export function buildCombinedIcTbRules(icRules: ScoringRule[]): ScoringRule[] {
  return icRules.map(rule =>
    rule.featureType === 'FIELD'
      ? { ...rule, distributeScore: farmDistributeScore }
      : rule,
  )
}

// ─── Expansion config ─────────────────────────────────────────────────────────

export const TRADERS_BUILDERS_EXPANSION = {
  id: 'traders-builders' as const,
  tiles: TB_TILES,
  scoringRules: TB_SCORING_RULES,
  enableBigMeeple: true,
  enableBuilderAndPig: true,
}
