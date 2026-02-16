import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  initGame,
  drawTile,
  rotateTile,
  placeTile,
  placeMeeple,
  skipMeeple,
  endTurn,
  endGame,
} from '../../src/core/engine/GameEngine.ts'
import type { GameConfig, GameState } from '../../src/core/engine/GameEngine.ts'
import type { TileInstance } from '../../src/core/types/tile.ts'
import { TILE_MAP } from '../../src/core/data/baseTiles.ts'

// Mock TileBag to control randomness
vi.mock('../../src/core/engine/TileBag.ts', () => {
  return {
    createTileBag: vi.fn(),
    drawTile: vi.fn(),
  }
})

import * as TileBagModule from '../../src/core/engine/TileBag.ts'

describe('GameEngine', () => {
  const mockCreateTileBag = vi.spyOn(TileBagModule, 'createTileBag')
  const mockDrawTile = vi.spyOn(TileBagModule, 'drawTile')

  const startingTile: TileInstance = { definitionId: 'base_D', rotation: 0 }
  const tileA: TileInstance = { definitionId: 'base_A', rotation: 0 }
  const tileB: TileInstance = { definitionId: 'base_B', rotation: 0 }

  beforeEach(() => {
    vi.resetAllMocks()

    // Default mock implementation
    mockCreateTileBag.mockReturnValue({
      bag: [tileA, tileB],
      startingTile,
    })

    mockDrawTile.mockImplementation((bag) => {
      if (bag.length === 0) return null
      const [tile, ...remaining] = bag
      return { tile, remaining }
    })
  })

  it('should be defined', () => {
    expect(initGame).toBeDefined()
  })

  describe('initGame', () => {
    it('initializes game with valid player count (2)', () => {
      const config: GameConfig = { playerNames: ['Alice', 'Bob'] }
      const state = initGame(config)
      expect(state.players).toHaveLength(2)
      expect(state.players[0].name).toBe('Alice')
      expect(state.players[1].name).toBe('Bob')
      expect(state.phase).toBe('PLAYING')
      expect(state.turnPhase).toBe('DRAW_TILE')
    })

    it('initializes game with valid player count (6)', () => {
      const config: GameConfig = { playerNames: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] }
      const state = initGame(config)
      expect(state.players).toHaveLength(6)
    })

    it('throws error for invalid player count (< 2)', () => {
      expect(() => initGame({ playerNames: ['Alice'] })).toThrow('Carcassonne supports 2–6 players')
    })

    it('throws error for invalid player count (> 6)', () => {
      const names = Array(7).fill('P')
      expect(() => initGame({ playerNames: names })).toThrow('Carcassonne supports 2–6 players')
    })

    it('places the starting tile at (0,0)', () => {
      const state = initGame({ playerNames: ['Alice', 'Bob'] })
      const tileAtOrigin = state.board.tiles['0,0']
      expect(tileAtOrigin).toBeDefined()
      expect(tileAtOrigin?.definitionId).toBe('base_D')
      expect(tileAtOrigin?.rotation).toBe(0)
    })

    it('initializes the tile bag correctly', () => {
      // Since we mocked createTileBag, we expect the bag in state to match our mock
      const state = initGame({ playerNames: ['Alice', 'Bob'] })
      expect(state.tileBag).toHaveLength(2) // from mock: [tileA, tileB]
      expect(state.tileBag[0]).toEqual(tileA)
    })

    it('initializes union-find with starting tile segments', () => {
      const state = initGame({ playerNames: ['Alice', 'Bob'] })
      // Starting tile D has city, road, field segments.
      // We can check if featureUnionFind has entries for (0,0) segments.
      const keys = Object.keys(state.featureUnionFind.featureData)
      // base_D has 4 segments (city0, road0, field0, field1)
      // So we expect keys starting with "0,0:"
      const segmentKeys = keys.filter(k => k.startsWith('0,0:'))
      expect(segmentKeys.length).toBeGreaterThan(0)
    })
  })

  describe('drawTile', () => {
    it('draws a tile and transitions to PLACE_TILE', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      // state.tileBag has [tileA, tileB]

      state = drawTile(state)

      expect(state.turnPhase).toBe('PLACE_TILE')
      expect(state.currentTile).toBeDefined()
      expect(state.currentTile?.definitionId).toBe('base_A') // First tile in mock bag
      expect(state.tileBag).toHaveLength(1) // One remaining
    })

    it('ends the game if bag is empty', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      // Manually empty the bag
      state = { ...state, tileBag: [] }

      state = drawTile(state)
      expect(state.phase).toBe('END')
    })

    it('does nothing if phase is not DRAW_TILE', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      state = drawTile(state) // transitions to PLACE_TILE

      const nextState = drawTile(state) // should be ignored
      expect(nextState).toBe(state)
    })
  })

  describe('rotateTile', () => {
    it('rotates the current tile 90 degrees clockwise', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      state = drawTile(state)

      // Initial rotation is 0
      expect(state.currentTile?.rotation).toBe(0)

      state = rotateTile(state)
      expect(state.currentTile?.rotation).toBe(90)

      state = rotateTile(state)
      expect(state.currentTile?.rotation).toBe(180)

      state = rotateTile(state)
      expect(state.currentTile?.rotation).toBe(270)

      state = rotateTile(state)
      expect(state.currentTile?.rotation).toBe(0)
    })

    it('does nothing if phase is not PLACE_TILE', () => {
      const state = initGame({ playerNames: ['Alice', 'Bob'] }) // DRAW_TILE phase
      const nextState = rotateTile(state)
      expect(nextState).toBe(state)
    })
  })

  describe('placeTile', () => {
    it('places a tile on valid position and transitions to PLACE_MEEPLE', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      state = drawTile(state)
      // Current tile is base_A (NORTH=FIELD).
      // Starting tile base_D (SOUTH=FIELD) is at (0,0).
      // Placing base_A at (0,1) puts A's NORTH against D's SOUTH.
      // FIELD matches FIELD. Valid.

      const coord = { x: 0, y: 1 }
      const nextState = placeTile(state, coord)

      expect(nextState.turnPhase).toBe('PLACE_MEEPLE')
      expect(nextState.board.tiles['0,1']).toBeDefined()
      expect(nextState.lastPlacedCoord).toEqual(coord)
      expect(nextState.board.minY).toBe(0)
      expect(nextState.board.maxY).toBe(1)
    })

    it('rejects invalid placement', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      state = drawTile(state)
      // Current tile is base_A (SOUTH=ROAD).
      // Placing base_A at (0,-1) puts A's SOUTH against D's NORTH (CITY).
      // A (0,-1) SOUTH is ROAD.
      // D (0,0) NORTH is CITY.
      // Mismatch.

      const coord = { x: 0, y: -1 }
      const nextState = placeTile(state, coord)

      expect(nextState).toBe(state)
    })

    it('does nothing if phase is not PLACE_TILE', () => {
      const state = initGame({ playerNames: ['Alice', 'Bob'] }) // DRAW_TILE
      const nextState = placeTile(state, { x: 0, y: 1 })
      expect(nextState).toBe(state)
    })
  })

  describe('placeMeeple', () => {
    it('places a meeple on a valid segment and transitions to SCORE', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      state = drawTile(state) // draws base_A
      state = placeTile(state, { x: 0, y: 1 }) // place at (0,1)

      // place meeple on 'road0' of the tile just placed
      const nextState = placeMeeple(state, 'road0')

      expect(nextState.turnPhase).toBe('SCORE')

      // Check board meeples
      // key is "x,y:segmentId"
      const key = '0,1:road0'
      expect(nextState.boardMeeples[key]).toBeDefined()
      expect(nextState.boardMeeples[key].playerId).toBe(state.players[0].id)

      // Check player meeples
      const player = nextState.players[0]
      expect(player.meeples.available.NORMAL).toBe(6) // started with 7
      expect(player.meeples.onBoard).toContain(key)
    })

    it('does nothing if segment is invalid', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      state = drawTile(state)
      state = placeTile(state, { x: 0, y: 1 })

      const nextState = placeMeeple(state, 'invalid_segment')
      expect(nextState).toBe(state)
    })
  })

  describe('skipMeeple', () => {
    it('transitions to SCORE without placing meeple', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      state = drawTile(state)
      state = placeTile(state, { x: 0, y: 1 })

      const nextState = skipMeeple(state)
      expect(nextState.turnPhase).toBe('SCORE')
      expect(nextState.boardMeeples).toEqual(state.boardMeeples) // Unchanged
    })
  })

  describe('endTurn', () => {
    it('advances to next player and DRAW_TILE phase', () => {
      let state = initGame({ playerNames: ['Alice', 'Bob'] })
      state = drawTile(state)
      state = placeTile(state, { x: 0, y: 1 })
      state = skipMeeple(state) // now in SCORE

      const nextState = endTurn(state)

      expect(nextState.turnPhase).toBe('DRAW_TILE')
      expect(nextState.currentPlayerIndex).toBe(1) // Bob's turn
      expect(nextState.players[0].meeples).toEqual(state.players[0].meeples) // No change in meeples
    })
  })
})
