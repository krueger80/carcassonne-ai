import { describe, it, expect, vi } from 'vitest'
import { createTileBag, drawTile, peekTile } from '../../src/core/engine/TileBag'
import type { TileDefinition, TileInstance, EdgeType } from '../../src/core/types/tile'

const MOCK_EDGES: Record<string, EdgeType> = {
  NORTH: 'FIELD',
  EAST: 'FIELD',
  SOUTH: 'FIELD',
  WEST: 'FIELD'
}

function createMockTileDef(id: string, count: number, startingTile = false): TileDefinition {
  return {
    id,
    count,
    startingTile,
    edges: MOCK_EDGES as any,
    segments: [],
    edgePositionToSegment: {} as any
  }
}

describe('TileBag', () => {
  describe('createTileBag', () => {
    it('should separate starting tile and include all other tiles', () => {
      const defs = [
        createMockTileDef('start', 1, true),
        createMockTileDef('other', 2, false)
      ]

      const { bag, startingTile } = createTileBag(defs)

      expect(startingTile.definitionId).toBe('start')
      expect(bag).toHaveLength(2)
      expect(bag.filter(t => t.definitionId === 'other')).toHaveLength(2)
    })

    it('should throw error if no starting tile is defined', () => {
      const defs = [
        createMockTileDef('other', 1, false)
      ]

      expect(() => createTileBag(defs)).toThrow('No starting tile found')
    })

    it('should include extra tiles in the bag', () => {
      const defs = [createMockTileDef('start', 1, true)]
      const extra: TileInstance[] = [{ definitionId: 'extra', rotation: 0 }]

      const { bag } = createTileBag(defs, extra)

      expect(bag).toHaveLength(1)
      expect(bag[0].definitionId).toBe('extra')
    })

    it('should handle multiple starting tiles by taking the first one found', () => {
      const defs = [
        createMockTileDef('start1', 1, true),
        createMockTileDef('start2', 1, true)
      ]

      const { bag, startingTile } = createTileBag(defs)

      expect(startingTile.definitionId).toBe('start1')
      expect(bag).toHaveLength(1)
      expect(bag[0].definitionId).toBe('start2')
    })

    it('should shuffle the bag', () => {
       const spy = vi.spyOn(Math, 'random')

       const defs = [
         createMockTileDef('start', 1, true),
         createMockTileDef('a', 5, false)
       ]
       createTileBag(defs)
       expect(spy).toHaveBeenCalled()

       spy.mockRestore()
    })
  })

  describe('drawTile', () => {
    it('should draw the first tile and return remaining', () => {
      const bag: TileInstance[] = [
        { definitionId: '1', rotation: 0 },
        { definitionId: '2', rotation: 0 }
      ]

      const result = drawTile(bag)
      expect(result).not.toBeNull()
      expect(result?.tile.definitionId).toBe('1')
      expect(result?.remaining).toHaveLength(1)
      expect(result?.remaining[0].definitionId).toBe('2')
    })

    it('should return null for empty bag', () => {
      expect(drawTile([])).toBeNull()
    })

    it('should not mutate original bag', () => {
        const bag: TileInstance[] = [{ definitionId: '1', rotation: 0 }]
        const originalLength = bag.length
        drawTile(bag)
        expect(bag).toHaveLength(originalLength)
    })
  })

  describe('peekTile', () => {
    it('should return the first tile without removing it', () => {
      const bag: TileInstance[] = [
        { definitionId: '1', rotation: 0 },
        { definitionId: '2', rotation: 0 }
      ]

      const tile = peekTile(bag)
      expect(tile).not.toBeNull()
      expect(tile?.definitionId).toBe('1')
      expect(bag).toHaveLength(2)
    })

    it('should return null for empty bag', () => {
      expect(peekTile([])).toBeNull()
    })
  })
})
