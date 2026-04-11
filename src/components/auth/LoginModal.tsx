import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './useAuth.ts'
import type { Profile } from './AuthProvider.tsx'

interface LoginModalProps {
    /** When true, modal captures profile and signs out so next player can link */
    linkMode?: boolean
    onClose: () => void
    onLinked?: (profile: Profile) => void
}

type Tab = 'signin' | 'signup'

export function LoginModal({ linkMode = false, onClose, onLinked }: LoginModalProps) {
    const { t } = useTranslation()
    const { signIn, signUp, signInWithGoogle, signOut, fetchProfile, user } = useAuth()
    const [tab, setTab] = useState<Tab>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setBusy(true)

        try {
            if (tab === 'signin') {
                const { error: err } = await signIn(email, password)
                if (err) { setError(err); setBusy(false); return }
            } else {
                const { error: err } = await signUp(email, password, displayName || undefined)
                if (err) { setError(err); setBusy(false); return }
                // Some setups require email confirmation
                setSuccess('Account created! Check your email to confirm, then sign in.')
                setTab('signin')
                setBusy(false)
                return
            }

            if (linkMode && onLinked) {
                // In link mode: grab profile, call back, then sign out
                // Need a brief delay for the session to settle
                await new Promise(r => setTimeout(r, 300))
                const { supabase } = await import('../../supabaseClient.ts')
                const session = await supabase?.auth.getSession()
                const userId = session?.data.session?.user.id
                if (userId) {
                    const profile = await fetchProfile(userId)
                    if (profile) {
                        onLinked(profile)
                    }
                }
                await signOut()
            }
            onClose()
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setBusy(false)
        }
    }

    const handleGoogle = async () => {
        setError(null)
        const { error: err } = await signInWithGoogle({ promptSelectAccount: linkMode })
        if (err) setError(err)
        // OAuth redirects, so modal closes on redirect
    }

    // Auto-finalize linking when returning from OAuth redirect
    // If the modal mounts in linkMode and there's ALREADY a user logged in, we finalize.
    const oauthProcessed = useRef(false)

    useEffect(() => {
        if (linkMode && user && onLinked && !busy && !oauthProcessed.current) {
            oauthProcessed.current = true
            setBusy(true)
            const finishOAuthLink = async () => {
                try {
                    const profile = await fetchProfile(user.id)
                    if (profile) onLinked(profile)
                    await signOut() // sign out the linked user so the browser doesn't falsely retain their session as primary
                    onClose()
                } catch (e: any) {
                    setError(e.message || 'Failed to complete linking')
                } finally {
                    setBusy(false)
                }
            }
            finishOAuthLink()
        }
    }, [user, linkMode, onLinked, busy, fetchProfile, signOut, onClose])

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
                padding: 16,
            }}
            onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                    background: '#252535',
                    border: '1px solid #444',
                    borderRadius: 16,
                    padding: 28,
                    width: '100%',
                    maxWidth: 380,
                    color: '#f0f0f0',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                onPointerDown={e => e.stopPropagation()}
            >
                {/* Header */}
                <h2 style={{ margin: '0 0 4px', color: '#e8d8a0', fontFamily: 'serif', fontSize: 24, textAlign: 'center' }}>
                    {linkMode ? `🔗 ${t('auth.linkAccount')}` : `🏰 ${t('auth.welcome')}`}
                </h2>
                {linkMode && (
                    <p style={{ color: '#888', fontSize: 12, textAlign: 'center', margin: '0 0 16px' }}>
                        {t('auth.signInToLink')}
                    </p>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 8, overflow: 'hidden', border: '1px solid #444' }}>
                    {(['signin', 'signup'] as Tab[]).map(t_tab => (
                        <button
                            key={t_tab}
                            onClick={() => { setTab(t_tab); setError(null); setSuccess(null) }}
                            style={{
                                flex: 1, padding: '9px 0', border: 'none',
                                background: tab === t_tab ? 'rgba(200,164,110,0.15)' : 'transparent',
                                color: tab === t_tab ? '#e8d8a0' : '#888',
                                fontSize: 13, fontWeight: tab === t_tab ? 700 : 400,
                                cursor: 'pointer',
                                borderBottom: tab === t_tab ? '2px solid #c8a46e' : '2px solid transparent',
                            }}
                        >
                            {t_tab === 'signin' ? t('auth.signIn') : t('auth.signUp')}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <AnimatePresence mode="wait">
                        {tab === 'signup' && (
                            <motion.div
                                key="name"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.12 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <input
                                    type="text"
                                    placeholder={t('auth.displayName')}
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    style={inputStyle}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <input
                        type="email"
                        placeholder={t('auth.email')}
                        value={email}
                        required
                        onChange={e => setEmail(e.target.value)}
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        placeholder={t('auth.password')}
                        value={password}
                        required
                        minLength={6}
                        onChange={e => setPassword(e.target.value)}
                        style={inputStyle}
                    />

                    {error && (
                        <div style={{ color: '#e74c3c', fontSize: 12, padding: '6px 10px', background: 'rgba(231,76,60,0.1)', borderRadius: 6 }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ color: '#2ecc71', fontSize: 12, padding: '6px 10px', background: 'rgba(46,204,113,0.1)', borderRadius: 6 }}>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={busy}
                        style={{
                            padding: '11px 0', borderRadius: 8, border: 'none',
                            background: busy ? '#555' : 'linear-gradient(135deg, #c8a46e, #a07840)',
                            color: '#1a1a2e', fontSize: 15, fontWeight: 'bold',
                            cursor: busy ? 'wait' : 'pointer',
                            opacity: busy ? 0.7 : 1,
                        }}
                    >
                        {busy ? '...' : tab === 'signin' ? t('auth.signIn') : t('auth.createAccount')}
                    </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                    <div style={{ flex: 1, height: 1, background: '#444' }} />
                    <span style={{ color: '#666', fontSize: 11 }}>{t('auth.or')}</span>
                    <div style={{ flex: 1, height: 1, background: '#444' }} />
                </div>

                {/* Google OAuth */}
                <button
                    onClick={handleGoogle}
                    style={{
                        width: '100%', padding: '10px 0', borderRadius: 8,
                        border: '1px solid #555', background: 'rgba(255,255,255,0.06)',
                        color: '#ccc', fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.9 23.9 0 000 24c0 3.77.9 7.35 2.56 10.56l7.97-5.97z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" /></svg>
                    {t('auth.continueWithGoogle')}
                </button>

                {/* Cancel */}
                <button
                    onClick={onClose}
                    style={{
                        width: '100%', marginTop: 12, padding: '9px 0', borderRadius: 8,
                        border: '1px solid #444', background: 'transparent',
                        color: '#888', fontSize: 13, cursor: 'pointer',
                    }}
                >
                    {t('setup.cancel')}
                </button>
            </motion.div>
        </div>
    )
}

const inputStyle: React.CSSProperties = {
    background: '#1a1a2e',
    border: '1px solid #444',
    color: '#f0f0f0',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
}
