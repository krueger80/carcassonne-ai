import { useState } from 'react'
import { useGameStore } from '../../store/gameStore.ts'
import { PLAYER_COLORS } from '../../core/types/player.ts'
import { loadAllTiles } from '../../services/tileRegistry.ts'
import type { TileDefinition } from '../../core/types/tile.ts'

const DEFAULT_NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank']

export function SetupScreen() {
  const [playerCount, setPlayerCount] = useState(2)
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES.slice(0, 6))
  const [useInnsCathedrals, setUseInnsCathedrals] = useState(false)
  const [useTradersBuilders, setUseTradersBuilders] = useState(false)
  const [useDragonFairy, setUseDragonFairy] = useState(false)
  const [edition, setEdition] = useState<'C2' | 'C3.1'>('C2')
  const [isStarting, setIsStarting] = useState(false)
  const { newGame } = useGameStore()

  const handleStart = async () => {
    if (isStarting) return
    setIsStarting(true)
    const expansions: string[] = []
    if (useInnsCathedrals) {
      expansions.push(edition === 'C3.1' ? 'inns-cathedrals-c31' : 'inns-cathedrals')
    }
    if (useTradersBuilders) {
      expansions.push(edition === 'C3.1' ? 'traders-builders-c31' : 'traders-builders')
    }
    if (useDragonFairy) expansions.push('dragon-fairy')
    try {
      // Load all tiles and filter based on the selected edition
      const allTiles = await loadAllTiles()
      const baseDefs = allTiles.filter((t: TileDefinition) =>
        (!t.expansionId && edition === 'C2') || // C2 base has no expansionId
        (t.expansionId === 'base' && edition === 'C2') ||
        (t.id.startsWith('base_c3_') && edition === 'C3.1') ||
        (t.expansionId === 'base-c3' && edition === 'C3.1')
      )

      await newGame({
        playerNames: names.slice(0, playerCount),
        expansions,
        baseDefinitions: baseDefs
      })
    } catch (e: any) {
      console.error(e)
      alert("Failed to start game: " + (e.message || e))
      setIsStarting(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#1a1a2e',
      color: '#f0f0f0',
    }}>
      <h1 style={{ color: '#e8d8a0', fontFamily: 'serif', fontSize: 48, marginBottom: 8 }}>
        Carcassonne
      </h1>
      <p style={{ color: '#888', marginBottom: 40 }}>The classic tile-placement game</p>

      <div style={{
        background: '#252535',
        border: '1px solid #444',
        borderRadius: 12,
        padding: 32,
        width: 380,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Player count */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, color: '#aaa', fontSize: 13 }}>
            Number of players
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: playerCount === n ? '#4a6a4a' : '#333',
                  border: `1px solid ${playerCount === n ? '#6a9a6a' : '#555'}`,
                  color: '#f0f0f0',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: playerCount === n ? 'bold' : 'normal',
                  fontSize: 16,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Player names */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: PLAYER_COLORS[i],
                flexShrink: 0,
              }} />
              <input
                value={names[i]}
                onChange={e => setNames(prev => {
                  const next = [...prev]
                  next[i] = e.target.value
                  return next
                })}
                style={{
                  flex: 1,
                  background: '#1a1a2e',
                  border: '1px solid #444',
                  color: '#f0f0f0',
                  padding: '6px 10px',
                  borderRadius: 4,
                  fontSize: 14,
                }}
                placeholder={`Player ${i + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Edition selection */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, color: '#aaa', fontSize: 13 }}>
            Game Edition
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['C2', 'C3.1'] as const).map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setEdition(e)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: edition === e ? '#4a5a8a' : '#333',
                  border: `1px solid ${edition === e ? '#6a7aba' : '#555'}`,
                  color: '#f0f0f0',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: edition === e ? 'bold' : 'normal',
                  fontSize: 14,
                }}
              >
                {e === 'C2' ? '2nd Edition (C2)' : '3.1 Edition (C3.1)'}
              </button>
            ))}
          </div>
        </div>

        {/* Expansions */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, color: '#aaa', fontSize: 13 }}>
            Expansions
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: 4,
            background: useInnsCathedrals ? 'rgba(100,80,160,0.2)' : 'transparent',
            border: `1px solid ${useInnsCathedrals ? '#6a4a9a' : '#555'}`,
          }}>
            <input
              type="checkbox"
              checked={useInnsCathedrals}
              onChange={e => setUseInnsCathedrals(e.target.checked)}
              style={{ accentColor: '#9955cc' }}
            />
            <span style={{ fontSize: 14, color: '#f0f0f0' }}>Inns & Cathedrals</span>
            <span style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>+18 tiles</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: 4,
            background: useTradersBuilders ? 'rgba(160,130,60,0.2)' : 'transparent',
            border: `1px solid ${useTradersBuilders ? '#9a7a3a' : '#555'}`,
          }}>
            <input
              type="checkbox"
              checked={useTradersBuilders}
              onChange={e => setUseTradersBuilders(e.target.checked)}
              style={{ accentColor: '#c8a46e' }}
            />
            <span style={{ fontSize: 14, color: '#f0f0f0' }}>Traders & Builders</span>
            <span style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>+24 tiles</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: 4,
            background: useDragonFairy ? 'rgba(180,50,50,0.2)' : 'transparent',
            border: `1px solid ${useDragonFairy ? '#c0392b' : '#555'}`,
            marginTop: 4,
          }}>
            <input
              type="checkbox"
              checked={useDragonFairy}
              onChange={e => setUseDragonFairy(e.target.checked)}
              style={{ accentColor: '#e74c3c' }}
            />
            <span style={{ fontSize: 14, color: '#f0f0f0' }}>Dragon & Fairy</span>
            <span style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>+26 tiles</span>
          </label>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={isStarting}
          style={{
            background: isStarting ? '#666' : '#c8a46e',
            color: '#1a1a2e',
            border: 'none',
            padding: '12px 0',
            borderRadius: 8,
            cursor: isStarting ? 'wait' : 'pointer',
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 8,
            opacity: isStarting ? 0.7 : 1
          }}
        >
          {isStarting ? 'Starting Game...' : 'Start Game'}
        </button>
      </div>

      <div style={{
        marginTop: 40,
        display: 'flex',
        gap: 24,
        fontSize: 14,
        opacity: 0.7
      }}>
        <a
          href="#catalog"
          style={{ color: '#aaa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
        >
          <span>📚</span> Browse Extension Catalog
        </a>
        <a
          href="#debug"
          style={{ color: '#aaa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
        >
          <span>🔧</span> Debug Configurator
        </a>
      </div>
    </div>
  )
}
