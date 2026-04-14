import { useEffect, useRef } from 'react'
import { MapControls } from '@react-three/drei'
import * as THREE from 'three'

export function CameraController() {
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    const handleReset = () => {
      if (controlsRef.current) {
        controlsRef.current.isOrbiting = false
        controlsRef.current.isManualInteraction = false
      }
    }
    window.addEventListener('pointerup', handleReset)
    window.addEventListener('pointercancel', handleReset)
    window.addEventListener('blur', handleReset)
    return () => {
      window.removeEventListener('pointerup', handleReset)
      window.removeEventListener('pointercancel', handleReset)
      window.removeEventListener('blur', handleReset)
    }
  }, [])

  return (
    <MapControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={10}
      maxDistance={200}
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
    />
  )
}
