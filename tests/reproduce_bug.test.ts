import { describe, it, expect } from 'vitest'
import {
    initGame,
    placeTile,
    placeMeeple,
    endTurn
} from '../src/core/engine/GameEngine.ts'
import { getPlaceableSegments } from '../src/core/engine/MeeplePlacement.ts'

describe('Meeple Placement Bug Reproduction', () => {
    it('should not allow placing a meeple on a city occupied by a meeple and a builder', () => {
        // 1. Initialize game with Alice and Bob
        let state = initGame({
            playerNames: ['Alice', 'Bob'],
            expansionSelections: [
                { id: 'traders-builders', rulesVersion: 'modern', tileEdition: 'C3.1' }
            ]
        })

        // Alice's turn
        // Alice places tb31_O at (-1, 0) rotated to connect city to (0,0)
        // tb31_O has city on North and West (original). 
        // We want it to have city on East to connect to (0,0) city.
        // Rotation 270: North -> East, West -> North. Correct.
        state = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'tb31_O', rotation: 270 }
        }
        state = placeTile(state, { x: -1, y: 0 })

        // Alice places NORMAL + BUILDER on city0
        state = placeMeeple(state, 'city0', 'NORMAL', 'BUILDER')
        state = endTurn(state)

        // Bob's turn
        // Bob draws tb31_W and wants to place it at (-2, 0)
        // tb31_O (-1,0) has city on North (from West) and East (from North).
        // Wait, if rotated 270, original West is now North.
        // So city is on North and East.
        // If Bob places at (-2, 0), it connects to (-1, 0) West edge.
        // But (-1, 0) West edge is now original South edge?
        // Original tb31_O: N=city, W=city, S=road, E=road.
        // 270 rotation: N=W=city, E=N=city, S=E=road, W=S=road.
        // So West edge of rotated tb31_O is road.

        // Let's try rotation 90:
        // North -> East
        // West -> North
        // Wait, rotation 90 is North -> East? No, North -> East is 90.
        // North -> East (90), East -> South (90), South -> West (90), West -> North (90).

        // Original tb31_O: N=city, W=city.
        // Rotation 90: N(was W) = city, E(was N) = city.
        // Rotation 180: E(was W) = city, S(was N) = city.
        // Rotation 270: S(was W) = city, W(was N) = city.

        // OK, Alice places tb31_O at (0, 1) rotated 0 (N=city, W=city)
        // Start tile (0,0) has city on North.
        // So (0,1) South edge connects to (0,0) North edge.
        // But (0,1) South edge is road/field.

        // Start tile (0,0) is base2_D (City on North).
        // Alice places tb31_O at (0, -1) rotated 180.
        // Original N=city, W=city.
        // 180: S(was N)=city, E(was W)=city.
        // So (0,-1) connects South city to (0,0) North city. Correct.
        state = initGame({
            playerNames: ['Alice', 'Bob'],
            expansionSelections: [
                { id: 'traders-builders', rulesVersion: 'modern', tileEdition: 'C3.1' }
            ]
        })
        state = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'tb31_O', rotation: 180 }
        }
        state = placeTile(state, { x: 0, y: -1 })
        state = placeMeeple(state, 'city0', 'NORMAL', 'BUILDER')
        state = endTurn(state)

        // Bob's turn
        // Bob draws tb31_W and places it at (1, -1)
        // (0,-1) has city on South and East.
        // (1,-1) connects its West edge to (0,-1) East edge.
        // tb31_W (original N=city, W=city).
        // If rotation 0, its West edge is city. Correct.
        state = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'tb31_W', rotation: 0 }
        }
        state = placeTile(state, { x: 1, y: -1 })

        // Check if Bob can place meeple on city0 of (1, -1)
        const bobPlayer = state.players[state.currentPlayerIndex]
        const placeableSegments = getPlaceableSegments(
            state.featureUnionFind,
            state.staticTileMap,
            state.board,
            { x: 1, y: -1 },
            bobPlayer
        )

        console.log('Placeable segments for Bob:', placeableSegments)

        expect(placeableSegments).not.toContain('city0')
    })
})
