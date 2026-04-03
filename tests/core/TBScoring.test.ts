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

    it('successfully closes a city using tb31_S and base_D', () => {
        // S: Now has North=City, East=City, West=City, South=Road
        // Start tile (0,0) is base_D: North=City

        // Place S rotated 180 at (0, -1) so its North (now South) faces (0,0)North
        // No, that's confusing.
        // Let's place S at (0, -1) with 0 rotation. Its South is ROAD. 
        // Wait, start tile (0,0) north is CITY. 
        // So S at (0, -1) needs its SOUTH to be CITY.
        state = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'tb31_S', rotation: 90 }
        }
        state = placeTile(state, { x: 0, y: -1 })

        const rootStart = state.featureUnionFind.parent['0,0:city0']
        const rootS = state.featureUnionFind.parent['0,-1:city0']

        expect(rootS).toBe(rootStart)
    })

    it('verifies that isBuilderBonusTurn is cleared after the bonus turn ends', () => {
        // 1. Manually trigger a bonus turn
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
