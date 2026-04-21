import { useEffect, useReducer, useRef } from 'react'
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
 *
 * The Canvas sits at zIndex 200 so 3D meeples paint over semi-transparent
 * PlayerCard backgrounds; the card's 24-px count badge still shows because
 * meshBasicMaterial only writes pixels inside the meeple's silhouette, and
 * the badge sits at the slot's bottom-right corner.
 */
export function HandMeeplesOverlayCanvas() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 200,
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

/**
 * Re-renders its subscribers whenever the mobile visual viewport changes
 * (pinch zoom / scroll). Returns the viewport width/height/scale/offset
 * to use, falling back to the fallback size when visualViewport is absent.
 */
function useVisualViewport(fallback: { width: number; height: number }) {
  const [, force] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null
    if (!vv) return
    vv.addEventListener('resize', force)
    vv.addEventListener('scroll', force)
    return () => {
      vv.removeEventListener('resize', force)
      vv.removeEventListener('scroll', force)
    }
  }, [])

  const vv = typeof window !== 'undefined' ? window.visualViewport : null
  if (!vv) {
    return { width: fallback.width, height: fallback.height, scale: 1, offsetLeft: 0, offsetTop: 0 }
  }
  return {
    width: vv.width,
    height: vv.height,
    scale: vv.scale,
    offsetLeft: vv.offsetLeft,
    offsetTop: vv.offsetTop,
  }
}

function ScreenOrthoCamera() {
  const size = useThree((s) => s.size)
  const vv = useVisualViewport(size)
  return (
    <OrthographicCamera
      makeDefault
      left={0}
      right={vv.width}
      top={vv.height}
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
  const canvasSize = useThree((s) => s.size)
  const vv = useVisualViewport(canvasSize)

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
    // getBoundingClientRect returns layout-viewport CSS px; map into the
    // visual viewport the Canvas actually paints into. When visualViewport
    // is unavailable (desktop without the API), offset=0 and scale=1 so the
    // formula collapses to the default case.
    const cx = (rect.left + rect.width / 2 - vv.offsetLeft) * vv.scale
    const cy = (rect.top + rect.height / 2 - vv.offsetTop) * vv.scale
    // DOM origin is top-left, Y-down. Our camera is Y-up, so flip the
    // vertical axis against the viewport height.
    const worldY = vv.height - cy
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
