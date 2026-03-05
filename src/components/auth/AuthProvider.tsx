import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../supabaseClient.ts'

export interface Profile {
    id: string
    display_name: string
    avatar_url: string | null
}

export interface AuthContextType {
    user: User | null
    profile: Profile | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
    signInWithGoogle: () => Promise<{ error: string | null }>
    fetchProfile: (userId: string) => Promise<Profile | null>
}

export const AuthContext = createContext<AuthContextType | null>(null)

async function loadProfile(userId: string): Promise<Profile | null> {
    if (!supabase) return null
    const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', userId)
        .single()
    if (error || !data) return null
    return data as Profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    // Load session + profile on mount
    useEffect(() => {
        if (!supabase) {
            setLoading(false)
            return
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSession = async (session: Session | null) => {
        if (session?.user) {
            setUser(session.user)
            const p = await loadProfile(session.user.id)
            setProfile(p)
        } else {
            setUser(null)
            setProfile(null)
        }
    }

    const signIn = useCallback(async (email: string, password: string) => {
        if (!supabase) return { error: 'Supabase not configured' }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
    }, [])

    const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
        if (!supabase) return { error: 'Supabase not configured' }
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: displayName || email.split('@')[0] },
            },
        })
        return { error: error?.message ?? null }
    }, [])

    const signOut = useCallback(async () => {
        if (!supabase) return
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }, [])

    const signInWithGoogle = useCallback(async () => {
        if (!supabase) return { error: 'Supabase not configured' }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        })
        return { error: error?.message ?? null }
    }, [])

    const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
        return loadProfile(userId)
    }, [])

    return (
        <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, signInWithGoogle, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    )
}
