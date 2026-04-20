import { memo, useEffect, useMemo, useRef } from 'react'
import { Tile3D } from './Tile3D'
import { useAnimatedTransform } from './animation/useAnimatedTransform'
import { useAnimationStore } from './animation/animationStore'
import type { Transform } from './animation/types'

const TILE_SIZE = 8.8

/**
 * Fixed world-space anchor for the current player's tile-in-hand. Positioned
 * off-board so it never overlaps placed tiles. See PHASE2 notes: in a later
 * pass this could become camera-relative so it always sits at the viewport's
 * lower-right; for now a stable world position is enough to prove the flight.
 */
export const HAND_ANCHOR: [number, number, number] = [14, 2, 16]

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
  /** Click target on the animated tile — used to trigger rotation. */
  onClick?: (e: any) => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

/**
 * Single animated tile that represents the current player's tile-in-hand
 * and its flight to the tentatively-selected board coordinate. The same
 * THREE group is reused across the hand↔board transition so there's no
 * pop-out + pop-in.
 *
 * The outer group's transform is driven by `useAnimatedTransform('current-tile', ...)`,
 * so Tile3D itself receives a no-op `tile.coordinate = {0,0}` and `rotation = 0`
 * (the animated group handles position and rotation.y via refs, avoiding
 * React re-renders on Tile3D's memo).
 */
function CurrentTile3DImpl({
  currentTile,
  staticTileMap,
  tentativeTileCoord,
  onClick,
  onPointerOver,
  onPointerOut,
}: CurrentTile3DProps) {
  const definition = staticTileMap[currentTile.definitionId]

  // Target transform: board coord if tentative, hand anchor otherwise.
  // rotationY is the board's natural convention (negated so visuals match
  // Tile3D's internal `rotation={[0, -rx, 0]}`).
  const target = useMemo<Transform>(() => {
    const rotY = -currentTile.rotation * (Math.PI / 180)
    if (tentativeTileCoord) {
      return {
        position: [tentativeTileCoord.x * TILE_SIZE, 0, tentativeTileCoord.y * TILE_SIZE],
        rotationY: rotY,
      }
    }
    return {
      position: HAND_ANCHOR,
      rotationY: rotY,
    }
  }, [tentativeTileCoord?.x, tentativeTileCoord?.y, currentTile.rotation])

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

  // When a fresh tile is drawn (definitionId changes), snap the animated
  // transform to the hand anchor BEFORE the next target update — otherwise
  // the new tile would appear to fly in from wherever the previous tile
  // landed on the board.
  const prevDefIdRef = useRef<string>(currentTile.definitionId)
  useEffect(() => {
    if (prevDefIdRef.current !== currentTile.definitionId) {
      const snap: Transform = { position: HAND_ANCHOR, rotationY: 0 }
      // Clear any in-flight track and commit directly at the hand anchor.
      useAnimationStore.setState((s) => ({
        objects: { ...s.objects, ['current-tile']: { committed: snap } },
      }))
      prevDefIdRef.current = currentTile.definitionId
    }
  }, [currentTile.definitionId])

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
