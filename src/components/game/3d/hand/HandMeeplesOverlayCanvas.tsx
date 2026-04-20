import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'

/**
 * Fullscreen, click-through overlay canvas that hosts the shared render port
 * for every per-slot <HandMeepleView>. One WebGL context serves every
 * player card's hand meeples, sidestepping the browser's low cap on
 * simultaneous WebGL contexts (~16).
 *
 * Sits above the 2D player cards (zIndex 50). Count badges inside each
 * MeepleIcon use a higher zIndex so they stay readable on top of the 3D.
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
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 40 }}
    >
      <View.Port />
    </Canvas>
  )
}
