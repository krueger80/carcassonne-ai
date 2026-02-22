import { useRef, useState, useCallback, useEffect, useMemo, memo } from 'react'
import { TileCell } from './TileCell.tsx'
import { PlaceholderCell } from './PlaceholderCell.tsx'
import { DragonPiece } from './DragonPiece.tsx'
import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
import { GameOverlay } from './GameOverlay.tsx'
import { getBuilderPigPlaceableSegments } from '../../core/engine/MeeplePlacement.ts'
import { coordKey, keyToCoord } from '../../core/types/board.ts'
import { getAllPotentialPlacements } from '../../core/engine/GameEngine.ts'

const CELL_SIZE = 88   // px per tile
const BOARD_PADDING = 3  // extra cells around the board edge for expansion room

interface BoardGridProps {
  minX: number
  maxX: number
  minY: number
  maxY: number
  gameState: any
  validSet: Set<string>
  hoveredCoord: any
  tentativeTileCoord: any
  tentativeMeepleSegment: string | null
  tentativeMeepleType: any
  interactionState: string
  placeableSegments: string[]
  builderSegmentsMap: Record<string, string[]>
  pigSegmentsMap: Record<string, string[]>
  portalTargetsMap: Record<string, string[]>
  fairyTargetMap: Record<string, string[]>
  fairySegmentMap: Record<string, string> // New prop: coordKey -> segmentId
  dragonPlaceTargetSet: Set<string>
  dragonPos: any
  dragonFacing: any
  fairyPos: any
  isDragonOrientPhase: boolean
  isDragonPlacePhase: boolean
  isFairyPhase: boolean
  hasPortalTargets: boolean
  rotateTentativeTile: () => void
  selectTilePlacement: (coord: any) => void
  selectMeeplePlacement: (segmentId: string, type: any, coord?: any) => void
  cycleDragonFacing: () => void
  placeDragonOnHoard: (coord: any) => void
  moveFairy: (coord: any, segId: string) => void
  setHoveredCoord: (coord: any) => void
  selectedMeepleType: any
  currentPlayer: any
}

