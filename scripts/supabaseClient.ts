/**
 * Shared Supabase client for CLI scripts.
 * Reads credentials from .env.local via dotenv.
 */
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
    process.exit(1)
}

export const supabase = createClient(url, key)
