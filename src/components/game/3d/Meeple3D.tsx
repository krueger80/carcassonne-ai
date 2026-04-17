import { useMemo } from 'react'
import { 
  SCALE_FACTOR, 
  MEEPLE_DIMENSIONS,
  createRegularMeepleShape, 
  createBigMeepleShape, 
  createBuilderShape, 
  createPigShape,
  createCountShape 
} from './MeepleShapes'

interface Meeple3DProps {
  type: 'NORMAL' | 'BIG' | 'BUILDER' | 'PIG' | 'ABBOT' | 'FARMER' | 'COUNT'
  color: string
  isFarmer?: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
  isTentative?: boolean
  onClick?: (e: any) => void
  onPointerOver?: (e: any) => void
  onPointerOut?: (e: any) => void
}

export function Meeple3D({ 
  type, color, isFarmer = false, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  isTentative = false,
  onClick,
  onPointerOver,
  onPointerOut
}: Meeple3DProps) {
  const shape = useMemo(() => {
    switch (type) {
      case 'PIG': return createPigShape()
      case 'BUILDER': return createBuilderShape()
      case 'BIG': return createBigMeepleShape()
      case 'COUNT': return createCountShape()
      default: return createRegularMeepleShape()
    }
  }, [type])

  const dimensions = useMemo(() => {
    switch (type) {
      case 'PIG': return MEEPLE_DIMENSIONS.PIG
      case 'BUILDER': return MEEPLE_DIMENSIONS.BUILDER
      case 'BIG': return MEEPLE_DIMENSIONS.BIG
      case 'COUNT': return MEEPLE_DIMENSIONS.COUNT
      default: return MEEPLE_DIMENSIONS.NORMAL
    }
  }, [type])

  const worldScale = SCALE_FACTOR
  const extrudeSettings = useMemo(() => ({
    depth: dimensions.depth * SCALE_FACTOR,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05
  }), [dimensions])

  const depthUnits = extrudeSettings.depth
  const heightUnits = dimensions.height * worldScale

  // Grounding logic:
  // Standing: feet are at World Y = 0 (relative to group)
  // Farmer: back is at World Y = 0 (relative to group)
  const verticalOffset = isFarmer ? (depthUnits / 2) : (heightUnits / 2)

  return (
    // 1. Placement on Board at the segment center
    <group position={[position[0], position[1] + verticalOffset, position[2]]}>
      {/* 2. Vertical Axis Spin (Preserves upright or lying posture) */}
      <group rotation={[0, rotation[1], 0]}>
        {/* 3. Posture Tilt (Math.PI flips SVG Y-down to stand Y-up, -Math.PI/2 lies on back) */}
        <group rotation={isFarmer ? [-Math.PI / 2, 0, 0] : [Math.PI, 0, 0]}>
          {/* 4. Volume Centering: Center the extruded thickness on the origin */}
          <mesh 
            castShadow 
            receiveShadow 
            position={[0, 0, -depthUnits / 2]}
            scale={[worldScale, worldScale, 1]}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
          >
            <extrudeGeometry args={[shape, extrudeSettings]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.5} 
              metalness={0.1}
              transparent={isTentative}
              opacity={isTentative ? 0.5 : 1}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}
