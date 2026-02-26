import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { GameState } from '../core/types/game.ts'
import type { Coordinate } from '../core/types/board.ts'
import type { MeepleType } from '../core/types/player.ts'
import type { Rotation, Direction } from '../core/types/tile.ts'
import {
  initGame,
  drawTile,
  placeTile,
  placeMeeple,
  placeMeepleOnExistingTile,
  resolveFarmerReturn as engineResolveFarmerReturn,
  skipMeeple,
  endTurn,
  scoreFeatureCompletion,
  getAllPotentialPlacements,
  getAvailableSegmentsForMeeple,
  isValidPlacement,
  canPlaceMeeple,
  canPlaceBuilderOrPig,
  placeDragonOnHoard as enginePlaceDragonOnHoard,
  orientDragon as engineOrientDragon,
  executeDragonTileStep,
  finishDragonMovementStep,
  getValidDragonOrientations,
  prepareFairyMove,
  getFairyMoveTargets,
  moveFairy as engineMoveFairy,
  skipFairyMove as engineSkipFairy,
  getMagicPortalPlacements,
  placeMeepleViaPortal,
  isMagicPortalTile,
} from '../core/engine/GameEngine.ts'
import type { GameConfig } from '../core/engine/GameEngine.ts'
import { loadAllTiles, loadTileMap, invalidateCache } from '../services/tileRegistry.ts'
import { nodeKey } from '../core/types/feature.ts'
import { getFeature } from '../core/engine/FeatureDetector.ts'
import { useUIStore } from './uiStore.ts'

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
  tentativeSecondaryMeepleType: 'PIG' | 'BUILDER' | null

  // Undo history (limit 1 for now, just to go back from meeple phase)
  prevGameState: GameState | null

  // Meeple placement
  placeableSegments: string[]

  // Dragon & Fairy state
  dragonOrientations: Direction[]
  tentativeDragonFacing: Direction | null
  dragonPlaceTargets: Coordinate[]
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
  selectMeeplePlacement: (segmentId: string, meepleType?: MeepleType, coord?: Coordinate, secondaryMeepleType?: 'BUILDER' | 'PIG' | null) => void
  confirmMeeplePlacement: () => void
  cancelMeeplePlacement: () => void
  skipMeeple: () => void
  resolveFarmerReturn: (returnFarmer: boolean) => void
  setTentativeMeepleType: (type: MeepleType) => void
  processScoringSequence: () => Promise<void>

  endTurn: () => void
  resetGame: () => void
  refreshDefinitions: () => Promise<void>

  // Dragon & Fairy actions
  cycleDragonFacing: () => void
  confirmDragonOrientation: () => void
  placeDragonOnHoard: (coord: Coordinate) => void
  executeDragon: () => void
  moveFairy: (coord: Coordinate, segmentId: string) => void
  skipFairyMove: () => void
  startFairyMove: () => void
  cancelFairyMove: () => void

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
      tentativeSecondaryMeepleType: null,
      placeableSegments: [],
      dragonOrientations: [],
      tentativeDragonFacing: null,
      dragonPlaceTargets: [],
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
          store.tentativeSecondaryMeepleType = null
          store.placeableSegments = []
          store.tentativeDragonFacing = null
          store.dragonPlaceTargets = []
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

        // 2. Keep current rotation if valid at the new spot; otherwise find the
        //    next valid rotation starting from the current one.
        const { board, currentTile } = store.gameState
        const rotations: Rotation[] = [0, 90, 180, 270]
        const currentIdx = rotations.indexOf(currentTile.rotation as Rotation)
        const orderedRotations = [
          ...rotations.slice(currentIdx),
          ...rotations.slice(0, currentIdx),
        ]

        for (const r of orderedRotations) {
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

      confirmTilePlacement: () => {
        set((store) => {
          if (!store.gameState || !store.tentativeTileCoord) return

          // Save state for undo
          store.prevGameState = store.gameState

          // Commit the tile
          store.gameState = placeTile(store.gameState, store.tentativeTileCoord)

          // Move to Meeple phase
          store.interactionState = 'IDLE'
          store.tentativeTileCoord = null
          store.tentativeMeepleSegment = null
          store.tentativeMeepleType = null
          store.tentativeSecondaryMeepleType = null
          // Keep validPlacements so the user can see where they could have placed it and click to undo.
        })

        const { gameState } = get()
        if (!gameState) return

        // ── Dragon & Fairy: dragon orientation phase ──────────
        if (gameState.turnPhase === 'DRAGON_ORIENT') {
          set(store => {
            store.dragonOrientations = getValidDragonOrientations(gameState)
            store.tentativeDragonFacing = store.dragonOrientations.length > 0
              ? store.dragonOrientations[0] : null
            store.placeableSegments = []
            store.magicPortalTargets = []
          })
          return
        }

        if (gameState.turnPhase === 'SCORE') {
          get().processScoringSequence()
          return
        }

        // Calculate placeable segments for the newly placed tile
        set(store => {
          store.placeableSegments = getAvailableSegmentsForMeeple(gameState)

          // Magic portal: also compute expanded placement targets
          if (isMagicPortalTile(gameState)) {
            store.magicPortalTargets = getMagicPortalPlacements(gameState)
          } else {
            store.magicPortalTargets = []
          }
        })
      },

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

      selectMeeplePlacement: (segmentId, meepleType = 'NORMAL', coord?, secondaryMeepleType = null) => set((store) => {
        // Toggle off if clicking the same segment again
        if (store.tentativeMeepleSegment === segmentId && (!coord || (store.tentativeTileCoord?.x === coord.x && store.tentativeTileCoord?.y === coord.y))) {
          store.tentativeMeepleSegment = null
          store.tentativeMeepleType = null
          store.tentativeSecondaryMeepleType = null
          store.interactionState = 'IDLE'
          return
        }

        store.tentativeMeepleSegment = segmentId
        store.tentativeMeepleType = meepleType
        store.tentativeSecondaryMeepleType = secondaryMeepleType
        store.interactionState = 'MEEPLE_SELECTED_TENTATIVELY'
        if (coord) {
          store.tentativeTileCoord = coord
        }
      }),

      confirmMeeplePlacement: () => {
        set((store) => {
          if (!store.gameState) return

          // 1. Place or Skip Meeple
          if (store.tentativeMeepleSegment) {
            const meepleType = store.tentativeMeepleType ?? 'NORMAL'
            const isPortalTarget = store.tentativeTileCoord && store.magicPortalTargets.length > 0 &&
              (store.tentativeTileCoord.x !== store.gameState.lastPlacedCoord?.x || store.tentativeTileCoord.y !== store.gameState.lastPlacedCoord?.y)

            const isCurrentTile = !store.tentativeTileCoord || (store.gameState.lastPlacedCoord?.x === store.tentativeTileCoord.x && store.gameState.lastPlacedCoord?.y === store.tentativeTileCoord.y)

            if (isPortalTarget) {
              store.gameState = placeMeepleViaPortal(
                store.gameState,
                store.tentativeTileCoord!,
                store.tentativeMeepleSegment,
                meepleType,
              )
            } else if ((meepleType === 'BUILDER' || meepleType === 'PIG') && store.tentativeTileCoord && !isCurrentTile) {
              // Placed on an existing tile (pre-C3.1 rule fallback)
              store.gameState = placeMeepleOnExistingTile(
                store.gameState,
                store.tentativeTileCoord,
                store.tentativeMeepleSegment,
                meepleType,
              )
            } else {
              // Standard placement on current tile (handles normal, big, farmer, AND standalone builders/pigs perfectly)
              console.log('--- confirmMeeplePlacement ---')
              console.log('meepleType:', meepleType)
              console.log('tentativeSecondaryMeepleType:', store.tentativeSecondaryMeepleType)
              store.gameState = placeMeeple(store.gameState, store.tentativeMeepleSegment, meepleType, store.tentativeSecondaryMeepleType || undefined)
            }
          } else {
            store.gameState = skipMeeple(store.gameState)
          }
        })

        const { gameState } = get()
        if (!gameState) return

        if (gameState.turnPhase === 'SCORE') {
          get().processScoringSequence()
          return
        }

        get().endTurn()
      },

      cancelMeeplePlacement: () => set((store) => {
        store.tentativeMeepleSegment = null
        store.tentativeMeepleType = null
        store.tentativeSecondaryMeepleType = null
        store.interactionState = 'IDLE'
      }),

      setTentativeMeepleType: (type) => set((store) => {
        if (store.interactionState === 'MEEPLE_SELECTED_TENTATIVELY') {
          const { gameState, tentativeMeepleSegment } = store
          if (!gameState || !tentativeMeepleSegment) return

          const player = gameState.players[gameState.currentPlayerIndex]
          const coord = store.tentativeTileCoord ?? gameState.lastPlacedCoord
          if (!coord) return

          const dfData = (gameState.expansionData['dragonFairy'] as any)
          const dragonPos = dfData?.dragonPosition
          const tbData = (gameState.expansionData['tradersBuilders'] as any)
          const useModernTerminology = tbData?.useModernTerminology ?? false

          let isValid = false
          if (type === 'BUILDER' || type === 'PIG') {
            isValid = canPlaceBuilderOrPig(
              gameState.featureUnionFind,
              player,
              coord,
              tentativeMeepleSegment,
              type,
              dragonPos
            )

            if (useModernTerminology && !isValid) {
              const nKey = nodeKey(coord, tentativeMeepleSegment)
              const featureFromUf = getFeature(gameState.featureUnionFind, nKey)
              const featureDef = Object.values(gameState.staticTileMap[gameState.board.tiles[`${coord.x},${coord.y}`]?.definitionId ?? '']?.segments ?? []).find(s => s.id === tentativeMeepleSegment)
              const fType = featureFromUf ? featureFromUf.type : featureDef?.type

              if (fType) {
                const isCorrectType = (type === 'BUILDER' && (fType === 'CITY' || fType === 'ROAD')) || (type === 'PIG' && fType === 'FIELD')
                if (isCorrectType && (player.meeples.available[type] ?? 0) > 0) {
                  // If it CANNOT be placed standalone, it can ONLY be placed if accompanied by a NORMAL/BIG meeple mapping to the same feature type.
                  const hasNormalOrBig = (player.meeples.available.NORMAL > 0) || ((player.meeples.available.BIG ?? 0) > 0)
                  const validSimultaneousPlacement = hasNormalOrBig && canPlaceMeeple(
                    gameState.featureUnionFind,
                    player,
                    coord,
                    tentativeMeepleSegment,
                    'NORMAL',
                    dragonPos
                  )

                  if (validSimultaneousPlacement) {
                    // It's allowed as a secondary meeple!
                    if (store.tentativeSecondaryMeepleType === type) {
                      store.tentativeSecondaryMeepleType = null
                    } else {
                      store.tentativeSecondaryMeepleType = type
                      if (!store.tentativeMeepleType || store.tentativeMeepleType === 'BUILDER' || store.tentativeMeepleType === 'PIG') {
                        store.tentativeMeepleType = 'NORMAL' // auto-select primary meeple
                      }
                    }
                    return // bypass the standard isValid check
                  }
                }
              }
            }
          } else {
            isValid = canPlaceMeeple(
              gameState.featureUnionFind,
              player,
              coord,
              tentativeMeepleSegment,
              type,
              dragonPos
            )
          }

          if (isValid) {
            store.tentativeMeepleType = type
            // Clear secondary if switching primary type
            if (type !== 'NORMAL' && type !== 'BIG') store.tentativeSecondaryMeepleType = null;
          } else {
            // New type is invalid here: clear the tentative selection
            store.tentativeMeepleSegment = null
            store.tentativeMeepleType = null
            store.tentativeSecondaryMeepleType = null
            store.interactionState = 'IDLE'
            // Keep the coord if it was a magic portal / builder target? 
            // Actually, if it's invalid, it's safer to clear everything but the last tile
          }
        }
      }),

      processScoringSequence: async () => {
        const { gameState } = get()
        if (!gameState || gameState.completedFeatureIds.length === 0) {
          get().endTurn()
          return
        }

        // Clear tentative state before starting animation sequence
        set(store => {
          store.tentativeMeepleSegment = null
          store.tentativeMeepleType = null
          store.tentativeSecondaryMeepleType = null
          store.interactionState = 'IDLE'
        })

        const featureIds = [...gameState.completedFeatureIds]
        const staticTileMap = gameState.staticTileMap

        for (const id of featureIds) {
          const feature = gameState.featureUnionFind.featureData[id]
          if (!feature) continue

          const { state: nextState, event } = scoreFeatureCompletion(get().gameState!, id)
          if (!event) continue

          // Trigger animations for each meeple in this feature
          for (const meeple of feature.meeples) {
            const node = feature.nodes.find(n => {
              const k = nodeKey(n.coordinate, n.segmentId)
              const boardMeeple = gameState.boardMeeples[k]
              return boardMeeple && boardMeeple.playerId === meeple.playerId && boardMeeple.meepleType === meeple.meepleType
            })

            if (node) {
              const tile = gameState.board.tiles[`${node.coordinate.x},${node.coordinate.y}`]
              const tileDef = staticTileMap[tile?.definitionId || '']
              const segment = tileDef?.segments.find(s => s.id === node.segmentId)

              if (segment?.meepleCentroid) {
                useUIStore.getState().addFlyingElement({
                  id: `meeple-${id}-${meeple.playerId}-${Math.random()}`,
                  type: 'MEEPLE',
                  startBoardCoord: node.coordinate,
                  startBoardNode: segment.meepleCentroid,
                  targetPlayerId: meeple.playerId,
                  color: gameState.players.find(p => p.id === meeple.playerId)?.color || '#fff',
                  meepleType: meeple.meepleType as MeepleType
                })
              }
            }
          }

          for (const [playerId, scores_val] of Object.entries(event.scores)) {
            const amount = scores_val as number
            if (amount <= 0) continue
            const firstNode = feature.nodes[0]
            useUIStore.getState().addFlyingElement({
              id: `points-${id}-${playerId}-${Math.random()}`,
              type: 'POINTS',
              startBoardCoord: firstNode.coordinate,
              targetPlayerId: playerId,
              color: gameState.players.find(p => p.id === playerId)?.color || '#fff',
              amount: amount
            })
          }

          await new Promise(resolve => setTimeout(resolve, 1800))
          set(store => { store.gameState = nextState })
        }

        // Pass original IDs to endTurn so pig scoring can detect
        // which pennanted cities just completed (they've been consumed
        // from completedFeatureIds by the animation loop above).
        set(store => {
          if (!store.gameState) return
          const newState = endTurn(store.gameState, featureIds)
          console.log('[gameStore] processScoringSequence endTurn TB:', newState.expansionData?.tradersBuilders);
          store.gameState = newState
          store.interactionState = 'IDLE'
          store.tentativeMeepleSegment = null
          store.tentativeMeepleType = null
          store.tentativeSecondaryMeepleType = null
        })
      },

      resolveFarmerReturn: (returnFarmer: boolean) => {
        set((store) => {
          if (!store.gameState) return
          store.gameState = engineResolveFarmerReturn(store.gameState, returnFarmer)
        })

        const { gameState } = get()
        if (!gameState) return

        if (gameState.turnPhase === 'SCORE') {
          get().processScoringSequence()
          return
        }
      },

      // ── Legacy / Shared ──────────────────────────────────────────────────

      skipMeeple: () => {
        set((store) => {
          if (!store.gameState) return
          store.gameState = skipMeeple(store.gameState)
        })

        const { gameState } = get()
        if (!gameState) return

        if (gameState.turnPhase === 'SCORE') {
          get().processScoringSequence()
          return
        }

        get().endTurn()
      },

      endTurn: () => set((store) => {
        // Manual end turn (shouldn't be needed usually)
        if (!store.gameState) return
        store.gameState = endTurn(store.gameState)
        store.interactionState = 'IDLE'
        store.tentativeMeepleSegment = null
        store.tentativeMeepleType = null
        store.tentativeSecondaryMeepleType = null
      }),

      resetGame: () => set((store) => {
        store.gameState = null
        store.validPlacements = []
        store.placeableSegments = []
        store.tentativeTileCoord = null
        store.tentativeMeepleSegment = null
        store.tentativeMeepleType = null
        store.tentativeSecondaryMeepleType = null
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

      cycleDragonFacing: () => set((store) => {
        if (!store.gameState || store.gameState.turnPhase !== 'DRAGON_ORIENT') return
        if (store.dragonOrientations.length === 0) return

        const currentIdx = store.tentativeDragonFacing
          ? store.dragonOrientations.indexOf(store.tentativeDragonFacing) : -1
        const nextIdx = (currentIdx + 1) % store.dragonOrientations.length
        store.tentativeDragonFacing = store.dragonOrientations[nextIdx]
      }),

      confirmDragonOrientation: () => {
        set((store) => {
          if (!store.gameState || store.gameState.turnPhase !== 'DRAGON_ORIENT') return
          if (!store.tentativeDragonFacing) return

          store.gameState = engineOrientDragon(store.gameState, store.tentativeDragonFacing)

          // Re-initialize or clear based on new phase
          if (store.gameState.turnPhase === 'DRAGON_ORIENT') {
            store.dragonOrientations = getValidDragonOrientations(store.gameState)
            store.tentativeDragonFacing = store.dragonOrientations.length > 0
              ? store.dragonOrientations[0] : null
          } else {
            store.dragonOrientations = []
            store.tentativeDragonFacing = null
          }

          store.placeableSegments = []
          store.magicPortalTargets = []
        })

        const { gameState } = get()
        if (!gameState) return

        // Dragon Hoard → SCORE (no meeple placement on Dragon Hoard tiles)
        if (gameState.turnPhase === 'SCORE') {
          get().processScoringSequence()
        } else if (gameState.turnPhase === 'PLACE_TILE') {
          // Finished movement sequence, now place the Dragon card
          if (gameState.currentTile) {
            set(store => {
              store.validPlacements = getAllPotentialPlacements(
                gameState.board,
                gameState.staticTileMap,
                gameState.currentTile!
              )
            })
          }
        }

        set(store => { store.interactionState = 'IDLE' })
      },

      placeDragonOnHoard: (coord) => set((store) => {
        if (!store.gameState || store.gameState.turnPhase !== 'DRAGON_PLACE') return

        store.gameState = enginePlaceDragonOnHoard(store.gameState, coord)
        store.dragonPlaceTargets = []

        // After placement → DRAGON_ORIENT
        if (store.gameState.turnPhase === 'DRAGON_ORIENT') {
          store.dragonOrientations = getValidDragonOrientations(store.gameState)
          store.tentativeDragonFacing = store.dragonOrientations.length > 0
            ? store.dragonOrientations[0] : null
        }

        store.interactionState = 'IDLE'
      }),

      executeDragon: () => {
        const { gameState } = get()
        if (!gameState || gameState.turnPhase !== 'DRAGON_MOVEMENT') return

        const animateStep = () => {
          const currentStore = get()
          if (!currentStore.gameState || currentStore.gameState.turnPhase !== 'DRAGON_MOVEMENT') return

          // Try to move one tile
          const stepResult = executeDragonTileStep(currentStore.gameState)

          if (stepResult) {
            const { state: nextStepState, eatenMeeples } = stepResult

            // Trigger animations for eaten meeples
            for (const meeple of eatenMeeples) {
              const tile = nextStepState.board.tiles[`${meeple.coordinate.x},${meeple.coordinate.y}`]
              const tileDef = nextStepState.staticTileMap[tile?.definitionId || '']
              const segment = tileDef?.segments.find(s => s.id === meeple.segmentId)

              if (segment?.meepleCentroid) {
                useUIStore.getState().addFlyingElement({
                  id: `dragon-eat-${meeple.playerId}-${Math.random()}`,
                  type: 'MEEPLE',
                  startBoardCoord: meeple.coordinate,
                  startBoardNode: segment.meepleCentroid,
                  targetPlayerId: meeple.playerId,
                  color: nextStepState.players.find(p => p.id === meeple.playerId)?.color || '#fff',
                  meepleType: meeple.meepleType as MeepleType
                })
              }
            }

            // Moved successfully: update state and wait for next step
            set((store) => { store.gameState = nextStepState })

            // Check if movement sequence was aborted (e.g. hit fairy)
            const df = (nextStepState.expansionData.dragonFairy as any)
            if (!df?.dragonMovement) {
              // Sequence aborted: finish turn/phase
              set((store) => { store.gameState = finishDragonMovementStep(nextStepState) })
              const finalState = get().gameState
              if (finalState) processPhaseTransition(finalState)
              return
            }

            setTimeout(animateStep, 350)
          } else {
            // Hit edge or no more tiles in this direction: finish this step and check reorientation
            const finishedState = finishDragonMovementStep(currentStore.gameState)
            set((store) => { store.gameState = finishedState })

            // If still in movement phase (auto-reoriented), continue automatically?
            // Actually, let's stop to allow user to see the reorientation OR if manual orientation needed
            processPhaseTransition(finishedState)
          }
        }

        const processPhaseTransition = (newState: GameState) => {
          if (newState.turnPhase === 'SCORE') {
            get().endTurn()
          } else if (newState.turnPhase === 'PLACE_TILE') {
            if (newState.currentTile) {
              set((store) => {
                store.validPlacements = getAllPotentialPlacements(
                  newState.board,
                  newState.staticTileMap,
                  newState.currentTile!
                )
              })
            }
          } else if (newState.turnPhase === 'DRAGON_ORIENT') {
            set((store) => {
              store.dragonOrientations = getValidDragonOrientations(newState)
              store.tentativeDragonFacing = store.dragonOrientations.length > 0
                ? store.dragonOrientations[0] : null
            })
          }
        }

        animateStep()
      },

      moveFairy: (coord, segmentId) => set((store) => {
        if (!store.gameState || store.gameState.turnPhase !== 'FAIRY_MOVE') return

        store.gameState = engineMoveFairy(store.gameState, coord, segmentId)
        store.fairyMoveTargets = []

        // After fairy move → SCORE phase (processed by endTurn)
        if (store.gameState.turnPhase === 'SCORE') {
          store.gameState = endTurn(store.gameState)
          // ...
        }
        store.interactionState = 'IDLE'
      }),

      skipFairyMove: () => set((store) => {
        if (!store.gameState || store.gameState.turnPhase !== 'FAIRY_MOVE') return

        store.gameState = engineSkipFairy(store.gameState)
        store.fairyMoveTargets = []

        // After skip → SCORE phase
        if (store.gameState.turnPhase === 'SCORE') {
          store.gameState = endTurn(store.gameState)
          // ...
        }
        store.interactionState = 'IDLE'
      }),

      startFairyMove: () => set((store) => {
        if (!store.gameState || store.gameState.turnPhase !== 'PLACE_MEEPLE') return
        store.gameState = prepareFairyMove(store.gameState)
        store.fairyMoveTargets = getFairyMoveTargets(store.gameState)
        store.interactionState = 'IDLE'
        store.tentativeMeepleSegment = null
        store.tentativeMeepleType = null
        store.tentativeSecondaryMeepleType = null
      }),

      cancelFairyMove: () => set((store) => {
        if (!store.gameState || store.gameState.turnPhase !== 'FAIRY_MOVE') return
        store.gameState.turnPhase = 'PLACE_MEEPLE'
        store.fairyMoveTargets = []
        // Recalculate placeable segments for the newly restored PLACE_MEEPLE phase
        store.placeableSegments = getAvailableSegmentsForMeeple(store.gameState)
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
        tentativeSecondaryMeepleType: s.tentativeSecondaryMeepleType,
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
  ; (window as any).__gameStore = useGameStore
}

export const selectCurrentPlayer = (s: { gameState: GameState | null }) => {
  if (!s.gameState) return null
  return s.gameState.players[s.gameState.currentPlayerIndex]
}
