import { describe, it, expect } from 'vitest'
import { canPlaceMeeple } from '../../src/core/engine/MeeplePlacement.ts'
import { addTileToUnionFind, updateFeatureMeeples } from '../../src/core/engine/FeatureDetector.ts'
import { emptyUnionFindState, nodeKey } from '../../src/core/types/feature.ts'
import { emptyBoard } from '../../src/core/types/board.ts'
import { TILE_MAP } from '../../src/core/data/baseTiles.ts'
import { createPlayer } from '../../src/core/types/player.ts'
import type { Board, PlacedTile } from '../../src/core/types/board.ts'
import type { Rotation } from '../../src/core/types/tile.ts'
import type { UnionFindState } from '../../src/core/types/feature.ts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function placed(defId: string, x: number, y: number, rotation: Rotation = 0): PlacedTile {
  return { definitionId: defId, coordinate: { x, y }, rotation, meeples: {} }
}

/** Place a sequence of tiles and return the final board + union-find state */
function buildBoard(tiles: PlacedTile[]): { board: Board; uf: UnionFindState; allCompleted: string[] } {
  let board = emptyBoard()
  let uf = emptyUnionFindState()
  const allCompleted: string[] = []

  for (const t of tiles) {
    board = {
      ...board,
      tiles: { ...board.tiles, [`${t.coordinate.x},${t.coordinate.y}`]: t },
      minX: Math.min(board.minX, t.coordinate.x),
      maxX: Math.max(board.maxX, t.coordinate.x),
      minY: Math.min(board.minY, t.coordinate.y),
      maxY: Math.max(board.maxY, t.coordinate.y),
    }
    const result = addTileToUnionFind(uf, board, TILE_MAP, t)
    uf = result.state
    allCompleted.push(...result.completedFeatureIds)
  }

  return { board, uf, allCompleted }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MeeplePlacement', () => {
  const player = createPlayer('p1', 'Player 1', 'red')
  const opponent = createPlayer('p2', 'Player 2', 'blue')

  describe('canPlaceMeeple', () => {
    it('allows placement on an unoccupied feature', () => {
      // Tile E: NORTH=CITY, rest=FIELD
      const tile = placed('base_E', 0, 0)
      const { uf } = buildBoard([tile])

      // Attempt to place on the city segment (segment 0 is the city in base_E)
      // We need to know the segment ID. Looking at base_E in TILE_MAP might be needed,
      // but usually 'city' is one of the segments.
      // Let's assume we can get it from TILE_MAP or just use the known ID if we knew it.
      // For base_E, the city segment is 'city0'.

      const canPlace = canPlaceMeeple(uf, player, { x: 0, y: 0 }, 'city0', 'NORMAL')
      expect(canPlace).toBe(true)
    })

    it('rejects placement if player has no meeples', () => {
      const tile = placed('base_E', 0, 0)
      const { uf } = buildBoard([tile])

      const exhaustedPlayer = createPlayer('p3', 'Exhausted', 'green')
      exhaustedPlayer.meeples.available.NORMAL = 0

      const canPlace = canPlaceMeeple(uf, exhaustedPlayer, { x: 0, y: 0 }, 'city0', 'NORMAL')
      expect(canPlace).toBe(false)
    })

    it('rejects placement on an occupied feature (same tile)', () => {
      const tile = placed('base_E', 0, 0)
      let { uf } = buildBoard([tile])

      const coord = { x: 0, y: 0 }
      const segmentId = 'city0'
      const nKey = nodeKey(coord, segmentId)

      // Simulate existing meeple on this feature
      uf = updateFeatureMeeples(uf, nKey, [{ id: 'm1', playerId: opponent.id, type: 'NORMAL' }])

      const canPlace = canPlaceMeeple(uf, player, coord, segmentId, 'NORMAL')
      expect(canPlace).toBe(false)
    })

    it('rejects placement on an occupied feature (connected tile)', () => {
      // Two city-E tiles connected vertically
      // (0,0) city NORTH
      // (0,-1) city SOUTH (rotated 180)
      const t1 = placed('base_E', 0, 0, 0)
      const t2 = placed('base_E', 0, -1, 180)

      let { uf } = buildBoard([t1, t2])

      // Place meeple on (0,-1) city segment
      // base_E city segment is 'city0'.
      const nKeyOccupied = nodeKey({ x: 0, y: -1 }, 'city0')
      uf = updateFeatureMeeples(uf, nKeyOccupied, [{ id: 'm1', playerId: opponent.id, type: 'NORMAL' }])

      // Try to place meeple on (0,0) city segment, which is connected
      const canPlace = canPlaceMeeple(uf, player, { x: 0, y: 0 }, 'city0', 'NORMAL')
      expect(canPlace).toBe(false)
    })

    it('allows placement if features are not connected', () => {
       // Two city-E tiles NOT connected
      // (0,0) city NORTH
      // (1,0) city NORTH (rotated 0) -> East of (0,0) is Field, West of (1,0) is Field.
      const t1 = placed('base_E', 0, 0, 0)
      const t2 = placed('base_E', 1, 0, 0)

      let { uf } = buildBoard([t1, t2])

      // Place meeple on (1,0) city segment
      const nKeyOccupied = nodeKey({ x: 1, y: 0 }, 'city0')
      uf = updateFeatureMeeples(uf, nKeyOccupied, [{ id: 'm1', playerId: opponent.id, type: 'NORMAL' }])

      // Try to place meeple on (0,0) city segment, which is separate
      const canPlace = canPlaceMeeple(uf, player, { x: 0, y: 0 }, 'city0', 'NORMAL')
      expect(canPlace).toBe(true)
    })
  })
})
