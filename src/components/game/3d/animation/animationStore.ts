import { create } from 'zustand'
import type { GhostMeeple, ObjectTrack, Transform } from './types'
import { easeInOutCubic } from './easing'

interface AnimationState {
  // Persistent-identity objects (dragon, fairy). Keyed by stable id.
  // Committed transform is what the rest of the app declares as "truth";
  // `track`, if present, is the in-flight interpolation.
  objects: Record<string, { committed: Transform; track?: ObjectTrack }>

  // Transient animated pieces with no persistent board identity (eaten meeples,
  // future scoring return-flights). They live only for their flight duration.
  ghosts: GhostMeeple[]

  /**
   * One-shot opts override consumed by the next `setTarget` call for a given id.
   * Lets an action (e.g. undoTilePlacement) tell the animation manager "the
   * next flight for this id should use a shorter duration" without plumbing
   * a new prop through the rendering components.
   */
  nextOverride: Record<string, { durationMs?: number; arcHeight?: number }>

  /**
   * Declare the "truth" transform for an object id. If the previous truth differs
   * and a duration is provided, kick off a new track interpolating from the
   * currently-sampled transform (or the old committed one) to the new one.
   */
  setTarget: (
    id: string,
    target: Transform,
    opts?: { durationMs?: number; arcHeight?: number }
  ) => Promise<void>

  /** Returns the committed transform, for components that need to snap. */
  getCommitted: (id: string) => Transform | undefined

  /** Internal: called by the frame tick to clear finished tracks. */
  finalizeIfDone: (id: string, nowMs: number) => void

  /** Spawn a ghost meeple flight. Resolves when flight completes. */
  spawnGhost: (g: Omit<GhostMeeple, 'startMs'>) => void

  /** Internal: remove ghost by id. */
  removeGhost: (id: string) => void

  /**
   * Store a one-shot opts override for `id`. Consumed (and removed) by the
   * next `setTarget(id, ...)` that starts a track.
   */
  setNextOverride: (id: string, opts: { durationMs?: number; arcHeight?: number }) => void
}

function transformsEqual(a: Transform, b: Transform): boolean {
  return (
    a.position[0] === b.position[0] &&
    a.position[1] === b.position[1] &&
    a.position[2] === b.position[2] &&
    a.rotationY === b.rotationY
  )
}

export const useAnimationStore = create<AnimationState>((set, get) => ({
  objects: {},
  ghosts: [],
  nextOverride: {},

  setTarget: (id, target, opts = {}) => {
    return new Promise<void>((resolve) => {
      const state = get()
      const prev = state.objects[id]

      if (!prev) {
        set({ objects: { ...state.objects, [id]: { committed: target } } })
        resolve()
        return
      }

      if (transformsEqual(prev.committed, target)) {
        resolve()
        return
      }

      // Consume one-shot override, if any. Override wins over caller opts.
      // Only consumed here (not on the no-op paths above) so it isn't wasted.
      const override = state.nextOverride[id]
      if (override) {
        opts = { ...opts, ...override }
        const { [id]: _, ...rest } = state.nextOverride
        set({ nextOverride: rest })
      }

      const duration = opts.durationMs ?? 0
      if (duration <= 0) {
        set({
          objects: { ...state.objects, [id]: { committed: target } },
        })
        resolve()
        return
      }

      const from: Transform = prev.track
        ? prev.track.to // we'll be snapping to the active track's live sample via the consumer hook
        : prev.committed

      const track: ObjectTrack = {
        from,
        to: target,
        startMs: performance.now(),
        durationMs: duration,
        arcHeight: opts.arcHeight ?? 0,
        easing: easeInOutCubic,
        resolve,
      }

      set({
        objects: {
          ...state.objects,
          [id]: { committed: target, track },
        },
      })
    })
  },

  getCommitted: (id) => get().objects[id]?.committed,

  finalizeIfDone: (id, nowMs) => {
    const rec = get().objects[id]
    if (!rec?.track) return
    if (nowMs - rec.track.startMs >= rec.track.durationMs) {
      const resolve = rec.track.resolve
      set((s) => ({
        objects: {
          ...s.objects,
          [id]: { committed: rec.committed },
        },
      }))
      resolve?.()
    }
  },

  spawnGhost: (g) => {
    const ghost: GhostMeeple = { ...g, startMs: performance.now() }
    set((s) => ({ ghosts: [...s.ghosts, ghost] }))
  },

  removeGhost: (id) => {
    set((s) => ({ ghosts: s.ghosts.filter((g) => g.id !== id) }))
  },

  setNextOverride: (id, opts) => {
    set((s) => ({ nextOverride: { ...s.nextOverride, [id]: opts } }))
  },
}))

/**
 * Override the "from" used when a new track starts, so interrupts snap to the
 * live sampled position instead of the stale stored one. Consumer hooks call
 * this at the moment they detect a new track.
 */
export function overrideTrackFrom(id: string, from: Transform): void {
  const state = useAnimationStore.getState()
  const rec = state.objects[id]
  if (!rec?.track) return
  rec.track.from = from
}
