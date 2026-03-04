import { describe, it, expect } from 'vitest'
import { initGame, placeTile, isValidPlacement } from '../../src/core/engine/GameEngine.ts'
import { getRotatedOffset } from '../../src/core/engine/TilePlacement.ts'
import type { GameState } from '../../src/core/types/game.ts'
import { coordKey } from '../../src/core/types/board.ts'

describe('Dragon & Fairy River integration', () => {
    it('initializes with Double Source as starting tile when both expansions are active', () => {
        const state = initGame({
            playerNames: ['Alice', 'Bob'],
            expansions: ['dragon-fairy-c31', 'river-c3'],
        })

        const startTile = state.board.tiles[coordKey({ x: 0, y: 0 })]
        expect(startTile.definitionId).toBe('df31_A_right')

        // Check linked tile (part of compound tile)
        const linkedTile = state.board.tiles[coordKey({ x: -1, y: 0 })]
        expect(linkedTile).toBeDefined()
        expect(linkedTile?.definitionId).toBe('df31_A_left')

        // Ensure Double Lake is NOT marked available for a generic UI action (since it's in the bag)
        const dfData = state.expansionData['dragonFairy'] as any
        expect(dfData.doubleLakeAvailable).toBe(false)

        // Ensure the Double Lake is the LAST tile in the river bag
        const riverBag = (state.expansionData['river'] as any).bag
        const lastRiverTile = riverBag[riverBag.length - 1]
        expect(lastRiverTile.definitionId).toBe('df31_B_front_bottom')
    })

    it('validates and applies placement for a compound tile (Double Lake)', () => {
        const state = initGame({
            playerNames: ['Alice', 'Bob'],
            expansions: ['dragon-fairy-c31', 'river-c3'],
        })

        const stateWithTile: GameState = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'df31_B_front_bottom', rotation: 0 }
        }

        let placement: { coordinate: any, rotation: any } | null = null
        for (const dir of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
            for (let r = 0; r < 360; r += 90) {
                if (isValidPlacement(stateWithTile.board, stateWithTile.staticTileMap, { ...stateWithTile.currentTile!, rotation: r as any }, dir)) {
                    placement = { coordinate: dir, rotation: r }
                    break
                }
            }
            if (placement) break
        }

        expect(placement).toBeDefined()
        const stateWithTileRotated: GameState = {
            ...stateWithTile,
            currentTile: { ...stateWithTile.currentTile!, rotation: placement!.rotation }
        }

        const nextState = placeTile(stateWithTileRotated, placement!.coordinate)

        // Check if both pieces are placed
        const coordKeyStr = coordKey(placement!.coordinate)
        expect(nextState.board.tiles[coordKeyStr]).toBeDefined()
        expect(nextState.board.tiles[coordKeyStr].definitionId).toBe('df31_B_front_bottom')

        const topCoord = getRotatedOffset(0, -1, placement!.rotation)
        const topCoordActual = { x: placement!.coordinate.x + topCoord.dx, y: placement!.coordinate.y + topCoord.dy }
        const topCoordStr = coordKey(topCoordActual)

        expect(nextState.board.tiles[topCoordStr]).toBeDefined()
        expect(nextState.board.tiles[topCoordStr].definitionId).toBe('df31_B_front_top')
    })

    it('triggers Dragon Orient phase when Double Lake (Volcano) is placed', () => {
        const state = initGame({
            playerNames: ['Alice', 'Bob'],
            expansions: ['dragon-fairy-c31', 'river-c3'],
        })

        const stateWithTile: GameState = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'df31_B_front_bottom', rotation: 0 }
        }

        let placement: { coordinate: any, rotation: any } | null = null
        for (const dir of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
            for (let r = 0; r < 360; r += 90) {
                if (isValidPlacement(stateWithTile.board, stateWithTile.staticTileMap, { ...stateWithTile.currentTile!, rotation: r as any }, dir)) {
                    placement = { coordinate: dir, rotation: r }
                    break
                }
            }
            if (placement) break
        }

        const stateWithTileRotated: GameState = {
            ...stateWithTile,
            currentTile: { ...stateWithTile.currentTile!, rotation: placement!.rotation }
        }

        const nextState = placeTile(stateWithTileRotated, placement!.coordinate)

        // Should transition to DRAGON_ORIENT because df31_B_front_bottom is a Dragon Hoard
        expect(nextState.turnPhase).toBe('DRAGON_ORIENT')
        const dfData = nextState.expansionData['dragonFairy'] as any
        expect(dfData.dragonPosition).toEqual(placement!.coordinate)
        expect(dfData.dragonInPlay).toBe(true)
    })
})
