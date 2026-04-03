import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GameState } from '../src/core/types/game.ts'
import { computeBestMove } from '../src/core/ai/mcts.ts'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const body = req.body
    const state = body.state as GameState
    const difficulty = body.difficulty as 'easy' | 'medium' | 'hard' || 'medium'

    if (!state) {
      return res.status(400).json({ error: 'Missing game state' })
    }

    const action = computeBestMove(state, difficulty)

    return res.status(200).json(action)
  } catch (error) {
    console.error('Bot Error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

