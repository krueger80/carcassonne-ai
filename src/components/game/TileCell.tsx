import { TileSVG } from '../svg/TileSVG.tsx'
import { TILE_MAP } from '../../core/data/baseTiles.ts'
import type { PlacedTile } from '../../core/types/board.ts'
import type { Player } from '../../core/types/player.ts'
import type { Rotation } from '../../core/types/tile.ts'

/** Rotate a centroid (0–100 SVG coords) by the tile rotation (90° CW steps). */
function rotateCentroid(
  pt: { x: number; y: number },
  rotation: Rotation,
): { x: number; y: number } {
  switch (rotation) {
    case 0: return pt
    case 90: return { x: 100 - pt.y, y: pt.x }
    case 180: return { x: 100 - pt.x, y: 100 - pt.y }
    case 270: return { x: pt.y, y: 100 - pt.x }
    default: return pt
  }
}

interface TileCellProps {
  tile: PlacedTile
  size: number
  players: Player[]
  /** Segment IDs clickable for meeple placement */
  placeableSegments?: string[]
  onSegmentClick?: (segmentId: string) => void
  /** If true, this tile is tentatively placed (ghost/preview) */
  isTentative?: boolean
  /** ID of segment where meeple is tentatively placed */
  tentativeMeepleSegment?: string
}

export function TileCell({
  tile,
  size,
  players,
  placeableSegments = [],
  onSegmentClick,
  isTentative = false,
  tentativeMeepleSegment,
}: TileCellProps) {
  const def = TILE_MAP[tile.definitionId]
  if (!def) return null

  // Build meeple color map for this tile
  const meepleColors: Record<string, { color: string, isTentative?: boolean }> = {}

  // 1. Existing meeples
  for (const [segId, meeple] of Object.entries(tile.meeples)) {
    const player = players.find(p => p.id === meeple.playerId)
    if (player) {
      meepleColors[segId] = { color: player.color }
    }
  }

  // 2. Tentative meeple
  if (tentativeMeepleSegment && !meepleColors[tentativeMeepleSegment]) {
    // Find current player color
    // We don't have current player explicitly, but can guess/pass it.
    // Or just use a generic 'white' or specific color for tentative.
    // Better: use the first player from players list who is active? 
    // Actually we don't know who is active here easily without prop.
    // Let's use a distinct color (e.g. bright white/yellow) or just standard player color if possible.
    // For now, let's use a nice placeholder color or just re-use specific logic if we had currentPlayer.
    // Let's assume the component handling this knows.

    // Hack: we'll use a specific color or just render it specially in SVG if possible.
    // But TileSVG takes { color: string }. 
    // Let's use a high-contrast color.
    meepleColors[tentativeMeepleSegment] = { color: '#ffffff', isTentative: true }
  }

  const isInMeeplePlacementMode = placeableSegments.length > 0

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        cursor: isInMeeplePlacementMode ? 'pointer' : 'default',
        opacity: isTentative ? 0.8 : 1, // Slightly transparent if tentative
        filter: isTentative ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none',
        zIndex: isTentative ? 10 : 0,
      }}
    >
      <TileSVG
        definition={def}
        rotation={tile.rotation}
        size={size}
        meeples={meepleColors}
      />

      {/* Visual indicator for tentative tile (rotate icon?) */}
      {isTentative && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          opacity: 0.8,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </div>
      )}

      {/* Invisible clickable segment overlays during meeple placement */}
      {isInMeeplePlacementMode && def.segments.map(seg => {
        if (!placeableSegments.includes(seg.id)) return null
        const { x, y } = rotateCentroid(seg.meepleCentroid, tile.rotation)

        const isSelected = tentativeMeepleSegment === seg.id

        return (
          <div
            key={seg.id}
            onClick={(e) => {
              e.stopPropagation()
              onSegmentClick?.(seg.id)
            }}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              width: 40, // Increased touch target
              height: 40,
              borderRadius: '50%',
              background: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,100,0.4)',
              border: isSelected ? '3px solid #fff' : '2px dashed rgba(255,255,0,0.8)',
              boxShadow: isSelected ? '0 0 15px rgba(0,0,0,0.6)' : 'none',
              cursor: 'pointer',
              zIndex: 20,
              transition: 'all 0.2s'
            }}
            title={`Place meeple on ${seg.type.toLowerCase()}`}
          />
        )
      })}
    </div>
  )
}
