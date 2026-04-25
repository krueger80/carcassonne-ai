import { memo, useMemo, useRef, Suspense } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { MEEPLE_DIMENSIONS, SCALE_FACTOR } from './MeepleShapes'

const TILE_SIZE = 8.8
const TILE_THICKNESS = MEEPLE_DIMENSIONS.TILE.depth * SCALE_FACTOR
/** Box body height — shorter than the per-tile Y stride so each tile leaves
 *  a visible groove above it. The remaining stride is air. */
const BOX_HEIGHT = TILE_THICKNESS * 0.82
/** Per-tile XZ positional jitter (world units). */
const JITTER_XZ = 0.15
/** Per-tile Y rotation jitter (radians). */
const JITTER_ROT = (3 * Math.PI) / 180

/** Random pile size range. Initial bag is split into piles each containing a
 *  random count in this range. */
const PILE_MIN = 8
const PILE_MAX = 14
/** Grid columns of piles. Pile layout fills left-to-right, top-to-bottom. */
const PILE_COLS = 3
/** Horizontal/depth spacing between pile centres, in tile-widths. */
const PILE_GAP = 1.2

const BACK_TEXTURE_URL = '/images/General/New_rules_regular_back.png'

interface TileStack3DProps {
  /** Number of tiles still in the draw bag (not including the currentTile). */
  remaining: number
  /** Stable, randomised pile sizes (sums to the initial bag count). Drained
   *  from the last pile first as `remaining` decreases. */
  sizes: number[]
  /** World-space XZ position of pile 0 (top-left of the pile grid). Piles
   *  extend along +X (columns) and +Z (rows). */
  basePosition: [number, number]
  /** Ground Y — the bottom of every pile sits at this level. */
  groundY: number
}

/**
 * Cheap deterministic hash → [0, 1). Stable across renders, no Math.random.
 * Used for per-tile micro-jitter so each stack looks hand-placed.
 */
