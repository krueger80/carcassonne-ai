import { describe, it, expect, beforeEach } from 'vitest'
import {
    initGame,
    placeTile,
    placeMeeple,
    endTurn,
    resolveFarmerReturn,
    scoreFeatureCompletion,
} from '../../src/core/engine/GameEngine.ts'
import type { GameState } from '../../src/core/types/game.ts'

describe('Traders & Builders C3.1 Edition', () => {
    let state: GameState

    beforeEach(() => {
        state = initGame({
            playerNames: ['Alice', 'Bob'],
            expansionSelections: [
                { id: 'traders-builders', rulesVersion: 'modern', tileEdition: 'C3.1' }
            ]
        })
    })

    it('allows simultaneous placement of normal meeple and builder on a newly placed tile', () => {
        // 1. Draw a tile that has a road
        // We artificially set the current tile to one with a road
        state = {
            ...state,
            turnPhase: 'PLACE_TILE',
            currentTile: { definitionId: 'base2_U', rotation: 90 }
        }

        // 2. Place the tile adjacent to start (0,0 is D city, EAST is ROAD)
        state = placeTile(state, { x: 1, y: 0 })
        expect(state.turnPhase).toBe('PLACE_MEEPLE')

        // 3. Place normal meeple + builder
        // Segment 'road1' connects NORTH to SOUTH on base_U
        const tileDef = state.staticTileMap['base2_U']
        const roadSegment = tileDef!.segments.find(s => s.type === 'ROAD')!.id

        state = placeMeeple(state, roadSegment, 'NORMAL', 'BUILDER')

        expect(state.players[0].meeples.available.NORMAL).toBe(6) // 7 - 1
        expect(state.players[0].meeples.available.BUILDER).toBe(0) // 1 - 1
        expect(state.players[0].meeples.onBoard).toContain(`1,0:${roadSegment}`)
        expect(state.players[0].meeples.onBoard).toContain(`1,0:${roadSegment}_BUILDER`)
    })

    it('triggers an immediate builder return and grants a double turn when builder feature is extended', () => {
        // Force P1 to have a builder on the start tile's road
        state.turnPhase = 'PLACE_TILE'
        state.currentTile = { definitionId: 'base2_U', rotation: 90 }

        // Fake putting a builder on the start tile (0,0) road
        const startTileDef = state.staticTileMap[state.board.tiles['0,0']!.definitionId]
        const startRoadSegment = startTileDef!.segments.find(s => s.type === 'ROAD')!.id
        const p1Id = state.players[0].id
        state.players[0].meeples.available.NORMAL -= 1
        state.players[0].meeples.available.BUILDER -= 1
        state.players[0].meeples.onBoard.push(`0,0:${startRoadSegment}`)
        state.players[0].meeples.onBoard.push(`0,0:${startRoadSegment}_BUILDER`)

        state.boardMeeples[`0,0:${startRoadSegment}`] = {
            playerId: p1Id, meepleType: 'NORMAL', segmentId: startRoadSegment, coordinate: { x: 0, y: 0 }
        }
        state.boardMeeples[`0,0:${startRoadSegment}_BUILDER`] = {
            playerId: p1Id, meepleType: 'BUILDER', segmentId: startRoadSegment, coordinate: { x: 0, y: 0 }
        }

        const roadFeatureId = Object.keys(state.featureUnionFind.featureData).find(
            key => state.featureUnionFind.featureData[key]?.type === 'ROAD'
        )

        if (roadFeatureId) {
            state.featureUnionFind.featureData[roadFeatureId]!.meeples.push({
                playerId: p1Id, meepleType: 'NORMAL', segmentId: startRoadSegment, coordinate: { x: 0, y: 0 }
            }, {
                playerId: p1Id, meepleType: 'BUILDER', segmentId: startRoadSegment, coordinate: { x: 0, y: 0 }
            })
        }

        // Now P1 extends the road at (1, 0)
        state = placeTile(state, { x: 1, y: 0 })

        // Skip meeple placement 
        state.turnPhase = 'SCORE'
        state = endTurn(state)

        // Should be P1's turn again (Double Turn)
        expect(state.currentPlayerIndex).toBe(0)
        // Builder should be returned immediately
        expect(state.players[0].meeples.available.BUILDER).toBe(1)
        // Board should not have P1 builder
        const builderOnBoard = state.players[0].meeples.onBoard.some(k => k.includes('BUILDER'))
        expect(builderOnBoard).toBe(false)
    })

    it('triggers RETURN_FARMER sequence when a city adjacent to a pig is completed', () => {
        // Set up a completed city adjacent to a field with a pig

        // Fake pig placement
        const fieldId = Object.keys(state.featureUnionFind.featureData).find(
            key => state.featureUnionFind.featureData[key]?.type === 'FIELD'
        )

        const p1Id = state.players[0].id
        const p2Id = state.players[1].id
        if (fieldId) {
            state.featureUnionFind.featureData[fieldId]!.meeples.push({
                playerId: p1Id, meepleType: 'NORMAL', segmentId: 'field0', coordinate: { x: 0, y: 0 }
            }, {
                playerId: p1Id, meepleType: 'PIG', segmentId: 'field0', coordinate: { x: 0, y: 0 }
            })
            state.players[0].meeples.available.NORMAL -= 1
            state.players[0].meeples.available.PIG -= 1
            state.players[0].meeples.onBoard.push('0,0:field0', '0,0:field0_PIG')
        }

        // Pretend a city adjacent to the farm is completed and scores
        // End the turn, manually adding the pending score event to trigger it or just mock it?
        // Let's manually trigger the Pig logic in endTurn.
        // We need a completed city that touches the field.
        const cityId = Object.keys(state.featureUnionFind.featureData).find(
            key => state.featureUnionFind.featureData[key]?.type === 'CITY'
        )

        if (cityId && fieldId) {
            const city = state.featureUnionFind.featureData[cityId]!
            city.isComplete = true
            city.pennantCount = 1
            // Give city a meeple so it scores and generates an event
            city.meeples.push({
                playerId: p2Id, meepleType: 'NORMAL', segmentId: 'city0', coordinate: { x: 0, y: 0 }
            })

            // Make field touch city
            state.featureUnionFind.featureData[fieldId]!.touchingCityIds.push(cityId)

            // endTurn should detect city completion with pennant and pig in adjacent field
            state.completedFeatureIds = [cityId]
            state.turnPhase = 'SCORE'
            state = endTurn(state)

            // Expect transition to RETURN_FARMER
            expect(state.turnPhase).toBe('RETURN_FARMER')
            const tbData = state.expansionData['tradersBuilders'] as any
            expect(tbData.pendingFarmerReturns).toHaveLength(1)

            // Resolve returning farmer
            state = resolveFarmerReturn(state, true)

            expect(state.players[0].meeples.available.PIG).toBe(1)

            // Farmer should be returned
            expect(state.players[0].meeples.available.NORMAL).toBe(7)
            expect(state.players[0].meeples.onBoard).not.toContain('0,0:field0')
        }
    })

    it('pig scoring triggers via preScoredFeatureIds (simulates store processScoringSequence)', () => {
        // This tests the real game flow: processScoringSequence scores features
        // first (removing them from completedFeatureIds), then passes the original
        // IDs to endTurn so pig detection still works.

        const p1Id = state.players[0].id

        const fieldId = Object.keys(state.featureUnionFind.featureData).find(
            key => state.featureUnionFind.featureData[key]?.type === 'FIELD'
        )!
        const cityId = Object.keys(state.featureUnionFind.featureData).find(
            key => state.featureUnionFind.featureData[key]?.type === 'CITY'
        )!

        // Place pig + farmer on field
        state.featureUnionFind.featureData[fieldId]!.meeples.push(
            { playerId: p1Id, meepleType: 'NORMAL', segmentId: 'field0', coordinate: { x: 0, y: 0 } },
            { playerId: p1Id, meepleType: 'PIG', segmentId: 'field0', coordinate: { x: 0, y: 0 } },
        )
        state.players[0].meeples.available.NORMAL -= 1
        state.players[0].meeples.available.PIG -= 1
        state.players[0].meeples.onBoard.push('0,0:field0', '0,0:field0_PIG')
        state.boardMeeples['0,0:field0'] = { playerId: p1Id, meepleType: 'NORMAL', segmentId: 'field0', coordinate: { x: 0, y: 0 } }
        state.boardMeeples['0,0:field0_PIG'] = { playerId: p1Id, meepleType: 'PIG', segmentId: 'field0', coordinate: { x: 0, y: 0 } }

        // Set up city with pennant, completed, touching the field
        // Must have a meeple so scoreFeatureCompletion actually processes it
        // (and removes it from completedFeatureIds, which is the bug scenario).
        const p2Id = state.players[1].id
        const city = state.featureUnionFind.featureData[cityId]!
        city.isComplete = true
        city.pennantCount = 1
        city.meeples.push({
            playerId: p2Id, meepleType: 'NORMAL', segmentId: 'city0', coordinate: { x: 0, y: 0 }
        })
        state.players[1].meeples.available.NORMAL -= 1
        state.players[1].meeples.onBoard.push('0,0:city0')
        state.boardMeeples['0,0:city0'] = { playerId: p2Id, meepleType: 'NORMAL', segmentId: 'city0', coordinate: { x: 0, y: 0 } }
        state.featureUnionFind.featureData[fieldId]!.touchingCityIds.push(cityId)
        state.completedFeatureIds = [cityId]

        // Simulate what processScoringSequence does: score features first
        const saved = [...state.completedFeatureIds]
        state.turnPhase = 'SCORE'
        const { state: scoredState } = scoreFeatureCompletion(state, cityId)
        // completedFeatureIds is now empty (city was scored and removed)
        expect(scoredState.completedFeatureIds).toEqual([])

        // Now call endTurn with the pre-scored IDs (as the store does)
        const result = endTurn(scoredState, saved)

        // Pig should still trigger even though completedFeatureIds was empty
        expect(result.turnPhase).toBe('RETURN_FARMER')
        expect(result.players[0].score).toBeGreaterThan(0)
    })

    it('pig scoring resolves touchingCityIds through union-find (merged city root)', () => {
        // Tests that when a field's touchingCityIds stores a non-root node key
        // (because the city was merged), the pig trigger still finds the match
        // by resolving through union-find.

        const p1Id = state.players[0].id

        const fieldId = Object.keys(state.featureUnionFind.featureData).find(
            key => state.featureUnionFind.featureData[key]?.type === 'FIELD'
        )!

        // Place pig + farmer on field
        state.featureUnionFind.featureData[fieldId]!.meeples.push(
            { playerId: p1Id, meepleType: 'NORMAL', segmentId: 'field0', coordinate: { x: 0, y: 0 } },
            { playerId: p1Id, meepleType: 'PIG', segmentId: 'field0', coordinate: { x: 0, y: 0 } },
        )
        state.players[0].meeples.available.NORMAL -= 1
        state.players[0].meeples.available.PIG -= 1
        state.players[0].meeples.onBoard.push('0,0:field0', '0,0:field0_PIG')
        state.boardMeeples['0,0:field0'] = { playerId: p1Id, meepleType: 'NORMAL', segmentId: 'field0', coordinate: { x: 0, y: 0 } }
        state.boardMeeples['0,0:field0_PIG'] = { playerId: p1Id, meepleType: 'PIG', segmentId: 'field0', coordinate: { x: 0, y: 0 } }

        // Simulate a merged city: the field stores the old key, but the
        // root (and completedFeatureIds entry) is a different key.
        const fakeOldCityKey = '99,99:cityOld'
        const fakeNewRootKey = '100,100:cityNew'

        // Create the new root city feature with pennant
        state.featureUnionFind.featureData[fakeNewRootKey] = {
            id: fakeNewRootKey,
            type: 'CITY',
            nodes: [{ coordinate: { x: 100, y: 100 }, segmentId: 'cityNew' }],
            meeples: [],
            isComplete: true,
            tileCount: 2,
            pennantCount: 1,
            openEdgeCount: 0,
            touchingCityIds: [],
            metadata: {},
        }

        // Make the old key redirect to the new root via union-find parent
        state.featureUnionFind.parent[fakeOldCityKey] = fakeNewRootKey
        state.featureUnionFind.parent[fakeNewRootKey] = fakeNewRootKey

        // Field's touchingCityIds stores the OLD (non-root) key
        state.featureUnionFind.featureData[fieldId]!.touchingCityIds.push(fakeOldCityKey)

        // completedFeatureIds uses the ROOT key
        state.completedFeatureIds = [fakeNewRootKey]
        state.turnPhase = 'SCORE'

        state = endTurn(state)

        // Despite the key mismatch, pig trigger should resolve through UF
        expect(state.turnPhase).toBe('RETURN_FARMER')
    })
})
