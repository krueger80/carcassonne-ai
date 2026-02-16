import type { Player } from '../../core/types/player.ts'
import { useGameStore } from '../../store/gameStore.ts'

interface EndGameModalProps {
  players: Player[]
}

export function EndGameModal({ players }: EndGameModalProps) {
  const { resetGame } = useGameStore()

  const sorted = [...players].sort((a, b) => b.score - a.score)
  const winner = sorted[0]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: '#252535',
        border: '1px solid #555',
        borderRadius: 16,
        padding: 40,
        minWidth: 340,
        textAlign: 'center',
        color: '#f0f0f0',
      }}>
        <h2 style={{ color: '#e8d8a0', fontSize: 32, marginBottom: 8, fontFamily: 'serif' }}>
          Game Over!
        </h2>
        <p style={{ color: winner.color, fontSize: 20, fontWeight: 'bold', marginBottom: 32 }}>
          {winner.name} wins with {winner.score} points!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {sorted.map((player, i) => (
            <div key={player.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              background: i === 0 ? 'rgba(255,255,255,0.06)' : 'transparent',
              borderRadius: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#888', width: 20 }}>#{i + 1}</span>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: player.color }} />
                <span style={{ color: player.color, fontWeight: 'bold' }}>{player.name}</span>
              </div>
              <span style={{ fontWeight: 'bold', fontSize: 20 }}>{player.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={resetGame}
          style={{
            background: '#c8a46e',
            color: '#1a1a2e',
            border: 'none',
            padding: '12px 32px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 'bold',
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
