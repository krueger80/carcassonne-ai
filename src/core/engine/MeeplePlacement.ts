import type { Board, Coordinate, MeeplePlacement } from '../types/board.ts'
import type { TileDefinition } from '../types/tile.ts'
import type { Player, MeepleType } from '../types/player.ts'
import type { UnionFindState } from '../types/feature.ts'
import { nodeKey } from '../types/feature.ts'
import { coordKey } from '../types/board.ts'
import { featureHasMeeples, getFeature } from './FeatureDetector.ts'
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
 * Returns true if a player can place a BUILDER or PIG on the given segment.
 *
 * Rules (inverse of normal placement):
 *  1. Player must have the requested special meeple available.
 *  2. Feature must already contain a NORMAL or BIG meeple from this player.
 *  3. BUILDER: segment's feature must be CITY or ROAD.
 *  4. PIG: segment's feature must be FIELD.
 *  5. Player must not already have a builder/pig on this specific feature.
 */
export function canPlaceBuilderOrPig(
  state: UnionFindState,
  player: Player,
  coord: Coordinate,
  segmentId: string,
  meepleType: 'BUILDER' | 'PIG',
): boolean {
  if (availableMeepleCount(player, meepleType) <= 0) return false

  const nKey = nodeKey(coord, segmentId)
  const feature = getFeature(state, nKey)
  if (!feature) return false

  // Type restriction
  if (meepleType === 'BUILDER' && feature.type !== 'CITY' && feature.type !== 'ROAD') return false
  if (meepleType === 'PIG' && feature.type !== 'FIELD') return false

  // Feature must already have at least one NORMAL or BIG meeple from this player
  const playerHasRegularMeeple = feature.meeples.some(
    m => m.playerId === player.id && (m.meepleType === 'NORMAL' || m.meepleType === 'BIG'),
  )
  if (!playerHasRegularMeeple) return false

  // Player must not already have this special meeple type on the feature
  const alreadyHasSpecial = feature.meeples.some(
    m => m.playerId === player.id && m.meepleType === meepleType,
  )
  return !alreadyHasSpecial
}

/**
 * Returns all board positions where the player can place a BUILDER or PIG.
 * Searches ALL placed tiles (not just the last-placed tile).
 */
/**
 * Returns all board positions where the player can place a BUILDER or PIG.
 * RESTRICTED to the last-placed tile (as per rules).
 */
export function getBuilderPigPlaceableSegments(
  state: UnionFindState,
  tileMap: Record<string, TileDefinition>,
  board: Board,
  lastPlacedCoord: Coordinate,
  player: Player,
  meepleType: 'BUILDER' | 'PIG',
): Array<{ coord: Coordinate; segmentId: string }> {
  if (availableMeepleCount(player, meepleType) <= 0) return []

  const key = coordKey(lastPlacedCoord)
  const tile = board.tiles[key]
  if (!tile) return []

  const def = tileMap[tile.definitionId]
  if (!def) return []

  const results: Array<{ coord: Coordinate; segmentId: string }> = []
  for (const seg of def.segments) {
    if (canPlaceBuilderOrPig(state, player, lastPlacedCoord, seg.id, meepleType)) {
      results.push({ coord: lastPlacedCoord, segmentId: seg.id })
    }
  }
  return results
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
