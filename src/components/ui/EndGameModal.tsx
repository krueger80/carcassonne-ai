import type { Player } from '../../core/types/player.ts'
import { useGameStore } from '../../store/gameStore.ts'

interface EndGameModalProps {
  players: Player[]
  expansions?: string[]
}

export function EndGameModal({ players, expansions = [] }: EndGameModalProps) {
  const { resetGame, gameState } = useGameStore()
  const hasTradersBuilders = expansions.includes('traders-builders')
  const tbData = gameState?.expansionData?.['tradersBuilders'] as { useModernTerminology?: boolean } | undefined
  const useModernTerminology = tbData?.useModernTerminology ?? false

  const sorted = [...players].sort((a, b) => b.score - a.score)
  const winner = sorted[0]

  // Trader token summaries (if T&B active)
  const commodities = ['CLOTH', 'WHEAT', 'WINE'] as const
  const COMMODITY_IMAGES = {
    CLOTH: '/images/TradersAndBuilders_Shared/Good_Cloth.png',
    WHEAT: '/images/TradersAndBuilders_Shared/Good_Grain.png',
    WINE: '/images/TradersAndBuilders_Shared/Good_Wine.png',
  }
  const commodityLabels: Record<string, string> = {
    CLOTH: 'Cloth',
    WHEAT: useModernTerminology ? 'Grain' : 'Wheat',
    WINE: useModernTerminology ? 'Chicken' : 'Wine'
  }

  const traderBonuses = hasTradersBuilders ? commodities.map(c => {
    const max = Math.max(...players.map(p => p.traderTokens?.[c] ?? 0))
    if (max === 0) return null
    const winners = players.filter(p => (p.traderTokens?.[c] ?? 0) === max)
    return { commodity: c, max, winners }
  }).filter(Boolean) : []

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
        minWidth: 400,
        maxWidth: 550,
        textAlign: 'center',
        color: '#f0f0f0',
      }}>
        <h2 style={{ color: '#e8d8a0', fontSize: 32, marginBottom: 8, fontFamily: 'serif' }}>
          Game Over!
        </h2>
        <p style={{ color: winner.color, fontSize: 20, fontWeight: 'bold', marginBottom: 32 }}>
          {winner.name} wins with {winner.score} points!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: hasTradersBuilders ? 24 : 32 }}>
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
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {hasTradersBuilders && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {commodities.map(c => (
                      <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, color: '#aaa', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 }}>
                        <img src={COMMODITY_IMAGES[c]} alt={c} style={{ width: 16, height: 16, objectFit: 'contain' }} />
                        <span>{player.traderTokens?.[c] ?? 0}</span>
                      </div>
                    ))}
                  </div>
                )}
                <span style={{ fontWeight: 'bold', fontSize: 20 }}>{player.score}</span>
              </div>
            </div>
          ))}
        </div>

        {hasTradersBuilders && traderBonuses.length > 0 && (
          <div style={{
            background: 'rgba(200,164,110,0.1)',
            border: '1px solid rgba(200,164,110,0.4)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            textAlign: 'left',
          }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#c8a46e', marginBottom: 8 }}>Trader Bonuses</div>
            {traderBonuses.map(b => b && (
              <div key={b.commodity} style={{ fontSize: 12, color: '#ccc', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={COMMODITY_IMAGES[b.commodity]} alt={b.commodity} style={{ width: 16, height: 16, objectFit: 'contain' }} />
                <span>{commodityLabels[b.commodity]}</span>
                <span style={{ color: '#888' }}> — {b.winners.map(w => w.name).join(' & ')} ({b.max} tokens → +10 pts)</span>
              </div>
            ))}
          </div>
        )}

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
