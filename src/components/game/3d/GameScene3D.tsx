import { memo, useMemo, useState, Suspense, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CameraController } from './CameraController.tsx'
import { Tile3D } from './Tile3D.tsx'
import { Dragon3D } from './Dragon3D.tsx'
import { Fairy3D } from './Fairy3D.tsx'
import { Meeple3D } from './Meeple3D.tsx'
import { PlacementOverlay3D } from './PlacementOverlay3D.tsx'
import { useUIStore } from '../../../store/uiStore'
import { useGameStore } from '../../../store/gameStore.ts'
import { getRotatedOffset } from '../../../core/engine/TilePlacement.ts'
import { Coordinate } from '../../../core/types/board.ts'
import { CameraPanner } from './CameraPanner.tsx'
import { ThreeEvent } from '@react-three/fiber'
import { GhostMeeples3D } from './animation/GhostMeeples3D.tsx'
import { CurrentTile3D } from './CurrentTile3D.tsx'

interface GameScene3DProps {
  gameState: any
  validSet: Set<string>
  hoveredCoord: any
  tentativeTileCoord: any
  interactionState: string
  currentPlayer: any
  rotateTentativeTile: () => void
  selectTilePlacement: (coord: any) => void
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
  fairyMoveTargets?: { coordinate: Coordinate, segmentId: string }[]
  moveFairy?: (coord: Coordinate, segmentId: string) => void
  dragonPlaceTargets?: Coordinate[]
  placeDragonOnHoard?: (coord: Coordinate) => void
  cycleDragonFacing?: () => void
  tentativeFairyTarget?: { coordinate: Coordinate, segmentId: string } | null
  selectFairyTarget?: (coord: Coordinate, segmentId: string) => void
  cancelFairyTarget?: () => void
  tentativeDragonPlaceTarget?: Coordinate | null
  selectDragonPlaceTarget?: (coord: Coordinate) => void
  tentativeDragonFacing?: any
  magicPortalTargets?: { coordinate: Coordinate, segmentId: string }[]
  territoryMode?: 'off' | 'incomplete' | 'all'
  segmentOwnerMap?: Record<string, Record<string, string[]>>
}

const TILE_SIZE = 8.8

