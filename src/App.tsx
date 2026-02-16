import { useGameStore } from './store/gameStore.ts'
// import { useCallback } from 'react'
import { SetupScreen } from './components/setup/SetupScreen.tsx'
import { GameBoard } from './components/game/GameBoard.tsx'
import { EndGameModal } from './components/ui/EndGameModal.tsx'

function App() {
  const { gameState } = useGameStore()

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
