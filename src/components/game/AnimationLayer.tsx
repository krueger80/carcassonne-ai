import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, FlyingElement } from '../../store/uiStore'
import { useGameStore } from '../../store/gameStore'
import { MeepleSVG } from '../svg/MeepleSVG'
import { useEffect, useState } from 'react'

const CELL_SIZE = 88

export function AnimationLayer() {
  const flyingElements = useUIStore(s => s.flyingElements)
  const removeFlyingElement = useUIStore(s => s.removeFlyingElement)
  const { boardScale, boardOffset } = useUIStore()
  const { gameState } = useGameStore()

  if (!gameState) return null

  const { minX, minY } = gameState.board

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <AnimatePresence>
        {flyingElements.map(element => (
          <FlyingElementView
            key={element.id}
            element={element}
            onComplete={() => removeFlyingElement(element.id)}
            boardScale={boardScale}
            boardOffset={boardOffset}
            minX={minX}
            minY={minY}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function FlyingElementView({
  element,
  onComplete,
  boardScale,
  boardOffset,
  minX,
  minY
}: {
  element: FlyingElement,
  onComplete: () => void,
  boardScale: number,
  boardOffset: { x: number, y: number },
  minX: number,
  minY: number
}) {
  const [targetPos, setTargetPlayerPos] = useState<{ x: number, y: number } | null>(null)

  // Calculate relative position from board origin (minX, minY)
  const relX = (element.startBoardCoord.x - minX) * CELL_SIZE + (element.startBoardNode?.x || 50) * (CELL_SIZE / 100)
  const relY = (element.startBoardCoord.y - minY) * CELL_SIZE + (element.startBoardNode?.y || 50) * (CELL_SIZE / 100)

  const { gameState } = useGameStore.getState()
  if (!gameState) return null

  const BOARD_PADDING = 3
  const maxX = gameState.board.maxX + BOARD_PADDING
  const maxY = gameState.board.maxY + BOARD_PADDING
  const actualMinX = gameState.board.minX - BOARD_PADDING
  const actualMinY = gameState.board.minY - BOARD_PADDING

  const bWidth = (maxX - actualMinX + 1) * CELL_SIZE
  const bHeight = (maxY - actualMinY + 1) * CELL_SIZE

  // Calculate start position in screen space
  const startX = window.innerWidth / 2 + boardOffset.x + (relX - bWidth / 2 + (minX - actualMinX) * CELL_SIZE) * boardScale
  const startY = window.innerHeight / 2 + boardOffset.y + (relY - bHeight / 2 + (minY - actualMinY) * CELL_SIZE) * boardScale

  // Wait, I need the board minX/minY to align correctly with the transform in GameBoard.tsx
  // Actually, the transform in GameBoard is:
  // transform: `translate(-50%, -50%) translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${boardScale})`,
  // This means the board center (relative to its own bounds) is at screen center + offset.

  // Let's refine the math.
  // GameBoard uses boardWidth/boardHeight which is based on minX..maxX.

  useEffect(() => {
    // Find the player card in the sidebar
    const interval = setInterval(() => {
      const el = document.getElementById(`player-card-${element.targetPlayerId}`)
      if (el) {
        const rect = el.getBoundingClientRect()
        setTargetPlayerPos({
          x: rect.left + rect.width / 4, // Fly towards the score/inventory area
          y: rect.top + rect.height / 2
        })
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [element.targetPlayerId])

  if (!targetPos) return null

  const isMeeple = element.type === 'MEEPLE'

  return (
    <motion.div
      initial={{
        x: startX,
        y: startY,
        scale: boardScale,
        opacity: 0
      }}
      animate={{
        x: [startX, startX, targetPos.x],
        y: [startY, startY - 120 * boardScale, targetPos.y],
        scale: isMeeple ? [boardScale, boardScale * 1.4, 0.4] : [boardScale * 1.2, boardScale * 1.6, 0.6],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: isMeeple ? 2.0 : 1.6,
        times: [0, 0.15, 0.85, 1],
        ease: "anticipate"
      }}
      onAnimationComplete={onComplete}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: isMeeple ? 1100 : 1200,
      }}
    >
      {isMeeple ? (
        <div style={{
          filter: `drop-shadow(0 10px 20px rgba(0,0,0,0.4)) drop-shadow(0 0 15px ${element.color}66)`,
          transform: 'rotate(-5deg)'
        }}>
          <svg width="60" height="60" viewBox="0 0 100 100">
            <MeepleSVG
              color={element.color}
              x={50} y={80}
              size={35}
              isBig={element.meepleType === 'BIG'}
              isBuilder={element.meepleType === 'BUILDER'}
              isPig={element.meepleType === 'PIG'}
            />
          </svg>
        </div>
      ) : (
        <div style={{
          color: '#fff',
          fontSize: 32,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 900,
          textShadow: `0 0 10px ${element.color}, 0 0 20px ${element.color}, 0 4px 10px rgba(0,0,0,0.5)`,
          background: 'rgba(20,20,30,0.8)',
          padding: '6px 16px',
          borderRadius: 30,
          border: `3px solid ${element.color}`,
          boxShadow: `0 0 30px ${element.color}44`,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{ fontSize: 20 }}>★</span>
          {element.amount}
        </div>
      )}
    </motion.div>
  )
}
