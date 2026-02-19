
import { createClient } from '@supabase/supabase-js'

const url = 'https://itblfdpuxdfdkcyiiocp.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YmxmZHB1eGRmZGtjeWlpb2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzQzNTQsImV4cCI6MjA4Njk1MDM1NH0.uO2C4bV_Uw_pekr98exAfow3ompPaxePSKkn5pRvLJE'

const supabase = createClient(url, key)

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
