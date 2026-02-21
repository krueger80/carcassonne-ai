/**
 * Tile Registry: single source of truth for tile definitions.
 *
 * Loads tiles from the Supabase database first (via tileService).
 * Falls back to the hardcoded tile arrays if the DB is unreachable.
 * Caches the result in memory so subsequent calls are instant.
 */

import type { TileDefinition } from '../core/types/tile.ts'
import { tileService } from './tileService.ts'
import { BASE_TILES } from '../core/data/baseTiles.ts'
import { IC_TILES } from '../core/data/innsCathedralsTiles.ts'
import { TB_TILES } from '../core/data/tradersBuildersTiles.ts'
import { DF_TILES } from '../core/data/dragonFairyTiles.ts'

// ─── Cache ───────────────────────────────────────────────────────────────────

let cachedTiles: TileDefinition[] | null = null
let cachedMap: Record<string, TileDefinition> | null = null

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
            cachedMap = null // invalidate map cache
            return cachedTiles
        }
    } catch (e) {
        console.warn('[TileRegistry] DB fetch failed, using hardcoded fallback', e)
    }

    // Fallback to hardcoded definitions
    cachedTiles = [...BASE_TILES, ...IC_TILES, ...TB_TILES, ...DF_TILES]
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
 * Load only base-game tiles.
 */
export async function loadBaseTiles(): Promise<TileDefinition[]> {
    const tiles = await loadAllTiles()
    return tiles.filter(t => !t.expansionId || t.expansionId === 'base')
}

/**
 * Load tiles for a specific expansion.
 */
export async function loadExpansionTiles(expansionId: string): Promise<TileDefinition[]> {
    const tiles = await loadAllTiles()
    return tiles.filter(t => t.expansionId === expansionId)
}

/**
 * Get the hardcoded fallback tiles (synchronous, no DB).
 * Used by the engine and tests when no async context is available.
 */
export function getFallbackTiles(): TileDefinition[] {
    return [...BASE_TILES, ...IC_TILES, ...TB_TILES, ...DF_TILES]
}

export function getFallbackBaseTiles(): TileDefinition[] {
    return BASE_TILES
}

export function getFallbackTileMap(): Record<string, TileDefinition> {
    return Object.fromEntries([...BASE_TILES, ...IC_TILES, ...TB_TILES, ...DF_TILES].map(t => [t.id, t]))
}

/**
 * Clear the cache so the next call re-fetches from DB.
 */
export function invalidateCache(): void {
    cachedTiles = null
    cachedMap = null
}
