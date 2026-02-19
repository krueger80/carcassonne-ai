import type { Board, Coordinate, MeeplePlacement } from '../types/board.ts'
import type { TileDefinition } from '../types/tile.ts'
import type { Player, MeepleType } from '../types/player.ts'
import type { UnionFindState } from '../types/feature.ts'
import { nodeKey } from '../types/feature.ts'
import { coordKey } from '../types/board.ts'
import { featureHasMeeples } from './FeatureDetector.ts'
import { availableMeepleCount } from '../types/player.ts'

/**
 * Returns true if a player can place a meeple on the given segment
 * of the just-placed tile.
 *
 * Rules:
 *  1. Player must have at least one meeple of the requested type available.
 *  2. The feature containing this segment must not already have any meeples.
 */
export function canPlaceMeeple(
  state: UnionFindState,
  player: Player,
  coord: Coordinate,
  segmentId: string,
  meepleType: MeepleType = 'NORMAL',
): boolean {
  if (availableMeepleCount(player, meepleType) <= 0) return false

  const nKey = nodeKey(coord, segmentId)
  // Check if the feature (root of this node) already has meeples
  return !featureHasMeeples(state, nKey)
}

/**
 * Returns the segment IDs on the given tile that are eligible for meeple placement.
 * (Non-field segments where the feature has no current meeples.)
 */
export function getPlaceableSegments(
  state: UnionFindState,
  tileMap: Record<string, TileDefinition>,
  board: Board,
  coord: Coordinate,
  player: Player,
): string[] {
  const key = coordKey(coord)
  const placedTile = board.tiles[key]
  if (!placedTile) return []

  const def = tileMap[placedTile.definitionId]
  if (!def) return []

  const hasNormal = availableMeepleCount(player, 'NORMAL') > 0
  const hasBig = availableMeepleCount(player, 'BIG') > 0
  if (!hasNormal && !hasBig) return []

  return def.segments
    .filter(seg => {
      const nKey = nodeKey(coord, seg.id)
      return !featureHasMeeples(state, nKey)
    })
    .map(seg => seg.id)
}

/**
 * Create a MeeplePlacement record.
 */
export function createMeeplePlacement(
  playerId: string,
  meepleType: MeepleType,
  segmentId: string,
): MeeplePlacement {
  return { playerId, meepleType, segmentId }
}
