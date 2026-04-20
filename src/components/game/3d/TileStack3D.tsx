import { memo } from 'react'
import { MEEPLE_DIMENSIONS, SCALE_FACTOR } from './MeepleShapes'

const TILE_SIZE = 8.8
const TILE_THICKNESS = MEEPLE_DIMENSIONS.TILE.depth * SCALE_FACTOR
const STACK_GAP = 0.6

interface TileStack3DProps {
  /** Number of tiles still in the draw bag (not including the currentTile). */
  remaining: number
  /** World-space XZ position of the centre of the stack. */
  position: [number, number]
  /** Y coordinate for the **top** of the stack — the stack grows downward
   *  from here so the tile flying above it (CurrentTile3D at HAND_ANCHOR)
   *  always sits one gap above whatever tile is currently on top. */
  topY: number
}

/**
 * Visible draw pile rendered at a fixed world position. Each tile in the
 * bag is drawn as a plain wooden-backed box; the top of the stack sits at
 * `topY - STACK_GAP` so the current tile (rendered by `CurrentTile3D`)
 * visually hovers just above the deck.
 */
function TileStack3DImpl({ remaining, position, topY }: TileStack3DProps) {
  if (remaining <= 0) return null

  // Cap the visual stack so a 70-tile bag doesn't tower into the sky.
  const visualCount = Math.min(remaining, 30)
  const [px, pz] = position

  return (
    <group position={[px, 0, pz]}>
      {Array.from({ length: visualCount }).map((_, i) => {
        // i=0 is the bottom tile, i=visualCount-1 is the top. Top tile's
        // centre sits at (topY - STACK_GAP) - TILE_THICKNESS/2.
        const centreY =
          topY - STACK_GAP - TILE_THICKNESS / 2 - (visualCount - 1 - i) * TILE_THICKNESS
        return (
          <mesh
            key={i}
            position={[0, centreY, 0]}
            castShadow
            receiveShadow
            raycast={() => null}
          >
            <boxGeometry args={[TILE_SIZE - 0.05, TILE_THICKNESS, TILE_SIZE - 0.05]} />
            <meshStandardMaterial color="#6e6759" roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

export const TileStack3D = memo(TileStack3DImpl)
