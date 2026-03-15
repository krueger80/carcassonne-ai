import { useRef, useState, useCallback, useEffect, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { TileCell } from './TileCell.tsx'
import { PlaceholderCell } from './PlaceholderCell.tsx'
import { DragonPiece } from './DragonPiece.tsx'
import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore, type TerritoryOverlayMode } from '../../store/uiStore.ts'
import { GameOverlay } from './GameOverlay.tsx'
import { getBuilderPigPlaceableSegments } from '../../core/engine/MeeplePlacement.ts'
import { getAllFeatures } from '../../core/engine/FeatureDetector.ts'
import type { Feature, UnionFindState } from '../../core/types/feature.ts'
import type { Player } from '../../core/types/player.ts'

function getControllingColor(feature: Feature, players: Player[]): string | null {
  if (feature.meeples.length > 0) {
    const strength: Record<string, number> = {}
    for (const m of feature.meeples) {
      strength[m.playerId] = (strength[m.playerId] ?? 0) + (m.meepleType === 'BIG' ? 2 : 1)
    }
    const maxStr = Math.max(...Object.values(strength))
    const topPlayers = Object.keys(strength).filter(id => strength[id] === maxStr)
    const player = players.find(p => p.id === topPlayers[0])
    return player?.color ?? null
  }
  // Fallback: completed features with meeples already returned
  if (feature.lastOwnerIds?.length) {
    const player = players.find(p => p.id === feature.lastOwnerIds![0])
    return player?.color ?? null
  }
  return null
}

function computeSegmentOwnerMap(
  uf: UnionFindState,
  players: Player[],
  mode: TerritoryOverlayMode,
): Record<string, Record<string, string>> {
  if (mode === 'off') return {}
  const result: Record<string, Record<string, string>> = {}
  const features = getAllFeatures(uf)
  for (const feature of features) {
    if (mode === 'incomplete' && feature.isComplete) continue
    const color = getControllingColor(feature, players)
    if (!color) continue
    for (const node of feature.nodes) {
      const coordKey = `${node.coordinate.x},${node.coordinate.y}`
      if (!result[coordKey]) result[coordKey] = {}
      result[coordKey][node.segmentId] = color
    }
  }
  return result
}

const CELL_SIZE = 88   // px per tile
const BOARD_PADDING = 3  // extra cells around the board edge for expansion room

interface BoardGridProps {
  minX: number
  maxX: number
  minY: number
  maxY: number
  gameState: any
  validSet: Set<string>
  hoveredCoord: any
  tentativeTileCoord: any
  tentativeMeepleSegment: string | null
  tentativeMeepleType: any
  tentativeSecondaryMeepleType: any
  interactionState: string
  placeableSegments: string[]
  builderSegmentsMap: Record<string, string[]>
  pigSegmentsMap: Record<string, string[]>
  portalTargetsMap: Record<string, string[]>
  fairyTargetMap: Record<string, string[]>
  fairySegmentMap: Record<string, string> // New prop: coordKey -> segmentId
  dragonPlaceTargetSet: Set<string>
  dragonPos: any
  isDragonOrientPhase: boolean
  isDragonPlacePhase: boolean
  isFairyPhase: boolean
  hasPortalTargets: boolean
  rotateTentativeTile: () => void
  selectTilePlacement: (coord: any) => void
  selectMeeplePlacement: (segmentId: string, type: any, coord?: any, secondaryMeepleType?: 'BUILDER' | 'PIG' | null) => void
  cycleDragonFacing: () => void
  placeDragonOnHoard: (coord: any) => void
  moveFairy: (coord: any, segId: string) => void
  setHoveredCoord: (coord: any) => void
  selectedMeepleType: any
  currentPlayer: any
  undoTilePlacement: () => void
  segmentOwnerMap: Record<string, Record<string, string>>
}

