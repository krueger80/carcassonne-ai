import type { MeepleType } from '../../../../core/types/player.ts'

export type Vec3 = [number, number, number]

export interface Transform {
  position: Vec3
  rotationY: number
  /** Optional X-axis rotation, used by the held-tile flip. Defaults to 0. */
  rotationX?: number
}

export type Easing = (t: number) => number

export interface ObjectTrack {
  from: Transform
  to: Transform
  startMs: number
  durationMs: number
  arcHeight: number
  easing: Easing
  resolve?: () => void
}

/**
 * Transient animated meeple with no persistent board identity. One endpoint
 * is a world position; the other is a player-card DOM element resolved at
 * mount-time by projecting through the live R3F camera.
 *
 *   direction: 'to-card'   → ghost flies world → card (e.g. dragon devour)
 *   direction: 'from-card' → ghost flies card  → world (e.g. meeple placement)
 */
export interface GhostMeeple {
  id: string
  meepleType: MeepleType
  color: string
  isFarmer: boolean
  direction: 'to-card' | 'from-card'
  /** World endpoint (segment center for placement / current tile for devour). */
  worldEndpoint: Transform
  /** DOM id of the card endpoint: `player-card-${playerId}`. */
  cardPlayerId: string
  startMs: number
  durationMs: number
  arcHeight: number
  /**
   * Optional segment-meeple key suppressed in the static board render while
   * this ghost is in flight. Format: `${x},${y}:${meepleSlot}`.
   * `meepleSlot` is one of `segId`, `${segId}_PIG`, `${segId}_BUILDER`.
   */
  suppressKey?: string
}
