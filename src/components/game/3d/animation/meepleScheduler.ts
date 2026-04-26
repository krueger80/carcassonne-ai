import type { Coordinate } from '../../../../core/types/board'
import type { GameState } from '../../../../core/types/game'
import type { MeepleType } from '../../../../core/types/player'
import { useAnimationStore } from './animationStore'
import { segmentCenterWorld } from './worldCoords'
import type { Transform } from './types'

/**
 * Central facade over the existing animation primitives (`spawnGhost`,
 * `setTarget`, `suppressedSegments`). Every game-state mutation that adds,
 * removes, or moves a meeple should go through this module instead of
 * touching the animation store directly — that's the only way to guarantee
 * "every follower moves with an animation, never teleports".
 *
 * The scheduler does NOT own React state. It produces side effects on the
 * animation store and returns when each flight has been queued; consumers
 * can `await` if they need to sequence engine commits behind the
 * animations (e.g. dragon-devour pause).
 */

/**
 * Strip a `_PIG` / `_BUILDER` suffix from an engine meeple slot key so
 * `def.segments.find(s => s.id === segmentId)` lands on the base segment.
 * Pigs / builders share the centroid of their primary slot.
 */
function baseSegmentId(slotKey: string): string {
  const idx = slotKey.lastIndexOf('_')
  if (idx < 0) return slotKey
  const suffix = slotKey.slice(idx + 1)
  return suffix === 'PIG' || suffix === 'BUILDER' ? slotKey.slice(0, idx) : slotKey
}

export interface EatenMeeple {
  playerId: string
  meepleType: MeepleType
  /** Engine slot key — may include `_PIG` / `_BUILDER` suffix. */
  segmentId: string
  coordinate: Coordinate
}

/**
 * Spawn a return-to-card flight for every meeple devoured by the dragon.
 * Strips slot suffixes so pigs and builders animate alongside primaries
 * (the previous straight-through `segments.find` look-up returned undefined
 * for `_PIG` / `_BUILDER` keys, silently skipping them).
 */
export function dragonDevour(state: GameState, eaten: EatenMeeple[]): void {
  for (const meeple of eaten) {
    const tile = state.board.tiles[`${meeple.coordinate.x},${meeple.coordinate.y}`]
    if (!tile) continue
    const tileDef = state.staticTileMap[tile.definitionId]
    if (!tileDef) continue
    const baseId = baseSegmentId(meeple.segmentId)
    const segment = tileDef.segments.find((s: any) => s.id === baseId)
    if (!segment?.meepleCentroid) continue

    const startPos = segmentCenterWorld(
      meeple.coordinate,
      tile.rotation || 0,
      segment.meepleCentroid,
    )
    const player = state.players.find((p) => p.id === meeple.playerId)
    // Pigs always lie flat (farmer posture); builders stand. The slot
    // suffix is the source of truth here, not the segment type.
    const isFarmer =
      meeple.segmentId.endsWith('_PIG')
        ? true
        : meeple.segmentId.endsWith('_BUILDER')
          ? false
          : segment.type === 'FIELD'

    useAnimationStore.getState().spawnGhost({
      id: `dragon-eat-${meeple.playerId}-${meeple.segmentId}-${Math.random()}`,
      meepleType: meeple.meepleType,
      color: player?.color || '#fff',
      isFarmer,
      direction: 'to-card',
      worldEndpoint: { position: startPos, rotationY: 0 },
      cardPlayerId: meeple.playerId,
      durationMs: 900,
      arcHeight: 4,
      // Mask the static board slot for the duration of the flight so the
      // renderer doesn't double-paint while the ghost is in the air.
      suppressKey: `${meeple.coordinate.x},${meeple.coordinate.y}:${meeple.segmentId}`,
    })
  }
}

/**
 * Fly the central pending-meeple back to the active player's card. Used by
 * `cancelMeeplePlacement`, `undoTilePlacement`, and the side-effect when a
 * different tile coord is clicked while a meeple was already tentatively
 * placed.
 *
 * Implementation: the `current-meeple-primary` / `-secondary` tracks live
 * inside the animation store with the meeple's last sampled position as
 * `committed`. We spawn a `to-card` ghost from there so the visual flight
 * plays even after the SelectableMeeple3D component unmounts.
 */
