import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useGameStore } from './store/gameStore.ts'
import { CastView } from './components/cast/CastView.tsx'
import { CAST_NAMESPACE } from './cast/castConstants.ts'
import { loadAllTiles } from './services/tileRegistry.ts'
import type { TileDefinition } from './core/types/tile.ts'
import './index.css'

function CastReceiver() {
  useEffect(() => {
    const context = cast.framework.CastReceiverContext.getInstance()
    let tileMapCache: Record<string, TileDefinition> | null = null
    let latestPartialState: any = null

    // 1. Start context immediately to prevent launch timeout
    context.setApplicationState('Carcassonne')
    context.start()

    // 2. Load large assets in background
    loadAllTiles().then(allTiles => {
      tileMapCache = Object.fromEntries(allTiles.map((t) => [t.id, t]))
      console.log(`[Receiver] Loaded ${allTiles.length} definitions.`)

      // If we already received a state update while loading, apply it now
      if (latestPartialState) {
        useGameStore.setState({
          gameState: { ...latestPartialState, staticTileMap: tileMapCache } as any
        })
      }
    }).catch(err => {
      console.error('[Receiver] Failed to load definitions:', err)
    })

    // 3. Listen for state updates
    context.addCustomMessageListener(CAST_NAMESPACE, (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'STATE_UPDATE' && message.json) {
          const partialState = JSON.parse(message.json)
          latestPartialState = partialState

          if (tileMapCache) {
            const gameState = { ...partialState, staticTileMap: tileMapCache }
            useGameStore.setState({ gameState })
          }
        }
      } catch (err) {
        console.error('[Receiver] Failed to parse message:', err)
      }
    })

    return () => { context.stop() }
  }, [])

  return <CastView />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CastReceiver />
  </StrictMode>,
)
