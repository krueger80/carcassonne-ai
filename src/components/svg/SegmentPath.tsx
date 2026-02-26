import { memo } from 'react'
import type { Segment } from '../../core/types/tile.ts'

export const TERRAIN_COLORS: Record<string, string> = {
  CITY: '#c8a46e',
  ROAD: '#e8d8a0',
  FIELD: '#5a9e4b',
  CLOISTER: '#e8c8a0',
  RIVER: '#00BFFF',
}

const TERRAIN_STROKE: Record<string, string> = {
  CITY: '#8b6914',
  ROAD: '#b0a060',
  FIELD: '#3a7e2b',
  CLOISTER: '#c0906a',
  RIVER: '#0099CC',
}

interface SegmentPathProps {
  segment: Segment
  highlighted?: boolean
  dimmed?: boolean
}

export const SegmentPath = memo(({ segment, highlighted = false, dimmed = false }: SegmentPathProps) => {
  const fill = highlighted
    ? '#ffffaa'
    : TERRAIN_COLORS[segment.type] ?? '#cccccc'

  const stroke = TERRAIN_STROKE[segment.type] ?? '#999'
  const opacity = dimmed ? 0.5 : 1

  if (segment.type === 'CLOISTER') {
    return (
      <g opacity={opacity}>
        {/* Cloister: draw field background (no path needed — field covers it) */}
        <rect x="28" y="28" width="44" height="44" fill={fill} stroke={stroke} strokeWidth="1.5" rx="3" />
        {/* Cross decoration on cloister */}
        <rect x="48" y="32" width="4" height="36" fill={TERRAIN_STROKE['CLOISTER']} opacity={0.5} />
        <rect x="32" y="48" width="36" height="4" fill={TERRAIN_STROKE['CLOISTER']} opacity={0.5} />
      </g>
    )
  }

  if (segment.type === 'ROAD') {
    const roadColor = highlighted ? '#ffffaa' : (TERRAIN_COLORS['ROAD'] ?? '#e8d8a0')
    const roadBorder = TERRAIN_STROKE['ROAD'] ?? '#b0a060'

    return (
      <g opacity={opacity}>
        {/* Outer stroke (border) */}
        <path d={segment.svgPath} fill="none" stroke={roadBorder} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        {/* Inner stroke (road surface) */}
        <path d={segment.svgPath} fill="none" stroke={roadColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )
  }

  if (segment.type === 'RIVER') {
    const riverColor = highlighted ? '#ccffff' : (TERRAIN_COLORS['RIVER'] ?? '#00BFFF')
    const riverBorder = TERRAIN_STROKE['RIVER'] ?? '#0099CC'

    return (
      <g opacity={opacity}>
        {/* Outer stroke (border) */}
        <path d={segment.svgPath} fill="none" stroke={riverBorder} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        {/* Inner stroke (water surface) */}
        <path d={segment.svgPath} fill="none" stroke={riverColor} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )
  }

  return (
    <path
      d={segment.svgPath}
      fill={fill}
      stroke={stroke}
      strokeWidth="0.5"
      opacity={opacity}
    />
  )
})
