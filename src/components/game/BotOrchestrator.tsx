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

        // --- Handle Direct / Non-Action Phases ---
        if (latestState.turnPhase === 'RETURN_FARMER') {
          const tbData = latestState.expansionData['tradersBuilders'] as any
          const queue = tbData?.pendingFarmerReturns as any[]
          const currentPrompt = queue?.[0]
          
          if (currentPrompt) {
            const promptedPlayer = latestState.players.find((p: any) => p.id === currentPrompt.playerId)
            if (promptedPlayer?.isBot) {
              console.log(`[Bot] Auto-resolving farmer return for bot ${promptedPlayer.name}`)
              store.resolveFarmerReturn(false) // Bots never return farmers mid-game to keep it simple
            } else {
              // Human player is being prompted, bot must wait
              isThinking.current = false
              return
            }
          } else {
            // Queue empty, but phase is still RETURN_FARMER? Safety resolve.
            store.resolveFarmerReturn(false)
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
        if (latestState.turnPhase === 'DRAGON_ORIENT') {
          // Pick best orientation locally — no need for full MCTS
          // Try stored orientations first, fall back to computing from engine
          let orientations = useGameStore.getState().dragonOrientations ?? []
          if (orientations.length === 0) {
            const { getValidDragonOrientations } = await import('../../core/engine/GameEngine.ts')
            orientations = getValidDragonOrientations(latestState)
            console.log('[Bot] Computed dragon orientations from engine:', orientations)
          }
          if (orientations.length > 0) {
            const pick = orientations[0] // Already prioritized by getValidDragonOrientations (meeple-facing first)
            console.log(`[Bot] Orienting dragon to ${pick} (from ${orientations.length} options)`)
            useGameStore.setState({ tentativeDragonFacing: pick })
            store.confirmDragonOrientation()
          } else {
            console.log('[Bot] No dragon orientations available, confirming default')
            store.confirmDragonOrientation()
          }
          isThinking.current = false
          return
        }
        if (latestState.turnPhase === 'DRAGON_PLACE') {
          // Pick dragon hoard placement locally
          const boardTiles = latestState.board.tiles
          const dragonHoardTile = Object.entries(boardTiles).find(([_, tile]) => {
            const def = latestState.staticTileMap[tile.definitionId]
            return def?.isDragonHoard
          })
          if (dragonHoardTile) {
            const [x, y] = dragonHoardTile[0].split(',').map(Number)
            console.log(`[Bot] Placing Dragon on Hoard at ${x}, ${y}`)
            store.placeDragonOnHoard({ x, y })
          } else {
            store.endTurn()
          }
          isThinking.current = false
          return
        }
        if (latestState.turnPhase === 'DRAW_TILE') {
          console.log('[Bot] Drawing tile...')
          store.drawTile()
          isThinking.current = false // allow next effect to pick up PLACE_TILE
          return
        }

        // --- Handle AI Decision-based Phases ---
        console.log(`[Bot] Calculating moves for phase ${latestState.turnPhase}...`)
        let action: BotAction | null = null

        // Try hitting the Vercel serverless function
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 12000)
          
          const res = await fetch('/api/bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: latestState, difficulty: latestActivePlayer.botDifficulty }),
            signal: controller.signal
          })
          clearTimeout(timeoutId)
          if (res.ok) {
            action = await res.json()
          } else {
            console.warn('[Bot] API failed:', await res.text())
          }
        } catch (err) {
          console.warn('[Bot] Failed to call /api/bot, falling back to local computation:', err)
        }

        // Fallback to local computation
        if (!action || Object.keys(action).length === 0) {
          const { computeBestMove } = await import('../../core/ai/mcts.ts')
          action = computeBestMove(latestState, latestActivePlayer.botDifficulty)
        }

        if (!action) {
          console.warn(`[Bot] No move found for phase ${latestState.turnPhase}, skipping`)
          store.endTurn()
          isThinking.current = false
          return
        }

        // Execute action based on phase
        if (latestState.turnPhase === 'FAIRY_MOVE') {
          if (action.fairyPlacement) {
             console.log('[Bot] Positioning fairy on', action.fairyPlacement)
             store.moveFairy(action.fairyPlacement.coordinate, action.fairyPlacement.segmentId)
          } else {
             console.log('[Bot] Skipping Fairy Move')
             store.skipFairyMove()
          }
          isThinking.current = false
          return
        }


        if (latestState.turnPhase !== 'PLACE_TILE' || !action.tilePlacement) {
          console.warn(`[Bot] Unhandled state ${latestState.turnPhase} or no tile placement found`)
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
        
        const phaseAfterPlacement = useGameStore.getState().gameState?.turnPhase
        console.log('[Bot] State after confirm. Turn phase is now:', phaseAfterPlacement)

        if (phaseAfterPlacement !== 'PLACE_MEEPLE') {
          // If the phase unexpectedly diverged (e.g. to DRAGON_ORIENT or DRAGON_PLACE),
          // yield early! This synchronously clears `isThinking.current` before the next React
          // render occurs, ensuring the `useEffect` reliably catches the new phase and retriggers the Bot.
          return
        }

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

        // Safety check: if the phase didn't advance, force skip
        const postMeepleState = useGameStore.getState().gameState
        if (postMeepleState?.turnPhase === 'PLACE_MEEPLE') {
          console.warn('[Bot] ⚠ Meeple placement did not advance phase — forcing skip')
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
