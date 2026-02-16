import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTileBag } from '../../src/core/engine/TileBag'
import type { TileDefinition, EdgeType, EdgePosition, Segment, Direction } from '../../src/core/types/tile'

// Helper to create minimal mock definitions
const createMockDef = (id: string, count: number, startingTile = false): TileDefinition => {
  const edges: Record<Direction, EdgeType> = {
    NORTH: 'FIELD',
    EAST: 'FIELD',
    SOUTH: 'FIELD',
    WEST: 'FIELD'
  }

  const segments: Segment[] = []
  const edgePositionToSegment: Record<EdgePosition, string> = {
    NORTH_LEFT: 'field', NORTH_CENTER: 'field', NORTH_RIGHT: 'field',
    EAST_LEFT: 'field', EAST_CENTER: 'field', EAST_RIGHT: 'field',
    SOUTH_LEFT: 'field', SOUTH_CENTER: 'field', SOUTH_RIGHT: 'field',
    WEST_LEFT: 'field', WEST_CENTER: 'field', WEST_RIGHT: 'field'
  }

  return {
    id,
    count,
    startingTile,
    edges,
    segments,
    edgePositionToSegment
  }
}

describe('TileBag', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should use crypto.getRandomValues for shuffling', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    // Check if window.crypto is available, if not try global.crypto (Node)
    const cryptoObject = typeof window !== 'undefined' && window.crypto
      ? window.crypto
      : (globalThis.crypto as Crypto)

    if (!cryptoObject) {
        throw new Error('Crypto API not available in test environment')
    }

    const cryptoSpy = vi.spyOn(cryptoObject, 'getRandomValues')

    const definitions = [
      createMockDef('start', 1, true),
      createMockDef('a', 5),
      createMockDef('b', 5)
    ]

    const { bag } = createTileBag(definitions)

    expect(bag.length).toBe(10)
    // Should NOT use Math.random
    expect(randomSpy).not.toHaveBeenCalled()
    // Should use crypto.getRandomValues
    expect(cryptoSpy).toHaveBeenCalled()
  })

  it('should still shuffle the bag (probabilistically)', () => {
     const definitions = [
      createMockDef('start', 1, true),
      createMockDef('a', 10),
      createMockDef('b', 10),
      createMockDef('c', 10)
    ]

    const { bag: bag1 } = createTileBag(definitions)
    const { bag: bag2 } = createTileBag(definitions)

    // With 30 items, the chance of exact same order is tiny
    expect(bag1).not.toEqual(bag2)
  })
})
