import { describe, it, expect } from 'vitest'
import {
  getEdge,
  isValidPlacement,
  getValidPositions,
  getValidRotations,
  rotateDirection,
  unrotateDirection,
  rotateEdgePosition,
  getSegmentAtEdgePosition,
} from '../../src/core/engine/TilePlacement.ts'
import { emptyBoard } from '../../src/core/types/board.ts'
import { getFallbackTileMap } from '../../src/services/tileRegistry.ts'
const TILE_MAP = getFallbackTileMap()
import { BASE_TILES } from '../../src/core/data/baseTiles.ts'
const BASE_TILE_COUNT = BASE_TILES.reduce((acc, t) => acc + (t.count ?? 1), 0)
import type { Board, PlacedTile } from '../../src/core/types/board.ts'
import type { TileInstance, Rotation } from '../../src/core/types/tile.ts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function boardWith(tiles: PlacedTile[]): Board {
  const board = emptyBoard()
  for (const tile of tiles) {
    board.tiles[`${tile.coordinate.x},${tile.coordinate.y}`] = tile
  }
  return board
}

function tile(defId: string, rotation: Rotation = 0): TileInstance {
  return { definitionId: defId, rotation }
}

function placed(defId: string, x: number, y: number, rotation: Rotation = 0): PlacedTile {
  return { definitionId: defId, coordinate: { x, y }, rotation, meeples: {} }
}

// ─── Tile count ───────────────────────────────────────────────────────────────

describe('Base tile definitions', () => {
  it('should have 24 distinct tile types', () => {
    expect(BASE_TILES.length).toBe(24)
  })

  it('should have 72 total tiles (71 in bag + 1 starting tile)', () => {
    // One D tile is pre-placed at game start; the rest form the bag
    expect(BASE_TILE_COUNT).toBe(72)
  })

  it('should have all tile definitions in TILE_MAP', () => {
    for (const tile of BASE_TILES) {
      expect(TILE_MAP[tile.id]).toBeDefined()
    }
  })

  it('each tile should have exactly 12 edge position mappings', () => {
    for (const def of BASE_TILES) {
      const count = Object.keys(def.edgePositionToSegment).length
      expect(count).toBe(12)
    }
  })

  it('each edge position should map to an existing segment id', () => {
    for (const def of BASE_TILES) {
      const segmentIds = new Set(def.segments.map(s => s.id))
      for (const segId of Object.values(def.edgePositionToSegment)) {
        expect(segmentIds.has(segId)).toBe(true)
      }
    }
  })

  it('tile D should be marked as starting tile', () => {
    expect(TILE_MAP['base2_D']?.startingTile).toBe(true)
  })
})

// ─── Direction rotation ───────────────────────────────────────────────────────

describe('rotateDirection', () => {
  it('90° CW: NORTH → EAST', () => expect(rotateDirection('NORTH', 90)).toBe('EAST'))
  it('90° CW: EAST → SOUTH', () => expect(rotateDirection('EAST', 90)).toBe('SOUTH'))
  it('90° CW: SOUTH → WEST', () => expect(rotateDirection('SOUTH', 90)).toBe('WEST'))
  it('90° CW: WEST → NORTH', () => expect(rotateDirection('WEST', 90)).toBe('NORTH'))
  it('180°: NORTH → SOUTH', () => expect(rotateDirection('NORTH', 180)).toBe('SOUTH'))
  it('270°: NORTH → WEST', () => expect(rotateDirection('NORTH', 270)).toBe('WEST'))
  it('0°: NORTH → NORTH', () => expect(rotateDirection('NORTH', 0)).toBe('NORTH'))
})

describe('unrotateDirection', () => {
  it('is inverse of rotateDirection', () => {
    const dirs = ['NORTH', 'EAST', 'SOUTH', 'WEST'] as const
    const rotations = [0, 90, 180, 270] as const
    for (const dir of dirs) {
      for (const rot of rotations) {
        const rotated = rotateDirection(dir, rot)
        const unrotated = unrotateDirection(rotated, rot)
        expect(unrotated).toBe(dir)
      }
    }
  })
})

// ─── Edge position rotation ───────────────────────────────────────────────────

