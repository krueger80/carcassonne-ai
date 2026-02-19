
import { createClient } from '@supabase/supabase-js'
import { BASE_TILES } from '../src/core/data/baseTiles'
import { IC_TILES } from '../src/core/data/innsCathedralsTiles'

const url = 'https://itblfdpuxdfdkcyiiocp.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YmxmZHB1eGRmZGtjeWlpb2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzQzNTQsImV4cCI6MjA4Njk1MDM1NH0.uO2C4bV_Uw_pekr98exAfow3ompPaxePSKkn5pRvLJE'

const supabase = createClient(url, key)

async function run() {
  const tileId = process.argv[2]
  if (!tileId) {
    console.error("Please provide a tile ID as an argument (e.g. npx tsx scripts/reset-tile.ts base_H)")
    process.exit(1)
  }

  console.log(`Resetting tile ${tileId} to default definition from code...`)

  const allTiles = [...BASE_TILES, ...IC_TILES]
  const def = allTiles.find(t => t.id === tileId)
  
  if (!def) {
    console.error(`Tile ${tileId} not found in local code definitions (BASE_TILES or IC_TILES).`)
    process.exit(1)
  }

  const config = {
    segments: def.segments,
    edgePositionToSegment: def.edgePositionToSegment,
    startingTile: def.startingTile
  }
  
  const { error } = await supabase
    .from('carcassonne_tiles')
    .update({
       config,
       name: def.id, 
       image_url: def.imageUrl,
       count: def.count,
       expansion: def.expansionId
    })
    .eq('tile_id', tileId)
    
  if (error) {
    console.error("Update failed", error)
    process.exit(1)
  }
  
  console.log(`Success! Tile ${tileId} has been reset to its default code definition.`)
}

run()
