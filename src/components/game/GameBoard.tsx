import { useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameScene3D } from './3d/GameScene3D.tsx'
import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
import { GameOverlay } from './GameOverlay.tsx'
import { BotOrchestrator } from './BotOrchestrator.tsx'
import { getFairyPosition } from '../../core/engine/GameEngine.ts'

export function GameBoard() {
  const {
    gameState,
    validPlacements,
    tentativeTileCoord,
    interactionState,
    selectTilePlacement,
    rotateTentativeTile,
    tentativeDragonFacing,
    undoTilePlacement,
    confirmMeeplePlacement,
    cancelMeeplePlacement,
    rotateTile,
    cycleDragonFacing,
    placeableSegments,
    tentativeMeepleSegment,
    tentativeMeepleType,
    tentativeSecondaryMeepleType,
    selectMeeplePlacement,
  } = useGameStore()

  const { hoveredCoord, territoryOverlay, selectedMeepleType } = useUIStore()

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const state = useGameStore.getState().gameState
      if (!state) return
      const currentPlayer = state.players[state.currentPlayerIndex]
      if (currentPlayer?.isBot) return

      if (e.key === 'Escape') {
        const store = useGameStore.getState()
        if (state.turnPhase === 'PLACE_MEEPLE') {
          undoTilePlacement()
        } else if (store.interactionState === 'TILE_PLACED_TENTATIVELY') {
          useGameStore.getState().cancelTilePlacement()
        }
      } else if (e.key === 'r' || e.key === 'R') {
        const phase = state.turnPhase
        if (phase === 'DRAGON_ORIENT') {
          cycleDragonFacing()
        } else {
          rotateTile()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [rotateTile, cycleDragonFacing, undoTilePlacement])

  const currentPlayer = gameState?.players[gameState.currentPlayerIndex]
  const tbData = gameState?.expansionData?.['tradersBuilders'] as { isBuilderBonusTurn?: boolean } | undefined
  const isBuilderBonusTurn = tbData?.isBuilderBonusTurn ?? false

  if (!gameState) return null

  const validSet = useMemo(() => new Set(validPlacements.map(c => `${c.x},${c.y}`)), [validPlacements])

  const fairyPos = getFairyPosition(gameState)
  const dragonPos = useMemo(() => {
    const dfData = gameState.expansionData?.['dragonFairy'] as any
    return dfData?.dragonPosition || null
  }, [gameState])

  const isDragonOrientPhase = gameState.turnPhase === 'DRAGON_ORIENT'
  const dragonFacing = isDragonOrientPhase 
    ? (tentativeDragonFacing ?? null) 
    : (gameState.expansionData?.['dragonFairy'] as any)?.dragonFacing ?? null

  const handleRotateTentativeTile = useCallback(() => rotateTentativeTile(), [rotateTentativeTile])
  const handleSelectTilePlacement = useCallback((coord: { x: number, y: number }) => {
    if (gameState?.turnPhase === 'PLACE_MEEPLE') {
      // If user clicks a DIFFERENT valid spot while in meeple phase, 
      // treat it as "change my mind about tile placement"
      const last = gameState.lastPlacedCoord
      if (last && (last.x !== coord.x || last.y !== coord.y)) {
        undoTilePlacement()
      } else {
        return // Ignore click on the spot where the tile already is
      }
    }
    selectTilePlacement(coord)
  }, [gameState?.turnPhase, gameState?.lastPlacedCoord, undoTilePlacement, selectTilePlacement])

  return (
    <div className="w-full h-full bg-[#0a0a0a]" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <GameScene3D 
          gameState={gameState}
          validSet={validSet}
          hoveredCoord={hoveredCoord}
          tentativeTileCoord={tentativeTileCoord}
          interactionState={interactionState}
          currentPlayer={currentPlayer}
          rotateTentativeTile={handleRotateTentativeTile}
          selectTilePlacement={handleSelectTilePlacement}
          onConfirmMeeple={confirmMeeplePlacement}
          onCancelMeeple={cancelMeeplePlacement}
          dragonPos={dragonPos}
          dragonFacing={dragonFacing || 0}
          fairyPos={fairyPos}
          placeableSegments={placeableSegments}
          selectedMeepleType={selectedMeepleType}
          tentativeMeepleSegment={tentativeMeepleSegment}
          tentativeMeepleType={tentativeMeepleType}
          tentativeSecondaryMeepleType={tentativeSecondaryMeepleType}
          selectMeeplePlacement={selectMeeplePlacement}
        />
      </div>

      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        opacity: 0.7,
        pointerEvents: 'auto',
        zIndex: 100,
      }}>
        <button
          onClick={() => useUIStore.getState().cycleTerritoryOverlay()}
          style={btnStyle}
          title={
            territoryOverlay === 'off' ? 'Territory: Off'
              : territoryOverlay === 'incomplete' ? 'Territory: Incomplete'
                : 'Territory: All'
          }
        >
          {territoryOverlay === 'off' ? '◇' : territoryOverlay === 'incomplete' ? '◈' : '◆'}
        </button>
      </div>

      {/* ── Builder Turn Edge Glow ────────────────────────────────────────── */}
      <AnimatePresence>
        {isBuilderBonusTurn && currentPlayer && (
          <motion.div
            key="bonus-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            exit={{ opacity: 0, transition: { repeat: 0, duration: 0.5 } }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 5,
              boxShadow: `inset 0 0 80px ${currentPlayer.color}25, inset 0 0 200px ${currentPlayer.color}15`,
            }}
          />
        )}
      </AnimatePresence>

      <BotOrchestrator />
      <GameOverlay />
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  background: 'rgba(0,0,0,0.6)',
  border: '1px solid #555',
  color: '#f0f0f0',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 18,
  lineHeight: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
