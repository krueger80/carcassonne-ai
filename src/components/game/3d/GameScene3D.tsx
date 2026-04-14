import { memo, useMemo, useState, Suspense } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CameraController } from './CameraController.tsx'
import { Tile3D } from './Tile3D.tsx'
import { MeepleGroup3D } from './MeepleGroup3D.tsx'
import { Dragon3D } from './Dragon3D.tsx'
import { Fairy3D } from './Fairy3D.tsx'
import { PlacementOverlay3D } from './PlacementOverlay3D.tsx'
import { useUIStore } from '../../../store/uiStore'
import { useGameStore } from '../../../store/gameStore.ts'

interface GameScene3DProps {
  gameState: any
  validSet: Set<string>
  hoveredCoord: any
  tentativeTileCoord: any
  interactionState: string
  currentPlayer: any
  rotateTentativeTile: () => void
  selectTilePlacement: (coord: any) => void
  onConfirmMeeple: () => void
  onCancelMeeple: () => void
  dragonPos: any
  dragonFacing: number
  fairyPos: any
  placeableSegments?: string[]
  selectedMeepleType?: any
  tentativeMeepleSegment?: string | null
  tentativeMeepleType?: any
  tentativeSecondaryMeepleType?: any
  selectMeeplePlacement: (segmentId: string, type: any, coord?: any, secondaryMeepleType?: any) => void
}

const TILE_SIZE = 8.8

function getSegmentCenter(coordinate: { x: number, y: number }, rotation: number, segmentId: string, definition: any): [number, number, number] {
  const segment = definition.segments.find((s: any) => s.id === segmentId)
  const centroid = segment?.meepleCentroid || segment?.centroid
  if (!centroid) {
    return [coordinate.x * TILE_SIZE, 0.5, coordinate.y * TILE_SIZE]
  }

  // Centroid is 0-100, rotate it
  let { x, y } = centroid
  const r = (rotation % 360 + 360) % 360
  
  let rx = x, ry = y
  if (r === 90) { rx = 100 - y; ry = x }
  else if (r === 180) { rx = 100 - x; ry = 100 - y }
  else if (r === 270) { rx = y; ry = 100 - x }

  // Convert to world units relative to tile center
  const ox = (rx - 50) / 100 * TILE_SIZE
  const oy = (ry - 50) / 100 * TILE_SIZE

  return [coordinate.x * TILE_SIZE + ox, 0.5, coordinate.y * TILE_SIZE + oy]
}

/**
 * Projects a 3D world position to 2D screen coordinates and updates the UI store.
 * This allows 2D overlay buttons to follow 3D objects.
 */
function ScreenSpaceProjector({ worldPos }: { worldPos: [number, number, number] | null }) {
  const { camera, size } = useThree()
  
  useFrame(() => {
    if (!worldPos) {
      if (useUIStore.getState().tileButtonPos) {
        useUIStore.setState({ tileButtonPos: null })
      }
      return
    }

    const v = new THREE.Vector3(...worldPos)
    // Project to NDC space (-1 to +1)
    v.project(camera)
    
    // Convert to pixel coordinates
    const x = (v.x + 1) * size.width / 2
    const y = (-v.y + 1) * size.height / 2
    
    // Add a bit of vertical offset to sit below the object
    const finalY = y + 40 

    const current = useUIStore.getState().tileButtonPos
    if (!current || Math.abs(current.x - x) > 0.5 || Math.abs(current.y - finalY) > 0.5) {
      useUIStore.setState({ tileButtonPos: { x, y: finalY } })
    }
  })

  return null
}

// Shared geometry for placement markers to avoid recreation overhead
const markerGeom = new THREE.PlaneGeometry(TILE_SIZE - 0.2, TILE_SIZE - 0.2)

