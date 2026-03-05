import { describe, it, expect, vi } from 'vitest'
import { createTileBag, drawTile, peekTile } from '../../src/core/engine/TileBag.ts'
import type { TileDefinition, TileInstance } from '../../src/core/types/tile.ts'

describe('TileBag', () => {
  describe('createTileBag', () => {
    const mockBaseDef: TileDefinition = {
      id: 'base_tile',
      count: 2,
      segments: [],
      edgePositionToSegment: {} as any
    }

    const mockStartDef: TileDefinition = {
      id: 'start_tile',
      count: 1,
      startingTile: true,
      segments: [],
      edgePositionToSegment: {} as any
    }

    const mockExpansionDef: TileDefinition = {
      id: 'exp_tile',
      count: 3,
      expansionId: 'some_expansion',
      segments: [],
      edgePositionToSegment: {} as any
    }

    it('should throw an error if no starting tile is found', () => {
      expect(() => createTileBag([mockBaseDef])).toThrowError(
        'No starting tile found in tile definitions. Mark one with startingTile: true.'
      )
    })

    it('should extract exactly one starting tile and return the remaining bag', () => {
      const { bag, startingTile } = createTileBag([mockBaseDef, mockStartDef])
      expect(startingTile).toEqual({ definitionId: 'start_tile', rotation: 0 })
      expect(bag.length).toBe(2)
      expect(bag.every(t => t.definitionId === 'base_tile')).toBe(true)
    })

    it('should only use the first instance of a starting tile type as the starting tile', () => {
      const multiStartDef = { ...mockStartDef, count: 3 }
      const { bag, startingTile } = createTileBag([multiStartDef])
      expect(startingTile).toEqual({ definitionId: 'start_tile', rotation: 0 })
      expect(bag.length).toBe(2)
      expect(bag.every(t => t.definitionId === 'start_tile')).toBe(true)
    })

    it('should append extraTiles to the bag', () => {
      const extraTiles: TileInstance[] = [
        { definitionId: 'extra1', rotation: 90 },
        { definitionId: 'extra2', rotation: 180 }
      ]
      const { bag } = createTileBag([mockStartDef], extraTiles)
      expect(bag.length).toBe(2)
      expect(bag).toContainEqual(extraTiles[0])
      expect(bag).toContainEqual(extraTiles[1])
    })

    it('should handle prioritizeExpansions correctly', () => {
      // Mock Math.random to ensure deterministic shuffle behavior for testing order
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const defs = [mockBaseDef, mockStartDef, mockExpansionDef]
      const { bag } = createTileBag(defs, [], true)

      // 2 base tiles, 3 expansion tiles
      expect(bag.length).toBe(5)

      // First 3 should be expansion tiles
      expect(bag[0].definitionId).toBe('exp_tile')
      expect(bag[1].definitionId).toBe('exp_tile')
      expect(bag[2].definitionId).toBe('exp_tile')

      // Last 2 should be base tiles
      expect(bag[3].definitionId).toBe('base_tile')
      expect(bag[4].definitionId).toBe('base_tile')

      randomSpy.mockRestore()
    })

    it('should treat expansions with id "base" as base tiles', () => {
      const baseExpansionDef = { ...mockExpansionDef, expansionId: 'base', count: 2 }
      const defs = [mockStartDef, mockBaseDef, baseExpansionDef]
      const { bag } = createTileBag(defs, [], true)

      // All 4 remaining tiles should be treated as base tiles, meaning their relative
      // array ordering is mixed together depending on shuffle, but here we just check
      // they exist. With prioritizeExpansions, they all go into baseTiles array since
      // none are "isExpansionTile".
      expect(bag.length).toBe(4)

      const counts = bag.reduce((acc, t) => {
        acc[t.definitionId] = (acc[t.definitionId] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      expect(counts['base_tile']).toBe(2)
      expect(counts['exp_tile']).toBe(2)
    })
  })

  describe('drawTile', () => {
    it('should draw a tile from the bag and return the remaining bag', () => {
      const bag: TileInstance[] = [
        { definitionId: 't1', rotation: 0 },
        { definitionId: 't2', rotation: 90 }
      ]

      const result = drawTile(bag)
      expect(result).not.toBeNull()
      expect(result!.tile).toEqual({ definitionId: 't1', rotation: 0 })
      expect(result!.remaining).toEqual([{ definitionId: 't2', rotation: 90 }])
    })

    it('should return null when drawing from an empty bag', () => {
      expect(drawTile([])).toBeNull()
    })
  })

  describe('peekTile', () => {
    it('should peek at the next tile without removing it', () => {
      const bag: TileInstance[] = [
        { definitionId: 't1', rotation: 0 },
        { definitionId: 't2', rotation: 90 }
      ]
      expect(peekTile(bag)).toEqual({ definitionId: 't1', rotation: 0 })
    })

    it('should return null when peeking an empty bag', () => {
      expect(peekTile([])).toBeNull()
    })
  })
})
