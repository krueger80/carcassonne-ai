
import { supabase } from './supabaseClient'
import { BASE_TILES } from '../src/core/data/baseTiles'
import { IC_TILES } from '../src/core/data/innsCathedralsTiles'
import { TB_TILES } from '../src/core/data/tradersBuildersTiles'
import { DF_TILES } from '../src/core/data/dragonFairyTiles'
import type { TileDefinition } from '../src/core/types/tile'

async function seed() {
    const allTiles: TileDefinition[] = [...BASE_TILES, ...IC_TILES, ...TB_TILES, ...DF_TILES]

    console.log(`Seeding ${allTiles.length} tiles into new carcassonne-ai-dev...`)

    for (const t of allTiles) {
        const { error } = await supabase.from('carcassonne_tiles').upsert({
            tile_id: t.id,
            image_url: t.imageUrl,
            count: t.count,
            expansion: t.expansionId || 'base',
            config: {
                segments: t.segments,
                edgePositionToSegment: t.edgePositionToSegment,
                ...(t.startingTile != null && { startingTile: t.startingTile }),
                ...(t.isVolcano != null && { isVolcano: t.isVolcano }),
                ...(t.hasDragonHoard != null && { hasDragonHoard: t.hasDragonHoard }),
                ...(t.hasMagicPortal != null && { hasMagicPortal: t.hasMagicPortal }),
            }
        }, { onConflict: 'tile_id' })

        if (error) {
            console.error(`Error upserting ${t.id}:`, error)
        } else {
            console.log(`Upserted ${t.id}`)
        }
    }
}

seed().catch(console.error)
