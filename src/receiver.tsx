import { useEffect, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { useGameStore } from './store/gameStore.ts'
import { CastView } from './components/cast/CastView.tsx'
import { CAST_NAMESPACE } from './cast/castConstants.ts'
import './index.css'

// ── Debug overlay: visible on the TV for diagnosing issues ──────────────────

const debugLines: string[] = []

function debugLog(msg: string) {
  const ts = new Date().toLocaleTimeString()
  const line = `[${ts}] ${msg}`
  console.log('[Receiver]', msg)
  debugLines.push(line)
  // Keep last 12 lines
  if (debugLines.length > 12) debugLines.shift()
  // Update the debug overlay element if it exists
  const el = document.getElementById('cast-debug')
  if (el) el.textContent = debugLines.join('\n')
}

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
    debugLog(`RENDER CRASH: ${error.message}`)
    debugLog(`Stack: ${info.componentStack?.split('\n')[1]?.trim() ?? 'unknown'}`)
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
      debugLog(`Failed to get CastReceiverContext: ${err}`)
      return
    }

    // 1. Register message listener BEFORE start() (per CAF docs)
    //    Sender now sends objects (not strings), but we handle both for robustness.
    context.addCustomMessageListener(CAST_NAMESPACE, (event) => {
      debugLog(`Message received — typeof event.data: ${typeof event.data}`)
      try {
        // Sender sends object { type, json }. CAF may deliver as-is or as string.
        const message = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data

        debugLog(`Message type: ${message?.type ?? 'unknown'}`)

        if (message.type === 'STATE_UPDATE' && message.json) {
          const gameState = typeof message.json === 'string'
            ? JSON.parse(message.json)
            : message.json

          const tileCount = gameState.board?.tiles
            ? Object.keys(gameState.board.tiles).length
            : 0
          debugLog(`State parsed OK — ${tileCount} tiles, phase: ${gameState.turnPhase ?? '?'}`)

          // Apply immediately — tile definitions are included in staticTileMap
          useGameStore.setState({ gameState })
          debugLog('State applied to store')
        }
      } catch (err) {
        debugLog(`Parse error: ${err}`)
      }
    })
    debugLog(`Message listener registered on namespace: ${CAST_NAMESPACE}`)

    // 2. Start context (signals to Chromecast that receiver is ready)
    //    Wrapped in try/catch — the CAF SDK throws if the IPC WebSocket fails
    //    (always fails in non-Chromecast browsers, but works on real hardware)
    try {
      context.setApplicationState('Carcassonne')
      context.start()
      debugLog('CastReceiverContext started OK')
    } catch (err) {
      debugLog(`CastReceiverContext.start() failed: ${err}`)
    }

    // No cleanup — CAF context.stop() + re-start() is unsupported
    // The receiver runs for the lifetime of the cast session
    return () => {}
  }, [])

  return (
    <>
      <ReceiverErrorBoundary>
        <CastView />
      </ReceiverErrorBoundary>

      {/* Debug overlay — small text in bottom-left corner, visible on TV */}
      <pre
        id="cast-debug"
        style={{
          position: 'fixed', bottom: 4, left: 4,
          fontSize: 10, color: 'rgba(255,255,255,0.4)',
          fontFamily: 'monospace', pointerEvents: 'none',
          zIndex: 9999, whiteSpace: 'pre', lineHeight: 1.3,
          maxWidth: '50vw',
        }}
      >
        {debugLines.join('\n')}
      </pre>
    </>
  )
}

// ── Mount ───────────────────────────────────────────────────────────────────
// NOTE: No StrictMode — the CAF Receiver SDK does not support being
// stopped and restarted (StrictMode double-invokes effects), causing a crash.

debugLog('receiver.tsx loaded')

createRoot(document.getElementById('root')!).render(
  <CastReceiver />,
)
