import { describe, it, expect } from 'vitest'
import {
  distributeMajorityScore,
  scoreCompletedFeatures,
  scoreAllRemainingFeatures,
} from '../../src/core/engine/ScoreCalculator.ts'
import { IC_SCORING_RULES } from '../../src/core/expansions/innsCathedrals.ts'
import { IC_TILES } from '../../src/core/data/innsCathedralsTiles.ts'
import { initGame } from '../../src/core/engine/GameEngine.ts'
import { emptyUnionFindState } from '../../src/core/types/feature.ts'
import { addTileToUnionFind } from '../../src/core/engine/FeatureDetector.ts'
import { getFallbackTileMap } from '../../src/services/tileRegistry.ts'
const TILE_MAP = getFallbackTileMap()
import type { Feature } from '../../src/core/types/feature.ts'
import type { Board, PlacedTile } from '../../src/core/types/board.ts'
import { emptyBoard, coordKey } from '../../src/core/types/board.ts'

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

function makeUf(features: Feature[]) {
  const uf = emptyUnionFindState()
  for (const f of features) {
    uf.parent[f.id] = f.id
    uf.rank[f.id] = 0
    uf.featureData[f.id] = f
  }
  return uf
}

function placeTileOnBoard(board: Board, tile: PlacedTile): Board {
  const coord = tile.coordinate
  return {
    ...board,
    tiles: { ...board.tiles, [coordKey(coord)]: tile },
    minX: Math.min(board.minX, coord.x),
    maxX: Math.max(board.maxX, coord.x),
    minY: Math.min(board.minY, coord.y),
    maxY: Math.max(board.maxY, coord.y),
  }
}

// TILE_MAP is now initialized via getFallbackTileMap() helper above.

// ─── Tile definitions ─────────────────────────────────────────────────────────

describe('IC tile definitions', () => {
  it('has exactly 18 tile instances', () => {
    expect(IC_TILES.length).toBe(18)
  })

  it('all tiles have expansionId set to inns-cathedrals', () => {
    for (const tile of IC_TILES) {
      expect(tile.expansionId).toBe('inns-cathedrals-c3')
    }
  })

  it('tiles with hasInn are ROAD segments', () => {
    for (const tile of IC_TILES) {
      for (const seg of tile.segments) {
        if (seg.hasInn) {
          expect(seg.type).toBe('ROAD')
        }
      }
    }
  })

  it('tiles with hasCathedral are CITY segments', () => {
    for (const tile of IC_TILES) {
      for (const seg of tile.segments) {
        if (seg.hasCathedral) {
          expect(seg.type).toBe('CITY')
        }
      }
    }
  })

  it('all edge positions map to valid segment IDs', () => {
    for (const tile of IC_TILES) {
      const segIds = new Set(tile.segments.map(s => s.id))
      for (const [_pos, segId] of Object.entries(tile.edgePositionToSegment)) {
        expect(segIds.has(segId)).toBe(true)
      }
    }
  })

  it('has 2 cathedral tiles and 6 inn segments across tiles', () => {
    let cathedralTiles = 0
    let innSegments = 0
    for (const tile of IC_TILES) {
      if (tile.segments.some(s => s.hasCathedral)) cathedralTiles++
      innSegments += tile.segments.filter(s => s.hasInn).length
    }
    expect(cathedralTiles).toBe(2) // ic3_Ka and ic3_Kb
    expect(innSegments).toBe(6)
  })
})

// ─── Scoring rules ────────────────────────────────────────────────────────────