const BoardGrid = memo(({
  minX, maxX, minY, maxY,
  gameState, validSet, hoveredCoord,
  tentativeTileCoord, tentativeMeepleSegment, tentativeMeepleType, tentativeSecondaryMeepleType,
  interactionState,
  placeableSegments, builderSegmentsMap, pigSegmentsMap,
  portalTargetsMap, fairyTargetMap, fairySegmentMap,
  dragonPlaceTargetSet,
  dragonPos,
  isDragonOrientPhase, isDragonPlacePhase, isFairyPhase,
  hasPortalTargets,
  rotateTentativeTile, selectTilePlacement, selectMeeplePlacement,
  cycleDragonFacing, placeDragonOnHoard, moveFairy,
  setHoveredCoord, selectedMeepleType, currentPlayer, undoTilePlacement,
  segmentOwnerMap,
}: BoardGridProps) => {
  const { t } = useTranslation()
  const { board } = gameState
  const lastKey = gameState.lastPlacedCoord
    ? `${gameState.lastPlacedCoord.x},${gameState.lastPlacedCoord.y}`
    : ''

  // Build a map of each player's last-placed tile coordinate → player color
  const lastPlacedPlayerColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    const byPlayer = gameState.lastPlacedCoordByPlayer as Record<string, { x: number; y: number }> | undefined
    if (!byPlayer) return map
    for (const player of gameState.players) {
      const coord = byPlayer[player.id]
      if (coord) {
        map[`${coord.x},${coord.y}`] = player.color
      }
    }
    return map
  }, [gameState.lastPlacedCoordByPlayer, gameState.players])
  const tentKey = tentativeTileCoord
    ? `${tentativeTileCoord.x},${tentativeTileCoord.y}`
    : ''
  const inMeeplePhaseBrowsing =
    (interactionState === 'IDLE' || interactionState === 'MEEPLE_SELECTED_TENTATIVELY') &&
    gameState.turnPhase === 'PLACE_MEEPLE'

  return (
    <>
      {Array.from({ length: maxY - minY + 1 }, (_, rowIdx) => {
        const y = minY + rowIdx
        return (
          <div key={y} style={{ display: 'flex', height: CELL_SIZE }}>
            {Array.from({ length: maxX - minX + 1 }, (_, colIdx) => {
              const x = minX + colIdx
              const key = `${x},${y}`
              const placedTile = board.tiles[key]
              const isValid = validSet.has(key)
              const isHovered = hoveredCoord?.x === x && hoveredCoord?.y === y
              const tentative = tentativeTileCoord && `${tentativeTileCoord.x},${tentativeTileCoord.y}` === key

              if (tentative && gameState.currentTile && gameState.turnPhase === 'PLACE_TILE') {
                return (
                  <div
                    key={key}
                    style={{ width: CELL_SIZE, height: CELL_SIZE, overflow: 'visible' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setHoveredCoord(null) // Clear ghost on rotate
                      rotateTentativeTile()
                    }}
                  >
                    <TileCell
                      definition={gameState.staticTileMap[gameState.currentTile.definitionId]}
                      tile={{
                        coordinate: { x, y },
                        definitionId: gameState.currentTile.definitionId,
                        rotation: gameState.currentTile.rotation,
                        meeples: {}
                      }}
                      size={CELL_SIZE}
                      players={gameState.players}
                      placeableSegments={[]}
                      isTentative={true}
                    />
                  </div>
                )
              }

              if (placedTile) {
                const segmentsHere: string[] = (() => {
                  if (isFairyPhase) return fairyTargetMap[key] ?? []
                  if (!inMeeplePhaseBrowsing) return []
                  const fromLast = key === lastKey ? placeableSegments : []
                  // C2 (classic): always show builder/pig circles (auto-switch on click)
                  // C3.1 (modern): only show when that meeple type is selected
                  const tbData = gameState.expansionData?.['tradersBuilders'] as any
                  const isModernRules = tbData?.useModernRules ?? false
                  const builderOpts = (!isModernRules || selectedMeepleType === 'BUILDER')
                    ? (builderSegmentsMap[key] ?? []) : []
                  const pigOpts = (!isModernRules || selectedMeepleType === 'PIG')
                    ? (pigSegmentsMap[key] ?? []) : []
                  const portalOpts = portalTargetsMap[key] ?? []
                  return [...new Set([...fromLast, ...builderOpts, ...pigOpts, ...portalOpts])]
                })()

                const tentativeSegHere = (() => {
                  if (!tentativeMeepleSegment) return undefined
                  const isBuilderOrPig = tentativeMeepleType === 'BUILDER' || tentativeMeepleType === 'PIG'
                  const isPortalPlacement = hasPortalTargets && tentKey && tentKey !== lastKey
                  const activeKey = (isBuilderOrPig || isPortalPlacement) ? tentKey : lastKey
                  return key === activeKey ? tentativeMeepleSegment : undefined
                })()

                const hasDragon = dragonPos && dragonPos.x === x && dragonPos.y === y
                const isFairyTarget = isFairyPhase && (fairyTargetMap[key]?.length ?? 0) > 0
                const isPortalTarget = inMeeplePhaseBrowsing && portalTargetsMap[key]
                const isDragonPlaceTarget = isDragonPlacePhase && dragonPlaceTargetSet.has(key)
                const isDragonOrientHere = isDragonOrientPhase && hasDragon
                const lastPlacedColor = lastPlacedPlayerColorMap[key]

                return (
                  <div
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isDragonOrientHere) {
                        cycleDragonFacing()
                      } else if (isDragonPlaceTarget) {
                        placeDragonOnHoard({ x, y })
                      }
                    }}
                    style={{
                      position: 'relative',
                      cursor: (isDragonOrientHere || isDragonPlaceTarget || isFairyTarget) ? 'pointer' : undefined,
                      boxShadow: isDragonOrientHere
                        ? 'inset 0 0 0 3px #e74c3c, 0 0 16px rgba(231,76,60,0.6)'
                        : isDragonPlaceTarget
                          ? 'inset 0 0 0 3px #e74c3c, 0 0 12px rgba(231,76,60,0.4)'
                          : isFairyTarget
                            ? 'inset 0 0 0 3px #f1c40f, 0 0 12px rgba(241,196,15,0.5)'
                            : isPortalTarget
                              ? 'inset 0 0 0 2px #9955cc, 0 0 10px rgba(153,85,204,0.4)'
                              : undefined,
                      borderRadius: (isDragonOrientHere || isDragonPlaceTarget || isFairyTarget || isPortalTarget || lastPlacedColor) ? 2 : undefined,
                      overflow: 'visible', // Allow meeples to overlap neighbors
                    }}
                  >
                    <TileCell
                      definition={gameState.staticTileMap[placedTile.definitionId]}
                      tile={placedTile}
                      size={CELL_SIZE}
                      players={gameState.players}
                      placeableSegments={segmentsHere}
                      onSegmentClick={(segId) => {
                        if (gameState.turnPhase === 'PLACE_MEEPLE') {
                          const bMap = builderSegmentsMap[key]
                          const pMap = pigSegmentsMap[key]
                          const portalMap = portalTargetsMap[key]
                          const canBuild = bMap?.includes(segId)
                          const canPig = pMap?.includes(segId)
                          const canPortal = portalMap?.includes(segId)
                          const canNormal = key === lastKey && placeableSegments.includes(segId)

                          let typeToPlace = selectedMeepleType
                          let simultaneousSecondary: 'BUILDER' | 'PIG' | null = null
                          const tbDataClick = gameState.expansionData?.['tradersBuilders'] as any
                          const isModernRules = tbDataClick?.useModernRules ?? false
                          const clickedSegmentType = gameState.staticTileMap[placedTile.definitionId]?.segments.find((s: any) => s.id === segId)?.type

                          // Use the exact current state from the store to avoid stale closures
                          const currentTentativeSecondary = useGameStore.getState().tentativeSecondaryMeepleType

                          // Validate & resolve the secondary meeple type against the segment (modern rules only)
                          const resolveSecondary = (secondary: 'BUILDER' | 'PIG' | null): 'BUILDER' | 'PIG' | null => {
                            if (!secondary || !isModernRules) return null
                            const ok = (secondary === 'BUILDER' && (clickedSegmentType === 'CITY' || clickedSegmentType === 'ROAD'))
                              || (secondary === 'PIG' && clickedSegmentType === 'FIELD')
                            if (ok) return secondary
                            // Incompatible — drop secondary and notify
                            useGameStore.setState({ tentativeSecondaryMeepleType: null })
                            useUIStore.getState().showToast(t(secondary === 'BUILDER' ? 'meeple.builderNeedsRoadOrCity' : 'meeple.pigNeedsField'))
                            return null
                          }

                          if (canBuild) {
                            if (isModernRules && (selectedMeepleType === 'NORMAL' || selectedMeepleType === 'BIG' || currentTentativeSecondary === 'BUILDER')) {
                              const isBig = selectedMeepleType === 'BIG' || tentativeMeepleType === 'BIG'
                              typeToPlace = isBig ? 'BIG' : 'NORMAL'
                              simultaneousSecondary = 'BUILDER'
                              if (selectedMeepleType === 'BUILDER') {
                                useUIStore.setState({ selectedMeepleType: typeToPlace })
                              }
                            } else {
                              typeToPlace = 'BUILDER'
                              if (selectedMeepleType !== 'BUILDER') useUIStore.setState({ selectedMeepleType: 'BUILDER' })
                            }
                          } else if (canPig) {
                            if (isModernRules && (selectedMeepleType === 'NORMAL' || selectedMeepleType === 'BIG' || currentTentativeSecondary === 'PIG')) {
                              const isBig = selectedMeepleType === 'BIG' || tentativeMeepleType === 'BIG'
                              typeToPlace = isBig ? 'BIG' : 'NORMAL'
                              simultaneousSecondary = 'PIG'
                              if (selectedMeepleType === 'PIG') {
                                useUIStore.setState({ selectedMeepleType: typeToPlace })
                              }
                            } else {
                              typeToPlace = 'PIG'
                              if (selectedMeepleType !== 'PIG') useUIStore.setState({ selectedMeepleType: 'PIG' })
                            }
                          } else if (canNormal) {
                            if (isModernRules && (selectedMeepleType === 'BUILDER' || selectedMeepleType === 'PIG' || currentTentativeSecondary === 'BUILDER' || currentTentativeSecondary === 'PIG')) {
                              // user wants to place builder/pig alongside a normal/big meeple (simultaneously)
                              const wantedSecondary = (currentTentativeSecondary || selectedMeepleType) as 'BUILDER' | 'PIG'
                              const isBig = selectedMeepleType === 'BIG' || tentativeMeepleType === 'BIG'
                              typeToPlace = isBig ? 'BIG' : 'NORMAL'
                              // resolveSecondary validates compatibility & shows toast if incompatible
                              const validated = resolveSecondary(wantedSecondary)
                              if (validated) simultaneousSecondary = validated
                              if (selectedMeepleType === 'BUILDER' || selectedMeepleType === 'PIG') {
                                useUIStore.setState({ selectedMeepleType: typeToPlace })
                              }
                            } else {
                              if (clickedSegmentType === 'GARDEN') {
                                // Gardens MUST use the Abbot
                                typeToPlace = 'ABBOT'
                                if (selectedMeepleType !== 'ABBOT') useUIStore.setState({ selectedMeepleType: 'ABBOT' })
                              } else if (selectedMeepleType === 'ABBOT' && clickedSegmentType !== 'CLOISTER') {
                                // Abbot can only be placed on Cloisters or Gardens. Fallback to a valid meeple.
                                const fallbackType = (currentPlayer?.meeples.available['NORMAL'] ?? 0) > 0 ? 'NORMAL' : 'BIG'
                                typeToPlace = fallbackType
                                useUIStore.setState({ selectedMeepleType: fallbackType })
                              } else if (selectedMeepleType === 'BUILDER' || selectedMeepleType === 'PIG') {
                                // Override BUILDER/PIG to NORMAL since they can't be placed as standalone on normal segments
                                const fallbackType = (currentPlayer?.meeples.available['NORMAL'] ?? 0) > 0 ? 'NORMAL' : 'BIG'
                                typeToPlace = fallbackType
                                useUIStore.setState({ selectedMeepleType: fallbackType })
                              } else {
                                typeToPlace = selectedMeepleType
                              }
                            }
                          } else if (canPortal) {
                            const isBig = selectedMeepleType === 'BIG'
                            typeToPlace = isBig ? 'BIG' : 'NORMAL'
                          }

                          const secondary = simultaneousSecondary
                            ? resolveSecondary(simultaneousSecondary)
                            : (isModernRules && currentTentativeSecondary && (typeToPlace === 'NORMAL' || typeToPlace === 'BIG'))
                              ? resolveSecondary(currentTentativeSecondary)
                              : null
                          selectMeeplePlacement(segId, typeToPlace, { x, y }, secondary)
                        } else if (gameState.turnPhase === 'FAIRY_MOVE') {
                          moveFairy({ x, y }, segId)
                        }
                      }}
                      tentativeMeepleSegment={tentativeSegHere}
                      tentativeMeepleType={tentativeSegHere ? tentativeMeepleType : undefined}
                      tentativeSecondaryMeepleType={tentativeSegHere ? tentativeSecondaryMeepleType : undefined}
                      currentPlayerColor={currentPlayer?.color}
                      fairySegmentId={fairySegmentMap[key]}
                      isFairyMovePhase={isFairyPhase}
                      segmentOwnerColors={segmentOwnerMap[key]}
                    />
                    {isDragonPlaceTarget && !hasDragon && (
                      <div style={{ position: 'absolute', inset: 0, zIndex: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(231, 76, 60, 0.08)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24">
                          <text x="12" y="17" textAnchor="middle" fontSize="14" fill="#e74c3c" opacity="0.6" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>♦</text>
                        </svg>
                      </div>
                    )}
                    {lastPlacedColor && (
                      <div style={{
                        position: 'absolute', inset: 0, zIndex: 10,
                        border: `3px solid ${lastPlacedColor}`,
                        borderRadius: 3,
                        boxShadow: `0 0 6px ${lastPlacedColor}`,
                        pointerEvents: 'none',
                      }} />
                    )}
                  </div>
                )
              }

              return (
                <PlaceholderCell
                  key={key}
                  coord={{ x, y }}
                  size={CELL_SIZE}
                  isValid={isValid}
                  isHovered={isHovered}
                  previewTile={gameState.currentTile}
                  tileMap={gameState.staticTileMap}
                  onHover={() => setHoveredCoord({ x, y })}
                  onLeave={() => setHoveredCoord(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    setHoveredCoord(null) // Clear ghost on place
                    if (!isValid) return
                    if (gameState.turnPhase === 'PLACE_MEEPLE') {
                      undoTilePlacement()
                    }
                    selectTilePlacement({ x, y })
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </>
  )
})

export function GameBoard() {
  const {
    gameState,
    validPlacements,
    placeableSegments,
    tentativeTileCoord,
    tentativeMeepleSegment,
    tentativeMeepleType,
    tentativeSecondaryMeepleType,
    interactionState,
    selectTilePlacement,
    selectMeeplePlacement,
    rotateTentativeTile,
    fairyMoveTargets,
    moveFairy,
    magicPortalTargets,
    cycleDragonFacing,
    dragonPlaceTargets,
    placeDragonOnHoard,
    tentativeDragonFacing,
    undoTilePlacement,
  } = useGameStore()

  const { boardScale, boardOffset, hoveredCoord, setHoveredCoord, setBoardScale, selectedMeepleType, resetView, territoryOverlay, isManualInteraction, setIsManualInteraction } = useUIStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const isPointerDown = useRef(false)

  // ── Multi-touch Zoom State ────────────────────────────────────────────────
  const activePointers = useRef(new Map<number, { x: number; y: number }>())

  // To achieve native-feeling zoom/pan, we use a "reference state" model.
  // Whenever the number of fingers changes (touch or release), we establish a new baseline.
  const pinchRef = useRef<{
    initialScale: number,
    initialOffset: { x: number; y: number },
    initialDist: number | null,
    initialCentroid: { x: number; y: number }
  } | null>(null)

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  const { rotateTile } = useGameStore()
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        const phase = useGameStore.getState().gameState?.turnPhase
        if (phase === 'DRAGON_ORIENT') {
          cycleDragonFacing()
        } else {
          rotateTile()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [rotateTile, cycleDragonFacing])

  // ── Pan/zoom ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault() // Block browser zoom/scroll
      e.stopPropagation()
      setIsManualInteraction(true)

      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.3, Math.min(3, boardScale * scaleFactor))

      if (newScale === boardScale) return

      // Zoom towards mouse position (like Google Maps)
      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left - rect.width / 2
      const mouseY = e.clientY - rect.top - rect.height / 2

      // Calculate how much the offset needs to shift to keep the point under the mouse stable
      const ratio = newScale / boardScale
      const newOffsetX = boardOffset.x - (mouseX - boardOffset.x) * (ratio - 1)
      const newOffsetY = boardOffset.y - (mouseY - boardOffset.y) * (ratio - 1)

      useUIStore.setState({
        boardScale: newScale,
        boardOffset: { x: newOffsetX, y: newOffsetY }
      })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [boardScale, boardOffset])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only handle primary button for mouse, or any touch
    if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 1) return

    setIsManualInteraction(true)
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    isPointerDown.current = true

    // Re-establish baseline whenever a finger is added
    calibratePinchReference()
  }, [boardOffset, boardScale])

  const calibratePinchReference = useCallback(() => {
    const pts = Array.from(activePointers.current.values())
    if (pts.length === 0) {
      pinchRef.current = null
      return
    }

    let cx = 0, cy = 0
    for (const p of pts) {
      cx += p.x; cy += p.y
    }
    cx /= pts.length
    cy /= pts.length

    let dist = null
    if (pts.length === 2) {
      dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    }

    // Capture the absolute current visual state as the foundation for the current gesture phase
    pinchRef.current = {
      initialScale: useUIStore.getState().boardScale,
      initialOffset: { ...useUIStore.getState().boardOffset },
      initialCentroid: { x: cx, y: cy },
      initialDist: dist
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!activePointers.current.has(e.pointerId)) return
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const pts = Array.from(activePointers.current.values())
    if (pts.length === 0 || !pinchRef.current) return

    let cx = 0, cy = 0
    for (const p of pts) {
      cx += p.x; cy += p.y
    }
    cx /= pts.length
    cy /= pts.length

    const ref = pinchRef.current

    // Set panning bounds and visual state
    if (!isPanning) {
      const d = Math.hypot(cx - ref.initialCentroid.x, cy - ref.initialCentroid.y)
      if (d > 5 || pts.length >= 2) {
        setIsPanning(true)
          ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }
      if (pts.length < 2) return // Wait for panning threshold
    }

    let newScale = ref.initialScale
    if (pts.length === 2 && ref.initialDist && ref.initialDist > 0) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const ratio = dist / ref.initialDist
      newScale = Math.max(0.3, Math.min(3, ref.initialScale * ratio))
    }

    // Google Maps magic math:
    // 1. Shift the offset by the raw pixel movement of the centroid from its origin.
    //    (This handles "sticky" panning flawlessly, even during zooming)
    const panDx = cx - ref.initialCentroid.x
    const panDy = cy - ref.initialCentroid.y

    // 2. Adjust offset for zooming relative to the initial physical screen point where the pinch started.
    const container = containerRef.current
    if (container) {
      const rect = container.getBoundingClientRect()
      // The fixed point is the initial centroid on screen
      const fixedX = ref.initialCentroid.x - rect.left - rect.width / 2
      const fixedY = ref.initialCentroid.y - rect.top - rect.height / 2

      const sRatio = newScale / ref.initialScale

      // Compute final offset: Start at baseline + pan + zoom shift relative to fixed point
      const zoomShiftX = (fixedX - ref.initialOffset.x) * (sRatio - 1)
      const zoomShiftY = (fixedY - ref.initialOffset.y) * (sRatio - 1)

      useUIStore.setState({
        boardScale: newScale,
        boardOffset: {
          x: ref.initialOffset.x + panDx - zoomShiftX,
          y: ref.initialOffset.y + panDy - zoomShiftY
        }
      })
    }
  }, [isPanning])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId)

    if (activePointers.current.size === 0) {
      isPointerDown.current = false
      setIsPanning(false)
      setIsManualInteraction(false)
      pinchRef.current = null
    } else {
      // Fingers changed, recalculate baseline so zooming doesn't jump
      calibratePinchReference()
    }

    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    }
  }, [calibratePinchReference])

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId)
    if (activePointers.current.size === 0) {
      isPointerDown.current = false
      setIsPanning(false)
      setIsManualInteraction(false)
      pinchRef.current = null
    } else {
      calibratePinchReference()
    }
  }, [calibratePinchReference])

  // ── Builder/Pig segment map ────────────────

  const currentPlayer = gameState?.players[gameState.currentPlayerIndex]
  const tbData = gameState?.expansionData?.['tradersBuilders'] as { isBuilderBonusTurn?: boolean } | undefined
  const isBuilderBonusTurn = tbData?.isBuilderBonusTurn ?? false

  const builderSegmentsMap = useMemo<Record<string, string[]>>(() => {
    if (!gameState || !currentPlayer || !gameState.lastPlacedCoord) return {}
    if ((currentPlayer.meeples.available['BUILDER'] ?? 0) <= 0) return {}
    const results = getBuilderPigPlaceableSegments(
      gameState.featureUnionFind,
      gameState.staticTileMap,
      gameState.board,
      gameState.lastPlacedCoord,
      currentPlayer,
      'BUILDER',
    )
    const map: Record<string, string[]> = {}
    for (const { coord, segmentId } of results) {
      const k = `${coord.x},${coord.y}`
      if (!map[k]) map[k] = []
      map[k].push(segmentId)
    }
    return map
  }, [gameState, currentPlayer])

  const pigSegmentsMap = useMemo<Record<string, string[]>>(() => {
    if (!gameState || !currentPlayer || !gameState.lastPlacedCoord) return {}
    if ((currentPlayer.meeples.available['PIG'] ?? 0) <= 0) return {}
    const results = getBuilderPigPlaceableSegments(
      gameState.featureUnionFind,
      gameState.staticTileMap,
      gameState.board,
      gameState.lastPlacedCoord,
      currentPlayer,
      'PIG',
    )
    const map: Record<string, string[]> = {}
    for (const { coord, segmentId } of results) {
      const k = `${coord.x},${coord.y}`
      if (!map[k]) map[k] = []
      map[k].push(segmentId)
    }
    return map
  }, [gameState, currentPlayer])

  // ── iOS Safari touch-action failsafe ─────────────────────────────────────────
  // Even with CSS touch-action: none, Safari may try to intercept gestures.
  // Explicitly preventing default on native touchmove enforces full React pointer control.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const preventDefault = (e: TouchEvent) => {
      // Only prevent default if we have 2 touches (pinching) to let normal scroll pass if we wanted it
      // But actually, we want to control everything inside the game board, so always prevent.
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    el.addEventListener('touchmove', preventDefault, { passive: false })
    return () => el.removeEventListener('touchmove', preventDefault)
  }, [])

  // ── Board bounds ────────────────────────────────────────────────────────────

  if (!gameState) return null

  const { board } = gameState
  const minX = board.minX - BOARD_PADDING
  const maxX = board.maxX + BOARD_PADDING
  const minY = board.minY - BOARD_PADDING
  const maxY = board.maxY + BOARD_PADDING

  const dfData = gameState.expansionData?.['dragonFairy'] as any
  const dragonPos = dfData?.dragonPosition ?? null
  const isDragonOrientPhase = gameState.turnPhase === 'DRAGON_ORIENT'
  const dragonFacing = isDragonOrientPhase ? (tentativeDragonFacing ?? null) : (dfData?.dragonFacing ?? null)

  const isDragonPlacePhase = gameState.turnPhase === 'DRAGON_PLACE'
  const dragonPlaceTargetSet = useMemo(() => {
    if (!isDragonPlacePhase) return new Set<string>()
    return new Set(dragonPlaceTargets.map(c => `${c.x},${c.y}`))
  }, [isDragonPlacePhase, dragonPlaceTargets])

  const validSet = useMemo(() => new Set(validPlacements.map(c => `${c.x},${c.y}`)), [validPlacements])

  const fairySegmentMap = useMemo<Record<string, string>>(() => {
    if (!dfData?.fairyPosition) return {}
    const { coordinate, segmentId } = dfData.fairyPosition
    return { [`${coordinate.x},${coordinate.y}`]: segmentId }
  }, [dfData?.fairyPosition])

  const fairyTargetMap = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {}
    for (const t of fairyMoveTargets) {
      const k = `${t.coordinate.x},${t.coordinate.y}`
      if (!map[k]) map[k] = []
      map[k].push(t.segmentId)
    }
    return map
  }, [fairyMoveTargets])
  const isFairyPhase = gameState.turnPhase === 'FAIRY_MOVE'

  const portalTargetsMap = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {}
    for (const t of magicPortalTargets) {
      const k = `${t.coordinate.x},${t.coordinate.y}`
      if (!map[k]) map[k] = []
      map[k].push(t.segmentId)
    }
    return map
  }, [magicPortalTargets])
  const hasPortalTargets = magicPortalTargets.length > 0

  const segmentOwnerMap = useMemo(() => {
    if (!gameState?.featureUnionFind || territoryOverlay === 'off') return {}
    return computeSegmentOwnerMap(gameState.featureUnionFind, gameState.players, territoryOverlay)
  }, [gameState?.featureUnionFind, gameState?.players, territoryOverlay])

  const boardWidth = (maxX - minX + 1) * CELL_SIZE
  const boardHeight = (maxY - minY + 1) * CELL_SIZE

  // Stable callback wrappers
  const handleRotateTentativeTile = useCallback(() => rotateTentativeTile(), [rotateTentativeTile])
  const handleSelectTilePlacement = useCallback((coord: any) => selectTilePlacement(coord), [selectTilePlacement])
  const handleSelectMeeplePlacement = useCallback((segId: string, type: any, coord?: any, secondaryMeepleType?: 'BUILDER' | 'PIG' | null) => selectMeeplePlacement(segId, type, coord, secondaryMeepleType), [selectMeeplePlacement])
  const handleCycleDragonFacing = useCallback(() => cycleDragonFacing(), [cycleDragonFacing])
  const handlePlaceDragonOnHoard = useCallback((coord: any) => placeDragonOnHoard(coord), [placeDragonOnHoard])
  const handleMoveFairy = useCallback((coord: any, segId: string) => moveFairy(coord, segId), [moveFairy])
  const handleSetHoveredCoord = useCallback((coord: any) => setHoveredCoord(coord), [setHoveredCoord])
  const handleUndoTilePlacement = useCallback(() => undoTilePlacement(), [undoTilePlacement])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        background: '#1a2a1a',
        cursor: isPanning ? 'grabbing' : 'grab',
        position: 'relative',
        touchAction: 'none', // Prevents browser from handling pinch-zoom natively
        userSelect: 'none',
        WebkitUserSelect: 'none',
        padding: 0,
        margin: 0,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${boardScale})`,
          transformOrigin: 'center',
          width: boardWidth,
          height: boardHeight,
          willChange: 'transform',
          transition: isManualInteraction ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)',
        }}
      >
        <BoardGrid
          minX={minX} maxX={maxX} minY={minY} maxY={maxY}
          gameState={gameState}
          validSet={validSet}
          hoveredCoord={hoveredCoord}
          tentativeTileCoord={tentativeTileCoord}
          tentativeMeepleSegment={tentativeMeepleSegment}
          tentativeMeepleType={tentativeMeepleType}
          tentativeSecondaryMeepleType={tentativeSecondaryMeepleType}
          interactionState={interactionState}
          placeableSegments={placeableSegments}
          builderSegmentsMap={builderSegmentsMap}
          pigSegmentsMap={pigSegmentsMap}
          portalTargetsMap={portalTargetsMap}
          fairyTargetMap={fairyTargetMap}
          fairySegmentMap={fairySegmentMap}
          dragonPlaceTargetSet={dragonPlaceTargetSet}
          dragonPos={dragonPos}
          isDragonOrientPhase={isDragonOrientPhase}
          isDragonPlacePhase={isDragonPlacePhase}
          isFairyPhase={isFairyPhase}
          hasPortalTargets={hasPortalTargets}
          rotateTentativeTile={handleRotateTentativeTile}
          selectTilePlacement={handleSelectTilePlacement}
          selectMeeplePlacement={handleSelectMeeplePlacement}
          cycleDragonFacing={handleCycleDragonFacing}
          placeDragonOnHoard={handlePlaceDragonOnHoard}
          moveFairy={handleMoveFairy}
          setHoveredCoord={handleSetHoveredCoord}
          selectedMeepleType={selectedMeepleType}
          currentPlayer={currentPlayer}
          undoTilePlacement={handleUndoTilePlacement}
          segmentOwnerMap={segmentOwnerMap}
        />

        {/* Global Dragon Piece (Animated) */}
        {dragonPos && (
          <DragonPiece
            x={dragonPos.x}
            y={dragonPos.y}
            minX={minX}
            minY={minY}
            facing={dragonFacing}
            cellSize={CELL_SIZE}
            isOrienting={isDragonOrientPhase}
          />
        )}
      </div>

      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        opacity: 0.7,
        pointerEvents: 'auto',
        zIndex: 100,
      }}>
        <button
          onClick={() => {
            setIsManualInteraction(false);
            setBoardScale(boardScale * 1.5);
          }}
          style={btnStyle}
          title="Zoom in"
        >+</button>
        <button
          onClick={() => {
            setIsManualInteraction(false);
            resetView();
          }}
          style={btnStyle}
          title="Reset view"
        >⌖</button>
        <button
          onClick={() => {
            setIsManualInteraction(false);
            setBoardScale(boardScale * 0.66);
          }}
          style={btnStyle}
          title="Zoom out"
        >−</button>
        <div style={{ height: 8 }} />
        <button
          onClick={() => useUIStore.getState().cycleTerritoryOverlay()}
          style={{
            ...btnStyle,
            fontSize: 11,
            width: 32,
            height: 32,
            background: territoryOverlay === 'off'
              ? 'rgba(0,0,0,0.6)'
              : territoryOverlay === 'incomplete'
                ? 'rgba(80,140,200,0.7)'
                : 'rgba(200,140,60,0.7)',
          }}
          title={
            territoryOverlay === 'off' ? 'Territory: Off'
              : territoryOverlay === 'incomplete' ? 'Territory: Incomplete'
                : 'Territory: All'
          }
        >
          {territoryOverlay === 'off' ? '◇' : territoryOverlay === 'incomplete' ? '◈' : '◆'}
        </button>
      </div>

      {/* ── Bonus Turn Edge Glow ────────────────────────────────────────── */}
      <AnimatePresence>
        {isBuilderBonusTurn && currentPlayer && (
          <motion.div
            key="bonus-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            exit={{ opacity: 0, transition: { repeat: 0, duration: 0.5 } }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 5,
              boxShadow: `inset 0 0 80px ${currentPlayer.color}25, inset 0 0 200px ${currentPlayer.color}15`,
            }}
          />
        )}
      </AnimatePresence>

      <GameOverlay />
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  background: 'rgba(0,0,0,0.6)',
  border: '1px solid #555',
  color: '#f0f0f0',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 18,
  lineHeight: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
