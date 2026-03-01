import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore.ts'
import { CAST_NAMESPACE } from './castConstants.ts'

export type CastConnectionState = 'NO_DEVICES' | 'AVAILABLE' | 'CONNECTING' | 'CONNECTED'

export function useCastSender() {
  const [connectionState, setConnectionState] = useState<CastConnectionState>('NO_DEVICES')
  const [sdkReady, setSdkReady] = useState(false)
  const sessionRef = useRef<cast.framework.CastSession | null>(null)

  // ── 1. Wait for Cast SDK to load ──────────────────────────────────────────
  useEffect(() => {
    const appId = import.meta.env.VITE_CAST_APP_ID as string | undefined
    console.log('[Cast] Initializing with App ID:', appId)

    if (!appId) {
      console.warn('[Cast] No App ID found in environment variables.')
      return
    }

    // The SDK calls this global when ready
    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      console.log('[Cast] SDK Global callback fired. Available:', isAvailable)
      if (isAvailable) setSdkReady(true)
    }

    // If SDK already loaded (e.g., cached), check immediately
    if (typeof cast !== 'undefined' && cast.framework?.CastContext) {
      console.log('[Cast] SDK already present in window.')
      setSdkReady(true)
    } else {
      console.log('[Cast] SDK not yet present in window.')
    }
  }, [])

  // Helper to send current game state to the Cast receiver
  const sendCurrentState = useCallback(() => {
    const session = sessionRef.current
    if (!session) return
    const gameState = useGameStore.getState().gameState
    if (!gameState) return
    try {
      const json = JSON.stringify(gameState)
      console.log(`[Cast] Sending state. Payload size: ${Math.round(json.length / 1024)} KB`)

      // Send as object (not string) — CAF SDK handles serialization.
      // Use Promise API (.then/.catch), not callback args.
      session.sendMessage(CAST_NAMESPACE, { type: 'STATE_UPDATE', json })
        .then(() => console.log('[Cast] State sent'))
        .catch((err: unknown) => console.warn('[Cast] sendMessage failed:', err))
    } catch (err) {
      console.error('[Cast] Failed to send state:', err)
    }
  }, [])

  // ── 2. Initialize CastContext when SDK is ready ───────────────────────────
  useEffect(() => {
    if (!sdkReady) return
    const appId = import.meta.env.VITE_CAST_APP_ID as string | undefined
    if (!appId) return

    console.log('[Cast] Initializing CastContext...')
    try {
      const ctx = cast.framework.CastContext.getInstance()
      ctx.setOptions({
        receiverApplicationId: appId,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      })

      const initialState = ctx.getCastState()
      console.log('[Cast] Initial state:', initialState)

      // Session state changes (connected / disconnected)
      ctx.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
        const state = event.sessionState
        console.log('[Cast] Session state changed:', state)
        if (
          state === cast.framework.SessionState.SESSION_STARTED ||
          state === cast.framework.SessionState.SESSION_RESUMED
        ) {
          sessionRef.current = ctx.getCurrentSession()
          setConnectionState('CONNECTED')
          // Send current state immediately on connect
          sendCurrentState()
        } else if (state === cast.framework.SessionState.SESSION_ENDED) {
          sessionRef.current = null
          setConnectionState('AVAILABLE')
        }
      })

      // Cast device availability changes
      ctx.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, (event) => {
        const s = event.castState
        console.log('[Cast] State changed:', s)
        if (s === cast.framework.CastState.NO_DEVICES_AVAILABLE) {
          setConnectionState('NO_DEVICES')
        } else if (s === cast.framework.CastState.NOT_CONNECTED) {
          setConnectionState('AVAILABLE')
        } else if (s === cast.framework.CastState.CONNECTING) {
          setConnectionState('CONNECTING')
        } else if (s === cast.framework.CastState.CONNECTED) {
          setConnectionState('CONNECTED')
        }
      })
    } catch (err) {
      console.error('[Cast] Error during Context init:', err)
    }
  }, [sdkReady, sendCurrentState])

  // ── 3. Subscribe to Zustand state changes → send to Cast ─────────────────
  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.gameState !== prev.gameState && state.gameState && sessionRef.current) {
        try {
          const json = JSON.stringify(state.gameState!)
          sessionRef.current!.sendMessage(CAST_NAMESPACE, { type: 'STATE_UPDATE', json })
            .then(() => console.log('[Cast] State update sent'))
            .catch((err: unknown) => console.warn('[Cast] sendMessage failed:', err))
        } catch (err) {
          console.error('[Cast] Failed to send state update:', err)
        }
      }
    })
    return unsub
  }, [])

  return { connectionState, sdkReady }
}
