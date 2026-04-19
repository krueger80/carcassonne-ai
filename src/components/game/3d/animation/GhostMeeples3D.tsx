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

  // Resolve the card endpoint once, on mount. The camera may pan during
  // flight but we snapshot at spawn so the animation stays stable.
  const [cardTransform, setCardTransform] = useState<Transform | null>(null)
  useEffect(() => {
    const world = domElementToWorldTarget(
      `player-card-${ghost.cardPlayerId}`,
      camera,
      gl.domElement
    )
    if (world) {
      setCardTransform({
        position: [world.x, world.y, world.z],
        rotationY: ghost.worldEndpoint.rotationY,
      })
    } else {
      // Fall back: park the card endpoint above the world endpoint, far
      // enough for the arc to feel intentional even without a card to aim at.
      const [x, y, z] = ghost.worldEndpoint.position
      setCardTransform({
        position: [x, y + 20, z],
        rotationY: ghost.worldEndpoint.rotationY,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const track = useMemo(() => {
    if (!cardTransform) return null
    const from = ghost.direction === 'to-card' ? ghost.worldEndpoint : cardTransform
    const to = ghost.direction === 'to-card' ? cardTransform : ghost.worldEndpoint
    return {
      from,
      to,
      startMs: ghost.startMs,
      durationMs: ghost.durationMs,
      arcHeight: ghost.arcHeight,
      easing: easeInOutCubic,
    }
  }, [cardTransform, ghost])

  useFrame(() => {
    if (!track || !groupRef.current) return
    const s = sampleTrack(track, performance.now())
    groupRef.current.position.set(s.position[0], s.position[1], s.position[2])
    groupRef.current.rotation.y = s.rotationY

    // Devour ghosts (to-card) shrink as they approach the card so they
    // visually dissolve into the supply. Placement ghosts (from-card)
    // stay full-size — the static board meeple takes over once the
    // suppressKey is released on landing.
    if (ghost.direction === 'to-card') {
      const fadeStart = 0.6
      const fadeScale =
        s.progress < fadeStart ? 1 : 1 - (s.progress - fadeStart) / (1 - fadeStart)
      groupRef.current.scale.setScalar(fadeScale)
    }

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
