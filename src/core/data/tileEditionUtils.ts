import type { TileDefinition } from '../types/tile.ts'

/**
 * Clone a tile array into a new edition by replacing the ID prefix and expansionId.
 *
 * Example: remapToEdition(IC3_TILES, 'ic1', 'inns-cathedrals-c1')
 *   ic3_A → ic1_A,  ic3_Ka → ic1_Ka
 *
 * The suffix is everything after the first underscore.
 * imageUrl is cleared (these tiles are DB-only; no hardcoded assets for other editions).
 */
export function remapToEdition(
  tiles: TileDefinition[],
  idPrefix: string,
  expansionId: string,
): TileDefinition[] {
  return tiles.map(t => {
    const suffix = t.id.slice(t.id.indexOf('_') + 1)
    return { ...t, id: `${idPrefix}_${suffix}`, expansionId, imageUrl: undefined }
  })
}
