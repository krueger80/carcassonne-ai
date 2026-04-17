import { forwardRef, useEffect, useRef } from 'react'
import { MapControls } from '@react-three/drei'
import * as THREE from 'three'
import { useUIStore } from '../../../store/uiStore.ts'

const MOUSE_BUTTONS = {
  LEFT: THREE.MOUSE.PAN,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.ROTATE,
}

export const CameraController = forwardRef(({ lastInteractionPos }: { lastInteractionPos: [number, number, number] | null }, ref: any) => {
  const localRef = useRef<any>(null)
  const resolvedRef = ref || localRef
  const cameraAction = useUIStore(s => s.cameraAction)

  useEffect(() => {
    const controls = resolvedRef.current
    if (!controls) return

    const handleReset = () => {
      controls.isOrbiting = false
      controls.isManualInteraction = false
      document.body.classList.remove('is-dragging')
    }

    const onStart = () => {
      document.body.classList.add('is-dragging')
    }

    const onEnd = () => {
      document.body.classList.remove('is-dragging')
    }

    window.addEventListener('pointerup', handleReset)
    window.addEventListener('pointercancel', handleReset)
    window.addEventListener('blur', handleReset)
    controls.addEventListener('start', onStart)
    controls.addEventListener('end', onEnd)

    return () => {
      window.removeEventListener('pointerup', handleReset)
      window.removeEventListener('pointercancel', handleReset)
      window.removeEventListener('blur', handleReset)
      controls.removeEventListener('start', onStart)
      controls.removeEventListener('end', onEnd)
    }
  }, [resolvedRef])

  useEffect(() => {
    const controls = resolvedRef.current
    if (!controls || cameraAction.type === 'NONE') return

    const camera = controls.object
    if (!camera) return

    if (cameraAction.type === 'RESET') {
      // Focus on the last interaction point if available, otherwise center of board
      const target = new THREE.Vector3(0, 0, 0)
      if (lastInteractionPos) {
        target.set(lastInteractionPos[0], 0, lastInteractionPos[2])
      }
      
      controls.target.copy(target)
      
      // Default reset position: higher and further back for a better overview
      camera.position.set(target.x, target.y + 45, target.z + 35)
      
      controls.update()
    } else if (cameraAction.type === 'ZOOM_IN') {
      const factor = 0.8
      // Dolly in by lerping position towards target
      camera.position.lerp(controls.target, 1 - factor)
      controls.update()
    } else if (cameraAction.type === 'ZOOM_OUT') {
      const factor = 1.25
      // Dolly out by moving position away from target
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target)
      camera.position.addVectors(controls.target, offset.multiplyScalar(factor))
      controls.update()
    }
  }, [cameraAction, resolvedRef])

  return (
    <MapControls
      ref={resolvedRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={10}
      maxDistance={200}
      mouseButtons={MOUSE_BUTTONS}
    />
  )
})
