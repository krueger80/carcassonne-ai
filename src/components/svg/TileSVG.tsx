import { memo } from 'react'
import type { TileDefinition, Rotation } from '../../core/types/tile.ts'
import { SegmentPath, TERRAIN_COLORS } from './SegmentPath.tsx'
import { MeepleSVG } from './MeepleSVG.tsx'


interface TileSVGProps {
  definition: TileDefinition
  rotation?: Rotation
  size?: number
  /** Segment IDs that should be shown as highlighted (meeple placement hints) */
  highlightedSegments?: string[]
  /** Meeples currently on this tile: segmentId → { color } */
  meeples?: Record<string, { color: string; isBig?: boolean; isBuilder?: boolean; isPig?: boolean; isAbbot?: boolean }>
  /** Show a subtle hover glow */
  hovered?: boolean
  /** Show a valid-placement indicator */
  isValidTarget?: boolean
  /** Force render of schematic data (segments/features) even if image is present */
  showSchematic?: boolean
  /** Segment ID → controlling player color for territory tinting */
  segmentOwnerColors?: Record<string, string[]>
}

/**
 * Renders one Carcassonne tile as SVG.
 *
 * Uses a 100×100 viewBox. Rotation is applied as a CSS transform on the
 * outer SVG element so that the paths inside never need recomputing.
 *
 * Rendering order (back to front):
 *  1. FIELD segments (background)
 *  2. CITY segments
 *  3. ROAD segments
 *  4. CLOISTER segments
 *  5. Tile border
 *  6. Meeple overlay
 *  7. Highlight overlay (for valid placement targets)
 */
