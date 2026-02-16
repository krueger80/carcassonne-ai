import type { Player } from '../../core/types/player.ts'

interface PlayerPanelProps {
  player: Player
  isActive: boolean
}

export function PlayerPanel({ player, isActive }: PlayerPanelProps) {
  const normalAvail = player.meeples.available.NORMAL
  const bigAvail = player.meeples.available.BIG
  const onBoard = player.meeples.onBoard.length

  // Detect if this player has a big meeple (expansion active):
  // base game total = 7, with I&C total = 8
  const hasBigMeepleExpansion = normalAvail + bigAvail + onBoard > 7

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

      {/* Meeple indicators */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Normal meeples (7 dots) */}
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={`n-${i}`}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i < normalAvail ? player.color : 'rgba(255,255,255,0.1)',
              border: `1px solid ${player.color}`,
              opacity: i < normalAvail ? 1 : 0.3,
            }}
          />
        ))}

        {/* Big meeple (larger dot) */}
        {hasBigMeepleExpansion && (
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: bigAvail > 0 ? player.color : 'rgba(255,255,255,0.1)',
              border: `2px solid ${player.color}`,
              opacity: bigAvail > 0 ? 1 : 0.3,
              marginLeft: 2,
            }}
            title="Big meeple (counts as 2)"
          />
        )}
      </div>

      {onBoard > 0 && (
        <div style={{ fontSize: 10, color: '#888', marginTop: 3 }}>
          {onBoard} on board
        </div>
      )}
    </div>
  )
}
