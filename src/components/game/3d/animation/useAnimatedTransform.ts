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
  const lastSampleRef = useRef<Transform>(target)

  // When target changes, push it into the store. On first call, this sets
  // the committed transform synchronously; on subsequent calls, it starts a
  // track. We also override the track's `from` with the last rendered sample
  // so interrupts look continuous.
  useEffect(() => {
    const store = useAnimationStore.getState()
    const existed = store.objects[id] !== undefined
    // Fire-and-forget: the promise resolves when the track completes, but
    // purely visual hooks don't need to await.
    void store.setTarget(id, target, existed ? opts : undefined)
    if (existed) {
      overrideTrackFrom(id, lastSampleRef.current)
    } else {
      lastSampleRef.current = target
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, target.position[0], target.position[1], target.position[2], target.rotationY])

  useFrame(() => {
    const obj = ref.current
    if (!obj) return

    const rec = useAnimationStore.getState().objects[id]
    if (!rec) return

    let pos: [number, number, number]
    let rotY: number

    if (rec.track) {
      const s = sampleTrack(rec.track, performance.now())
      pos = s.position
      rotY = s.rotationY
      if (s.done) {
        useAnimationStore.getState().finalizeIfDone(id, performance.now())
      }
    } else {
      pos = rec.committed.position
      rotY = rec.committed.rotationY
    }

    obj.position.set(pos[0], pos[1], pos[2])
    obj.rotation.y = rotY
    lastSampleRef.current = { position: pos, rotationY: rotY }
  })

  return ref
}
