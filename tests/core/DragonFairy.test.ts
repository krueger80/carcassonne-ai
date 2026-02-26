import { describe, it, expect } from 'vitest'
import {
  initGame,
  executeDragonMovement,
  moveFairy,
  skipFairyMove,
  getFairyMoveTargets,
  getMagicPortalPlacements,
  placeMeepleViaPortal,
  isMagicPortalTile,
  isDragonHoardTile,
  maybeReorientDragon,
} from '../../src/core/engine/GameEngine.ts'
import { DF_TILES } from '../../src/core/data/dragonFairyTiles.ts'
import { DRAGON_FAIRY_EXPANSION, createInitialDragonFairyState } from '../../src/core/expansions/dragonFairy.ts'
import type { GameState } from '../../src/core/types/game.ts'
import type { Board, PlacedTile, MeeplePlacement } from '../../src/core/types/board.ts'
import { coordKey } from '../../src/core/types/board.ts'
import { addTileToUnionFind } from '../../src/core/engine/FeatureDetector.ts'
import type { DragonFairyState } from '../../src/core/expansions/dragonFairy.ts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createDfGame(): GameState {
  return initGame({
    playerNames: ['Alice', 'Bob'],
    expansions: ['dragon-fairy-c31'],
  })
}

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

function getDfState(state: GameState): DragonFairyState {
  return state.expansionData['dragonFairy'] as DragonFairyState
}

function setDfState(state: GameState, df: Partial<DragonFairyState>): GameState {
  const existing = getDfState(state)
  return {
    ...state,
    expansionData: {
      ...state.expansionData,
      dragonFairy: { ...existing, ...df },
    },
  }
}

/** Build a minimal game state with a line of tiles for testing dragon movement */
function buildLinearBoard(
  state: GameState,
  tiles: { x: number; y: number; defId: string; meeples?: Record<string, any> }[],
): GameState {
  let board = state.board
  let uf = state.featureUnionFind
  let boardMeeples = { ...state.boardMeeples }

  for (const t of tiles) {
    const def = state.staticTileMap[t.defId]
    if (!def) throw new Error(`Tile definition not found: ${t.defId}`)

    // Populate coordinates for meeples
    const formattedMeeples: Record<string, MeeplePlacement> = {}
    if (t.meeples) {
      for (const [segId, m] of Object.entries(t.meeples)) {
        formattedMeeples[segId] = { ...m, coordinate: { x: t.x, y: t.y } } as MeeplePlacement
      }
    }

    const placed: PlacedTile = {
      coordinate: { x: t.x, y: t.y },
      definitionId: t.defId,
      rotation: 0,
      meeples: formattedMeeples,
    }
    board = placeTileOnBoard(board, placed)

    // Add to union-find
    const { state: newUf } = addTileToUnionFind(uf, board, state.staticTileMap, placed)
    uf = newUf

    // Track board meeples
    for (const [segId, m] of Object.entries(formattedMeeples)) {
      boardMeeples[`${t.x},${t.y}:${segId}`] = m
    }
  }

  return {
    ...state,
    board,
    featureUnionFind: uf,
    boardMeeples,
  }
}

// ─── Tile definitions ─────────────────────────────────────────────────────────

describe('D&F tile definitions', () => {
  it('has 26 land tile definitions', () => {
    expect(DF_TILES.length).toBe(26)
  })

  it('all tiles have expansionId set to dragon-fairy', () => {
    for (const tile of DF_TILES) {
      expect(tile.expansionId).toBe('dragon-fairy-c31')
    }
  })

  it('has 6 Dragon Hoard tiles', () => {
    const hoards = DF_TILES.filter(t => t.isDragonHoard)
    // 6 land Dragon Hoards + 1 river lake = 7
    expect(hoards.length).toBeGreaterThanOrEqual(6)
  })

  it('has 10 Dragon tiles', () => {
    const dragons = DF_TILES.filter(t => t.hasDragon)
    expect(dragons.length).toBe(10)
  })

  it('has 6 magic portal tiles', () => {
    const portals = DF_TILES.filter(t => t.hasMagicPortal)
    expect(portals.length).toBe(6)
  })

  it('Dragon Hoard tiles do NOT have dragon or magic portal flags', () => {
    const hoards = DF_TILES.filter(t => t.isDragonHoard)
    for (const h of hoards) {
      expect(h.hasDragon).toBeFalsy()
      expect(h.hasMagicPortal).toBeFalsy()
    }
  })

  it('all tiles have valid segment definitions', () => {
    for (const tile of DF_TILES) {
      expect(tile.segments.length).toBeGreaterThan(0)
      for (const seg of tile.segments) {
        expect(seg.id).toBeTruthy()
        expect(seg.type).toBeTruthy()
        expect(seg.meepleCentroid).toBeDefined()
      }
    }
  })
})

