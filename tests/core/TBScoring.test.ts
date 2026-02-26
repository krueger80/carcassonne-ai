import { describe, it, expect, beforeEach } from 'vitest'
import {
    initGame,
    placeTile,
    endTurn,
} from '../../src/core/engine/GameEngine.ts'
import type { GameState } from '../../src/core/types/game.ts'
import { coordKey } from '../../src/core/types/board.ts'

describe('Traders & Builders C3.1 Scoring Verification', () => {
    let state: GameState

    beforeEach(() => {
        state = initGame({
            playerNames: ['Alice', 'Bob'],
            expansionSelections: [
                { id: 'traders-builders', rulesVersion: 'modern', tileEdition: 'C3.1' }
            ]
        })
    })

    it('successfully closes a city using corrected tb31_E and tb31_Q', () => {
        // Tile E: Now has North=City, East=City, West=City
        // Tile Q: Now has all 4 sides = City

        // Start tile (0,0) is base_D: N=City, S=Road, E=Field, W=Field

        // Place Q at (0, -1) - Should connect to (0,0)North if SOUTH of Q is city
        // Q is 4-way city, so it connects to everything.

        state = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'tb31_Q', rotation: 0 }
        }
        state = placeTile(state, { x: 0, y: -1 })
        if (!state.board.tiles[coordKey({ x: 0, y: -1 })]) {
            throw new Error('Placement of Q at (0,-1) failed')
        }

        // Now place E at (0, -2) - Should connect to Q at (0, -1) if SOUTH of E is city
        // E rotated 180 has physical South = Logical North = City
        state = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'tb31_E', rotation: 180 }
        }
        state = placeTile(state, { x: 0, y: -2 })
        if (!state.board.tiles[coordKey({ x: 0, y: -2 })]) {
            throw new Error('Placement of E at (0,-2) failed')
        }

        // Check if the city feature is connected
        const root0 = state.featureUnionFind.parent['0,0:city0']
        const root1 = state.featureUnionFind.parent['0,-1:city0']
        const root2 = state.featureUnionFind.parent['0,-2:city0']

        expect(root0).toBeDefined()
        expect(root1).toBe(root0)
        expect(root2).toBe(root0)
    })

    it('successfully closes a city using tb31_S and base_D', () => {
        // S: Now has North=City, East=City, West=City, South=Road
        // Start tile (0,0) is base_D: North=City

        // Place S rotated 180 at (0, -1) so its North (now South) faces (0,0)North
        // No, that's confusing.
        // Let's place S at (0, -1) with 0 rotation. Its South is ROAD. 
        // Wait, start tile (0,0) north is CITY. 
        // So S at (0, -1) needs its SOUTH to be CITY.
        // S rotated 180: Logical North becomes South. Logical North is CITY.

        state = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'tb31_S', rotation: 180 }
        }
        state = placeTile(state, { x: 0, y: -1 })

        const rootStart = state.featureUnionFind.parent['0,0:city0']
        const rootS = state.featureUnionFind.parent['0,-1:city0']

        expect(rootS).toBe(rootStart)
    })

    it('verifies that isBuilderBonusTurn is cleared after the bonus turn ends', () => {
        // 1. Manually trigger a bonus turn
        const p1Id = state.players[0].id
        state.expansionData['tradersBuilders'] = {
            isBuilderBonusTurn: true,
            pendingBuilderBonus: false,
            useModernTerminology: true
        }
        state.currentPlayerIndex = 0
        state.turnPhase = 'PLACE_TILE'
        state.currentTile = { definitionId: 'base2_U', rotation: 0 }

        // 2. Place tile
        state = placeTile(state, { x: 1, y: 0 })

        // 3. Skip meeple and end turn
        state.turnPhase = 'SCORE'
        state = endTurn(state)

        // 4. Expect to be player 2's turn (Bob) and bonus turn cleared
        expect(state.currentPlayerIndex).toBe(1)
        const tbData = state.expansionData['tradersBuilders'] as any
        expect(tbData.isBuilderBonusTurn).toBe(false)
        expect(tbData.pendingBuilderBonus).toBe(false)
    })
})