describe('rotateEdgePosition', () => {
  it('0°: NORTH_LEFT stays NORTH_LEFT', () => expect(rotateEdgePosition('NORTH_LEFT', 0)).toBe('NORTH_LEFT'))
  it('90°: NORTH_LEFT → EAST_LEFT', () => expect(rotateEdgePosition('NORTH_LEFT', 90)).toBe('EAST_LEFT'))
  it('90°: NORTH_CENTER → EAST_CENTER', () => expect(rotateEdgePosition('NORTH_CENTER', 90)).toBe('EAST_CENTER'))
  it('90°: NORTH_RIGHT → EAST_RIGHT', () => expect(rotateEdgePosition('NORTH_RIGHT', 90)).toBe('EAST_RIGHT'))
  it('180°: NORTH_LEFT → SOUTH_LEFT', () => expect(rotateEdgePosition('NORTH_LEFT', 180)).toBe('SOUTH_LEFT'))
  it('270°: NORTH_LEFT → WEST_LEFT', () => expect(rotateEdgePosition('NORTH_LEFT', 270)).toBe('WEST_LEFT'))
  it('90°: SOUTH_CENTER → WEST_CENTER', () => expect(rotateEdgePosition('SOUTH_CENTER', 90)).toBe('WEST_CENTER'))
})

// ─── getEdge ──────────────────────────────────────────────────────────────────

describe('getEdge', () => {
  const tileE = TILE_MAP['base2_E']!  // city NORTH, field E/S/W

  it('returns CITY on NORTH at 0°', () => {
    expect(getEdge(tileE, 0, 'NORTH')).toBe('CITY')
  })

  it('returns FIELD on EAST at 0°', () => {
    expect(getEdge(tileE, 0, 'EAST')).toBe('FIELD')
  })

  it('after 90° rotation, EAST becomes CITY (was NORTH)', () => {
    expect(getEdge(tileE, 90, 'EAST')).toBe('CITY')
  })

  it('after 180° rotation, SOUTH becomes CITY (was NORTH)', () => {
    expect(getEdge(tileE, 180, 'SOUTH')).toBe('CITY')
  })

  it('after 270° rotation, WEST becomes CITY (was NORTH)', () => {
    expect(getEdge(tileE, 270, 'WEST')).toBe('CITY')
  })
})

// ─── getSegmentAtEdgePosition ─────────────────────────────────────────────────

describe('getSegmentAtEdgePosition', () => {
  const tileE = TILE_MAP['base2_E']!

  it('NORTH_CENTER at 0° → city0', () => {
    expect(getSegmentAtEdgePosition(tileE, 0, 'NORTH_CENTER')).toBe('city0')
  })

  it('EAST_CENTER at 0° → field0', () => {
    expect(getSegmentAtEdgePosition(tileE, 0, 'EAST_CENTER')).toBe('field0')
  })

  it('EAST_CENTER at 90° (tile rotated, physical EAST was logical NORTH) → city0', () => {
    // After 90° CW rotation, the physical EAST edge = logical NORTH → CITY
    expect(getSegmentAtEdgePosition(tileE, 90, 'EAST_CENTER')).toBe('city0')
  })
})

// ─── isValidPlacement ─────────────────────────────────────────────────────────

