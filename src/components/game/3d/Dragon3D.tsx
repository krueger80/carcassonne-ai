import { useMemo } from 'react'
import { 
  SCALE_FACTOR, 
  MEEPLE_DIMENSIONS, 
  createDragonShape 
} from './MeepleShapes'

export function Dragon3D({ 
  position = [0, 0, 0], 
  facing = 0,
  onClick,
  onPointerOver,
  onPointerOut
}: { 
  position?: [number, number, number], 
  facing?: number,
  onClick?: (e: any) => void,
  onPointerOver?: (e: any) => void,
  onPointerOut?: (e: any) => void
}) {
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

  return (
    <group 
      position={[position[0], position[1] + heightUnits / 2, position[2]]}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <group rotation={[0, facing * (Math.PI / 180), 0]}>
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
      </group>
    </group>
  )
}
