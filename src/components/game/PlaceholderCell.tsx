import { memo, useMemo } from 'react'
import type { Coordinate } from '../../core/types/board.ts'
import { TileSVG } from '../svg/TileSVG.tsx'
import type { TileInstance, TileDefinition, Rotation } from '../../core/types/tile.ts'
import { getRotatedOffset } from '../../core/engine/TilePlacement.ts'

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

export const PlaceholderCell = memo(({
  size,
  isValid,
  isHovered,
  previewTile,
  tileMap,
  onHover,
  onLeave,
  onClick,
}: PlaceholderCellProps) => {
  if (!isValid && !isHovered) {
    // Invisible placeholder — still occupies grid space
    return <div style={{ width: size, height: size }} />
  }

  const def = (previewTile && tileMap[previewTile.definitionId]) || null;
  const currentRot = previewTile?.rotation || 0;

  // Calculate footprint for compound tiles
  const parts = useMemo(() => {
    if (!def) return [];
    const res = [{ dx: 0, dy: 0, defId: def.id }];
    if (def.linkedTiles) {
      for (const lt of def.linkedTiles) {
        res.push({ ...getRotatedOffset(lt.dx, lt.dy, currentRot), defId: lt.definitionId });
      }
    }
    return res;
  }, [def, currentRot]);

  let minDx = 0, maxDx = 0, minDy = 0, maxDy = 0;
  parts.forEach(p => {
    if (p.dx < minDx) minDx = p.dx;
    if (p.dx > maxDx) maxDx = p.dx;
    if (p.dy < minDy) minDy = p.dy;
    if (p.dy > maxDy) maxDy = p.dy;
  });

  const gridW = parts.length > 0 ? (maxDx - minDx + 1) : 1;
  const gridH = parts.length > 0 ? (maxDy - minDy + 1) : 1;

  // Render the origin cell slightly bigger to contain the bounding box
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={isValid ? onClick : undefined}
      style={{
        width: size,
        height: size,
        cursor: isValid ? 'pointer' : 'default',
        position: 'relative',
        boxSizing: 'border-box',
        zIndex: isHovered ? 10 : 5, // ensure bounding box hover extends over empty neighbors
      }}
    >
      {/* Bounding Box / Hover Area Outline */}
      {isValid && (
        <div style={{
          position: 'absolute',
          left: minDx * size,
          top: minDy * size,
          width: gridW * size,
          height: gridH * size,
          border: `2px dashed ${isHovered ? '#ffffaa' : 'rgba(255,255,150,0.5)'}`,
          borderRadius: 2,
          background: isHovered ? 'rgba(255,255,100,0.08)' : 'transparent',
          pointerEvents: 'none', // Let the parent's size handle click within the origin cell
        }} />
      )}

      {/* Ghost preview of all tile segments */}
      {isHovered && previewTile && isValid && def && (
        <div style={{
          position: 'absolute',
          left: minDx * size,
          top: minDy * size,
          width: gridW * size,
          height: gridH * size,
          opacity: 0.55,
          pointerEvents: 'none'
        }}>
          {parts.map((p, idx) => {
            const pDef = tileMap[p.defId];
            if (!pDef) return null;
            return (
              <div key={idx} style={{
                position: 'absolute',
                left: (p.dx - minDx) * size,
                top: (p.dy - minDy) * size,
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TileSVG
                  definition={pDef}
                  rotation={currentRot as Rotation}
                  size={size - 4} // preserve tiny gap inside the grid cell
                  isValidTarget
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
})
