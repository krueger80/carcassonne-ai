import { useMemo, Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
// @ts-ignore
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { SCALE_FACTOR, MEEPLE_DIMENSIONS } from './MeepleShapes'

const TILE_SIZE = 8.8 // Mapping 88px to 8.8 world units for scale consistency
const TILE_THICKNESS = MEEPLE_DIMENSIONS.TILE.depth * SCALE_FACTOR

interface Tile3DProps {
  tile: any
  definition: any
  staticTileMap?: Record<string, any>
  onClick?: (e: any) => void
  onPointerOver?: (e: any) => void
  onPointerOut?: (e: any) => void
  isTentative?: boolean
  renderLinked?: boolean
  segmentOwnerColors?: Record<string, string[]>
}

function SegmentOwnership3D({ colors, segment, rotation }: { colors: string[], segment: any, rotation: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background
    ctx.fillStyle = colors[0]
    ctx.fillRect(0, 0, 128, 128)

    // Draw diagonal stripes
    const stripeWidth = 128 / 8
    ctx.save()
    ctx.translate(64, 64)
    // Counter-rotate stripes to keep them diagonal relative to the board
    ctx.rotate((45 - rotation) * (Math.PI / 180))
    ctx.translate(-128, -128)

    for (let i = 0; i < 32; i++) {
      ctx.fillStyle = colors[i % colors.length]
      ctx.fillRect(i * stripeWidth * 2, 0, stripeWidth, 256)
    }
    ctx.restore()

    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 4
    return t
  }, [colors, rotation])

  const geometry = useMemo(() => {
    if (!segment.svgPath) return null
    const loader = new SVGLoader()
    const result = loader.parse(`<svg><path d="${segment.svgPath}" /></svg>`)
    const path = result.paths[0]
    
    const isClosed = segment.svgPath.toLowerCase().includes('z')
    let finalGeometry: THREE.BufferGeometry | null = null

    if (isClosed) {
      const shapes = SVGLoader.createShapes(path)
      finalGeometry = new THREE.ShapeGeometry(shapes)
    } else {
      // For open paths (Roads/Rivers), we create a "ribbon"
      // We can use the subPaths to get points and then create a shape from them
      const points = path.subPaths[0].getPoints()
      if (points.length < 2) return null

      // Create a ribbon shape by offsetting the path
      const ribbonWidth = 8 // Matches 2D strokeWidth
      const ribbonShape = new THREE.Shape()
      
      const leftPoints: THREE.Vector2[] = []
      const rightPoints: THREE.Vector2[] = []

      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        const next = points[i + 1] || points[i]
        const prev = points[i - 1] || points[i]
        
        const dir = new THREE.Vector2().subVectors(next, prev).normalize()
        const normal = new THREE.Vector2(-dir.y, dir.x)
        
        leftPoints.push(new THREE.Vector2().addVectors(p, normal.clone().multiplyScalar(ribbonWidth / 2)))
        rightPoints.push(new THREE.Vector2().addVectors(p, normal.clone().multiplyScalar(-ribbonWidth / 2)))
      }

      ribbonShape.moveTo(leftPoints[0].x, leftPoints[0].y)
      for (let i = 1; i < leftPoints.length; i++) ribbonShape.lineTo(leftPoints[i].x, leftPoints[i].y)
      for (let i = rightPoints.length - 1; i >= 0; i--) ribbonShape.lineTo(rightPoints[i].x, rightPoints[i].y)
      ribbonShape.closePath()

      finalGeometry = new THREE.ShapeGeometry(ribbonShape)
    }

    if (finalGeometry) {
      // Coordinate Mapping: SVG (0-100) -> World (-4.4 to 4.4) with Y inversion
      const scale = TILE_SIZE / 100
      finalGeometry.scale(scale, -scale, 1)
      finalGeometry.translate(-TILE_SIZE / 2, TILE_SIZE / 2, 0)
    }

    return finalGeometry
  }, [segment.svgPath])

  if (!texture || !geometry) return null

  return (
    <mesh geometry={geometry} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial map={texture} transparent opacity={0.6} depthWrite={false} />
    </mesh>
  )
}

