import { useGameStore } from './store/gameStore.ts'
import { useState, useEffect } from 'react'
import { SetupScreen } from './components/setup/SetupScreen.tsx'
import { GameBoard } from './components/game/GameBoard.tsx'
import { EndGameModal } from './components/ui/EndGameModal.tsx'
import { TileDebugger } from './components/debug/TileDebugger.tsx'

import { CarcassonneGallery } from './components/CarcassonneGallery.tsx'

function App() {
  const { gameState, refreshDefinitions } = useGameStore()
  const [showDebug] = useState(window.location.hash === '#debug')
  const [showGallery] = useState(window.location.hash === '#gallery')

  useEffect(() => {
    // Refresh definitions from DB on mount so that persisted games get logic updates
    refreshDefinitions()
  }, [])

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
        <EndGameModal players={gameState.players} />
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

      {/* 
        GameOverlay is rendered INSIDE GameBoard now to sit on top of the board 
        but share the relative container? 
        Actually, GameBoard renders GameOverlay at the end.
        So here we just render GameBoard.
      */}
    </div>
  )
}

export default App
