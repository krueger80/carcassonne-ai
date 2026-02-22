import { useId } from 'react'
import { motion } from 'framer-motion'

interface MeepleSVGProps {
  color: string
  x: number   // center x in viewBox coords (0-100)
  y: number   // center y in viewBox coords (0-100)
  size?: number  // radius in viewBox units, default 6
  isBig?: boolean
  isBuilder?: boolean
  isPig?: boolean
}

/**
 * Renders a meeple, which can be standard, big, builder, or pig.
 * Coords are in the 0-100 SVG viewBox.
 */
export function MeepleSVG({
  color,
  x,
  y,
  size = 15,
  isBig = false,
  isBuilder = false,
  isPig = false
}: MeepleSVGProps) {
  const scale = isBig ? 1.4 : 1
  const s = size * scale
  const maskId = useId()

  // Builder (generic shape mask + player color)
  if (isBuilder) {
    const builderSize = s * 2.2
    // Offset y so base is at (x, y)
    return (
      <g transform={`translate(${x}, ${y - builderSize / 2})`}>
        <defs>
          <mask id={maskId}>
            {/* Convert alpha to white for the mask */}
            <image href="/images/TradersAndBuilders_Shared/Builder_Mask.png"
              x={-builderSize / 2} y={-builderSize / 2}
              width={builderSize} height={builderSize}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </mask>
        </defs>
        <motion.g
          animate={{ rotate: [0, -3, 3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `0px ${builderSize / 2}px` }}
        >
          <ellipse cx="0" cy={builderSize / 2} rx={s * 0.6} ry={s * 0.2} fill="rgba(0,0,0,0.2)" />
          <rect x={-builderSize / 2} y={-builderSize / 2} width={builderSize} height={builderSize}
            fill={color} mask={`url(#${maskId})`}
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }} />
          {/* Highlight dot for visibility */}
          <circle cx={-s * 0.2} cy={-s * 0.4} r={s * 0.15} fill="rgba(255,255,255,0.3)" pointerEvents="none" />
        </motion.g>
      </g>
    )
  }

  // Pig (generic shape mask + player color)
  if (isPig) {
    const pigSize = s * 2.2
    // Offset y so base is at (x, y)
    return (
      <g transform={`translate(${x}, ${y - pigSize / 2})`}>
        <defs>
          <mask id={maskId}>
            <image href="/images/TradersAndBuilders_Shared/Pig_Mask.png"
              x={-pigSize / 2} y={-pigSize / 2}
              width={pigSize} height={pigSize}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </mask>
        </defs>
        <motion.g
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{ transformOrigin: `0px ${pigSize / 2}px` }}
        >
          <ellipse cx="0" cy={pigSize / 2} rx={s * 0.7} ry={s * 0.2} fill="rgba(0,0,0,0.2)" />
          <rect x={-pigSize / 2} y={-pigSize / 2} width={pigSize} height={pigSize}
            fill={color} mask={`url(#${maskId})`}
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }} />
          <circle cx={-s * 0.3} cy={-s * 0.4} r={s * 0.15} fill="rgba(255,255,255,0.3)" pointerEvents="none" />
        </motion.g>
      </g>
    )
  }

  // Standard / Big Meeple
  const headR = s * 0.45
  const bodyH = s * 0.8
  const baseOffset = headR + bodyH // Distance from head center to base

  return (
    <g transform={`translate(${x}, ${y - baseOffset})`}>
      <motion.g
        animate={{ rotate: [0, -4, 4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: Math.random() }}
        style={{ transformOrigin: `0px ${baseOffset}px` }}
      >
        {/* Drop shadow at the base */}
        <ellipse cx="0" cy={baseOffset} rx={s * 0.55} ry={s * 0.2} fill="rgba(0,0,0,0.25)" />
        {/* Body */}
        <path
          d={`M${-s * 0.5},${headR} Q${-s * 0.7},${baseOffset} 0,${baseOffset} Q${s * 0.7},${baseOffset} ${s * 0.5},${headR} Z`}
          fill={color}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.8"
        />
        {/* Head */}
        <circle
          cx="0" cy="0" r={headR}
          fill={color}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.8"
        />
        {/* Highlight */}
        <circle cx={-headR * 0.3} cy={-headR * 0.3} r={headR * 0.3} fill="rgba(255,255,255,0.3)" />
      </motion.g>
    </g>
  )
}
