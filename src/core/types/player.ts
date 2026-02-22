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
  '#ff69b4',  // pink
] as const

export interface Player {
  id: string
  name: string
  color: string
  score: number
  meeples: PlayerMeeples
  traderTokens: Record<'CLOTH' | 'WHEAT' | 'WINE', number>
}

export function createPlayer(
  id: string,
  name: string,
  color: string,
  bigMeeple = false,
  builderAndPig = false,
): Player {
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
        BUILDER: builderAndPig ? 1 : 0,
        PIG: builderAndPig ? 1 : 0,
      },
      onBoard: [],
    },
    traderTokens: { CLOTH: 0, WHEAT: 0, WINE: 0 },
  }
}

export function availableMeepleCount(player: Player, type: MeepleType = 'NORMAL'): number {
  return player.meeples.available[type]
}
