import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTileBag, drawTile, peekTile } from '../../src/core/engine/TileBag.ts'
import type { TileDefinition, TileInstance } from '../../src/core/types/tile.ts'

describe('createTileBag', () => {
  beforeEach(() => {
    // Mock Math.random to return predictable sequence for shuffle tests.
    // E.g., returning 0.99 means it always picks the element at index i (no change).
    // Let's use a sequence or just a constant to keep tests simple and deterministic.
    vi.spyOn(Math, 'random').mockReturnValue(0) // Will always pick index 0 for the swap
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockBaseDef: TileDefinition = {
    id: 'base_1',
    count: 2,
    segments: [],
    edgePositionToSegment: {} as any
  }

  const mockStartDef: TileDefinition = {
    id: 'start_1',
    count: 1,
    startingTile: true,
    segments: [],
    edgePositionToSegment: {} as any
  }

  const mockExpDef: TileDefinition = {
    id: 'exp_1',
    expansionId: 'inns',
    count: 2,
    segments: [],
    edgePositionToSegment: {} as any
  }

  it('should correctly expand tile definitions by count and return the starting tile', () => {
    const definitions = [mockBaseDef, mockStartDef]
    const { bag, startingTile } = createTileBag(definitions)

    expect(bag).toHaveLength(2)
    expect(bag[0].definitionId).toBe('base_1')
    expect(bag[1].definitionId).toBe('base_1')

    expect(startingTile.definitionId).toBe('start_1')
  })

  it('should throw an error if no starting tile is found in definitions', () => {
    const definitions = [mockBaseDef]
    expect(() => createTileBag(definitions)).toThrowError('No starting tile found')
  })

  it('should include extra tiles in the bag', () => {
    const definitions = [mockStartDef]
    const extra: TileInstance[] = [{ definitionId: 'extra_1', rotation: 0 }]
    const { bag, startingTile } = createTileBag(definitions, extra)

    expect(startingTile.definitionId).toBe('start_1')
    expect(bag).toHaveLength(1)
    expect(bag[0].definitionId).toBe('extra_1')
  })

  it('should prioritize expansion tiles when prioritizeExpansions is true', () => {
    // Setup definition so we have base and exp tiles
    const definitions = [mockBaseDef, mockStartDef, mockExpDef]

    // With prioritizeExpansions = true, expansion tiles come BEFORE base tiles
    const { bag, startingTile } = createTileBag(definitions, [], true)

    expect(startingTile.definitionId).toBe('start_1')
    expect(bag).toHaveLength(4)

    // First 2 should be expansion tiles
    expect(bag[0].definitionId).toBe('exp_1')
    expect(bag[1].definitionId).toBe('exp_1')
    // Last 2 should be base tiles
    expect(bag[2].definitionId).toBe('base_1')
    expect(bag[3].definitionId).toBe('base_1')
  })

  it('should treat extra tiles without expansion info as base tiles (by default since def is missing)', () => {
    const definitions = [mockStartDef, mockExpDef]
    const extra: TileInstance[] = [{ definitionId: 'base_extra', rotation: 0 }]

    const { bag } = createTileBag(definitions, extra, true)

    expect(bag).toHaveLength(3)
    // Expansion tiles first
    expect(bag[0].definitionId).toBe('exp_1')
    expect(bag[1].definitionId).toBe('exp_1')
    // Missing definition falls back to base tile behavior in prioritizeExpansions
    expect(bag[2].definitionId).toBe('base_extra')
  })
})

describe('drawTile', () => {
  it('should return the first tile and remaining bag', () => {
    const bag: TileInstance[] = [
      { definitionId: 't1', rotation: 0 },
      { definitionId: 't2', rotation: 0 }
    ]
    const result = drawTile(bag)

    expect(result).not.toBeNull()
    expect(result?.tile.definitionId).toBe('t1')
    expect(result?.remaining).toHaveLength(1)
    expect(result?.remaining[0].definitionId).toBe('t2')
  })

  it('should return null if the bag is empty', () => {
    expect(drawTile([])).toBeNull()
  })
})

describe('peekTile', () => {
  it('should return the first tile without removing it', () => {
    const bag: TileInstance[] = [
      { definitionId: 't1', rotation: 0 }
    ]
    const tile = peekTile(bag)
    expect(tile?.definitionId).toBe('t1')
  })

  it('should return null if bag is empty', () => {
    expect(peekTile([])).toBeNull()
  })
})
