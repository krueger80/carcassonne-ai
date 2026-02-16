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
  // rotateTile, // used by internal logic duplication
  placeTile,
  placeMeeple,
  skipMeeple,
  endTurn,
  // getValidPlacements,
  getAllPotentialPlacements,
  getAvailableSegmentsForMeeple,
  isValidPlacement, // We need this to check validity during auto-rotate
  TILE_MAP, // We need this map for validation
} from '../core/engine/GameEngine.ts'
import type { GameConfig } from '../core/engine/GameEngine.ts'

// Re-export Rotation for convenience
export type { Rotation }

export type InteractionState = 'IDLE' | 'TILE_PLACED_TENTATIVELY' | 'MEEPLE_SELECTED_TENTATIVELY'

interface GameStore {
  // ── State ────────────────────────────────────────────────────────────────
  gameState: GameState | null

  // Interaction state
  interactionState: InteractionState

  // Valid locations where the CURRENT tile could go (any rotation)
  validPlacements: Coordinate[]

  // Tentative placement state
  tentativeTileCoord: Coordinate | null
  tentativeMeepleSegment: string | null

  // Undo history (limit 1 for now, just to go back from meeple phase)
  prevGameState: GameState | null

  // Meeple placement
  placeableSegments: string[]

  // ── Actions ──────────────────────────────────────────────────────────────
  newGame: (config: GameConfig) => void
  drawTile: () => void

  // Tile Placement Phase
  selectTilePlacement: (coord: Coordinate) => void
  rotateTentativeTile: () => void
  confirmTilePlacement: () => void
  cancelTilePlacement: () => void
  undoTilePlacement: () => void

  // Meeple Placement Phase
  selectMeeplePlacement: (segmentId: string, meepleType?: MeepleType) => void
  confirmMeeplePlacement: () => void
  cancelMeeplePlacement: () => void
  skipMeeple: () => void

  endTurn: () => void
  resetGame: () => void

  // Old actions kept for compatibility if needed, but likely to be replaced
  rotateTile: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      gameState: null,
      prevGameState: null,
      interactionState: 'IDLE',
      validPlacements: [],
      tentativeTileCoord: null,
      tentativeMeepleSegment: null,
      placeableSegments: [],

      newGame: (config) => set((store) => {
        store.gameState = initGame(config)
        // Auto-draw first tile
        if (store.gameState.tileBag.length > 0) {
          store.gameState = drawTile(store.gameState)
          store.validPlacements = store.gameState.currentTile
            ? getAllPotentialPlacements(store.gameState.board, TILE_MAP, store.gameState.currentTile)
            : []
        }
        store.interactionState = 'IDLE'
        store.tentativeTileCoord = null
        store.tentativeMeepleSegment = null
        store.placeableSegments = []
      }),

      drawTile: () => set((store) => {
        // Redundant if auto-draw is working, but kept for safety/dev
        if (!store.gameState) return
        store.gameState = drawTile(store.gameState)
        store.interactionState = 'IDLE'
        store.tentativeTileCoord = null
        store.validPlacements = store.gameState.currentTile
          ? getAllPotentialPlacements(store.gameState.board, TILE_MAP, store.gameState.currentTile)
          : []
        store.placeableSegments = []
      }),

      // ── New Tile Placement Workflow ──────────────────────────────────────

      selectTilePlacement: (coord) => set((store) => {
        if (!store.gameState?.currentTile) return

        // 1. Set tentative coordinate
        store.tentativeTileCoord = coord
        store.interactionState = 'TILE_PLACED_TENTATIVELY'

        // 2. Auto-rotate to the first valid rotation at this spot
        const { board, currentTile } = store.gameState
        const rotations: Rotation[] = [0, 90, 180, 270]

        for (const r of rotations) {
          const testTile = { ...currentTile, rotation: r }
          if (isValidPlacement(board, TILE_MAP, testTile, coord)) {
            store.gameState.currentTile.rotation = r
            break
          }
        }
      }),

      rotateTentativeTile: () => set((store) => {
        if (!store.gameState?.currentTile || !store.tentativeTileCoord) return

        const { board, currentTile } = store.gameState
        const coord = store.tentativeTileCoord
        let r = currentTile.rotation

        // Find next valid rotation
        for (let i = 0; i < 4; i++) {
          r = (r + 90) % 360 as Rotation
          if (isValidPlacement(board, TILE_MAP, { ...currentTile, rotation: r }, coord)) {
            store.gameState.currentTile.rotation = r
            return
          }
        }
      }),

      confirmTilePlacement: () => set((store) => {
        if (!store.gameState || !store.tentativeTileCoord) return

        // Save state for undo
        store.prevGameState = store.gameState

        // Commit the tile
        store.gameState = placeTile(store.gameState, store.tentativeTileCoord)

        // Move to Meeple phase
        store.interactionState = 'IDLE'
        store.tentativeTileCoord = null
        store.validPlacements = []

        // Calculate placeable segments for the newly placed tile
        store.placeableSegments = getAvailableSegmentsForMeeple(store.gameState)
      }),

