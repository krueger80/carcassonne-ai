import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Meeple3D } from './Meeple3D'
import { useAnimatedTransform } from './animation/useAnimatedTransform'
import { useAnimationStore } from './animation/animationStore'
import { useUIStore } from '../../../store/uiStore'
import { useGameStore } from '../../../store/gameStore'
import { domElementToWorldTarget } from './animation/domToWorld'
import { segmentCenterWorld } from './animation/worldCoords'
import type { Transform } from './animation/types'
import type { MeepleType } from '../../../core/types/player'
import type { Coordinate } from '../../../core/types/board'

const PRIMARY_ID = 'current-meeple-primary'
const SECONDARY_ID = 'current-meeple-secondary'
const FLIGHT_DURATION_MS = 600
const FLIGHT_ARC = 2.5
const SPACING = 3.5

/**
 * Match the per-tile rotation/spacing applied by the static board meeple
 * renderer in GameScene3D so the central meeple lands exactly where the
 * static one will appear after confirm — no positional jump.
 *   - hash: per-tile seeded angle (0..2π)
 *   - i: slot index (0=primary, 1=secondary)
 *   - count: total meeples on the segment
 */
function slotWorldPos(
  center: [number, number, number],
  coord: { x: number, y: number },
  i: number,
  count: number,
): [number, number, number] {
  const seed = coord.x * 12.9898 + coord.y * 78.233
  const hash = Math.abs(Math.sin(seed)) * Math.PI * 2
  const angle = hash + i * 0.2
  const offsetX = (i - (count - 1) / 2) * SPACING
  // Rotate (offsetX, 0, 0) by `angle` around Y, then add to segment center.
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return [
    center[0] + offsetX * cos,
    center[1],
    center[2] - offsetX * sin,
  ]
}

function slotRotationY(coord: { x: number, y: number }, i: number): number {
  const seed = coord.x * 12.9898 + coord.y * 78.233
  const hash = Math.abs(Math.sin(seed)) * Math.PI * 2
  return hash + i * 0.2
}

/**
 * Centralised controller for the active player's pending meeple placement.
 * Owns three visual states:
 *
 *   1. Hover (no tentative selection but a placement is hovered) — renders
 *      a 50%-opacity ghost meeple at the hovered segment.
 *   2. Tentative (segment clicked, awaiting confirm) — renders the meeple
 *      at the segment, animating either from the player card on first click
 *      or from its previous segment on subsequent clicks.
 *   3. Idle — unmounted.
 *
 * Mounted once at the top level of GameScene3D. PlacementOverlay3D no longer
 * renders the meeple body itself; it only emits hover/click events.
 */
export function SelectableMeeple3D() {
  const gameState = useGameStore((s) => s.gameState)
  const tentativeMeepleSegment = useGameStore((s) => s.tentativeMeepleSegment)
  const tentativeMeepleType = useGameStore((s) => s.tentativeMeepleType)
  const tentativeSecondaryMeepleType = useGameStore((s) => s.tentativeSecondaryMeepleType)
  const tentativeTileCoord = useGameStore((s) => s.tentativeTileCoord)
  const hovered = useUIStore((s) => s.hoveredMeepleSegment)

  // Clear lingering hover state whenever we leave the meeple phase or
  // commit a tentative selection — keeps the UI store consistent.
  const isMeeplePhase = !!gameState && gameState.turnPhase === 'PLACE_MEEPLE'
  useEffect(() => {
    if (!isMeeplePhase || tentativeMeepleSegment) {
      if (useUIStore.getState().hoveredMeepleSegment) {
        useUIStore.getState().setHoveredMeepleSegment(null)
      }
    }
  }, [isMeeplePhase, tentativeMeepleSegment])

  if (!gameState) return null
  if (!isMeeplePhase) return null

  // Tentative wins over hover. When neither, unmount.
  if (tentativeMeepleSegment && tentativeTileCoord) {
    const coord: Coordinate = tentativeTileCoord
    const tile = gameState.board.tiles[`${coord.x},${coord.y}`]
    const def = tile && gameState.staticTileMap[tile.definitionId]
    const segment = def?.segments.find((s: any) => s.id === tentativeMeepleSegment)
    if (!tile || !segment) return null
    const player = gameState.players[gameState.currentPlayerIndex]
    const isFarmer = segment.type === 'FIELD'
    const center = segmentCenterWorld(coord, tile.rotation || 0, segment.meepleCentroid)
    return (
      <SelectableMeepleAnimated
        coord={coord}
        primaryType={(tentativeMeepleType ?? 'NORMAL') as MeepleType}
        secondaryType={tentativeSecondaryMeepleType ?? null}
        color={player.color}
        playerId={player.id}
        isFarmer={isFarmer}
        center={center}
        ghost={false}
      />
    )
  }

  if (hovered) {
    const player = gameState.players[gameState.currentPlayerIndex]
    const tile = gameState.board.tiles[`${hovered.coord.x},${hovered.coord.y}`]
    const def = tile && gameState.staticTileMap[tile.definitionId]
    const segment = def?.segments.find((s: any) => s.id === hovered.segmentId)
    if (!tile || !segment) return null
    const center = segmentCenterWorld(hovered.coord, tile.rotation || 0, segment.meepleCentroid)
    return (
      <SelectableMeepleAnimated
        coord={hovered.coord}
        primaryType={hovered.type}
        secondaryType={hovered.secondaryType ?? null}
        color={player.color}
        playerId={player.id}
        isFarmer={hovered.isFarmer}
        center={center}
        ghost
      />
    )
  }

  return null
}