export function flyPendingMeepleToCard(
  playerId: string,
  primaryType: MeepleType,
  primaryIsFarmer: boolean,
  primaryColor: string,
  secondaryType: MeepleType | null,
  secondaryIsFarmer: boolean,
): void {
  const store = useAnimationStore.getState()
  const primaryRec = store.objects['current-meeple-primary']
  if (primaryRec) {
    store.spawnGhost({
      id: `cancel-primary-${playerId}-${Math.random()}`,
      meepleType: primaryType,
      color: primaryColor,
      isFarmer: primaryIsFarmer,
      direction: 'to-card',
      worldEndpoint: {
        position: primaryRec.committed.position,
        rotationY: primaryRec.committed.rotationY,
      },
      cardPlayerId: playerId,
      durationMs: 500,
      arcHeight: 3,
    })
    // Drop the in-flight central track immediately so SelectableMeeple3D
    // unmounts cleanly while the ghost continues its return flight.
    useAnimationStore.setState((s) => {
      const { ['current-meeple-primary']: _, ...rest } = s.objects
      return { objects: rest }
    })
  }
  if (secondaryType) {
    const secRec = useAnimationStore.getState().objects['current-meeple-secondary']
    if (secRec) {
      useAnimationStore.getState().spawnGhost({
        id: `cancel-secondary-${playerId}-${Math.random()}`,
        meepleType: secondaryType,
        color: primaryColor,
        isFarmer: secondaryIsFarmer,
        direction: 'to-card',
        worldEndpoint: {
          position: secRec.committed.position,
          rotationY: secRec.committed.rotationY,
        },
        cardPlayerId: playerId,
        durationMs: 500,
        arcHeight: 3,
      })
      useAnimationStore.setState((s) => {
        const { ['current-meeple-secondary']: _, ...rest } = s.objects
        return { objects: rest }
      })
    }
  }
}

/**
 * Fly the central tile back to its hand anchor (the camera-attached "held"
 * spot). Used when a tentative placement is cancelled or replaced by a
 * different coord. Re-uses the existing `setNextOverride` channel so the
 * shorter return flight applies on the next setTarget.
 */
export function flyTileBackToHand(): void {
  useAnimationStore.getState().setNextOverride('current-tile', {
    durationMs: 280,
    arcHeight: 2.5,
  })
}

/**
 * Spawn a ghost meeple that flies from the segment center (post-engine
 * removal) to the card. Use when a board meeple is removed by an action
 * other than dragon devour — e.g. ESC during meeple placement before
 * confirm, or a feature scoring that returns the meeple to its owner.
 *
 * `segmentId` may include the `_PIG` / `_BUILDER` suffix; this function
 * strips it for the centroid lookup and uses the suffix to set
 * `isFarmer` (pigs always lie, builders always stand).
 */
export function returnBoardMeepleToCard(
  state: GameState,
  meeple: EatenMeeple,
): void {
  const tile = state.board.tiles[`${meeple.coordinate.x},${meeple.coordinate.y}`]
  if (!tile) return
  const tileDef = state.staticTileMap[tile.definitionId]
  if (!tileDef) return
  const baseId = baseSegmentId(meeple.segmentId)
  const segment = tileDef.segments.find((s: any) => s.id === baseId)
  if (!segment?.meepleCentroid) return

  const startPos = segmentCenterWorld(
    meeple.coordinate,
    tile.rotation || 0,
    segment.meepleCentroid,
  )
  const player = state.players.find((p) => p.id === meeple.playerId)
  const isFarmer =
    meeple.segmentId.endsWith('_PIG')
      ? true
      : meeple.segmentId.endsWith('_BUILDER')
        ? false
        : segment.type === 'FIELD'

  useAnimationStore.getState().spawnGhost({
    id: `return-${meeple.playerId}-${meeple.segmentId}-${Math.random()}`,
    meepleType: meeple.meepleType,
    color: player?.color || '#fff',
    isFarmer,
    direction: 'to-card',
    worldEndpoint: { position: startPos, rotationY: 0 },
    cardPlayerId: meeple.playerId,
    durationMs: 700,
    arcHeight: 4,
    suppressKey: `${meeple.coordinate.x},${meeple.coordinate.y}:${meeple.segmentId}`,
  })
}

/**
 * Re-export of the original setTarget primitive scoped to the `current-*`
 * tracks, for any caller that still drives those directly. Kept narrow so
 * future migration to a fully-encapsulated store is straightforward.
 */
export function setCurrentMeepleTarget(
  id: 'current-meeple-primary' | 'current-meeple-secondary',
  target: Transform,
  opts: { durationMs?: number; arcHeight?: number } = {},
): Promise<void> {
  return useAnimationStore.getState().setTarget(id, target, opts)
}
