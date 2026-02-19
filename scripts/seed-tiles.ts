
import { createClient } from '@supabase/supabase-js'
import { BASE_TILES } from '../src/core/data/baseTiles'
import { IC_TILES } from '../src/core/data/innsCathedralsTiles'
import type { TileDefinition } from '../src/core/types/tile'

const SUPABASE_URL = 'https://itblfdpuxdfdkcyiiocp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YmxmZHB1eGRmZGtjeWlpb2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzQzNTQsImV4cCI6MjA4Njk1MDM1NH0.uO2C4bV_Uw_pekr98exAfow3ompPaxePSKkn5pRvLJE'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function seed() {
    const allTiles: TileDefinition[] = [...BASE_TILES, ...IC_TILES]

    console.log(`Seeding ${allTiles.length} tiles into new carcassonne-ai-dev...`)

    for (const t of allTiles) {
        const { error } = await supabase.from('carcassonne_tiles').upsert({
            tile_id: t.id,
            name: t.id, // User can rename later
            image_url: t.imageUrl,
            count: t.count,
            expansion: t.expansionId || 'base',
            config: {
                segments: t.segments,
                edgePositionToSegment: t.edgePositionToSegment
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
