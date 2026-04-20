import { useRef } from 'react'
import { View, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Meeple3D } from '../Meeple3D'
import { MEEPLE_DIMENSIONS, SCALE_FACTOR } from '../MeepleShapes'
import type { MeepleType } from '../../../../core/types/player'

type HandMeepleType = 'NORMAL' | 'BIG' | 'BUILDER' | 'PIG' | 'ABBOT'

interface HandMeepleViewProps {
  type: HandMeepleType
  color: string
  /** Dimmed when the player has 0 of this meeple available. */
  dimmed?: boolean
}

/**
 * A single 3D hand meeple portalled into the shared overlay canvas. Spins
 * slowly so the piece reads as 3D at ~24px on screen. Camera framing is
 * derived from the meeple's own vertical extent so every type (pig ↔
 * builder) sits centred with the same visual padding.
 */
export function HandMeepleView({ type, color, dimmed = false }: HandMeepleViewProps) {
  return (
    <View style={{ position: 'absolute', inset: -4 }}>
      <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={22} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 3]} intensity={0.9} />
      <directionalLight position={[-2, 2, -2]} intensity={0.25} />
      <SpinningMeeple type={type} color={color} dimmed={dimmed} />
    </View>
  )
}

function dimensionsFor(type: HandMeepleType) {
  return MEEPLE_DIMENSIONS[type as keyof typeof MEEPLE_DIMENSIONS] ?? MEEPLE_DIMENSIONS.NORMAL
}

function SpinningMeeple({
  type,
  color,
  dimmed,
}: {
  type: HandMeepleType
  color: string
  dimmed: boolean
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.7
  })

  // Normalise every meeple type to the same visible height so a BUILDER
  // (tallest) and a PIG (shortest) read as the same icon-scale in the
  // hand. Meeple3D centres its piece around local y = heightUnits/2
  // (feet at 0), so after scaling we shift by -TARGET_HEIGHT/2 to put
  // the piece's midpoint at the camera target.
  const dims = dimensionsFor(type)
  const heightUnits = dims.height * SCALE_FACTOR
  const TARGET_HEIGHT = 2.6
  const normalizeScale = TARGET_HEIGHT / heightUnits
  const dimFactor = dimmed ? 0.85 : 1
  const finalScale = dimFactor * normalizeScale
  const yOffset = -(TARGET_HEIGHT * dimFactor) / 2

  return (
    <group
      ref={ref}
      scale={finalScale}
      position={[0, yOffset, 0]}
    >
      <Meeple3D
        type={type as MeepleType}
        color={color}
        isFarmer={false}
      />
    </group>
  )
}