function hash01(a: number, b: number): number {
  let h = (a * 374761393 + b * 668265263) | 0
  h = (h ^ (h >>> 13)) >>> 0
  h = Math.imul(h, 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/**
 * Build a stable pile-size array that sums to `total`. Each pile is a random
 * count in [PILE_MIN, PILE_MAX]; the final pile may be smaller to make the
 * total exact. Uses a seeded PRNG so the layout is identical across renders.
 */
function buildPileSizes(total: number): number[] {
  if (total <= 0) return []
  const sizes: number[] = []
  let remaining = total
  let i = 0
  while (remaining > 0) {
    const r = hash01(i, total)
    const desired = PILE_MIN + Math.floor(r * (PILE_MAX - PILE_MIN + 1))
    const take = Math.min(desired, remaining)
    sizes.push(take)
    remaining -= take
    i += 1
  }
  return sizes
}

/**
 * Stable pile-size layout for the whole game. Cached on first call by the
 * initial bag count, so subsequent draws don't reshuffle the visible layout.
 */
export function usePileSizes(initialRemaining: number): number[] {
  const ref = useRef<{ initial: number; sizes: number[] } | null>(null)
  if (ref.current === null || ref.current.initial !== initialRemaining) {
    ref.current = { initial: initialRemaining, sizes: buildPileSizes(initialRemaining) }
  }
  return ref.current.sizes
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
 * Given the static pile-size array and the live `remaining` count, return
 * the (activeIndex, activeCount) of the pile that's currently being drawn
 * from. Tiles drain from the last pile first; full piles ahead of it stay
 * at their original size.
 */
function activePile(
  sizes: number[],
  remaining: number
): { index: number; count: number } | null {
  if (remaining <= 0 || sizes.length === 0) return null
  let consumed = 0
  for (let i = 0; i < sizes.length; i++) {
    consumed += sizes[i]
    if (consumed >= remaining) {
      const drawn = consumed - remaining
      return { index: i, count: sizes[i] - drawn }
    }
  }
  return null
}

/**
 * World-space centre of the TOP tile of the active pile — this is the
 * "drawn from here" point the current-tile animation should start at when a
 * fresh tile enters the hand.
 */
export function drawOriginFromBag(
  sizes: number[],
  remaining: number,
  basePosition: [number, number],
  groundY: number
): [number, number, number] | null {
  const active = activePile(sizes, remaining)
  if (!active) return null
  const [px, pz] = pilePosition(active.index, basePosition)
  // Centre of the topmost tile in the active pile. Bottom tile's centre is
  // at groundY + TILE_THICKNESS/2; each tile above adds one stride.
  const topY = groundY + TILE_THICKNESS / 2 + (active.count - 1) * TILE_THICKNESS
  return [px, topY, pz]
}

/** Cache the configured back texture once per tab so every tile shares one
 *  GPU upload. */
let cachedBackTexture: THREE.Texture | null = null
function getBackTexture(raw: THREE.Texture): THREE.Texture {
  if (cachedBackTexture) return cachedBackTexture
  const t = raw.clone()
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 16
  t.needsUpdate = true
  cachedBackTexture = t
  return t
}

/**
 * Visible draw bag rendered as a grid of piles. Each pile's tile count is
 * fixed by `sizes` (random but stable); tiles drain from the last pile
 * first so the grid shrinks predictably. Each tile has a small deterministic
 * positional/rotational jitter, leaves a visible groove above it, and shows
 * the new-rules back texture on its top face.
 */
function TileStack3DImpl({ remaining, sizes, basePosition, groundY }: TileStack3DProps) {
  if (remaining <= 0 || sizes.length === 0) return null

  const active = activePile(sizes, remaining)
  if (!active) return null

  return (
    <Suspense fallback={null}>
      <Piles
        sizes={sizes}
        activeIndex={active.index}
        activeCount={active.count}
        basePosition={basePosition}
        groundY={groundY}
      />
    </Suspense>
  )
}

function Piles({
  sizes,
  activeIndex,
  activeCount,
  basePosition,
  groundY,
}: {
  sizes: number[]
  activeIndex: number
  activeCount: number
  basePosition: [number, number]
  groundY: number
}) {
  const rawTexture = useTexture(BACK_TEXTURE_URL)
  const backTexture = useMemo(() => getBackTexture(rawTexture), [rawTexture])

  return (
    <>
      {sizes.slice(0, activeIndex + 1).map((origCount, pileIdx) => {
        const tilesInPile = pileIdx === activeIndex ? activeCount : origCount
        if (tilesInPile <= 0) return null
        const [px, pz] = pilePosition(pileIdx, basePosition)
        return (
          <group key={pileIdx} position={[px, 0, pz]}>
            {Array.from({ length: tilesInPile }).map((_, i) => {
              // i=0 is the bottom tile. Centre Y uses the full thickness as
              // stride so a sliver of air remains between boxes (BOX_HEIGHT
              // is shorter than TILE_THICKNESS).
              const centreY = groundY + TILE_THICKNESS / 2 + i * TILE_THICKNESS
              const jx = (hash01(pileIdx * 31 + i, 1) - 0.5) * 2 * JITTER_XZ
              const jz = (hash01(pileIdx * 31 + i, 2) - 0.5) * 2 * JITTER_XZ
              const jr = (hash01(pileIdx * 31 + i, 3) - 0.5) * 2 * JITTER_ROT
              return (
                <group
                  key={i}
                  position={[jx, centreY, jz]}
                  rotation={[0, jr, 0]}
                >
                  {/* Tile body — short box leaves a groove above it. */}
                  <mesh castShadow receiveShadow raycast={() => null}>
                    <boxGeometry args={[TILE_SIZE - 0.05, BOX_HEIGHT, TILE_SIZE - 0.05]} />
                    <meshStandardMaterial color="#d8cda8" roughness={0.85} />
                  </mesh>
                  {/* Top face — new-rules back texture. Sits a hair above
                      the box top to avoid z-fighting. */}
                  <mesh
                    position={[0, BOX_HEIGHT / 2 + 0.005, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                    raycast={() => null}
                  >
                    <planeGeometry args={[TILE_SIZE - 0.1, TILE_SIZE - 0.1]} />
                    <meshStandardMaterial map={backTexture} roughness={0.7} />
                  </mesh>
                </group>
              )
            })}
          </group>
        )
      })}
    </>
  )
}

export const TileStack3D = memo(TileStack3DImpl)
