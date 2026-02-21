
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
            // config merges in
            segments: row.config?.segments || [],
            edgePositionToSegment: row.config?.edgePositionToSegment || {},
            startingTile: row.config?.startingTile,
            isVolcano: row.config?.isVolcano,
            hasDragonHoard: row.config?.hasDragonHoard,
            hasMagicPortal: row.config?.hasMagicPortal,
        }))
    },

    async update(id: string, def: TileDefinition): Promise<void> {
        if (!supabase) throw new Error('Supabase not configured')

        const payload = {
            count: def.count,
            image_url: def.imageUrl,
            expansion: def.expansionId,
            config: {
                segments: def.segments,
                edgePositionToSegment: def.edgePositionToSegment,
                ...(def.startingTile != null && { startingTile: def.startingTile }),
                ...(def.isVolcano != null && { isVolcano: def.isVolcano }),
                ...(def.hasDragonHoard != null && { hasDragonHoard: def.hasDragonHoard }),
                ...(def.hasMagicPortal != null && { hasMagicPortal: def.hasMagicPortal }),
            }
        }

        const { error } = await supabase
            .from('carcassonne_tiles')
            .update(payload)
            .eq('tile_id', id)

        if (error) throw error
    }
}
