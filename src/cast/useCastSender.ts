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

    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      console.log('[Cast] SDK Global callback fired. Available:', isAvailable)
      if (isAvailable) setSdkReady(true)
    }

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
    if (!session) {
      console.log('[Cast] sendCurrentState: no session')
      return false
    }
    const gameState = useGameStore.getState().gameState
    if (!gameState) {
      console.log('[Cast] sendCurrentState: no gameState')
      return false
    }
    try {
      // Strip staticTileMap to stay under Cast's ~64KB message limit.
      // Send a lightweight imageUrl map so the receiver can patch fallback defs.
      const imageUrlMap: Record<string, string> = {}
      for (const [id, def] of Object.entries(gameState.staticTileMap)) {
        if (def.imageUrl) imageUrlMap[id] = def.imageUrl
      }
      const stateToSend = { ...gameState, staticTileMap: {} }
      const json = JSON.stringify(stateToSend)
      const payload = JSON.stringify({ type: 'STATE_UPDATE', json, imageUrlMap })
      const sizeKB = Math.round(payload.length / 1024)
      const tileCount = Object.keys(gameState.board?.tiles ?? {}).length

      console.log(`[Cast] Sending state: ${tileCount} tiles, ${sizeKB} KB, phase=${gameState.turnPhase}`)

      const result: any = session.sendMessage(CAST_NAMESPACE, payload)
      if (result && typeof result.then === 'function') {
        result
          .then(() => console.log('[Cast] ✓ sent (promise resolved)'))
          .catch((err: unknown) => console.warn('[Cast] ✗ send rejected:', err))
      } else {
        console.log('[Cast] ✓ sent (no promise)')
      }
      return true
    } catch (err) {
      console.error('[Cast] ✗ sendMessage threw:', err)
      return false
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
      console.log('[Cast] Initial cast state:', initialState)

      ctx.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
        const state = event.sessionState
        console.log('[Cast] Session state changed:', state)
        if (
          state === cast.framework.SessionState.SESSION_STARTED ||
          state === cast.framework.SessionState.SESSION_RESUMED
        ) {
          sessionRef.current = ctx.getCurrentSession()
          console.log('[Cast] Session acquired:', !!sessionRef.current)
          setConnectionState('CONNECTED')
          // Send current state immediately on connect
          sendCurrentState()
        } else if (state === cast.framework.SessionState.SESSION_ENDED) {
          console.log('[Cast] Session ended')
          sessionRef.current = null
          setConnectionState('AVAILABLE')
        }
      })

      ctx.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, (event) => {
        const s = event.castState
        console.log('[Cast] Cast state changed:', s)
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
    let sendCount = 0
    const unsub = useGameStore.subscribe((state, prev) => {
      const hasSession = !!sessionRef.current
      const stateChanged = state.gameState !== prev.gameState
      const hasState = !!state.gameState

      if (stateChanged && hasState && hasSession) {
        sendCount++
        console.log(`[Cast] Subscriber: sending update #${sendCount}`)
        try {
          // Strip staticTileMap (receiver rebuilds from fallback)
          const imageUrlMap: Record<string, string> = {}
          for (const [id, def] of Object.entries(state.gameState!.staticTileMap)) {
            if (def.imageUrl) imageUrlMap[id] = def.imageUrl
          }
          const stateToSend = { ...state.gameState!, staticTileMap: {} }
          const json = JSON.stringify(stateToSend)
          const payload = JSON.stringify({ type: 'STATE_UPDATE', json, imageUrlMap })
          const result: any = sessionRef.current!.sendMessage(CAST_NAMESPACE, payload)
          if (result && typeof result.then === 'function') {
            result
              .then(() => console.log(`[Cast] ✓ update #${sendCount} sent`))
              .catch((err: unknown) => console.warn(`[Cast] ✗ update #${sendCount} failed:`, err))
          }
        } catch (err) {
          console.error(`[Cast] ✗ update #${sendCount} threw:`, err)
        }
      } else if (stateChanged && hasState && !hasSession) {
        console.log('[Cast] Subscriber: state changed but no session')
      }
    })
    return unsub
  }, [])

  // ── 4. Periodic resend (every 3s while connected) ─────────────────────────
  //    Belt-and-suspenders: if individual sends fail silently, this catches up.
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionRef.current) {
        sendCurrentState()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [sendCurrentState])

  return { connectionState, sdkReady }
}
