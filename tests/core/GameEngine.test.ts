import { describe, it, expect } from 'vitest'
import { initGame } from '../../src/core/engine/GameEngine.ts'

describe('GameEngine - initGame', () => {
  it('rejects fewer than 2 players', () => {
    expect(() => {
      initGame({ playerNames: ['Player1'] })
    }).toThrow('Carcassonne supports 2–6 players')
  })

  it('rejects more than 6 players', () => {
    const tooManyPlayers = Array.from({ length: 7 }, (_, i) => `Player${i}`)
    expect(() => {
      initGame({ playerNames: tooManyPlayers })
    }).toThrow('Carcassonne supports 2–6 players')
  })

  it('initializes game with valid player count (2 players)', () => {
    const gameState = initGame({ playerNames: ['Alice', 'Bob'] })
    expect(gameState).toBeDefined()
    expect(gameState.players).toHaveLength(2)
    expect(gameState.players[0].name).toBe('Alice')
    expect(gameState.players[1].name).toBe('Bob')
    expect(gameState.phase).toBe('PLAYING')
  })

  it('initializes game with valid player count (6 players)', () => {
    const sixPlayers = Array.from({ length: 6 }, (_, i) => `P${i}`)
    const gameState = initGame({ playerNames: sixPlayers })
    expect(gameState).toBeDefined()
    expect(gameState.players).toHaveLength(6)
  })
})
