import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getPlaceableSegments,
} from '../../../src/core/engine/MeeplePlacement.ts'
import { emptyUnionFindState } from '../../../src/core/types/feature.ts'
import { createPlayer } from '../../../src/core/types/player.ts'
import { emptyBoard } from '../../../src/core/types/board.ts'
import type { TileDefinition } from '../../../src/core/types/tile.ts'
import type { PlacedTile } from '../../../src/core/types/board.ts'

// mock feature detector
vi.mock('../../../src/core/engine/FeatureDetector.ts', () => ({
  featureHasMeeples: vi.fn(),
  getFeature: vi.fn(),
}))

import { featureHasMeeples } from '../../../src/core/engine/FeatureDetector.ts'

describe('MeeplePlacement - getPlaceableSegments', () => {
  const coord = { x: 0, y: 0 }
  const tileMap: Record<string, TileDefinition> = {
    'test-tile': {
      id: 'test-tile',
      count: 1,
      segments: [
        { id: 'city', type: 'CITY' },
        { id: 'road', type: 'ROAD' },
        { id: 'field', type: 'FIELD' },
        { id: 'river', type: 'RIVER' } // River segment should not be placeable
      ],
      edgePositions: []
    }
  }

  let state: any
  let board: any
  let player: any

  beforeEach(() => {
    vi.resetAllMocks()
    state = emptyUnionFindState()
    board = emptyBoard()
    const placedTile: PlacedTile = {
      definitionId: 'test-tile',
      coordinate: coord,
      rotation: 0,
      meeples: {}
    }
    board.tiles['0,0'] = placedTile

    // Default to player having meeples
    player = createPlayer('p1', 'Player 1', 'blue')
    player.meeples.available = { NORMAL: 7, BIG: 1, FARMER: 0, BUILDER: 0, PIG: 0 }
  })

  it('returns empty array if tile is not placed on the board', () => {
    board.tiles = {} // Empty board
    const result = getPlaceableSegments(state, tileMap, board, coord, player)
    expect(result).toEqual([])
  })

  it('returns empty array if placement coordinate is occupied by dragon', () => {
    const dragonPosition = { x: 0, y: 0 }
    const result = getPlaceableSegments(state, tileMap, board, coord, player, dragonPosition)
    expect(result).toEqual([])
  })

  it('returns empty array if tile definition is missing', () => {
    const placedTile: PlacedTile = {
      definitionId: 'missing-tile',
      coordinate: coord,
      rotation: 0,
      meeples: {}
    }
    board.tiles['0,0'] = placedTile
    const result = getPlaceableSegments(state, tileMap, board, coord, player)
    expect(result).toEqual([])
  })

  it('returns empty array if player has no NORMAL or BIG meeples', () => {
    player.meeples.available = { NORMAL: 0, BIG: 0, FARMER: 0, BUILDER: 1, PIG: 1 }
    const result = getPlaceableSegments(state, tileMap, board, coord, player)
    expect(result).toEqual([])
  })

  it('returns segments that do not have meeples and are not RIVER', () => {
    // Only mock segment 'city' as having meeples, so 'road' and 'field' should be placeable.
    vi.mocked(featureHasMeeples).mockImplementation((_state, nKey) => {
      return nKey === '0,0:city'
    })

    const result = getPlaceableSegments(state, tileMap, board, coord, player)
    expect(result).toEqual(['road', 'field']) // city has meeples, river is filtered out
  })

  it('filters out RIVER segments unconditionally', () => {
    vi.mocked(featureHasMeeples).mockReturnValue(false)
    const result = getPlaceableSegments(state, tileMap, board, coord, player)
    expect(result).toEqual(['city', 'road', 'field'])
    expect(result).not.toContain('river')
  })

  it('filters out segments where the feature already has meeples', () => {
    // All non-river segments have meeples
    vi.mocked(featureHasMeeples).mockReturnValue(true)
    const result = getPlaceableSegments(state, tileMap, board, coord, player)
    expect(result).toEqual([])
  })

  it('dragon position checking is strict to exact coordinate match', () => {
    const dragonPosition = { x: 1, y: 1 } // Different from coord {0,0}
    vi.mocked(featureHasMeeples).mockReturnValue(false)
    const result = getPlaceableSegments(state, tileMap, board, coord, player, dragonPosition)
    // Dragon is elsewhere, placement allowed
    expect(result).toEqual(['city', 'road', 'field'])
  })

  it('allows placement if player has BIG meeples but no NORMAL meeples', () => {
    player.meeples.available = { NORMAL: 0, BIG: 1, FARMER: 0, BUILDER: 0, PIG: 0 }
    vi.mocked(featureHasMeeples).mockReturnValue(false)
    const result = getPlaceableSegments(state, tileMap, board, coord, player)
    expect(result).toEqual(['city', 'road', 'field'])
  })
})
