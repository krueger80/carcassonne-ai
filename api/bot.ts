import { GameState } from '../src/core/types/game.ts'
import { computeBestMove } from '../src/core/ai/mcts.ts'

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await request.json()
    const state = body.state as GameState
    const difficulty = body.difficulty as 'easy' | 'medium' | 'hard' || 'medium'

    if (!state) {
      return new Response(JSON.stringify({ error: 'Missing game state' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const action = computeBestMove(state, difficulty)

    return new Response(JSON.stringify(action), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Bot Error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
