import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Fairy3D({ 
  position = [0, 0, 0] 
}: { 
  position?: [number, number, number] 
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Bob gently on Y axis, starting above any meeple
      meshRef.current.position.y = position[1] + 1.2 + Math.sin(clock.getElapsedTime() * 2) * 0.3
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#FFF0F5" 
          emissive="#FFB6C1" 
          emissiveIntensity={0.8}
          roughness={0} 
        />
        {/* Glow point light */}
        <pointLight intensity={2} distance={3} color="#FFB6C1" />
      </mesh>
      
      {/* Decorative vertical line / trail */}
      <mesh position={[0, 0, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.02, 0.02, 2.5]} />
        <meshBasicMaterial color="#FFB6C1" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
