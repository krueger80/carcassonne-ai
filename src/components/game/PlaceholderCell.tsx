import type { Coordinate } from '../../core/types/board.ts'
import { TileSVG } from '../svg/TileSVG.tsx'
import type { TileInstance, TileDefinition } from '../../core/types/tile.ts'

interface PlaceholderCellProps {
  coord: Coordinate
  size: number
  isValid: boolean
  isHovered: boolean
  previewTile?: TileInstance | null   // ghost preview of the current tile
  tileMap: Record<string, TileDefinition>
  onHover: () => void
  onLeave: () => void
  onClick: (e: React.MouseEvent) => void
}

export function PlaceholderCell({
  size,
  isValid,
  isHovered,
  previewTile,
  tileMap,
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
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={isValid ? onClick : undefined}
      onPointerDown={(e) => {
        if (isValid) e.stopPropagation()
      }}
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
            definition={tileMap[previewTile.definitionId]!}
            rotation={previewTile.rotation}
            size={size - 4}
            isValidTarget
          />
        </div>
      )}
    </div>
  )
}
