import * as THREE from 'three'

/**
 * Project a DOM element's center point into world space along a ray from the
 * current camera, at a fixed distance from the camera. The resulting world
 * point, when re-projected, falls on the DOM element's center — so a 3D piece
 * animated to that point will appear to fly toward that DOM element.
 *
 * Returns null if the element is not found.
 */
export function domElementToWorldTarget(
  elementId: string,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
  distanceFromCamera = 25
): THREE.Vector3 | null {
  const el = document.getElementById(elementId)
  if (!el) return null

  const rect = el.getBoundingClientRect()
  const canvasRect = canvas.getBoundingClientRect()

  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  const ndcX = ((cx - canvasRect.left) / canvasRect.width) * 2 - 1
  const ndcY = -(((cy - canvasRect.top) / canvasRect.height) * 2 - 1)

  // Cast a ray from the camera through the NDC point and walk along it.
  const nearPoint = new THREE.Vector3(ndcX, ndcY, -1).unproject(camera)
  const direction = nearPoint.sub(camera.position).normalize()
  return camera.position.clone().add(direction.multiplyScalar(distanceFromCamera))
}
