import { useCallback, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { motion, AnimatePresence } from 'framer-motion'
import { GameScene3D } from './3d/GameScene3D.tsx'
import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
import { GameOverlay } from './GameOverlay.tsx'
import { BotOrchestrator } from './BotOrchestrator.tsx'
import { getFairyPosition, getDragonPosition, getDragonHoardTilesOnBoard, getFairyMoveTargets, computeSegmentOwnerMap } from '../../core/engine/GameEngine.ts'

export function GameBoard() {
  const {
    gameState,
    validPlacements,
    tentativeTileCoord,
    interactionState,
    tentativeDragonFacing,
    placeableSegments,
    tentativeMeepleSegment,
    tentativeMeepleType,
    tentativeSecondaryMeepleType,
    fairyMoveTargets,
    dragonPlaceTargets,
    tentativeFairyTarget,
    tentativeDragonPlaceTarget,
    magicPortalTargets,
  } = useGameStore(useShallow(s => ({
    gameState: s.gameState,
    validPlacements: s.validPlacements,
    tentativeTileCoord: s.tentativeTileCoord,
    interactionState: s.interactionState,
    tentativeDragonFacing: s.tentativeDragonFacing,
    placeableSegments: s.placeableSegments,
    tentativeMeepleSegment: s.tentativeMeepleSegment,
    tentativeMeepleType: s.tentativeMeepleType,
    tentativeSecondaryMeepleType: s.tentativeSecondaryMeepleType,
    fairyMoveTargets: s.fairyMoveTargets,
    dragonPlaceTargets: s.dragonPlaceTargets,
    tentativeFairyTarget: s.tentativeFairyTarget,
    tentativeDragonPlaceTarget: s.tentativeDragonPlaceTarget,
    magicPortalTargets: s.magicPortalTargets,
  })))

  const {
    selectTilePlacement,
    rotateTentativeTile,
    undoTilePlacement,
    cancelTilePlacement,
    cancelMeeplePlacement,
    cancelDragonPlaceTarget,
    cancelFairyTarget,
    rotateTile,
    cycleDragonFacing,
    selectMeeplePlacement,
    moveFairy,
    placeDragonOnHoard,
    selectFairyTarget,
    selectDragonPlaceTarget,
  } = useGameStore(useShallow(s => ({
    selectTilePlacement: s.selectTilePlacement,
    rotateTentativeTile: s.rotateTentativeTile,
    undoTilePlacement: s.undoTilePlacement,
    cancelTilePlacement: s.cancelTilePlacement,
    cancelMeeplePlacement: s.cancelMeeplePlacement,
    cancelDragonPlaceTarget: s.cancelDragonPlaceTarget,
    cancelFairyTarget: s.cancelFairyTarget,
    rotateTile: s.rotateTile,
    cycleDragonFacing: s.cycleDragonFacing,
    selectMeeplePlacement: s.selectMeeplePlacement,
    moveFairy: s.moveFairy,
    placeDragonOnHoard: s.placeDragonOnHoard,
    selectFairyTarget: s.selectFairyTarget,
    selectDragonPlaceTarget: s.selectDragonPlaceTarget,
  })))

  const { hoveredCoord, territoryOverlay, selectedMeepleType, cameraZoomIn, cameraZoomOut, cameraReset } = useUIStore(useShallow(s => ({
    hoveredCoord: s.hoveredCoord,
    territoryOverlay: s.territoryOverlay,
    selectedMeepleType: s.selectedMeepleType,
    cameraZoomIn: s.cameraZoomIn,
    cameraZoomOut: s.cameraZoomOut,
    cameraReset: s.cameraReset,
  })))

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const state = useGameStore.getState().gameState
      if (!state) return
      const currentPlayer = state.players[state.currentPlayerIndex]
      if (currentPlayer?.isBot) return

      if (e.key === 'Escape') {
        const store = useGameStore.getState()
        if (store.interactionState === 'MEEPLE_SELECTED_TENTATIVELY') {
          store.cancelMeeplePlacement()
        } else if (store.tentativeFairyTarget) {
          store.cancelFairyTarget()
        } else if (store.tentativeDragonPlaceTarget) {
          store.cancelDragonPlaceTarget()
        } else if (store.interactionState === 'TILE_PLACED_TENTATIVELY') {
          store.cancelTilePlacement()
        } else if (['PLACE_MEEPLE', 'DRAGON_ORIENT', 'DRAGON_PLACE', 'FAIRY_MOVE'].includes(state.turnPhase)) {
          undoTilePlacement()
        }
      } else if (e.key === 'r' || e.key === 'R') {
        const phase = state.turnPhase
        if (phase === 'DRAGON_ORIENT') {
          cycleDragonFacing()
        } else {
          rotateTile()
        }
      } else if (e.key === '+') {
        cameraZoomIn()
      } else if (e.key === '-') {
        cameraZoomOut()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [rotateTile, cycleDragonFacing, undoTilePlacement, cancelMeeplePlacement, cancelTilePlacement, cancelDragonPlaceTarget, cancelFairyTarget, cameraZoomIn, cameraZoomOut])

  const currentPlayer = gameState?.players[gameState.currentPlayerIndex]
  const tbData = gameState?.expansionData?.['tradersBuilders'] as { isBuilderBonusTurn?: boolean } | undefined
  const isBuilderBonusTurn = tbData?.isBuilderBonusTurn ?? false

  if (!gameState) return null

  const validSet = useMemo(() => new Set(validPlacements.map(c => `${c.x},${c.y}`)), [validPlacements])

  // Sync targets on phase transition
  useEffect(() => {
    if (!gameState) return
    const store = useGameStore.getState()
    if (gameState.turnPhase === 'DRAGON_PLACE' && store.dragonPlaceTargets.length === 0) {
      useGameStore.setState({ dragonPlaceTargets: getDragonHoardTilesOnBoard(gameState) })
    }
    if (gameState.turnPhase === 'FAIRY_MOVE' && store.fairyMoveTargets.length === 0) {
      useGameStore.setState({ fairyMoveTargets: getFairyMoveTargets(gameState) })
    }
  }, [gameState?.turnPhase, gameState])

  const fairyPos = useMemo(() => getFairyPosition(gameState), [gameState])
  const dragonPos = useMemo(() => getDragonPosition(gameState), [gameState])

  const isDragonOrientPhase = gameState.turnPhase === 'DRAGON_ORIENT'
  const dragonFacing = isDragonOrientPhase 
    ? (tentativeDragonFacing ?? null) 
    : (gameState.expansionData?.['dragonFairy'] as any)?.dragonFacing ?? null

  const handleRotateTentativeTile = useCallback(() => rotateTentativeTile(), [rotateTentativeTile])
  const handleSelectTilePlacement = useCallback((coord: { x: number, y: number }) => {
    const phase = gameState?.turnPhase
    const dfData = gameState?.expansionData?.['dragonFairy'] as { dragonMovement?: unknown } | undefined
    const canSwitchHere =
      phase === 'PLACE_MEEPLE' ||
      (phase === 'DRAGON_ORIENT' && !dfData?.dragonMovement)
    if (canSwitchHere) {
      // If user clicks a DIFFERENT valid spot after the tile is already placed,
      // treat it as "change my mind about tile placement"
      const last = gameState?.lastPlacedCoord
      if (last && (last.x !== coord.x || last.y !== coord.y)) {
        undoTilePlacement()
      } else {
        return // Ignore click on the spot where the tile already is
      }
    }
    selectTilePlacement(coord)
  }, [gameState?.turnPhase, gameState?.lastPlacedCoord, gameState?.expansionData, undoTilePlacement, selectTilePlacement])

  const segmentOwnerMap = useMemo(() => {
    if (!gameState.featureUnionFind || territoryOverlay === 'off') return {}
    return computeSegmentOwnerMap(gameState.featureUnionFind, gameState.players, territoryOverlay)
  }, [gameState.featureUnionFind, gameState.players, territoryOverlay])

  return (
    <div className="w-full h-full bg-[#0a0a0a]" style={{ width: '100vw', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
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
          fairyMoveTargets={fairyMoveTargets}
          moveFairy={moveFairy}
          dragonPlaceTargets={dragonPlaceTargets}
          placeDragonOnHoard={placeDragonOnHoard}
          cycleDragonFacing={cycleDragonFacing}
          tentativeFairyTarget={tentativeFairyTarget}
          selectFairyTarget={selectFairyTarget}
          cancelFairyTarget={cancelFairyTarget}
          tentativeDragonPlaceTarget={tentativeDragonPlaceTarget}
          selectDragonPlaceTarget={selectDragonPlaceTarget}
          tentativeDragonFacing={tentativeDragonFacing}
          magicPortalTargets={magicPortalTargets}
          territoryMode={territoryOverlay}
          segmentOwnerMap={segmentOwnerMap}
        />
      </div>

      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: 0.9,
        pointerEvents: 'auto',
        zIndex: 100,
      }}>
        <button
          onClick={() => cameraZoomIn()}
          style={btnStyle}
          title="Zoom In"
          aria-label="Zoom In"
        >
          <span aria-hidden="true">＋</span>
        </button>
        <button
          onClick={() => cameraZoomOut()}
          style={btnStyle}
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <span aria-hidden="true">－</span>
        </button>
        <button
          onClick={() => cameraReset()}
          style={{...btnStyle, fontSize: 14}}
          title="Reset View"
          aria-label="Reset View"
        >
          <span aria-hidden="true">🏠</span>
        </button>
        <div style={{ height: 4 }} />
        <button
          onClick={() => useUIStore.getState().cycleTerritoryOverlay()}
          style={btnStyle}
          title={
            territoryOverlay === 'off' ? 'Territory: Off'
              : territoryOverlay === 'incomplete' ? 'Incomplete farm'
                : 'Territory: All'
          }
          aria-label={
            territoryOverlay === 'off' ? 'Territory: Off'
              : territoryOverlay === 'incomplete' ? 'Incomplete farm'
                : 'Territory: All'
          }
        >
          <span aria-hidden="true">{territoryOverlay === 'off' ? '◇' : territoryOverlay === 'incomplete' ? '◈' : '◆'}</span>
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
