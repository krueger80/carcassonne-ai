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

function SegmentOwnership3D({ colors, segment, tile }: { colors: string[], segment: any, tile: any }) {
  const rotation = tile.rotation || 0
  const rx = rotation * (Math.PI / 180)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Clear with transparency
    ctx.clearRect(0, 0, 64, 64)

    // Draw simple vertical stripes
    // The diagonal effect comes from the world-space UV projection math
    const stripeWidth = 64 / colors.length
    colors.forEach((color, i) => {
      ctx.fillStyle = color
      ctx.fillRect(i * stripeWidth, 0, stripeWidth / 2, 64)
    })

    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 4
    return t
  }, [colors])

  const geometry = useMemo(() => {
    if (!segment.svgPath) return null
    try {
      const loader = new SVGLoader()
      const result = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${segment.svgPath}" /></svg>`)
      const path = result.paths[0]
      if (!path) return null
      
      const isClosed = segment.svgPath.toLowerCase().includes('z')
      let finalGeometry: THREE.BufferGeometry | null = null

      if (isClosed) {
        const shapes = SVGLoader.createShapes(path)
        finalGeometry = new THREE.ShapeGeometry(shapes)
      } else {
        // For open paths (Roads), we create a "ribbon"
        const points = path.subPaths[0].getPoints()
        if (points.length < 2) return null

        const ribbonWidth = 8 
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
        // 1. Manually set World-Space UVs for Global Continuity
        const posAttr = finalGeometry.getAttribute('position')
        const uvAttr = new THREE.BufferAttribute(new Float32Array(posAttr.count * 2), 2)
        
        // Period = 1.5 world units per stripe cycle (chunky and clear)
        const stripePeriod = 1.5 
        const cosR = Math.cos(-rx), sinR = Math.sin(-rx)

        for (let i = 0; i < posAttr.count; i++) {
          const lx = posAttr.getX(i), ly = posAttr.getY(i)
          
          // Tile-centered world-scale coords (unrotated)
          const ux = (lx - 50) / 100 * TILE_SIZE
          const uy = (ly - 50) / 100 * TILE_SIZE
          
          // Apply tile rotation to get world-relative offset
          const rux = ux * cosR - uy * sinR
          const ruy = ux * sinR + uy * cosR
          
          // Final world position on XZ plane
          const wx = (tile.coordinate.x * TILE_SIZE) + rux
          const wz = (tile.coordinate.y * TILE_SIZE) + ruy
          
          // Diagonal projection: anchor pattern to board origin (wx + wz)
          uvAttr.setXY(i, (wx + wz) / stripePeriod, 0)
        }
        finalGeometry.setAttribute('uv', uvAttr)

        // 2. Coordinate Mapping: SVG (0-100) -> World (-4.4 to 4.4) with Y inversion
        const scale = TILE_SIZE / 100
        finalGeometry.scale(scale, -scale, 1)
        finalGeometry.translate(-TILE_SIZE / 2, TILE_SIZE / 2, 0)
      }

      return finalGeometry
    } catch (e) {
      console.error('Error parsing SVG path for segment:', segment.id, e)
      return null
    }
  }, [segment.svgPath, rx, tile.coordinate.x, tile.coordinate.y])

  if (!texture || !geometry) return null

  return (
    <mesh geometry={geometry} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial map={texture} transparent opacity={0.7} depthWrite={false} side={THREE.DoubleSide} />
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
                tile={tile}
              />
            )
          })}
        </group>
      ))}
    </group>
  )
}
