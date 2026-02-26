import { useGameStore } from './store/gameStore.ts'
import { useState, useEffect } from 'react'
import { SetupScreen } from './components/setup/SetupScreen.tsx'
import { GameBoard } from './components/game/GameBoard.tsx'
import { AnimationLayer } from './components/game/AnimationLayer.tsx'
import { EndGameModal } from './components/ui/EndGameModal.tsx'
import { TileDebugger } from './components/debug/TileDebugger.tsx'

import { CarcassonneGallery } from './components/CarcassonneGallery.tsx'
import { CastView } from './components/cast/CastView.tsx'

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

  useEffect(() => {
    // Refresh definitions from DB on mount so that persisted games get logic updates
    refreshDefinitions()
  }, [])

  if (showCast) {
    return <CastView />
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

function GameScreen() {
  // Logic mostly moved to GameBoard and GameOverlay

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <GameBoard />
      <AnimationLayer />
    </div>
  )
}

export default App
