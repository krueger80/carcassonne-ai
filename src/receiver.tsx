import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useGameStore } from './store/gameStore.ts'
import { CastView } from './components/cast/CastView.tsx'
import { CAST_NAMESPACE } from './cast/castConstants.ts'
import { loadAllTiles } from './services/tileRegistry.ts'
import type { TileDefinition } from './core/types/tile.ts'
import './index.css'

// Move global state outside component for stability
let tileMapCache: Record<string, TileDefinition> | null = null
let latestPartialState: any = null

function CastReceiver() {
  useEffect(() => {
    const context = cast.framework.CastReceiverContext.getInstance()

    // 1. Initial configuration
    context.setApplicationState('Carcassonne')

    // 2. Load large assets in background (if not already cached)
    if (!tileMapCache) {
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
    }

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

    // 4. Start context
    context.start()

    // No stop() call - the platform handles app exit.
  }, [])

  return <CastView />
}

createRoot(document.getElementById('root')!).render(
  <CastReceiver />
)
