import { memo } from 'react'
import type { Segment } from '../../core/types/tile.ts'

export const TERRAIN_COLORS: Record<string, string> = {
  CITY: '#c8a46e',
  ROAD: '#e8d8a0',
  FIELD: '#5a9e4b',
  CLOISTER: '#e8c8a0',
  GARDEN: '#7ec87e',
  RIVER: '#00BFFF',
}

const TERRAIN_STROKE: Record<string, string> = {
  CITY: '#8b6914',
  ROAD: '#b0a060',
  FIELD: '#3a7e2b',
  CLOISTER: '#c0906a',
  GARDEN: '#4a8e4a',
  RIVER: '#0099CC',
}

interface SegmentPathProps {
  segment: Segment
  highlighted?: boolean
  dimmed?: boolean
  ownerColors?: string[]
  rotation?: number
}

export const SegmentPath = memo(({ segment, highlighted = false, dimmed = false, ownerColors, rotation = 0 }: SegmentPathProps) => {
  const fill = highlighted
    ? '#ffffaa'
    : TERRAIN_COLORS[segment.type] ?? '#cccccc'

  const stroke = TERRAIN_STROKE[segment.type] ?? '#999'
  const opacity = dimmed ? 0.5 : 1

  const hasOwners = ownerColors && ownerColors.length > 0;
  const tieId = hasOwners ? `tie-pattern-${segment.id}-${ownerColors.join('-').replace(/#/g, '')}-rot${rotation}` : '';
  const stripeSize = hasOwners ? 24 / ownerColors.length : 0;
  
  const StripePattern = hasOwners ? (
    <defs>
      <pattern id={tieId} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform={`rotate(${45 - rotation})`}>
        {ownerColors.map((c, i) => (
          <rect key={c} y={i * stripeSize} width="24" height={stripeSize / 2} fill={c} />
        ))}
      </pattern>
    </defs>
  ) : null;

  if (segment.type === 'CLOISTER') {
    const cx = segment.meepleCentroid.x
    const cy = segment.meepleCentroid.y
    return (
      <g opacity={opacity}>
        <path d={segment.svgPath} fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x={cx - 2} y={cy - 18} width="4" height="36" fill={TERRAIN_STROKE['CLOISTER']} opacity={0.5} />
        <rect x={cx - 18} y={cy - 2} width="36" height="4" fill={TERRAIN_STROKE['CLOISTER']} opacity={0.5} />
        {hasOwners && (
          <g>
            {StripePattern}
            <path d={segment.svgPath} fill={`url(#${tieId})`} opacity={0.5} />
          </g>
        )}
      </g>
    )
  }

  if (segment.type === 'GARDEN') {
    return (
      <g opacity={opacity}>
        <path d={segment.svgPath} fill={fill} stroke={stroke} strokeWidth="1" />
        {/* Flower decoration */}
        <circle cx={segment.meepleCentroid.x} cy={segment.meepleCentroid.y} r="4" fill="#e55" opacity={0.6} />
        <circle cx={segment.meepleCentroid.x - 5} cy={segment.meepleCentroid.y + 3} r="3" fill="#e8e855" opacity={0.5} />
        <circle cx={segment.meepleCentroid.x + 5} cy={segment.meepleCentroid.y + 3} r="3" fill="#e8e855" opacity={0.5} />
        {hasOwners && (
          <g>
            {StripePattern}
            <path d={segment.svgPath} fill={`url(#${tieId})`} opacity={0.5} />
          </g>
        )}
      </g>
    )
  }

  if (segment.type === 'ROAD') {
    const roadColor = highlighted ? '#ffffaa' : (TERRAIN_COLORS['ROAD'] ?? '#e8d8a0')
    const roadBorder = TERRAIN_STROKE['ROAD'] ?? '#b0a060'

    return (
      <g opacity={opacity}>
        <path d={segment.svgPath} fill="none" stroke={roadBorder} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <path d={segment.svgPath} fill="none" stroke={roadColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {hasOwners && (
          <g>
            {StripePattern}
            <path d={segment.svgPath} fill="none" stroke={`url(#${tieId})`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
          </g>
        )}
      </g>
    )
  }

  if (segment.type === 'RIVER') {
    const riverColor = highlighted ? '#ccffff' : (TERRAIN_COLORS['RIVER'] ?? '#00BFFF')
    const riverBorder = TERRAIN_STROKE['RIVER'] ?? '#0099CC'

    return (
      <g opacity={opacity}>
        <path d={segment.svgPath} fill="none" stroke={riverBorder} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        <path d={segment.svgPath} fill="none" stroke={riverColor} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )
  }

  return (
    <g>
      <path
        d={segment.svgPath}
        fill={fill}
        stroke={stroke}
        strokeWidth="0.5"
        opacity={opacity}
      />
      {hasOwners && (
        <g>
          {StripePattern}
          <path d={segment.svgPath} fill={`url(#${tieId})`} opacity={0.5} />
        </g>
      )}
    </g>
  )
})