describe('IC scoring rules', () => {
  describe('roads with inn', () => {
    it('complete road with inn scores 2 per tile', () => {
      const feature = makeFeature({
        type: 'ROAD',
        tileCount: 3,
        isComplete: true,
        metadata: { hasInn: true },
        meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'road0', coordinate: { x: 0, y: 0 } }],
      })
      const rule = IC_SCORING_RULES.find(r => r.featureType === 'ROAD')!
      expect(rule.scoreComplete(feature, emptyUnionFindState())).toBe(6) // 3 * 2
    })

    it('incomplete road with inn scores 0', () => {
      const feature = makeFeature({
        type: 'ROAD',
        tileCount: 3,
        isComplete: false,
        metadata: { hasInn: true },
        meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'road0', coordinate: { x: 0, y: 0 } }],
      })
      const rule = IC_SCORING_RULES.find(r => r.featureType === 'ROAD')!
      expect(rule.scoreIncomplete(feature, emptyUnionFindState())).toBe(0)
    })

    it('road without inn scores normally', () => {
      const feature = makeFeature({
        type: 'ROAD',
        tileCount: 4,
        isComplete: true,
        metadata: {},
        meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'road0', coordinate: { x: 0, y: 0 } }],
      })
      const rule = IC_SCORING_RULES.find(r => r.featureType === 'ROAD')!
      expect(rule.scoreComplete(feature, emptyUnionFindState())).toBe(4)
      // 4 * 1
      expect(rule.scoreIncomplete(feature, emptyUnionFindState())).toBe(4)
    })
  })

  describe('cities with cathedral', () => {
    it('complete city with cathedral scores 3 per tile+pennant', () => {
      const feature = makeFeature({
        type: 'CITY',
        tileCount: 3,
        pennantCount: 1,
        isComplete: true,
        metadata: { hasCathedral: true },
        meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0', coordinate: { x: 0, y: 0 } }],
      })
      const rule = IC_SCORING_RULES.find(r => r.featureType === 'CITY')!
      expect(rule.scoreComplete(feature, emptyUnionFindState())).toBe(12) // (3 + 1) * 3
    })

    it('incomplete city with cathedral scores 0', () => {
      const feature = makeFeature({
        type: 'CITY',
        tileCount: 3,
        pennantCount: 1,
        isComplete: false,
        metadata: { hasCathedral: true },
        meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0', coordinate: { x: 0, y: 0 } }],
      })
      const rule = IC_SCORING_RULES.find(r => r.featureType === 'CITY')!
      expect(rule.scoreIncomplete(feature, emptyUnionFindState())).toBe(0)
    })

    it('city without cathedral scores normally', () => {
      const feature = makeFeature({
        type: 'CITY',
        tileCount: 2,
        pennantCount: 1,
        isComplete: true,
        metadata: {},
        meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0', coordinate: { x: 0, y: 0 } }],
      })
      const rule = IC_SCORING_RULES.find(r => r.featureType === 'CITY')!
      expect(rule.scoreComplete(feature, emptyUnionFindState())).toBe(6) // (2 + 1) * 2
      expect(rule.scoreIncomplete(feature, emptyUnionFindState())).toBe(3) // 2 + 1
    })
  })

  describe('scoring functions with IC rules', () => {
    it('scoreCompletedFeatures uses IC rules for inn road', () => {
      const feature = makeFeature({
        id: 'road_feature',
        type: 'ROAD',
        tileCount: 2,
        isComplete: true,
        metadata: { hasInn: true },
        meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'road0', coordinate: { x: 0, y: 0 } }],
      })
      const uf = makeUf([feature])
      const events = scoreCompletedFeatures(['road_feature'], uf, [], IC_SCORING_RULES)
      expect(events).toHaveLength(1)
      expect(events[0].scores).toEqual({ p1: 4 }) // 2 * 2
    })

    it('scoreAllRemainingFeatures gives 0 for incomplete inn road (no event emitted)', () => {
      const feature = makeFeature({
        id: 'road_feature',
        type: 'ROAD',
        tileCount: 3,
        isComplete: false,
        openEdgeCount: 1,
        metadata: { hasInn: true },
        meeples: [{ playerId: 'p1', meepleType: 'NORMAL', segmentId: 'road0', coordinate: { x: 0, y: 0 } }],
      })
      const uf = makeUf([feature])
      const events = scoreAllRemainingFeatures(uf, new Set(), [], IC_SCORING_RULES)
      // Engine correctly skips 0-point score events
      expect(events).toHaveLength(0)
    })
  })
})

// ─── Feature metadata propagation ─────────────────────────────────────────────

