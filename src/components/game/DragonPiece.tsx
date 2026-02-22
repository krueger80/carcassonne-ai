import { motion } from 'framer-motion'
import type { Direction } from '../../core/types/tile'

interface DragonPieceProps {
  x: number
  y: number
  minX: number
  minY: number
  facing: Direction | null
  cellSize: number
  isOrienting?: boolean
}

export function DragonPiece({ x, y, minX, minY, facing, cellSize, isOrienting }: DragonPieceProps) {
  // Convert grid coordinates to pixel position relative to the board grid container (top-left is minX, minY)
  const left = (x - minX) * cellSize
  const top = (y - minY) * cellSize

  const getRotation = (d: Direction | null) => {
    switch (d) {
      case 'NORTH': return 0
      case 'EAST': return 90
      case 'SOUTH': return 180
      case 'WEST': return 270
      default: return 0
    }
  }

  return (
    <motion.div
      initial={false}
      animate={{ 
        left, 
        top,
        scale: isOrienting ? 1.2 : 1,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 0.8
      }}
      style={{
        position: 'absolute',
        width: cellSize,
        height: cellSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'none', // GameBoard handles clicks via tile overlays
      }}
    >
      <motion.div
        animate={{ rotate: getRotation(facing) }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          width: '50%',
          height: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isOrienting ? 'rgba(231, 76, 60, 0.2)' : 'transparent',
          borderRadius: '50%',
          boxShadow: isOrienting ? '0 0 20px rgba(231, 76, 60, 0.6)' : 'none',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <defs>
            <filter id="dragon-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
            </filter>
          </defs>
          <g filter="url(#dragon-shadow)">
            {/* Base body shape */}
            <path
              d="M50,10 L85,80 L50,65 L15,80 Z"
              fill="#e74c3c"
              stroke="#c0392b"
              strokeWidth="3"
            />
            {/* Detail lines / Wings hint */}
            <path d="M50,65 L50,30" stroke="#fff" strokeWidth="2" opacity="0.3" />
            <path d="M50,40 L25,60" stroke="#fff" strokeWidth="2" opacity="0.2" />
            <path d="M50,40 L75,60" stroke="#fff" strokeWidth="2" opacity="0.2" />
            
            {/* Eyes */}
            <circle cx="42" cy="35" r="3" fill="white" />
            <circle cx="58" cy="35" r="3" fill="white" />
            <circle cx="42" cy="35" r="1.5" fill="black" />
            <circle cx="58" cy="35" r="1.5" fill="black" />
            
            {/* Glow / Energy core */}
            <circle cx="50" cy="50" r="8" fill="#f1c40f" opacity="0.6">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </motion.div>
      
      {/* Target indicator during orientation */}
      {isOrienting && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{
            position: 'absolute',
            inset: -4,
            border: '3px solid #e74c3c',
            borderRadius: 8,
            pointerEvents: 'none'
          }}
        />
      )}
    </motion.div>
  )
}
