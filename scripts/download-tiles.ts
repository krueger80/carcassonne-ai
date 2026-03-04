import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { supabase } from './supabaseClient'
import type { TileDefinition } from '../src/core/types/tile'
import { BASE1_TILES } from '../src/core/data/baseTilesC1'
import { BASE_TILES } from '../src/core/data/baseTiles'
import { BASE3_TILES } from '../src/core/data/baseTilesC3'
import { IC2_TILES } from '../src/core/data/innsCathedralsTilesC2'
import { IC_TILES } from '../src/core/data/innsCathedralsTiles'
import { IC_C31_TILES } from '../src/core/data/innsCathedralsC31Tiles'
import { TB1_TILES } from '../src/core/data/tradersBuildersTilesC1'
import { TB_TILES } from '../src/core/data/tradersBuildersTiles'
import { TB3_TILES } from '../src/core/data/tradersBuildersTilesC3'
import { TB_C31_TILES } from '../src/core/data/tradersBuildersC31Tiles'
import { DF_TILES } from '../src/core/data/dragonFairyTiles'
import { RIVER_C3_TILES } from '../src/core/data/riverTilesC3'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const DATA_DIR = resolve(__dirname, '../src/core/data')

// Mapping from DB expansion string to the local filename and exported variable name
const EXPANSION_TO_FILE: Record<string, { filename: string, exportName: string }> = {
    'base-c1': { filename: 'baseTilesC1.ts', exportName: 'BASE1_TILES' },
    'base-c2': { filename: 'baseTiles.ts', exportName: 'BASE_TILES' },
    'base-c3': { filename: 'baseTilesC3.ts', exportName: 'BASE3_TILES' },

    'inns-cathedrals-c1': { filename: 'innsCathedralsTilesC1.ts', exportName: 'IC1_TILES' },
    'inns-cathedrals-c2': { filename: 'innsCathedralsTilesC2.ts', exportName: 'IC2_TILES' },
    'inns-cathedrals-c3': { filename: 'innsCathedralsTiles.ts', exportName: 'IC_TILES' },
    'inns-cathedrals-c31': { filename: 'innsCathedralsC31Tiles.ts', exportName: 'IC_C31_TILES' },

    'traders-builders-c1': { filename: 'tradersBuildersTilesC1.ts', exportName: 'TB1_TILES' },
    'traders-builders-c2': { filename: 'tradersBuildersTiles.ts', exportName: 'TB_TILES' },
    'traders-builders-c3': { filename: 'tradersBuildersTilesC3.ts', exportName: 'TB3_TILES' },
    'traders-builders-c31': { filename: 'tradersBuildersC31Tiles.ts', exportName: 'TB_C31_TILES' },

    'dragon-fairy-c31': { filename: 'dragonFairyTiles.ts', exportName: 'DF_TILES' },

    'river-c3': { filename: 'riverTilesC3.ts', exportName: 'RIVER_C3_TILES' },
}

// Clean up undefined/null values to make the generated file cleaner
function deepClean(obj: any): any {
    if (obj === null || obj === undefined) return undefined
    if (Array.isArray(obj)) return obj.map(deepClean).filter(v => v !== undefined)
    if (typeof obj === 'object') {
        const cleaned: any = {}
        for (const [k, v] of Object.entries(obj)) {
            const val = deepClean(v)
            if (val !== undefined && (typeof val !== 'object' || Object.keys(val).length > 0 || Array.isArray(val))) {
                cleaned[k] = val
            }
        }
        return cleaned
    }
    return obj
}

async function run() {
    console.log('Downloading all tiles from Supabase...')

    const fallbackTiles = [
        ...BASE1_TILES, ...BASE_TILES, ...BASE3_TILES,
        ...IC2_TILES, ...IC_TILES, ...IC_C31_TILES,
        ...TB1_TILES, ...TB_TILES, ...TB3_TILES, ...TB_C31_TILES,
        ...DF_TILES,
        ...RIVER_C3_TILES,
    ]
    const localTileMap = Object.fromEntries(fallbackTiles.map(t => [t.id, t]))

    // Inline fetcher using supabase-js directly to avoid import.meta.env from src/supabaseClient.ts
    const { data: rawData, error } = await supabase
        .from('carcassonne_tiles')
        .select('*')
        .order('tile_id')

    if (error) {
        console.error('Error fetching tiles:', error)
        process.exit(1)
    }

    const allTiles = rawData.map((row: any) => {
        const id = row.tile_id
        const local = localTileMap[id] || {} as any

        return {
            id,
            imageUrl: row.image_url,
            count: row.count,
            expansionId: row.expansion,
            version: row.version,
            segments: row.config?.segments || [],
            edgePositionToSegment: row.config?.edgePositionToSegment || {},
            startingTile: row.config?.startingTile ?? local.startingTile,
            isDragonHoard: row.config?.isDragonHoard || row.config?.isVolcano || row.config?.hasDragonHoard || local.isDragonHoard,
            hasDragon: row.config?.hasDragon ?? local.hasDragon,
            hasMagicPortal: row.config?.hasMagicPortal ?? local.hasMagicPortal,
            adjacencies: row.config?.adjacencies,

            // Critical: the DB configurator doesn't support these compound fields, 
            // so we must preserve them from the hardcoded ts files!
            linkedTiles: row.config?.linkedTiles ?? local.linkedTiles,
            flipSideDefinitionId: row.config?.flipSideDefinitionId ?? local.flipSideDefinitionId,
            imageConfig: row.config?.imageConfig ?? local.imageConfig,
        }
    })

    console.log(`Fetched ${allTiles.length} tiles.`)

    // Group by expansion
    const groupedTiles: Record<string, TileDefinition[]> = {}
    for (const tile of allTiles) {
        // Fallback for empty expansions
        const exp = tile.expansionId || 'base-c2'
        if (!groupedTiles[exp]) groupedTiles[exp] = []
        // Clean up the tile object visually
        groupedTiles[exp].push(deepClean(tile))
    }

    // Write to TS files
    for (const [expansion, tiles] of Object.entries(groupedTiles)) {
        const mapping = EXPANSION_TO_FILE[expansion]
        if (!mapping) {
            console.warn(`⚠️ Warning: No mapping found for expansion "${expansion}", skipping ${tiles.length} tiles.`)
            continue
        }

        const outPath = resolve(DATA_DIR, mapping.filename)
        const tsContent = `import type { TileDefinition } from '../types/tile.ts'

/** 
 * AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * Generated by \`npm run download-tiles\` (scripts/download-tiles.ts)
 * Expansions: ${expansion}
 */
export const ${mapping.exportName}: TileDefinition[] = ${JSON.stringify(tiles, null, 2)}
`
        writeFileSync(outPath, tsContent, 'utf-8')
        console.log(`✅ Wrote ${tiles.length} tiles to ${mapping.filename}`)
    }

    console.log('\n🎉 Done.')
}

run().catch(console.error)
