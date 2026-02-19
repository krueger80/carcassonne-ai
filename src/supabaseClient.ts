
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // It's possible import.meta.env returns empty in some test environments, 
    // but for vite dev/build it should work if .env is loaded.
    console.warn('Supabase URL or Key missing in VITE env vars. Check .env.local')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
