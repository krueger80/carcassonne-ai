import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth.ts'
import { LoginModal } from '../auth/LoginModal.tsx'
import { getMyStats, getRecentGames, getLeaderboard, type PlayerStat, type RecentGame, type LeaderboardEntry } from '../../services/gameResultsService.ts'

type ViewTab = 'MY_STATS' | 'LEADERBOARD'

export function StatsView() {
    const { t } = useTranslation()
    const { user, profile, loading: authLoading } = useAuth()
    const [activeTab, setActiveTab] = useState<ViewTab>('MY_STATS')

    // My Stats state
    const [stats, setStats] = useState<PlayerStat | null>(null)
    const [games, setGames] = useState<RecentGame[]>([])

    // Leaderboard state
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

    const [loading, setLoading] = useState(true)
    const [showLogin, setShowLogin] = useState(false)

    useEffect(() => {
        if (activeTab === 'MY_STATS') {
            if (!user) { setLoading(false); return }
            setLoading(true)
            Promise.all([
                getMyStats(user.id),
                getRecentGames(user.id, 20),
            ]).then(([s, g]) => {
                setStats(s)
                setGames(g)
            }).finally(() => setLoading(false))
        } else {
            setLoading(true)
            getLeaderboard().then(data => {
                setLeaderboard(data)
            }).finally(() => setLoading(false))
        }
    }, [user, activeTab])

    if (authLoading) return null

    const tabStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '10px 20px',
        cursor: 'pointer',
        borderBottom: isActive ? '3px solid #e8d8a0' : '3px solid transparent',
        color: isActive ? '#e8d8a0' : '#888',
        fontWeight: isActive ? 'bold' : 'normal',
        transition: 'all 0.2s',
        fontSize: 15,
    })

    return (
        <div style={{
            minHeight: '100dvh', background: '#1a1a2e', color: '#f0f0f0',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '40px 16px',
        }}>
            <div style={{ width: '100%', maxWidth: 650 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: 14 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#888')}>
                        ← Back to Game
                    </a>
                    <h1 style={{ margin: 0, color: '#e8d8a0', fontFamily: 'serif', fontSize: 28 }}>
                        📊 Statistics
                    </h1>
                    <div style={{ width: 48 }} />
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 32, borderBottom: '1px solid #333' }}>
                    <div style={tabStyle(activeTab === 'MY_STATS')} onClick={() => setActiveTab('MY_STATS')}>{t('stats.myStats')}</div>
                    <div style={tabStyle(activeTab === 'LEADERBOARD')} onClick={() => setActiveTab('LEADERBOARD')}>{t('stats.leaderboard')}</div>
                </div>

                {activeTab === 'MY_STATS' ? (
                    !user ? (
                        <div style={{ textAlign: 'center', padding: 40, background: '#252535', borderRadius: 16, border: '1px solid #333' }}>
                            <p style={{ color: '#888', marginBottom: 20 }}>Sign in to see your personalized game statistics and history</p>
                            <button
                                onClick={() => setShowLogin(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #c8a46e, #a07840)',
                                    color: '#1a1a2e', border: 'none', borderRadius: 8,
                                    padding: '12px 32px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(200,164,110,0.3)',
                                }}
                            >
                                Sign In
                            </button>
                            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
                        </div>
                    ) : loading ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>Loading your stats...</p>
                    ) : (
                        <>
                            {/* Profile */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
                                padding: '16px 20px', background: '#252535', borderRadius: 12, border: '1px solid #444',
                            }}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                                ) : (
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,164,110,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 22, fontWeight: 'bold', color: '#c8a46e',
                                    }}>
                                        {(profile?.display_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#e8d8a0' }}>
                                        {profile?.display_name || 'Logged Player'}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#888' }}>{user.email}</div>
                                </div>
                            </div>

                            {/* Stats cards */}
                            {stats ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
                                    {[
                                        { label: 'Games', value: stats.total_games, icon: '🎮' },
                                        { label: 'Wins', value: stats.wins, icon: '🏆' },
                                        { label: 'Win Rate', value: `${stats.win_rate}%`, icon: '📈' },
                                        { label: 'Avg Score', value: stats.avg_score, icon: '⭐' },
                                    ].map(card => (
                                        <div key={card.label} style={{
                                            background: '#252535', border: '1px solid #444', borderRadius: 12,
                                            padding: '16px 12px', textAlign: 'center',
                                        }}>
                                            <div style={{ fontSize: 20, marginBottom: 4 }}>{card.icon}</div>
                                            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#e8d8a0' }}>{card.value}</div>
                                            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{card.label}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center', padding: 32, background: '#252535',
                                    borderRadius: 12, border: '1px solid #444', marginBottom: 32,
                                }}>
                                    <p style={{ color: '#888', fontSize: 14 }}>{t('stats.noGamesPlayed')}</p>
                                    <p style={{ color: '#666', fontSize: 12 }}>{t('stats.playWithLinked')}</p>
                                </div>
                            )}

                            {/* Recent games */}
                            <h3 style={{ color: '#e8d8a0', fontFamily: 'serif', marginBottom: 16 }}>{t('stats.recentGames')}</h3>
                            {games.length === 0 ? (
                                <p style={{ color: '#888', fontSize: 13 }}>{t('stats.noRecentGames')}</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {games.map(game => (
                                        <div key={game.id} style={{
                                            background: '#252535', border: '1px solid #444', borderRadius: 10,
                                            padding: '12px 16px',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <span style={{ fontSize: 12, color: '#888' }}>
                                                    {new Date(game.played_at).toLocaleDateString()} · {game.player_count} {t('stats.players')}
                                                </span>
                                                {game.expansions.length > 0 && (
                                                    <span style={{ fontSize: 11, color: '#666' }}>
                                                        {game.expansions.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                {(game.player_results || [])
                                                    .sort((a, b) => a.rank - b.rank)
                                                    .map((pr, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                                            <span>{pr.rank === 1 ? '🥇' : pr.rank === 2 ? '🥈' : pr.rank === 3 ? '🥉' : `#${pr.rank}`}</span>
                                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: pr.player_color }} />
                                                            <span style={{
                                                                color: pr.profile_id === user.id ? '#e8d8a0' : '#ccc',
                                                                fontWeight: pr.profile_id === user.id ? 'bold' : 'normal',
                                                            }}>
                                                                {pr.player_name}
                                                            </span>
                                                            <span style={{ color: '#888' }}>{pr.score} {t('stats.pts')}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )
                ) : (
                    /* Leaderboard View */
                    loading ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>{t('stats.loadingRankings')}</p>
                    ) : (
                        <div style={{ background: '#252535', borderRadius: 16, border: '1px solid #444', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#2a2a3a' }}>
                                    <tr>
                                        <th style={{ padding: '16px', textAlign: 'center', color: '#888', fontWeight: 'normal', width: 60 }}>{t('stats.rank')}</th>
                                        <th style={{ padding: '16px', textAlign: 'left', color: '#888', fontWeight: 'normal' }}>{t('stats.player')}</th>
                                        <th style={{ padding: '16px', textAlign: 'center', color: '#888', fontWeight: 'normal' }}>{t('stats.wins')}</th>
                                        <th style={{ padding: '16px', textAlign: 'center', color: '#888', fontWeight: 'normal' }}>{t('stats.games')}</th>
                                        <th style={{ padding: '16px', textAlign: 'center', color: '#888', fontWeight: 'normal' }}>{t('stats.winPct')}</th>
                                        <th style={{ padding: '16px', textAlign: 'center', color: '#888', fontWeight: 'normal' }}>{t('stats.avg')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                                                {t('stats.noPlayersOnLeaderboard')}
                                            </td>
                                        </tr>
                                    ) : (
                                        leaderboard.map((entry, idx) => (
                                            <tr key={entry.profile_id} style={{ borderTop: '1px solid #333', background: entry.profile_id === user?.id ? 'rgba(232,216,160,0.05)' : 'transparent' }}>
                                                <td style={{ padding: '16px', textAlign: 'center', fontSize: 18 }}>
                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        {entry.avatar_url ? (
                                                            <img src={entry.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                                                        ) : (
                                                            <div style={{
                                                                width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#888'
                                                            }}>
                                                                {entry.display_name[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span style={{
                                                            fontWeight: entry.profile_id === user?.id ? 'bold' : 'normal',
                                                            color: entry.profile_id === user?.id ? '#e8d8a0' : '#f0f0f0'
                                                        }}>
                                                            {entry.display_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#e8d8a0' }}>{entry.wins}</td>
                                                <td style={{ padding: '16px', textAlign: 'center' }}>{entry.total_games}</td>
                                                <td style={{ padding: '16px', textAlign: 'center' }}>{entry.win_rate}%</td>
                                                <td style={{ padding: '16px', textAlign: 'center', color: '#aaa' }}>{entry.avg_score}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

