import { describe, it, expect } from 'vitest'
import {
  distributeMajorityScore,
  scoreCompletedFeatures,
  scoreAllRemainingFeatures,
  applyScoreEvents,
  BASE_SCORING_RULES,
} from '../../src/core/engine/ScoreCalculator.ts'
import { emptyUnionFindState } from '../../src/core/types/feature.ts'
import { createPlayer } from '../../src/core/types/player.ts'
import type { Feature, UnionFindState } from '../../src/core/types/feature.ts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFeature(overrides: Partial<Feature>): Feature {
  return {
    id: 'test',
    type: 'CITY',
    nodes: [],
    meeples: [],
    isComplete: true,
    tileCount: 1,
    pennantCount: 0,
    openEdgeCount: 0,
    touchingCityIds: [],
    metadata: {},
    ...overrides,
  }
}

function makeUf(features: Feature[]): UnionFindState {
  const uf = emptyUnionFindState()
  for (const f of features) {
    uf.parent[f.id] = f.id
    uf.rank[f.id] = 0
    uf.featureData[f.id] = f
  }
  return uf
}

// ─── distributeMajorityScore ──────────────────────────────────────────────────

describe('distributeMajorityScore', () => {
  it('no meeples → empty scores', () => {
    const feature = makeFeature({ meeples: [] })
    const result = distributeMajorityScore(feature, 10)
    expect(result).toEqual({})
  })

  it('single player with 1 meeple gets full points', () => {
    const feature = makeFeature({
      meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0' }],
    })
    const result = distributeMajorityScore(feature, 10)
    expect(result).toEqual({ p1: 10 })
  })

  it('two players with equal meeples both score full points', () => {
    const feature = makeFeature({
      meeples: [
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0' },
        { playerId: 'p2', meepleType: 'NORMAL', segmentId: 'city0' },
      ],
    })
    const result = distributeMajorityScore(feature, 10)
    expect(result).toEqual({ p1: 10, p2: 10 })
  })

  it('player with majority gets all points, minority player gets nothing', () => {
    const feature = makeFeature({
      meeples: [
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0' },
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0' },  // 2 meeples
        { playerId: 'p2', meepleType: 'NORMAL', segmentId: 'city0' },  // 1 meeple
      ],
    })
    const result = distributeMajorityScore(feature, 10)
    expect(result).toEqual({ p1: 10 })
    expect(result['p2']).toBeUndefined()
  })

  it('three players: two tied for majority, third loses', () => {
    const feature = makeFeature({
      meeples: [
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'x' },
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'x' },
        { playerId: 'p2', meepleType: 'NORMAL', segmentId: 'x' },
        { playerId: 'p2', meepleType: 'NORMAL', segmentId: 'x' },
        { playerId: 'p3', meepleType: 'NORMAL', segmentId: 'x' },
      ],
    })
    const result = distributeMajorityScore(feature, 10)
    expect(result).toEqual({ p1: 10, p2: 10 })
  })

  it('0 points → empty scores', () => {
    const feature = makeFeature({
      meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'x' }],
    })
    const result = distributeMajorityScore(feature, 0)
    expect(result).toEqual({})
  })
})

// ─── Scoring rules ────────────────────────────────────────────────────────────

describe('Base scoring rules', () => {
  const road = BASE_SCORING_RULES.find(r => r.featureType === 'ROAD')!
  const city = BASE_SCORING_RULES.find(r => r.featureType === 'CITY')!
  const cloister = BASE_SCORING_RULES.find(r => r.featureType === 'CLOISTER')!
  const field = BASE_SCORING_RULES.find(r => r.featureType === 'FIELD')!
  const uf = emptyUnionFindState()

  it('road: 1pt per tile when complete', () => {
    const f = makeFeature({ type: 'ROAD', tileCount: 5 })
    expect(road.scoreComplete(f, uf)).toBe(5)
  })

  it('road: 1pt per tile when incomplete (end game)', () => {
    const f = makeFeature({ type: 'ROAD', tileCount: 3, isComplete: false })
    expect(road.scoreIncomplete(f, uf)).toBe(3)
  })

  it('city: 2pts per tile + 2pts per pennant when complete', () => {
    const f = makeFeature({ type: 'CITY', tileCount: 4, pennantCount: 1 })
    expect(city.scoreComplete(f, uf)).toBe(10)  // (4+1)*2 = 10
  })

  it('city: 1pt per tile + 1pt per pennant when incomplete', () => {
    const f = makeFeature({ type: 'CITY', tileCount: 3, pennantCount: 2, isComplete: false })
    expect(city.scoreIncomplete(f, uf)).toBe(5)  // 3+2 = 5
  })

  it('cloister: 9pts when complete', () => {
    const f = makeFeature({ type: 'CLOISTER', tileCount: 9 })
    expect(cloister.scoreComplete(f, uf)).toBe(9)
  })

  it('cloister: tileCount pts when incomplete (1+surrounding)', () => {
    const f = makeFeature({ type: 'CLOISTER', tileCount: 5, isComplete: false })
    expect(cloister.scoreIncomplete(f, uf)).toBe(5)
  })

  it('farm: 3pts per adjacent completed city', () => {
    const city1 = makeFeature({ id: 'c1', type: 'CITY', isComplete: true })
    const city2 = makeFeature({ id: 'c2', type: 'CITY', isComplete: true })
    const city3 = makeFeature({ id: 'c3', type: 'CITY', isComplete: true })
    const f = makeFeature({ type: 'FIELD', touchingCityIds: ['c1', 'c2', 'c3'] })
    const uf = makeUf([city1, city2, city3, f])
    expect(field.scoreIncomplete(f, uf)).toBe(9)
  })

  it('farm with 0 adjacent cities: 0 pts', () => {
    const f = makeFeature({ type: 'FIELD', touchingCityIds: [] })
    const uf = makeUf([f])
    expect(field.scoreIncomplete(f, uf)).toBe(0)
  })
})