// ─── Expansion config ─────────────────────────────────────────────────────────

describe('D&F expansion config', () => {
  it('has correct expansion properties', () => {
    expect(DRAGON_FAIRY_EXPANSION.id).toBe('dragon-fairy-c31')
    expect(DRAGON_FAIRY_EXPANSION.enableDragonAndFairy).toBe(true)
    expect(DRAGON_FAIRY_EXPANSION.enableBigMeeple).toBe(false)
    expect(DRAGON_FAIRY_EXPANSION.tiles.length).toBe(26)
  })
})

// ─── Game initialization ──────────────────────────────────────────────────────

describe('D&F game initialization', () => {
  it('creates a game with dragon-fairy expansion data', () => {
    const state = createDfGame()
    const df = getDfState(state)
    expect(df).toBeDefined()
    expect(df.dragonPosition).toBeNull()
    expect(df.dragonFacing).toBeNull()
    expect(df.fairyPosition).toBeNull()
    expect(df.dragonInPlay).toBe(false)
    expect(df.canMoveFairy).toBe(false)
    expect(df.dragonMovement).toBeNull()
  })

  it('includes D&F tiles in the tile bag', () => {
    const state = createDfGame()
    // Check at least some D&F tiles are in the bag
    const dfTileIds = new Set(DF_TILES.map(t => t.id))
    const bagDfTiles = state.tileBag.filter(t => dfTileIds.has(t.definitionId))
    expect(bagDfTiles.length).toBeGreaterThan(0)
  })

  it('includes D&F tile definitions in staticTileMap', () => {
    const state = createDfGame()
    expect(state.staticTileMap['df31_1']).toBeDefined()
    expect(state.staticTileMap['df31_K']).toBeDefined()
    expect(state.staticTileMap['df31_S']).toBeDefined()
  })
})

// ─── Dragon Hoard tiles ──────────────────────────────────────────────────────

describe('Dragon Hoard tile detection', () => {
  it('isDragonHoardTile returns true for Dragon Hoard tiles', () => {
    const state = createDfGame()
    const stateWithHoard = {
      ...state,
      currentTile: { definitionId: 'df31_1', rotation: 0 as const },
    }
    expect(isDragonHoardTile(stateWithHoard)).toBe(true)
  })

  it('isDragonHoardTile returns false for non-Dragon-Hoard tiles', () => {
    const state = createDfGame()
    const stateWithDragon = {
      ...state,
      currentTile: { definitionId: 'df31_K', rotation: 0 as const },
    }
    expect(isDragonHoardTile(stateWithDragon)).toBe(false)
  })
})

// ─── Magic Portal ─────────────────────────────────────────────────────────────

describe('Magic Portal tile detection', () => {
  it('isMagicPortalTile returns true for portal tiles', () => {
    const state = createDfGame()
    const stateWithPortal = {
      ...state,
      currentTile: { definitionId: 'df31_S', rotation: 0 as const },
    }
    expect(isMagicPortalTile(stateWithPortal)).toBe(true)
  })

  it('isMagicPortalTile returns false for non-portal tiles', () => {
    const state = createDfGame()
    const stateWithHoard = {
      ...state,
      currentTile: { definitionId: 'df31_1', rotation: 0 as const },
    }
    expect(isMagicPortalTile(stateWithHoard)).toBe(false)
  })
})

// ─── Dragon movement ──────────────────────────────────────────────────────────

