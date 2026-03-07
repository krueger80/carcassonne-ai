import { supabase } from '../supabaseClient.ts'
import type { Player } from '../core/types/player.ts'

export interface LinkedProfile {
    profileId: string
    displayName: string
    avatarUrl?: string | null
}

/** Map of player.id → linked profile info (set during setup) */
export type LinkedProfileMap = Record<string, LinkedProfile>

export interface GameResultInput {
    players: Player[]
    expansions: string[]
    baseEdition: string
    linkedProfiles: LinkedProfileMap
    durationSeconds?: number
}

export interface PlayerStat {
    total_games: number
    wins: number
    avg_score: number
    win_rate: number
}

export interface LeaderboardEntry extends PlayerStat {
    profile_id: string
    display_name: string
    avatar_url: string | null
}

export interface RecentGame {
    id: string
    played_at: string
    player_count: number
    expansions: string[]
    base_edition: string
    player_results: {
        player_name: string
        player_color: string
        rank: number
        score: number
        profile_id: string | null
    }[]
}

/**
 * Save a completed game's results to Supabase.
 * Requires an active authenticated session (the device owner).
 */
export async function saveGameResult(input: GameResultInput): Promise<{ id: string } | null> {
    if (!supabase) return null

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Sort players by score descending to determine rank
    const ranked = [...input.players].sort((a, b) => b.score - a.score)

    // Insert game result
    const { data: gameResult, error: gameError } = await supabase
        .from('game_results')
        .insert({
            player_count: input.players.length,
            expansions: input.expansions,
            base_edition: input.baseEdition,
            duration_seconds: input.durationSeconds ?? null,
            created_by: user.id,
        })
        .select('id')
        .single()

    if (gameError || !gameResult) {
        console.error('Failed to save game result:', gameError)
        return null
    }

    // Insert player results
    const playerRows = ranked.map((player, idx) => ({
        game_result_id: gameResult.id,
        player_name: player.name,
        player_color: player.color,
        rank: idx + 1,
        score: player.score,
        score_road: player.scoreBreakdown?.ROAD ?? 0,
        score_city: player.scoreBreakdown?.CITY ?? 0,
        score_cloister: player.scoreBreakdown?.CLOISTER ?? 0,
        score_field: player.scoreBreakdown?.FIELD ?? 0,
        score_trader: player.scoreBreakdown?.TRADER ?? 0,
        profile_id: input.linkedProfiles[player.id]?.profileId ?? null,
    }))

    const { error: playerError } = await supabase
        .from('player_results')
        .insert(playerRows)

    if (playerError) {
        console.error('Failed to save player results:', playerError)
    }

    return { id: gameResult.id }
}

/**
 * Get aggregated stats for a user.
 */
export async function getMyStats(userId: string): Promise<PlayerStat | null> {
    if (!supabase) return null

    const { data, error } = await supabase
        .from('player_results')
        .select('score, rank')
        .eq('profile_id', userId)

    if (error || !data || data.length === 0) return null

    const totalGames = data.length
    const wins = data.filter(r => r.rank === 1).length
    const avgScore = Math.round(data.reduce((sum, r) => sum + r.score, 0) / totalGames)

    return {
        total_games: totalGames,
        wins,
        avg_score: avgScore,
        win_rate: Math.round((wins / totalGames) * 100),
    }
}

/**
 * Get recent games for a user.
 */
export async function getRecentGames(userId: string, limit = 20): Promise<RecentGame[]> {
    if (!supabase) return []

    // Get game IDs where user participated
    const { data: myResults, error: myError } = await supabase
        .from('player_results')
        .select('game_result_id')
        .eq('profile_id', userId)
        .order('game_result_id', { ascending: false })

    if (myError || !myResults) return []

    const gameIds = [...new Set(myResults.map(r => r.game_result_id))].slice(0, limit)
    if (gameIds.length === 0) return []

    const { data: games, error: gamesError } = await supabase
        .from('game_results')
        .select(`
      id, played_at, player_count, expansions, base_edition,
      player_results ( player_name, player_color, rank, score, profile_id )
    `)
        .in('id', gameIds)
        .order('played_at', { ascending: false })

    if (gamesError || !games) return []

    return games as unknown as RecentGame[]
}

/**
 * Get the global leaderboard.
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!supabase) return []

    // Fetch all tied player results that have a profile_id
    const { data: results, error: resultsError } = await supabase
        .from('player_results')
        .select('profile_id, score, rank')
        .not('profile_id', 'is', null)

    if (resultsError || !results) return []

    // Group by profile_id
    const statsMap: Record<string, { total: number; wins: number; totalScore: number }> = {}
    for (const r of results) {
        const id = r.profile_id as string
        if (!statsMap[id]) statsMap[id] = { total: 0, wins: 0, totalScore: 0 }
        statsMap[id].total++
        if (r.rank === 1) statsMap[id].wins++
        statsMap[id].totalScore += r.score
    }

    // Fetch profile info for these users
    const userIds = Object.keys(statsMap)
    if (userIds.length === 0) return []

    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds)

    if (profilesError || !profiles) return []

    const leaderboard: LeaderboardEntry[] = profiles
        .filter(p => statsMap[p.id])
        .map(p => {
            const s = statsMap[p.id]
            return {
                profile_id: p.id,
                display_name: p.display_name || 'Anonymous',
                avatar_url: p.avatar_url,
                total_games: s.total,
                wins: s.wins,
                avg_score: Math.round(s.totalScore / s.total),
                win_rate: Math.round((s.wins / s.total) * 100),
            }
        })

    // Sort by wins (primary) then win_rate (secondary)
    return leaderboard.sort((a, b) => b.wins - a.wins || b.win_rate - a.win_rate)
}

