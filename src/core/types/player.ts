export type MeepleType = 'NORMAL' | 'BIG' | 'FARMER' | 'BUILDER' | 'PIG'

export interface Meeple {
  id: string
  playerId: string
  type: MeepleType
}

export interface PlayerMeeples {
  // total available per type
  available: Record<MeepleType, number>
  // meeples currently on the board (by meeple id)
  onBoard: string[]
}

export const PLAYER_COLORS = [
  '#e74c3c',  // red
  '#3498db',  // blue
  '#2ecc71',  // green
  '#f39c12',  // yellow
  '#9b59b6',  // purple
  '#1abc9c',  // teal
] as const

export interface Player {
  id: string
  name: string
  color: string
  score: number
  meeples: PlayerMeeples
}

export function createPlayer(id: string, name: string, color: string, bigMeeple = false): Player {
  return {
    id,
    name,
    color,
    score: 0,
    meeples: {
      available: {
        NORMAL: 7,
        BIG: bigMeeple ? 1 : 0,
        FARMER: 0,
        BUILDER: 0,
        PIG: 0,
      },
      onBoard: [],
    },
  }
}

export function availableMeepleCount(player: Player, type: MeepleType = 'NORMAL'): number {
  return player.meeples.available[type]
}
