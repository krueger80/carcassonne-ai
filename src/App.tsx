import { useGameStore } from './store/gameStore.ts'
import { useCallback } from 'react'
import { SetupScreen } from './components/setup/SetupScreen.tsx'
import { GameBoard } from './components/game/GameBoard.tsx'
import { CurrentTilePanel } from './components/game/CurrentTilePanel.tsx'
import { PlayerPanel } from './components/ui/PlayerPanel.tsx'
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
  const { gameState, resetGame } = useGameStore()
  if (!gameState) return null

  const handleNewGame = useCallback(() => {
    if (window.confirm('Abandon current game and start a new one?')) {
      resetGame()
    }
  }, [resetGame])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left sidebar: player scores */}
      <div style={{
        background: '#1e1e2e',
        borderRight: '1px solid #333',
        padding: '12px',
        width: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
        flexShrink: 0,
      }}>
        <h2 style={{ color: '#e8d8a0', fontSize: 14, fontFamily: 'serif', marginBottom: 4 }}>
          Carcassonne
        </h2>
        {gameState.players.map((player, i) => (
          <PlayerPanel
            key={player.id}
            player={player}
            isActive={i === gameState.currentPlayerIndex}
          />
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <button onClick={handleNewGame} style={{
            width: '100%',
            padding: '6px 0',
            background: 'transparent',
            border: '1px solid #555',
            color: '#aaa',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}>
            New Game
          </button>
        </div>
      </div>

      {/* Main board */}
      <GameBoard />

      {/* Right sidebar: current tile + actions */}
      <CurrentTilePanel />
    </div>
  )
}

export default App
