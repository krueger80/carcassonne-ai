import { memo } from 'react'
import { TileSVG } from '../svg/TileSVG.tsx'
import { FairyPiece } from './FairyPiece.tsx'
import type { PlacedTile } from '../../core/types/board.ts'
import type { Player } from '../../core/types/player.ts'
import type { Rotation, TileDefinition } from '../../core/types/tile.ts'

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

// Update interface
interface TileCellProps {
  tile: PlacedTile
  definition: TileDefinition
  size: number
  players: Player[]
  /** Segment IDs clickable for meeple placement */
  placeableSegments?: string[]
  onSegmentClick?: (segmentId: string) => void
  /** If true, this tile is tentatively placed (ghost/preview) */
  isTentative?: boolean
  /** ID of segment where meeple is tentatively placed */
  tentativeMeepleSegment?: string
  /** Type of the tentative meeple (for rendering correct shape) */
  tentativeMeepleType?: 'NORMAL' | 'BIG' | 'FARMER' | 'BUILDER' | 'PIG' | null
  /** Color of the current player (for tentative meeple rendering) */
  currentPlayerColor?: string
  /** ID of the segment where the fairy is currently located */
  fairySegmentId?: string
}

export const TileCell = memo(({
  tile,
  definition,
  size,
  players,
  placeableSegments = [],
  onSegmentClick,
  isTentative = false,
  tentativeMeepleSegment,
  tentativeMeepleType,
  currentPlayerColor = '#ffffff',
  fairySegmentId,
}: TileCellProps) => {
  const def = definition
  if (!def) return null

  // Build meeple color map for this tile
  const meepleColors: Record<string, { color: string; isBig?: boolean; isTentative?: boolean; isBuilder?: boolean; isPig?: boolean }> = {}

  // 1. Existing meeples
  for (const [segId, meeple] of Object.entries(tile.meeples)) {
    const player = players.find(p => p.id === meeple.playerId)
    if (player) {
      meepleColors[segId] = {
        color: player.color,
        isBig: meeple.meepleType === 'BIG',
        isBuilder: meeple.meepleType === 'BUILDER',
        isPig: meeple.meepleType === 'PIG',
      }
    }
  }

  // 2. Tentative meeple
  if (tentativeMeepleSegment && !meepleColors[tentativeMeepleSegment]) {
    // Determine visuals based on type
    meepleColors[tentativeMeepleSegment] = {
      color: currentPlayerColor,
      isTentative: true,
      isBig: tentativeMeepleType === 'BIG',
      isBuilder: tentativeMeepleType === 'BUILDER',
      isPig: tentativeMeepleType === 'PIG',
    }
  }

  const isInMeeplePlacementMode = placeableSegments.length > 0

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        cursor: isInMeeplePlacementMode ? 'pointer' : 'inherit',
        opacity: isTentative ? 0.8 : 1, // Slightly transparent if tentative
        filter: isTentative ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none',
        zIndex: isTentative ? 10 : 0,
        overflow: 'visible', // Ensure meeples aren't clipped
      }}
    >
      <TileSVG
        definition={def}
        rotation={tile.rotation}
        size={size}
        meeples={meepleColors}
      />

      {/* Fairy Rendering - placed close to the meeple on the segment */}
      {fairySegmentId && (
        (() => {
          const seg = def.segments.find(s => s.id === fairySegmentId);
          if (!seg) return null;
          const { x, y } = rotateCentroid(seg.meepleCentroid, tile.rotation);
          
          // Meeple height constants from MeepleSVG.tsx
          // s is roughly 15 * zoom. Here size is the tile size.
          // In viewBox units (0-100), the meeple height is approx 18-25 units.
          const meepleVisualHeight = 22; 
          
          // Position it above the meeple's head
          return (
            <div style={{
              position: 'absolute',
              left: `${x + 6}%`,
              top: `${y - meepleVisualHeight - 2}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
              pointerEvents: 'none'
            }}>
              <FairyPiece size={size * 0.35} />
            </div>
          )
        })()
      )}

      {/* Tile ID Label */}
      <div style={{
        position: 'absolute',
        bottom: 1,
        right: 2,
        fontSize: 8,
        fontFamily: 'monospace',
        color: 'rgba(255, 255, 255, 0.9)',
        zIndex: 5,
        pointerEvents: 'none',
        textShadow: '0 0 2px black'
      }}>
        {def.id}
      </div>

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
              width: 24, // Smaller touch target
              height: 24,
              borderRadius: '50%',
              // Hide visual overlay if selected (meeple shown instead), but keep hit area
              background: isSelected ? 'transparent' : 'rgba(255,255,100,0.4)',
              border: isSelected ? 'none' : '2px dashed rgba(255,255,0,0.8)',
              boxShadow: isSelected ? 'none' : 'none',
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
})