interface AnimatedProps {
  coord: Coordinate
  primaryType: MeepleType
  secondaryType: MeepleType | null
  color: string
  playerId: string
  isFarmer: boolean
  center: [number, number, number]
  /** True when rendering a hover preview (no tentative selection yet). */
  ghost: boolean
}

function SelectableMeepleAnimated({
  coord,
  primaryType,
  secondaryType,
  color,
  playerId,
  isFarmer,
  center,
  ghost,
}: AnimatedProps) {
  const { camera, gl } = useThree()

  // Hover preview snaps (no flight) so moving the mouse between segments
  // doesn't trail an animated ghost. Tentative placement uses the full flight.
  const opts = ghost
    ? { durationMs: 0, arcHeight: 0 }
    : { durationMs: FLIGHT_DURATION_MS, arcHeight: FLIGHT_ARC }

  const count = secondaryType ? 2 : 1
  const primaryTarget = useMemo<Transform>(() => ({
    position: slotWorldPos(center, coord, 0, count),
    rotationY: slotRotationY(coord, 0),
  }), [center[0], center[1], center[2], coord.x, coord.y, count])

  const secondaryTarget = useMemo<Transform>(() => ({
    position: slotWorldPos(center, coord, 1, count),
    rotationY: slotRotationY(coord, 1),
  }), [center[0], center[1], center[2], coord.x, coord.y, count])

  const primaryRef = useAnimatedTransform(PRIMARY_ID, primaryTarget, opts)
  const secondaryRef = useAnimatedTransform(SECONDARY_ID, secondaryTarget, opts)

  // Reseed committed from the player-card slot every time we transition
  // into "tentative" (ghost=false). This makes the first click animate
  // card→segment regardless of whether the user hovered first. Runs AFTER
  // useAnimatedTransform's effect (hook order) so it can override the
  // freshly-set committed and start a flight via an explicit setTarget.
  const prevGhostRef = useRef<boolean | null>(null)
  const prevHasSecondaryRef = useRef<boolean>(false)
  useEffect(() => {
    const prevGhost = prevGhostRef.current
    prevGhostRef.current = ghost
    const hasSecondary = !!secondaryType
    const prevHadSecondary = prevHasSecondaryRef.current
    prevHasSecondaryRef.current = hasSecondary
    if (ghost) return
    // Two cases that need a card→segment flight:
    //   (a) just transitioned into tentative (null/hover → tentative)
    //   (b) secondary just appeared while already tentative (modern rules
    //       added a builder/pig alongside the primary)
    const enteringTentative = prevGhost !== false
    const secondaryAppeared = !enteringTentative && hasSecondary && !prevHadSecondary
    if (!enteringTentative && !secondaryAppeared) return
    const cardWorld = domElementToWorldTarget(`player-card-${playerId}`, camera, gl.domElement)
    if (!cardWorld) return
    const seed: Transform = {
      position: [cardWorld.x, cardWorld.y, cardWorld.z],
      rotationY: 0,
    }
    useAnimationStore.setState((s) => ({
      objects: {
        ...s.objects,
        ...(enteringTentative ? { [PRIMARY_ID]: { committed: seed } } : {}),
        [SECONDARY_ID]: { committed: seed },
      },
    }))
    if (enteringTentative) {
      void useAnimationStore.getState().setTarget(PRIMARY_ID, primaryTarget, {
        durationMs: FLIGHT_DURATION_MS,
        arcHeight: FLIGHT_ARC,
      })
    }
    if (hasSecondary) {
      void useAnimationStore.getState().setTarget(SECONDARY_ID, secondaryTarget, {
        durationMs: FLIGHT_DURATION_MS,
        arcHeight: FLIGHT_ARC,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghost, playerId, secondaryType])

  return (
    <>
      <group ref={primaryRef}>
        <Meeple3D
          type={primaryType}
          color={color}
          isFarmer={isFarmer}
          isTentative={ghost}
          position={[0, 0, 0]}
        />
      </group>
      {secondaryType && (
        <group ref={secondaryRef}>
          <Meeple3D
            type={secondaryType}
            color={color}
            isFarmer={secondaryType === 'PIG'}
            isTentative={ghost}
            position={[0, 0, 0]}
          />
        </group>
      )}
    </>
  )
}
