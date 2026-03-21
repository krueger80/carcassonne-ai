import { initGame, placeTile, placeMeeple, evaluateFeature } from './src/core/engine/GameEngine'
import { evaluateState } from './src/core/ai/mcts'
import { BASE3_TILES } from './src/core/data/baseTilesC3'
import { ABBOT_C3_GARDEN_TILES } from './src/core/data/abbotGardenTilesC3'

const config: any = {
  playerNames: [{ name: 'Red', isBot: true, botDifficulty: 'medium' }, { name: 'Blue', isBot: true, botDifficulty: 'medium' }],
  baseDefinitions: [...BASE3_TILES, ...ABBOT_C3_GARDEN_TILES],
  extraTileDefinitions: [],
  expansions: [],
}

let state = initGame(config)

// D at 0,1 (City Top)
state.currentTile = { definitionId: 'base3_D', rotation: 0 }
state.tileBag = []
state.turnPhase = 'PLACE_TILE'
state.currentPlayerIndex = 0
state = placeTile(state, {x: 0, y: 1})

// O at 0,0 (City Bottom, Right. Road Left. R180)
state.currentTile = { definitionId: 'base3_O', rotation: 180 }
state.turnPhase = 'PLACE_TILE'
state = placeTile(state, {x: 0, y: 0})

// V at -1,0 (Road East, North. R180)
state.currentTile = { definitionId: 'base3_V', rotation: 180 }
state.turnPhase = 'PLACE_TILE'
state.currentPlayerIndex = 1 // Blue
state = placeTile(state, {x: -1, y: 0})
state.turnPhase = 'PLACE_MEEPLE'
state = placeMeeple(state, 'road0', 'NORMAL') // Blue claims road

// I_garden at 1,0 (City Left, Top. R0?)
state.currentTile = { definitionId: 'base3_I_garden', rotation: 0 }
state.turnPhase = 'PLACE_TILE'
state.currentPlayerIndex = 0 // Red
state = placeTile(state, {x: 1, y: 0})
state.turnPhase = 'PLACE_MEEPLE'
state = placeMeeple(state, 'city0', 'NORMAL') // Red claims city

// Now Blue draws base3_T
state.turnPhase = 'PLACE_TILE'
state.currentPlayerIndex = 1

// Option A: Top Right (1, -1) [The AI's choice]
let stateB = JSON.parse(JSON.stringify(state))
stateB.currentTile = { definitionId: 'base3_T', rotation: 270 } // City Top, Right, Bottom. Field Left.
stateB = placeTile(stateB, {x: 1, y: -1})
stateB = placeMeeple(stateB, 'field0', 'NORMAL')
const scoreB = evaluateState(state, stateB, state.players[1].id, 'medium')
console.log('Score B (Top Right - AI picked this):', scoreB)

// Option B: Center Top (0, -1) [The user's drawn box] -> wait, it is (-1, -1)!
let stateA = JSON.parse(JSON.stringify(state))
stateA.currentTile = { definitionId: 'base3_T', rotation: 180 } // Field Bottom
stateA = placeTile(stateA, {x: -1, y: -1})
stateA = placeMeeple(stateA, 'field0', 'NORMAL')
const scoreA = evaluateState(state, stateA, state.players[1].id, 'medium')
console.log('Score A (Above V - user wants this):', scoreA)



