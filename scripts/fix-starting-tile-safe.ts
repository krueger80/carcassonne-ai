
import { supabase } from './supabaseClient'

async function run() {
    console.log("Restoring startingTile flag for base_D while preserving edits...")

    const { data, error } = await supabase
        .from('carcassonne_tiles')
        .select('config')
        .eq('tile_id', 'base_D')
        .single()

    if (error) {
        console.error("Failed to fetch base_D", error)
        process.exit(1)
    }

    const config = data.config || {}

    if (config.startingTile) {
        console.log("startingTile is ALREADY true. No update needed.")
        return
    }

    config.startingTile = true

    const { error: updateError } = await supabase
        .from('carcassonne_tiles')
        .update({ config })
        .eq('tile_id', 'base_D')

    if (updateError) {
        console.error("Update failed", updateError)
        process.exit(1)
    }

    console.log("Success! base_D is now a starting tile again.")
}

run()
