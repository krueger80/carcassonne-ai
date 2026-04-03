import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth.ts'
import { LoginModal } from './LoginModal.tsx'

export function UserBadge() {
    const { t } = useTranslation()
    const { user, profile, loading, signOut } = useAuth()
    const [showLogin, setShowLogin] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    if (loading) return null

    if (!user) {
        return (
            <>
                <button
                    onClick={() => setShowLogin(true)}
                    style={{
                        background: 'rgba(200,164,110,0.12)',
                        border: '1px solid rgba(200,164,110,0.3)',
                        color: '#c8a46e',
                        borderRadius: 20,
                        padding: '5px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}
                >
                    <span style={{ fontSize: 14 }}>👤</span> {t('auth.signIn')}
                </button>
                {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            </>
        )
    }

    const displayName = profile?.display_name || user.email?.split('@')[0] || t('auth.user')
    const initial = displayName[0]?.toUpperCase() || '?'

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                    background: 'rgba(200,164,110,0.12)',
                    border: '1px solid rgba(200,164,110,0.3)',
                    color: '#e8d8a0',
                    borderRadius: 20,
                    padding: '4px 12px 4px 4px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}
            >
                {profile?.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt=""
                        style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(200,164,110,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 'bold', color: '#c8a46e',
                    }}>
                        {initial}
                    </div>
                )}
                {displayName}
            </button>

            {showMenu && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 149 }}
                        onClick={() => setShowMenu(false)}
                    />
                    <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 6,
                        background: '#2a2a40', border: '1px solid #444', borderRadius: 10,
                        padding: 6, minWidth: 140, zIndex: 150,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}>
                        <div style={{ padding: '6px 12px', fontSize: 11, color: '#888', borderBottom: '1px solid #333' }}>
                            {user.email}
                        </div>
                        <button
                            onClick={() => { window.location.hash = '#stats'; setShowMenu(false) }}
                            style={menuItemStyle}
                        >
                            📊 {t('auth.myStats')}
                        </button>
                        <button
                            onClick={() => { signOut(); setShowMenu(false) }}
                            style={{ ...menuItemStyle, color: '#e74c3c' }}
                        >
                            🚪 {t('auth.signOut')}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

const menuItemStyle: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left',
    background: 'transparent', border: 'none', color: '#ccc',
    padding: '8px 12px', fontSize: 13, cursor: 'pointer',
    borderRadius: 6,
}