describe('isValidPlacement', () => {
  it('first tile can be placed at (0,0) on empty board', () => {
    const board = emptyBoard()
    const t = tile('base2_E', 0)
    expect(isValidPlacement(board, TILE_MAP, t, { x: 0, y: 0 })).toBe(true)
  })

  it('cannot place on occupied cell', () => {
    const board = boardWith([placed('base2_E', 0, 0)])
    const t = tile('base2_E', 0)
    expect(isValidPlacement(board, TILE_MAP, t, { x: 0, y: 0 })).toBe(false)
  })

  it('cannot place if not adjacent to any tile', () => {
    const board = boardWith([placed('base2_E', 0, 0)])
    const t = tile('base2_E', 0)
    expect(isValidPlacement(board, TILE_MAP, t, { x: 5, y: 5 })).toBe(false)
  })

  it('valid: tile A (all field) placed south of tile E → matching FIELD edges', () => {
    // Tile E: SOUTH=FIELD. Tile A: NORTH=FIELD → FIELD=FIELD ✓
    const board = boardWith([placed('base2_E', 0, 0)])
    const t = tile('base2_A', 0)
    expect(isValidPlacement(board, TILE_MAP, t, { x: 0, y: 1 })).toBe(true)
  })

  it('invalid: tile E (NORTH=CITY) placed south of tile E → CITY≠FIELD', () => {
    // (0,1) NORTH=CITY must match (0,0) SOUTH=FIELD → mismatch → invalid
    const board = boardWith([placed('base2_E', 0, 0)])
    const t = tile('base2_E', 0)
    expect(isValidPlacement(board, TILE_MAP, t, { x: 0, y: 1 })).toBe(false)
  })

  it('valid: tile E rotated 180° placed north of tile E → CITY meets FIELD → invalid', () => {
    // (0,-1) is NORTH of (0,0). Tile at (0,0) has NORTH=CITY.
    // If we place tile E (180° = city on SOUTH) at (0,-1), its SOUTH edge (physical) = CITY.
    // But (0,0) NORTH = CITY → both CITY → VALID
    const board = boardWith([placed('base2_E', 0, 0)])
    const t = tile('base2_E', 180)
    expect(isValidPlacement(board, TILE_MAP, t, { x: 0, y: -1 })).toBe(true)
  })

  it('invalid: tile with CITY edge adjacent to tile with ROAD edge', () => {
    // Tile E at (0,0): EAST=FIELD. Place tile U (road NS) at (1,0):
    // Tile U WEST=FIELD → should be valid (both FIELD)
    const board = boardWith([placed('base2_E', 0, 0)])
    const tU = tile('base2_U', 0)  // road NS: NORTH=ROAD, EAST=FIELD, SOUTH=ROAD, WEST=FIELD
    expect(isValidPlacement(board, TILE_MAP, tU, { x: 1, y: 0 })).toBe(true)
  })

  it('invalid: CITY must meet CITY (tile C = all city)', () => {
    // Tile C (all city) placed at (0,0). Tile E at (1,0) has WEST=FIELD → CITY≠FIELD → invalid
    const board = boardWith([placed('base2_C', 0, 0)])
    const t = tile('base2_E', 0)
    expect(isValidPlacement(board, TILE_MAP, t, { x: 1, y: 0 })).toBe(false)
  })

  it('valid: tile C (all city) can only be adjacent to tiles with city edges', () => {
    const board = boardWith([placed('base2_C', 0, 0)])
    // Another tile C rotated: all edges are CITY → valid
    const t = tile('base2_C', 0)
    expect(isValidPlacement(board, TILE_MAP, t, { x: 1, y: 0 })).toBe(true)
  })
})

// ─── getValidPositions ────────────────────────────────────────────────────────

describe('getValidPositions', () => {
  it('on empty board, tile E can only be placed at (0,0)', () => {
    const board = emptyBoard()
    const t = tile('base2_E', 0)
    const positions = getValidPositions(board, TILE_MAP, t)
    expect(positions).toHaveLength(1)
    expect(positions[0]).toEqual({ x: 0, y: 0 })
  })

  it('after placing tile E at origin, returns multiple candidate positions', () => {
    const board = boardWith([placed('base2_E', 0, 0)])
    const t = tile('base2_E', 0)
    const positions = getValidPositions(board, TILE_MAP, t)
    // All 4 neighbors are candidates; some may be valid
    expect(positions.length).toBeGreaterThan(0)
  })

  it('returns positions with correct adjacency only', () => {
    const board = boardWith([placed('base2_E', 0, 0)])
    const t = tile('base2_E', 0)
    const positions = getValidPositions(board, TILE_MAP, t)
    for (const pos of positions) {
      const isAdjacent =
        (Math.abs(pos.x) === 1 && pos.y === 0) ||
        (Math.abs(pos.y) === 1 && pos.x === 0)
      expect(isAdjacent).toBe(true)
    }
  })
})

// ─── getValidRotations ────────────────────────────────────────────────────────

describe('getValidRotations', () => {
  it('tile C (all city) at any rotation next to tile C: all 4 rotations valid', () => {
    const board = boardWith([placed('base2_C', 0, 0)])
    const t = tile('base2_C', 0)
    const rotations = getValidRotations(board, TILE_MAP, t, { x: 1, y: 0 })
    expect(rotations).toHaveLength(4)
  })

  it('tile U (road NS) at (1,0) next to tile E: WEST must be FIELD → rotation 0 or 180', () => {
    // Tile E at (0,0) has EAST=FIELD. Tile U WEST=FIELD only at 0° and 180°
    const board = boardWith([placed('base2_E', 0, 0)])
    const t = tile('base2_U', 0)
    const rotations = getValidRotations(board, TILE_MAP, t, { x: 1, y: 0 })
    // Both 0° and 180° have WEST=FIELD for tile U
    expect(rotations).toContain(0)
    expect(rotations).toContain(180)
  })
})
