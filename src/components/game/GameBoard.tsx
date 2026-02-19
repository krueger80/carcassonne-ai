import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { TileCell } from './TileCell.tsx'
import { PlaceholderCell } from './PlaceholderCell.tsx'
import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
// import type { Coordinate } from '../../core/types/board.ts'
import { GameOverlay } from './GameOverlay.tsx'
import { getBuilderPigPlaceableSegments } from '../../core/engine/MeeplePlacement.ts'

const CELL_SIZE = 88   // px per tile
const BOARD_PADDING = 3  // extra cells around the board edge for expansion room

interface GameBoardProps {
  // onTilePlaced?: (coord: Coordinate) => void  <-- Deprecated in favor of store actions
  // onMeeplePlaced?: (segmentId: string) => void <-- Deprecated
}

export function GameBoard({ }: GameBoardProps) {
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
    rotateTentativeTile
  } = useGameStore()

  const { boardScale, boardOffset, hoveredCoord, setHoveredCoord, setBoardScale, selectedMeepleType } = useUIStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  const { rotateTile } = useGameStore() // Keep using rotateTile for tentative rotation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') rotateTile()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [rotateTile])

  // ── Pan/zoom ────────────────────────────────────────────────────────────────

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setBoardScale(boardScale * delta)
  }, [boardScale, setBoardScale])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan if middle mouse or if spacebar held (optional), or just left click on background
    // But we need left click for interacting with tiles.
    // Let's us middle click OR left click on background (checked in onPointerDown? No, event bubbles)

    // Simple approach: drag background to pan. 
    // If clicking a tile, e.stopPropagation() should be called there if it handles click.

    if (e.button !== 0 && e.button !== 1) return // Left or Middle

    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY, offsetX: boardOffset.x, offsetY: boardOffset.y }
      ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [boardOffset])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    useUIStore.setState({
      boardOffset: { x: panStart.current.offsetX + dx, y: panStart.current.offsetY + dy }
    })
  }, [isPanning])

  const onPointerUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // ── Builder/Pig segment map (computed once per render cycle) ────────────────

  const currentPlayer = gameState?.players[gameState.currentPlayerIndex]


  // ── Builder/Pig segment maps (calculated if player has meeples) ─────────────

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

  const validSet = new Set(validPlacements.map(c => `${c.x},${c.y}`))

  // Is this specific cell the tentative one?
  const isTentative = (key: string) => {
    return tentativeTileCoord && `${tentativeTileCoord.x},${tentativeTileCoord.y}` === key
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const boardWidth = (maxX - minX + 1) * CELL_SIZE
  const boardHeight = (maxY - minY + 1) * CELL_SIZE

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#1a2a1a', // Dark green felt-like
        cursor: isPanning ? 'grabbing' : 'grab',
        position: 'relative',
      }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Scrollable board area */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${boardScale})`,
          transformOrigin: 'center',
          width: boardWidth,
          height: boardHeight,
        }}
      >
        {/* Render all cells in the grid */}
        {Array.from({ length: maxY - minY + 1 }, (_, rowIdx) => {
          const y = minY + rowIdx
          return (
            <div
              key={y}
              style={{ display: 'flex', height: CELL_SIZE }}
            >
              {Array.from({ length: maxX - minX + 1 }, (_, colIdx) => {
                const x = minX + colIdx
                const key = `${x},${y}`
                const placedTile = board.tiles[key]
                const isValid = validSet.has(key)
                const isHovered = hoveredCoord?.x === x && hoveredCoord?.y === y
                const tentative = isTentative(key)

                // If there's a tentative tile, show it as if it were placed (but distinct visual?)
                // Or just render TileCell but pass it special props?

                if (tentative && gameState.currentTile) {
                  return (
                    // Tentative Tile
                    <div
                      key={key}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      onClick={(e) => {
                        e.stopPropagation() // Prevent panning
                        rotateTentativeTile() // Click to rotate!
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <TileCell
                        definition={gameState.staticTileMap[gameState.currentTile.definitionId]}
                        tile={{
                          coordinate: { x, y },
                          definitionId: gameState.currentTile.definitionId,
                          rotation: gameState.currentTile.rotation,
                          meeples: {} // No meeples yet
                        }}
                        size={CELL_SIZE}
                        players={gameState.players}
                        placeableSegments={[]} // No meeples yet
                        isTentative={true}
                      />
                    </div>
                  )
                }

                if (placedTile) {
                  const lastKey = gameState.lastPlacedCoord
                    ? `${gameState.lastPlacedCoord.x},${gameState.lastPlacedCoord.y}`
                    : ''
                  const tentKey = tentativeTileCoord
                    ? `${tentativeTileCoord.x},${tentativeTileCoord.y}`
                    : ''
                  const inMeeplePhaseBrowsing =
                    (interactionState === 'IDLE' || interactionState === 'MEEPLE_SELECTED_TENTATIVELY') &&
                    gameState.turnPhase === 'PLACE_MEEPLE'

                  // Determine which segments to highlight on this tile
                  const segmentsHere: string[] = (() => {
                    if (!inMeeplePhaseBrowsing) return []
                    const fromLast = key === lastKey ? placeableSegments : []
                    // Merge with builder/pig options
                    const builderOpts = builderSegmentsMap[key] ?? []
                    const pigOpts = pigSegmentsMap[key] ?? []
                    return [...new Set([...fromLast, ...builderOpts, ...pigOpts])]
                  })()

                  // Show tentative meeple ghost on the correct tile
                  const tentativeSegHere = (() => {
                    if (!tentativeMeepleSegment) return undefined
                    const isBuilderOrPig = tentativeMeepleType === 'BUILDER' || tentativeMeepleType === 'PIG'
                    const activeKey = isBuilderOrPig ? tentKey : lastKey
                    return key === activeKey ? tentativeMeepleSegment : undefined
                  })()

                  return (
                    <div key={key} onClick={(e) => e.stopPropagation()}>
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
                            const canBuild = bMap?.includes(segId)
                            const canPig = pMap?.includes(segId)
                            const canNormal = key === lastKey && placeableSegments.includes(segId)

                            let typeToPlace = selectedMeepleType
                            if (canBuild) {
                              typeToPlace = 'BUILDER'
                              if (selectedMeepleType !== 'BUILDER') useUIStore.setState({ selectedMeepleType: 'BUILDER' })
                            } else if (canPig) {
                              typeToPlace = 'PIG'
                              if (selectedMeepleType !== 'PIG') useUIStore.setState({ selectedMeepleType: 'PIG' })
                            } else if (canNormal) {
                              // If currently BIG, stay BIG. Else NORMAL.
                              const isBig = selectedMeepleType === 'BIG'
                              typeToPlace = isBig ? 'BIG' : 'NORMAL'
                              // Ensure UI matches (if we were in Builder/Pig mode, switch back)
                              if (selectedMeepleType === 'BUILDER' || selectedMeepleType === 'PIG') {
                                useUIStore.setState({ selectedMeepleType: typeToPlace })
                              }
                            }

                            if (typeToPlace === 'BUILDER' || typeToPlace === 'PIG') {
                              selectMeeplePlacement(segId, typeToPlace, { x, y })
                            } else {
                              selectMeeplePlacement(segId, typeToPlace)
                            }
                          }
                        }}
                        tentativeMeepleSegment={tentativeSegHere}
                      />
                    </div>
                  )
                }

                // Placeholder / Ghost
                return (
                  <PlaceholderCell
                    key={key}
                    coord={{ x, y }}
                    size={CELL_SIZE}
                    isValid={isValid}
                    isHovered={isHovered}
                    previewTile={gameState.currentTile} // Pass null to avoid old hover preview if we want only click?
                    // Actually, if we want GHOST tiles, we can pass previewTile.
                    // But typically ghosts are faint versions of the tile.
                    // The 'PlaceholderCell' implementation might need checking.
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
      </div>

      {/* Compass / controls overlay */}
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
          onClick={() => { setBoardScale(boardScale * 1.2) }}
          style={btnStyle}
          title="Zoom in"
        >+</button>
        <button
          onClick={() => { setBoardScale(1) }}
          style={btnStyle}
          title="Reset zoom"
        >⌖</button>
        <button
          onClick={() => { setBoardScale(boardScale * 0.8) }}
          style={btnStyle}
          title="Zoom out"
        >−</button>
      </div>

      {/* HUD Overlay */}
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
