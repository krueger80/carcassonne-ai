import { describe, it, expect } from 'vitest'
import {
  initGame,
  retrieveAbbot,
} from '../../src/core/engine/GameEngine.ts'
import { canPlaceMeeple } from '../../src/core/engine/MeeplePlacement.ts'
import { addTileToUnionFind } from '../../src/core/engine/FeatureDetector.ts'
import { emptyUnionFindState, nodeKey } from '../../src/core/types/feature.ts'
import { emptyBoard, coordKey } from '../../src/core/types/board.ts'
import { createPlayer } from '../../src/core/types/player.ts'
import type { Board, PlacedTile } from '../../src/core/types/board.ts'
import type { TileDefinition } from '../../src/core/types/tile.ts'
import type { GameState } from '../../src/core/types/game.ts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// A simple cloister tile definition for testing
const CLOISTER_TILE: TileDefinition = {
  id: 'test_cloister',
  count: 1,
  segments: [
    { id: 'cloister0', type: 'CLOISTER', svgPath: 'M30,30 L70,30 L70,70 L30,70 Z', meepleCentroid: { x: 50, y: 50 } },
    { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 80 } },
  ],
  edgePositionToSegment: {
    NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
    EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
    SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
    WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
  },
}

// A simple garden tile definition for testing
const GARDEN_TILE: TileDefinition = {
  id: 'test_garden',
  count: 1,
  segments: [
    { id: 'garden0', type: 'GARDEN', svgPath: 'M30,30 L70,30 L70,70 L30,70 Z', meepleCentroid: { x: 50, y: 50 } },
    { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 80 } },
  ],
  edgePositionToSegment: {
    NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
    EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
    SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
    WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
  },
}

