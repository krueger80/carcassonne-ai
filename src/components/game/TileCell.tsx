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
    case 0:   return pt
    case 90:  return { x: 100 - pt.y, y: pt.x }
    case 180: return { x: 100 - pt.x, y: 100 - pt.y }
    case 270: return { x: pt.y, y: 100 - pt.x }
    default:  return pt
  }
}

interface TileCellProps {
  tile: PlacedTile
  size: number
  players: Player[]
  /** Segment IDs clickable for meeple placement */
  placeableSegments?: string[]
  onSegmentClick?: (segmentId: string) => void
}

export function TileCell({
  tile,
  size,
  players,
  placeableSegments = [],
  onSegmentClick,
}: TileCellProps) {
  const def = TILE_MAP[tile.definitionId]
  if (!def) return null

  // Build meeple color map for this tile
  const meepleColors: Record<string, { color: string; isBig?: boolean }> = {}
  for (const [segId, meeple] of Object.entries(tile.meeples)) {
    const player = players.find(p => p.id === meeple.playerId)
    if (player) {
      meepleColors[segId] = { color: player.color, isBig: meeple.meepleType === 'BIG' }
    }
  }

  const isInMeeplePlacementMode = placeableSegments.length > 0

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        cursor: isInMeeplePlacementMode ? 'pointer' : 'default',
      }}
    >
      <TileSVG
        definition={def}
        rotation={tile.rotation}
        size={size}
        meeples={meepleColors}
      />

      {/* Invisible clickable segment overlays during meeple placement */}
      {isInMeeplePlacementMode && def.segments.map(seg => {
        if (!placeableSegments.includes(seg.id)) return null
        const { x, y } = rotateCentroid(seg.meepleCentroid, tile.rotation)
        const pct = (v: number) => `${v}%`
        return (
          <div
            key={seg.id}
            onClick={() => onSegmentClick?.(seg.id)}
            style={{
              position: 'absolute',
              left: pct(x - 12),
              top: pct(y - 12),
              width: '24%',
              height: '24%',
              borderRadius: '50%',
              background: 'rgba(255,255,100,0.35)',
              border: '2px solid rgba(255,255,0,0.8)',
              cursor: 'pointer',
              zIndex: 10,
            }}
            title={`Place meeple on ${seg.type.toLowerCase()}`}
          />
        )
      })}
    </div>
  )
}
