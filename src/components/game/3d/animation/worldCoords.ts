import type { Vec3 } from './types'

// Must match the constant in Tile3D.tsx.
const TILE_SIZE = 8.8

/**
 * Compute the world-space center of a tile segment, honoring tile rotation.
 * Mirrors the getSegmentCenter logic in GameScene3D.tsx so store actions
 * (which live outside the R3F context) can produce targets for the animation
 * manager.
 */
export function segmentCenterWorld(
  coordinate: { x: number; y: number },
  rotation: number,
  centroid: { x: number; y: number } | undefined | null,
  y = 0.02
): Vec3 {
  if (!centroid) {
    return [coordinate.x * TILE_SIZE, y, coordinate.y * TILE_SIZE]
  }
  const r = ((rotation % 360) + 360) % 360
  let rx = centroid.x, ry = centroid.y
  if (r === 90) { rx = 100 - centroid.y; ry = centroid.x }
  else if (r === 180) { rx = 100 - centroid.x; ry = 100 - centroid.y }
  else if (r === 270) { rx = centroid.y; ry = 100 - centroid.x }

  const ox = ((rx - 50) / 100) * TILE_SIZE
  const oy = ((ry - 50) / 100) * TILE_SIZE
  return [coordinate.x * TILE_SIZE + ox, y, coordinate.y * TILE_SIZE + oy]
}
