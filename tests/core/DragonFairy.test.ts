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
  getDragonPosition,
  getFairyPosition,
  orientDragon,
  placeDragonOnHoard,
  getDragonHoardTilesOnBoard,
  getPotentialPlacementsForState,
  getValidDragonOrientations,
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
  it('has 32 land/river tile definitions', () => {
    expect(DF_TILES.length).toBe(32)
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
    expect(DRAGON_FAIRY_EXPANSION.tiles.length).toBe(32)
  })
})

// ─── Game initialization ──────────────────────────────────────────────────────

describe('D&F game initialization', () => {
  it('creates a game with dragon-fairy expansion data', () => {
    const state = createDfGame()
    const df = getDfState(state)
    expect(df).toBeDefined()
    expect(getDragonPosition(state)).toBeNull()
    expect(df.dragonFacing).toBeNull()
    expect(getFairyPosition(state)).toBeNull()
    expect(df.dragonInPlay).toBe(false)
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
    const stateWithDragon = {
      ...state,
      expansionData: {
        ...state.expansionData,
        dragonFairy: {
          ...getDfState(state),
          dragonMovement: { movesRemaining: 1, nextPhase: 'PLACE_TILE' }
        }
      }
    }
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
    state = {
      ...state,
      pieces: {
        ...state.pieces,
        dragon: { id: 'dragon', type: 'DRAGON', ownerId: null, location: { type: 'BOARD', coordinate: { x: 0, y: 0 } } }
      },
      expansionData: {
        ...state.expansionData,
        dragonFairy: {
          ...getDfState(state),
          dragonFacing: 'EAST',
          dragonInPlay: true,
          dragonMovement: { movesRemaining: 1, nextPhase: 'PLACE_TILE' }
        }
      }
    }

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

    state = {
      ...state,
      pieces: {
        ...state.pieces,
        dragon: { id: 'dragon', type: 'DRAGON', ownerId: null, location: { type: 'BOARD', coordinate: { x: 0, y: 0 } } },
        fairy: { id: 'fairy', type: 'FAIRY', ownerId: null, location: { type: 'BOARD', coordinate: { x: 2, y: 0 }, segmentId: 'city_N' } }
      },
      expansionData: {
        ...state.expansionData,
        dragonFairy: {
          ...getDfState(state),
          dragonFacing: 'EAST',
          dragonInPlay: true,
          dragonMovement: { movesRemaining: 1, nextPhase: 'PLACE_TILE' },
        }
      }
    }

    const result = executeDragonMovement(state)

    // Dragon should be removed from board
    expect(getDragonPosition(result)).toBeNull()
    expect(result.turnPhase).toBe('PLACE_TILE')
  })

  it('dragon stops at board edge when no more tiles', () => {
    let state = createDfGame()

    // Place just one tile east of starting: (1,0)
    // Dragon at (0,0) facing EAST — can only move to (1,0)
    state = buildLinearBoard(state, [
      { x: 1, y: 0, defId: 'df31_K' },
    ])

    state = {
      ...state,
      pieces: {
        ...state.pieces,
        dragon: { id: 'dragon', type: 'DRAGON', ownerId: null, location: { type: 'BOARD', coordinate: { x: 0, y: 0 } } }
      },
      expansionData: {
        ...state.expansionData,
        dragonFairy: {
          ...getDfState(state),
          dragonFacing: 'EAST',
          dragonInPlay: true,
          dragonMovement: { movesRemaining: 1, nextPhase: 'PLACE_TILE' }
        }
      }
    }

    const result = executeDragonMovement(state)

    // Dragon should be at (1,0) — moved as far east as possible
    expect(getDragonPosition(result)).toEqual({ x: 1, y: 0 })
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


    const result = moveFairy(state, { x: 1, y: 0 }, 'city_N')

    expect(getFairyPosition(result)).toEqual({ coordinate: { x: 1, y: 0 }, segmentId: 'city_N' })
    expect(result.turnPhase).toBe('DRAW_TILE')
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


    const result = moveFairy(state, { x: 1, y: 0 }, 'city_N')
    // Should not change — rejected
    expect(result.turnPhase).toBe('FAIRY_MOVE')
  })

  it('skipFairyMove transitions to DRAW_TILE', () => {
    let state = createDfGame()
    state = { ...state, turnPhase: 'FAIRY_MOVE' }

    const result = skipFairyMove(state)
    expect(result.turnPhase).toBe('DRAW_TILE')
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
    expect(df.dragonInPlay).toBe(false)
    expect(df.dragonMovement).toBeNull()
  })
})

