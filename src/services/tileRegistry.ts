/**
 * Tile Registry: single source of truth for tile definitions.
 *
 * Loads tiles from the Supabase database first (via tileService).
 * Falls back to the hardcoded tile arrays if the DB is unreachable.
 * Caches the result in memory so subsequent calls are instant.
 */

import type { TileDefinition } from '../core/types/tile.ts'
import { tileService } from './tileService.ts'
import { BASE1_TILES } from '../core/data/baseTilesC1.ts'
import { BASE_TILES } from '../core/data/baseTiles.ts'
import { BASE3_TILES } from '../core/data/baseTilesC3.ts'
import { BASE_TILES_C3 } from '../core/data/baseTiles_C3.ts'
import { IC1_TILES } from '../core/data/innsCathedralsTilesC1.ts'
import { IC2_TILES } from '../core/data/innsCathedralsTilesC2.ts'
import { IC_TILES } from '../core/data/innsCathedralsTiles.ts'
import { IC_C31_TILES } from '../core/data/innsCathedralsC31Tiles.ts'
import { TB1_TILES } from '../core/data/tradersBuildersTilesC1.ts'
import { TB_TILES } from '../core/data/tradersBuildersTiles.ts'
import { TB3_TILES } from '../core/data/tradersBuildersTilesC3.ts'
import { TB_C31_TILES } from '../core/data/tradersBuildersC31Tiles.ts'
import { DF_TILES } from '../core/data/dragonFairyTiles.ts'

// ─── Cache ───────────────────────────────────────────────────────────────────

let cachedTiles: TileDefinition[] | null = null
let cachedMap: Record<string, TileDefinition> | null = null

// ─── All hardcoded fallback tiles ────────────────────────────────────────────

const FALLBACK_TILES = () => [
  ...BASE1_TILES, ...BASE_TILES, ...BASE3_TILES, ...BASE_TILES_C3,
  ...IC1_TILES, ...IC2_TILES, ...IC_TILES, ...IC_C31_TILES,
  ...TB1_TILES, ...TB_TILES, ...TB3_TILES, ...TB_C31_TILES,
  ...DF_TILES,
]

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Load all tile definitions (base + expansions).
 * First call fetches from DB; subsequent calls return the cache.
 */
export async function loadAllTiles(): Promise<TileDefinition[]> {
    if (cachedTiles) return cachedTiles

    try {
        const dbTiles = await tileService.fetchAll()
        if (dbTiles.length > 0) {
            cachedTiles = dbTiles
            cachedMap = null
            return cachedTiles
        }
    } catch (e) {
        console.warn('[TileRegistry] DB fetch failed, using hardcoded fallback', e)
    }

    cachedTiles = FALLBACK_TILES()
    cachedMap = null
    return cachedTiles
}

/**
 * Load a tile_id → TileDefinition lookup map.
 */
export async function loadTileMap(): Promise<Record<string, TileDefinition>> {
    if (cachedMap) return cachedMap
    const tiles = await loadAllTiles()
    cachedMap = Object.fromEntries(tiles.map(t => [t.id, t]))
    return cachedMap
}

/**
 * Load only base-game tiles (C2 edition).
 */
export async function loadBaseTiles(): Promise<TileDefinition[]> {
    const tiles = await loadAllTiles()
    return tiles.filter(t => !t.expansionId || t.expansionId === 'base-c2')
}

/**
 * Load tiles for a specific versioned expansion ID (e.g. 'inns-cathedrals-c3').
 */
export async function loadExpansionTiles(expansionId: string): Promise<TileDefinition[]> {
    const tiles = await loadAllTiles()
    return tiles.filter(t => t.expansionId === expansionId)
}

/**
 * Get all hardcoded fallback tiles (synchronous, no DB).
 */
export function getFallbackTiles(): TileDefinition[] {
    return FALLBACK_TILES()
}

export function getFallbackBaseTiles(): TileDefinition[] {
    return BASE_TILES
}

export function getFallbackTileMap(): Record<string, TileDefinition> {
    return Object.fromEntries(FALLBACK_TILES().map(t => [t.id, t]))
}

/**
 * Clear the cache so the next call re-fetches from DB.
 */
export function invalidateCache(): void {
    cachedTiles = null
    cachedMap = null
}