function getSegmentCenter(coordinate: { x: number, y: number }, rotation: number, segmentId: string, definition: any): [number, number, number] {
  const segment = definition.segments.find((s: any) => s.id === segmentId)
  const centroid = segment?.meepleCentroid || segment?.centroid
  if (!centroid) {
    return [coordinate.x * TILE_SIZE, 0.02, coordinate.y * TILE_SIZE]
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

  return [coordinate.x * TILE_SIZE + ox, 0.02, coordinate.y * TILE_SIZE + oy]
}

function getDragonAngle(facing: any): number {
  if (facing === 'NORTH') return 270
  if (facing === 'EAST') return 180
  if (facing === 'SOUTH') return 90
  if (facing === 'WEST') return 0
  return 0
}

/**
 * Projects a 3D world position to 2D screen coordinates and updates the UI store.
 * This allows 2D overlay buttons to follow 3D objects.
 */
function ScreenSpaceProjector({ worldPos, radius }: { worldPos: [number, number, number] | null, radius: number }) {
  const { camera, size } = useThree()
  const lastCam = useRef({ px: NaN, py: NaN, pz: NaN, qx: NaN, qy: NaN, qz: NaN, qw: NaN, w: 0, h: 0, rx: NaN, ry: NaN, rz: NaN, r: NaN })

  useFrame(() => {
    if (!worldPos) {
      if (useUIStore.getState().tileButtonPos !== null) {
        useUIStore.setState({ tileButtonPos: null })
      }
      lastCam.current.rx = NaN
      return
    }

    // Only project when something affecting screen position changed:
    // camera moved/rotated, world anchor changed, or canvas resized.
    const p = camera.position
    const q = camera.quaternion
    const cur = lastCam.current
    if (
      cur.px === p.x && cur.py === p.y && cur.pz === p.z &&
      cur.qx === q.x && cur.qy === q.y && cur.qz === q.z && cur.qw === q.w &&
      cur.rx === worldPos[0] && cur.ry === worldPos[1] && cur.rz === worldPos[2] && cur.r === radius &&
      cur.w === size.width && cur.h === size.height
    ) {
      return
    }
    cur.px = p.x; cur.py = p.y; cur.pz = p.z
    cur.qx = q.x; cur.qy = q.y; cur.qz = q.z; cur.qw = q.w
    cur.rx = worldPos[0]; cur.ry = worldPos[1]; cur.rz = worldPos[2]; cur.r = radius
    cur.w = size.width; cur.h = size.height

    // Get the camera's global forward direction on the XZ plane
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // Offset position towards the user (opposite of forward) by radius + extra margin
    // This ensures buttons are always at the "bottom" relative to the user's current view
    const buttonAnchor = new THREE.Vector3(
      worldPos[0] - forward.x * (radius + 2.0),
      worldPos[1],
      worldPos[2] - forward.z * (radius + 2.0)
    );
    buttonAnchor.project(camera)

    // Convert to pixel coordinates
    const x = (buttonAnchor.x + 1) * size.width / 2
    const y = (-buttonAnchor.y + 1) * size.height / 2

    const current = useUIStore.getState().tileButtonPos
    if (!current || Math.abs(current.x - x) > 0.5 || Math.abs(current.y - y) > 0.5) {
      useUIStore.setState({ tileButtonPos: { x, y } })
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
  fairyMoveTargets = [],
  dragonPlaceTargets = [],
  cycleDragonFacing,
  tentativeFairyTarget,
  selectFairyTarget,
  cancelFairyTarget,
  tentativeDragonPlaceTarget,
  selectDragonPlaceTarget,
  tentativeDragonFacing,
  magicPortalTargets = [],
  segmentOwnerMap = {},
}: GameScene3DProps) => {
  const controlsRef = useRef<any>(null)
  const boardTiles = useMemo(() => Object.entries(gameState.board.tiles), [gameState.board.tiles])
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
  const projectionPos = useMemo<{ pos: [number, number, number], radius: number } | null>(() => {
    if (interactionState === 'TILE_PLACED_TENTATIVELY' && tentativeTileCoord) {
      let maxDy = 0
      const currentDef = gameState.currentTile ? gameState.staticTileMap[gameState.currentTile.definitionId] : null
      if (currentDef && currentDef.linkedTiles) {
        currentDef.linkedTiles.forEach((lt: any) => {
          const { dy } = getRotatedOffset(lt.dx, lt.dy, gameState.currentTile?.rotation || 0)
          if (dy > maxDy) maxDy = dy
        })
      }
      return { 
        pos: [tentativeTileCoord.x * TILE_SIZE, 0, tentativeTileCoord.y * TILE_SIZE], 
        radius: (TILE_SIZE / 2) + (maxDy * TILE_SIZE) 
      }
    }
    if (interactionState === 'MEEPLE_SELECTED_TENTATIVELY' && tentativeMeepleSegment && tentativeTileCoord) {
      const tile = gameState.board.tiles[`${tentativeTileCoord.x},${tentativeTileCoord.y}`]
      const def = gameState.staticTileMap[tile?.definitionId || '']
      if (!def) return { pos: [tentativeTileCoord.x * TILE_SIZE, 0, tentativeTileCoord.y * TILE_SIZE], radius: 0.8 }
      const center = getSegmentCenter(tentativeTileCoord, tile.rotation || 0, tentativeMeepleSegment, def)
      return { pos: center, radius: 0.8 }
    }
    if (isMeeplePhase && lastPlacedCoord) {
      let maxDy = 0
      const tile = gameState.board.tiles[`${lastPlacedCoord.x},${lastPlacedCoord.y}`]
      const def = tile ? gameState.staticTileMap[tile.definitionId] : null
      if (def && def.linkedTiles) {
        def.linkedTiles.forEach((lt: any) => {
          const { dy } = getRotatedOffset(lt.dx, lt.dy, tile.rotation || 0)
          if (dy > maxDy) maxDy = dy
        })
      }
      return { 
        pos: [lastPlacedCoord.x * TILE_SIZE, 0, lastPlacedCoord.y * TILE_SIZE], 
        radius: (TILE_SIZE / 2) + (maxDy * TILE_SIZE) 
      }
    }
    if (gameState.turnPhase === 'FAIRY_MOVE' && tentativeFairyTarget) {
      const tile = gameState.board.tiles[`${tentativeFairyTarget.coordinate.x},${tentativeFairyTarget.coordinate.y}`]
      const def = tile ? gameState.staticTileMap[tile.definitionId] : null
      if (tile && def) {
        const center = getSegmentCenter(tentativeFairyTarget.coordinate, tile.rotation || 0, tentativeFairyTarget.segmentId, def)
        return { pos: center, radius: 0.8 }
      }
    }
    if (gameState.turnPhase === 'DRAGON_PLACE' && tentativeDragonPlaceTarget) {
      return { pos: [tentativeDragonPlaceTarget.x * TILE_SIZE, 0, tentativeDragonPlaceTarget.y * TILE_SIZE], radius: 1.5 }
    }
    if (gameState.turnPhase === 'DRAGON_ORIENT' && dragonPos) {
      return { pos: [dragonPos.x * TILE_SIZE, 0, dragonPos.y * TILE_SIZE], radius: 1.5 }
    }
    return null
  }, [interactionState, tentativeTileCoord, tentativeMeepleSegment, isMeeplePhase, lastPlacedCoord, gameState, tentativeFairyTarget, tentativeDragonPlaceTarget, dragonPos])

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.7,
        outputColorSpace: THREE.SRGBColorSpace,
        antialias: false,
        powerPreference: 'high-performance',
      }}
      camera={{ position: [0, 25, 20], fov: 45 }}
      shadows={{ type: THREE.PCFShadowMap }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[20, 50, 30]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      <CameraController 
        ref={controlsRef} 
        lastInteractionPos={projectionPos?.pos ?? null} 
      />
      <ScreenSpaceProjector worldPos={projectionPos?.pos ?? null} radius={projectionPos?.radius ?? 0} />
      <CameraPanner controlsRef={controlsRef} projectionPos={projectionPos} />

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
          
          const isHoardTarget = gameState.turnPhase === 'DRAGON_PLACE' &&
            dragonPlaceTargets.some(c => c.x === tile.coordinate.x && c.y === tile.coordinate.y)
          const isTentativeHoard = isHoardTarget &&
            tentativeDragonPlaceTarget?.x === tile.coordinate.x &&
            tentativeDragonPlaceTarget?.y === tile.coordinate.y
          const isDragonTile = gameState.turnPhase === 'DRAGON_ORIENT' && dragonPos &&
            dragonPos.x === tile.coordinate.x && dragonPos.y === tile.coordinate.y

          let tileOnClick: ((e: ThreeEvent<MouseEvent>) => void) | undefined
          let tileOnPointerOver: ((e: ThreeEvent<PointerEvent>) => void) | undefined
          let tileOnPointerOut: ((e: ThreeEvent<PointerEvent>) => void) | undefined

          if (isHoardTarget) {
            tileOnClick = (e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation()
              document.body.style.cursor = ''
              if (isTentativeHoard) {
                if (cycleDragonFacing) cycleDragonFacing()
              } else if (selectDragonPlaceTarget) {
                selectDragonPlaceTarget(tile.coordinate)
              }
            }
            tileOnPointerOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }
            tileOnPointerOut = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = '' }
          } else if (isDragonTile) {
            tileOnClick = (e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation()
              document.body.style.cursor = ''
              if (cycleDragonFacing) cycleDragonFacing()
            }
            tileOnPointerOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }
            tileOnPointerOut = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = '' }
          }

          return (
            <group key={key}>
              <Tile3D
                tile={tile}
                definition={def}
                staticTileMap={gameState.staticTileMap}
                segmentOwnerColors={segmentOwnerMap[key]}
                onClick={tileOnClick}
                onPointerOver={tileOnPointerOver}
                onPointerOut={tileOnPointerOut}
              />
              {/* Render items per segment to avoid collisions */}
              {def.segments.map((segment: any) => {
                const segId = segment.id
                const segCenter = getSegmentCenter(tile.coordinate, tile.rotation || 0, segId, def)
                const isFarmer = segment.type === 'FIELD'
                
                const items = []
                
                // 1. Placed Meeples (Primary, Pig, Builder)
                const placedPrimary = tile.meeples[segId]
                if (placedPrimary) {
                  const player = gameState.players.find((p: any) => p.id === placedPrimary.playerId)
                  items.push({ type: 'MEEPLE', meeple: placedPrimary, player, isFarmer })
                }
                
                const placedPig = tile.meeples[`${segId}_PIG`]
                if (placedPig) {
                  const player = gameState.players.find((p: any) => p.id === placedPig.playerId)
                  items.push({ type: 'MEEPLE', meeple: placedPig, player, isFarmer: true })
                }
                
                const placedBuilder = tile.meeples[`${segId}_BUILDER`]
                if (placedBuilder) {
                  const player = gameState.players.find((p: any) => p.id === placedBuilder.playerId)
                  items.push({ type: 'MEEPLE', meeple: placedBuilder, player, isFarmer: false })
                }
                
                // 2. Fairy — rendered at top level so movement between segments can animate
                //    via the central animation manager. The per-segment slot is skipped here.
                
                // 3. Tentative Meeple (PlacementOverlay3D)
                const isTentativeHere = isMeeplePhase && tentativeMeepleSegment === segId && tentativeTileCoord && `${tentativeTileCoord.x},${tentativeTileCoord.y}` === key
                const isPlaceableHere = isMeeplePhase && (
                  placeableSegments.includes(`${key}:${segId}`) ||
                  magicPortalTargets.some(t => t.coordinate.x === tile.coordinate.x && t.coordinate.y === tile.coordinate.y && t.segmentId === segId)
                )
                if (isTentativeHere || isPlaceableHere) items.push({ type: 'TENTATIVE', isTentativeHere, isFarmer })
                
                // 4. Fairy Move Target
                const isFairyTarget = gameState.turnPhase === 'FAIRY_MOVE' && fairyMoveTargets.some(t => t.coordinate.x === tile.coordinate.x && t.coordinate.y === tile.coordinate.y && t.segmentId === segId)
                if (isFairyTarget) items.push({ type: 'FAIRY_TARGET' })

                if (items.length === 0) return null

                // Compute layout
                const seed = (tile.coordinate.x * 12.9898 + tile.coordinate.y * 78.233)
                const hash = Math.abs(Math.sin(seed)) * Math.PI * 2
                const spacing = 3.5

                return (
                  <group key={segId} position={segCenter}>
                    {items.map((item, i) => {
                      const offsetX = (i - (items.length - 1) / 2) * spacing
                      return (
                        <group key={`${item.type}_${i}`} rotation={[0, hash + (i * 0.2), 0]}>
                          <group position={[offsetX, 0, 0]}>
                            {item.type === 'MEEPLE' && (
                              <Meeple3D
                                type={item.meeple.meepleType}
                                color={item.player?.color || '#ffffff'}
                                isFarmer={item.isFarmer}
                                position={[0, 0, 0]}
                                rotation={[0, 0, 0]}
                                onClick={isFairyTarget ? (e: ThreeEvent<MouseEvent>) => {
                                  e.stopPropagation()
                                  document.body.style.cursor = ''
                                  const isTentativeSame =
                                    tentativeFairyTarget?.coordinate.x === tile.coordinate.x &&
                                    tentativeFairyTarget?.coordinate.y === tile.coordinate.y &&
                                    tentativeFairyTarget?.segmentId === segId
                                  if (isTentativeSame) {
                                    if (cancelFairyTarget) cancelFairyTarget()
                                  } else if (selectFairyTarget) {
                                    selectFairyTarget(tile.coordinate, segId)
                                  }
                                } : undefined}
                                onPointerOver={isFairyTarget ? (e: ThreeEvent<PointerEvent>) => {
                                  e.stopPropagation()
                                  document.body.style.cursor = 'pointer'
                                } : undefined}
                                onPointerOut={isFairyTarget ? (e: ThreeEvent<PointerEvent>) => {
                                  e.stopPropagation()
                                  document.body.style.cursor = ''
                                } : undefined}
                              />
                            )}
                            {item.type === 'TENTATIVE' && (
                              <group rotation={[0, -(hash + (i * 0.2)), 0]}>
                                <PlacementOverlay3D 
                                  position={[0, 0, 0]}
                                  type={item.isTentativeHere ? tentativeMeepleType : selectedMeepleType}
                                  secondaryType={item.isTentativeHere ? tentativeSecondaryMeepleType : null}
                                  color={currentPlayer?.color || '#ffffff'}
                                  onConfirm={() => {
                                    if (!item.isTentativeHere) {
                                      selectMeeplePlacement(segId, selectedMeepleType, tile.coordinate)
                                    }
                                  }}
                                  onCancel={onCancelMeeple}
                                  onCancelPrimary={onCancelMeeple}
                                  showButtons={false}
                                  isTentative={item.isTentativeHere}
                                  isFarmer={item.isFarmer}
                                  onCancelSecondary={() => useGameStore.setState({ tentativeSecondaryMeepleType: null })}
                                />
                              </group>
                            )}
                            {item.type === 'FAIRY_TARGET' && (() => {
                              const isTentativeHereFairy =
                                gameState.turnPhase === 'FAIRY_MOVE' &&
                                tentativeFairyTarget?.coordinate.x === tile.coordinate.x &&
                                tentativeFairyTarget?.coordinate.y === tile.coordinate.y &&
                                tentativeFairyTarget?.segmentId === segId
                              const handleFairyClick = (e: ThreeEvent<MouseEvent>) => {
                                e.stopPropagation()
                                document.body.style.cursor = ''
                                if (isTentativeHereFairy) {
                                  if (cancelFairyTarget) cancelFairyTarget()
                                } else if (selectFairyTarget) {
                                  selectFairyTarget(tile.coordinate, segId)
                                }
                              }
                              return (
                                <group rotation={[0, -(hash + (i * 0.2)), 0]}>
                                  <mesh
                                    position={[0, 0.15, 0]}
                                    onPointerOver={() => { document.body.style.cursor = 'pointer' }}
                                    onPointerOut={() => { document.body.style.cursor = '' }}
                                    onClick={handleFairyClick}
                                    renderOrder={2}
                                  >
                                    <cylinderGeometry args={[0.9, 0.9, 0.1, 32]} />
                                    <meshBasicMaterial
                                      color="#f1c40f"
                                      transparent
                                      opacity={0.6}
                                      polygonOffset
                                      polygonOffsetFactor={-4}
                                      polygonOffsetUnits={-4}
                                    />
                                  </mesh>
                                  {/* The tentative fairy preview itself is drawn by the top-level
                                      AnimatedFairyOnBoard so the move visually animates on click. */}
                                </group>
                              )
                            })()}
                          </group>
                        </group>
                      )
                    })}
                  </group>
                )
              })}
            </group>
          )
        })}

        {/* Render Dragon Place Targets — visual indicators only; the underlying tile handles clicks (see Tile3D onClick above) */}
        {gameState.turnPhase === 'DRAGON_PLACE' && dragonPlaceTargets.map((coord, idx) => {
          const isTentative = tentativeDragonPlaceTarget?.x === coord.x && tentativeDragonPlaceTarget?.y === coord.y
          const handleDragonClick = (e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            document.body.style.cursor = ''
            if (cycleDragonFacing) cycleDragonFacing()
          }
          return (
          <group key={`dragon_place_${idx}`} position={[coord.x * TILE_SIZE, 0, coord.y * TILE_SIZE]}>
            {/* Ghost ring indicator — purely informational; tile body handles clicks */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]} raycast={() => null}>
              <ringGeometry args={[3.2, 3.5, 32]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.8}
                polygonOffset
                polygonOffsetFactor={-4}
                polygonOffsetUnits={-4}
              />
            </mesh>
            {/* Tentative Dragon Preview — clickable to cycle facing (user also gets this on the tile body) */}
            {isTentative && (
              <group position={[0, 0.3, 0]}>
                <Dragon3D
                  position={[0, 0, 0]}
                  facing={getDragonAngle(tentativeDragonFacing)}
                  onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
                  onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = '' }}
                  onClick={handleDragonClick}
                />
              </group>
            )}
          </group>
          )
        })}

        {/* Render Dragon Orient Arrow (Visual only) */}
        {gameState.turnPhase === 'DRAGON_ORIENT' && dragonPos && (
          <group position={[dragonPos.x * TILE_SIZE, 0, dragonPos.y * TILE_SIZE]}>
            <group 
              position={[0, 5.5, 0]} 
              rotation={[-Math.PI / 2, 0, 0]} 
            >
              <mesh castShadow raycast={() => null}>
                <torusGeometry args={[1.5, 0.15, 16, 32, Math.PI * 1.6]} />
                <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow raycast={() => null}>
                <coneGeometry args={[0.4, 0.8, 4]} />
                <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} />
              </mesh>
            </group>
          </group>
        )}

        {/* Render Valid Placement Markers — tile-switch is allowed in PLACE_TILE, PLACE_MEEPLE,
            and DRAGON_ORIENT (when a hoard tile was just placed and the dragon hasn't started moving) */}
        {(() => {
          const dfData = gameState.expansionData?.['dragonFairy'] as { dragonMovement?: unknown } | undefined
          const canSwitchDuringOrient =
            gameState.turnPhase === 'DRAGON_ORIENT' && !dfData?.dragonMovement && !!lastPlacedCoord
          const showMarkers =
            gameState.turnPhase === 'PLACE_TILE' ||
            gameState.turnPhase === 'PLACE_MEEPLE' ||
            canSwitchDuringOrient
          if (!showMarkers) return null
          const excludeLastPlaced =
            gameState.turnPhase === 'PLACE_MEEPLE' || canSwitchDuringOrient
          return Array.from(validSet)
          .filter(key => {
            if (excludeLastPlaced && lastPlacedCoord) {
              return key !== `${lastPlacedCoord.x},${lastPlacedCoord.y}`
            }
            if (interactionState === 'TILE_PLACED_TENTATIVELY' && tentativeTileCoord && key === `${tentativeTileCoord.x},${tentativeTileCoord.y}`) {
              return false
            }
            return true
          })
          .map((key) => {
            const [x, y] = key.split(',').map(Number)
            const isHovered = hoveredTileCoord === key || (hoveredCoord?.x === x && hoveredCoord?.y === y)
            const rx = (gameState.currentTile?.rotation || 0) * (Math.PI / 180)
            
            return (
              <group key={key} position={[x * TILE_SIZE, 0, y * TILE_SIZE]}>
                <group rotation={[0, -rx, 0]}>
                  {placementFootprints.map((fp, idx) => (
                    <group key={idx} position={[fp.dx * TILE_SIZE, 0, fp.dy * TILE_SIZE]}>
                      <mesh
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, 0.15, 0]}
                        onPointerOver={(e) => { e.stopPropagation(); setHoveredTileCoord(key); document.body.style.cursor = 'pointer' }}
                        onPointerOut={(e) => { e.stopPropagation(); setHoveredTileCoord(null); document.body.style.cursor = '' }}
                        onClick={(e) => { e.stopPropagation(); document.body.style.cursor = ''; selectTilePlacement({ x, y }) }}
                      >
                        <planeGeometry args={[TILE_SIZE - 0.2, TILE_SIZE - 0.2]} />
                        <meshBasicMaterial
                          color="yellow"
                          transparent
                          opacity={isHovered ? 0.3 : 0.05}
                          polygonOffset
                          polygonOffsetFactor={-4}
                          polygonOffsetUnits={-4}
                        />
                      </mesh>

                      <lineSegments
                        position={[0, 0.16, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        onUpdate={(line: any) => {
                          if (line.geometry?.attributes?.position) {
                            line.computeLineDistances()
                          }
                        }}
                      >
                        <edgesGeometry args={[markerGeom]} />
                        <lineDashedMaterial
                          color="yellow"
                          dashSize={0.4}
                          gapSize={0.2}
                          transparent
                          opacity={isHovered ? 1.0 : 0.5}
                        />
                      </lineSegments>
                    </group>
                  ))}
                </group>
                
                {isHovered && gameState.currentTile && (
                  <Tile3D
                    tile={{
                      coordinate: { x: 0, y: 0 },
                      rotation: gameState.currentTile.rotation,
                    }}
                    definition={gameState.staticTileMap[gameState.currentTile.definitionId]}
                    staticTileMap={gameState.staticTileMap}
                    isTentative
                    renderLinked
                  />
                )}
              </group>
            )
          })
        })()}

        {/* Rotation-indicator arrow rendered at the tentative board coord.
            The tile itself is rendered by CurrentTile3D (below) which owns
            the single animated hand↔board flight. */}
        {tentativeTileCoord && gameState.currentTile &&
          (gameState.turnPhase === 'PLACE_TILE' || interactionState === 'TILE_PLACED_TENTATIVELY') && (
          <group position={[tentativeTileCoord.x * TILE_SIZE, 0, tentativeTileCoord.y * TILE_SIZE]}>
            <group
              position={[0, 1.2, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <mesh castShadow raycast={() => null}>
                <torusGeometry args={[1.5, 0.15, 16, 32, Math.PI * 1.6]} />
                <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow raycast={() => null}>
                <coneGeometry args={[0.4, 0.8, 4]} />
                <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
              </mesh>
            </group>
          </group>
        )}

        {/* Animated current tile — lives at a hand anchor until the user picks
            a coord, then flies to the tentative board coord. Single persistent
            node so the transition is continuous (no pop-out/in). */}
        {gameState.currentTile &&
          (gameState.turnPhase === 'PLACE_TILE' || interactionState === 'TILE_PLACED_TENTATIVELY') && (
          <CurrentTile3D
            currentTile={gameState.currentTile}
            staticTileMap={gameState.staticTileMap}
            tentativeTileCoord={tentativeTileCoord}
            onClick={() => rotateTentativeTile()}
            onPointerOver={() => { document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = '' }}
          />
        )}
      </Suspense>

      {/* Dragon */}
      {dragonPos && (
        <Dragon3D
          animationId="dragon"
          position={[dragonPos.x * TILE_SIZE, 0.02, dragonPos.y * TILE_SIZE]}
          facing={getDragonAngle(dragonFacing)}
          onClick={(e) => {
            if (gameState.turnPhase === 'DRAGON_ORIENT' && cycleDragonFacing) {
              e.stopPropagation()
              cycleDragonFacing()
            }
          }}
          onPointerOver={() => {
            if (gameState.turnPhase === 'DRAGON_ORIENT') {
              document.body.style.cursor = 'pointer'
            }
          }}
          onPointerOut={() => {
            if (gameState.turnPhase === 'DRAGON_ORIENT') {
              document.body.style.cursor = ''
            }
          }}
        />
      )}

      {/* Background Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow raycast={() => null}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#111111" roughness={1} />
      </mesh>

      {/* Top-level animated fairy — single persistent node so movement between
          segments plays as a continuous flight via the animation manager.
          While a tentative target is selected during FAIRY_MOVE, the fairy
          previews the move by animating to the target; cancelling returns it. */}
      <AnimatedFairyOnBoard
        fairyPos={tentativeFairyTarget ?? fairyPos}
        gameState={gameState}
      />

      {/* Ghost meeples in flight (e.g. eaten by dragon). */}
      <GhostMeeples3D />
    </Canvas>
  )
})

