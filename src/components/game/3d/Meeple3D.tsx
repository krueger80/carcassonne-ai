import { useMemo } from 'react'
import * as THREE from 'three'

interface Meeple3DProps {
  type: 'NORMAL' | 'BIG' | 'BUILDER' | 'PIG' | 'ABBOT' | 'FARMER'
  color: string
  isFarmer?: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
  isTentative?: boolean
}

function createMeepleShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.4, 0)
  shape.lineTo(-0.4, 0.3)
  shape.lineTo(-0.8, 0.3)
  shape.lineTo(-0.8, 0.8)
  shape.lineTo(-0.4, 0.8)
  shape.lineTo(-0.4, 1.2)
  shape.bezierCurveTo(-0.4, 1.5, 0.4, 1.5, 0.4, 1.2)
  shape.lineTo(0.4, 0.8)
  shape.lineTo(0.8, 0.8)
  shape.lineTo(0.8, 0.3)
  shape.lineTo(0.4, 0.3)
  shape.lineTo(0.4, 0)
  shape.lineTo(-0.4, 0)
  return shape
}

function createAbbotShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.3, 0)
  shape.lineTo(-0.3, 0.4)
  shape.lineTo(-0.6, 0.4)
  shape.lineTo(-0.6, 0.9)
  shape.lineTo(-0.3, 0.9)
  shape.lineTo(-0.3, 1.3)
  // Abbot mitre (pointy hat)
  shape.lineTo(0, 1.7)
  shape.lineTo(0.3, 1.3)
  shape.lineTo(0.3, 0.9)
  shape.lineTo(0.6, 0.9)
  shape.lineTo(0.6, 0.4)
  shape.lineTo(0.3, 0.4)
  shape.lineTo(0.3, 0)
  shape.lineTo(-0.3, 0)
  return shape
}

function createBuilderShape() {
  const shape = new THREE.Shape()
  // Builder with wide hat
  shape.moveTo(-0.4, 0)
  shape.lineTo(-0.4, 0.4)
  shape.lineTo(-0.7, 0.4)
  shape.lineTo(-0.7, 0.8)
  shape.lineTo(-0.9, 0.8) // wide brim
  shape.lineTo(0.9, 0.8)
  shape.lineTo(0.7, 0.8)
  shape.lineTo(0.7, 0.4)
  shape.lineTo(0.4, 0.4)
  shape.lineTo(0.4, 0)
  shape.lineTo(-0.4, 0)
  return shape
}

function createPigShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.8, 0)
  shape.lineTo(-0.8, 0.5)
  shape.bezierCurveTo(-0.8, 0.8, -0.5, 1.0, 0, 1.0)
  shape.bezierCurveTo(0.5, 1.0, 0.8, 0.8, 0.8, 0.5)
  shape.lineTo(0.8, 0)
  shape.lineTo(0.5, 0)
  shape.lineTo(0.5, 0.2)
  shape.lineTo(-0.5, 0.2)
  shape.lineTo(-0.5, 0)
  shape.lineTo(-0.8, 0)
  return shape
}

export function Meeple3D({ 
  type, color, isFarmer = false, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  isTentative = false 
}: Meeple3DProps) {
  const shape = useMemo(() => {
    switch (type) {
      case 'PIG': return createPigShape()
      case 'ABBOT': return createAbbotShape()
      case 'BUILDER': return createBuilderShape()
      default: return createMeepleShape()
    }
  }, [type])

  const scale = type === 'BIG' ? 1.4 : 1.0

  const extrudeSettings = useMemo(() => ({
    depth: 0.4, // 10mm
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05
  }), [])

  // Farmer lies on its back
  const groupRot: [number, number, number] = isFarmer 
    ? [rotation[0] - Math.PI / 2, rotation[1], rotation[2]] 
    : rotation
  const groupPos: [number, number, number] = isFarmer 
    ? [position[0], position[1] + 0.2, position[2]]
    : position

  return (
    <group position={groupPos} rotation={groupRot} scale={[scale, scale, scale]}>
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 0, -0.2]}
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
  )
}
