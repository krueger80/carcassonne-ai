interface MeepleSVGProps {
  color: string
  x: number   // center x in viewBox coords (0-100)
  y: number   // center y in viewBox coords (0-100)
  size?: number  // radius in viewBox units, default 6
  isBig?: boolean
}

/**
 * Renders a simple meeple shape: a circle (head) + body wedge.
 * Coords are in the 0-100 SVG viewBox.
 */
export function MeepleSVG({ color, x, y, size = 15, isBig = false }: MeepleSVGProps) {
  const scale = isBig ? 1.4 : 1
  const s = size * scale
  const headR = s * 0.45
  const bodyH = s * 0.8

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Drop shadow */}
      <ellipse cx="0.5" cy={headR + bodyH * 0.8 + 0.5} rx={s * 0.55} ry={s * 0.2} fill="rgba(0,0,0,0.25)" />
      {/* Body */}
      <path
        d={`M${-s * 0.5},${headR} Q${-s * 0.7},${headR + bodyH} 0,${headR + bodyH} Q${s * 0.7},${headR + bodyH} ${s * 0.5},${headR} Z`}
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
    </g>
  )
}
