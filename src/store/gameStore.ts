import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { GameState } from '../core/types/game.ts'
import type { Coordinate } from '../core/types/board.ts'
import type { MeepleType } from '../core/types/player.ts'
import type { Rotation } from '../core/types/tile.ts'
import {
  initGame,
  drawTile,
  rotateTile,
  placeTile,
  placeMeeple,
  skipMeeple,
  endTurn,
  getValidPlacements,
  getAvailableSegmentsForMeeple,
} from '../core/engine/GameEngine.ts'
import type { GameConfig } from '../core/engine/GameEngine.ts'

// Re-export Rotation for convenience
export type { Rotation }

interface GameStore {
  // ── State ────────────────────────────────────────────────────────────────
  gameState: GameState | null
  validPlacements: Coordinate[]
  placeableSegments: string[]

  // ── Actions ──────────────────────────────────────────────────────────────
  newGame: (config: GameConfig) => void
  drawTile: () => void
  rotateTile: () => void
  placeTile: (coord: Coordinate) => void
  placeMeeple: (segmentId: string, meepleType?: MeepleType) => void
  skipMeeple: () => void
  endTurn: () => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    immer((set) => ({
      gameState: null,
      validPlacements: [],
      placeableSegments: [],

      newGame: (config) => set((store) => {
        const state = initGame(config)
        store.gameState = state
        store.validPlacements = []
        store.placeableSegments = []
      }),

      drawTile: () => set((store) => {
        if (!store.gameState) return
        store.gameState = drawTile(store.gameState)
        store.validPlacements = store.gameState.currentTile
          ? getValidPlacements(store.gameState)
          : []
        store.placeableSegments = []
      }),

      rotateTile: () => set((store) => {
        if (!store.gameState) return
        store.gameState = rotateTile(store.gameState)
        store.validPlacements = store.gameState.currentTile
          ? getValidPlacements(store.gameState)
          : []
      }),

      placeTile: (coord) => set((store) => {
        if (!store.gameState) return
        store.gameState = placeTile(store.gameState, coord)
        store.validPlacements = []
        store.placeableSegments = getAvailableSegmentsForMeeple(store.gameState)
      }),

      placeMeeple: (segmentId, meepleType = 'NORMAL') => set((store) => {
        if (!store.gameState) return
        store.gameState = placeMeeple(store.gameState, segmentId, meepleType)
        store.placeableSegments = []
      }),

      skipMeeple: () => set((store) => {
        if (!store.gameState) return
        store.gameState = skipMeeple(store.gameState)
        store.placeableSegments = []
      }),

      endTurn: () => set((store) => {
        if (!store.gameState) return
        store.gameState = endTurn(store.gameState)
      }),

      resetGame: () => set((store) => {
        store.gameState = null
        store.validPlacements = []
        store.placeableSegments = []
      }),
    })),
    {
      name: 'carcassonne-game',
      // Only persist the game state, not computed values
      partialize: (s) => ({ gameState: s.gameState }),
    }
  )
)

// ── Selectors (use these in components for performance) ───────────────────────

export const selectCurrentPlayer = (s: { gameState: GameState | null }) => {
  if (!s.gameState) return null
  return s.gameState.players[s.gameState.currentPlayerIndex]
}
