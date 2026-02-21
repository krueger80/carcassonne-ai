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
  placeTile,
  placeMeeple,
  placeMeepleOnExistingTile,
  skipMeeple,
  endTurn,
  getAllPotentialPlacements,
  getAvailableSegmentsForMeeple,
  isValidPlacement,
  executeDragonMovement,
  moveFairy as engineMoveFairy,
  skipFairyMove as engineSkipFairy,
  getFairyMoveTargets,
  getMagicPortalPlacements,
  placeMeepleViaPortal,
  isMagicPortalTile,
} from '../core/engine/GameEngine.ts'
import type { GameConfig } from '../core/engine/GameEngine.ts'
import { loadAllTiles, loadTileMap, invalidateCache } from '../services/tileRegistry.ts'

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
  tentativeMeepleType: MeepleType | null

  // Undo history (limit 1 for now, just to go back from meeple phase)
  prevGameState: GameState | null

  // Meeple placement
  placeableSegments: string[]

  // Dragon & Fairy state
  fairyMoveTargets: { coordinate: Coordinate; segmentId: string }[]
  magicPortalTargets: { coordinate: Coordinate; segmentId: string }[]

  // ── Actions ──────────────────────────────────────────────────────────────
  newGame: (config: GameConfig) => Promise<void>
  drawTile: () => void

  // Tile Placement Phase
  selectTilePlacement: (coord: Coordinate) => void
  rotateTentativeTile: () => void
  confirmTilePlacement: () => void
  cancelTilePlacement: () => void
  undoTilePlacement: () => void

  // Meeple Placement Phase
  selectMeeplePlacement: (segmentId: string, meepleType?: MeepleType, coord?: Coordinate) => void
  confirmMeeplePlacement: () => void
  cancelMeeplePlacement: () => void
  skipMeeple: () => void

  endTurn: () => void
  resetGame: () => void
  refreshDefinitions: () => Promise<void>

  // Dragon & Fairy actions
  executeDragon: () => void
  moveFairy: (coord: Coordinate, segmentId: string) => void
  skipFairyMove: () => void

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
      tentativeMeepleType: null,
      placeableSegments: [],
      fairyMoveTargets: [],
      magicPortalTargets: [],

      newGame: async (config) => {
        let baseDefinitions = config.baseDefinitions
        let extraTileDefinitions = config.extraTileDefinitions
        if (!baseDefinitions) {
          try {
            const allTiles = await loadAllTiles()
            if (allTiles.length > 0) {
              baseDefinitions = allTiles.filter(t => !t.expansionId || t.expansionId === 'base')
              // Provide DB expansion tiles so the engine uses DB configs, not hardcoded
              extraTileDefinitions = allTiles.filter(t => t.expansionId && t.expansionId !== 'base')
            }
          } catch (e) {
            console.warn("Failed to load tiles, using defaults", e)
          }
        }

        set((store) => {
          const debugPrioritize = new URLSearchParams(window.location.search).has('prioritizeExpansions')
          // Clone to avoid mutating the config's original array
          const expansions = [...(config.expansions ?? [])]

          store.gameState = initGame({
            ...config,
            expansions,
            baseDefinitions,
            extraTileDefinitions,
            debugPrioritizeExpansions: debugPrioritize
          })
          // Auto-draw first tile
          if (store.gameState.tileBag.length > 0) {
            store.gameState = drawTile(store.gameState)
            store.validPlacements = store.gameState.currentTile
              ? getAllPotentialPlacements(store.gameState.board, store.gameState.staticTileMap, store.gameState.currentTile)
              : []
          }
          store.interactionState = 'IDLE'
          store.tentativeTileCoord = null
          store.tentativeMeepleSegment = null
          store.tentativeMeepleType = null
          store.placeableSegments = []
        })
      },

      drawTile: () => set((store) => {
        // Redundant if auto-draw is working, but kept for safety/dev
        if (!store.gameState) return
        store.gameState = drawTile(store.gameState)
        store.interactionState = 'IDLE'
        store.tentativeTileCoord = null
        store.validPlacements = store.gameState.currentTile
          ? getAllPotentialPlacements(store.gameState.board, store.gameState.staticTileMap, store.gameState.currentTile)
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
          if (isValidPlacement(board, store.gameState.staticTileMap, testTile, coord)) {
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
          if (isValidPlacement(board, store.gameState.staticTileMap, { ...currentTile, rotation: r }, coord)) {
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

        // ── Dragon & Fairy: dragon movement phase ──────────
        if (store.gameState.turnPhase === 'DRAGON_MOVEMENT') {
          // Don't auto-execute — let the UI show the phase and trigger it
          store.placeableSegments = []
          store.magicPortalTargets = []
          return
        }

        if (store.gameState.turnPhase === 'SCORE') {
          // Volcano tile: skip meeple, go straight to scoring
          store.gameState = endTurn(store.gameState)

          // Check for fairy move opportunity
          if (store.gameState.turnPhase === 'FAIRY_MOVE') {
            store.fairyMoveTargets = getFairyMoveTargets(store.gameState)
            store.placeableSegments = []
            return
          }

          // Auto-draw next tile
          if (store.gameState.tileBag.length > 0) {
            store.gameState = drawTile(store.gameState)
            store.validPlacements = store.gameState.currentTile
              ? getAllPotentialPlacements(store.gameState.board, store.gameState.staticTileMap, store.gameState.currentTile)
              : []
          }
          store.placeableSegments = []
          return
        }

        // Calculate placeable segments for the newly placed tile
        store.placeableSegments = getAvailableSegmentsForMeeple(store.gameState)

        // Magic portal: also compute expanded placement targets
        if (isMagicPortalTile(store.gameState)) {
          store.magicPortalTargets = getMagicPortalPlacements(store.gameState)
        } else {
          store.magicPortalTargets = []
        }
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
          store.validPlacements = getAllPotentialPlacements(store.gameState.board, store.gameState.staticTileMap, store.gameState.currentTile)
        }
      }),

      // ── New Meeple Placement Workflow ────────────────────────────────────

      selectMeeplePlacement: (segmentId, meepleType = 'NORMAL', coord?) => set((store) => {
        store.tentativeMeepleSegment = segmentId
        store.tentativeMeepleType = meepleType
        store.interactionState = 'MEEPLE_SELECTED_TENTATIVELY'
        if (coord) {
          store.tentativeTileCoord = coord
        }
      }),

      confirmMeeplePlacement: () => set((store) => {
        if (!store.gameState) return

        // 1. Place or Skip Meeple
        if (store.tentativeMeepleSegment) {
          const meepleType = store.tentativeMeepleType ?? 'NORMAL'
          if ((meepleType === 'BUILDER' || meepleType === 'PIG') && store.tentativeTileCoord) {
            // Builder/Pig: placed on an EXISTING tile (not the last-placed tile)
            store.gameState = placeMeepleOnExistingTile(
              store.gameState,
              store.tentativeTileCoord,
              store.tentativeMeepleSegment,
              meepleType,
            )
          } else if (store.tentativeTileCoord && store.magicPortalTargets.length > 0) {
            // Magic portal: place on any tile via portal
            store.gameState = placeMeepleViaPortal(
              store.gameState,
              store.tentativeTileCoord,
              store.tentativeMeepleSegment,
              meepleType,
            )
          } else {
            store.gameState = placeMeeple(store.gameState, store.tentativeMeepleSegment, meepleType)
          }
        } else {
          // No selection confirmed = Skip
          store.gameState = skipMeeple(store.gameState)
        }

        // 2. Auto-End Turn & Draw Next
        store.gameState = endTurn(store.gameState)

        // Check for fairy move opportunity
        if (store.gameState.turnPhase === 'FAIRY_MOVE') {
          store.fairyMoveTargets = getFairyMoveTargets(store.gameState)
          store.interactionState = 'IDLE'
          store.tentativeMeepleSegment = null
          store.tentativeMeepleType = null
          store.placeableSegments = []
          store.magicPortalTargets = []
          store.tentativeTileCoord = null
          return
        }

        if (store.gameState.tileBag.length > 0) {
          // Auto-draw next
          store.gameState = drawTile(store.gameState)
          store.validPlacements = store.gameState.currentTile
            ? getAllPotentialPlacements(store.gameState.board, store.gameState.staticTileMap, store.gameState.currentTile)
            : []
        } else {
          store.validPlacements = []
        }

        store.interactionState = 'IDLE'
        store.tentativeMeepleSegment = null
        store.tentativeMeepleType = null
        store.placeableSegments = []
        store.magicPortalTargets = []
        store.tentativeTileCoord = null
      }),

      cancelMeeplePlacement: () => set((store) => {
        store.tentativeMeepleSegment = null
        store.tentativeMeepleType = null
        store.interactionState = 'IDLE'
      }),

      // ── Legacy / Shared ──────────────────────────────────────────────────

      skipMeeple: () => set((store) => {
        if (!store.gameState) return

        // 1. Advance to SCORE phase
        store.gameState = skipMeeple(store.gameState)

        // 2. Score and Advance Turn (now valid because we are in SCORE phase)
        store.gameState = endTurn(store.gameState)

        // Check for fairy move opportunity
        if (store.gameState.turnPhase === 'FAIRY_MOVE') {
          store.fairyMoveTargets = getFairyMoveTargets(store.gameState)
          store.placeableSegments = []
          store.magicPortalTargets = []
          store.interactionState = 'IDLE'
          store.tentativeTileCoord = null
          store.tentativeMeepleSegment = null
          store.tentativeMeepleType = null
          return
        }

        // 3. Auto-Draw Next
        if (store.gameState.tileBag.length > 0) {
          store.gameState = drawTile(store.gameState)
          store.validPlacements = store.gameState.currentTile
            ? getAllPotentialPlacements(store.gameState.board, store.gameState.staticTileMap, store.gameState.currentTile)
            : []
        } else {
          store.validPlacements = []
        }

        store.placeableSegments = []
        store.magicPortalTargets = []
        store.interactionState = 'IDLE'
        store.tentativeTileCoord = null
        store.tentativeMeepleSegment = null
        store.tentativeMeepleType = null
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
        store.tentativeMeepleType = null
        store.interactionState = 'IDLE'
      }),

      refreshDefinitions: async () => {
        try {
          invalidateCache()
          const tileMap = await loadTileMap()
          set((store) => {
            if (store.gameState) {
              // Merge registry definitions into existing map
              store.gameState.staticTileMap = { ...store.gameState.staticTileMap, ...tileMap }
            }
          })
        } catch (e) {
          console.error("Failed to refresh definitions", e)
        }
      },

      // ── Dragon & Fairy actions ───────────────────────────────────────────

      executeDragon: () => set((store) => {
        if (!store.gameState || store.gameState.turnPhase !== 'DRAGON_MOVEMENT') return

        store.gameState = executeDragonMovement(store.gameState)

        // After dragon movement → PLACE_MEEPLE
        if (store.gameState.turnPhase === 'PLACE_MEEPLE') {
          const currentTile = store.gameState.currentTile
          if (currentTile) {
            store.placeableSegments = getAvailableSegmentsForMeeple(store.gameState)

            // Magic portal targets
            if (isMagicPortalTile(store.gameState)) {
              store.magicPortalTargets = getMagicPortalPlacements(store.gameState)
            }
          }
        }

        store.interactionState = 'IDLE'
      }),

      moveFairy: (coord, segmentId) => set((store) => {
        if (!store.gameState || store.gameState.turnPhase !== 'FAIRY_MOVE') return

        store.gameState = engineMoveFairy(store.gameState, coord, segmentId)
        store.fairyMoveTargets = []

        // Auto-draw after fairy move
        if (store.gameState.turnPhase === 'DRAW_TILE' && store.gameState.tileBag.length > 0) {
          store.gameState = drawTile(store.gameState)
          store.validPlacements = store.gameState.currentTile
            ? getAllPotentialPlacements(store.gameState.board, store.gameState.staticTileMap, store.gameState.currentTile)
            : []
        }
        store.interactionState = 'IDLE'
      }),

      skipFairyMove: () => set((store) => {
        if (!store.gameState || store.gameState.turnPhase !== 'FAIRY_MOVE') return

        store.gameState = engineSkipFairy(store.gameState)
        store.fairyMoveTargets = []

        // Auto-draw after fairy skip
        if (store.gameState.turnPhase === 'DRAW_TILE' && store.gameState.tileBag.length > 0) {
          store.gameState = drawTile(store.gameState)
          store.validPlacements = store.gameState.currentTile
            ? getAllPotentialPlacements(store.gameState.board, store.gameState.staticTileMap, store.gameState.currentTile)
            : []
        }
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
            if (isValidPlacement(board, store.gameState.staticTileMap, { ...currentTile, rotation: r }, coord)) {
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
        tentativeMeepleType: s.tentativeMeepleType,
        placeableSegments: s.placeableSegments,
        fairyMoveTargets: s.fairyMoveTargets,
        magicPortalTargets: s.magicPortalTargets,
        // prevGameState: s.prevGameState, // Exclude to reduce size/complexity
      }),
    }
  )
)

// Expose store for browser console inspection (dev only)
if (typeof window !== 'undefined') {
  ;(window as any).__gameStore = useGameStore
}

export const selectCurrentPlayer = (s: { gameState: GameState | null }) => {
  if (!s.gameState) return null
  return s.gameState.players[s.gameState.currentPlayerIndex]
}
