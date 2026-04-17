import { useMemo, Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
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

function OwnershipOverlay({ colors, segmentId, definition }: { colors: string[], segmentId: string, definition: any }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background
    ctx.fillStyle = colors[0]
    ctx.fillRect(0, 0, 128, 128)

    if (colors.length > 1 || true) { // Always show stripes if we have colors
      const stripeWidth = 128 / 8
      ctx.translate(64, 64)
      ctx.rotate(Math.PI / 4)
      ctx.translate(-128, -128)

      for (let i = 0; i < 16; i++) {
        ctx.fillStyle = colors[i % colors.length]
        ctx.fillRect(i * stripeWidth * 2, 0, stripeWidth, 256)
      }
    }

    const t = new THREE.CanvasTexture(canvas)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 4
    return t
  }, [colors])

  const center = useMemo(() => {
    const segment = definition.segments.find((s: any) => s.id === segmentId)
    const centroid = segment?.meepleCentroid || segment?.centroid
    if (!centroid) return new THREE.Vector3(0, 0.05, 0)
    const ox = (centroid.x - 50) / 100 * TILE_SIZE
    const oy = (centroid.y - 50) / 100 * TILE_SIZE
    return new THREE.Vector3(ox, 0.05, oy)
  }, [segmentId, definition])

  if (!texture) return null

  return (
    <mesh position={center} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.2, 32]} />
      <meshBasicMaterial map={texture} transparent opacity={0.7} />
      {/* Border */}
      <mesh position={[0, 0, -0.01]}>
        <ringGeometry args={[1.2, 1.3, 32]} />
        <meshBasicMaterial color="white" transparent opacity={0.5} />
      </mesh>
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
          {Object.entries(segmentOwnerColors).map(([segId, colors]) => (
            <OwnershipOverlay 
              key={segId} 
              colors={colors} 
              segmentId={segId} 
              definition={fp.def} 
            />
          ))}
        </group>
      ))}
    </group>
  )
}
