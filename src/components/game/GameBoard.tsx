import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { TileCell } from './TileCell.tsx'
import { PlaceholderCell } from './PlaceholderCell.tsx'
import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
import type { Coordinate } from '../../core/types/board.ts'

const CELL_SIZE = 88   // px per tile
const BOARD_PADDING = 3  // extra cells around the board edge for expansion room
const EMPTY_ARRAY: string[] = []

interface GameBoardProps {
  onTilePlaced?: (coord: Coordinate) => void
  onMeeplePlaced?: (segmentId: string) => void
}

export function GameBoard({ onTilePlaced, onMeeplePlaced }: GameBoardProps) {
  const { gameState, validPlacements, placeableSegments, placeTile, placeMeeple } = useGameStore()
  const { boardScale, boardOffset, hoveredCoord, setHoveredCoord, setBoardScale } = useUIStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  const { rotateTile } = useGameStore()
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
    if (e.button !== 0) return
    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY, offsetX: boardOffset.x, offsetY: boardOffset.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
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

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleHover = useCallback((x: number, y: number) => {
    setHoveredCoord({ x, y })
  }, [setHoveredCoord])

  const handleLeave = useCallback((x: number, y: number) => {
    setHoveredCoord(null) // x,y ignored
  }, [setHoveredCoord])

  const handleClick = useCallback((x: number, y: number) => {
    placeTile({ x, y })
    onTilePlaced?.({ x, y })
  }, [placeTile, onTilePlaced])

  const handleSegmentClick = useCallback((segId: string) => {
    placeMeeple(segId)
    onMeeplePlaced?.(segId)
  }, [placeMeeple, onMeeplePlaced])

  // ── Board bounds ────────────────────────────────────────────────────────────

  const validSet = useMemo(() => {
    return new Set(validPlacements.map(c => `${c.x},${c.y}`))
  }, [validPlacements])

  if (!gameState) return null

  const { board } = gameState
  const minX = board.minX - BOARD_PADDING
  const maxX = board.maxX + BOARD_PADDING
  const minY = board.minY - BOARD_PADDING
  const maxY = board.maxY + BOARD_PADDING

  const isInMeeplePlacement = gameState.turnPhase === 'PLACE_MEEPLE'
  const lastPlacedKey = gameState.lastPlacedCoord
    ? `${gameState.lastPlacedCoord.x},${gameState.lastPlacedCoord.y}`
    : null
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]

  // ── Render ──────────────────────────────────────────────────────────────────

  const boardWidth = (maxX - minX + 1) * CELL_SIZE
  const boardHeight = (maxY - minY + 1) * CELL_SIZE

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'hidden',
        background: '#1a2a1a',
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

                if (placedTile) {
                  return (
                    <TileCell
                      key={key}
                      tile={placedTile}
                      size={CELL_SIZE}
                      players={gameState.players}
                      placeableSegments={isInMeeplePlacement && isHovered && key === lastPlacedKey ? placeableSegments : EMPTY_ARRAY}
                      onSegmentClick={handleSegmentClick}
                    />
                  )
                }

                return (
                  <PlaceholderCell
                    key={key}
                    x={x}
                    y={y}
                    size={CELL_SIZE}
                    isValid={isValid}
                    isHovered={isHovered}
                    previewTile={gameState.currentTile}
                    onHover={handleHover}
                    onLeave={handleLeave}
                    onClick={handleClick}
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
      }}>
        <button
          onClick={() => setBoardScale(boardScale * 1.2)}
          style={btnStyle}
          title="Zoom in"
        >+</button>
        <button
          onClick={() => setBoardScale(1)}
          style={btnStyle}
          title="Reset zoom"
        >⌖</button>
        <button
          onClick={() => setBoardScale(boardScale * 0.8)}
          style={btnStyle}
          title="Zoom out"
        >−</button>
      </div>

      {/* Current player indicator */}
      {currentPlayer && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: currentPlayer.color,
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 'bold',
          border: `1px solid ${currentPlayer.color}`,
          pointerEvents: 'none',
        }}>
          {currentPlayer.name}'s turn — {gameState.turnPhase.replace('_', ' ')}
        </div>
      )}
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
