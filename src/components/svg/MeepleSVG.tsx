import { motion } from 'framer-motion'

interface MeepleSVGProps {
  color: string
  x: number   // center x in viewBox coords (0-100)
  y: number   // center y in viewBox coords (0-100)
  size?: number  // radius in viewBox units, default 6
  isBig?: boolean
  isBuilder?: boolean
  isPig?: boolean
  isAbbot?: boolean
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
  isPig = false,
  isAbbot = false,
}: MeepleSVGProps) {
  const scale = isBig ? 1.4 : 1
  const s = size * scale

  // Builder (Accurate silhouette + 3D highlight)
  if (isBuilder) {
    const s = size * 1.1; // Make builder slightly larger
    const baseOffset = s * 0.3; // Center alignment
    return (
      <g transform={`translate(${x}, ${y - baseOffset})`}>
        <motion.g
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `0px ${s * 1.1}px` }}
        >
          {/* Drop shadow at the base */}
          <ellipse cx="0" cy={s * 1.1} rx={s * 0.65} ry={s * 0.2} fill="rgba(0,0,0,0.3)" />
          
          {/* Main Builder Shape */}
          <path
            d={`M ${-s * 0.65},${s * 1.1} 
                L ${-s * 0.35},${s * 0.5} 
                L ${-s * 0.65},${s * 0.5} 
                Q ${-s * 0.8},${s * 0.5} ${-s * 0.8},${s * 0.35} 
                Q ${-s * 0.8},${s * 0.2} ${-s * 0.65},${s * 0.2} 
                L ${-s * 0.25},${s * 0.2} 
                L ${-s * 0.20},${-s * 0.05} 
                C ${-s * 0.65},${-s * 0.05} ${-s * 0.6},${-s * 0.65} ${-s * 0.3},${-s * 0.6} 
                Q ${-s * 0.1},${-s * 0.6} 0,${-s * 0.4} 
                Q ${s * 0.1},${-s * 0.6} ${s * 0.3},${-s * 0.6} 
                C ${s * 0.6},${-s * 0.65} ${s * 0.65},${-s * 0.05} ${s * 0.20},${-s * 0.05} 
                L ${s * 0.25},${s * 0.2} 
                L ${s * 0.65},${s * 0.2} 
                Q ${s * 0.8},${s * 0.2} ${s * 0.8},${s * 0.35} 
                Q ${s * 0.8},${s * 0.5} ${s * 0.65},${s * 0.5} 
                L ${s * 0.35},${s * 0.5} 
                L ${s * 0.65},${s * 1.1} Z`}
            fill={color} 
            stroke="rgba(0,0,0,0.5)" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />

          {/* Highlight for 3D effect */}
          <path
            d={`M ${-s * 0.5},${s * 1.0} 
                L ${-s * 0.25},${s * 0.45} 
                L ${-s * 0.55},${s * 0.45} 
                Q ${-s * 0.65},${s * 0.45} ${-s * 0.65},${s * 0.35} 
                Q ${-s * 0.65},${s * 0.3} ${-s * 0.55},${s * 0.3} 
                L ${-s * 0.15},${s * 0.3} 
                L ${-s * 0.10},0 
                C ${-s * 0.45},0 ${-s * 0.45},${-s * 0.45} ${-s * 0.25},${-s * 0.45} 
                Q ${-s * 0.1},${-s * 0.45} 0,${-s * 0.3} 
                Q ${-s * 0.05},${-s * 0.1} ${-s * 0.1},${s * 0.15}
                L ${-s * 0.2},${s * 0.45}
                L ${-s * 0.1},${s * 0.45}
                L ${-s * 0.35},${s * 1.0} Z`}
            fill="rgba(255,255,255,0.2)" 
          />
        </motion.g>
      </g>
    )
  }

  // Pig (Accurate silhouette + 3D highlight)
  if (isPig) {
    const pigH = s * 0.7
    return (
      <g transform={`translate(${x}, ${y - pigH / 2})`}>
        <motion.g
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{ transformOrigin: `0px ${pigH}px` }}
        >
          {/* shadow */}
          <ellipse cx="0" cy={s * 0.95} rx={s * 0.9} ry={s * 0.25} fill="rgba(0,0,0,0.3)" />
          
          {/* Pig Body/Legs */}
          <path
            d={`M ${-s * 0.9},${s * 0.2} 
                L ${-s * 0.8},${0} 
                C ${-s * 0.7},${-s * 0.2} ${-s * 0.5},${-s * 0.4} ${-s * 0.4},${-s * 0.45} 
                L ${-s * 0.3},${-s * 0.7} 
                L ${-s * 0.1},${-s * 0.4} 
                C ${s * 0.4},${-s * 0.5} ${s * 0.8},${-s * 0.2} ${s * 0.9},${s * 0.3} 
                L ${s * 1.05},${s * 0.4} 
                L ${s * 0.9},${s * 0.5} 
                L ${s * 0.8},${s * 0.9} 
                C ${s * 0.8},${s * 1.05} ${s * 0.45},${s * 1.05} ${s * 0.45},${s * 0.9} 
                L ${s * 0.5},${s * 0.65} 
                C ${s * 0.2},${s * 0.75} ${-s * 0.2},${s * 0.75} ${-s * 0.4},${s * 0.65} 
                L ${-s * 0.4},${s * 0.9} 
                C ${-s * 0.4},${s * 1.05} ${-s * 0.75},${s * 1.05} ${-s * 0.75},${s * 0.9} 
                L ${-s * 0.7},${s * 0.5} 
                C ${-s * 0.8},${s * 0.4} ${-s * 0.9},${s * 0.35} ${-s * 0.9},${s * 0.2} Z`}
            fill={color} 
            stroke="rgba(0,0,0,0.5)" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />
          
          {/* Inner Highlight for Pig */}
          <path
            d={`M ${-s * 0.75},${s * 0.15} 
                C ${-s * 0.65},${-s * 0.05} ${-s * 0.45},${-s * 0.25} ${-s * 0.35},${-s * 0.3} 
                L ${-s * 0.25},${-s * 0.55} 
                L ${-s * 0.15},${-s * 0.35} 
                C ${s * 0.35},${-s * 0.4} ${s * 0.7},${-s * 0.15} ${s * 0.8},${s * 0.25} 
                C ${s * 0.4},${0} ${-s * 0.2},${0} ${-s * 0.75},${s * 0.15} Z`}
            fill="rgba(255,255,255,0.2)" 
          />
        </motion.g>
      </g>
    )
  }

  // Abbot (taller meeple with a mitre hat)
  if (isAbbot) {
    const bodyH = s * 1.0
    const headH = s * 0.8
    const baseOffset = bodyH + headH
    return (
      <g transform={`translate(${x}, ${y - baseOffset})`}>
        <motion.g
          animate={{ rotate: [0, -3, 3, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `0px ${baseOffset}px` }}
        >
          {/* Drop shadow */}
          <ellipse cx="0" cy={baseOffset} rx={s * 0.7} ry={s * 0.25} fill="rgba(0,0,0,0.25)" />
          
          {/* Exact Silhouette Abbot body + Mitre */}
          <path
            d={`M 0, ${baseOffset - s * 1.8}
               L ${s * 0.3}, ${baseOffset - s * 1.4}
               L ${s * 0.15}, ${baseOffset - s * 1.25}
               C ${s * 0.35}, ${baseOffset - s * 1.25}  ${s * 0.35}, ${baseOffset - s * 0.95}  ${s * 0.15}, ${baseOffset - s * 0.9}
               C ${s * 0.5}, ${baseOffset - s * 0.9}  ${s * 0.95}, ${baseOffset - s * 0.85}  ${s * 0.95}, ${baseOffset - s * 0.7}
               C ${s * 0.95}, ${baseOffset - s * 0.55}  ${s * 0.5}, ${baseOffset - s * 0.55}  ${s * 0.35}, ${baseOffset - s * 0.5}
               L ${s * 0.75}, ${baseOffset - s * 0.05}
               C ${s * 0.8}, ${baseOffset}  ${s * 0.65}, ${baseOffset}  ${s * 0.45}, ${baseOffset}
               L ${-s * 0.45}, ${baseOffset}
               C ${-s * 0.65}, ${baseOffset}  ${-s * 0.8}, ${baseOffset}  ${-s * 0.75}, ${baseOffset - s * 0.05}
               L ${-s * 0.35}, ${baseOffset - s * 0.5}
               C ${-s * 0.5}, ${baseOffset - s * 0.55}  ${-s * 0.95}, ${baseOffset - s * 0.55}  ${-s * 0.95}, ${baseOffset - s * 0.7}
               C ${-s * 0.95}, ${baseOffset - s * 0.85}  ${-s * 0.5}, ${baseOffset - s * 0.9}  ${-s * 0.15}, ${baseOffset - s * 0.9}
               C ${-s * 0.35}, ${baseOffset - s * 0.95}  ${-s * 0.35}, ${baseOffset - s * 1.25}  ${-s * 0.15}, ${baseOffset - s * 1.25}
               L ${-s * 0.3}, ${baseOffset - s * 1.4}
               Z`}
            fill={color}
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Highlights */}
          <ellipse cx={-s * 0.45} cy={baseOffset - s * 0.7} rx={s * 0.15} ry={s * 0.08} fill="rgba(255,255,255,0.2)" transform={`rotate(10, ${-s*0.45}, ${baseOffset - s*0.7})`} />
          <circle cx={-s * 0.1} cy={baseOffset - s * 1.15} r={s * 0.06} fill="rgba(255,255,255,0.25)" />
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
