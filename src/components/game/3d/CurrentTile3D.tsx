import { memo, useEffect, useMemo, useRef } from 'react'
import { Tile3D } from './Tile3D'
import { useAnimatedTransform } from './animation/useAnimatedTransform'
import { useAnimationStore } from './animation/animationStore'
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
   * Floating rest position for the current tile. Drifts as the board
   * expands so the tile stays beside the draw bag rather than at a fixed
   * world point.
   */
  handAnchor: [number, number, number]
  /**
   * World position of the top tile of the draw bag — when a new tile is
   * drawn (definitionId changes), the animated group snaps here first so
   * the subsequent flight to `handAnchor` visually "lifts" the tile off
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

  // Target transform: board coord if tentative, hand anchor otherwise.
  // rotationY is the board's natural convention (negated so visuals match
  // Tile3D's internal `rotation={[0, -rx, 0]}`).
  // rotationX is 0 at rest (face-up); on draw the committed transform is
  // briefly snapped to π (face-down on top of pile) so the flight to the
  // hand anchor visually flips the tile.
  const target = useMemo<Transform>(() => {
    const rotY = -currentTile.rotation * (Math.PI / 180)
    if (tentativeTileCoord) {
      return {
        position: [tentativeTileCoord.x * TILE_SIZE, 0, tentativeTileCoord.y * TILE_SIZE],
        rotationY: rotY,
        rotationX: 0,
      }
    }
    return { position: handAnchor, rotationY: rotY, rotationX: 0 }
  }, [tentativeTileCoord?.x, tentativeTileCoord?.y, currentTile.rotation, handAnchor[0], handAnchor[1], handAnchor[2]])

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

  // When a fresh tile is drawn (definitionId changes), commit the animated
  // transform to the top of the active draw pile BEFORE the next target
  // update — the subsequent `setTarget(handAnchor)` then animates the
  // tile lifting off the pile and floating to the hand. Without this snap
  // the new tile would appear to fly in from wherever the previous tile
  // landed on the board.
  const prevDefIdRef = useRef<string>(currentTile.definitionId)
  useEffect(() => {
    if (prevDefIdRef.current !== currentTile.definitionId) {
      const originPos: [number, number, number] = drawOrigin ?? handAnchor
      // Face-down on top of the active pile — the subsequent flight to the
      // hand anchor (rotationX: 0) lerps the tile face-up mid-air.
      const snap: Transform = { position: originPos, rotationY: 0, rotationX: Math.PI }
      useAnimationStore.setState((s) => ({
        objects: { ...s.objects, ['current-tile']: { committed: snap } },
      }))
      prevDefIdRef.current = currentTile.definitionId
    }
  }, [currentTile.definitionId, drawOrigin, handAnchor])

  const ref = useAnimatedTransform('current-tile', target, opts)

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