// A simple road tile
const ROAD_TILE: TileDefinition = {
  id: 'test_road',
  count: 1,
  segments: [
    { id: 'road0', type: 'ROAD', svgPath: 'M0,50 L100,50', meepleCentroid: { x: 50, y: 50 } },
    { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,45 L0,45 Z', meepleCentroid: { x: 50, y: 25 } },
    { id: 'field1', type: 'FIELD', svgPath: 'M0,55 L100,55 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 75 } },
  ],
  edgePositionToSegment: {
    NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
    EAST_LEFT: 'field0', EAST_CENTER: 'road0', EAST_RIGHT: 'field1',
    SOUTH_LEFT: 'field1', SOUTH_CENTER: 'field1', SOUTH_RIGHT: 'field1',
    WEST_LEFT: 'field1', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
  },
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Abbot Extension', () => {
  describe('Player creation with Abbot', () => {
    it('creates player with ABBOT=1 when abbot is enabled', () => {
      const player = createPlayer('p1', 'Alice', '#f00', false, false, true)
      expect(player.meeples.available.ABBOT).toBe(1)
    })

    it('creates player with ABBOT=0 when abbot is disabled', () => {
      const player = createPlayer('p1', 'Alice', '#f00', false, false, false)
      expect(player.meeples.available.ABBOT).toBe(0)
    })
  })

  describe('Abbot placement restrictions', () => {
    it('ABBOT can be placed on CLOISTER segments', () => {
      const player = createPlayer('p1', 'Alice', '#f00', false, false, true)
      const tileMap = { test_cloister: CLOISTER_TILE }
      let uf = emptyUnionFindState()
      const coord = { x: 0, y: 0 }
      const placedTile: PlacedTile = {
        definitionId: 'test_cloister', rotation: 0, coordinate: coord, meeples: {},
      }
      let board = emptyBoard()
      board = placeTileOnBoard(board, placedTile)
      const result = addTileToUnionFind(uf, board, tileMap, placedTile)
      uf = result.state

      const can = canPlaceMeeple(uf, player, coord, 'cloister0', 'ABBOT', null, tileMap, 'test_cloister')
      expect(can).toBe(true)
    })

    it('ABBOT can be placed on GARDEN segments', () => {
      const player = createPlayer('p1', 'Alice', '#f00', false, false, true)
      const tileMap = { test_garden: GARDEN_TILE }
      let uf = emptyUnionFindState()
      const coord = { x: 0, y: 0 }
      const placedTile: PlacedTile = {
        definitionId: 'test_garden', rotation: 0, coordinate: coord, meeples: {},
      }
      let board = emptyBoard()
      board = placeTileOnBoard(board, placedTile)
      const result = addTileToUnionFind(uf, board, tileMap, placedTile)
      uf = result.state

      const can = canPlaceMeeple(uf, player, coord, 'garden0', 'ABBOT', null, tileMap, 'test_garden')
      expect(can).toBe(true)
    })

    it('ABBOT cannot be placed on ROAD segments', () => {
      const player = createPlayer('p1', 'Alice', '#f00', false, false, true)
      const tileMap = { test_road: ROAD_TILE }
      let uf = emptyUnionFindState()
      const coord = { x: 0, y: 0 }
      const placedTile: PlacedTile = {
        definitionId: 'test_road', rotation: 0, coordinate: coord, meeples: {},
      }
      let board = emptyBoard()
      board = placeTileOnBoard(board, placedTile)
      const result = addTileToUnionFind(uf, board, tileMap, placedTile)
      uf = result.state

      const can = canPlaceMeeple(uf, player, coord, 'road0', 'ABBOT', null, tileMap, 'test_road')
      expect(can).toBe(false)
    })

    it('ABBOT cannot be placed on FIELD segments', () => {
      const player = createPlayer('p1', 'Alice', '#f00', false, false, true)
      const tileMap = { test_road: ROAD_TILE }
      let uf = emptyUnionFindState()
      const coord = { x: 0, y: 0 }
      const placedTile: PlacedTile = {
        definitionId: 'test_road', rotation: 0, coordinate: coord, meeples: {},
      }
      let board = emptyBoard()
      board = placeTileOnBoard(board, placedTile)
      const result = addTileToUnionFind(uf, board, tileMap, placedTile)
      uf = result.state

      const can = canPlaceMeeple(uf, player, coord, 'field0', 'ABBOT', null, tileMap, 'test_road')
      expect(can).toBe(false)
    })
  })

  describe('Garden feature detection', () => {
    it('creates a GARDEN feature node when garden tile is placed', () => {
      const tileMap = { test_garden: GARDEN_TILE }
      const coord = { x: 0, y: 0 }
      const placedTile: PlacedTile = {
        definitionId: 'test_garden', rotation: 0, coordinate: coord, meeples: {},
      }
      let board = emptyBoard()
      board = placeTileOnBoard(board, placedTile)
      const result = addTileToUnionFind(emptyUnionFindState(), board, tileMap, placedTile)

      const gardenKey = nodeKey(coord, 'garden0')
      expect(gardenKey in result.state.parent).toBe(true)
      expect(result.state.featureData[gardenKey]?.type).toBe('GARDEN')
    })

    it('garden feature counts surrounding tiles like cloister', () => {
      const tileMap = {
        test_garden: GARDEN_TILE,
        test_road: ROAD_TILE,
      }
      const gardenCoord = { x: 0, y: 0 }
      const gardenTile: PlacedTile = {
        definitionId: 'test_garden', rotation: 0, coordinate: gardenCoord, meeples: {},
      }
      let board = emptyBoard()
      board = placeTileOnBoard(board, gardenTile)
      let uf = addTileToUnionFind(emptyUnionFindState(), board, tileMap, gardenTile).state

      // Place a neighbor tile
      const neighborCoord = { x: 1, y: 0 }
      const neighborTile: PlacedTile = {
        definitionId: 'test_road', rotation: 0, coordinate: neighborCoord, meeples: {},
      }
      board = placeTileOnBoard(board, neighborTile)
      const result = addTileToUnionFind(uf, board, tileMap, neighborTile)
      uf = result.state

      const gardenKey = nodeKey(gardenCoord, 'garden0')
      const gardenFeature = uf.featureData[gardenKey]
      expect(gardenFeature).toBeDefined()
      expect(gardenFeature!.tileCount).toBe(2) // garden tile + 1 neighbor
    })

    it('garden feature completes when surrounded by 8 tiles', () => {
      const tileMap = {
        test_garden: GARDEN_TILE,
        test_road: ROAD_TILE,
      }
      const gardenCoord = { x: 0, y: 0 }
      const gardenTile: PlacedTile = {
        definitionId: 'test_garden', rotation: 0, coordinate: gardenCoord, meeples: {},
      }
      let board = emptyBoard()
      board = placeTileOnBoard(board, gardenTile)
      let uf = addTileToUnionFind(emptyUnionFindState(), board, tileMap, gardenTile).state
      let completedIds: string[] = []

      // Place 8 surrounding tiles
      const offsets = [
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 0 },                    { x: 1, y: 0 },
        { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 },
      ]

      for (const offset of offsets) {
        const coord = { x: gardenCoord.x + offset.x, y: gardenCoord.y + offset.y }
        const tile: PlacedTile = {
          definitionId: 'test_road', rotation: 0, coordinate: coord, meeples: {},
        }
        board = placeTileOnBoard(board, tile)
        const result = addTileToUnionFind(uf, board, tileMap, tile)
        uf = result.state
        completedIds.push(...result.completedFeatureIds)
      }

      const gardenKey = nodeKey(gardenCoord, 'garden0')
      const gardenFeature = uf.featureData[gardenKey]
      expect(gardenFeature).toBeDefined()
      expect(gardenFeature!.isComplete).toBe(true)
      expect(gardenFeature!.tileCount).toBe(9)
      expect(completedIds).toContain(gardenKey)
    })
  })

  describe('initGame with Abbot', () => {
    it('gives each player an ABBOT when abbot expansion is enabled', () => {
      const state = initGame({
        playerNames: ['Alice', 'Bob'],
        expansions: ['abbot'],
      })
      for (const player of state.players) {
        expect(player.meeples.available.ABBOT).toBe(1)
      }
    })

    it('players have no ABBOT when abbot expansion is not enabled', () => {
      const state = initGame({
        playerNames: ['Alice', 'Bob'],
      })
      for (const player of state.players) {
        expect(player.meeples.available.ABBOT).toBe(0)
      }
    })

    it('stores abbot in canonical expansions list', () => {
      const state = initGame({
        playerNames: ['Alice', 'Bob'],
        expansions: ['abbot'],
      })
      const expansions = (state.expansionData?.expansions as string[]) ?? []
      expect(expansions).toContain('abbot')
    })
  })

  describe('Abbot retrieval', () => {
    it('retrieveAbbot returns the abbot and scores the feature', () => {
      // Build a minimal game state with an abbot on the board
      const tileMap: Record<string, TileDefinition> = {
        test_cloister: CLOISTER_TILE,
        test_road: ROAD_TILE,
      }
      const coord = { x: 0, y: 0 }

      // Create a game state manually
      const player = createPlayer('player_0', 'Alice', '#f00', false, false, true)
      const player2 = createPlayer('player_1', 'Bob', '#00f', false, false, true)

      // Place abbot on the cloister
      const nKey = nodeKey(coord, 'cloister0')
      const abbotMeeple = {
        playerId: 'player_0',
        meepleType: 'ABBOT' as const,
        segmentId: 'cloister0',
        coordinate: coord,
      }

      const placedTile: PlacedTile = {
        definitionId: 'test_cloister',
        rotation: 0,
        coordinate: coord,
        meeples: { cloister0: abbotMeeple },
      }

      let board = emptyBoard()
      board = placeTileOnBoard(board, placedTile)

      // Place a neighbor so there's a scoring value
      const neighborTile: PlacedTile = {
        definitionId: 'test_road', rotation: 0,
        coordinate: { x: 1, y: 0 }, meeples: {},
      }
      board = placeTileOnBoard(board, neighborTile)

      let uf = emptyUnionFindState()
      uf = addTileToUnionFind(uf, board, tileMap, placedTile).state
      uf = addTileToUnionFind(uf, board, tileMap, neighborTile).state

      // Add meeple to the feature
      const gardenFeature = uf.featureData[nKey]
      if (gardenFeature) {
        uf.featureData[nKey] = { ...gardenFeature, meeples: [abbotMeeple] }
      }

      const playerWithAbbot = {
        ...player,
        meeples: {
          ...player.meeples,
          available: { ...player.meeples.available, ABBOT: 0 },
          onBoard: [nKey],
        },
      }

      const state: GameState = {
        phase: 'PLAYING',
        board,
        players: [playerWithAbbot, player2],
        currentPlayerIndex: 0,
        tileBag: [],
        currentTile: { definitionId: 'test_cloister', rotation: 0 },
        lastPlacedCoord: coord,
        lastPlacedCoordByPlayer: {},
        turnPhase: 'PLACE_MEEPLE',
        completedFeatureIds: [],
        featureUnionFind: uf,
        staticTileMap: tileMap,
        lastScoreEvents: [],
        boardMeeples: { [nKey]: abbotMeeple },
        expansionData: {
          expansions: ['abbot'],
          scoringRulesKey: 'base',
        },
      }

      const result = retrieveAbbot(state, coord, 'cloister0')

      // Verify abbot was returned to player
      expect(result.players[0].meeples.available.ABBOT).toBe(1)
      expect(result.players[0].meeples.onBoard).not.toContain(nKey)

      // Verify score was added (cloister with 1 neighbor = 2 tiles = 2 points)
      expect(result.players[0].score).toBe(2)

      // Verify phase transitioned to SCORE
      expect(result.turnPhase).toBe('SCORE')

      // Verify meeple removed from board
      expect(result.boardMeeples[nKey]).toBeUndefined()
    })

    it('retrieveAbbot does nothing if not in PLACE_MEEPLE phase', () => {
      const state = initGame({
        playerNames: ['Alice', 'Bob'],
        expansions: ['abbot'],
      })
      const result = retrieveAbbot(state, { x: 0, y: 0 }, 'cloister0')
      // Should return same state since we're not in PLACE_MEEPLE phase
      expect(result).toBe(state)
    })
  })
})
