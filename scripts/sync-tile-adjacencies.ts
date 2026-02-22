
import { supabase } from './supabaseClient'
import { IC_TILES } from '../src/core/data/innsCathedralsTiles'
import { DF_TILES } from '../src/core/data/dragonFairyTiles'
import type { TileDefinition } from '../src/core/types/tile'

async function updateAdjacencies() {
    const codeTiles: TileDefinition[] = [...IC_TILES, ...DF_TILES]
    const targets = codeTiles.filter(t => t.adjacencies && t.adjacencies.length > 0)

    console.log(`Checking ${targets.length} tiles for adjacency updates...`)

    for (const t of targets) {
        // 1. Fetch current config from DB
        const { data, error } = await supabase
            .from('carcassonne_tiles')
            .select('config')
            .eq('tile_id', t.id)
            .single()

        if (error) {
            console.warn(`Could not fetch ${t.id} from DB, skipping.`)
            continue
        }

        const currentConfig = data.config || {}
        
        // 2. Add or update adjacencies while preserving everything else
        // Only add adjacencies where both segments exist in the DB record
        const dbSegments = currentConfig.segments || []
        const validAdjacencies = (t.adjacencies || []).filter(([a, b]) => {
            const hasA = dbSegments.some((s: any) => s.id === a)
            const hasB = dbSegments.some((s: any) => s.id === b)
            return hasA && hasB
        })

        if (validAdjacencies.length === 0 && (t.adjacencies || []).length > 0) {
            console.log(`Skipping ${t.id}: segment ID mismatch (DB has: ${dbSegments.map((s: any) => s.id).join(', ')})`)
            continue
        }

        console.log(`Updating ${validAdjacencies.length} adjacencies for ${t.id}...`)
        
        const nextConfig = {
            ...currentConfig,
            adjacencies: validAdjacencies
        }

        const { error: updateError } = await supabase
            .from('carcassonne_tiles')
            .update({ config: nextConfig })
            .eq('tile_id', t.id)

        if (updateError) {
            console.error(`Update failed for ${t.id}:`, updateError)
        } else {
            console.log(`Successfully updated ${t.id}`)
        }
    }
}

updateAdjacencies().catch(console.error)
