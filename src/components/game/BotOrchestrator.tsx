import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore.ts'
import type { BotAction } from '../../core/ai/mcts.ts'

export function BotOrchestrator() {
  const gameState = useGameStore(s => (s as any).gameState)
  const isThinking = useRef(false)

  useEffect(() => {
    if (!gameState || gameState.phase !== 'PLAYING') return
    
    // We act on DRAW_TILE, PLACE_TILE, and expansion-specific aux phases that need to be skipped by the AI
    const validPhases = [
      'DRAW_TILE', 
      'PLACE_TILE', 
      'FAIRY_MOVE', 
      'RETURN_FARMER', 
      'DRAGON_ORIENT', 
      'DRAGON_PLACE', 
      'DRAGON_MOVEMENT'
    ]
    if (!validPhases.includes(gameState.turnPhase)) return

    const activePlayer = gameState.players[gameState.currentPlayerIndex]
    if (!activePlayer?.isBot) return

    if (isThinking.current) return

    const runBot = async () => {
      isThinking.current = true
      try {
        const store = useGameStore.getState()
        const latestState = store.gameState
        if (!latestState) return
        
        const latestActivePlayer = latestState.players[latestState.currentPlayerIndex]

        // --- Handle Auxiliary / Expansion Phases ---
        if (latestState.turnPhase === 'FAIRY_MOVE') {
          console.log('[Bot] Skipping Fairy Move')
          store.skipFairyMove()
          isThinking.current = false
          return
        }
        if (latestState.turnPhase === 'RETURN_FARMER') {
          console.log('[Bot] Skipping Farmer Return')
          store.resolveFarmerReturn(false)
          isThinking.current = false
          return
        }
        if (latestState.turnPhase === 'DRAGON_ORIENT') {
          console.log('[Bot] Defaulting Dragon Orientation')
          store.confirmDragonOrientation()
          isThinking.current = false
          return
        }
        if (latestState.turnPhase === 'DRAGON_PLACE') {
          console.log('[Bot] Placing Dragon on Hoard')
          // Find any hoard tile
          const boardTiles = latestState.board.tiles
          const dragonHoardTile = Object.entries(boardTiles).find(([_, tile]) => {
            const def = latestState.staticTileMap[tile.definitionId]
            return def?.isDragonHoard
          })
          
          if (dragonHoardTile) {
            const [x, y] = dragonHoardTile[0].split(',').map(Number)
            store.placeDragonOnHoard({ x, y })
          } else {
            console.warn('[Bot] No dragon hoard found to place on!')
            // Fallback: just skip or try to finish turn if possible
            store.endTurn() 
          }
          isThinking.current = false
          return
        }
        if (latestState.turnPhase === 'DRAGON_MOVEMENT') {
          console.log('[Bot] Progressing Dragon Movement')
          store.executeDragon()
          isThinking.current = false
          return
        }

        // Phase 1: Draw the tile if needed
        if (latestState.turnPhase === 'DRAW_TILE') {
          console.log('[Bot] Drawing tile...')
          store.drawTile()
          isThinking.current = false // allow next effect to pick up PLACE_TILE
          return
        }

        // Phase 2: Calculate and execute moves
        console.log('[Bot] Calculating moves...')
        let action: BotAction | null = null

        // Try hitting the Vercel serverless function
        try {
          const res = await fetch('/api/bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: latestState, difficulty: latestActivePlayer.botDifficulty })
          })
          if (res.ok) {
            action = await res.json()
          } else {
            console.warn('[Bot] API failed:', await res.text())
          }
        } catch (err) {
          console.warn('[Bot] Failed to call /api/bot, falling back to local computation:', err)
        }

        // Fallback to local computation
        if (!action) {
          const { computeBestMove } = await import('../../core/ai/mcts.ts')
          action = computeBestMove(latestState, latestActivePlayer.botDifficulty)
        }

        if (!action || !action.tilePlacement) {
          console.warn('[Bot] No move found, skipping turn phase')
          isThinking.current = false
          return
        }

        console.log('[Bot] Executing tile placement:', action.tilePlacement)

        // 1. Place the tile
        // ensure rotation matches
        let rotateCount = 0
        while (rotateCount < 4) {
          const currentRot = useGameStore.getState().gameState?.currentTile?.rotation ?? 0
          if (currentRot === action.tilePlacement.rotation) break
          store.rotateTentativeTile()
          // small delay to visualize spinning
          await new Promise(r => setTimeout(r, 150))
          rotateCount++
        }
        
        console.log('[Bot] Final rotation before placing:', useGameStore.getState().gameState?.currentTile?.rotation)
        const coordLog = action.tilePlacement.coordinate
        console.log(`[Bot] Attempting to select placement at ${coordLog.x}, ${coordLog.y}`)
        
        store.selectTilePlacement(action.tilePlacement.coordinate)
        
        console.log('[Bot] State after select:', useGameStore.getState().gameState?.currentTile?.rotation)
        
        store.confirmTilePlacement()
        
        console.log('[Bot] State after confirm. Turn phase is now:', useGameStore.getState().gameState?.turnPhase)


        // small delay for UI
        await new Promise(r => setTimeout(r, 600))

        // 2. Place the meeple
        // After placing the tile, the store transitions the engine to PLACE_MEEPLE
        if (action.meeplePlacement) {
          console.log('[Bot] Executing meeple placement:', action.meeplePlacement)
          store.selectMeeplePlacement(action.meeplePlacement.segmentId, action.meeplePlacement.meepleType)
          store.confirmMeeplePlacement()
        } else {
          console.log('[Bot] Skipping meeple')
          store.skipMeeple()
        }

      } catch (err) {
        console.error('[Bot] Orchestration failed:', err)
      } finally {
        isThinking.current = false
      }
    }

    // Give a slight delay so the UI can render state changes
    const timerId = setTimeout(runBot, 800)
    
    return () => clearTimeout(timerId)

  }, [gameState?.turnPhase, gameState?.currentPlayerIndex, gameState?.currentTile?.definitionId])

  return null
}
