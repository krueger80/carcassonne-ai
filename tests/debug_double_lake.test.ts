/**
 * Debug: reproduce double lake placement failure with realistic river layout
 */
import { describe, test, expect } from 'vitest'
import {
    isValidPlacement,
    findRiverOpenEnds,
    getAllPotentialRiverPlacements,
    isRiverPlacementAllowed,
    getRotatedOffset,
    getEdgeFeatures,
} from '../src/core/engine/TilePlacement'
import type { Board, Coordinate } from '../src/core/types/board'
import type { TileDefinition, TileInstance, Rotation } from '../src/core/types/tile'
import { DF_TILES } from '../src/core/data/dragonFairyTiles'
import { RIVER_C3_TILES } from '../src/core/data/riverTilesC3'

function coordKey(c: Coordinate) { return `${c.x},${c.y}` }
function makeTileMap(defs: TileDefinition[]): Record<string, TileDefinition> {
    const map: Record<string, TileDefinition> = {}
    for (const d of defs) map[d.id] = d
    return map
}

describe('Double Lake placement – realistic scenarios', () => {
    const allDefs = [...DF_TILES, ...RIVER_C3_TILES]
    const tileMap = makeTileMap(allDefs)

    function placeTile(board: Board, x: number, y: number, defId: string, rot: Rotation): Board {
        const def = tileMap[defId]
        board.tiles[coordKey({ x, y })] = {
            coordinate: { x, y },
            definitionId: defId,
            rotation: rot,
            meeples: {},
        }
        board.minX = Math.min(board.minX, x)
        board.maxX = Math.max(board.maxX, x)
        board.minY = Math.min(board.minY, y)
        board.maxY = Math.max(board.maxY, y)
        // Also place linked tiles
        if (def?.linkedTiles) {
            for (const lt of def.linkedTiles) {
                const off = getRotatedOffset(lt.dx, lt.dy, rot)
                const lx = x + off.dx, ly = y + off.dy
                board.tiles[coordKey({ x: lx, y: ly })] = {
                    coordinate: { x: lx, y: ly },
                    definitionId: lt.definitionId,
                    rotation: rot,
                    meeples: {},
                }
                board.minX = Math.min(board.minX, lx)
                board.maxX = Math.max(board.maxX, lx)
                board.minY = Math.min(board.minY, ly)
                board.maxY = Math.max(board.maxY, ly)
            }
        }
        return board
    }

    test('river with curves ending northward', () => {
        const board: Board = { tiles: {}, minX: 0, maxX: 0, minY: 0, maxY: 0 }

        // Place starting double source at (0,0) rot 0 — df31_A_right has linked df31_A_left at dx=-1
        // At rot 0, right has EAST_CENTER: river0, left has WEST_CENTER: river0
        placeTile(board, 0, 0, 'df31_A_right', 0)
        // Board now has (0,0)=df31_A_right, (-1,0)=df31_A_left

        // Place river_c3_E at (1,0) rot 0 — City N + River S→W curve
        // At rot 0: SOUTH_CENTER: river0, WEST_CENTER: river0
        // The WEST edge connects to (0,0) df31_A_right's EAST (river0)
        placeTile(board, 1, 0, 'river_c3_E', 0)

        // river_c3_J: River curve S→E at (1,1) rot ??
        // At rot 0: SOUTH_CENTER: river0, EAST_CENTER: river0
        // We need to connect to river_c3_E from the south: tile at (1,0) has SOUTH = river
        // So (1,1) needs NORTH = river. river_c3_J at rot 0 has S and E river edges.
        // We need N river. Try rot 180: S→N, E→W. So N_CENTER and W_CENTER = river.
        // That connects NORTH of (1,1) to SOUTH of (1,0) ✓ 
        placeTile(board, 1, 1, 'river_c3_J', 180)

        // Now open end should be at WEST of (1,1) which is (0,1)
        const openEnds1 = findRiverOpenEnds(board, tileMap)
        console.log('After 3 tiles, open ends:', Array.from(openEnds1))

        // Place straight river at (0,1) going W→... hmm let me think about this
        // river_c3_D (Cloister + River N→S): NORTH_CENTER: river, SOUTH_CENTER: river
        // We need river on EAST to connect to (1,1).WEST_CENTER
        // river_c3_D rot 90: N→E, S→W. So EAST_CENTER: river, WEST_CENTER: river
        // Actually just use river_c3_F (straight N→S)
        // rot 90: EAST and WEST are river
        placeTile(board, 0, 1, 'river_c3_F', 90)

        // Open end should be at (-1,1) now
        const openEnds2 = findRiverOpenEnds(board, tileMap)
        console.log('After 4 tiles, open ends:', Array.from(openEnds2))

        // Place another straight going north at (-1,1)
        // river_c3_F rot 0 has N and S river
        // We need EAST river at (-1,1) to connect to (0,1).WEST
        // river_c3_F rot 90 has E and W river
        placeTile(board, -1, 1, 'river_c3_F', 90)

        // Open end at (-2,1)
        // Place curve going south instead of north: 
        // We need EAST river at (-2,1) to connect to (-1,1) WEST (river)
        // We want open end to go SOUTH to (-2,2)
        // river_c3_J at rot 90: SOUTH and WEST.
        // rot 0: EAST and SOUTH.
        placeTile(board, -2, 1, 'river_c3_J', 0)

        const openEnds3 = findRiverOpenEnds(board, tileMap)
        console.log('After 6 tiles, open ends:', Array.from(openEnds3))

        // Now try to place double lake at the open end (-2,2)
        const doubleLakeDef = tileMap['df31_B_front_bottom']
        const inst: TileInstance = { definitionId: 'df31_B_front_bottom', rotation: 0 }

        const placements = getAllPotentialRiverPlacements(board, tileMap, inst, null)
        console.log('\nDouble lake valid placements:', placements)

        // If empty, show why each attempt fails
        if (placements.length === 0) {
            console.log('\n=== DETAILED FAILURE ANALYSIS ===')
            for (const key of openEnds3) {
                const [cx, cy] = key.split(',').map(Number)
                for (const rot of [0, 90, 180, 270] as Rotation[]) {
                    const testInst = { ...inst, rotation: rot }
                    const offsets = [{ dx: 0, dy: 0 }]
                    if (doubleLakeDef.linkedTiles) {
                        for (const lt of doubleLakeDef.linkedTiles) {
                            offsets.push(getRotatedOffset(lt.dx, lt.dy, rot))
                        }
                    }
                    for (const off of offsets) {
                        const testCoord = { x: cx - off.dx, y: cy - off.dy }
                        const valid = isValidPlacement(board, tileMap, testInst, testCoord)
                        const riverOk = isRiverPlacementAllowed(board, tileMap, testInst, testCoord, null)
                        if (!valid || !riverOk) {
                            const reason = !valid ? 'BAD_PLACEMENT' : 'U-TURN_REJECTED'
                            console.log(`REJECTED (${reason}): openEnd=(${cx},${cy}) rot=${rot} off=(${off.dx},${off.dy}) root@(${testCoord.x},${testCoord.y})`)
                        }
                    }
                }
            }
        }

        expect(placements.length).toBeGreaterThan(0)
    })

    test('simple river going north, then try double lake', () => {
        // Simplest case: source → straight → straight → double lake
        const board: Board = { tiles: {}, minX: 0, maxX: 0, minY: 0, maxY: 0 }

        // Source (river_c3_A) at (0,0): only SOUTH_CENTER is river
        placeTile(board, 0, 0, 'river_c3_A', 0)

        // Straight at (0,1): N and S are river  
        placeTile(board, 0, 1, 'river_c3_F', 0)

        // Straight at (0,2)
        placeTile(board, 0, 2, 'river_c3_F', 0)

        const openEnds = findRiverOpenEnds(board, tileMap)
        console.log('\nSimple river open ends:', Array.from(openEnds))

        const inst: TileInstance = { definitionId: 'df31_B_front_bottom', rotation: 0 }
        const placements = getAllPotentialRiverPlacements(board, tileMap, inst, null)
        console.log('Simple river: double lake placements:', placements)

        expect(placements.length).toBeGreaterThan(0)
    })

    test('river ending east, double lake at end', () => {
        const board: Board = { tiles: {}, minX: 0, maxX: 0, minY: 0, maxY: 0 }

        // Source at (0,0): SOUTH river
        placeTile(board, 0, 0, 'river_c3_A', 0)

        // Curve at (0,1): river_c3_J rot 0 has S and E river
        // We need NORTH river to connect. rot 180: N and W river
        placeTile(board, 0, 1, 'river_c3_J', 180)

        // Straight going WEST from (0,1) → at (-1,1) with E-W river
        placeTile(board, -1, 1, 'river_c3_F', 90)

        const openEnds = findRiverOpenEnds(board, tileMap)
        console.log('\nEast-ending river open ends:', Array.from(openEnds))

        const inst: TileInstance = { definitionId: 'df31_B_front_bottom', rotation: 0 }
        const placements = getAllPotentialRiverPlacements(board, tileMap, inst, null)
        console.log('East-ending river: double lake placements:', placements)

        expect(placements.length).toBeGreaterThan(0)
    })

    test('with starting double source, river going east then south', () => {
        const board: Board = { tiles: {}, minX: 0, maxX: 0, minY: 0, maxY: 0 }

        // Double source: df31_A_right at (0,0), linked df31_A_left at (-1,0) 
        placeTile(board, 0, 0, 'df31_A_right', 0)

        // Check: right has EAST=river, left has WEST=river
        console.log('\nSource right EAST:', getEdgeFeatures(tileMap['df31_A_right'], 0, 'EAST'))
        console.log('Source left WEST:', getEdgeFeatures(tileMap['df31_A_left'], 0, 'WEST'))

        // Straight going E-W at (1,0)
        placeTile(board, 1, 0, 'river_c3_F', 90) // rot 90: E and W river

        // Curve S→E at (2,0): river_c3_J rot 0 has S and E river
        // We need WEST river to connect. rot 90: W and S river
        placeTile(board, 2, 0, 'river_c3_J', 90)

        // Straight N→S at (2,1)
        placeTile(board, 2, 1, 'river_c3_F', 0) // N and S river

        const openEnds = findRiverOpenEnds(board, tileMap)
        console.log('Double source + E→S open ends:', Array.from(openEnds))

        const inst: TileInstance = { definitionId: 'df31_B_front_bottom', rotation: 0 }
        const placements = getAllPotentialRiverPlacements(board, tileMap, inst, null)
        console.log('Double source placements:', placements)

        expect(placements.length).toBeGreaterThan(0)
    })
})