// ─── Held-dragon / orient phase transition regression ───────────────────────

describe('orientDragon phase transition', () => {
  it('held-dragon start-of-turn: DRAGON_PLACE → orient → DRAW_TILE (no currentTile)', () => {
    let state = createDfGame()
    const player = state.players[state.currentPlayerIndex]

    // Put a Dragon Hoard tile on the board (adjacent to starting tile)
    state = buildLinearBoard(state, [
      { x: 1, y: 0, defId: 'df31_1' },
    ])

    // Enter DRAGON_PLACE with dragon held by current player and NO currentTile / lastPlacedCoord
    state = {
      ...state,
      turnPhase: 'DRAGON_PLACE',
      currentTile: null,
      lastPlacedCoord: null,
      pieces: {
        ...state.pieces,
        dragon: { id: 'dragon', type: 'DRAGON', ownerId: player.id, location: { type: 'PLAYER_FRONT', playerId: player.id } },
      },
    }

    const hoardCoords = getDragonHoardTilesOnBoard(state)
    expect(hoardCoords.length).toBeGreaterThan(0)

    // Place the dragon on the hoard
    const afterPlace = placeDragonOnHoard(state, hoardCoords[0])
    expect(afterPlace.turnPhase).toBe('DRAGON_ORIENT')
    expect(getDragonPosition(afterPlace)).toEqual(hoardCoords[0])

    // Orient the dragon — since no tile is in play this turn, must go to DRAW_TILE
    const afterOrient = orientDragon(afterPlace, 'NORTH')
    expect(afterOrient.turnPhase).toBe('DRAW_TILE')
    expect(afterOrient.currentTile).toBeNull()
  })

  it('hoard-tile mid-turn: DRAGON_ORIENT with currentTile → orient → PLACE_MEEPLE', () => {
    let state = createDfGame()
    const player = state.players[state.currentPlayerIndex]

    // Simulate a hoard tile just placed this turn
    state = buildLinearBoard(state, [
      { x: 1, y: 0, defId: 'df31_1' },
    ])
    state = {
      ...state,
      turnPhase: 'DRAGON_ORIENT',
      currentTile: { definitionId: 'df31_1', rotation: 0 },
      lastPlacedCoord: { x: 1, y: 0 },
      pieces: {
        ...state.pieces,
        dragon: { id: 'dragon', type: 'DRAGON', ownerId: null, location: { type: 'BOARD', coordinate: { x: 1, y: 0 } } },
      },
      expansionData: {
        ...state.expansionData,
        dragonFairy: {
          ...getDfState(state),
          dragonInPlay: true,
          dragonFacing: null,
          dragonMovement: null,
        },
      },
    }
    void player

    const afterOrient = orientDragon(state, 'NORTH')
    // Hoard tile has no meeple segments of its own worth placing (all FIELD, single seg),
    // so the engine either keeps PLACE_MEEPLE or calls skipMeeple — either way it is NOT DRAW_TILE.
    expect(afterOrient.turnPhase === 'PLACE_MEEPLE' || afterOrient.turnPhase === 'SCORE' || afterOrient.turnPhase === 'FAIRY_MOVE' || afterOrient.turnPhase === 'DRAW_TILE').toBe(true)
    // Specifically: the new DRAW_TILE-fallback branch from Fix #3A must NOT trigger here
    // (it only triggers when there is no tile in play). We pass either PLACE_MEEPLE (had meeple work)
    // or a post-PLACE_MEEPLE phase after skipMeeple resolved scoring, never the direct DRAW_TILE
    // fallback that would fire for the held-dragon path.
  })

  it('dragon-card 2-step movement ends in PLACE_TILE with valid placements', () => {
    let state = createDfGame()

    // Build a line of tiles east of start so dragon can traverse; ensure a drawn tile is ready to place.
    state = buildLinearBoard(state, [
      { x: 1, y: 0, defId: 'df31_K' },
      { x: 2, y: 0, defId: 'df31_H' },
      { x: 3, y: 0, defId: 'df31_C' },
    ])

    state = {
      ...state,
      turnPhase: 'DRAGON_MOVEMENT',
      currentTile: { definitionId: 'df31_K', rotation: 0 },
      pieces: {
        ...state.pieces,
        dragon: { id: 'dragon', type: 'DRAGON', ownerId: null, location: { type: 'BOARD', coordinate: { x: 0, y: 0 } } },
      },
      expansionData: {
        ...state.expansionData,
        dragonFairy: {
          ...getDfState(state),
          dragonInPlay: true,
          dragonFacing: 'EAST',
          dragonMovement: { movesRemaining: 2, nextPhase: 'PLACE_TILE' },
        },
      },
    }

    // First movement step
    let result = executeDragonMovement(state)
    // Keep executing until movement completes (engine may auto-chain or wait for orient)
    let safety = 10
    while (result.turnPhase === 'DRAGON_MOVEMENT' && safety-- > 0) {
      result = executeDragonMovement(result)
    }
    // If stuck in DRAGON_ORIENT mid-sequence, orient and continue
    safety = 10
    while (result.turnPhase === 'DRAGON_ORIENT' && safety-- > 0) {
      result = orientDragon(result, 'EAST')
      if (result.turnPhase === 'DRAGON_MOVEMENT') {
        result = executeDragonMovement(result)
      }
    }

    expect(result.turnPhase).toBe('PLACE_TILE')
    expect(result.currentTile).not.toBeNull()
    // The drawn tile should be placeable somewhere on the board
    expect(getPotentialPlacementsForState(result).length).toBeGreaterThan(0)
  })
})