describe('Feature metadata propagation', () => {
  it('inn flag is propagated to feature metadata', () => {
    // Place ic_I (straight road N→S with inn) at (0,0)
    const board = emptyBoard()
    const tile: PlacedTile = {
      coordinate: { x: 0, y: 0 },
      definitionId: 'ic3_A',
      rotation: 0,
      meeples: {},
    }
    const newBoard = placeTileOnBoard(board, tile)
    const { state: uf } = addTileToUnionFind(emptyUnionFindState(), newBoard, TILE_MAP, tile)

    // Find the road feature
    const roadFeature = Object.values(uf.featureData).find(f => f.type === 'ROAD')
    expect(roadFeature).toBeDefined()
    expect(roadFeature!.metadata.hasInn).toBe(true)
  })

  it('cathedral flag is propagated to feature metadata', () => {
    // Place ic3_Ka (full city with cathedral) at (0,0)
    const board = emptyBoard()
    const tile: PlacedTile = {
      coordinate: { x: 0, y: 0 },
      definitionId: 'ic3_Ka',
      rotation: 0,
      meeples: {},
    }
    const newBoard = placeTileOnBoard(board, tile)
    const { state: uf } = addTileToUnionFind(emptyUnionFindState(), newBoard, TILE_MAP, tile)

    const cityFeature = Object.values(uf.featureData).find(f => f.type === 'CITY')
    expect(cityFeature).toBeDefined()
    expect(cityFeature!.metadata.hasCathedral).toBe(true)
  })

  it('merged features preserve inn flag', () => {
    // Place ic_I (road with inn) at (0,0) and base_U (straight road) at (0,1)
    let board = emptyBoard()
    const tile1: PlacedTile = {
      coordinate: { x: 0, y: 0 },
      definitionId: 'ic3_A',
      rotation: 0,
      meeples: {},
    }
    board = placeTileOnBoard(board, tile1)
    let { state: uf } = addTileToUnionFind(emptyUnionFindState(), board, TILE_MAP, tile1)

    const tile2: PlacedTile = {
      coordinate: { x: 0, y: 1 },
      definitionId: 'base2_U',
      rotation: 0,
      meeples: {},
    }
    board = placeTileOnBoard(board, tile2)
      ; ({ state: uf } = addTileToUnionFind(uf, board, TILE_MAP, tile2))

    // Find the merged road feature
    const roadFeatures = Object.values(uf.featureData).filter(f => f.type === 'ROAD')
    // At least one road feature should have hasInn
    const innRoad = roadFeatures.find(f => f.metadata.hasInn)
    expect(innRoad).toBeDefined()
  })
})

// ─── Big meeple majority ─────────────────────────────────────────────────────

describe('Big meeple majority scoring', () => {
  it('1 big meeple beats 1 normal meeple (2 vs 1)', () => {
    const feature = makeFeature({
      meeples: [
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0', coordinate: { x: 0, y: 0 } },
        { playerId: 'p2', meepleType: 'BIG', segmentId: 'city1', coordinate: { x: 1, y: 0 } },
      ],
    })
    const result = distributeMajorityScore(feature, 10)
    expect(result).toEqual({ p2: 10 })
  })

  it('1 big meeple ties with 2 normal meeples (2 vs 2)', () => {
    const feature = makeFeature({
      meeples: [
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0', coordinate: { x: 0, y: 0 } },
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city1', coordinate: { x: 1, y: 0 } },
        { playerId: 'p2', meepleType: 'BIG', segmentId: 'city2', coordinate: { x: 2, y: 0 } },
      ],
    })
    const result = distributeMajorityScore(feature, 10)
    expect(result).toEqual({ p1: 10, p2: 10 }) // tie, both score
  })

  it('3 normal meeples beat 1 big meeple (3 vs 2)', () => {
    const feature = makeFeature({
      meeples: [
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city0', coordinate: { x: 0, y: 0 } },
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city1', coordinate: { x: 1, y: 0 } },
        { playerId: 'p1', meepleType: 'NORMAL', segmentId: 'city2', coordinate: { x: 2, y: 0 } },
        { playerId: 'p2', meepleType: 'BIG', segmentId: 'city3', coordinate: { x: 3, y: 0 } },
      ],
    })
    const result = distributeMajorityScore(feature, 10)
    expect(result).toEqual({ p1: 10 })
  })
})

// ─── Game initialization with expansion ───────────────────────────────────────

describe('Game initialization with Inns & Cathedrals', () => {
  it('tile bag has 89 tiles (72 base + 18 IC - 1 starting)', () => {
    const state = initGame({
      playerNames: ['Alice', 'Bob'],
      expansions: ['inns-cathedrals-c3'],
    })
    expect(state.tileBag.length).toBe(89) // 72 + 18 - 1 starting tile
  })

  it('players start with 7 NORMAL + 1 BIG meeple', () => {
    const state = initGame({
      playerNames: ['Alice', 'Bob'],
      expansions: ['inns-cathedrals-c3'],
    })
    for (const player of state.players) {
      expect(player.meeples.available.NORMAL).toBe(7)
      expect(player.meeples.available.BIG).toBe(1)
    }
  })

  it('scoring rules are stored in expansionData', () => {
    const state = initGame({
      playerNames: ['Alice', 'Bob'],
      expansions: ['inns-cathedrals-c3'],
    })
    expect(state.expansionData.scoringRules).toBeDefined()
    expect(state.expansionData.scoringRules).toBe(IC_SCORING_RULES)
  })

  it('base game (no expansion) has 71 tiles in bag and no big meeple', () => {
    const state = initGame({
      playerNames: ['Alice', 'Bob'],
    })
    expect(state.tileBag.length).toBe(71) // 72 - 1 starting tile
    for (const player of state.players) {
      expect(player.meeples.available.NORMAL).toBe(7)
      expect(player.meeples.available.BIG).toBe(0)
    }
  })
})
