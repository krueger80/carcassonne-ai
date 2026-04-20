import { useRef } from 'react'
import { View, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Meeple3D } from '../Meeple3D'
import type { MeepleType } from '../../../../core/types/player'

interface HandMeepleViewProps {
  type: Exclude<MeepleType, 'COUNT' | 'FARMER'> | 'NORMAL' | 'BIG' | 'BUILDER' | 'PIG' | 'ABBOT'
  color: string
  /** Dimmed when the player has 0 of this meeple available. */
  dimmed?: boolean
}

/**
 * A single 3D hand meeple portalled into the shared overlay canvas. It draws
 * a standing meeple that spins slowly on its vertical axis so the piece
 * reads as 3D at the tiny ~24px icon scale.
 *
 * Rendered inside `MeepleIcon` in `PlayerCard`, replacing the 2D MeepleSVG.
 */
export function HandMeepleView({ type, color, dimmed = false }: HandMeepleViewProps) {
  return (
    <View style={{ position: 'absolute', inset: -4 }}>
      <PerspectiveCamera makeDefault position={[0, 0.2, 2.8]} fov={38} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 4, 3]} intensity={0.9} />
      <directionalLight position={[-2, 2, -2]} intensity={0.25} />
      <SpinningMeeple type={type} color={color} dimmed={dimmed} />
    </View>
  )
}

function SpinningMeeple({
  type,
  color,
  dimmed,
}: {
  type: HandMeepleViewProps['type']
  color: string
  dimmed: boolean
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.8
  })

  return (
    <group ref={ref} position={[0, -0.55, 0]} scale={dimmed ? 0.78 : 0.95}>
      <Meeple3D type={type as any} color={color} isFarmer={false} />
    </group>
  )
}
