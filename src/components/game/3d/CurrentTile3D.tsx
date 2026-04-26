import { memo, useEffect, useMemo, useRef } from 'react'
import { Tile3D } from './Tile3D'
import { useAnimatedTransform } from './animation/useAnimatedTransform'
import { useAnimationStore } from './animation/animationStore'
import { useGameStore } from '../../../store/gameStore'
import type { Transform } from './animation/types'

const TILE_SIZE = 8.8

interface CurrentTile3DProps {
  /** Game state's currentTile: { definitionId, rotation }. */
  currentTile: { definitionId: string; rotation: number }
  /** Full tile-definition registry (passed through to Tile3D for linkedTiles). */
  staticTileMap: Record<string, any>
  /**
   * Board coordinate the tile is tentatively placed at, or `null` when the
   * tile is sitting in hand. A change to this prop starts a hand↔board flight.
   */
  tentativeTileCoord: { x: number; y: number } | null
  /**
   * Floating rest position for the current tile. The held tile follows the
   * camera at runtime (HeldTileTracker mutates committed.position each
   * frame); this prop is the static fallback used until the tracker
   * paints its first frame.
   */
  handAnchor: [number, number, number]
  /**
   * World position of the top tile of the draw bag — when a fresh tile is
   * drawn (tileDrawCounter increments), the animated group snaps here first
   * so the subsequent flight to `handAnchor` visually "lifts" the tile off
   * the pile. `null` when the bag is empty.
   */
  drawOrigin: [number, number, number] | null
  /** Click target on the animated tile — used to trigger rotation. */
  onClick?: (e: any) => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

/**
 * Single animated tile that represents the current player's tile-in-hand
 * and its flight to the tentatively-selected board coordinate. The same
 * THREE group is reused across draw → hand → board, so each transition is
 * continuous (no pop-in / pop-out).
 *
 * Held-tile state machine, all driven by the animation store's
 * `current-tile` track:
 *   - Fresh draw (tileDrawCounter ↑) → snap to drawOrigin face-down, then
 *     fly to handAnchor (rotationX: π → 0), 700ms, arc 4.
 *   - In-hand rotate (rotation prop changes, same draw counter) → spin
 *     around Y, 260ms, no arc. Held in place at the live camera anchor.
 *   - Flip (definitionId changes, same draw counter) → rotate 180° around
 *     the tile's long axis, 600ms, no position change. Toggle between
 *     0 and π each successive flip so the tile never accumulates a stale
 *     rotation; the new definition's texture is loaded mid-flip.
 *   - Tentative placement (tentativeTileCoord set) → fly from current
 *     position to board coord, 700ms, arc 4.
 */
function CurrentTile3DImpl({
  currentTile,
  staticTileMap,
  tentativeTileCoord,
  handAnchor,
  drawOrigin,
  onClick,
  onPointerOver,
  onPointerOut,
}: CurrentTile3DProps) {
  const definition = staticTileMap[currentTile.definitionId]
  // Increments every time a fresh tile is drawn (auto-draw, drawTile,
  // discardTile). Used to distinguish a real draw — which plays the
  // pile→hand lift — from a flipTile swap, which should not.
  const tileDrawCounter = useGameStore((s) => s.tileDrawCounter)

  // Long-axis flip state: parity flips on each flipTile, so rotation
  // alternates 0 ↔ π. The actual axis (X vs Z) is picked from the linked
  // tile's offset; double tiles laid out east-west use X, north-south Z.
  const flipParityRef = useRef<number>(0)
  const flipAxisRef = useRef<'x' | 'z'>('x')

  // Pick the long axis once per definitionId. linkedTiles[0].dx > 0 → tile
  // extends along world X; otherwise along Z. Single tiles don't flip.
  if (definition?.linkedTiles && definition.linkedTiles.length > 0) {
    flipAxisRef.current = Math.abs(definition.linkedTiles[0].dx) >= Math.abs(definition.linkedTiles[0].dy) ? 'x' : 'z'
  }

  // Target transform: board coord if tentative, hand anchor otherwise.
  // rotationY is the board's natural convention (negated so visuals match
  // Tile3D's internal `rotation={[0, -rx, 0]}`).
  // rotationX/Z carry the held-tile's persistent flip parity; rotationX is
  // also driven separately by the draw snap (face-down → face-up).
  const target = useMemo<Transform>(() => {
    const rotY = -currentTile.rotation * (Math.PI / 180)
    const flipAngle = flipParityRef.current * Math.PI
    const rotX = flipAxisRef.current === 'x' ? flipAngle : 0
    const rotZ = flipAxisRef.current === 'z' ? flipAngle : 0
    if (tentativeTileCoord) {
      return {
        position: [tentativeTileCoord.x * TILE_SIZE, 0, tentativeTileCoord.y * TILE_SIZE],
        rotationY: rotY,
        rotationX: rotX,
        rotationZ: rotZ,
      }
    }
    return { position: handAnchor, rotationY: rotY, rotationX: rotX, rotationZ: rotZ }
  }, [tentativeTileCoord?.x, tentativeTileCoord?.y, currentTile.rotation, handAnchor[0], handAnchor[1], handAnchor[2], flipParityRef.current, flipAxisRef.current])

  // Compare previous target vs current to pick flight opts:
  //   - XZ change  → hand↔board flight (longer + arc)
  //   - rotation-only → in-place spin (short, flat)
  const prevTargetRef = useRef<Transform>(target)
  const positionMoved =
    prevTargetRef.current.position[0] !== target.position[0] ||
    prevTargetRef.current.position[2] !== target.position[2]
  const opts = positionMoved
    ? { durationMs: 700, arcHeight: 4 }
    : { durationMs: 260, arcHeight: 0 }

  useEffect(() => {
    prevTargetRef.current = target
  }, [target])

  // Fresh-draw flight: snap to active pile top, face-down, then fly to hand.
  // Triggered by `tileDrawCounter` incrementing — never by a flipTile swap.
  // Initialised to -1 so the very first render (counter=0 or 1) plays the
  // lift-off, matching "every fresh tile gets the draw flight".
  const prevDrawCounterRef = useRef<number>(-1)
  useEffect(() => {
    if (prevDrawCounterRef.current !== tileDrawCounter) {
      prevDrawCounterRef.current = tileDrawCounter
      // Reset flip parity so a fresh tile starts face-up (rotationX/Z 0
      // after the lift).
      flipParityRef.current = 0
      const originPos: [number, number, number] = drawOrigin ?? handAnchor
      const snap: Transform = { position: originPos, rotationY: 0, rotationX: Math.PI }
      useAnimationStore.setState((s) => ({
        objects: { ...s.objects, ['current-tile']: { committed: snap } },
      }))
      const rotY = -currentTile.rotation * (Math.PI / 180)
      void useAnimationStore.getState().setTarget(
        'current-tile',
        { position: handAnchor, rotationY: rotY, rotationX: 0, rotationZ: 0 },
        { durationMs: 700, arcHeight: 4 },
      )
    }
  }, [tileDrawCounter, currentTile.rotation, drawOrigin, handAnchor])

  // Long-axis flip (double-tile flipSide swap): definitionId changed but
  // draw counter didn't. Toggle parity 0 ↔ 1 → target's rotationX/Z swings
  // by π via the standard track pipeline (260ms in-place spin).
  const prevDefIdRef = useRef<string>(currentTile.definitionId)
  useEffect(() => {
    if (
      prevDefIdRef.current !== currentTile.definitionId &&
      prevDrawCounterRef.current === tileDrawCounter
    ) {
      // It's a flip — toggle parity. The next render's `target` useMemo
      // picks up the new parity and useAnimatedTransform will animate it.
      flipParityRef.current = flipParityRef.current === 0 ? 1 : 0
    }
    prevDefIdRef.current = currentTile.definitionId
  }, [currentTile.definitionId, tileDrawCounter])

  // Slower duration for flips so the rotation reads clearly (260ms felt
  // like a pop). When the active flight is a flip, override opts.
  const flipAxisChanged =
    (prevTargetRef.current.rotationX ?? 0) !== (target.rotationX ?? 0) ||
    (prevTargetRef.current.rotationZ ?? 0) !== (target.rotationZ ?? 0)
  const isFlipFlight = !positionMoved && flipAxisChanged
  const flightOpts = isFlipFlight
    ? { durationMs: 600, arcHeight: 1.2 }
    : opts

  const ref = useAnimatedTransform('current-tile', target, flightOpts)

  // Stable props for Tile3D so memoization holds across re-renders.
  const stableTile = useMemo(
    () => ({ coordinate: { x: 0, y: 0 }, rotation: 0 }),
    []
  )

  if (!definition) return null

  return (
    <group ref={ref} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <Tile3D
        tile={stableTile}
        definition={definition}
        staticTileMap={staticTileMap}
        renderLinked
      />
    </group>
  )
}

export const CurrentTile3D = memo(CurrentTile3DImpl)
