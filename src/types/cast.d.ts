// Ambient type declarations for Google Cast SDKs (loaded via <script> tags)

// Make this file a module so `declare module 'react'` augments rather than replaces
export { }

// ── Global Cast SDK types ─────────────────────────────────────────────────────

declare global {
  namespace cast {
    namespace framework {
      class CastContext {
        static getInstance(): CastContext
        setOptions(options: CastOptions): void
        getCastState(): string
        getCurrentSession(): CastSession | null
        getSessionState(): string
        requestSession(): Promise<void>
        addEventListener(
          type: string,
          handler: (event: { sessionState?: string; castState?: string }) => void,
        ): void
        removeEventListener(
          type: string,
          handler: (event: { sessionState?: string; castState?: string }) => void,
        ): void
      }

      interface CastOptions {
        receiverApplicationId: string
        autoJoinPolicy: string
      }

      interface CastSession {
        getSessionId(): string
        sendMessage(namespace: string, message: string): Promise<void>
        addMessageListener(
          namespace: string,
          listener: (namespace: string, message: string) => void,
        ): void
        getSessionState(): string
      }

      const CastContextEventType: {
        SESSION_STATE_CHANGED: string
        CAST_STATE_CHANGED: string
      }

      const SessionState: {
        NO_SESSION: string
        SESSION_STARTING: string
        SESSION_STARTED: string
        SESSION_ENDING: string
        SESSION_ENDED: string
        SESSION_RESUMED: string
      }

      const CastState: {
        NO_DEVICES_AVAILABLE: string
        NOT_CONNECTED: string
        CONNECTING: string
        CONNECTED: string
      }

      // ── CAF Receiver SDK ──────────────────────────────────────────────────

      class CastReceiverContext {
        static getInstance(): CastReceiverContext
        start(): void
        stop(): void
        addCustomMessageListener(
          namespace: string,
          listener: (event: { data: string; senderId: string }) => void,
        ): void
        setApplicationState(state: string): void
      }
    }
  }

  namespace chrome.cast {
    const AutoJoinPolicy: {
      TAB_AND_ORIGIN_SCOPED: string
      ORIGIN_SCOPED: string
      PAGE_SCOPED: string
    }
  }

  // Extend Window for __onGCastApiAvailable callback
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void
  }
}

// JSX intrinsic element for the Cast button web component
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'google-cast-launcher': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}