      cancelTilePlacement: () => set((store) => {
        store.tentativeTileCoord = null
        store.interactionState = 'IDLE'
      }),

      undoTilePlacement: () => set((store) => {
        if (!store.prevGameState) return

        // Restore state
        store.gameState = store.prevGameState
        store.prevGameState = null

        // Reset to IDLE in PLACE_TILE phase
        store.interactionState = 'IDLE'
        store.tentativeTileCoord = null
        store.placeableSegments = []

        // Recalculate valid placements for the restored state
        if (store.gameState?.currentTile) {
          store.validPlacements = getAllPotentialPlacements(store.gameState.board, TILE_MAP, store.gameState.currentTile)
        }
      }),

      // ── New Meeple Placement Workflow ────────────────────────────────────

      selectMeeplePlacement: (segmentId, /* meepleType = 'NORMAL' */) => set((store) => {
        store.tentativeMeepleSegment = segmentId
        store.interactionState = 'MEEPLE_SELECTED_TENTATIVELY'
      }),

      confirmMeeplePlacement: () => set((store) => {
        if (!store.gameState || !store.tentativeMeepleSegment) return

        // 1. Place Meeple
        store.gameState = placeMeeple(store.gameState, store.tentativeMeepleSegment, 'NORMAL')

        // 2. Auto-End Turn & Draw Next
        store.gameState = endTurn(store.gameState)

        if (store.gameState.tileBag.length > 0) {
          store.gameState = drawTile(store.gameState)
          store.validPlacements = store.gameState.currentTile
            ? getAllPotentialPlacements(store.gameState.board, TILE_MAP, store.gameState.currentTile)
            : []
        } else {
          store.validPlacements = []
        }

        store.interactionState = 'IDLE'
        store.tentativeMeepleSegment = null
        store.placeableSegments = []
        store.tentativeTileCoord = null
      }),

      cancelMeeplePlacement: () => set((store) => {
        store.tentativeMeepleSegment = null
        store.interactionState = 'IDLE'
      }),

      // ── Legacy / Shared ──────────────────────────────────────────────────

      skipMeeple: () => set((store) => {
        if (!store.gameState) return

        // 1. Advance to SCORE phase
        store.gameState = skipMeeple(store.gameState)

        // 2. Score and Advance Turn (now valid because we are in SCORE phase)
        store.gameState = endTurn(store.gameState)

        // 3. Auto-Draw Next
        if (store.gameState.tileBag.length > 0) {
          store.gameState = drawTile(store.gameState)
          store.validPlacements = store.gameState.currentTile
            ? getAllPotentialPlacements(store.gameState.board, TILE_MAP, store.gameState.currentTile)
            : []
        } else {
          store.validPlacements = []
        }

        store.placeableSegments = []
        store.interactionState = 'IDLE'
        store.tentativeTileCoord = null
        store.tentativeMeepleSegment = null
      }),

      endTurn: () => set((store) => {
        // Manual end turn (shouldn't be needed usually)
        if (!store.gameState) return
        store.gameState = endTurn(store.gameState)
        store.interactionState = 'IDLE'
      }),

      resetGame: () => set((store) => {
        store.gameState = null
        store.validPlacements = []
        store.placeableSegments = []
        store.tentativeTileCoord = null
        store.tentativeMeepleSegment = null
        store.interactionState = 'IDLE'
      }),

      // Keeping for keyboard shortcut 'R' compatibility if valid
      rotateTile: () => set((store) => {
        // Only useful if we have a tentative placement
        if (store.interactionState === 'TILE_PLACED_TENTATIVELY') {
          const { rotateTentativeTile } = get()
          rotateTentativeTile() // Call internal action? No, need to invoke state change.
          // We can't call get().rotateTentativeTile() inside set().
          // Instead, replicate logic or move logic to shared helper.
          // Simplest: Duplicate the rotate logic here briefly:

          if (!store.gameState?.currentTile || !store.tentativeTileCoord) return
          const { board, currentTile } = store.gameState
          const coord = store.tentativeTileCoord
          let r = currentTile.rotation
          for (let i = 0; i < 4; i++) {
            r = (r + 90) % 360 as Rotation
            if (isValidPlacement(board, TILE_MAP, { ...currentTile, rotation: r }, coord)) {
              store.gameState.currentTile.rotation = r
              return
            }
          }
        }
      }),

    })),
    {
      name: 'carcassonne-game',
      // We persist gameState AND interaction state so a refresh doesn't break the turn flow
      partialize: (s) => ({
        gameState: s.gameState,
        interactionState: s.interactionState,
        validPlacements: s.validPlacements,
        tentativeTileCoord: s.tentativeTileCoord,
        tentativeMeepleSegment: s.tentativeMeepleSegment,
        placeableSegments: s.placeableSegments,
        prevGameState: s.prevGameState,
      }),
    }
  )
)

export const selectCurrentPlayer = (s: { gameState: GameState | null }) => {
  if (!s.gameState) return null
  return s.gameState.players[s.gameState.currentPlayerIndex]
}
