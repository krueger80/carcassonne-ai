import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { 
  SCALE_FACTOR, 
  MEEPLE_DIMENSIONS, 
  createFairyShape 
} from './MeepleShapes'

export function Fairy3D({ 
  position = [0, 0, 0] 
}: { 
  position?: [number, number, number] 
}) {
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

  return (
    <group position={[position[0], position[1] + heightUnits / 2, position[2]]}>
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
          {/* Glow point light */}
          <pointLight intensity={0.8} distance={3} color="#FFB6C1" />
        </mesh>
      </group>
    </group>
  )
}
