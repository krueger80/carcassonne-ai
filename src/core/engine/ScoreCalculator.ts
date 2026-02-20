import type { Feature, UnionFindState } from '../types/feature.ts'
import type { Player } from '../types/player.ts'
import type { ScoreEvent } from '../types/game.ts'
import { getAllFeatures } from './FeatureDetector.ts'

// ─── Scoring rules ────────────────────────────────────────────────────────────

export interface ScoringRule {
  featureType: Feature['type']
  scoreComplete(feature: Feature): number
  scoreIncomplete(feature: Feature): number
  /**
   * Optional override: compute the full per-player score map instead of the
   * uniform scalar + distributeMajorityScore path. Used by the T&B pig rule
   * where different majority holders may score different amounts.
   */
  distributeScore?(feature: Feature, isComplete: boolean, players: Player[]): Record<string, number>
}

export const BASE_SCORING_RULES: ScoringRule[] = [
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
    scoreComplete: (_f) => 9,
    scoreIncomplete: (f) => f.tileCount,  // 1 (self) + surrounding tiles
  },
  {
    featureType: 'FIELD',
    scoreComplete: (f) => f.adjacentCompletedCities * 3,
    scoreIncomplete: (f) => f.adjacentCompletedCities * 3,
  },
]

// ─── Majority scoring ─────────────────────────────────────────────────────────

/**
 * Determine which players score from a feature (majority rule).
 * If multiple players tie for the most meeples, all score.
 * Returns a map of playerId → points.
 */
export function distributeMajorityScore(
  feature: Feature,
  points: number,
): Record<string, number> {
  if (feature.meeples.length === 0 || points === 0) return {}

  // Count meeples per player (BIG = 2; BUILDER and PIG excluded from majority)
  const counts: Record<string, number> = {}
  for (const meeple of feature.meeples) {
    if (meeple.meepleType === 'BUILDER' || meeple.meepleType === 'PIG') continue
    const weight = meeple.meepleType === 'BIG' ? 2 : 1
    counts[meeple.playerId] = (counts[meeple.playerId] ?? 0) + weight
  }

  const maxCount = Math.max(...Object.values(counts))
  const result: Record<string, number> = {}

  for (const [playerId, count] of Object.entries(counts)) {
    if (count === maxCount) {
      result[playerId] = points
    }
  }

  return result
}

// ─── Event builders ───────────────────────────────────────────────────────────

function buildScoreEvent(
  feature: Feature,
  scores: Record<string, number>,
  isEndGame: boolean,
): ScoreEvent {
  return {
    featureId: feature.id,
    featureType: feature.type,
    scores,
    tiles: feature.nodes.map(n => n.coordinate),
    isEndGame,
  }
}

// ─── Mid-game scoring (after a tile placement) ────────────────────────────────

/**
 * Score all features that just became complete.
 * Returns score events (callers apply these to player scores).
 */
export function scoreCompletedFeatures(
  completedFeatureIds: string[],
  state: UnionFindState,
  players: Player[],
  rules: ScoringRule[] = BASE_SCORING_RULES,
): ScoreEvent[] {
  const events: ScoreEvent[] = []

  for (const featureId of completedFeatureIds) {
    const feature = state.featureData[featureId]
    if (!feature || !feature.isComplete) continue

    const rule = rules.find(r => r.featureType === feature.type)
    if (!rule) continue

    const scores = rule.distributeScore
      ? rule.distributeScore(feature, true, players)
      : distributeMajorityScore(feature, rule.scoreComplete(feature))

    if (Object.keys(scores).length > 0) {
      events.push(buildScoreEvent(feature, scores, false))
    }
  }

  return events
}

// ─── End-game scoring ─────────────────────────────────────────────────────────

/**
 * Score all remaining features at game end (incomplete features + farms).
 */
