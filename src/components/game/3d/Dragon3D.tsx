import { useMemo } from 'react'
import {
  SCALE_FACTOR,
  MEEPLE_DIMENSIONS,
  createDragonShape
} from './MeepleShapes'
import { useAnimatedTransform } from './animation/useAnimatedTransform'
import type { Transform } from './animation/types'

interface Dragon3DProps {
  position?: [number, number, number]
  facing?: number
  /**
   * When provided, position & facing are animated via the central animation
   * manager. The outer <group>'s transform is mutated each frame by useFrame,
   * so JSX does not declare its position/rotation.
   */
  animationId?: string
  onClick?: (e: any) => void
  onPointerOver?: (e: any) => void
  onPointerOut?: (e: any) => void
}

export function Dragon3D({
  position = [0, 0, 0],
  facing = 0,
  animationId,
  onClick,
  onPointerOver,
  onPointerOut,
}: Dragon3DProps) {
  const shape = useMemo(() => createDragonShape(), [])
  const dims = MEEPLE_DIMENSIONS.DRAGON

  const worldScale = SCALE_FACTOR
  const extrudeSettings = useMemo(() => ({
    depth: dims.depth * worldScale,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.1,
    bevelThickness: 0.1
  }), [dims, worldScale])

  const heightUnits = dims.height * worldScale
  const depthUnits = extrudeSettings.depth

  if (animationId) {
    return (
      <AnimatedDragonFrame
        animationId={animationId}
        position={position}
        facing={facing}
        heightUnits={heightUnits}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <DragonMesh shape={shape} extrudeSettings={extrudeSettings} depthUnits={depthUnits} worldScale={worldScale} />
      </AnimatedDragonFrame>
    )
  }

  return (
    <group
      position={[position[0], position[1] + heightUnits / 2, position[2]]}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <group rotation={[0, facing * (Math.PI / 180), 0]}>
        <DragonMesh shape={shape} extrudeSettings={extrudeSettings} depthUnits={depthUnits} worldScale={worldScale} />
      </group>
    </group>
  )
}

function AnimatedDragonFrame({
  animationId,
  position,
  facing,
  heightUnits,
  onClick,
  onPointerOver,
  onPointerOut,
  children,
}: {
  animationId: string
  position: [number, number, number]
  facing: number
  heightUnits: number
  onClick?: (e: any) => void
  onPointerOver?: (e: any) => void
  onPointerOut?: (e: any) => void
  children: React.ReactNode
}) {
  const target = useMemo<Transform>(
    () => ({
      position: [position[0], position[1] + heightUnits / 2, position[2]],
      rotationY: facing * (Math.PI / 180),
    }),
    [position[0], position[1], position[2], facing, heightUnits]
  )

  const ref = useAnimatedTransform(animationId, target, {
    durationMs: 300,
    arcHeight: 0.8,
  })

  return (
    <group ref={ref} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {children}
    </group>
  )
}

function DragonMesh({
  shape,
  extrudeSettings,
  depthUnits,
  worldScale,
}: {
  shape: any
  extrudeSettings: any
  depthUnits: number
  worldScale: number
}) {
  return (
    <group rotation={[Math.PI, 0, 0]}>
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, -depthUnits / 2]}
        scale={[worldScale, worldScale, 1]}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color="#8B0000" roughness={0.4} />
      </mesh>
    </group>
  )
}