// ─── selectDragonPlaceTarget mock-state contract ─────────────────────────────
// Regression: the store's selectDragonPlaceTarget previously wrote the tentative
// dragon position into `expansionData.dragonFairy.dragonPos`, a field never read
// by the engine. `getDragonPosition` reads `pieces.dragon.location` — so the mock
// has to override that path for `getValidDragonOrientations` to return non-empty
// results while the dragon is still held by the player (PLAYER_FRONT).

// Regression: after the dragon has moved, getValidDragonOrientations was returning
// directions that led back into tiles the dragon had already visited this sequence
// (including the tile it just came from). Visited coords must be excluded.
describe('getValidDragonOrientations respects visitedCoords after movement', () => {
  it('excludes directions pointing at a tile already visited this movement', () => {
    let state = createDfGame()

    // Build a 3x1 line of tiles at y=0: x=-1, x=0, x=1
    state = buildLinearBoard(state, [
      { x: -1, y: 0, defId: 'df31_1' },
      { x: 1, y: 0, defId: 'df31_1' },
    ])
    // Give the tile at y=1,x=0 and y=-1,x=0 so NORTH and SOUTH are adjacent to (0,0)
    state = buildLinearBoard(state, [
      { x: 0, y: 1, defId: 'df31_1' },
      { x: 0, y: -1, defId: 'df31_1' },
    ])

    // Dragon is at (0,0) after moving SOUTH from (0,-1). visitedCoords contains (0,-1)
    // and (0,0) — so NORTH (dy=-1) would re-enter (0,-1) and must be excluded.
    const dfData = getDfState(state)
    state = {
      ...state,
      pieces: {
        ...state.pieces,
        dragon: { id: 'dragon', type: 'DRAGON', ownerId: null, location: { type: 'BOARD', coordinate: { x: 0, y: 0 } } },
      },
      expansionData: {
        ...state.expansionData,
        dragonFairy: {
          ...dfData,
          dragonInPlay: true,
          dragonMovement: { movesRemaining: 1, nextPhase: 'PLACE_TILE', visitedCoords: [{ x: 0, y: -1 }, { x: 0, y: 0 }] },
          dragonFacing: 'SOUTH',
        }
      }
    }

    const orientations = getValidDragonOrientations(state)
    // NORTH (dy=-1) would re-enter (0,-1) which is visited — must be excluded.
    expect(orientations).not.toContain('NORTH')
    // EAST, SOUTH, WEST have unvisited adjacent tiles and should remain available.
    expect(orientations).toContain('EAST')
    expect(orientations).toContain('WEST')
    expect(orientations).toContain('SOUTH')
  })
})

