import type { Player } from '../../core/types/player.ts'
import type { TurnPhase } from '../../core/types/game.ts'

interface CastScoreboardProps {
  players: Player[]
  currentPlayerIndex: number
  tilesRemaining: number
  turnPhase: TurnPhase
  expansionData: Record<string, unknown>
}

export function CastScoreboard({
  players,
  currentPlayerIndex,
  tilesRemaining,
  turnPhase,
  expansionData,
}: CastScoreboardProps) {
  const hasTradersBuilders = (expansionData?.expansions as string[] | undefined)?.includes('traders-builders')
  const tbData = expansionData?.['tradersBuilders'] as { isBuilderBonusTurn?: boolean } | undefined
  const isBuilderBonusTurn = tbData?.isBuilderBonusTurn ?? false

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(10, 12, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      zIndex: 50,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Tiles remaining */}
      <div style={{
        color: '#888',
        fontSize: 14,
        fontFamily: 'monospace',
        marginRight: 'auto',
        whiteSpace: 'nowrap',
      }}>
        {tilesRemaining} tiles
      </div>

      {/* Player score pills */}
      {players.map((player, idx) => {
        const isCurrent = idx === currentPlayerIndex
        return (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 20,
              background: isCurrent ? `${player.color}25` : 'rgba(255,255,255,0.05)',
              border: isCurrent ? `2px solid ${player.color}` : '2px solid transparent',
              transition: 'all 0.4s ease',
              boxShadow: isCurrent ? `0 0 12px ${player.color}40` : 'none',
            }}
          >
            {/* Color dot with pulse for current player */}
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: player.color,
              boxShadow: isCurrent ? `0 0 8px ${player.color}` : 'none',
              animation: isCurrent ? 'cast-pulse 2s infinite' : 'none',
            }} />

            {/* Name */}
            <span style={{
              color: isCurrent ? '#f0f0f0' : '#999',
              fontSize: 15,
              fontWeight: isCurrent ? 700 : 400,
              maxWidth: 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {player.name}
            </span>

            {/* Score */}
            <span style={{
              color: isCurrent ? player.color : '#ccc',
              fontSize: 20,
              fontWeight: 900,
              fontVariantNumeric: 'tabular-nums',
              minWidth: 28,
              textAlign: 'center',
            }}>
              {player.score}
            </span>

            {/* Trader tokens */}
            {hasTradersBuilders && (
              <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                {(['WINE', 'WHEAT', 'CLOTH'] as const).map(commodity => {
                  const count = player.traderTokens?.[commodity] ?? 0
                  if (count === 0) return null
                  const label = commodity === 'WINE' ? '\uD83C\uDF77' : commodity === 'WHEAT' ? '\uD83C\uDF3E' : '\uD83E\uDDF5'
                  return (
                    <span key={commodity} style={{ fontSize: 12, color: '#aaa' }}>
                      {label}{count}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Turn phase */}
      <div style={{
        color: '#666',
        fontSize: 12,
        marginLeft: 'auto',
        textTransform: 'uppercase',
        letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}>
        {isBuilderBonusTurn ? 'Bonus Turn' : turnPhase.replace(/_/g, ' ')}
      </div>
    </div>
  )
}
