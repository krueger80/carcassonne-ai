import { memo, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  SCALE_FACTOR,
  MEEPLE_DIMENSIONS,
  createFairyShape
} from './MeepleShapes'
import { useAnimatedTransform } from './animation/useAnimatedTransform'
import type { Transform } from './animation/types'

interface Fairy3DProps {
  position?: [number, number, number]
  /**
   * When provided, the fairy's world position is animated via the central
   * animation manager. The outer <group> is mutated per frame — JSX does not
   * declare its position.
   */
  animationId?: string
}

function Fairy3DImpl({ position = [0, 0, 0], animationId }: Fairy3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const shape = useMemo(() => createFairyShape(), [])
  const dims = MEEPLE_DIMENSIONS.FAIRY

  const worldScale = SCALE_FACTOR
  const extrudeSettings = useMemo(() => ({
    depth: dims.depth * worldScale,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05
  }), [dims, worldScale])

  const heightUnits = dims.height * worldScale
  const depthUnits = extrudeSettings.depth

  const body = (
    <group rotation={[Math.PI, 0, 0]}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        position={[0, 0, -depthUnits / 2]}
        scale={[worldScale, worldScale, 1]}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          color="#FFF0F5"
          emissive="#FFB6C1"
          emissiveIntensity={0.3}
          roughness={0}
        />
        <pointLight intensity={0.8} distance={3} color="#FFB6C1" />
      </mesh>
    </group>
  )

  if (animationId) {
    return (
      <AnimatedFairyFrame animationId={animationId} position={position} heightUnits={heightUnits}>
        {body}
      </AnimatedFairyFrame>
    )
  }

  return (
    <group position={[position[0], position[1] + heightUnits / 2, position[2]]}>
      {body}
    </group>
  )
}

function AnimatedFairyFrame({
  animationId,
  position,
  heightUnits,
  children,
}: {
  animationId: string
  position: [number, number, number]
  heightUnits: number
  children: React.ReactNode
}) {
  const target = useMemo<Transform>(
    () => ({
      position: [position[0], position[1] + heightUnits / 2, position[2]],
      rotationY: 0,
    }),
    [position[0], position[1], position[2], heightUnits]
  )

  const ref = useAnimatedTransform(animationId, target, {
    durationMs: 600,
    arcHeight: 2.5,
  })

  return <group ref={ref}>{children}</group>
}

export const Fairy3D = memo(Fairy3DImpl)
