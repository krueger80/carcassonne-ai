import { describe, it, expect } from 'vitest'
import { computeBestMove } from './mcts.ts'
import { initGame, drawTile } from '../engine/GameEngine.ts'
import { getFallbackBaseTiles } from '../../services/tileRegistry.ts'

describe('Bot MCTS (Basic)', () => {
  it('should return a valid move for a brand new game', () => {
    // Setup a basic game with 2 bots
    let state = initGame({
      playerNames: [
        { name: 'Bot 1', isBot: true, botDifficulty: 'easy' },
        { name: 'Bot 2', isBot: true, botDifficulty: 'medium' }
      ],
      baseDefinitions: getFallbackBaseTiles()
    })

    // Advance to PLACE_TILE phase
    state = drawTile(state)

    const action = computeBestMove(state, 'medium')

    expect(action).toBeDefined()
    expect(action.tilePlacement).toBeDefined()
    expect(action.tilePlacement?.coordinate).toBeDefined()
    expect(action.tilePlacement?.rotation).toBeDefined()
  })
})