function TileTexture({ imageUrl, imageConfig }: { imageUrl?: string, imageConfig?: any }) {
  if (!imageUrl) return <meshStandardMaterial color="#dddddd" roughness={0.8} />
  return <LoadedTileTexture imageUrl={imageUrl} imageConfig={imageConfig} />
}

function LoadedTileTexture({ imageUrl, imageConfig }: { imageUrl: string, imageConfig?: any }) {
  const baseTexture = useTexture(imageUrl)

  const texture = useMemo(() => {
    if (!baseTexture) return null
    const t = baseTexture.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 16
    t.needsUpdate = true

    if (imageConfig) {
      t.repeat.set(1 / (imageConfig.widthFactor || 1), 1 / (imageConfig.heightFactor || 1))
      const offsetX = imageConfig.offsetX || 0
      const offsetY = imageConfig.offsetY || 0
      t.offset.set(offsetX, 1 - (1 / (imageConfig.heightFactor || 1)) - offsetY)
    }
    return t
  }, [baseTexture, imageConfig])

  useEffect(() => {
    return () => {
      texture?.dispose()
    }
  }, [texture])

  if (!texture) return <meshStandardMaterial color="#cccccc" />

  return <meshStandardMaterial map={texture} roughness={0.6} />
}

export function Tile3D({ 
  tile, 
  definition, 
  staticTileMap, 
  onClick, 
  onPointerOver,
  onPointerOut,
  isTentative = false, 
  renderLinked = false,
  segmentOwnerColors = {}
}: Tile3DProps) {
  // Composite footprint calculation
  const footprints = useMemo(() => {
    const base = [{ dx: 0, dy: 0, def: definition }]
    if (renderLinked && definition.linkedTiles && definition.linkedTiles.length > 0) {
      const extra = definition.linkedTiles.map((lt: any) => {
        const linkedDef = staticTileMap ? staticTileMap[lt.definitionId] : definition
        return { dx: lt.dx, dy: lt.dy, def: linkedDef || definition }
      })
      return [...base, ...extra]
    }
    return base
  }, [definition, staticTileMap, renderLinked])

  const { x, y } = tile.coordinate
  const rx = (tile.rotation || 0) * (Math.PI / 180)

  return (
    <group position={[x * TILE_SIZE, 0, y * TILE_SIZE]} rotation={[0, -rx, 0]}>
      {footprints.map((fp, idx) => (
        <group key={idx} position={[fp.dx * TILE_SIZE, 0, fp.dy * TILE_SIZE]}>
          <mesh 
            position={[0, -TILE_THICKNESS / 2, 0]}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[TILE_SIZE - 0.05, TILE_THICKNESS, TILE_SIZE - 0.05]} />
            <meshStandardMaterial 
              color={isTentative ? "#aaddff" : "#ffffff"} 
              transparent={isTentative}
              opacity={isTentative ? 0.7 : 1}
              roughness={0.8}
            />
          </mesh>
          
          {/* Top surface for texture */}
          <mesh 
            position={[0, 0.01, 0]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
          >
            <planeGeometry args={[TILE_SIZE - 0.1, TILE_SIZE - 0.1]} />
            <Suspense fallback={<meshStandardMaterial color="#cccccc" />}>
              <TileTexture imageUrl={fp.def.imageUrl} imageConfig={fp.def.imageConfig} />
            </Suspense>
          </mesh>

          {/* Ownership Overlays */}
          {Object.entries(segmentOwnerColors).map(([segId, colors]) => {
            const seg = fp.def.segments.find((s: any) => s.id === segId)
            if (!seg) return null
            return (
              <SegmentOwnership3D 
                key={segId} 
                colors={colors} 
                segment={seg} 
                rotation={tile.rotation || 0}
              />
            )
          })}
        </group>
      ))}
    </group>
  )
}
