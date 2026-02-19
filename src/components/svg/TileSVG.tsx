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
  meeples?: Record<string, { color: string; isBig?: boolean }>
  /** Show a subtle hover glow */
  hovered?: boolean
  /** Show a valid-placement indicator */
  isValidTarget?: boolean
  /** Force render of schematic data (segments/features) even if image is present */
  showSchematic?: boolean
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
export function TileSVG({
  definition,
  rotation = 0,
  size = 80,
  highlightedSegments = [],
  meeples = {},
  hovered = false,
  isValidTarget = false,
  showSchematic = false,
}: TileSVGProps) {
  // Sort segments: FIELD first (background), then CITY, ROAD, CLOISTER
  const renderOrder: Record<string, number> = { FIELD: 0, CITY: 1, ROAD: 2, CLOISTER: 3 }
  const sortedSegments = [...definition.segments].sort(
    (a, b) => (renderOrder[a.type] ?? 4) - (renderOrder[b.type] ?? 4)
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
      }}
    >
      {/* Layer 1: Image Background */}
      {definition.imageUrl && (
        <image
          href={definition.imageUrl}
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="none"
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
      {definition.segments.map(seg => {
        const meeple = meeples[seg.id]
        if (!meeple) return null
        if (!seg.meepleCentroid) return null
        const { x, y } = seg.meepleCentroid
        return (
          <g key={seg.id} transform={`rotate(${-rotation}, ${x}, ${y})`}>
            <MeepleSVG
              color={meeple.color}
              x={x}
              y={y}
              isBig={meeple.isBig}
            />
          </g>
        )
      })}
    </svg>
  )
}
