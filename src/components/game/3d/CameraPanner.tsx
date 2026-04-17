import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function CameraPanner({ controlsRef, projectionPos }: { controlsRef: React.MutableRefObject<any>, projectionPos: { pos: [number, number, number], radius: number } | null }) {
  const { camera, size } = useThree()
  const targetPos = useRef<THREE.Vector3 | null>(null)
  const lastTargetKey = useRef<string | null>(null)
  const hasCheckedForPan = useRef(false)
  
  // Track if the focus object has changed
  const currentTargetKey = projectionPos ? `${projectionPos.pos.join(',')}` : null
  if (currentTargetKey !== lastTargetKey.current) {
    lastTargetKey.current = currentTargetKey
    hasCheckedForPan.current = false
  }

  useEffect(() => {
    // Only check for panning once when buttons first appear for this object
    if (!projectionPos || !controlsRef.current || hasCheckedForPan.current) return
    
    // Adjusted paddings based on user feedback
    const paddingBottom = 100 // Prevent panning too much at the bottom
    const paddingTop = 100
    const paddingSide = 220   

    // Calculate "down" direction on XZ plane relative to camera view
    // This uses the global forward vector to ensure stability during panning
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // Offset position towards the user (opposite of forward) by radius + extra margin
    // This ensures panning targets the correct "bottom" area relative to the view
    const buttonAnchor = new THREE.Vector3(
      projectionPos.pos[0] - forward.x * (projectionPos.radius + 2.0),
      projectionPos.pos[1],
      projectionPos.pos[2] - forward.z * (projectionPos.radius + 2.0)
    );
    buttonAnchor.project(camera);

    const screenX = (buttonAnchor.x + 1) * size.width / 2;
    const screenY = (-buttonAnchor.y + 1) * size.height / 2;

    let targetX = screenX;
    let targetY = screenY;

    // Calculate the target screen position within safe margins
    if (screenX < paddingSide) targetX = paddingSide;
    else if (screenX > size.width - paddingSide) targetX = size.width - paddingSide;

    if (screenY < paddingTop) targetY = paddingTop;
    else if (screenY > size.height - paddingBottom) targetY = size.height - paddingBottom;

    if ((targetX !== screenX || targetY !== screenY) && !controlsRef.current.isDragging) {
       // Precise Raycast-based panning to calculate world-space offset
       const raycaster = new THREE.Raycaster();
       const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Board plane y=0

       const getPointOnPlane = (sx: number, sy: number) => {
         const mouse = new THREE.Vector2(
           (sx / size.width) * 2 - 1,
           -(sy / size.height) * 2 + 1
         );
         raycaster.setFromCamera(mouse, camera);
         const intersection = new THREE.Vector3();
         if (raycaster.ray.intersectPlane(plane, intersection)) {
           return intersection;
         }
         return null;
       };

       const pCurrent = getPointOnPlane(screenX, screenY);
       const pTarget = getPointOnPlane(targetX, targetY);

       if (pCurrent && pTarget) {
         // The world offset to shift the camera so that the point at pCurrent moves to pTarget on screen
         const worldOffset = pCurrent.clone().sub(pTarget);
         targetPos.current = controlsRef.current.target.clone().add(worldOffset);
       }
    } else {
       targetPos.current = null;
    }

    // Mark as checked so we don't trigger again until the target object changes
    hasCheckedForPan.current = true;
  }, [size, projectionPos, controlsRef, camera])

  useFrame(() => {
    if (targetPos.current && controlsRef.current) {
      // User override: immediately stop panning if user drags the board
      if (controlsRef.current.isDragging) {
         targetPos.current = null;
         return;
      }

      const controls = controlsRef.current
      
      // Calculate a single delta vector to apply to both target and position 
      // to ensure a pure translation without any rotation.
      const delta = targetPos.current.clone().sub(controls.target).multiplyScalar(0.15)
      
      if (delta.lengthSq() > 0.0001) {
         controls.target.add(delta)
         camera.position.add(delta)
      } else {
         // Final snap to target to finish the animation
         const finalDelta = targetPos.current.clone().sub(controls.target)
         controls.target.add(finalDelta)
         camera.position.add(finalDelta)
         targetPos.current = null 
      }
    }
  })

  return null
}