function AnimatedFairyOnBoard({ fairyPos, gameState }: { fairyPos: any, gameState: any }) {
  if (!fairyPos) return null
  const tile = gameState.board.tiles[`${fairyPos.coordinate.x},${fairyPos.coordinate.y}`]
  if (!tile) return null
  const def = gameState.staticTileMap[tile.definitionId]
  if (!def) return null
  const [wx, , wz] = getSegmentCenter(fairyPos.coordinate, tile.rotation || 0, fairyPos.segmentId, def)

  // If the segment hosts a meeple, shift the fairy sideways so it doesn't
  // overlap. Direction uses the same tile-seeded hash that meeples use for
  // their own rotation, so the two sit on a consistent axis.
  const segId = fairyPos.segmentId
  const hasMeeple = !!(tile.meeples[segId] || tile.meeples[`${segId}_PIG`] || tile.meeples[`${segId}_BUILDER`])
  let ox = 0, oz = 0
  if (hasMeeple) {
    const seed = fairyPos.coordinate.x * 12.9898 + fairyPos.coordinate.y * 78.233
    const hash = Math.abs(Math.sin(seed)) * Math.PI * 2
    const spacing = 1.75
    ox = Math.cos(hash) * spacing
    oz = Math.sin(hash) * spacing
  }

  return <Fairy3D animationId="fairy" position={[wx + ox, 0.1, wz + oz]} />
}
