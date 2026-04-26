import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Transform } from './types'
import { useAnimationStore, overrideTrackFrom } from './animationStore'
import { sampleTrack } from './sampling'

/**
 * Binds a THREE.Object3D (typically a <group>) to the animation store's target
 * for `id`. On each target change, the store starts a new track interpolating
 * from the current live sample to the new target over `durationMs`. Each frame
 * we mutate the object's position/rotation directly — no React re-renders,
 * which keeps memoized parents stable.
 *
 * Returns a ref to attach to the controlled object.
 */
export function useAnimatedTransform(
  id: string,
  target: Transform,
  opts: { durationMs?: number; arcHeight?: number } = {}
) {
  const ref = useRef<THREE.Group>(null)
  // Tracks whether we've painted at least one frame for this mount — used to
  // decide whether `lastSampleRef` is trustworthy. On a fresh mount it just
  // mirrors the target, which would cause the interrupt override to collapse
  // the animation (from==to) if applied without a real sample.
  const haveSampledRef = useRef(false)
  const lastSampleRef = useRef<Transform>({
    position: target.position,
    rotationY: target.rotationY,
    rotationX: target.rotationX ?? 0,
  })

  // When target changes, push it into the store. On first call for a new id,
  // this sets the committed transform synchronously; otherwise it starts a
  // track from the previous committed (or the live sample on interrupt).
  useEffect(() => {
    const store = useAnimationStore.getState()
    const existed = store.objects[id] !== undefined
    // Fire-and-forget: the promise resolves when the track completes, but
    // purely visual hooks don't need to await.
    void store.setTarget(id, target, existed ? opts : undefined)
    if (existed && haveSampledRef.current) {
      // We've rendered at least one frame, so lastSampleRef reflects the
      // on-screen transform — use it for interrupt continuity.
      overrideTrackFrom(id, lastSampleRef.current)
    } else if (!existed) {
      lastSampleRef.current = target
    }
    // When existed && !haveSampled: first mount after a previous unmount.
    // Leave track.from at the store's committed (stable across unmounts).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, target.position[0], target.position[1], target.position[2], target.rotationY, target.rotationX])

  useFrame(() => {
    const obj = ref.current
    if (!obj) return

    const rec = useAnimationStore.getState().objects[id]
    if (!rec) return

    let pos: [number, number, number]
    let rotY: number
    let rotX: number

    if (rec.track) {
      const s = sampleTrack(rec.track, performance.now())
      pos = s.position
      rotY = s.rotationY
      rotX = s.rotationX
      if (s.done) {
        useAnimationStore.getState().finalizeIfDone(id, performance.now())
      }
    } else {
      pos = rec.committed.position
      rotY = rec.committed.rotationY
      rotX = rec.committed.rotationX ?? 0
    }

    obj.position.set(pos[0], pos[1], pos[2])
    obj.rotation.y = rotY
    obj.rotation.x = rotX
    lastSampleRef.current = { position: pos, rotationY: rotY, rotationX: rotX }
    haveSampledRef.current = true
  })

  return ref
}