export const GameScene3D = memo(({ 
  gameState, 
  validSet,
  hoveredCoord,
  tentativeTileCoord, 
  interactionState,
  currentPlayer,
  rotateTentativeTile,
  selectTilePlacement,
  onCancelMeeple,
  dragonPos,
  dragonFacing,
  fairyPos,
  placeableSegments = [],
  selectedMeepleType,
  tentativeMeepleSegment,
  tentativeMeepleType,
  tentativeSecondaryMeepleType,
  selectMeeplePlacement,
}: GameScene3DProps) => {
  const boardTiles = Object.entries(gameState.board.tiles)
  const [hoveredTileCoord, setHoveredTileCoord] = useState<string | null>(null)

  const isMeeplePhase = gameState.turnPhase === 'PLACE_MEEPLE'
  const lastPlacedCoord = gameState.lastPlacedCoord

  // Pre-calculate current tile footprints for placement markers
  const placementFootprints = useMemo(() => {
    if (!gameState.currentTile) return [{ dx: 0, dy: 0 }]
    const def = gameState.staticTileMap[gameState.currentTile.definitionId]
    if (!def) return [{ dx: 0, dy: 0 }]
    const base = [{ dx: 0, dy: 0 }]
    if (def.linkedTiles && def.linkedTiles.length > 0) {
      base.push(...def.linkedTiles.map((lt: any) => ({ dx: lt.dx, dy: lt.dy })))
    }
    return base
  }, [gameState.currentTile, gameState.staticTileMap])

  // Determine which point to project for the floating buttons
  const projectionPos = useMemo<[number, number, number] | null>(() => {
    if (interactionState === 'TILE_PLACED_TENTATIVELY' && tentativeTileCoord) {
      return [tentativeTileCoord.x * TILE_SIZE, 0, tentativeTileCoord.y * TILE_SIZE]
    }
    if (isMeeplePhase && lastPlacedCoord) {
      if (tentativeMeepleSegment) {
        const def = gameState.staticTileMap[gameState.board.tiles[`${lastPlacedCoord.x},${lastPlacedCoord.y}`]?.definitionId]
        if (def) return getSegmentCenter(lastPlacedCoord, gameState.board.tiles[`${lastPlacedCoord.x},${lastPlacedCoord.y}`]?.rotation || 0, tentativeMeepleSegment, def)
      }
      return [lastPlacedCoord.x * TILE_SIZE, 0, lastPlacedCoord.y * TILE_SIZE]
    }
    return null
  }, [interactionState, tentativeTileCoord, isMeeplePhase, lastPlacedCoord, tentativeMeepleSegment, gameState])

  return (
    <Canvas
      gl={{ 
        toneMapping: THREE.ACESFilmicToneMapping, 
        toneMappingExposure: 0.7,
        outputColorSpace: THREE.SRGBColorSpace 
      }}
      camera={{ position: [0, 25, 20], fov: 45 }}
      shadows
    >
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[20, 50, 30]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      
      <CameraController />
      <ScreenSpaceProjector worldPos={projectionPos} />

      <Suspense fallback={null}>
        {/* Render Placed Tiles */}
        {boardTiles.map(([key, tile]: [string, any]) => {
          const def = gameState.staticTileMap[tile.definitionId]
          if (!def) return null
          
          // Hide the tile that is being "re-placed" tentatively
          if (interactionState === 'TILE_PLACED_TENTATIVELY' && 
              lastPlacedCoord && 
              `${lastPlacedCoord.x},${lastPlacedCoord.y}` === key) {
            return null
          }
          
          return (
            <group key={key}>
              <Tile3D 
                tile={tile} 
                definition={def}
                staticTileMap={gameState.staticTileMap}
              />
              {/* Render Meeples on this tile */}
              {Object.entries(tile.meeples).map(([segId, meeple]: [string, any]) => {
                const player = gameState.players.find((p: any) => p.id === meeple.playerId)
                const segCenter = getSegmentCenter(tile.coordinate, tile.rotation || 0, segId, def)
                
                return (
                  <MeepleGroup3D 
                    key={segId}
                    coordinate={tile.coordinate}
                    meeples={[{
                      id: `${key}_${segId}`,
                      type: meeple.meepleType,
                      color: player?.color || '#ffffff',
                      isFarmer: meeple.meepleType === 'FARMER'
                    }]}
                    segmentCenter={segCenter}
                  />
                )
              })}

              {/* Render Meeple Placement Options if this is the last placed tile */}
              {isMeeplePhase && lastPlacedCoord && `${lastPlacedCoord.x},${lastPlacedCoord.y}` === key && (
                <group>
                  {placeableSegments.map((segId) => {
                    const segCenter = getSegmentCenter(tile.coordinate, tile.rotation || 0, segId, def)
                    const isTentativeHere = tentativeMeepleSegment === segId
                    
                    return (
                      <PlacementOverlay3D 
                        key={segId}
                        position={segCenter}
                        type={isTentativeHere ? tentativeMeepleType : selectedMeepleType}
                        secondaryType={isTentativeHere ? tentativeSecondaryMeepleType : null}
                        color={currentPlayer?.color || '#ffffff'}
                        onConfirm={() => {
                          if (!isTentativeHere) {
                            selectMeeplePlacement(segId, selectedMeepleType, tile.coordinate)
                          }
                        }}

                        onCancel={onCancelMeeple}
                        showButtons={false}
                        isTentative={isTentativeHere}
                        onCancelSecondary={() => useGameStore.setState({ tentativeSecondaryMeepleType: null })}
                      />
                    )
                  })}
                </group>
              )}
            </group>
          )
        })}

        {/* Render Valid Placement Markers */}
        {Array.from(validSet)
          .filter(key => {
            if (gameState.turnPhase === 'PLACE_MEEPLE' && lastPlacedCoord) {
              return key !== `${lastPlacedCoord.x},${lastPlacedCoord.y}`
            }
            return true
          })
          .map((key) => {
            const [x, y] = key.split(',').map(Number)
          const isHovered = hoveredTileCoord === key || (hoveredCoord?.x === x && hoveredCoord?.y === y)
          const rx = (gameState.currentTile?.rotation || 0) * (Math.PI / 180)
          
          return (
            <group key={key} position={[x * TILE_SIZE, 0, y * TILE_SIZE]}>
              {/* The outline matches the tile's rotation and shape */}
              <group rotation={[0, -rx, 0]}>
                {placementFootprints.map((fp, idx) => (
                  <group key={idx} position={[fp.dx * TILE_SIZE, 0, fp.dy * TILE_SIZE]}>
                    <mesh 
                      rotation={[-Math.PI / 2, 0, 0]}
                      position={[0, 0.05, 0]}
                      onPointerOver={(e) => { e.stopPropagation(); setHoveredTileCoord(key) }}
                      onPointerOut={(e) => { e.stopPropagation(); setHoveredTileCoord(null) }}
                      onClick={(e) => { e.stopPropagation(); selectTilePlacement({ x, y }) }}
                    >
                      <planeGeometry args={[TILE_SIZE - 0.2, TILE_SIZE - 0.2]} />
                      <meshBasicMaterial color="yellow" transparent opacity={isHovered ? 0.3 : 0.05} />
                    </mesh>
                    
                    {/* Dashed Border */}
                    <lineSegments 
                      position={[0, 0.06, 0]} 
                      rotation={[-Math.PI / 2, 0, 0]}
                      onUpdate={(line: any) => {
                        if (line.geometry?.attributes?.position) {
                          line.computeLineDistances()
                        }
                      }}
                    >
                      <edgesGeometry args={[markerGeom]} />
                      <lineDashedMaterial color="yellow" dashSize={0.4} gapSize={0.2} transparent opacity={isHovered ? 1.0 : 0.5} />
                    </lineSegments>
                  </group>
                ))}
              </group>
              
              {/* Tile Ghost when hovered */}
              {isHovered && gameState.currentTile && (
                <Tile3D 
                  tile={{
                    coordinate: { x: 0, y: 0 },
                    rotation: gameState.currentTile.rotation,
                  }}
                  definition={gameState.staticTileMap[gameState.currentTile.definitionId]}
                  staticTileMap={gameState.staticTileMap}
                  isTentative
                />
              )}
            </group>
          )
        })}

        {/* Render Tentative Tile (already selected but not confirmed) */}
        {tentativeTileCoord && gameState.currentTile && 
          (gameState.turnPhase === 'PLACE_TILE' || interactionState === 'TILE_PLACED_TENTATIVELY') && (
          <group position={[tentativeTileCoord.x * TILE_SIZE, 0, tentativeTileCoord.y * TILE_SIZE]}>
            <Tile3D 
              tile={{
                coordinate: { x: 0, y: 0 },
                rotation: gameState.currentTile.rotation,
              }}
              definition={gameState.staticTileMap[gameState.currentTile.definitionId]}
              staticTileMap={gameState.staticTileMap}
              isTentative={false}
              onClick={() => rotateTentativeTile()}
            />
            {/* 3D Rotate Icon */}
            <group 
              position={[0, 1.2, 0]} 
              rotation={[-Math.PI / 2, 0, 0]} 
              onClick={(e) => { e.stopPropagation(); rotateTentativeTile(); }}
            >
              {/* Circular Arrow Body */}
              <mesh castShadow>
                <torusGeometry args={[1.5, 0.15, 16, 32, Math.PI * 1.6]} />
                <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
              </mesh>
              {/* Arrow Head */}
              <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
                <coneGeometry args={[0.4, 0.8, 4]} />
                <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
              </mesh>
              {/* Larger Invisible Click Target */}
              <mesh visible={false}>
                <circleGeometry args={[2.5]} />
              </mesh>
            </group>
          </group>
        )}
      </Suspense>

      {/* Dragon & Fairy */}
      {dragonPos && (
        <Dragon3D 
          position={[dragonPos.x * TILE_SIZE, 0.5, dragonPos.y * TILE_SIZE]} 
          facing={dragonFacing} 
        />
      )}
      {fairyPos && (
        <Fairy3D 
          position={[fairyPos.x * TILE_SIZE, 0.5, fairyPos.y * TILE_SIZE]} 
        />
      )}

      {/* Background Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow raycast={() => null}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#111111" roughness={1} />
      </mesh>
    </Canvas>
  )
})
