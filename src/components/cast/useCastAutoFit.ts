import { useState, useEffect, useCallback, type RefObject } from 'react'
import type { GameState } from '../../core/types/game.ts'

const CELL_SIZE = 88
const VIEWPORT_USE = 0.94    // Use 94% of viewport
const SCOREBOARD_HEIGHT = 72 // Reserve for scoreboard at bottom
const MAX_SCALE = 2.0        // Cap to avoid oversized tiles early game

export function useCastAutoFit(
  containerRef: RefObject<HTMLDivElement | null>,
  gameState: GameState | null,
) {
  const [dims, setDims] = useState({ scale: 1, offsetX: 0, offsetY: -30 })

  const recalculate = useCallback(() => {
    if (!gameState || !containerRef.current) return

    const { board } = gameState
    const PADDING = 1
    const cols = (board.maxX - board.minX + 1) + PADDING * 2
    const rows = (board.maxY - board.minY + 1) + PADDING * 2
    const boardW = cols * CELL_SIZE
    const boardH = rows * CELL_SIZE

    const vw = containerRef.current.clientWidth
    const vh = containerRef.current.clientHeight

    const availableW = vw * VIEWPORT_USE
    const availableH = vh * VIEWPORT_USE - SCOREBOARD_HEIGHT

    const scale = Math.min(availableW / boardW, availableH / boardH, MAX_SCALE)

    // Shift board up slightly to center above scoreboard
    const offsetY = -(SCOREBOARD_HEIGHT / 2) * (1 / scale)

    setDims({ scale, offsetX: 0, offsetY: Math.min(offsetY, 0) })
  }, [gameState, containerRef])

  // Recalculate when board bounds change
  useEffect(() => {
    recalculate()
  }, [
    gameState?.board.minX,
    gameState?.board.maxX,
    gameState?.board.minY,
    gameState?.board.maxY,
    recalculate,
  ])

  // Recalculate on window resize
  useEffect(() => {
    const handler = () => recalculate()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [recalculate])

  return dims
}
