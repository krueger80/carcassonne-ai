import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore.ts'
import { PLAYER_COLORS } from '../../core/types/player.ts'
import { loadAllTiles } from '../../services/tileRegistry.ts'
import type { TileDefinition } from '../../core/types/tile.ts'
import type { ExpansionSelection, TileEdition, RulesVersion } from '../../core/types/setup.ts'
import { getVersionedExpansionId } from '../../core/types/setup.ts'

const DEFAULT_NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank']

// ─── Expansion metadata ──────────────────────────────────────────────────────

const EXPANSION_META = {
  'inns-cathedrals': {
    label: 'Inns & Cathedrals',
    color: '#9955cc',
    border: '#6a4a9a',
    bg: 'rgba(100,80,160,0.2)',
    hasRules: true,
    rulesLabel: { classic: 'Classic (0 pts incomplete)', modern: 'Modern (1 pt incomplete)' },
    tileOptions: ['C1', 'C2', 'C3', 'C3.1'] as TileEdition[],
    tileCount: { C1: '+18 tiles', C2: '+18 tiles', C3: '+18 tiles', 'C3.1': '+24 tiles' },
  },
  'traders-builders': {
    label: 'Traders & Builders',
    color: '#c8a46e',
    border: '#9a7a3a',
    bg: 'rgba(160,130,60,0.2)',
    hasRules: true,
    rulesLabel: { classic: 'Classic (pig: farm +1/city)', modern: 'Modern (pig: mid-game trigger)' },
    tileOptions: ['C1', 'C2', 'C3', 'C3.1'] as TileEdition[],
    tileCount: { C1: '+24 tiles', C2: '+24 tiles', C3: '+24 tiles', 'C3.1': '+24 tiles' },
  },
  'dragon-fairy': {
    label: 'Dragon & Fairy',
    color: '#e74c3c',
    border: '#c0392b',
    bg: 'rgba(180,50,50,0.2)',
    hasRules: false,
    rulesLabel: { classic: '', modern: '' },
    tileOptions: [] as TileEdition[], // only C3.1 exists
    tileCount: { C1: '', C2: '', C3: '', 'C3.1': '+26 tiles' },
  },
} as const

type ExpId = keyof typeof EXPANSION_META

interface ExpansionState {
  enabled: boolean
  rulesVersion: RulesVersion
  tileEdition: TileEdition
}

