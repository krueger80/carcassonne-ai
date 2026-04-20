import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Meeple3D } from '../Meeple3D'
import { MEEPLE_DIMENSIONS, SCALE_FACTOR } from '../MeepleShapes'
import { useHandSlotsStore, type HandSlot } from './handSlotsStore'

/**
 * Fullscreen, click-through overlay canvas that renders every registered
 * hand-meeple slot at its DOM screen position. One shared orthographic
 * camera (1 world unit = 1 pixel, Y-up Three.js convention) drives every
 * player card from a single WebGL context; DOM coordinates are flipped to
 * world Y per frame.
 */
export function HandMeeplesOverlayCanvas() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      flat
    >
      <ScreenOrthoCamera />
      {/* Hand meeples render unlit so their player colour is pure — no
          lights needed. */}
      <Slots />
    </Canvas>
  )
}

function ScreenOrthoCamera() {
  const size = useThree((s) => s.size)
  return (
    <OrthographicCamera
      makeDefault
      left={0}
      right={size.width}
      top={size.height}
      bottom={0}
      near={-1000}
      far={1000}
      position={[0, 0, 500]}
      zoom={1}
    />
  )
}

function Slots() {
  const slots = useHandSlotsStore((s) => s.slots)
  return (
    <>
      {slots.map((slot) => (
        <SlotInstance key={slot.id} slot={slot} />
      ))}
    </>
  )
}

function SlotInstance({ slot }: { slot: HandSlot }) {
  const groupRef = useRef<THREE.Group>(null)
  const spinRef = useRef<THREE.Group>(null)
  const viewportSize = useThree((s) => s.size)

  const dims = MEEPLE_DIMENSIONS[slot.type] ?? MEEPLE_DIMENSIONS.NORMAL
  const heightUnits = dims.height * SCALE_FACTOR
  const TARGET_PX = 24
  const baseScale = TARGET_PX / heightUnits
  const dimFactor = slot.dimmed ? 0.82 : 1
  const finalScale = baseScale * dimFactor

  useFrame((_, dt) => {
    if (!groupRef.current) return
    const el = slot.ref.current
    if (!el) {
      groupRef.current.visible = false
      return
    }
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      groupRef.current.visible = false
      return
    }
    groupRef.current.visible = true
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    // DOM origin is top-left, Y-down. Our camera is Y-up, so flip the
    // vertical axis against the viewport height.
    const worldY = viewportSize.height - cy
    // Meeple3D centres its piece at local y = heightUnits/2 (feet at 0),
    // so we shift the group downward by half the scaled height to land
    // the piece's midpoint on (cx, worldY).
    groupRef.current.position.set(cx, worldY - (heightUnits * finalScale) / 2, 0)
    if (spinRef.current) spinRef.current.rotation.y += dt * 0.7
  })

  return (
    <group ref={groupRef} scale={finalScale}>
      <group ref={spinRef}>
        <Meeple3D type={slot.type as any} color={slot.color} isFarmer={false} unlit />
      </group>
    </group>
  )
}
