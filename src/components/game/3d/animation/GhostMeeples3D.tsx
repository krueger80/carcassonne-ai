import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Meeple3D } from '../Meeple3D'
import type { GhostMeeple, Transform } from './types'
import { useAnimationStore } from './animationStore'
import { sampleTrack } from './sampling'
import { easeInOutCubic } from './easing'
import { domElementToWorldTarget } from './domToWorld'

/**
 * Renders every in-flight ghost meeple as a Meeple3D whose transform is
 * sampled each frame. Mounted once inside the R3F Canvas.
 */
export function GhostMeeples3D() {
  const ghosts = useAnimationStore((s) => s.ghosts)
  return (
    <>
      {ghosts.map((g) => (
        <GhostMeepleView key={g.id} ghost={g} />
      ))}
    </>
  )
}

function GhostMeepleView({ ghost }: { ghost: GhostMeeple }) {
  const groupRef = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  const removeGhost = useAnimationStore((s) => s.removeGhost)

  // Resolve the target world position once, on mount. The camera may pan
  // during flight but we snapshot at spawn so the animation stays stable.
  const [target, setTarget] = useState<Transform | null>(null)
  useEffect(() => {
    const world = domElementToWorldTarget(
      `player-card-${ghost.targetPlayerId}`,
      camera,
      gl.domElement
    )
    if (world) {
      setTarget({
        position: [world.x, world.y, world.z],
        rotationY: ghost.from.rotationY,
      })
    } else {
      // Fall back to flying straight up if the card isn't in the DOM yet.
      const [x, y, z] = ghost.from.position
      setTarget({ position: [x, y + 20, z], rotationY: ghost.from.rotationY })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const track = useMemo(() => {
    if (!target) return null
    return {
      from: ghost.from,
      to: target,
      startMs: ghost.startMs,
      durationMs: ghost.durationMs,
      arcHeight: ghost.arcHeight,
      easing: easeInOutCubic,
    }
  }, [target, ghost])

  useFrame(() => {
    if (!track || !groupRef.current) return
    const s = sampleTrack(track, performance.now())
    groupRef.current.position.set(s.position[0], s.position[1], s.position[2])
    groupRef.current.rotation.y = s.rotationY

    // Shrink and fade in the last 40% of flight.
    const fadeStart = 0.6
    const fadeScale = s.progress < fadeStart ? 1 : 1 - (s.progress - fadeStart) / (1 - fadeStart)
    groupRef.current.scale.setScalar(fadeScale)

    if (s.done) {
      removeGhost(ghost.id)
    }
  })

  if (!track) return null

  return (
    <group ref={groupRef}>
      <Meeple3D
        type={ghost.meepleType as any}
        color={ghost.color}
        isFarmer={ghost.isFarmer}
        position={[0, 0, 0]}
      />
    </group>
  )
}