export const TileSVG = memo(({
  definition,
  rotation = 0,
  size = 80,
  highlightedSegments = [],
  meeples = {},
  hovered = false,
  isValidTarget = false,
  showSchematic = false,
  segmentOwnerColors = {},
}: TileSVGProps) => {
  // Sort segments: FIELD first (background), then CITY, ROAD, CLOISTER
  const renderOrder: Record<string, number> = { FIELD: 0, RIVER: 1, CITY: 2, ROAD: 3, CLOISTER: 4 }
  const sortedSegments = [...definition.segments].sort(
    (a, b) => (renderOrder[a.type] ?? 5) - (renderOrder[b.type] ?? 5)
  )

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        display: 'block',
        flexShrink: 0,
        overflow: 'visible', // Allow meeples to extend beyond tile borders
      }}
    >
      {/* Layer 1: Image Background */}
      {definition.imageUrl && (
        <image
          href={definition.imageUrl}
          xlinkHref={definition.imageUrl}
          x={definition.imageConfig ? -definition.imageConfig.offsetX * 100 * definition.imageConfig.widthFactor : 0}
          y={definition.imageConfig ? -definition.imageConfig.offsetY * 100 * definition.imageConfig.heightFactor : 0}
          width={definition.imageConfig ? 100 * definition.imageConfig.widthFactor : 100}
          height={definition.imageConfig ? 100 * definition.imageConfig.heightFactor : 100}
          preserveAspectRatio="none"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        />
      )}

      {/* Layer 2: Schematic Overlay (Fallback or Debug Overlay) */}
      {(!definition.imageUrl || showSchematic) && (
        <g opacity={definition.imageUrl ? 0.6 : 1} style={{ pointerEvents: 'none' }}>
          {/* Base field fill - only if no image (otherwise covers image) */}
          {!definition.imageUrl && (
            <rect x="0" y="0" width="100" height="100" fill={TERRAIN_COLORS['FIELD']} />
          )}

          {/* Terrain segments */}
          {sortedSegments.map(seg => (
            <SegmentPath
              key={seg.id}
              segment={seg}
              highlighted={highlightedSegments.includes(seg.id)}
              dimmed={highlightedSegments.length > 0 && !highlightedSegments.includes(seg.id)}
              ownerColors={segmentOwnerColors[seg.id]}
              rotation={rotation}
            />
          ))}

          {/* Pennant indicators */}
          {sortedSegments.filter(s => s.hasPennant).map(seg => {
            if (!seg.meepleCentroid) return null
            const { x: cx, y: cy } = seg.meepleCentroid
            return (
              <polygon
                key={`pennant-${seg.id}`}
                points={`${cx - 7},${cy - 10} ${cx + 8},${cy} ${cx - 7},${cy + 10}`}
                fill="#ffd700"
                stroke="#b8860b"
                strokeWidth="1"
              />
            )
          })}

          {/* Inn indicators */}
          {sortedSegments.filter(s => s.hasInn).map(seg => {
            if (!seg.meepleCentroid) return null
            const { x: cx, y: cy } = seg.meepleCentroid
            return (
              <g key={`inn-${seg.id}`}>
                <ellipse cx={cx} cy={cy - 10} rx={7} ry={4.5}
                  fill="#4488cc" stroke="#2266aa" strokeWidth="0.8" />
                <ellipse cx={cx} cy={cy - 10} rx={4} ry={2}
                  fill="#66aaee" opacity="0.5" />
              </g>
            )
          })}

          {/* Cathedral indicators */}
          {sortedSegments.filter(s => s.hasCathedral).map(seg => {
            if (!seg.meepleCentroid) return null
            const { x: cx, y: cy } = seg.meepleCentroid
            return (
              <g key={`cathedral-${seg.id}`}>
                <polygon
                  points={`${cx},${cy - 14} ${cx - 5},${cy - 4} ${cx - 3},${cy - 4} ${cx - 3},${cy + 2} ${cx + 3},${cy + 2} ${cx + 3},${cy - 4} ${cx + 5},${cy - 4}`}
                  fill="#9955cc" stroke="#6622aa" strokeWidth="0.8"
                />
                <circle cx={cx} cy={cy - 8} r={1.5} fill="#ddc0ff" />
              </g>
            )
          })}

        </g>
      )}

      {/* Dragon & Fairy tile-level indicators (only visible if no image or forced) */}
      {(!definition.imageUrl || showSchematic) && (
        <>
          {definition.isDragonHoard && (
            <g style={{ pointerEvents: 'none' }}>
              <polygon
                points="50,8 40,28 60,28"
                fill="#ff4500" stroke="#cc3300" strokeWidth="1"
              />
              <circle cx={50} cy={15} r={3} fill="#ffaa00" opacity={0.8} />
            </g>
          )}
          {definition.hasDragon && (
            <g style={{ pointerEvents: 'none' }}>
              <circle cx={50} cy={16} r={10}
                fill="#22aa44" stroke="#118833" strokeWidth="1" />
              <text x={50} y={21} fontSize={14} textAnchor="middle" fill="white">
                🐉
              </text>
            </g>
          )}
          {definition.hasMagicPortal && (
            <g style={{ pointerEvents: 'none' }}>
              <circle cx={50} cy={16} r={10}
                fill="#9955cc" stroke="#7733aa" strokeWidth="1" />
              <text x={50} y={21} fontSize={14} textAnchor="middle" fill="white">
                🌀
              </text>
            </g>
          )}
        </>
      )}

      {/* Layer 3: Territory owner color overlay (renders on top of image) */}
      {Object.keys(segmentOwnerColors).length > 0 && (
        <g style={{ pointerEvents: 'none' }}>
          {sortedSegments.map(seg => {
            const colors = segmentOwnerColors[seg.id]
            if (!colors || colors.length === 0) return null
            
            // To properly render diagonal stripes from CSS without complex SVG patterns here, 
            // since we already handle ownerColors inside SegmentPath for the schematic layer, 
            // the simplest way is to reuse a generic SVG <pattern> here, or use multiple strokes.
            // Actually, we can define a pattern just for Layer 3 overlays.
            
            const tieId = `tie-pattern-${colors.join('-').replace(/#/g, '')}-rot${rotation}`;
            
            // Better yet, let's make an explicit alternating transparent pattern.
            // If colors is ['#f00', '#00f'], we want: #f00, transparent, #00f, transparent
            // If colors is ['#f00'], we still want stripes (user requested): #f00, transparent, #f00, transparent
            
            const totalStripes = colors.length;
            // Stripe width total = 20. Each color gets a solid band, followed by a transparent band.
            // So if 1 color: 10px color, 10px trans.
            // If 2 colors: 5px C1, 5px trans, 5px C2, 5px trans.
            const stripeSize = 24 / totalStripes; 
            
            const StripePattern = (
              <defs>
                <pattern id={tieId} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform={`rotate(${45 - rotation})`}>
                  {colors.map((c, i) => (
                    <rect key={c} y={i * stripeSize} width="24" height={stripeSize / 2} fill={c} />
                  ))}
                </pattern>
              </defs>
            );

            if (seg.type === 'CLOISTER') {
              return (
                <g key={`own-${seg.id}`}>
                  {StripePattern}
                  <path d={seg.svgPath} fill={`url(#${tieId})`} opacity={0.5} />
                </g>
              )
            }
            if (seg.type === 'ROAD') {
              return (
                <g key={`own-${seg.id}`}>
                  {StripePattern}
                  <path d={seg.svgPath} fill="none" stroke={`url(#${tieId})`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
                </g>
              )
            }
            if (seg.type === 'RIVER') return null
            return (
              <g key={`own-${seg.id}`}>
                {StripePattern}
                <path d={seg.svgPath} fill={`url(#${tieId})`} opacity={0.5} />
              </g>
            )
          })}
        </g>
      )}

      {/* Tile border */}
      <rect
        x="0.5" y="0.5" width="99" height="99"
        fill="none"
        stroke={hovered ? '#ffffff' : '#444'}
        strokeWidth={hovered ? 2 : 1}
      />

      {/* Valid placement target overlay */}
      {isValidTarget && (
        <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,150,0.15)" />
      )}

      {/* Meeples — use the logical (unrotated) centroid so the CSS rotation
          on the SVG carries the meeple to the correct visual position.
          Counter-rotate the meeple group so the figure stays upright. */}
      {Object.entries(meeples).map(([meepleKey, meeple]) => {
        // Meeple keys can be 'segmentId' or 'segmentId_BUILDER'
        const baseSegmentId = meepleKey.includes('_') && !definition.segments.some(s => s.id === meepleKey)
          ? meepleKey.split('_')[0]
          : meepleKey

        const seg = definition.segments.find(s => s.id === baseSegmentId)
        if (!seg?.meepleCentroid) return null

        let { x, y } = seg.meepleCentroid

        // Offset builders and pigs so they don't exactly perfectly overlap the normal meeple
        if (meeple.isBuilder || meeple.isPig) {
          x += 12
          y -= 8
        }

        return (
          <g key={meepleKey} transform={`rotate(${-rotation}, ${x}, ${y})`}>
            <MeepleSVG
              color={meeple.color}
              x={x}
              y={y}
              isBig={meeple.isBig}
              isBuilder={meeple.isBuilder}
              isPig={meeple.isPig}
              isAbbot={meeple.isAbbot}
            />
          </g>
        )
      })}
    </svg>
  )
})