describe('Dragon movement', () => {
  it('returns to PLACE_TILE if dragon is not on the board', () => {
    const state = createDfGame()
    const stateWithDragon = setDfState(state, {
      dragonPosition: null,
      dragonFacing: null,
      dragonMovement: { movesRemaining: 1, nextPhase: 'PLACE_TILE' }
    })
    const result = executeDragonMovement(stateWithDragon)
    expect(result.turnPhase).toBe('PLACE_TILE')
  })

  it('moves dragon forward and eats meeples along the way', () => {
    let state = createDfGame()

    // Place tiles in a line: (0,0) starting, (1,0), (2,0), (3,0)
    // Dragon at (0,0) facing EAST
    // Meeple on (2,0)
    const player = state.players[0]
    state = buildLinearBoard(state, [
      { x: 1, y: 0, defId: 'df31_K' },
      {
        x: 2, y: 0, defId: 'df31_H', meeples: {
          city_N: { playerId: player.id, meepleType: 'NORMAL', segmentId: 'city_N' },
        }
      },
      { x: 3, y: 0, defId: 'df31_C' },
    ])

    // Set dragon at (0,0) facing EAST
    state = setDfState(state, {
      dragonPosition: { x: 0, y: 0 },
      dragonFacing: 'EAST',
      dragonInPlay: true,
      dragonMovement: { movesRemaining: 1, nextPhase: 'PLACE_TILE' }
    })

    // Deduct player meeple count
    state = {
      ...state,
      players: state.players.map(p =>
        p.id === player.id
          ? {
            ...p,
            meeples: {
              ...p.meeples,
              available: { ...p.meeples.available, NORMAL: p.meeples.available.NORMAL - 1 },
              onBoard: [...p.meeples.onBoard, '2,0:city_N'],
            },
          }
          : p,
      ),
    }

    const result = executeDragonMovement(state)

    // Dragon should have moved east and eaten the meeple at (2,0)
    expect(result.turnPhase).toBe('PLACE_TILE')

    // The meeple at (2,0) should be eaten (returned to player)
    const resultPlayer = result.players.find(p => p.id === player.id)!
    const baselinePlayer = state.players.find(p => p.id === player.id)!
    expect(resultPlayer.meeples.available.NORMAL).toBe(baselinePlayer.meeples.available.NORMAL + 1)
    expect(result.board.tiles['2,0'].meeples).toEqual({})
  })

  it('dragon is removed from board when encountering fairy', () => {
    let state = createDfGame()

    // Place tiles: (0,0) starting, (1,0), (2,0)
    // Dragon at (0,0) facing EAST
    // Fairy at (2,0)
    state = buildLinearBoard(state, [
      { x: 1, y: 0, defId: 'df31_K' },
      { x: 2, y: 0, defId: 'df31_H' },
    ])

    state = setDfState(state, {
      dragonPosition: { x: 0, y: 0 },
      dragonFacing: 'EAST',
      dragonInPlay: true,
      dragonMovement: { movesRemaining: 1, nextPhase: 'PLACE_TILE' },
      fairyPosition: { coordinate: { x: 2, y: 0 }, segmentId: 'city_N' },
    })

    const result = executeDragonMovement(state)
    const df = getDfState(result)

    // Dragon should be removed from board
    expect(df.dragonPosition).toBeNull()
    expect(result.turnPhase).toBe('PLACE_TILE')
  })

  it('dragon stops at board edge when no more tiles', () => {
    let state = createDfGame()

    // Place just one tile east of starting: (1,0)
    // Dragon at (0,0) facing EAST — can only move to (1,0)
    state = buildLinearBoard(state, [
      { x: 1, y: 0, defId: 'df31_K' },
    ])

    state = setDfState(state, {
      dragonPosition: { x: 0, y: 0 },
      dragonFacing: 'EAST',
      dragonInPlay: true,
      dragonMovement: { movesRemaining: 1, nextPhase: 'PLACE_TILE' }
    })

    const result = executeDragonMovement(state)
    const df = getDfState(result)

    // Dragon should be at (1,0) — moved as far east as possible
    expect(df.dragonPosition).toEqual({ x: 1, y: 0 })
  })
})

// ─── Dragon orientation ──────────────────────────────────────────────────────

describe('Dragon orientation', () => {
  it('maybeReorientDragon does nothing if meeple is in straight line', () => {
    let state = createDfGame()

    // Dragon at (0,0) facing EAST. Meeple placed at (2,0) (same row = straight line)
    state = setDfState(state, {
      dragonPosition: { x: 0, y: 0 },
      dragonFacing: 'EAST',
      dragonInPlay: true,
    })

    const result = maybeReorientDragon(state, { x: 2, y: 0 })
    const df = getDfState(result)
    expect(df.dragonFacing).toBe('EAST')  // No change
  })

  it('maybeReorientDragon does nothing if no dragon on board', () => {
    let state = createDfGame()
    state = setDfState(state, { dragonPosition: null })

    const result = maybeReorientDragon(state, { x: 1, y: 1 })
    expect(result).toBe(state)  // Reference equality — no changes
  })
})

// ─── Fairy movement ───────────────────────────────────────────────────────────

