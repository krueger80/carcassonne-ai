import { memo } from 'react'
import { MEEPLE_DIMENSIONS, SCALE_FACTOR } from './MeepleShapes'

const TILE_SIZE = 8.8
const TILE_THICKNESS = MEEPLE_DIMENSIONS.TILE.depth * SCALE_FACTOR

/** Max tiles drawn per visible pile. Higher piles stack taller. */
export const PILE_CAP = 12
/** Grid columns of piles. Pile layout is filled left-to-right, top-to-bottom. */
const PILE_COLS = 3
/** Horizontal/depth spacing between pile centres, in tile-widths. */
const PILE_GAP = 1.2

interface TileStack3DProps {
  /** Number of tiles still in the draw bag (not including the currentTile). */
  remaining: number
  /** World-space XZ position of pile 0 (top-left of the pile grid). Piles
   *  extend along +X (columns) and +Z (rows). */
  basePosition: [number, number]
  /** Ground Y — the bottom of every pile sits at this level. */
  groundY: number
}

/**
 * World-space XZ position of pile `index`. Piles fill a grid so the total
 * footprint grows 2D rather than as one tall column.
 */
export function pilePosition(
  index: number,
  basePosition: [number, number]
): [number, number] {
  const col = index % PILE_COLS
  const row = Math.floor(index / PILE_COLS)
  return [
    basePosition[0] + col * TILE_SIZE * PILE_GAP,
    basePosition[1] + row * TILE_SIZE * PILE_GAP,
  ]
}

/**
 * World-space centre of the TOP tile of the active (last non-empty) pile —
 * this is the "drawn from here" point the current-tile animation should
 * start at when a fresh tile enters the hand.
 */
export function drawOriginFromBag(
  remaining: number,
  basePosition: [number, number],
  groundY: number
): [number, number, number] | null {
  if (remaining <= 0) return null
  const activeIndex = Math.ceil(remaining / PILE_CAP) - 1
  const activeCount = ((remaining - 1) % PILE_CAP) + 1
  const [px, pz] = pilePosition(activeIndex, basePosition)
  // Centre of the topmost tile in the active pile. Bottom tile's centre is
  // at groundY + TILE_THICKNESS/2; each tile above adds one thickness.
  const topY = groundY + TILE_THICKNESS / 2 + (activeCount - 1) * TILE_THICKNESS
  return [px, topY, pz]
}

/**
 * Visible draw bag rendered as a grid of piles near the board. Each pile
 * is capped at PILE_CAP tiles; once a pile fills up, the next spawns
 * beside it. Piles are consumed starting from the highest-indexed (last)
 * pile so the grid shrinks predictably from the bottom-right.
 */
function TileStack3DImpl({ remaining, basePosition, groundY }: TileStack3DProps) {
  if (remaining <= 0) return null

  const pileCount = Math.ceil(remaining / PILE_CAP)
  // Partial pile holds (remaining mod CAP) tiles, or a full cap when
  // divisible. Everything before it is full.
  const lastPileCount = ((remaining - 1) % PILE_CAP) + 1

  return (
    <>
      {Array.from({ length: pileCount }).map((_, pileIdx) => {
        const [px, pz] = pilePosition(pileIdx, basePosition)
        const tilesInPile = pileIdx === pileCount - 1 ? lastPileCount : PILE_CAP
        return (
          <group key={pileIdx} position={[px, 0, pz]}>
            {Array.from({ length: tilesInPile }).map((_, i) => {
              // i=0 is the bottom tile; centre sits at groundY + thickness/2.
              const centreY = groundY + TILE_THICKNESS / 2 + i * TILE_THICKNESS
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
      })}
    </>
  )
}

export const TileStack3D = memo(TileStack3DImpl)
