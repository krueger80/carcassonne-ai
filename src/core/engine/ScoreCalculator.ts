import type { Feature, UnionFindState } from '../types/feature.ts'
import type { Player } from '../types/player.ts'
import type { ScoreEvent } from '../types/game.ts'
import { getAllFeatures } from './FeatureDetector.ts'

// ─── Scoring rules ────────────────────────────────────────────────────────────

export interface ScoringRule {
  featureType: Feature['type']
  scoreComplete(feature: Feature): number
  scoreIncomplete(feature: Feature): number
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

  // Count meeples per player
  const counts: Record<string, number> = {}
  for (const meeple of feature.meeples) {
    counts[meeple.playerId] = (counts[meeple.playerId] ?? 0) + 1
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
  rules: ScoringRule[] = BASE_SCORING_RULES,
): ScoreEvent[] {
  const events: ScoreEvent[] = []

  for (const featureId of completedFeatureIds) {
    const feature = state.featureData[featureId]
    if (!feature || !feature.isComplete) continue

    const rule = rules.find(r => r.featureType === feature.type)
    if (!rule) continue

    const points = rule.scoreComplete(feature)
    const scores = distributeMajorityScore(feature, points)

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

    const points = rule.scoreIncomplete(feature)
    const scores = distributeMajorityScore(feature, points)

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

      const points = fieldRule.scoreIncomplete(feature)
      if (points === 0) continue

      const scores = distributeMajorityScore(feature, points)
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