// ─── scoreCompletedFeatures ───────────────────────────────────────────────────

describe('scoreCompletedFeatures', () => {
  it('scores completed city with single player', () => {
    const feature: Feature = makeFeature({
      id: 'feat1',
      type: 'CITY',
      tileCount: 3,
      pennantCount: 1,
      meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0' }],
    })
    const uf = makeUf([feature])
    const players = [createPlayer('p1', 'Alice', 'red')]

    const events = scoreCompletedFeatures(['feat1'], uf, players)
    expect(events).toHaveLength(1)
    expect(events[0].scores['p1']).toBe(8)  // (3+1)*2 = 8
    expect(events[0].featureType).toBe('CITY')
  })

  it('no score event for feature with no meeples', () => {
    const feature: Feature = makeFeature({
      id: 'feat1',
      type: 'CITY',
      tileCount: 2,
      meeples: [],
    })
    const uf = makeUf([feature])
    const players = [createPlayer('p1', 'Alice', 'red')]

    const events = scoreCompletedFeatures(['feat1'], uf, players)
    expect(events).toHaveLength(0)
  })

  it('skips features not in completedFeatureIds', () => {
    const feature: Feature = makeFeature({
      id: 'feat1',
      type: 'CITY',
      meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'x' }],
    })
    const uf = makeUf([feature])
    const players = [createPlayer('p1', 'Alice', 'red')]

    const events = scoreCompletedFeatures([], uf, players)  // empty completed list
    expect(events).toHaveLength(0)
  })
})

// ─── scoreAllRemainingFeatures ────────────────────────────────────────────────

describe('scoreAllRemainingFeatures', () => {
  it('scores incomplete road at end game', () => {
    const road: Feature = makeFeature({
      id: 'road1',
      type: 'ROAD',
      tileCount: 4,
      isComplete: false,
      meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'road0' }],
    })
    const uf = makeUf([road])
    const players = [createPlayer('p1', 'Alice', 'red')]

    const events = scoreAllRemainingFeatures(uf, new Set(), players)
    expect(events).toHaveLength(1)
    expect(events[0].scores['p1']).toBe(4)
    expect(events[0].isEndGame).toBe(true)
  })

  it('does not score already-completed features', () => {
    const city: Feature = makeFeature({
      id: 'city1',
      type: 'CITY',
      tileCount: 2,
      isComplete: true,
      meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0' }],
    })
    const uf = makeUf([city])
    const players = [createPlayer('p1', 'Alice', 'red')]

    const events = scoreAllRemainingFeatures(uf, new Set(['city1']), players)
    expect(events).toHaveLength(0)
  })

  it('scores farms based on adjacent completed cities', () => {
    const city1: Feature = makeFeature({
      id: 'city1',
      type: 'CITY',
      isComplete: true,
    })
    const city2: Feature = makeFeature({
      id: 'city2',
      type: 'CITY',
      isComplete: true,
    })
    const farm: Feature = makeFeature({
      id: 'farm1',
      type: 'FIELD',
      tileCount: 3,
      touchingCityIds: ['city1', 'city2'],
      meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'field0' }],
    })
    
    // In our simplified test setup, the root of 'city1' is 'city1'
    const uf = makeUf([city1, city2, farm])
    const players = [createPlayer('p1', 'Alice', 'red')]

    const events = scoreAllRemainingFeatures(uf, new Set(), players)
    const farmEvent = events.find(e => e.featureType === 'FIELD')
    expect(farmEvent).toBeDefined()
    expect(farmEvent!.scores['p1']).toBe(6)  // 2 cities * 3pts = 6
  })
})

// ─── applyScoreEvents ─────────────────────────────────────────────────────────

describe('applyScoreEvents', () => {
  it('increases player scores correctly', () => {
    const players = [
      createPlayer('p1', 'Alice', 'red'),
      createPlayer('p2', 'Bob', 'blue'),
    ]
    const events: import('../../src/core/types/game.ts').ScoreEvent[] = [
      {
        featureId: 'f1', featureType: 'CITY',
        scores: { p1: 8, p2: 4 },
        tiles: [], isEndGame: false,
      },
      {
        featureId: 'f2', featureType: 'ROAD',
        scores: { p1: 3 },
        tiles: [], isEndGame: false,
      },
    ]
    const updated = applyScoreEvents(players, events)
    expect(updated.find(p => p.id === 'p1')!.score).toBe(11)
    expect(updated.find(p => p.id === 'p2')!.score).toBe(4)
  })

  it('does not mutate original players array', () => {
    const players = [createPlayer('p1', 'Alice', 'red')]
    const events = [{
      featureId: 'f1', featureType: 'ROAD' as const,
      scores: { p1: 5 }, tiles: [], isEndGame: false,
    }]
    const updated = applyScoreEvents(players, events)
    expect(players[0].score).toBe(0)  // original unchanged
    expect(updated[0].score).toBe(5)  // new array updated
  })
})
