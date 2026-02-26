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

  // Builder (generic shape mask + player color)
  if (isBuilder) {
    const headR = s * 0.45
    const bodyH = s * 1.1 // Taller body
    const baseOffset = headR + bodyH
    return (
      <g transform={`translate(${x}, ${y - baseOffset})`}>
        <motion.g
          animate={{ rotate: [0, -3, 3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `0px ${baseOffset}px` }}
        >
          {/* Drop shadow at the base */}
          <ellipse cx="0" cy={baseOffset} rx={s * 0.6} ry={s * 0.2} fill="rgba(0,0,0,0.25)" />
          {/* Torso/Legs */}
          <path
            d={`M${-s * 0.4},${headR + s * 0.2} 
                L${-s * 0.7},${baseOffset} 
                L${s * 0.7},${baseOffset} 
                L${s * 0.4},${headR + s * 0.2} Z`}
            fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
          {/* Broad Shoulders */}
          <rect x={-s * 0.7} y={headR} width={s * 1.4} height={s * 0.35} rx={s * 0.15} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
          {/* Large Head */}
          <circle cx="0" cy="0" r={headR * 1.2} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
          {/* Highlight */}
          <circle cx={-headR * 0.4} cy={-headR * 0.4} r={headR * 0.4} fill="rgba(255,255,255,0.3)" />
        </motion.g>
      </g>
    )
  }

  // Pig (generic shape mask + player color)
  if (isPig) {
    const pigW = s * 0.9
    const pigH = s * 0.6
    return (
      <g transform={`translate(${x}, ${y - pigH / 2})`}>
        <motion.g
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{ transformOrigin: `0px ${pigH}px` }}
        >
          {/* shadow */}
          <ellipse cx="0" cy={pigH} rx={pigW} ry={pigW * 0.3} fill="rgba(0,0,0,0.25)" />
          {/* Pig Body/Legs */}
          <path d={`M${-pigW * 0.8},${pigH * 0.2} 
                    Q${-pigW},${-pigH * 0.8} ${pigW * 0.5},${-pigH * 0.8} 
                    Q${pigW * 1.2},${-pigH * 0.4} ${pigW},${pigH * 0.2}
                    L${pigW * 0.8},${pigH} L${pigW * 0.4},${pigH} L${pigW * 0.3},${pigH * 0.4}
                    L${-pigW * 0.3},${pigH * 0.4} L${-pigW * 0.4},${pigH} L${-pigW * 0.8},${pigH} Z`}
            fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
          {/* Snout */}
          <ellipse cx={pigW * 1.1} cy={-pigH * 0.2} rx={pigW * 0.3} ry={pigH * 0.3} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
          {/* Highlight */}
          <circle cx={-pigW * 0.2} cy={-pigH * 0.4} r={pigW * 0.2} fill="rgba(255,255,255,0.3)" />
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
