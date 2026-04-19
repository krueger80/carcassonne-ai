import type { ObjectTrack, Transform, Vec3 } from './types'

// Shortest-path angle interpolation in radians.
function lerpAngle(a: number, b: number, t: number): number {
  const TAU = Math.PI * 2
  let diff = ((b - a) % TAU + TAU) % TAU
  if (diff > Math.PI) diff -= TAU
  return a + diff * t
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export interface Sample {
  position: Vec3
  rotationY: number
  /** Progress in [0,1] — useful for fade tails. */
  progress: number
  /** True once t >= 1. */
  done: boolean
}

export function sampleTrack(track: ObjectTrack, nowMs: number): Sample {
  const raw = (nowMs - track.startMs) / track.durationMs
  const clamped = raw < 0 ? 0 : raw > 1 ? 1 : raw
  const eased = track.easing(clamped)

  const fx = track.from.position
  const tx = track.to.position

  const x = lerp(fx[0], tx[0], eased)
  const y = lerp(fx[1], tx[1], eased) + arcLift(eased, track.arcHeight)
  const z = lerp(fx[2], tx[2], eased)

  return {
    position: [x, y, z],
    rotationY: lerpAngle(track.from.rotationY, track.to.rotationY, eased),
    progress: clamped,
    done: raw >= 1,
  }
}

// Parabolic arc: 0 at t=0 and t=1, peak at t=0.5.
function arcLift(t: number, height: number): number {
  if (height === 0) return 0
  return 4 * height * t * (1 - t)
}

export function sampleTransform(transform: Transform): Sample {
  return {
    position: transform.position,
    rotationY: transform.rotationY,
    progress: 1,
    done: true,
  }
}
