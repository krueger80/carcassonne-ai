import type { MeepleType } from '../../../../core/types/player.ts'

export type Vec3 = [number, number, number]

export interface Transform {
  position: Vec3
  rotationY: number
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
 * Transient animated meeple with no persistent board identity. Target is
 * resolved at render time from the owner player's DOM PlayerCard so we don't
 * need the camera/canvas at spawn time (the game store is outside R3F).
 */
export interface GhostMeeple {
  id: string
  meepleType: MeepleType
  color: string
  isFarmer: boolean
  from: Transform
  /** DOM id of the target PlayerCard element: `player-card-${playerId}`. */
  targetPlayerId: string
  startMs: number
  durationMs: number
  arcHeight: number
}