export function scoreAllRemainingFeatures(
  state: UnionFindState,
  completedFeatureIds: Set<string>,
  players: Player[],
  rules: ScoringRule[] = BASE_SCORING_RULES,
): ScoreEvent[] {
  const events: ScoreEvent[] = []
  const allFeatures = getAllFeatures(state)

  for (const feature of allFeatures) {
    // Skip features already scored during the game
    if (completedFeatureIds.has(feature.id)) continue
    // Skip features with no meeples
    if (feature.meeples.length === 0) continue
    // Skip FIELD features (scored separately via farm scoring below)
    if (feature.type === 'FIELD') continue

    const rule = rules.find(r => r.featureType === feature.type)
    if (!rule) continue

    const scores = rule.distributeScore
      ? rule.distributeScore(feature, false, players)
      : distributeMajorityScore(feature, rule.scoreIncomplete(feature))

    if (Object.keys(scores).length > 0) {
      events.push(buildScoreEvent(feature, scores, true))
    }
  }

  // Farm scoring: FIELD features with meeples (farmers)
  const fieldRule = rules.find(r => r.featureType === 'FIELD')
  if (fieldRule) {
    for (const feature of allFeatures) {
      if (feature.type !== 'FIELD') continue
      if (feature.meeples.length === 0) continue

      const scores = fieldRule.distributeScore
        ? fieldRule.distributeScore(feature, false, players)
        : (() => {
            const points = fieldRule.scoreIncomplete(feature)
            return points === 0 ? {} : distributeMajorityScore(feature, points)
          })()

      if (Object.keys(scores).length > 0) {
        events.push(buildScoreEvent(feature, scores, true))
      }
    }
  }

  // Apply scores to players
  void players  // players array used by caller to update scores from events

  return events
}

/**
 * Apply a list of score events to the players array.
 * Returns a new players array with updated scores.
 */
export function applyScoreEvents(
  players: Player[],
  events: ScoreEvent[],
): Player[] {
  const updated = players.map(p => ({ ...p }))
  for (const event of events) {
    for (const [playerId, points] of Object.entries(event.scores)) {
      const player = updated.find(p => p.id === playerId)
      if (player) player.score += points
    }
  }
  return updated
}

/**
 * Get the set of player IDs holding meeples on a feature.
 */
export function getFeatureOwnerIds(feature: Feature): Set<string> {
  return new Set(feature.meeples.map(m => m.playerId))
}

// ─── Traders & Builders: commodity token distribution ─────────────────────────

/**
 * When a city is completed, distribute its commodity tokens to the majority scorer(s).
 * BUILDER and PIG meeples are excluded from majority calculation.
 *
 * Returns a map of playerId → { CLOTH, WHEAT, WINE } tokens earned.
 */
export function distributeCommodityTokens(
  feature: Feature,
): Record<string, Record<'CLOTH' | 'WHEAT' | 'WINE', number>> {
  if (feature.type !== 'CITY' || !feature.isComplete) return {}

  const cloth = (feature.metadata['CLOTH'] as number | undefined) ?? 0
  const wheat = (feature.metadata['WHEAT'] as number | undefined) ?? 0
  const wine  = (feature.metadata['WINE']  as number | undefined) ?? 0
  if (cloth === 0 && wheat === 0 && wine === 0) return {}

  // Determine majority (BUILDER and PIG excluded)
  const counts: Record<string, number> = {}
  for (const meeple of feature.meeples) {
    if (meeple.meepleType === 'BUILDER' || meeple.meepleType === 'PIG') continue
    const weight = meeple.meepleType === 'BIG' ? 2 : 1
    counts[meeple.playerId] = (counts[meeple.playerId] ?? 0) + weight
  }

  if (Object.keys(counts).length === 0) return {}
  const maxCount = Math.max(...Object.values(counts))

  const result: Record<string, Record<'CLOTH' | 'WHEAT' | 'WINE', number>> = {}
  for (const [playerId, count] of Object.entries(counts)) {
    if (count === maxCount) {
      result[playerId] = { CLOTH: cloth, WHEAT: wheat, WINE: wine }
    }
  }
  return result
}

/**
 * End-of-game trader bonus: player(s) with the most of each commodity earn 10 pts.
 * Ties: all tied players earn 10 pts.
 */
export function scoreTradersBonus(players: Player[]): ScoreEvent[] {
  const commodities = ['CLOTH', 'WHEAT', 'WINE'] as const
  const events: ScoreEvent[] = []

  for (const commodity of commodities) {
    const maxTokens = Math.max(...players.map(p => p.traderTokens[commodity]))
    if (maxTokens === 0) continue

    const scores: Record<string, number> = {}
    for (const player of players) {
      if (player.traderTokens[commodity] === maxTokens) {
        scores[player.id] = 10
      }
    }

    if (Object.keys(scores).length > 0) {
      events.push({
        featureId: `trader_bonus_${commodity}`,
        featureType: 'CITY',
        scores,
        tiles: [],
        isEndGame: true,
      })
    }
  }

  return events
}