const DEFAULT_EXP_STATE: Record<ExpId, ExpansionState> = {
  'inns-cathedrals': { enabled: false, rulesVersion: 'modern', tileEdition: 'C3.1' },
  'traders-builders': { enabled: false, rulesVersion: 'modern', tileEdition: 'C3.1' },
  'dragon-fairy': { enabled: false, rulesVersion: 'modern', tileEdition: 'C3.1' },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TogglePill({
  options, value, onChange, color,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  color: string
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '3px 10px',
            borderRadius: 20,
            border: `1px solid ${value === opt ? color : '#555'}`,
            background: value === opt ? color + '33' : 'transparent',
            color: value === opt ? '#f0f0f0' : '#888',
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: value === opt ? 600 : 400,
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface SetupScreenProps {
  /** When provided, renders as a modal overlay with a Cancel button. */
  onCancel?: () => void
}

export function SetupScreen({ onCancel }: SetupScreenProps) {
  const [playerCount, setPlayerCount] = useState(2)
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES.slice(0, 6))
  const [baseEdition, setBaseEdition] = useState<TileEdition>('C3')
  const [expansions, setExpansions] = useState<Record<ExpId, ExpansionState>>(DEFAULT_EXP_STATE)
  const [isStarting, setIsStarting] = useState(false)
  const { newGame } = useGameStore()

  const setExp = (id: ExpId, patch: Partial<ExpansionState>) =>
    setExpansions(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const handleStart = async () => {
    if (isStarting) return
    setIsStarting(true)
    try {
      const allTiles = await loadAllTiles()

      const baseExpId = { C1: 'base-c1', C2: 'base-c2', C3: 'base-c3', 'C3.1': 'base-c31' }[baseEdition]
      const baseDefs = allTiles.filter((t: TileDefinition) =>
        t.expansionId === baseExpId || (!t.expansionId && baseEdition === 'C2')
      )

      const enabledSelections: ExpansionSelection[] = (
        Object.entries(expansions) as [ExpId, ExpansionState][]
      )
        .filter(([, s]) => s.enabled)
        .map(([id, s]) => ({ id, rulesVersion: s.rulesVersion, tileEdition: s.tileEdition }))

      // Pre-load DB expansion tiles so the engine can prefer them over hardcoded
      const versionedIds = enabledSelections.map(sel => getVersionedExpansionId(sel))
      const extraTileDefs = allTiles.filter(
        (t: TileDefinition) => t.expansionId && (versionedIds as string[]).includes(t.expansionId)
      )

      await newGame({
        playerNames: names.slice(0, playerCount),
        baseDefinitions: baseDefs,
        expansionSelections: enabledSelections,
        extraTileDefinitions: extraTileDefs,
      })
      onCancel?.() // close modal after start (no-op in full-page mode)
    } catch (e: any) {
      console.error(e)
      alert('Failed to start game: ' + (e.message || e))
      setIsStarting(false)
    }
  }

  const card = (
    <div style={{
      background: onCancel ? 'rgba(30,30,40,0.97)' : '#252535',
      border: '1px solid #444',
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 420,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <h2 style={{ margin: 0, color: '#e8d8a0', fontFamily: 'serif', fontSize: onCancel ? 22 : 28, textAlign: 'center' }}>
        {onCancel ? 'New Game' : 'Carcassonne'}
      </h2>
      {!onCancel && (
        <p style={{ margin: 0, color: '#888', textAlign: 'center', fontSize: 13 }}>
          The classic tile-placement game
        </p>
      )}

      {/* ── Players ── */}
      <div>
        <label style={{ display: 'block', marginBottom: 8, color: '#aaa', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Players
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => setPlayerCount(n)} style={{
              flex: 1, padding: '8px 0',
              background: playerCount === n ? '#4a6a4a' : '#333',
              border: `1px solid ${playerCount === n ? '#6a9a6a' : '#555'}`,
              color: '#f0f0f0', borderRadius: 6, cursor: 'pointer',
              fontWeight: playerCount === n ? 'bold' : 'normal', fontSize: 16,
            }}>{n}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: PLAYER_COLORS[i], flexShrink: 0 }} />
              <input
                value={names[i]}
                onChange={e => setNames(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
                style={{
                  flex: 1, background: '#1a1a2e', border: '1px solid #444',
                  color: '#f0f0f0', padding: '5px 8px', borderRadius: 4, fontSize: 13,
                }}
                placeholder={`Player ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Base tiles ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ color: '#aaa', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Base tile set
          </label>
          <TogglePill
            options={['C1', 'C2', 'C3']}
            value={baseEdition}
            onChange={v => setBaseEdition(v as TileEdition)}
            color="#5577aa"
          />
        </div>
      </div>

      {/* ── Expansions ── */}
      <div>
        <label style={{ display: 'block', marginBottom: 8, color: '#aaa', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Expansions
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(Object.entries(EXPANSION_META) as [ExpId, typeof EXPANSION_META[ExpId]][]).map(([id, meta]) => {
            const state = expansions[id]
            return (
              <div key={id} style={{
                borderRadius: 8,
                border: `1px solid ${state.enabled ? meta.border : '#444'}`,
                background: state.enabled ? meta.bg : 'transparent',
                overflow: 'hidden',
              }}>
                {/* Header row */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={state.enabled}
                    onChange={e => setExp(id, { enabled: e.target.checked })}
                    style={{ accentColor: meta.color, width: 15, height: 15 }}
                  />
                  <span style={{ fontSize: 14, color: '#f0f0f0', flex: 1 }}>{meta.label}</span>
                  <span style={{ fontSize: 11, color: '#777' }}>
                    {meta.tileCount[state.tileEdition] || meta.tileCount['C3.1'] || ''}
                  </span>
                </label>

                {/* Sub-controls (only when enabled) */}
                <AnimatePresence>
                  {state.enabled && (meta.hasRules || meta.tileOptions.length > 0) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '6px 12px 10px 37px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {meta.hasRules && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 12, color: '#888', width: 36 }}>Rules</span>
                            <TogglePill
                              options={['classic', 'modern']}
                              value={state.rulesVersion}
                              onChange={v => setExp(id, { rulesVersion: v as RulesVersion })}
                              color={meta.color}
                            />
                          </div>
                        )}
                        {meta.tileOptions.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 12, color: '#888', width: 36 }}>Tiles</span>
                            <TogglePill
                              options={meta.tileOptions as string[]}
                              value={state.tileEdition}
                              onChange={v => setExp(id, { tileEdition: v as TileEdition })}
                              color={meta.color}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 8,
              border: '1px solid #555', background: 'transparent',
              color: '#ccc', fontSize: 15, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleStart}
          disabled={isStarting}
          style={{
            flex: 2, padding: '11px 0', borderRadius: 8, border: 'none',
            background: isStarting ? '#555' : '#c8a46e',
            color: '#1a1a2e', fontSize: 15, fontWeight: 'bold',
            cursor: isStarting ? 'wait' : 'pointer',
            opacity: isStarting ? 0.7 : 1,
          }}
        >
          {isStarting ? 'Starting…' : 'Start Game'}
        </button>
      </div>
    </div>
  )

  // Full-page mode
  if (!onCancel) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', background: '#1a1a2e', color: '#f0f0f0',
        padding: 16, boxSizing: 'border-box'
      }}>
        {card}
        <div style={{ marginTop: 32, display: 'flex', gap: 24, fontSize: 13, opacity: 0.6 }}>
          <a href="#catalog" style={{ color: '#aaa', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
            Browse Extension Catalog
          </a>
          <a href="#debug" style={{ color: '#aaa', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
            Debug Configurator
          </a>
        </div>
      </div>
    )
  }

  // Modal mode
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      padding: 16, overflowY: 'auto', boxSizing: 'border-box'
    }}
      onPointerDown={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {card}
      </motion.div>
    </div>
  )
}
