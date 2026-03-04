
import { supabase } from '../supabaseClient'
import type { TileDefinition } from '../core/types/tile'

export const tileService = {
    async fetchAll(): Promise<TileDefinition[]> {
        if (!supabase) throw new Error('Supabase not configured')

        const { data, error } = await supabase
            .from('carcassonne_tiles')
            .select('*')
            .order('tile_id')

        if (error) throw error
        if (!data) return []

        // Map DB rows to TileDefinition
        // Note: row.config is jsonb, already parsed by supabase-js into JS object
        return data.map((row: any) => ({
            id: row.tile_id,
            imageUrl: row.image_url,
            count: row.count,
            expansionId: row.expansion,
            version: row.version,
            // config merges in
            segments: row.config?.segments || [],
            edgePositionToSegment: row.config?.edgePositionToSegment || {},
            startingTile: row.config?.startingTile,
            isDragonHoard: row.config?.isDragonHoard || row.config?.isVolcano || row.config?.hasDragonHoard,
            hasDragon: row.config?.hasDragon,
            hasMagicPortal: row.config?.hasMagicPortal,
            adjacencies: row.config?.adjacencies,
            // Compound / river / flip fields (may be stored in config by upsert)
            linkedTiles: row.config?.linkedTiles,
            flipSideDefinitionId: row.config?.flipSideDefinitionId,
            imageConfig: row.config?.imageConfig,
        }))
    },

    async update(id: string, def: TileDefinition): Promise<void> {
        if (!supabase) throw new Error('Supabase not configured')

        const payload = buildPayload(def)

        const { error } = await supabase
            .from('carcassonne_tiles')
            .update(payload)
            .eq('tile_id', id)

        if (error) throw error
    },

    /** Insert or update a single tile (upsert by tile_id). */
    async upsert(def: TileDefinition): Promise<void> {
        if (!supabase) throw new Error('Supabase not configured')

        const { error } = await supabase
            .from('carcassonne_tiles')
            .upsert({ tile_id: def.id, ...buildPayload(def) }, { onConflict: 'tile_id' })

        if (error) throw error
    },

    /** Bulk upsert many tiles at once. */
    async upsertMany(defs: TileDefinition[]): Promise<void> {
        if (!supabase) throw new Error('Supabase not configured')

        const rows = defs.map(def => ({ tile_id: def.id, ...buildPayload(def) }))

        const { error } = await supabase
            .from('carcassonne_tiles')
            .upsert(rows, { onConflict: 'tile_id' })

        if (error) throw error
    },
}

function buildPayload(def: TileDefinition) {
    return {
        count: def.count,
        image_url: def.imageUrl,
        expansion: def.expansionId,
        config: {
            segments: def.segments,
            edgePositionToSegment: def.edgePositionToSegment,
            ...(def.startingTile != null && { startingTile: def.startingTile }),
            ...(def.isDragonHoard != null && { isDragonHoard: def.isDragonHoard }),
            ...(def.hasDragon != null && { hasDragon: def.hasDragon }),
            ...(def.hasMagicPortal != null && { hasMagicPortal: def.hasMagicPortal }),
            ...(def.adjacencies != null && { adjacencies: def.adjacencies }),
            ...(def.linkedTiles != null && { linkedTiles: def.linkedTiles }),
            ...(def.flipSideDefinitionId != null && { flipSideDefinitionId: def.flipSideDefinitionId }),
            ...(def.imageConfig != null && { imageConfig: def.imageConfig }),
        },
    }
}