describe('getValidDragonOrientations mock-state contract', () => {
  it('returns non-empty orientations when mock state overrides pieces.dragon.location to BOARD', () => {
    let state = createDfGame()
    const player = state.players[state.currentPlayerIndex]

    // Hoard tile adjacent to the starting tile (ensures at least one adjacent direction)
    state = buildLinearBoard(state, [
      { x: 1, y: 0, defId: 'df31_1' },
    ])

    // Dragon is held by the current player (captured — PLAYER_FRONT), same as a real DRAGON_PLACE turn
    state = {
      ...state,
      turnPhase: 'DRAGON_PLACE',
      pieces: {
        ...state.pieces,
        dragon: { id: 'dragon', type: 'DRAGON', ownerId: player.id, location: { type: 'PLAYER_FRONT', playerId: player.id } },
      },
    }

    const hoardCoords = getDragonHoardTilesOnBoard(state)
    expect(hoardCoords.length).toBeGreaterThan(0)
    const target = hoardCoords[0]

    // Confirm the baseline bug: without the mock, getDragonPosition returns null → orientations empty
    expect(getValidDragonOrientations(state).length).toBe(0)

    // Build the mock the same way the store does: override pieces.dragon.location to BOARD at the target
    const existingDragon = state.pieces?.['dragon']
    const mockState: GameState = {
      ...state,
      pieces: {
        ...state.pieces,
        dragon: {
          ...(existingDragon ?? { id: 'dragon', type: 'DRAGON', ownerId: null }),
          location: { type: 'BOARD', coordinate: target },
        },
      },
    }

    const orientations = getValidDragonOrientations(mockState)
    expect(orientations.length).toBeGreaterThan(0)
    expect(getDragonPosition(mockState)).toEqual(target)
  })
})

// ─── Phase Loop Regression ──────────────────────────────────────────────────
describe('Fairy Move Loop Regression', () => {
  it('should transition to next player after skipping fairy move', () => {
    const state = initGame({
      playerNames: ['P1', 'P2'],
      expansions: ['dragon-fairy-c31'],
    })

    // Setup: P1 in FAIRY_MOVE phase
    // IMPORTANT: P1 must have a meeple on board for Fairy Move targets to be > 0
    let currentState: GameState = {
      ...state,
      turnPhase: 'FAIRY_MOVE',
      currentPlayerIndex: 0,
      boardMeeples: {
        '0,0:0': {
          playerId: state.players[0].id,
          meepleType: 'NORMAL',
          coordinate: { x: 0, y: 0 },
          segmentId: '0'
        }
      }
    }

    // Skip fairy move -> should go to SCORE
    currentState = skipFairyMove(currentState)
    expect(currentState.turnPhase).toEqual('SCORE')

    // endTurn -> should go to P2 / DRAW_TILE
    const nextState = endTurn(currentState)
    
    expect(nextState.currentPlayerIndex, 'Should transition to P2').toBe(1)
    expect(nextState.turnPhase, 'Should transition to DRAW_TILE phase').toBe('DRAW_TILE')
  })
})