const BoardGrid = memo(({
  minX, maxX, minY, maxY,
  gameState, validSet, hoveredCoord,
  tentativeTileCoord, tentativeMeepleSegment, tentativeMeepleType,
  interactionState,
  placeableSegments, builderSegmentsMap, pigSegmentsMap,
  portalTargetsMap, fairyTargetMap, fairySegmentMap,
  dragonPlaceTargetSet,
  dragonPos, dragonFacing, fairyPos,
  isDragonOrientPhase, isDragonPlacePhase, isFairyPhase,
  hasPortalTargets,
  rotateTentativeTile, selectTilePlacement, selectMeeplePlacement,
  cycleDragonFacing, placeDragonOnHoard, moveFairy,
  setHoveredCoord, selectedMeepleType, currentPlayer
}: BoardGridProps) => {
  const { board } = gameState
  const lastKey = gameState.lastPlacedCoord
    ? `${gameState.lastPlacedCoord.x},${gameState.lastPlacedCoord.y}`
    : ''
  const tentKey = tentativeTileCoord
    ? `${tentativeTileCoord.x},${tentativeTileCoord.y}`
    : ''
  const inMeeplePhaseBrowsing =
    (interactionState === 'IDLE' || interactionState === 'MEEPLE_SELECTED_TENTATIVELY') &&
    gameState.turnPhase === 'PLACE_MEEPLE'

  return (
    <>
      {Array.from({ length: maxY - minY + 1 }, (_, rowIdx) => {
        const y = minY + rowIdx
        return (
          <div key={y} style={{ display: 'flex', height: CELL_SIZE }}>
            {Array.from({ length: maxX - minX + 1 }, (_, colIdx) => {
              const x = minX + colIdx
              const key = `${x},${y}`
              const placedTile = board.tiles[key]
              const isValid = validSet.has(key)
              const isHovered = hoveredCoord?.x === x && hoveredCoord?.y === y
              const tentative = tentativeTileCoord && `${tentativeTileCoord.x},${tentativeTileCoord.y}` === key

              if (tentative && gameState.currentTile && gameState.turnPhase === 'PLACE_TILE') {
                return (
                  <div
                    key={key}
                    style={{ width: CELL_SIZE, height: CELL_SIZE, overflow: 'visible' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      rotateTentativeTile()
                    }}
                  >
                    <TileCell
                      definition={gameState.staticTileMap[gameState.currentTile.definitionId]}
                      tile={{
                        coordinate: { x, y },
                        definitionId: gameState.currentTile.definitionId,
                        rotation: gameState.currentTile.rotation,
                        meeples: {}
                      }}
                      size={CELL_SIZE}
                      players={gameState.players}
                      placeableSegments={[]}
                      isTentative={true}
                    />
                  </div>
                )
              }

              if (placedTile) {
                const segmentsHere: string[] = (() => {
                  if (isFairyPhase) return fairyTargetMap[key] ?? []
                  if (!inMeeplePhaseBrowsing) return []
                  const fromLast = key === lastKey ? placeableSegments : []
                  const builderOpts = builderSegmentsMap[key] ?? []
                  const pigOpts = pigSegmentsMap[key] ?? []
                  const portalOpts = portalTargetsMap[key] ?? []
                  return [...new Set([...fromLast, ...builderOpts, ...pigOpts, ...portalOpts])]
                })()

                const tentativeSegHere = (() => {
                  if (!tentativeMeepleSegment) return undefined
                  const isBuilderOrPig = tentativeMeepleType === 'BUILDER' || tentativeMeepleType === 'PIG'
                  const isPortalPlacement = hasPortalTargets && tentKey && tentKey !== lastKey
                  const activeKey = (isBuilderOrPig || isPortalPlacement) ? tentKey : lastKey
                  return key === activeKey ? tentativeMeepleSegment : undefined
                })()

                const hasDragon = dragonPos && dragonPos.x === x && dragonPos.y === y
                const hasFairy = fairyPos && fairyPos.x === x && fairyPos.y === y
                const isFairyTarget = isFairyPhase && (fairyTargetMap[key]?.length ?? 0) > 0
                const isPortalTarget = inMeeplePhaseBrowsing && portalTargetsMap[key]
                const isDragonPlaceTarget = isDragonPlacePhase && dragonPlaceTargetSet.has(key)
                const isDragonOrientHere = isDragonOrientPhase && hasDragon

                return (
                  <div
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isDragonOrientHere) {
                        cycleDragonFacing()
                      } else if (isDragonPlaceTarget) {
                        placeDragonOnHoard({ x, y })
                      }
                    }}
                    style={{
                      position: 'relative',
                      cursor: (isDragonOrientHere || isDragonPlaceTarget || isFairyTarget) ? 'pointer' : undefined,
                      boxShadow: isDragonOrientHere
                        ? 'inset 0 0 0 3px #e74c3c, 0 0 16px rgba(231,76,60,0.6)'
                        : isDragonPlaceTarget
                          ? 'inset 0 0 0 3px #e74c3c, 0 0 12px rgba(231,76,60,0.4)'
                          : isFairyTarget
                            ? 'inset 0 0 0 3px #f1c40f, 0 0 12px rgba(241,196,15,0.5)'
                            : isPortalTarget
                              ? 'inset 0 0 0 2px #9955cc, 0 0 10px rgba(153,85,204,0.4)'
                              : undefined,
                      borderRadius: (isDragonOrientHere || isDragonPlaceTarget || isFairyTarget || isPortalTarget) ? 2 : undefined,
                      overflow: 'visible', // Allow meeples to overlap neighbors
                    }}
                  >
                      <TileCell
                        definition={gameState.staticTileMap[placedTile.definitionId]}
                        tile={placedTile}
                        size={CELL_SIZE}
                        players={gameState.players}
                        placeableSegments={segmentsHere}
                        onSegmentClick={(segId) => {
                          if (gameState.turnPhase === 'PLACE_MEEPLE') {
                            const bMap = builderSegmentsMap[key]
                            const pMap = pigSegmentsMap[key]
                            const portalMap = portalTargetsMap[key]
                            const canBuild = bMap?.includes(segId)
                            const canPig = pMap?.includes(segId)
                            const canPortal = portalMap?.includes(segId)
                            const canNormal = key === lastKey && placeableSegments.includes(segId)

                            let typeToPlace = selectedMeepleType
                            if (canBuild) {
                              typeToPlace = 'BUILDER'
                              if (selectedMeepleType !== 'BUILDER') useUIStore.setState({ selectedMeepleType: 'BUILDER' })
                            } else if (canPig) {
                              typeToPlace = 'PIG'
                              if (selectedMeepleType !== 'PIG') useUIStore.setState({ selectedMeepleType: 'PIG' })
                            } else if (canNormal) {
                              const isBig = selectedMeepleType === 'BIG'
                              typeToPlace = isBig ? 'BIG' : 'NORMAL'
                              if (selectedMeepleType === 'BUILDER' || selectedMeepleType === 'PIG') {
                                useUIStore.setState({ selectedMeepleType: typeToPlace })
                              }
                            } else if (canPortal) {
                              const isBig = selectedMeepleType === 'BIG'
                              typeToPlace = isBig ? 'BIG' : 'NORMAL'
                            }

                            if (typeToPlace === 'BUILDER' || typeToPlace === 'PIG' || canPortal) {
                              selectMeeplePlacement(segId, typeToPlace, { x, y })
                            } else {
                              selectMeeplePlacement(segId, typeToPlace)
                            }
                          } else if (gameState.turnPhase === 'FAIRY_MOVE') {
                            moveFairy({ x, y }, segId)
                          }
                        }}
                        tentativeMeepleSegment={tentativeSegHere}
                        tentativeMeepleType={tentativeSegHere ? tentativeMeepleType : undefined}
                        currentPlayerColor={currentPlayer?.color}
                        fairySegmentId={fairySegmentMap[key]}
                      />
                      {isDragonPlaceTarget && !hasDragon && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(231, 76, 60, 0.08)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24">
                            <text x="12" y="17" textAnchor="middle" fontSize="14" fill="#e74c3c" opacity="0.6" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>♦</text>
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                }

              return (
                <PlaceholderCell
                  key={key}
                  coord={{ x, y }}
                  size={CELL_SIZE}
                  isValid={isValid}
                  isHovered={isHovered}
                  previewTile={gameState.currentTile}
                  tileMap={gameState.staticTileMap}
                  onHover={() => setHoveredCoord({ x, y })}
                  onLeave={() => setHoveredCoord(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isValid) return
                    selectTilePlacement({ x, y })
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </>
  )
})

export function GameBoard() {
  const {
    gameState,
    validPlacements,
    placeableSegments,
    tentativeTileCoord,
    tentativeMeepleSegment,
    tentativeMeepleType,
    interactionState,
    selectTilePlacement,
    selectMeeplePlacement,
    rotateTentativeTile,
    fairyMoveTargets,
    moveFairy,
    magicPortalTargets,
    cycleDragonFacing,
    dragonPlaceTargets,
    placeDragonOnHoard,
    tentativeDragonFacing,
  } = useGameStore()

  const { boardScale, boardOffset, hoveredCoord, setHoveredCoord, setBoardScale, selectedMeepleType, resetView } = useUIStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [isManualInteraction, setIsManualInteraction] = useState(false)
  const isPointerDown = useRef(false)
  const panStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  const { rotateTile } = useGameStore()
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        const phase = useGameStore.getState().gameState?.turnPhase
        if (phase === 'DRAGON_ORIENT') {
          cycleDragonFacing()
        } else {
          rotateTile()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [rotateTile, cycleDragonFacing])

  // ── Pan/zoom ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault() // Block browser zoom/scroll
      setIsManualInteraction(true)

      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.3, Math.min(3, boardScale * scaleFactor))
      
      if (newScale === boardScale) return

      // Zoom towards mouse position (like Google Maps)
      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left - rect.width / 2
      const mouseY = e.clientY - rect.top - rect.height / 2

      // Calculate how much the offset needs to shift to keep the point under the mouse stable
      const ratio = newScale / boardScale
      const newOffsetX = boardOffset.x - (mouseX - boardOffset.x) * (ratio - 1)
      const newOffsetY = boardOffset.y - (mouseY - boardOffset.y) * (ratio - 1)

      useUIStore.setState({
        boardScale: newScale,
        boardOffset: { x: newOffsetX, y: newOffsetY }
      })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [boardScale, boardOffset])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return // Left or Middle

    setIsManualInteraction(true)
    isPointerDown.current = true
    panStart.current = { x: e.clientX, y: e.clientY, offsetX: boardOffset.x, offsetY: boardOffset.y }
  }, [boardOffset])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDown.current) return

    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    
    if (!isPanning) {
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 5) {
        setIsPanning(true)
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }
      return
    }

    useUIStore.setState({
      boardOffset: { x: panStart.current.offsetX + dx, y: panStart.current.offsetY + dy }
    })
  }, [isPanning])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isPointerDown.current = false
    setIsPanning(false)
    setIsManualInteraction(false)
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    }
  }, [])

  const onPointerCancel = useCallback(() => {
    isPointerDown.current = false
    setIsPanning(false)
    setIsManualInteraction(false)
  }, [])

  // ── Builder/Pig segment map ────────────────

  const currentPlayer = gameState?.players[gameState.currentPlayerIndex]

  const builderSegmentsMap = useMemo<Record<string, string[]>>(() => {
    if (!gameState || !currentPlayer || !gameState.lastPlacedCoord) return {}
    if ((currentPlayer.meeples.available['BUILDER'] ?? 0) <= 0) return {}
    const results = getBuilderPigPlaceableSegments(
      gameState.featureUnionFind,
      gameState.staticTileMap,
      gameState.board,
      gameState.lastPlacedCoord,
      currentPlayer,
      'BUILDER',
    )
    const map: Record<string, string[]> = {}
    for (const { coord, segmentId } of results) {
      const k = `${coord.x},${coord.y}`
      if (!map[k]) map[k] = []
      map[k].push(segmentId)
    }
    return map
  }, [gameState, currentPlayer])

  const pigSegmentsMap = useMemo<Record<string, string[]>>(() => {
    if (!gameState || !currentPlayer || !gameState.lastPlacedCoord) return {}
    if ((currentPlayer.meeples.available['PIG'] ?? 0) <= 0) return {}
    const results = getBuilderPigPlaceableSegments(
      gameState.featureUnionFind,
      gameState.staticTileMap,
      gameState.board,
      gameState.lastPlacedCoord,
      currentPlayer,
      'PIG',
    )
    const map: Record<string, string[]> = {}
    for (const { coord, segmentId } of results) {
      const k = `${coord.x},${coord.y}`
      if (!map[k]) map[k] = []
      map[k].push(segmentId)
    }
    return map
  }, [gameState, currentPlayer])


  // ── Board bounds ────────────────────────────────────────────────────────────

  if (!gameState) return null

  const { board } = gameState
  const minX = board.minX - BOARD_PADDING
  const maxX = board.maxX + BOARD_PADDING
  const minY = board.minY - BOARD_PADDING
  const maxY = board.maxY + BOARD_PADDING

  const dfData = gameState.expansionData?.['dragonFairy'] as any
  const dragonPos = dfData?.dragonPosition ?? null
  const isDragonOrientPhase = gameState.turnPhase === 'DRAGON_ORIENT'
  const dragonFacing = isDragonOrientPhase ? (tentativeDragonFacing ?? null) : (dfData?.dragonFacing ?? null)
  const fairyPos = dfData?.fairyPosition?.coordinate ?? null

  const isDragonPlacePhase = gameState.turnPhase === 'DRAGON_PLACE'
  const dragonPlaceTargetSet = useMemo(() => {
    if (!isDragonPlacePhase) return new Set<string>()
    return new Set(dragonPlaceTargets.map(c => `${c.x},${c.y}`))
  }, [isDragonPlacePhase, dragonPlaceTargets])

  const validSet = new Set(validPlacements.map(c => `${c.x},${c.y}`))

  // Fairy segment map: "x,y" -> segmentId
  const fairySegmentMap = useMemo<Record<string, string>>(() => {
    if (!dfData?.fairyPosition) return {}
    const { coordinate, segmentId } = dfData.fairyPosition
    return { [`${coordinate.x},${coordinate.y}`]: segmentId }
  }, [dfData?.fairyPosition])

  const fairyTargetMap = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {}
    for (const t of fairyMoveTargets) {
      const k = `${t.coordinate.x},${t.coordinate.y}`
      if (!map[k]) map[k] = []
      map[k].push(t.segmentId)
    }
    return map
  }, [fairyMoveTargets])
  const isFairyPhase = gameState.turnPhase === 'FAIRY_MOVE'

  const portalTargetsMap = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {}
    for (const t of magicPortalTargets) {
      const k = `${t.coordinate.x},${t.coordinate.y}`
      if (!map[k]) map[k] = []
      map[k].push(t.segmentId)
    }
    return map
  }, [magicPortalTargets])
  const hasPortalTargets = magicPortalTargets.length > 0

  const boardWidth = (maxX - minX + 1) * CELL_SIZE
  const boardHeight = (maxY - minY + 1) * CELL_SIZE

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#1a2a1a', 
        cursor: isPanning ? 'grabbing' : 'grab',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${boardScale})`,
          transformOrigin: 'center',
          width: boardWidth,
          height: boardHeight,
          willChange: 'transform',
          transition: isManualInteraction ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)',
        }}
      >
        <BoardGrid
          minX={minX} maxX={maxX} minY={minY} maxY={maxY}
          gameState={gameState}
          validSet={validSet}
          hoveredCoord={hoveredCoord}
          tentativeTileCoord={tentativeTileCoord}
          tentativeMeepleSegment={tentativeMeepleSegment}
          tentativeMeepleType={tentativeMeepleType}
          interactionState={interactionState}
          placeableSegments={placeableSegments}
          builderSegmentsMap={builderSegmentsMap}
          pigSegmentsMap={pigSegmentsMap}
          portalTargetsMap={portalTargetsMap}
          fairyTargetMap={fairyTargetMap}
          fairySegmentMap={fairySegmentMap}
          dragonPlaceTargetSet={dragonPlaceTargetSet}
          dragonPos={dragonPos}
          dragonFacing={dragonFacing}
          fairyPos={fairyPos}
          isDragonOrientPhase={isDragonOrientPhase}
          isDragonPlacePhase={isDragonPlacePhase}
          isFairyPhase={isFairyPhase}
          hasPortalTargets={hasPortalTargets}
          rotateTentativeTile={rotateTentativeTile}
          selectTilePlacement={selectTilePlacement}
          selectMeeplePlacement={selectMeeplePlacement}
          cycleDragonFacing={cycleDragonFacing}
          placeDragonOnHoard={placeDragonOnHoard}
          moveFairy={moveFairy}
          setHoveredCoord={setHoveredCoord}
          selectedMeepleType={selectedMeepleType}
          currentPlayer={currentPlayer}
        />

        {/* Global Dragon Piece (Animated) */}
        {dragonPos && (
          <DragonPiece
            x={dragonPos.x}
            y={dragonPos.y}
            minX={minX}
            minY={minY}
            facing={dragonFacing}
            cellSize={CELL_SIZE}
            isOrienting={isDragonOrientPhase}
          />
        )}
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
          onClick={() => { 
            setIsManualInteraction(false);
            setBoardScale(boardScale * 1.5); 
          }} 
          style={btnStyle} 
          title="Zoom in"
        >+</button>
        <button 
          onClick={() => { 
            setIsManualInteraction(false);
            resetView(); 
          }} 
          style={btnStyle} 
          title="Reset view"
        >⌖</button>
        <button 
          onClick={() => { 
            setIsManualInteraction(false);
            setBoardScale(boardScale * 0.66); 
          }} 
          style={btnStyle} 
          title="Zoom out"
        >−</button>
      </div>

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
