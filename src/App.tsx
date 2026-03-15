import { useGameStore } from './store/gameStore.ts'
import { useUIStore } from './store/uiStore.ts'
import { useState, useEffect } from 'react'
import { SetupScreen } from './components/setup/SetupScreen.tsx'
import { GameBoard } from './components/game/GameBoard.tsx'
import { AnimationLayer } from './components/game/AnimationLayer.tsx'
import { EndGameModal } from './components/ui/EndGameModal.tsx'
import { TileDebugger } from './components/debug/TileDebugger.tsx'

import { CarcassonneGallery } from './components/CarcassonneGallery.tsx'
import { CastView } from './components/cast/CastView.tsx'
import { StatsView } from './components/stats/StatsView.tsx'

function App() {
  const { gameState, refreshDefinitions } = useGameStore()
  const [currentHash, setCurrentHash] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash)
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const showDebug = currentHash === '#debug' || currentHash === '#config'
  const showGallery = currentHash === '#gallery' || currentHash === '#catalog'
  const showCast = currentHash === '#cast' || currentHash === '#tv'
  const showStats = currentHash === '#stats'

  useEffect(() => {
    // Refresh definitions from DB on mount so that persisted games get logic updates
    refreshDefinitions()
  }, [])

  if (showCast) {
    return <CastView />
  }

  if (showStats) {
    return <StatsView />
  }

  if (showGallery) {
    return <CarcassonneGallery />
  }

  if (showDebug) {
    return <TileDebugger />
  }

  if (!gameState) {
    return <SetupScreen />
  }

  if (gameState.phase === 'END') {
    return (
      <>
        <GameScreen />
        <EndGameModal
          players={gameState.players}
          expansions={(gameState.expansionData?.expansions as string[] | undefined) ?? []}
        />
      </>
    )
  }

  return <GameScreen />
}

function Toast() {
  const toastMessage = useUIStore(s => s.toastMessage)
  const dismissToast = useUIStore(s => s.dismissToast)
  if (!toastMessage) return null
  return (
    <div
      onClick={dismissToast}
      style={{
        position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(30,30,30,0.92)', color: '#fff', padding: '10px 20px',
        borderRadius: 8, fontSize: 14, zIndex: 9999, cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)', maxWidth: '80vw', textAlign: 'center',
      }}
    >
      {toastMessage}
    </div>
  )
}

function GameScreen() {
  // Logic mostly moved to GameBoard and GameOverlay

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      <GameBoard />
      <AnimationLayer />
      <Toast />
    </div>
  )
}

export default App
