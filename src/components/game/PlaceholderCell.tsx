import { memo } from 'react'
import { TileSVG } from '../svg/TileSVG.tsx'
import { TILE_MAP } from '../../core/data/baseTiles.ts'
import type { TileInstance } from '../../core/types/tile.ts'

interface PlaceholderCellProps {
  x: number
  y: number
  size: number
  isValid: boolean
  isHovered: boolean
  previewTile?: TileInstance | null   // ghost preview of the current tile
  onHover: (x: number, y: number) => void
  onLeave: (x: number, y: number) => void
  onClick: (x: number, y: number) => void
}

export const PlaceholderCell = memo(function PlaceholderCell({
  x,
  y,
  size,
  isValid,
  isHovered,
  previewTile,
  onHover,
  onLeave,
  onClick,
}: PlaceholderCellProps) {
  if (!isValid && !isHovered) {
    // Invisible placeholder — still occupies grid space
    return <div style={{ width: size, height: size }} />
  }

  return (
    <div
      onMouseEnter={() => onHover(x, y)}
      onMouseLeave={() => onLeave(x, y)}
      onClick={isValid ? () => onClick(x, y) : undefined}
      style={{
        width: size,
        height: size,
        border: isValid
          ? `2px dashed ${isHovered ? '#ffffaa' : 'rgba(255,255,150,0.5)'}`
          : '1px solid rgba(255,255,255,0.05)',
        borderRadius: 2,
        background: isHovered && isValid ? 'rgba(255,255,100,0.08)' : 'transparent',
        cursor: isValid ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.1s, border-color 0.1s',
        boxSizing: 'border-box',
      }}
    >
      {/* Ghost preview of the tile being placed */}
      {isHovered && previewTile && isValid && (
        <div style={{ opacity: 0.55, pointerEvents: 'none' }}>
          <TileSVG
            definition={TILE_MAP[previewTile.definitionId]!}
            rotation={previewTile.rotation}
            size={size - 4}
            isValidTarget
          />
        </div>
      )}
    </div>
  )
})
