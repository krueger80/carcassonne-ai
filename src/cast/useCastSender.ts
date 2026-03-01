import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore.ts'
import { CAST_NAMESPACE } from './castConstants.ts'

export type CastConnectionState = 'NO_DEVICES' | 'AVAILABLE' | 'CONNECTING' | 'CONNECTED'

/** Extract {defId: imageUrl} from staticTileMap for the receiver */
function buildImageUrlMap(tileMap: Record<string, { imageUrl?: string }>): Record<string, string> {
  const map: Record<string, string> = {}
  for (const [id, def] of Object.entries(tileMap)) {
    if (def.imageUrl) map[id] = def.imageUrl
  }
  return map
}

/** Serialize game state for Cast, stripping staticTileMap to stay under ~64KB limit */
function buildCastPayload(gameState: ReturnType<typeof useGameStore.getState>['gameState']) {
  if (!gameState) return null
  const imageUrlMap = buildImageUrlMap(gameState.staticTileMap)
  const stateToSend = { ...gameState, staticTileMap: {} }
  const json = JSON.stringify(stateToSend)
  return JSON.stringify({ type: 'STATE_UPDATE', json, imageUrlMap })
}

export function useCastSender() {
  const [connectionState, setConnectionState] = useState<CastConnectionState>('NO_DEVICES')
  const [sdkReady, setSdkReady] = useState(false)
  const sessionRef = useRef<cast.framework.CastSession | null>(null)

  // ── 1. Wait for Cast SDK to load ──────────────────────────────────────────
  useEffect(() => {
    const appId = import.meta.env.VITE_CAST_APP_ID as string | undefined
    if (!appId) return

    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable) setSdkReady(true)
    }

    if (typeof cast !== 'undefined' && cast.framework?.CastContext) {
      setSdkReady(true)
    }
  }, [])

  // Helper to send current game state to the Cast receiver
  const sendCurrentState = useCallback(() => {
    const session = sessionRef.current
    if (!session) return false
    const gameState = useGameStore.getState().gameState
    if (!gameState) return false
    try {
      const payload = buildCastPayload(gameState)
      if (!payload) return false
      const result: any = session.sendMessage(CAST_NAMESPACE, payload)
      if (result && typeof result.then === 'function') {
        result.catch((err: unknown) => console.warn('[Cast] send rejected:', err))
      }
      return true
    } catch (err) {
      console.error('[Cast] sendMessage threw:', err)
      return false
    }
  }, [])

  // ── 2. Initialize CastContext when SDK is ready ───────────────────────────
  useEffect(() => {
    if (!sdkReady) return
    const appId = import.meta.env.VITE_CAST_APP_ID as string | undefined
    if (!appId) return

    try {
      const ctx = cast.framework.CastContext.getInstance()
      ctx.setOptions({
        receiverApplicationId: appId,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      })

      ctx.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
        const state = event.sessionState
        if (
          state === cast.framework.SessionState.SESSION_STARTED ||
          state === cast.framework.SessionState.SESSION_RESUMED
        ) {
          sessionRef.current = ctx.getCurrentSession()
          setConnectionState('CONNECTED')
          sendCurrentState()
        } else if (state === cast.framework.SessionState.SESSION_ENDED) {
          sessionRef.current = null
          setConnectionState('AVAILABLE')
        }
      })

      ctx.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, (event) => {
        const s = event.castState
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
          const payload = buildCastPayload(state.gameState)
          if (!payload) return
          const result: any = sessionRef.current!.sendMessage(CAST_NAMESPACE, payload)
          if (result && typeof result.then === 'function') {
            result.catch((err: unknown) => console.warn('[Cast] update failed:', err))
          }
        } catch (err) {
          console.error('[Cast] update threw:', err)
        }
      }
    })
    return unsub
  }, [])

  // ── 4. Periodic resend (every 3s while connected) ─────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionRef.current) sendCurrentState()
    }, 3000)
    return () => clearInterval(interval)
  }, [sendCurrentState])

  return { connectionState, sdkReady }
}