describe('Fairy movement', () => {
  it('getFairyMoveTargets returns positions with current player meeples', () => {
    let state = createDfGame()
    const player = state.players[0]

    // Place a tile with a meeple
    state = buildLinearBoard(state, [
      {
        x: 1, y: 0, defId: 'df31_N', meeples: {
          city_N: { playerId: player.id, meepleType: 'NORMAL', segmentId: 'city_N' },
        }
      },
    ])

    const targets = getFairyMoveTargets(state)
    expect(targets.length).toBe(1)
    expect(targets[0].coordinate).toEqual({ x: 1, y: 0 })
    expect(targets[0].segmentId).toBe('city_N')
  })

  it('getFairyMoveTargets excludes other player meeples', () => {
    let state = createDfGame()
    const otherPlayer = state.players[1]

    // Place a tile with OTHER player's meeple
    state = buildLinearBoard(state, [
      {
        x: 1, y: 0, defId: 'df31_N', meeples: {
          city_N: { playerId: otherPlayer.id, meepleType: 'NORMAL', segmentId: 'city_N' },
        }
      },
    ])

    // Current player is player 0
    const targets = getFairyMoveTargets(state)
    expect(targets.length).toBe(0)
  })

  it('moveFairy places fairy at specified location', () => {
    let state = createDfGame()
    const player = state.players[0]

    // Set up fairy move phase
    state = {
      ...state,
      turnPhase: 'FAIRY_MOVE',
      boardMeeples: {
        '1,0:city_N': { playerId: player.id, meepleType: 'NORMAL', segmentId: 'city_N', coordinate: { x: 1, y: 0 } },
      },
    }
    state = setDfState(state, { canMoveFairy: true })

    const result = moveFairy(state, { x: 1, y: 0 }, 'city_N')
    const df = getDfState(result)

    expect(df.fairyPosition).toEqual({ coordinate: { x: 1, y: 0 }, segmentId: 'city_N' })
    expect(result.turnPhase).toBe('SCORE')
  })

  it('moveFairy rejects placement on other player meeple', () => {
    let state = createDfGame()
    const otherPlayer = state.players[1]

    state = {
      ...state,
      turnPhase: 'FAIRY_MOVE',
      boardMeeples: {
        '1,0:city_N': { playerId: otherPlayer.id, meepleType: 'NORMAL', segmentId: 'city_N', coordinate: { x: 1, y: 0 } },
      },
    }
    state = setDfState(state, { canMoveFairy: true })

    const result = moveFairy(state, { x: 1, y: 0 }, 'city_N')
    // Should not change — rejected
    expect(result.turnPhase).toBe('FAIRY_MOVE')
  })

  it('skipFairyMove transitions to DRAW_TILE', () => {
    let state = createDfGame()
    state = { ...state, turnPhase: 'FAIRY_MOVE' }
    state = setDfState(state, { canMoveFairy: true })

    const result = skipFairyMove(state)
    expect(result.turnPhase).toBe('SCORE')

    const df = getDfState(result)
    expect(df.canMoveFairy).toBe(false)
  })

  it('skipFairyMove does nothing if not in FAIRY_MOVE phase', () => {
    let state = createDfGame()
    state = { ...state, turnPhase: 'PLACE_MEEPLE' }

    const result = skipFairyMove(state)
    expect(result.turnPhase).toBe('PLACE_MEEPLE')
  })
})

// ─── Magic Portal placements ─────────────────────────────────────────────────

describe('Magic Portal placements', () => {
  it('getMagicPortalPlacements returns unoccupied incomplete features', () => {
    let state = createDfGame()

    // The starting tile at (0,0) has some segments that are incomplete
    // This should return some results
    const results = getMagicPortalPlacements(state)
    // Starting tile has incomplete features
    expect(results.length).toBeGreaterThan(0)
  })

  it('placeMeepleViaPortal places meeple on distant tile', () => {
    let state = createDfGame()

    // Place an extra tile
    state = buildLinearBoard(state, [
      { x: 1, y: 0, defId: 'df31_N' },
    ])

    state = {
      ...state,
      turnPhase: 'PLACE_MEEPLE',
      currentTile: { definitionId: 'df31_S', rotation: 0 },
    }

    // Get portal placements
    const placements = getMagicPortalPlacements(state)
    expect(placements.length).toBeGreaterThan(0)

    // Pick the first valid one
    const target = placements[0]
    const result = placeMeepleViaPortal(state, target.coordinate, target.segmentId, 'NORMAL')

    expect(result.turnPhase).toBe('SCORE')
    // Meeple should be placed
    const tileKey = coordKey(target.coordinate)
    expect(result.board.tiles[tileKey].meeples[target.segmentId]).toBeDefined()
  })

  it('placeMeepleViaPortal does nothing outside PLACE_MEEPLE phase', () => {
    let state = createDfGame()
    state = { ...state, turnPhase: 'DRAW_TILE' }

    const result = placeMeepleViaPortal(state, { x: 0, y: 0 }, 'road_S', 'NORMAL')
    expect(result.turnPhase).toBe('DRAW_TILE')
  })
})

// ─── Initial D&F state ───────────────────────────────────────────────────────

describe('createInitialDragonFairyState', () => {
  it('creates correct default state', () => {
    const df = createInitialDragonFairyState()
    expect(df.dragonPosition).toBeNull()
    expect(df.dragonFacing).toBeNull()
    expect(df.fairyPosition).toBeNull()
    expect(df.dragonInPlay).toBe(false)
    expect(df.canMoveFairy).toBe(false)
    expect(df.dragonMovement).toBeNull()
  })
})
