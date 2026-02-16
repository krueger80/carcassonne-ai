import type { Player } from '../../core/types/player.ts'

interface PlayerPanelProps {
  player: Player
  isActive: boolean
}

export function PlayerPanel({ player, isActive }: PlayerPanelProps) {
  const availableMeeples = player.meeples.available.NORMAL - player.meeples.onBoard.length

  return (
    <div style={{
      background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
      border: `1px solid ${isActive ? player.color : '#333'}`,
      borderRadius: 6,
      padding: '8px 10px',
      transition: 'all 0.2s',
    }}>
      {/* Name + score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: player.color, fontWeight: 'bold', fontSize: 14 }}>
          {isActive && '▶ '}{player.name}
        </span>
        <span style={{ color: '#f0f0f0', fontWeight: 'bold', fontSize: 18 }}>
          {player.score}
        </span>
      </div>

      {/* Meeple dots */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i < availableMeeples ? player.color : 'rgba(255,255,255,0.1)',
              border: `1px solid ${player.color}`,
              opacity: i < availableMeeples ? 1 : 0.3,
            }}
          />
        ))}
        {player.meeples.onBoard.length > 0 && (
          <span style={{ fontSize: 10, color: '#888', marginLeft: 2 }}>
            {player.meeples.onBoard.length} on board
          </span>
        )}
      </div>
    </div>
  )
}
