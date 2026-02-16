import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../../src/store/gameStore'

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.getState().resetGame()
  })

  it('drawTile should update currentTile in gameState', () => {
    const store = useGameStore.getState()

    // Initialize game
    store.newGame({
      playerNames: ['Alice', 'Bob'],
    })

    let gameState = useGameStore.getState().gameState
    expect(gameState).not.toBeNull()
    if (!gameState) return

    expect(gameState.turnPhase).toBe('DRAW_TILE')
    expect(gameState.currentTile).toBeNull()

    // Draw tile
    store.drawTile()

    gameState = useGameStore.getState().gameState
    expect(gameState?.currentTile).not.toBeNull()
    expect(gameState?.turnPhase).toBe('PLACE_TILE')
  })
})
