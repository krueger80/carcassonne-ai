import { describe, it, expect } from 'vitest'
import {
  canPlaceMeeple,
} from '../../src/core/engine/MeeplePlacement.ts'
import type { Player } from '../../src/core/types/player.ts'
import type { Coordinate } from '../../src/core/types/board.ts'
import type { UnionFindState } from '../../src/core/types/feature.ts'
import { nodeKey } from '../../src/core/types/feature.ts'

describe('MeeplePlacement', () => {
  describe('canPlaceMeeple', () => {
    const mockCoord: Coordinate = { x: 0, y: 0 }
    const mockSegmentId = 'segment-1'
    const mockNKey = nodeKey(mockCoord, mockSegmentId)

    // Create a base player helper
    const createMockPlayer = (normalAvailable: number = 1): Player => ({
      id: 'player-1',
      name: 'Player 1',
      color: '#ff0000',
      score: 0,
      meeples: {
        available: {
          NORMAL: normalAvailable,
          BIG: 0,
          FARMER: 0,
          BUILDER: 0,
          PIG: 0,
        },
        onBoard: [],
      },
      traderTokens: { CLOTH: 0, WHEAT: 0, WINE: 0 },
      scoreBreakdown: {},
    })

    // Create a base UnionFindState helper
    const createMockState = (hasMeeples: boolean = false): UnionFindState => ({
      parent: {
        [mockNKey]: mockNKey,
      },
      rank: {
        [mockNKey]: 0,
      },
      featureData: {
        [mockNKey]: {
          id: mockNKey,
          type: 'ROAD',
          nodes: [{ coordinate: mockCoord, segmentId: mockSegmentId }],
          meeples: hasMeeples ? [{ id: 'm1', playerId: 'player-2', type: 'NORMAL' }] : [],
          isComplete: false,
          tileCount: 1,
          pennantCount: 0,
          openEdgeCount: 2,
          touchingCityIds: [],
          metadata: {},
        },
      },
    })

    it('should return false if player has no available meeples of the requested type', () => {
      const player = createMockPlayer(0)
      const state = createMockState(false)

      const result = canPlaceMeeple(state, player, mockCoord, mockSegmentId, 'NORMAL')

      expect(result).toBe(false)
    })

    it('should return false if the coordinate is occupied by the dragon', () => {
      const player = createMockPlayer(1)
      const state = createMockState(false)
      const dragonPosition: Coordinate = { x: 0, y: 0 }

      const result = canPlaceMeeple(state, player, mockCoord, mockSegmentId, 'NORMAL', dragonPosition)

      expect(result).toBe(false)
    })

    it('should return true if the dragon is on a different coordinate', () => {
      const player = createMockPlayer(1)
      const state = createMockState(false)
      const dragonPosition: Coordinate = { x: 1, y: 1 } // Different coordinate

      const result = canPlaceMeeple(state, player, mockCoord, mockSegmentId, 'NORMAL', dragonPosition)

      expect(result).toBe(true)
    })

    it('should return false if the feature already has meeples', () => {
      const player = createMockPlayer(1)
      const state = createMockState(true) // Feature has meeples

      const result = canPlaceMeeple(state, player, mockCoord, mockSegmentId, 'NORMAL')

      expect(result).toBe(false)
    })

    it('should return true for a valid placement', () => {
      const player = createMockPlayer(1)
      const state = createMockState(false) // Feature has no meeples

      const result = canPlaceMeeple(state, player, mockCoord, mockSegmentId, 'NORMAL')

      expect(result).toBe(true)
    })

    it('should return true for a valid placement of a different meeple type if available', () => {
      const player = createMockPlayer(0)
      player.meeples.available.BIG = 1 // Player has a BIG meeple
      const state = createMockState(false)

      const result = canPlaceMeeple(state, player, mockCoord, mockSegmentId, 'BIG')

      expect(result).toBe(true)
    })

    it('should return false if placing a BIG meeple but none are available', () => {
      const player = createMockPlayer(1) // Has NORMAL but no BIG
      const state = createMockState(false)

      const result = canPlaceMeeple(state, player, mockCoord, mockSegmentId, 'BIG')

      expect(result).toBe(false)
    })

    it('should default meepleType to NORMAL if not provided', () => {
      const player = createMockPlayer(1)
      const state = createMockState(false)

      // Since default is NORMAL, it should use that and return true
      const result = canPlaceMeeple(state, player, mockCoord, mockSegmentId)

      expect(result).toBe(true)

      const emptyPlayer = createMockPlayer(0)
      const resultEmpty = canPlaceMeeple(state, emptyPlayer, mockCoord, mockSegmentId)

      expect(resultEmpty).toBe(false)
    })
  })
})
