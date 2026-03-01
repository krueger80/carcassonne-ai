import { useEffect, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { useGameStore } from './store/gameStore.ts'
import { CastView } from './components/cast/CastView.tsx'
import { CAST_NAMESPACE } from './cast/castConstants.ts'
import { getFallbackTileMap } from './services/tileRegistry.ts'
import './index.css'

// ── Error boundary: catches React render crashes ────────────────────────────

interface ErrorBoundaryState {
  error: Error | null
}

class ReceiverErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Receiver] RENDER CRASH:', error.message, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          width: '100vw', height: '100vh', background: '#1a2a1a',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ fontSize: 48, color: '#b8a47a', fontStyle: 'italic', marginBottom: 16 }}>
            Carcassonne
          </div>
          <div style={{ fontSize: 20, color: '#e74c3c', marginBottom: 12 }}>
            Receiver error
          </div>
          <div style={{
            fontSize: 14, color: '#999', maxWidth: '80vw',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'center',
          }}>
            {this.state.error.message}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Cast Receiver component ─────────────────────────────────────────────────

function CastReceiver() {
  useEffect(() => {
    let context: cast.framework.CastReceiverContext
    try {
      context = cast.framework.CastReceiverContext.getInstance()
    } catch (err) {
      console.error('[Receiver] Failed to get CastReceiverContext:', err)
      return
    }

    context.addCustomMessageListener(CAST_NAMESPACE, (event) => {
      try {
        const message = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data

        if (message.type === 'STATE_UPDATE' && message.json) {
          const gameState = typeof message.json === 'string'
            ? JSON.parse(message.json)
            : message.json

          // Sender strips staticTileMap to stay under Cast's message size limit.
          // Rebuild it from the hardcoded fallback tile definitions.
          const fallback = getFallbackTileMap()
          gameState.staticTileMap = { ...fallback, ...(gameState.staticTileMap ?? {}) }

          // Patch imageUrls from sender (fallback editions may lack them)
          const imageUrlMap = message.imageUrlMap as Record<string, string> | undefined
          if (imageUrlMap) {
            for (const [id, url] of Object.entries(imageUrlMap)) {
              if (gameState.staticTileMap[id]) {
                gameState.staticTileMap[id] = { ...gameState.staticTileMap[id], imageUrl: url }
              }
            }
          }

          useGameStore.setState({ gameState })
        }
      } catch (err) {
        console.error('[Receiver] Parse error:', err)
      }
    })

    try {
      context.setApplicationState('Carcassonne')
      context.start()
    } catch (err) {
      console.error('[Receiver] CastReceiverContext.start() failed:', err)
    }

    return () => {}
  }, [])

  return (
    <ReceiverErrorBoundary>
      <CastView />
    </ReceiverErrorBoundary>
  )
}

// ── Mount ───────────────────────────────────────────────────────────────────
// NOTE: No StrictMode — the CAF Receiver SDK does not support being
// stopped and restarted (StrictMode double-invokes effects), causing a crash.

createRoot(document.getElementById('root')!).render(
  <CastReceiver />,
)
