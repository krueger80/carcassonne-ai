
import { supabase } from './supabaseClient'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function restore() {
    // Read the cached game state
    const cachePath = path.resolve(__dirname, '../temp/cache_game.txt')
    const raw = fs.readFileSync(cachePath, 'utf-8')
    const cacheData = JSON.parse(raw)

    // Extract staticTileMap from the cached state
    const staticTileMap = cacheData?.state?.gameState?.staticTileMap
        ?? cacheData?.state?.staticTileMap
        ?? cacheData?.staticTileMap
    if (!staticTileMap) {
        console.error('Could not find staticTileMap in cached data!')
        console.error('Top-level keys:', Object.keys(cacheData))
        if (cacheData?.state) console.error('state keys:', Object.keys(cacheData.state))
        if (cacheData?.state?.gameState) console.error('gameState keys:', Object.keys(cacheData.state.gameState))
        process.exit(1)
    }

    const tileIds = Object.keys(staticTileMap)
    console.log(`Found ${tileIds.length} tiles in cached staticTileMap`)
    console.log(`Tile IDs: ${tileIds.join(', ')}`)

    let success = 0
    let errors = 0

    for (const tileId of tileIds) {
        const tile = staticTileMap[tileId]

        const config: Record<string, any> = {
            segments: tile.segments,
            edgePositionToSegment: tile.edgePositionToSegment,
        }

        // Preserve optional D&F flags
        if (tile.startingTile != null) config.startingTile = tile.startingTile
        if (tile.isDragonHoard != null || tile.isVolcano != null || tile.hasDragonHoard != null) {
            config.isDragonHoard = tile.isDragonHoard || tile.isVolcano || tile.hasDragonHoard
        }
        if (tile.hasDragon != null) config.hasDragon = tile.hasDragon
        if (tile.hasMagicPortal != null) config.hasMagicPortal = tile.hasMagicPortal

        const { error } = await supabase.from('carcassonne_tiles').upsert({
            tile_id: tile.id,
            image_url: tile.imageUrl,
            count: tile.count,
            expansion: tile.expansionId || 'base',
            config
        }, { onConflict: 'tile_id' })

        if (error) {
            console.error(`Error upserting ${tileId}:`, error)
            errors++
        } else {
            console.log(`Restored ${tileId}`)
            success++
        }
    }

    console.log(`\nDone! Restored ${success} tiles, ${errors} errors.`)
}

restore().catch(console.error)
