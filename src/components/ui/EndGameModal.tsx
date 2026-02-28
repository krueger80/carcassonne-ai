import { useState } from 'react'
import type { Player } from '../../core/types/player.ts'
import { useGameStore } from '../../store/gameStore.ts'

interface EndGameModalProps {
  players: Player[]
  expansions?: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  ROAD: 'Routes',
  CITY: 'Cités',
  CLOISTER: 'Monastères',
  FIELD: 'Fermes',
  TRADER: 'Marchands',
}

const CATEGORY_ICONS: Record<string, string> = {
  ROAD: '🛤️',
  CITY: '🏰',
  CLOISTER: '⛪',
  FIELD: '🌾',
  TRADER: '📦',
}

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

const COMMODITY_IMAGES = {
  CLOTH: '/images/TradersAndBuilders_Shared/Good_Cloth.png',
  WHEAT: '/images/TradersAndBuilders_Shared/Good_Grain.png',
  WINE:  '/images/TradersAndBuilders_Shared/Good_Wine.png',
}

export function EndGameModal({ players, expansions = [] }: EndGameModalProps) {
  const { resetGame } = useGameStore()
  const hasTradersBuilders = expansions.includes('traders-builders')
  const [hidden, setHidden] = useState(false)

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100,
          background: 'linear-gradient(135deg, #c8a46e, #a07840)',
          color: '#1a1a2e',
          border: 'none',
          borderRadius: 24,
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}
      >
        🏆 Résultats
      </button>
    )
  }

  const sorted = [...players].sort((a, b) => b.score - a.score)
  const winner = sorted[0]

  // Which categories actually have any points across all players
  const allCategories: Array<'ROAD' | 'CITY' | 'CLOISTER' | 'FIELD' | 'TRADER'> = [
    'ROAD', 'CITY', 'CLOISTER', 'FIELD',
    ...(hasTradersBuilders ? (['TRADER'] as const) : []),
  ]
  const activeCategories = allCategories.filter(cat =>
    players.some(p => (p.scoreBreakdown?.[cat] ?? 0) > 0)
  )

  // Tie detection
  const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score

  // Trader token summaries
  const commodities = ['CLOTH', 'WHEAT', 'WINE'] as const
  const traderBonuses = hasTradersBuilders ? commodities.map(c => {
    const max = Math.max(...players.map(p => p.traderTokens?.[c] ?? 0))
    if (max === 0) return null
    const winners = players.filter(p => (p.traderTokens?.[c] ?? 0) === max)
    return { commodity: c, max, winners }
  }).filter(Boolean) : []

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
        overflowY: 'auto',
      }}
      onPointerDown={() => setHidden(true)}
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        style={{
        background: 'linear-gradient(160deg, #1e1e2e 0%, #252535 100%)',
        border: '1px solid #444',
        borderRadius: 20,
        padding: '36px 40px',
        width: '100%',
        maxWidth: 680,
        color: '#f0f0f0',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, lineHeight: 1 }}>🏆</div>
          <h2 style={{ color: '#e8d8a0', fontSize: 28, margin: '8px 0 4px', fontFamily: 'serif' }}>
            Fin de Partie
          </h2>
          {isTie ? (
            <p style={{ color: '#aaa', fontSize: 16, margin: 0 }}>
              Égalité entre{' '}
              {sorted.filter(p => p.score === winner.score).map(p =>
                <span key={p.id} style={{ color: p.color, fontWeight: 'bold' }}>{p.name}</span>
              ).reduce<React.ReactNode[]>((acc, el, i) => i === 0 ? [el] : [...acc, ' & ', el], [])}
              {' '}avec{' '}
              <strong style={{ color: '#e8d8a0' }}>{winner.score} pts</strong> !
            </p>
          ) : (
            <p style={{ color: winner.color, fontSize: 17, margin: 0, fontWeight: 'bold' }}>
              {winner.name} gagne avec{' '}
              <span style={{ color: '#e8d8a0' }}>{winner.score} points</span> !
            </p>
          )}
        </div>

        {/* Score table */}
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 8, width: 24 }}></th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Joueur</th>
                {activeCategories.map(cat => (
                  <th key={cat} style={{ ...thStyle, textAlign: 'center', minWidth: 68 }}>
                    <div style={{ fontSize: 18 }}>{CATEGORY_ICONS[cat]}</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{CATEGORY_LABELS[cat]}</div>
                  </th>
                ))}
                <th style={{ ...thStyle, textAlign: 'center', minWidth: 64, borderLeft: '1px solid #444' }}>
                  <div style={{ fontSize: 14, color: '#e8d8a0', fontWeight: 'bold' }}>Total</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((player, rank) => {
                const isWinner = rank === 0
                return (
                  <tr
                    key={player.id}
                    style={{
                      background: isWinner
                        ? 'rgba(232,216,160,0.06)'
                        : rank % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      borderTop: '1px solid #333',
                    }}
                  >
                    <td style={{ ...tdStyle, paddingLeft: 8, fontSize: 18 }}>
                      {MEDAL[rank] ?? `#${rank + 1}`}
                    </td>
                    <td style={{ ...tdStyle }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: player.color, flexShrink: 0,
                        }} />
                        <span style={{ color: player.color, fontWeight: 'bold' }}>{player.name}</span>
                      </div>
                    </td>
                    {activeCategories.map(cat => {
                      const pts = player.scoreBreakdown?.[cat] ?? 0
                      return (
                        <td key={cat} style={{ ...tdStyle, textAlign: 'center' }}>
                          {pts > 0
                            ? <span style={{ color: '#f0f0f0' }}>{pts}</span>
                            : <span style={{ color: '#555' }}>—</span>
                          }
                        </td>
                      )
                    })}
                    <td style={{
                      ...tdStyle,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: isWinner ? '#e8d8a0' : '#f0f0f0',
                      borderLeft: '1px solid #444',
                    }}>
                      {player.score}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Category legend */}
        {activeCategories.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 20px',
            marginBottom: 20,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            fontSize: 12,
            color: '#888',
          }}>
            {activeCategories.map(cat => (
              <span key={cat}>
                {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                {cat === 'ROAD' && ' : 1 pt/tuile'}
                {cat === 'CITY' && ' : 2 pts/tuile (complète)'}
                {cat === 'CLOISTER' && ' : 1 pt/tuile adjacente'}
                {cat === 'FIELD' && ' : 3 pts/cité complète'}
                {cat === 'TRADER' && ' : bonus marchand 10 pts'}
              </span>
            ))}
          </div>
        )}

        {/* Trader tokens detail */}
        {hasTradersBuilders && traderBonuses.length > 0 && (
          <div style={{
            background: 'rgba(200,164,110,0.08)',
            border: '1px solid rgba(200,164,110,0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#c8a46e', marginBottom: 8 }}>
              Bonus marchands (jetons)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {traderBonuses.map(b => b && (
                <div key={b.commodity} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '4px 10px',
                  fontSize: 12, color: '#ccc',
                }}>
                  <img src={COMMODITY_IMAGES[b.commodity]} alt={b.commodity}
                    style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  <span style={{ color: '#e8d8a0', fontWeight: 'bold' }}>{b.max}</span>
                  <span>→</span>
                  {b.winners.map(w => (
                    <span key={w.id} style={{ color: w.color, fontWeight: 'bold' }}>{w.name}</span>
                  ))}
                  <span style={{ color: '#888' }}>+10 pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Play again / Show board */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => setHidden(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#ccc',
              border: '1px solid #555',
              padding: '13px 28px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 'bold',
            }}
          >
            🗺️ Voir le plateau
          </button>
          <button
            onClick={resetGame}
            style={{
              background: 'linear-gradient(135deg, #c8a46e, #a07840)',
              color: '#1a1a2e',
              border: 'none',
              padding: '13px 28px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 16px rgba(200,164,110,0.3)',
            }}
          >
            Rejouer
          </button>
        </div>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontWeight: 'bold',
  color: '#ccc',
  background: 'rgba(255,255,255,0.03)',
  borderBottom: '1px solid #444',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 10px',
  verticalAlign: 'middle',
}
