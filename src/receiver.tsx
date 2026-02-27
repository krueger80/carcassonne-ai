import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useGameStore } from './store/gameStore.ts'
import { CastView } from './components/cast/CastView.tsx'
import { CAST_NAMESPACE } from './cast/castConstants.ts'
import './index.css'

function CastReceiver() {
  useEffect(() => {
    const context = cast.framework.CastReceiverContext.getInstance()

    context.addCustomMessageListener(CAST_NAMESPACE, (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'STATE_UPDATE' && message.json) {
          const gameState = JSON.parse(message.json)
          useGameStore.setState({ gameState })
        }
      } catch (err) {
        console.error('[Receiver] Failed to parse message:', err)
      }
    })

    context.setApplicationState('Carcassonne')
    context.start()

    return () => { context.stop() }
  }, [])

  return <CastView />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CastReceiver />
  </StrictMode>,
)
