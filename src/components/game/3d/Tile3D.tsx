import { useMemo, Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

const TILE_SIZE = 8.8 // Mapping 88px to 8.8 world units for scale consistency

interface Tile3DProps {
  tile: any
  definition: any
  staticTileMap?: Record<string, any>
  onClick?: (e: any) => void
  isTentative?: boolean
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

export function Tile3D({ tile, definition, staticTileMap, onClick, isTentative = false }: Tile3DProps) {
  // Composite footprint calculation
  const footprints = useMemo(() => {
    const base = [{ dx: 0, dy: 0, def: definition }]
    if (definition.linkedTiles && definition.linkedTiles.length > 0) {
      const extra = definition.linkedTiles.map((lt: any) => {
        const linkedDef = staticTileMap ? staticTileMap[lt.definitionId] : definition
        return { dx: lt.dx, dy: lt.dy, def: linkedDef || definition }
      })
      return [...base, ...extra]
    }
    return base
  }, [definition, staticTileMap])

  const { x, y } = tile.coordinate
  const rx = (tile.rotation || 0) * (Math.PI / 180)

  return (
    <group position={[x * TILE_SIZE, 0, y * TILE_SIZE]} rotation={[0, -rx, 0]}>
      {footprints.map((fp, idx) => (
        <group key={idx} position={[fp.dx * TILE_SIZE, 0, fp.dy * TILE_SIZE]}>
          <mesh 
            position={[0, -0.25, 0]}
            onClick={onClick}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[TILE_SIZE - 0.05, 0.5, TILE_SIZE - 0.05]} />
            <meshStandardMaterial 
              color={isTentative ? "#aaddff" : "#ffffff"} 
              transparent={isTentative}
              opacity={isTentative ? 0.7 : 1}
              roughness={0.8}
            />
          </mesh>
          
          {/* Top surface for texture */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[TILE_SIZE - 0.1, TILE_SIZE - 0.1]} />
            <Suspense fallback={<meshStandardMaterial color="#cccccc" />}>
              <TileTexture imageUrl={fp.def.imageUrl} imageConfig={fp.def.imageConfig} />
            </Suspense>
          </mesh>
        </group>
      ))}
    </group>
  )
}
