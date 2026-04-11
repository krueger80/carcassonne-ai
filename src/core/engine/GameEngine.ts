/**
 * GameEngine: Pure orchestrator for Carcassonne game logic.
 *
 * All public methods take a GameState and return a new GameState (immutable).
 * No side effects, no UI dependencies — fully unit-testable.
 */

import type { GameState, ScoreEvent, PieceState, PieceLocation } from '../types/game.ts'
import { type Coordinate, coordKey, emptyBoard, keyToCoord, type PlacedTile, type MeeplePlacement } from '../types/board.ts'
import type { TileDefinition, TileInstance, Rotation, Direction } from '../types/tile.ts'
import { type Player, type MeepleType, availableMeepleCount } from '../types/player.ts'
import { type ExpansionSelection } from '../types/setup.ts'
import { emptyUnionFindState } from '../types/feature.ts'
import { createPlayer, PLAYER_COLORS } from '../types/player.ts'
import { getFallbackBaseTiles } from '../../services/tileRegistry.ts'
import { getExpansionConfig, buildExpansionConfig } from '../expansions/registry.ts'
import { buildCombinedIcTbRules } from '../expansions/tradersBuilders.ts'
import { createInitialDragonFairyState, type DragonFairyState } from '../expansions/dragonFairy.ts'
import { createTileBag, drawTile as drawFromBag } from './TileBag.ts'
import {
  isValidPlacement,
  getValidPositions,
  getValidRotations,
  getAllPotentialPlacements,
  hasAnyValidPlacement,
  getAllPotentialRiverPlacements,
  getValidRiverRotations,
  getRiverEntryExit,
  computeRiverTurn,
  getRotatedOffset,
  type RiverTurnDirection,
} from './TilePlacement.ts'

export {
  isValidPlacement,
  getAllPotentialPlacements,
  getAllPotentialRiverPlacements,
  canPlaceMeeple,
  canPlaceBuilderOrPig,
  findRoot,
  getFeature,
}

import { addTileToUnionFind, updateFeatureMeeples, findRoot, getFeature } from './FeatureDetector.ts'
import { canPlaceMeeple, getPlaceableSegments, createMeeplePlacement, canPlaceBuilderOrPig } from './MeeplePlacement.ts'
import {
  scoreCompletedFeatures,
  scoreAllRemainingFeatures,
  applyScoreEvents,
  distributeCommodityTokens,
  scoreTradersBonus,
  BASE_SCORING_RULES,
  countAdjacentCompletedCities,
  type ScoringRule,
} from './ScoreCalculator.ts'
import { nodeKey } from '../types/feature.ts'
import { IC_SCORING_RULES } from '../expansions/innsCathedrals.ts'
import { IC_C31_SCORING_RULES } from '../expansions/innsCathedralsC31.ts'
import { TB_SCORING_RULES } from '../expansions/tradersBuilders.ts'

// ─── Scoring-rules resolution ─────────────────────────────────────────────────
// Scoring rules contain functions that are stripped by JSON.stringify (Zustand
// persist). We store a serialisable key and resolve to live rules at runtime.

const RULES_REGISTRY: Record<string, ScoringRule[]> = {
  'base': BASE_SCORING_RULES,
  'ic': IC_SCORING_RULES,
  'ic-c31': IC_C31_SCORING_RULES,
  'tb': TB_SCORING_RULES,
  'ic-tb': buildCombinedIcTbRules(IC_SCORING_RULES),
  'ic-c31-tb': buildCombinedIcTbRules(IC_C31_SCORING_RULES),
}

export function resolveScoringRules(state: GameState): ScoringRule[] {
  // Fast path: key is stored — look up live rules
  const key = state.expansionData.scoringRulesKey as string | undefined
  if (key && RULES_REGISTRY[key]) return RULES_REGISTRY[key]

  // Legacy path: rules might still have functions (in-memory, not yet rehydrated)
  const stored = state.expansionData.scoringRules as ScoringRule[] | undefined
  if (stored?.[0] && typeof stored[0].scoreComplete === 'function') return stored

  // Fallback: best-effort reconstruction from expansion list
  const expansions = (state.expansionData.expansions as string[]) ?? []
  const hasIc = expansions.includes('inns-cathedrals')
  const hasTb = expansions.includes('traders-builders')
  const tbData = state.expansionData['tradersBuilders'] as { useModernRules?: boolean } | undefined
  const isModern = tbData?.useModernRules ?? false

  if (hasIc && hasTb) return isModern ? RULES_REGISTRY['ic-c31-tb'] : RULES_REGISTRY['ic-tb']
  if (hasIc) return isModern ? IC_C31_SCORING_RULES : IC_SCORING_RULES
  if (hasTb) return TB_SCORING_RULES
  return BASE_SCORING_RULES
}

// ─── Initialization ───────────────────────────────────────────────────────────

export interface PlayerConfig {
  name: string
  isBot?: boolean
  botDifficulty?: 'easy' | 'medium' | 'hard'
}

export interface GameConfig {
  playerNames: (string | PlayerConfig)[]
  extraTileDefinitions?: TileDefinition[]
  baseDefinitions?: TileDefinition[]
  scoringRules?: ScoringRule[]
  /** Legacy: versioned expansion ID strings. Prefer expansionSelections for new code. */
  expansions?: string[]
  /** Structured per-expansion setup config (rules version + tile edition). */
  expansionSelections?: ExpansionSelection[]
  debugPrioritizeExpansions?: boolean
  /** Map of player index (as string) → linked Supabase profile info. */
  linkedProfiles?: Record<string, { profileId: string; displayName: string; avatarUrl?: string | null }>
}

export function initGame(config: GameConfig): GameState {
  const {
    playerNames,
    extraTileDefinitions = [],
    baseDefinitions = getFallbackBaseTiles(),
    scoringRules = BASE_SCORING_RULES,
    expansions = [],
    expansionSelections,
    debugPrioritizeExpansions = false,
  } = config

  if (playerNames.length < 2 || playerNames.length > 6) {
    throw new Error('Carcassonne supports 2–6 players')
  }

  // Detect which expansions are active (supports both new selections and legacy ID strings)
  const hasIc = expansionSelections
    ? expansionSelections.some(s => s.id === 'inns-cathedrals')
    : expansions.includes('inns-cathedrals') ||
    expansions.includes('inns-cathedrals-c3') ||
    expansions.includes('inns-cathedrals-c31')
  const hasTb = expansionSelections
    ? expansionSelections.some(s => s.id === 'traders-builders')
    : expansions.includes('traders-builders') ||
    expansions.includes('traders-builders-c2') ||
    expansions.includes('traders-builders-c31')
  const hasDf = expansionSelections
    ? expansionSelections.some(s => s.id === 'dragon-fairy')
    : expansions.includes('dragon-fairy') ||
    expansions.includes('dragon-fairy-c31')
  const hasRiver = expansionSelections
    ? expansionSelections.some(s => s.id === 'river')
    : expansions.includes('river') ||
    expansions.includes('river-c3')
  const hasAbbot = expansionSelections
    ? expansionSelections.some(s => s.id === 'abbot')
    : expansions.includes('abbot')

  const enableBigMeeple = hasIc
  const enableBuilderAndPig = hasTb

  const usesModernTbRules = expansionSelections
    ? expansionSelections.some(s => s.id === 'traders-builders' && s.rulesVersion === 'modern')
    : expansions.includes('traders-builders-c31')

  const usesC31TbTiles = expansionSelections
    ? expansionSelections.some(s => s.id === 'traders-builders' && s.tileEdition === 'C3.1')
    : expansions.includes('traders-builders-c31')

  // Canonical expansion IDs stored in game state (edition-agnostic, for runtime checks)
  const canonicalExpansions: string[] = [
    ...(hasIc ? ['inns-cathedrals'] : []),
    ...(hasTb ? ['traders-builders'] : []),
    ...(hasDf ? ['dragon-fairy'] : []),
    ...(hasRiver ? ['river'] : []),
    ...(hasAbbot ? ['abbot'] : []),
  ]

  let allHardcodedExtraTiles: TileDefinition[] = []
  let activeRules = scoringRules

  if (expansionSelections) {
    // ── New path: structured ExpansionSelection array ────────────────────────
    const icSel = expansionSelections.find(s => s.id === 'inns-cathedrals')
    const tbSel = expansionSelections.find(s => s.id === 'traders-builders')

    for (const sel of expansionSelections) {
      const expConfig = buildExpansionConfig(sel)
      allHardcodedExtraTiles = [...allHardcodedExtraTiles, ...expConfig.tiles]
    }

    if (icSel) {
      activeRules = buildExpansionConfig(icSel).scoringRules
    }
    if (tbSel) {
      const tbRules = buildExpansionConfig(tbSel).scoringRules
      activeRules = hasIc ? buildCombinedIcTbRules(activeRules) : tbRules
    }
  } else {
    // ── Legacy path: expansion ID string array ───────────────────────────────
    if (hasIc) {
      const icId = expansions.includes('inns-cathedrals-c31') ? 'inns-cathedrals-c31' : 'inns-cathedrals-c3'
      const ic = getExpansionConfig(icId)
      if (ic) {
        allHardcodedExtraTiles = [...allHardcodedExtraTiles, ...ic.tiles]
        activeRules = ic.scoringRules
      }
    }

    if (hasTb) {
      const tbId = expansions.includes('traders-builders-c31') ? 'traders-builders-c31' : 'traders-builders-c2'
      const tb = getExpansionConfig(tbId)
      if (tb) {
        allHardcodedExtraTiles = [...allHardcodedExtraTiles, ...tb.tiles]
        activeRules = hasIc ? buildCombinedIcTbRules(activeRules) : tb.scoringRules
      }
    }

    if (hasDf) {
      const dfId = 'dragon-fairy-c31'
      const df = getExpansionConfig(dfId)
      if (df) {
        allHardcodedExtraTiles = [...allHardcodedExtraTiles, ...df.tiles]
      }
    }

    if (hasRiver) {
      const river = getExpansionConfig('river-c3')
      if (river) {
        allHardcodedExtraTiles = [...allHardcodedExtraTiles, ...river.tiles]
      }
    }
  }

  // Combine hardcoded and DB tiles. Because we deduplicate by ID later (tileMap),
  // placing DB tiles after hardcoded tiles ensures DB takes precedence while
  // preserving any hardcoded tiles (e.g., new River variants) that aren't in the DB.

  const mergedExtraTiles = allHardcodedExtraTiles.map(hcTile => {
    const dbTile = extraTileDefinitions.find(t => t.id === hcTile.id)
    if (dbTile) {
      // Merge DB tile over hardcoded tile, BUT preserve new compound/river logic if DB tile lacks them.
      // If the hardcoded tile has RIVER segments but the DB tile doesn't, keep hardcoded segments
      // (DB may have stale data from before river support was added).
      const hcHasRiver = hcTile.segments?.some(s => s.type === 'RIVER')
      const dbHasRiver = dbTile.segments?.some(s => s.type === 'RIVER')
      const useHcSegments = hcHasRiver && !dbHasRiver

      return {
        ...hcTile,
        ...dbTile,
        imageConfig: dbTile.imageConfig ?? hcTile.imageConfig,
        linkedTiles: dbTile.linkedTiles ?? hcTile.linkedTiles,
        flipSideDefinitionId: dbTile.flipSideDefinitionId ?? hcTile.flipSideDefinitionId,
        isDragonHoard: dbTile.isDragonHoard ?? hcTile.isDragonHoard,
        // Preserve hardcoded segments/edges when DB is missing RIVER data
        ...(useHcSegments && {
          segments: hcTile.segments,
          edgePositionToSegment: hcTile.edgePositionToSegment,
        }),
      } as TileDefinition
    }
    return hcTile
  })

  // Include DB tiles that are completely new (no hardcoded base), but ONLY
  // if their expansion is actually active in this game. Build a set of active
  // expansion IDs from the selected expansions' hardcoded tiles + base editions.
  const activeExpansionIds = new Set<string>()
  // Base game editions are always active
  activeExpansionIds.add('base-c2')
  activeExpansionIds.add('base-c3')
  activeExpansionIds.add('base-c31')
  // Add expansion IDs from the hardcoded tiles the engine resolved
  for (const t of allHardcodedExtraTiles) {
    if (t.expansionId) activeExpansionIds.add(t.expansionId)
  }
  const additionalDbTiles = extraTileDefinitions.filter(t =>
    t.expansionId && activeExpansionIds.has(t.expansionId) && !allHardcodedExtraTiles.some(hc => hc.id === t.id)
  )

  const allExtraTiles: TileDefinition[] = [
    ...mergedExtraTiles,
    ...additionalDbTiles,
  ]

  // Compute a serialisable key for the active scoring rules so they survive
  // JSON round-trips (Zustand persist) and can be resolved at runtime.
  const isModernIc = expansionSelections
    ? expansionSelections.some(s => s.id === 'inns-cathedrals' && s.rulesVersion === 'modern')
    : expansions.includes('inns-cathedrals-c31')
  let scoringRulesKey = 'base'
  if (hasIc && hasTb) scoringRulesKey = isModernIc ? 'ic-c31-tb' : 'ic-tb'
  else if (hasIc) scoringRulesKey = isModernIc ? 'ic-c31' : 'ic'
  else if (hasTb) scoringRulesKey = 'tb'

  const players: Player[] = playerNames.map((p, i) => {
    const isConfig = typeof p !== 'string'
    const name = isConfig ? p.name : p
    const isBot = isConfig ? (p.isBot ?? false) : false
    const botDifficulty = isConfig ? (p.botDifficulty ?? 'medium') : 'medium'
    return createPlayer(`player_${i}`, name, PLAYER_COLORS[i], enableBigMeeple, enableBuilderAndPig, hasAbbot, isBot, botDifficulty)
  })

  // ── Detect tiles that have river segments (from any expansion) ──
  const hasRiverSegment = (d: TileDefinition) => {
    if (d.segments.some(s => s.type === 'RIVER')) return true
    if (d.linkedTiles) {
      // Find linked parts dynamically if available
      for (const lt of d.linkedTiles) {
        // At this point we can't search allExpTiles directly if it's not defined, but we know linked tiles are often defined.
        // Let's use a simpler heuristic for Dragon & Fairy specifically or try to find it.
        if (lt.definitionId === 'df31_B_front_top' || lt.definitionId === 'df31_A_left') return true
      }
    }
    return false
  }

  // When river is active: pull river tiles from ALL expansions into the river bag
  // When river is NOT active: exclude river tiles entirely (they shouldn't appear)
  const allExpTiles = [...baseDefinitions, ...allExtraTiles]
  const nonRiverDefs = allExpTiles.filter(d => !hasRiverSegment(d))
  const riverDefs = hasRiver ? allExpTiles.filter(d => hasRiverSegment(d)) : []

  // tileMap includes everything (river tiles need definitions for rendering)
  const tileMap: Record<string, TileDefinition> = {}
  allExpTiles.forEach(d => { tileMap[d.id] = d })

  // Build main bag (without river tiles when river is active)
  const { bag, startingTile: baseStartingTile } = createTileBag(nonRiverDefs, [], debugPrioritizeExpansions)

  let riverBag: TileInstance[] = []
  let effectiveStartingTile = baseStartingTile

  // Optional: keep track of whether we set aside the double lake for the UI button
  // We'll set this to false because the Double Lake will instead be drawn from the bottom of the river bag.
  let doubleLakeAvailable = false

  if (hasRiver && riverDefs.length > 0) {
    let riverSource = riverDefs.find(d => d.startingTile)

    // Dragon & Fairy river rules
    if (hasDf) {
      const dfSource = riverDefs.find(d => d.id === 'df31_A_right')
      if (dfSource) riverSource = dfSource
      // We do NOT set doubleLakeAvailable = true here. We put it in the bag.
      // doubleLakeAvailable = true 
    }

    // Lake tiles: river enters from only one edge (endpoint tiles — I and L)
    const isLakeTile = (d: TileDefinition) => {
      // Exclude back sides
      if (d.startingTile || d.id === 'df31_B_back_bottom') return false

      if (hasDf) {
        // If playing D&F, ONLY the Double Lake ends the river. 
        // The original single lake from River C3 is just a normal middle tile.
        return d.id === 'df31_B_front_bottom'
      }

      // If no D&F: check if exactly 1 river edge
      if (!hasRiverSegment(d)) return false

      const edgeMap = d.edgePositionToSegment
      const dirs = ['NORTH', 'EAST', 'SOUTH', 'WEST'] as const
      let riverEdgeCount = 0
      for (const dir of dirs) {
        const center = edgeMap[`${dir}_CENTER` as keyof typeof edgeMap]
        const seg = d.segments.find(s => s.id === center)
        if (seg?.type === 'RIVER') riverEdgeCount++
      }
      return riverEdgeCount === 1
    }

    const lakes = riverDefs.filter(d => isLakeTile(d) && !d.startingTile)
    // The middle tiles are all river tiles that are NEITHER starting NOR lake tiles
    // Exclude back side explicitly.
    const middleTiles = riverDefs.filter(d => !d.startingTile && !isLakeTile(d) && d.id !== 'df31_B_back_bottom')

    // Shuffle middle tiles
    const middleInstances: TileInstance[] = []
    for (const d of middleTiles) {
      for (let i = 0; i < d.count; i++) {
        middleInstances.push({ definitionId: d.id, rotation: 0 })
      }
    }
    for (let i = middleInstances.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[middleInstances[i], middleInstances[j]] = [middleInstances[j], middleInstances[i]]
    }

    // Lake instances go at the end
    const lakeInstances: TileInstance[] = []
    for (const d of lakes) {
      for (let i = 0; i < d.count; i++) {
        lakeInstances.push({ definitionId: d.id, rotation: 0 })
      }
    }
    // Shuffle lakes among themselves (if multiple) then append
    for (let i = lakeInstances.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[lakeInstances[i], lakeInstances[j]] = [lakeInstances[j], lakeInstances[i]]
    }

    riverBag = [...middleInstances, ...lakeInstances]

    if (riverSource) {
      effectiveStartingTile = { definitionId: riverSource.id, rotation: 0 }
      // Put the base starting tile back in the main bag (at a random position)
      const insertIdx = Math.floor(Math.random() * (bag.length + 1))
      bag.splice(insertIdx, 0, baseStartingTile)
    }
  }

  const board = emptyBoard()
  const startingDef = tileMap[effectiveStartingTile.definitionId]
  const startingRotation = effectiveStartingTile.rotation

  const startingParts: { coord: Coordinate; defId: string }[] = [
    { coord: { x: 0, y: 0 }, defId: startingDef.id },
    ...(startingDef.linkedTiles || []).map(lt => {
      const offset = getRotatedOffset(lt.dx, lt.dy, startingRotation)
      return {
        coord: { x: offset.dx, y: offset.dy },
        defId: lt.definitionId
      }
    })
  ]

  let ufState = emptyUnionFindState()
  for (const part of startingParts) {
    const placedPart: PlacedTile = {
      coordinate: part.coord,
      definitionId: part.defId,
      rotation: startingRotation,
      meeples: {},
    }
    board.tiles[coordKey(part.coord)] = placedPart
    board.minX = Math.min(board.minX, part.coord.x)
    board.maxX = Math.max(board.maxX, part.coord.x)
    board.minY = Math.min(board.minY, part.coord.y)
    board.maxY = Math.max(board.maxY, part.coord.y)

    const { state: newUf } = addTileToUnionFind(ufState, board, tileMap, placedPart)
    ufState = newUf
  }

  // ── Initialize piece registry ──
  const pieces: Record<string, PieceState> = {}
  pieces['dragon'] = { id: 'dragon', type: 'DRAGON', ownerId: null, location: { type: 'OUT_OF_PLAY' } }
  pieces['fairy'] = { id: 'fairy', type: 'FAIRY', ownerId: null, location: { type: 'OUT_OF_PLAY' } }

  for (const p of players) {
    const counts: Partial<Record<MeepleType, number>> = {
      NORMAL: 7,
      BIG: hasIc ? 1 : 0,
      BUILDER: hasTb ? 1 : 0,
      PIG: hasTb ? 1 : 0,
      ABBOT: hasAbbot ? 1 : 0,
    }
    for (const [type, count] of Object.entries(counts)) {
      for (let i = 0; i < count; i++) {
        const id = `${p.id}:${type}:${i}`
        pieces[id] = { id, type: type as MeepleType, ownerId: p.id, location: { type: 'SUPPLY', playerId: p.id } }
      }
    }
  }

  return {
    phase: 'PLAYING',
    turnPhase: 'DRAW_TILE',
    players,
    currentPlayerIndex: 0,
    board,
    tileBag: bag,
    currentTile: null,
    lastPlacedCoord: null,
    lastPlacedCoordByPlayer: {},
    completedFeatureIds: [],
    featureUnionFind: ufState,
    lastScoreEvents: [],
    boardMeeples: {},
    pieces,
    expansionData: {
      scoringRules: activeRules,
      scoringRulesKey,
      expansions: canonicalExpansions,
      ...(hasRiver && riverBag.length > 0 ? { river: { bag: riverBag } } : {}),
      ...(hasTb ? { tradersBuilders: { isBuilderBonusTurn: false, pendingBuilderBonus: false, useModernRules: usesModernTbRules, usesC31Tiles: usesC31TbTiles } } : {}),
      ...(hasDf ? { dragonFairy: { ...createInitialDragonFairyState(), doubleLakeAvailable } } : {}),
    },
    staticTileMap: tileMap,

  }
}

// ─── Piece Location Helpers ───────────────────────────────────────────────────

export function getDragonPosition(state: GameState): Coordinate | null {
  const p = state.pieces?.['dragon']
  return p?.location.type === 'BOARD' ? p.location.coordinate : null
}

export function getDragonHeldBy(state: GameState): string | null {
  const p = state.pieces?.['dragon']
  return p?.location.type === 'PLAYER_FRONT' ? p.location.playerId : null
}

export function getFairyPosition(state: GameState): { coordinate: Coordinate; segmentId: string } | null {
  const p = state.pieces?.['fairy']
  return p?.location.type === 'BOARD' ? { coordinate: p.location.coordinate, segmentId: p.location.segmentId! } : null
}

/**
 * Robustly move any piece to a new location in the unified registry.
 */
function movePiece(state: GameState, pieceId: string, location: PieceLocation): GameState {
  if (!state.pieces) return state
  const piece = state.pieces[pieceId]
  if (!piece) return state
  return {
    ...state,
    pieces: {
      ...state.pieces,
      [pieceId]: { ...piece, location }
    }
  }
}

/**
 * Robustly move the dragon to a new location, ensuring it cannot be in two places.
 */
function moveDragon(state: GameState, location: PieceLocation): GameState {
  return movePiece(state, 'dragon', location)
}

/**
 * Robustly move the fairy to a new location.
 */
function moveFairyToLocation(state: GameState, location: PieceLocation): GameState {
  return movePiece(state, 'fairy', location)
}

// ─── Turn actions (pure functions: state → newState) ──────────────────────────

export function drawTile(state: GameState): GameState {
  if (state.turnPhase !== 'DRAW_TILE') return state

  // ── Draw from river bag first (if river expansion is active) ──
  const riverData = state.expansionData['river'] as { bag: TileInstance[]; lastTurnDirection?: RiverTurnDirection | null } | undefined
  const riverBag = riverData?.bag
  if (riverBag && riverBag.length > 0) {
    // Draw the next river tile (order is pre-determined: middle shuffled, lakes at end)
    const [nextRiverTile, ...remainingRiver] = riverBag
    const newState: GameState = {
      ...state,
      currentTile: nextRiverTile,
      turnPhase: 'PLACE_TILE',
      lastScoreEvents: [],
      expansionData: {
        ...state.expansionData,
        river: { ...riverData, bag: remainingRiver },
      },
    }
    return newState
  }

  const result = drawFromBag(state.tileBag)
  if (!result) {
    // Bag is empty — end the game
    return endGame(state)
  }

  // Check if this tile has any valid placement; if not, discard and draw again
  if (!hasAnyValidPlacement(state.board, state.staticTileMap, result.tile)) {
    // Discard this tile and try the next
    return drawTile({ ...state, tileBag: result.remaining })
  }

  const newState: GameState = {
    ...state,
    tileBag: result.remaining,
    currentTile: result.tile,
    turnPhase: 'PLACE_TILE',
    lastScoreEvents: [],
  }

  // ── Dragon & Fairy: Dragon tile movement (C3.1: moves BEFORE placement) ──
  const dfData = getDfState(newState)
  const tileDef = newState.staticTileMap[result.tile.definitionId]
  if (dfData && dfData.dragonInPlay && getDragonPosition(newState) && tileDef?.hasDragon) {
    return {
      ...newState,
      turnPhase: 'DRAGON_MOVEMENT',
      expansionData: {
        ...newState.expansionData,
        dragonFairy: {
          ...dfData,
          dragonMovement: { movesRemaining: 2, nextPhase: 'PLACE_TILE' }
        }
      }
    }
  }

  return newState
}

export function rotateTile(state: GameState): GameState {
  if (state.turnPhase !== 'PLACE_TILE' || !state.currentTile) return state

  const rotations: Rotation[] = [0, 90, 180, 270]
  const currentIdx = rotations.indexOf(state.currentTile.rotation)
  const nextRotation = rotations[(currentIdx + 1) % 4]

  return {
    ...state,
    currentTile: { ...state.currentTile, rotation: nextRotation },
  }
}

export function flipTile(state: GameState): GameState {
  if (state.turnPhase !== 'PLACE_TILE' || !state.currentTile) return state

  const def = state.staticTileMap[state.currentTile.definitionId]
  if (!def || !def.flipSideDefinitionId) return state

  return {
    ...state,
    currentTile: {
      ...state.currentTile,
      definitionId: def.flipSideDefinitionId,
      rotation: 0 // Reset rotation on flip
    }
  }
}

export function placeTile(state: GameState, coord: Coordinate): GameState {
  if (state.turnPhase !== 'PLACE_TILE' || !state.currentTile) return state

  if (!isValidPlacementForState(state, state.currentTile, coord)) {
    return state  // invalid placement — no change
  }

  const def = state.staticTileMap[state.currentTile.definitionId]
  if (!def) return state

  const footprint: { coord: Coordinate, instance: TileInstance }[] = [
    { coord, instance: state.currentTile }
  ]
  if (def.linkedTiles) {
    for (const link of def.linkedTiles) {
      const { dx, dy } = getRotatedOffset(link.dx, link.dy, state.currentTile.rotation)
      footprint.push({
        coord: { x: coord.x + dx, y: coord.y + dy },
        instance: { definitionId: link.definitionId, rotation: state.currentTile.rotation }
      })
    }
  }

  let newBoard = { ...state.board }
  for (const f of footprint) {
    const placedTile = {
      coordinate: f.coord,
      definitionId: f.instance.definitionId,
      rotation: f.instance.rotation,
      meeples: {},
    }
    newBoard = {
      ...newBoard,
      tiles: { ...newBoard.tiles, [coordKey(f.coord)]: placedTile },
      minX: Math.min(newBoard.minX, f.coord.x),
      maxX: Math.max(newBoard.maxX, f.coord.x),
      minY: Math.min(newBoard.minY, f.coord.y),
      maxY: Math.max(newBoard.maxY, f.coord.y),
    }
  }

  let newUfState = state.featureUnionFind
  const allCompletedFeatureIds: string[] = []

  for (const f of footprint) {
    const placedTile = newBoard.tiles[coordKey(f.coord)]!
    const result = addTileToUnionFind(
      newUfState,
      newBoard,
      state.staticTileMap,
      placedTile,
    )
    newUfState = result.state
    allCompletedFeatureIds.push(...result.completedFeatureIds)
  }

  const completedFeatureIds = [...new Set(allCompletedFeatureIds)]

  // ── Builder bonus detection (T&B) ─────────────────────────────────────────
  const tbData = state.expansionData['tradersBuilders'] as
    { isBuilderBonusTurn: boolean; pendingBuilderBonus: boolean } | undefined

  let newExpansionData = state.expansionData

  if (tbData && !tbData.isBuilderBonusTurn) {
    const currentPlayer = state.players[state.currentPlayerIndex]

    // Find if the current player has a builder on the board
    const builderNodeKey = Object.entries(state.boardMeeples).find(
      ([, mp]) => mp.playerId === currentPlayer.id && mp.meepleType === 'BUILDER',
    )?.[0]

    if (builderNodeKey) {
      // Get the builder's feature root in the NEW state (after this tile was placed)
      const builderPlacement = state.boardMeeples[builderNodeKey]!
      const baseNodeKey = nodeKey(builderPlacement.coordinate, builderPlacement.segmentId)
      const builderRoot = findRoot(newUfState, baseNodeKey)
      const builderFeature = newUfState.featureData[builderRoot]

      if (builderFeature) {
        // Builder bonus triggers if:
        // 1. The placed tile is now part of the builder's feature
        const tileIsInFeature = builderFeature.nodes.some(
          n => n.coordinate.x === coord.x && n.coordinate.y === coord.y,
        )
        if (tileIsInFeature) {
          newExpansionData = {
            ...state.expansionData,
            tradersBuilders: { ...tbData, pendingBuilderBonus: true },
          }
        }
      }
    }
  }

  // ── Dragon & Fairy: Dragon Hoard and Dragon tile detection ─────────────────
  const dfData = newExpansionData['dragonFairy'] as DragonFairyState | undefined
  const tileDef = state.staticTileMap[state.currentTile.definitionId]
  let nextTurnPhase: GameState['turnPhase'] | 'DRAGON_ORIENT' | 'DRAGON_PLACE' = 'PLACE_MEEPLE'
  let finalPieces = state.pieces

  if (dfData && tileDef) {
    if (tileDef.isDragonHoard) {
      // Dragon Hoard: dragon spawns here, player orients, no meeple placement
      // moveDragon handles clearing dragonHeldBy automatically by overwriting the location.
      const newStateWithDragon = moveDragon({ ...state, expansionData: newExpansionData }, { type: 'BOARD', coordinate: coord })
      finalPieces = newStateWithDragon.pieces
      newExpansionData = {
        ...newStateWithDragon.expansionData,
        dragonFairy: {
          ...(newStateWithDragon.expansionData['dragonFairy'] as DragonFairyState),
          dragonInPlay: true,
          dragonFacing: null,  // Player must choose
          dragonMovement: null, // Ensure no movement state
        }
      }
      nextTurnPhase = 'DRAGON_ORIENT'
    }
  }

  const currentPlayerId = state.players[state.currentPlayerIndex].id

  // ── River: track the turn direction for U-turn prevention ──────────────────
  const riverData = newExpansionData['river'] as { bag: TileInstance[]; lastTurnDirection?: RiverTurnDirection | null } | undefined
  if (riverData && tileDef) {
    const hasRiverSeg = tileDef.segments.some(s => s.type === 'RIVER')
    if (hasRiverSeg) {
      const { entry, exit } = getRiverEntryExit(newBoard, state.staticTileMap, tileDef, state.currentTile.rotation, coord)
      const turn: RiverTurnDirection | null = (entry && exit)
        ? computeRiverTurn(entry, exit)
        : null
      newExpansionData = {
        ...newExpansionData,
        river: { ...riverData, lastTurnDirection: turn },
      }
    }
  }

  return {
    ...state,
    board: newBoard,
    currentTile: state.currentTile,  // keep for reference
    lastPlacedCoord: coord,
    lastPlacedCoordByPlayer: {
      ...state.lastPlacedCoordByPlayer,
      [currentPlayerId]: coord,
    },
    completedFeatureIds,
    featureUnionFind: newUfState,
    lastScoreEvents: [],
    turnPhase: nextTurnPhase,
    expansionData: newExpansionData,
    pieces: finalPieces,
  }
}

/**
 * Internal helper to apply meeple placement(s) to the game state.
 * Handles board tiles, union-find features, player supply, boardMeeples list,
 * and dragon reorientation.
 */
function applyMeeplePlacement(
  state: GameState,
  coord: Coordinate,
  segmentId: string,
  meepleType: MeepleType,
  secondaryMeepleType?: 'PIG' | 'BUILDER',
): GameState {
  const player = state.players[state.currentPlayerIndex]

  const meepleData = createMeeplePlacement(player.id, meepleType, segmentId, coord)
  const nKey = nodeKey(coord, segmentId)

  let secondaryMeepleData: MeeplePlacement | undefined
  let secondaryNKey: string | undefined
  if (secondaryMeepleType) {
    secondaryMeepleData = createMeeplePlacement(player.id, secondaryMeepleType, segmentId, coord)
    secondaryNKey = `${nKey}_${secondaryMeepleType}`
  }

  // Update the board tile's meeples record
  const tileKey = coordKey(coord)
  const existingTile = state.board.tiles[tileKey]!
  const updatedTileMeeples = { ...existingTile.meeples, [segmentId]: meepleData }
  if (secondaryMeepleType && secondaryMeepleData) {
    updatedTileMeeples[`${segmentId}_${secondaryMeepleType}`] = secondaryMeepleData
  }
  const updatedTile = {
    ...existingTile,
    meeples: updatedTileMeeples,
  }

  // Update the union-find feature's meeples list
  const feature = getFeature(state.featureUnionFind, nKey)
  const updatedMeeples = [...(feature?.meeples ?? []), meepleData]
  if (secondaryMeepleData) {
    updatedMeeples.push(secondaryMeepleData)
  }
  const newUfState = updateFeatureMeeples(state.featureUnionFind, nKey, updatedMeeples)

  // Deduct meeple(s) from player
  let currentState = state
  const updatedPlayers = state.players.map(p => {
    if (p.id !== player.id) return p

    const newAvailable = {
      ...p.meeples.available,
      [meepleType]: p.meeples.available[meepleType] - 1,
    }
    const newOnBoard = [...p.meeples.onBoard, nKey]

    // registry update
    const piece = Object.values(currentState.pieces).find(pc => pc.ownerId === p.id && pc.type === meepleType && pc.location.type === 'SUPPLY')
    if (piece) {
      currentState = movePiece(currentState, piece.id, { type: 'BOARD', coordinate: coord, segmentId })
    }

    if (secondaryMeepleType && secondaryNKey) {
      newAvailable[secondaryMeepleType] = (newAvailable[secondaryMeepleType] ?? 0) - 1
      newOnBoard.push(secondaryNKey)

      const sPiece = Object.values(currentState.pieces).find(pc => pc.ownerId === p.id && pc.type === secondaryMeepleType && pc.location.type === 'SUPPLY')
      if (sPiece) {
        currentState = movePiece(currentState, sPiece.id, { type: 'BOARD', coordinate: coord, segmentId })
      }
    }

    return {
      ...p,
      meeples: {
        ...p.meeples,
        available: newAvailable,
        onBoard: newOnBoard,
      },
    }
  })

  return {
    ...currentState,
    board: {
      ...state.board,
      tiles: { ...state.board.tiles, [tileKey]: updatedTile },
    },
    featureUnionFind: newUfState,
    players: updatedPlayers,
    boardMeeples: {
      ...state.boardMeeples,
      [nKey]: meepleData,
      ...(secondaryNKey && secondaryMeepleData ? { [secondaryNKey]: secondaryMeepleData } : {})
    },
    turnPhase: 'SCORE',
    expansionData: state.expansionData,
  }
}

export function placeMeeple(
  state: GameState,
  segmentId: string,
  meepleType: MeepleType = 'NORMAL',
  secondaryMeepleType?: 'PIG' | 'BUILDER',
): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE' || !state.currentTile) return state

  // Find the coordinate of the just-placed tile (last tile placed before meeple phase)
  const lastCoord = state.lastPlacedCoord ?? findLastPlacedCoord(state)
  if (!lastCoord) return state

  const player = state.players[state.currentPlayerIndex]

  const tbData = state.expansionData['tradersBuilders'] as { useModernRules?: boolean } | undefined
  const isModernRules = tbData?.useModernRules ?? false

  const isStandaloneSpecial = (meepleType === 'BUILDER' || meepleType === 'PIG') && !secondaryMeepleType
  
  // In Modern Rules, standalone placement of special meeples is NOT allowed.
  if (isStandaloneSpecial && isModernRules) {
    return state
  }

  const isValid = isStandaloneSpecial
    ? canPlaceBuilderOrPig(state.featureUnionFind, player, lastCoord, segmentId, meepleType as 'BUILDER' | 'PIG', getDragonPosition(state))
    : canPlaceMeeple(state.featureUnionFind, player, lastCoord, segmentId, meepleType, getDragonPosition(state))

  if (!isValid) {
    return state  // invalid meeple placement
  }

  // ── Simultaneous PIG/BUILDER Validation (C3.1) ─────────────────
  if (secondaryMeepleType) {
    if (meepleType !== 'NORMAL' && meepleType !== 'BIG') return state
    if (availableMeepleCount(player, secondaryMeepleType) <= 0) return state

    const def = state.staticTileMap[state.currentTile.definitionId]
    const segment = def?.segments.find(s => s.id === segmentId)
    if (!segment) return state

    if (secondaryMeepleType === 'PIG' && segment.type !== 'FIELD') return state
    if (secondaryMeepleType === 'BUILDER' && (segment.type !== 'CITY' && segment.type !== 'ROAD')) return state
  }

  return applyMeeplePlacement(state, lastCoord, segmentId, meepleType, secondaryMeepleType)
}

/**
 * Place a BUILDER or PIG on a tile that already exists on the board (not the last-placed tile).
 * Uses inverse placement rules: the feature must already contain a meeple from the player.
 */
export function placeMeepleOnExistingTile(
  state: GameState,
  coord: Coordinate,
  segmentId: string,
  meepleType: 'BUILDER' | 'PIG',
): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state

  const tbData = state.expansionData['tradersBuilders'] as { useModernRules?: boolean } | undefined
  if (tbData?.useModernRules) {
    // In C3.1 (Modern Terminology), Builders and Pigs CANNOT be placed on existing tiles independently.
    // They must be placed simultaneously with a normal meeple on the newly placed tile.
    return state
  }

  const player = state.players[state.currentPlayerIndex]

  if (!canPlaceBuilderOrPig(state.featureUnionFind, player, coord, segmentId, meepleType, getDragonPosition(state))) {
    return state
  }

  const meepleData = createMeeplePlacement(player.id, meepleType, segmentId, coord)
  const nKey = nodeKey(coord, segmentId)

  // Update the board tile's meeples record
  const tileKey = `${coord.x},${coord.y}`
  const existingTile = state.board.tiles[tileKey]!
  const updatedTile = {
    ...existingTile,
    meeples: { ...existingTile.meeples, [segmentId]: meepleData },
  }

  // Update the union-find feature's meeples list
  const feature = getFeature(state.featureUnionFind, nKey)
  const updatedMeeples = [...(feature?.meeples ?? []), meepleData]
  const newUfState = updateFeatureMeeples(state.featureUnionFind, nKey, updatedMeeples)

  // Deduct meeple from player
  const updatedPlayers = state.players.map(p =>
    p.id === player.id
      ? {
        ...p,
        meeples: {
          ...p.meeples,
          available: {
            ...p.meeples.available,
            [meepleType]: p.meeples.available[meepleType] - 1,
          },
          onBoard: [...p.meeples.onBoard, nKey],
        },
      }
      : p,
  )

  return {
    ...state,
    board: {
      ...state.board,
      tiles: { ...state.board.tiles, [tileKey]: updatedTile },
    },
    featureUnionFind: newUfState,
    players: updatedPlayers,
    boardMeeples: { ...state.boardMeeples, [nKey]: meepleData },
    turnPhase: 'SCORE',
  }
}

export function skipMeeple(state: GameState): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state
  return { ...state, turnPhase: 'SCORE' }
}

/**
 * Retrieve the player's Abbot from the board, scoring its feature immediately
 * (incomplete scoring). This is an alternative to placing a meeple during the
 * PLACE_MEEPLE phase.
 */
export function retrieveAbbot(
  state: GameState,
  coord: Coordinate,
  segmentId: string,
): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state

  const player = state.players[state.currentPlayerIndex]
  const nKey = nodeKey(coord, segmentId)

  // Validate: there must be an ABBOT belonging to the current player at this location
  const boardMeeple = state.boardMeeples[nKey]
  if (!boardMeeple || boardMeeple.meepleType !== 'ABBOT' || boardMeeple.playerId !== player.id) {
    return state
  }

  // Score the feature (incomplete scoring)
  const rules = resolveScoringRules(state)
  const feature = getFeature(state.featureUnionFind, nKey)
  if (!feature) return state

  const rule = rules.find(r => r.featureType === feature.type)
  const points = rule ? rule.scoreIncomplete(feature, state.featureUnionFind) : 0

  // Remove Abbot from feature meeples
  const updatedFeatureMeeples = feature.meeples.filter(m =>
    !(m.playerId === player.id && m.meepleType === 'ABBOT' && m.segmentId === segmentId &&
      m.coordinate.x === coord.x && m.coordinate.y === coord.y)
  )
  let newUfState = updateFeatureMeeples(state.featureUnionFind, nKey, updatedFeatureMeeples)

  // Remove from boardMeeples
  const newBoardMeeples = { ...state.boardMeeples }
  delete newBoardMeeples[nKey]

  // registry update
  const pieceId = Object.keys(state.pieces).find(k => {
    const p = state.pieces[k]
    return p.ownerId === player.id && p.type === 'ABBOT' &&
      p.location.type === 'BOARD' && coordKey(p.location.coordinate) === coordKey(coord) && p.location.segmentId === segmentId
  })
  if (pieceId) {
    state = movePiece(state, pieceId, { type: 'SUPPLY', playerId: player.id })
  }

  // Remove from tile meeples
  const tileKey = coordKey(coord)
  const existingTile = state.board.tiles[tileKey]
  let newBoardTiles = state.board.tiles
  if (existingTile) {
    const { [segmentId]: _removed, ...remainingMeeples } = existingTile.meeples
    newBoardTiles = {
      ...newBoardTiles,
      [tileKey]: { ...existingTile, meeples: remainingMeeples },
    }
  }

  // Return Abbot to player and add score
  const updatedPlayers = state.players.map(p =>
    p.id === player.id
      ? {
        ...p,
        score: p.score + points,
        meeples: {
          ...p.meeples,
          available: { ...p.meeples.available, ABBOT: p.meeples.available.ABBOT + 1 },
          onBoard: p.meeples.onBoard.filter(k => k !== nKey),
        },
        scoreBreakdown: {
          ...p.scoreBreakdown,
          [feature.type === 'GARDEN' ? 'GARDEN' : 'CLOISTER']:
            ((p.scoreBreakdown[feature.type === 'GARDEN' ? 'GARDEN' : 'CLOISTER']) ?? 0) + points,
        },
      }
      : p,
  )

  const scoreEvent: ScoreEvent = {
    featureId: feature.id,
    featureType: feature.type,
    scores: { [player.id]: points },
    tiles: feature.nodes.map(n => n.coordinate),
    isEndGame: false,
  }

  return {
    ...state,
    board: { ...state.board, tiles: newBoardTiles },
    boardMeeples: newBoardMeeples,
    featureUnionFind: newUfState,
    players: updatedPlayers,
    lastScoreEvents: [scoreEvent],
    turnPhase: 'SCORE',
  }
}


export function scoreFeatureCompletion(state: GameState, featureId: string): { state: GameState; event: ScoreEvent | null } {
  const rules = resolveScoringRules(state)
  const events = scoreCompletedFeatures([featureId], state.featureUnionFind, state.players, rules)
  if (events.length === 0) return { state, event: null }

  const event = events[0]
  let updatedPlayers = applyScoreEvents(state.players, [event])
  let updatedBoardMeeples = { ...state.boardMeeples }
  let updatedUfState = { ...state.featureUnionFind }
  let updatedBoardTiles = { ...state.board.tiles }

  const feature = state.featureUnionFind.featureData[featureId]
  if (feature) {
    for (const meeple of feature.meeples) {
      const owner = updatedPlayers.find(p => p.id === meeple.playerId)
      if (!owner) continue

      const baseNodeKey = nodeKey(meeple.coordinate, meeple.segmentId)
      const secondaryNKey = `${baseNodeKey}_${meeple.meepleType}`

      let nKey: string | undefined
      if (owner.meeples.onBoard.includes(secondaryNKey) && updatedBoardMeeples[secondaryNKey]?.meepleType === meeple.meepleType) {
        nKey = secondaryNKey
      } else if (owner.meeples.onBoard.includes(baseNodeKey) && updatedBoardMeeples[baseNodeKey]?.meepleType === meeple.meepleType) {
        nKey = baseNodeKey
      } else {
        nKey = owner.meeples.onBoard.find(k => (k === baseNodeKey || k.startsWith(`${baseNodeKey}_`)) && updatedBoardMeeples[k]?.meepleType === meeple.meepleType)
      }

      if (!nKey) continue

      delete updatedBoardMeeples[nKey]

      const [tileCoordKey, exactSegmentId] = nKey.split(':') as [string, string]

      // Update registry
      const pieceId = Object.keys(state.pieces).find(k => {
        const p = state.pieces[k]
        return p.ownerId === meeple.playerId && p.type === meeple.meepleType &&
          p.location.type === 'BOARD' && coordKey(p.location.coordinate) === tileCoordKey && p.location.segmentId === exactSegmentId
      })
      if (pieceId) {
        state = movePiece(state, pieceId, { type: 'SUPPLY', playerId: meeple.playerId })
      }

      const tile = updatedBoardTiles[tileCoordKey]
      if (tile) {
        const { [exactSegmentId]: _removed, ...remainingMeeples } = tile.meeples
        updatedBoardTiles = {
          ...updatedBoardTiles,
          [tileCoordKey]: { ...tile, meeples: remainingMeeples },
        }
      }

      updatedPlayers = updatedPlayers.map(p =>
        p.id === meeple.playerId
          ? {
            ...p,
            meeples: {
              ...p.meeples,
              available: {
                ...p.meeples.available,
                [meeple.meepleType]: p.meeples.available[meeple.meepleType as MeepleType] + 1,
              },
              onBoard: p.meeples.onBoard.filter(k => k !== nKey),
            },
          }
          : p
      )
    }

    // Preserve controlling player IDs before clearing meeples (for territory overlay)
    const strength: Record<string, number> = {}
    for (const m of feature.meeples) {
      strength[m.playerId] = (strength[m.playerId] ?? 0) + (m.meepleType === 'BIG' ? 2 : 1)
    }
    const maxStr = Math.max(...Object.values(strength))
    const lastOwnerIds = Object.keys(strength).filter(id => strength[id] === maxStr)

    updatedUfState = updateFeatureMeeples(updatedUfState, featureId, [])
    // Store lastOwnerIds on the feature after meeples cleared
    if (updatedUfState.featureData[featureId]) {
      updatedUfState = {
        ...updatedUfState,
        featureData: {
          ...updatedUfState.featureData,
          [featureId]: { ...updatedUfState.featureData[featureId], lastOwnerIds },
        },
      }
    }
  }

  // Handle commodity tokens (T&B)
  if (feature && feature.type === 'CITY' && feature.isComplete) {
    const tokenDist = distributeCommodityTokens(feature)
    updatedPlayers = updatedPlayers.map(p => {
      const tokens = tokenDist[p.id]
      if (!tokens) return p
      return {
        ...p,
        traderTokens: {
          WINE: p.traderTokens.WINE + (tokens.WINE ?? 0),
          WHEAT: p.traderTokens.WHEAT + (tokens.WHEAT ?? 0),
          CLOTH: p.traderTokens.CLOTH + (tokens.CLOTH ?? 0),
        }
      }
    })
  }

  return {
    state: {
      ...state,
      players: updatedPlayers,
      board: { ...state.board, tiles: updatedBoardTiles },
      boardMeeples: updatedBoardMeeples,
      featureUnionFind: updatedUfState,
      completedFeatureIds: state.completedFeatureIds.filter(fid => fid !== featureId),
    },
    event
  }
}

export function endTurn(state: GameState, preScoredFeatureIds?: string[]): GameState {
  if (state.turnPhase !== 'SCORE') return state

  let currentState = state
  const allEvents: ScoreEvent[] = []

  // When called from the store's processScoringSequence, features are already
  // scored with animations.  preScoredFeatureIds carries the original IDs so
  // pig detection still knows which cities just completed.
  // The events were pre-collected and stored on state.lastScoreEvents.
  const featureIds = preScoredFeatureIds ?? [...state.completedFeatureIds]

  if (!preScoredFeatureIds) {
    for (const id of featureIds) {
      const { state: nextState, event } = scoreFeatureCompletion(currentState, id)
      currentState = nextState
      if (event) allEvents.push(event)
    }
  } else {
    // Use pre-collected events from processScoringSequence (stored on state)
    allEvents.push(...state.lastScoreEvents)
    // Ensure featureIds are preserved in currentState for completeTurnTransition
    currentState = { ...currentState, completedFeatureIds: featureIds }
  }

  // ── Pig Sequence (C3.1) ───────────────────────────────────────
  const tbData = currentState.expansionData['tradersBuilders'] as
    { isBuilderBonusTurn: boolean; pendingBuilderBonus: boolean; useModernRules?: boolean; usesC31Tiles?: boolean } | undefined

  if (tbData?.useModernRules) {
    // 1. Find all newly completed cities with at least 1 pennant (even unoccupied ones)
    const pennantedCityFeatureIds = featureIds
      .filter(id => {
        const f = currentState.featureUnionFind.featureData[id]
        return f && f.type === 'CITY' && f.pennantCount > 0
      })

    if (pennantedCityFeatureIds.length > 0) {
      // 2. Find all fields touching these cities
      //    touchingCityIds stores original node keys which may differ from the
      //    root keys in featureIds after union-find merges — resolve through UF.
      const pennantedCitySet = new Set(pennantedCityFeatureIds)
      const triggeredFieldIds = new Set<string>()
      for (const [fId, f] of Object.entries(currentState.featureUnionFind.featureData)) {
        if (f.type !== 'FIELD') continue
        const touches = f.touchingCityIds.some(touchKey => {
          const root = findRoot(currentState.featureUnionFind, touchKey)
          return pennantedCitySet.has(root)
        })
        if (touches) triggeredFieldIds.add(fId)
      }

      // 3. For every triggered field, score Pigs and return them
      const pendingFarmerReturnsAllData: { playerId: string; pigNodeKey: string; fieldFeatureId: string; points: number, field: any, meeple: any }[] = []

      for (const fId of triggeredFieldIds) {
        const field = currentState.featureUnionFind.featureData[fId]
        if (!field) continue

        // C3.1: "Score 3 points per completed city in this field" (same as incomplete farm scoring logic)
        const completedCities = countAdjacentCompletedCities(field, currentState.featureUnionFind)
        const points = completedCities * 3

        for (const meeple of field.meeples) {
          if (meeple.meepleType === 'PIG') {
            const baseNodeKey = nodeKey(meeple.coordinate, meeple.segmentId)
            const pigNodeKey = `${baseNodeKey}_PIG`

            pendingFarmerReturnsAllData.push({
              playerId: meeple.playerId,
              pigNodeKey,
              fieldFeatureId: fId,
              points,
              field,
              meeple
            })
          }
        }
      }

      if (pendingFarmerReturnsAllData.length > 0) {
        // Sort sequence clockwise starting from current player
        pendingFarmerReturnsAllData.sort((a, b) => {
          const idxA = currentState.players.findIndex(p => p.id === a.playerId)
          const idxB = currentState.players.findIndex(p => p.id === b.playerId)
          const relA = (idxA - currentState.currentPlayerIndex + currentState.players.length) % currentState.players.length
          const relB = (idxB - currentState.currentPlayerIndex + currentState.players.length) % currentState.players.length
          return relA - relB
        })

        // Apply state updates in exactly the clockwise order
        for (const returnData of pendingFarmerReturnsAllData) {
          const { meeple, field, points, pigNodeKey, fieldFeatureId: fId } = returnData

          // Add score to player immediately
          currentState = {
            ...currentState,
            players: currentState.players.map(p =>
              p.id === meeple.playerId ? { ...p, score: p.score + points } : p
            )
          }

          // Return the Pig to player's supply
          currentState = {
            ...currentState,
            players: currentState.players.map(p => {
              if (p.id !== meeple.playerId) return p
              return {
                ...p,
                meeples: {
                  ...p.meeples,
                  available: { ...p.meeples.available, PIG: p.meeples.available.PIG + 1 },
                  onBoard: p.meeples.onBoard.filter(k => k !== pigNodeKey)
                }
              }
            })
          }

          // Remove Pig from field feature
          const updatedMeeples = currentState.featureUnionFind.featureData[fId]?.meeples.filter(m => m !== meeple) ?? []
          currentState = {
            ...currentState,
            featureUnionFind: updateFeatureMeeples(currentState.featureUnionFind, fId, updatedMeeples)
          }

          // Remove Pig from board meeples list and tile
          const newBoardMeeples = { ...currentState.boardMeeples }
          delete newBoardMeeples[pigNodeKey]
          currentState = { ...currentState, boardMeeples: newBoardMeeples }

          const tileKey = coordKey(meeple.coordinate)
          const existingTile = currentState.board.tiles[tileKey]
          if (existingTile) {
            const newTileMeeples = { ...existingTile.meeples }
            // tile.meeples uses "segmentId_PIG" format (not the full node key "x,y:segmentId_PIG")
            delete newTileMeeples[`${meeple.segmentId}_PIG`]
            currentState = { ...currentState, board: { ...currentState.board, tiles: { ...currentState.board.tiles, [tileKey]: { ...existingTile, meeples: newTileMeeples } } } }
          }

          // Record a scoring event for the UI
          allEvents.push({
            featureId: fId,
            featureType: 'FIELD',
            scores: { [meeple.playerId]: points },
            tiles: field.nodes.map((n: any) => n.coordinate),
            isEndGame: false,
          })
        }

        const pendingFarmerReturns = pendingFarmerReturnsAllData.map(r => ({
          playerId: r.playerId,
          pigNodeKey: r.pigNodeKey,
          fieldFeatureId: r.fieldFeatureId,
          points: r.points
        }))

        return {
          ...currentState,
          lastScoreEvents: allEvents,
          turnPhase: 'RETURN_FARMER',
          expansionData: {
            ...currentState.expansionData,
            tradersBuilders: {
              ...tbData,
              pendingFarmerReturns
            }
          },
          // completedFeatureIds is preserved for completeTurnTransition
        }
      }
    }
  }

  return completeTurnTransition(currentState, allEvents, featureIds)
}

/**
 * Executes the final portion of turn-ending operations: Builder Return, Double Turn logic, and Fairy Movement.
 */
export function completeTurnTransition(currentState: GameState, allEvents: ScoreEvent[], featureIds: string[] = []): GameState {
  // ── Builder bonus turn logic (T&B) ───────────────────────────────────────
  const tbData = currentState.expansionData['tradersBuilders'] as
    { isBuilderBonusTurn: boolean; pendingBuilderBonus: boolean; useModernRules?: boolean; usesC31Tiles?: boolean } | undefined
  const pendingBonus = tbData?.pendingBuilderBonus ?? false
  const isAlreadyBonusTurn = tbData?.isBuilderBonusTurn ?? false

  let nextPlayerIndex: number
  let nextTbData: typeof tbData

  let stateAfterBuilderReturn = currentState
  if (pendingBonus && !isAlreadyBonusTurn) {
    console.log('[GameEngine] completeTurnTransition: STARTING double turn for player', currentState.currentPlayerIndex);
    nextPlayerIndex = currentState.currentPlayerIndex
    nextTbData = { isBuilderBonusTurn: true, pendingBuilderBonus: false, useModernRules: tbData?.useModernRules, usesC31Tiles: (tbData as any)?.usesC31Tiles }

    if (tbData?.useModernRules) {
      // Find and instantly return the Builder belonging to the current player
      const currentPlayerId = currentState.players[nextPlayerIndex].id

      const builderBoardEntry = Object.entries(currentState.boardMeeples).find(
        ([, m]) => m.playerId === currentPlayerId && m.meepleType === 'BUILDER'
      )

      if (builderBoardEntry) {
        const [builderNodeKey, builderPlacement] = builderBoardEntry
        const baseNodeKey = nodeKey(builderPlacement.coordinate, builderPlacement.segmentId)

        // Remove from boardMeeples
        const newBoardMeeples = { ...currentState.boardMeeples }
        delete newBoardMeeples[builderNodeKey]

        // Remove from UnionFind
        const rootKey = findRoot(currentState.featureUnionFind, baseNodeKey)
        const feature = currentState.featureUnionFind.featureData[rootKey]
        let newUfState = currentState.featureUnionFind
        if (feature) {
          const newMeeples = feature.meeples.filter(m => m.meepleType !== 'BUILDER' || m.playerId !== currentPlayerId)
          newUfState = updateFeatureMeeples(newUfState, rootKey, newMeeples)
        }

        // Remove from Player and refund availability
        const newPlayers = currentState.players.map(p => {
          if (p.id !== currentPlayerId) return p
          return {
            ...p,
            meeples: {
              ...p.meeples,
              available: { ...p.meeples.available, BUILDER: p.meeples.available.BUILDER + 1 },
              onBoard: p.meeples.onBoard.filter(k => k !== builderNodeKey)
            }
          }
        })

        // Remove from tile
        // tile.meeples uses "segmentId_BUILDER" format (not the full node key "x,y:segmentId_BUILDER")
        const tileKey = coordKey(builderPlacement.coordinate)
        const tile = currentState.board.tiles[tileKey]
        let newBoardTiles = currentState.board.tiles
        if (tile) {
          const updatedMeeples = { ...tile.meeples }
          delete updatedMeeples[`${builderPlacement.segmentId}_BUILDER`]
          newBoardTiles = { ...newBoardTiles, [tileKey]: { ...tile, meeples: updatedMeeples } }
        }

        stateAfterBuilderReturn = {
          ...currentState,
          boardMeeples: newBoardMeeples,
          featureUnionFind: newUfState,
          players: newPlayers,
          board: { ...currentState.board, tiles: newBoardTiles }
        }
      }
    }
  } else {
    console.log('[GameEngine] Ending turn (shifting to next player)', { pendingBonus, isAlreadyBonusTurn });
    nextPlayerIndex = (currentState.currentPlayerIndex + 1) % currentState.players.length
    nextTbData = tbData ? { ...tbData, isBuilderBonusTurn: false, pendingBuilderBonus: false } : undefined
  }


  // ── Dragon & Fairy: fairy scoring & fairy move opportunity ──────────────
  const dfData = currentState.expansionData['dragonFairy'] as DragonFairyState | undefined
  let dfUpdated: DragonFairyState | undefined

  if (dfData) {
    let currentDf = { ...dfData }
    let fairyPlayers = [...stateAfterBuilderReturn.players]
    const fairyPos = getFairyPosition(currentState)

    if (fairyPos) {
      const { coordinate: fCoord, segmentId: fSegId } = fairyPos
      const fNodeKey = nodeKey(fCoord, fSegId)
      let fairyScoredThisTurn = false

      for (const event of allEvents) {
        const feature = stateAfterBuilderReturn.featureUnionFind.featureData[event.featureId]
        if (!feature) continue

        const fairyInFeature = feature.nodes.some(
          n => n.coordinate.x === fCoord.x && n.coordinate.y === fCoord.y && n.segmentId === fSegId
        )

        if (fairyInFeature) {
          const meeple = stateAfterBuilderReturn.boardMeeples[fNodeKey]
          if (meeple) {
            fairyPlayers = fairyPlayers.map(p =>
              p.id === meeple.playerId ? { ...p, score: p.score + 3 } : p
            )
          }
          fairyScoredThisTurn = true
          break
        }
      }

      if (fairyScoredThisTurn) {
        stateAfterBuilderReturn = moveFairyToLocation(stateAfterBuilderReturn, { type: 'OUT_OF_PLAY' })
      }
    }

    const currentPlayer = stateAfterBuilderReturn.players[stateAfterBuilderReturn.currentPlayerIndex]
    let scoredZeroOnAtLeastOne = false;

    for (const id of featureIds) {
      const f = currentState.featureUnionFind.featureData[id];
      if (f && (f.type === 'ROAD' || f.type === 'CITY')) {
        const event = allEvents.find(e => e.featureId === id);
        const points = event?.scores[currentPlayer.id] ?? 0;
        if (points === 0) {
          scoredZeroOnAtLeastOne = true;
          break;
        }
      }
    }

    if (scoredZeroOnAtLeastOne && !currentDf.canMoveFairy) {
      currentDf.canMoveFairy = true
    }
    dfUpdated = currentDf
    stateAfterBuilderReturn = { ...stateAfterBuilderReturn, players: fairyPlayers, expansionData: { ...stateAfterBuilderReturn.expansionData, dragonFairy: dfUpdated } }
  }

  const nextExpansionData: Record<string, unknown> = {
    ...stateAfterBuilderReturn.expansionData,
    ...(tbData !== undefined ? { tradersBuilders: nextTbData } : {}),
  }

  const updatedBoardTiles = stateAfterBuilderReturn.board.tiles
  const updatedPlayers = stateAfterBuilderReturn.players
  const updatedUfState = stateAfterBuilderReturn.featureUnionFind
  const updatedBoardMeeples = stateAfterBuilderReturn.boardMeeples

  if (dfUpdated?.canMoveFairy) {
    const targets = getFairyMoveTargets(stateAfterBuilderReturn);
    if (targets.length > 0) {
      return {
        ...stateAfterBuilderReturn,
        board: { ...currentState.board, tiles: updatedBoardTiles },
        players: updatedPlayers,
        currentPlayerIndex: stateAfterBuilderReturn.currentPlayerIndex,
        featureUnionFind: updatedUfState,
        boardMeeples: updatedBoardMeeples,
        currentTile: stateAfterBuilderReturn.currentTile,
        lastPlacedCoord: null,
        completedFeatureIds: [],
        lastScoreEvents: allEvents,
        turnPhase: 'FAIRY_MOVE',
        expansionData: { ...nextExpansionData, dragonFairy: dfUpdated },
      }
    } else {
      dfUpdated.canMoveFairy = false;
    }
  }

  const nextPlayer = updatedPlayers[nextPlayerIndex]
  let nextTurnPhase: GameState['turnPhase'] = 'DRAW_TILE'
  if (getDragonHeldBy(stateAfterBuilderReturn) === nextPlayer?.id) {
    nextTurnPhase = 'DRAGON_PLACE'
  }

  return {
    ...stateAfterBuilderReturn,
    board: { ...currentState.board, tiles: updatedBoardTiles },
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    featureUnionFind: updatedUfState,
    boardMeeples: updatedBoardMeeples,
    currentTile: null,
    lastPlacedCoord: null,
    completedFeatureIds: [],
    lastScoreEvents: allEvents,
    turnPhase: nextTurnPhase,
    expansionData: { ...nextExpansionData, ...(dfUpdated ? { dragonFairy: dfUpdated } : {}) },
  }
}

/**
 * Resolves a player's choice during the RETURN_FARMER sequence.
 * If the queue is empty, advances to completeTurnTransition.
 */
export function resolveFarmerReturn(state: GameState, returnFarmer: boolean): GameState {
  if (state.turnPhase !== 'RETURN_FARMER') return state

  const tbData = state.expansionData['tradersBuilders'] as any
  const queue = tbData?.pendingFarmerReturns as { playerId: string; pigNodeKey: string; fieldFeatureId: string; points: number }[] | undefined

  if (!queue || queue.length === 0) {
    return completeTurnTransition(state, state.lastScoreEvents, state.completedFeatureIds)
  }

  const prompt = queue[0]
  let currentState = state

  if (returnFarmer) {
    const fieldId = prompt.fieldFeatureId
    const fieldFeature = currentState.featureUnionFind.featureData[fieldId]

    // Find one of the player's standard meeples (NORMAL or BIG) on this field
    const farmer = fieldFeature?.meeples.find(m => m.playerId === prompt.playerId && (m.meepleType === 'NORMAL' || m.meepleType === 'BIG'))

    if (farmer) {
      const farmerNodeKey = nodeKey(farmer.coordinate, farmer.segmentId)

      // Remove from Player and refund availability
      currentState = {
        ...currentState,
        players: currentState.players.map(p => {
          if (p.id !== farmer.playerId) return p
          return {
            ...p,
            meeples: {
              ...p.meeples,
              available: { ...p.meeples.available, [farmer.meepleType]: p.meeples.available[farmer.meepleType as MeepleType] + 1 },
              onBoard: p.meeples.onBoard.filter(k => k !== farmerNodeKey)
            }
          }
        })
      }

      // Remove from UnionFind
      const updatedMeeples = fieldFeature.meeples.filter(m => m !== farmer)
      currentState = {
        ...currentState,
        featureUnionFind: updateFeatureMeeples(currentState.featureUnionFind, fieldId, updatedMeeples)
      }

      // Remove from boardMeeples
      const newBoardMeeples = { ...currentState.boardMeeples }
      delete newBoardMeeples[farmerNodeKey]
      currentState = { ...currentState, boardMeeples: newBoardMeeples }

      // Remove from tile
      const tileKey = coordKey(farmer.coordinate)
      const existingTile = currentState.board.tiles[tileKey]
      if (existingTile) {
        const newTileMeeples = { ...existingTile.meeples }
        delete newTileMeeples[farmer.segmentId]
        currentState = { ...currentState, board: { ...currentState.board, tiles: { ...currentState.board.tiles, [tileKey]: { ...existingTile, meeples: newTileMeeples } } } }
      }
    }
  }

  const remainingQueue = queue.slice(1)

  if (remainingQueue.length > 0) {
    return {
      ...currentState,
      expansionData: {
        ...currentState.expansionData,
        tradersBuilders: { ...tbData, pendingFarmerReturns: remainingQueue }
      }
    }
  }

  // Finished queue! Transition using the current computed state
  const finalState = {
    ...currentState,
    expansionData: {
      ...currentState.expansionData,
      tradersBuilders: { ...tbData, pendingFarmerReturns: undefined }
    }
  }

  return completeTurnTransition(finalState, finalState.lastScoreEvents)
}

// ─── End game ─────────────────────────────────────────────────────────────────

export function endGame(state: GameState): GameState {
  const completedFeatureIds = new Set(
    Object.keys(state.featureUnionFind.featureData).filter(
      k => state.featureUnionFind.featureData[k]?.isComplete
    )
  )

  const rules = resolveScoringRules(state)
  const endGameEvents = scoreAllRemainingFeatures(
    state.featureUnionFind,
    completedFeatureIds,
    state.players,
    rules,
  )

  let finalPlayers = applyScoreEvents(state.players, endGameEvents)
  let allEndGameEvents = endGameEvents

  // ── Trader bonus (T&B) ───────────────────────────────────────────────────
  const expansions = state.expansionData.expansions as string[] | undefined
  if (expansions?.includes('traders-builders')) {
    const traderBonusEvents = scoreTradersBonus(finalPlayers)
    if (traderBonusEvents.length > 0) {
      finalPlayers = applyScoreEvents(finalPlayers, traderBonusEvents)
      allEndGameEvents = [...endGameEvents, ...traderBonusEvents]
    }
  }

  return {
    ...state,
    phase: 'END',
    turnPhase: 'NEXT_PLAYER',
    players: finalPlayers,
    lastScoreEvents: allEndGameEvents,
  }
}

// ─── Query functions ──────────────────────────────────────────────────────────

export function getValidPlacements(state: GameState): Coordinate[] {
  if (!state.currentTile || state.turnPhase !== 'PLACE_TILE') return []
  const riverData = state.expansionData['river'] as { bag: TileInstance[]; lastTurnDirection?: RiverTurnDirection | null } | undefined
  if (riverData) {
    const tileDef = state.staticTileMap[state.currentTile.definitionId]
    let isRiver = false
    if (tileDef) {
      isRiver = tileDef.segments.some(s => s.type === 'RIVER')
      if (!isRiver && tileDef.linkedTiles) {
        for (const lt of tileDef.linkedTiles) {
          const linkedDef = state.staticTileMap[lt.definitionId]
          if (linkedDef && linkedDef.segments.some(s => s.type === 'RIVER')) {
            isRiver = true
            break
          }
        }
      }
    }
    if (isRiver) {
      return getAllPotentialRiverPlacements(
        state.board, state.staticTileMap, state.currentTile,
        riverData.lastTurnDirection ?? null,
      )
    }
  }
  return getValidPositions(state.board, state.staticTileMap, state.currentTile)
}

export function getValidTileRotations(state: GameState, coord: Coordinate): Rotation[] {
  if (!state.currentTile) return []
  const riverData = state.expansionData['river'] as { bag: TileInstance[]; lastTurnDirection?: RiverTurnDirection | null } | undefined
  if (riverData) {
    const tileDef = state.staticTileMap[state.currentTile.definitionId]
    let isRiver = false
    if (tileDef) {
      isRiver = tileDef.segments.some(s => s.type === 'RIVER')
      if (!isRiver && tileDef.linkedTiles) {
        for (const lt of tileDef.linkedTiles) {
          const linkedDef = state.staticTileMap[lt.definitionId]
          if (linkedDef && linkedDef.segments.some(s => s.type === 'RIVER')) {
            isRiver = true
            break
          }
        }
      }
    }
    if (isRiver) {
      return getValidRiverRotations(
        state.board, state.staticTileMap, state.currentTile, coord,
        riverData.lastTurnDirection ?? null,
      )
    }
  }
  return getValidRotations(state.board, state.staticTileMap, state.currentTile, coord)
}

/**
 * State-aware version of getAllPotentialPlacements.
 * Applies river U-turn constraints when appropriate.
 */
export function getPotentialPlacementsForState(state: GameState): Coordinate[] {
  if (!state.currentTile) return []
  const riverData = state.expansionData['river'] as { bag: TileInstance[]; lastTurnDirection?: RiverTurnDirection | null } | undefined
  if (riverData) {
    const tileDef = state.staticTileMap[state.currentTile.definitionId]

    // Check if the tile or any of its linked tiles have a RIVER segment
    let isRiver = false
    if (tileDef) {
      isRiver = tileDef.segments.some(s => s.type === 'RIVER')
      if (!isRiver && tileDef.linkedTiles) {
        for (const lt of tileDef.linkedTiles) {
          const linkedDef = state.staticTileMap[lt.definitionId]
          if (linkedDef && linkedDef.segments.some(s => s.type === 'RIVER')) {
            isRiver = true
            break
          }
        }
      }
    }
    console.log("getPotentialPlacementsForState: isRiver=", isRiver, "riverData=", riverData ? "exists" : "undefined", "tile=", state.currentTile.definitionId)
    if (isRiver) {
      return getAllPotentialRiverPlacements(
        state.board, state.staticTileMap, state.currentTile,
        riverData.lastTurnDirection ?? null,
      )
    }
  }
  return getAllPotentialPlacements(state.board, state.staticTileMap, state.currentTile)
}

/**
 * State-aware isValidPlacement that also checks river U-turn constraint.
 */
export function isValidPlacementForState(
  state: GameState,
  instance: TileInstance,
  coord: Coordinate,
): boolean {
  if (!isValidPlacement(state.board, state.staticTileMap, instance, coord)) return false
  const riverData = state.expansionData['river'] as { bag: TileInstance[]; lastTurnDirection?: RiverTurnDirection | null } | undefined
  if (riverData) {
    const tileDef = state.staticTileMap[instance.definitionId]
    let isRiver = false
    if (tileDef) {
      isRiver = tileDef.segments.some(s => s.type === 'RIVER')
      if (!isRiver && tileDef.linkedTiles) {
        for (const lt of tileDef.linkedTiles) {
          const linkedDef = state.staticTileMap[lt.definitionId]
          if (linkedDef && linkedDef.segments.some(s => s.type === 'RIVER')) {
            isRiver = true
            break
          }
        }
      }
    }
    if (isRiver) {
      return getValidRiverRotations(
        state.board, state.staticTileMap, instance, coord,
        riverData.lastTurnDirection ?? null,
      ).includes(instance.rotation)
    }
  }
  return true
}

export function getAvailableSegmentsForMeeple(state: GameState): string[] {
  const lastCoord = state.lastPlacedCoord ?? findLastPlacedCoord(state)
  if (!lastCoord) return []

  const player = state.players[state.currentPlayerIndex]
  return getPlaceableSegments(state.featureUnionFind, state.staticTileMap, state.board, lastCoord, player, getDragonPosition(state))
}

// ─── Private helpers ──────────────────────────────────────────────────────────

// ... (existing helper)
function findLastPlacedCoord(state: GameState): Coordinate | null {
  if (!state.currentTile) return null

  // The last placed tile is the one matching currentTile that has an empty meeples record
  // and whose definitionId matches. In case of ties (multiple same tiles), return the last one
  // that was added — but since we don't have a timestamp, we rely on the board structure.
  // This is a known limitation; adding lastPlacedCoord to GameState would fix it cleanly.

  for (const tile of Object.values(state.board.tiles)) {
    if (
      tile.definitionId === state.currentTile.definitionId &&
      tile.rotation === state.currentTile.rotation &&
      Object.keys(tile.meeples).length === 0 &&
      // Must be recently placed (not on the board meeples yet from this turn)
      !state.boardMeeples[coordKey(tile.coordinate)]
    ) {
      return tile.coordinate
    }
  }
  return null
}

// ─── Dragon & Fairy functions ──────────────────────────────────────────────

const DIRECTION_DELTAS: Record<Direction, { dx: number; dy: number }> = {
  NORTH: { dx: 0, dy: -1 },
  EAST: { dx: 1, dy: 0 },
  SOUTH: { dx: 0, dy: 1 },
  WEST: { dx: -1, dy: 0 },
}

function getDfState(state: GameState): DragonFairyState | undefined {
  return state.expansionData['dragonFairy'] as DragonFairyState | undefined
}

/**
 * Get valid dragon orientations (C3.1 rules).
 * 1. Must face a direction with a directly adjacent tile.
 * 2. If any such direction has a meeple in unbroken line of sight,
 *    restrict to only those directions (gaps interrupt LoS).
 */
export function getValidDragonOrientations(state: GameState): Direction[] {
  const dragonPos = getDragonPosition(state)
  if (!dragonPos) return []
  const pos = dragonPos

  // Step 1: directions with an adjacent tile
  const adjacentDirs: Direction[] = []
  for (const dir of ['NORTH', 'EAST', 'SOUTH', 'WEST'] as Direction[]) {
    const { dx, dy } = DIRECTION_DELTAS[dir]
    if (state.board.tiles[coordKey({ x: pos.x + dx, y: pos.y + dy })]) {
      adjacentDirs.push(dir)
    }
  }

  if (adjacentDirs.length === 0) return []

  // Step 2: of those, which have a meeple in unbroken LoS?
  const dirsWithMeeple: Direction[] = []
  for (const dir of adjacentDirs) {
    const { dx, dy } = DIRECTION_DELTAS[dir]
    let x = pos.x + dx
    let y = pos.y + dy

    while (state.board.tiles[coordKey({ x, y })]) {
      const tileKey = coordKey({ x, y })
      const hasMeeple = Object.keys(state.boardMeeples).some(k => k.startsWith(tileKey + ':'))
      if (hasMeeple) {
        dirsWithMeeple.push(dir)
        break
      }
      x += dx
      y += dy
    }
  }

  // If any direction has a meeple in LoS, restrict to those; otherwise all adjacent dirs are valid
  return dirsWithMeeple.length > 0 ? dirsWithMeeple : adjacentDirs
}

/**
 * Set the dragon's facing direction, execute movement, then skip to SCORE
 * (no meeple placement allowed on Dragon Hoard tiles).
 */
export function orientDragon(state: GameState, direction: Direction): GameState {
  if (state.turnPhase !== 'DRAGON_ORIENT') return state

  const dfData = getDfState(state)
  const dragonPos = getDragonPosition(state)
  if (!dfData || !dragonPos) return state

  const updatedDf: DragonFairyState = {
    ...dfData,
    dragonFacing: direction,
  }

  // If we are in a movement sequence, determine next phase
  if (dfData.dragonMovement) {
    const remaining = dfData.dragonMovement.movesRemaining
    if (remaining > 0) {
      // Immediately execute the next movement step with the new facing
      const nextState = {
        ...state,
        expansionData: { ...state.expansionData, dragonFairy: updatedDf },
      }
      return executeDragonMovement(nextState)
    } else {
      return {
        ...state,
        turnPhase: dfData.dragonMovement.nextPhase,
        expansionData: { ...state.expansionData, dragonFairy: { ...updatedDf, dragonMovement: null } },
      }
    }
  }

  // Fallback for Dragon Hoard or other orientation triggers
  return {
    ...state,
    turnPhase: 'SCORE',
    expansionData: { ...state.expansionData, dragonFairy: updatedDf },
  }
}

/**
 * Get all coordinates of Dragon Hoard tiles currently on the board.
 */
export function getDragonHoardTilesOnBoard(state: GameState): Coordinate[] {
  const coords: Coordinate[] = []
  for (const [key, tile] of Object.entries(state.board.tiles)) {
    const def = state.staticTileMap[tile.definitionId]
    if (def?.isDragonHoard) {
      coords.push(keyToCoord(key))
    }
  }
  return coords
}

/**
 * Place the captured dragon on a Dragon Hoard tile and enter orientation phase.
 */
export function placeDragonOnHoard(state: GameState, coord: Coordinate): GameState {
  if (state.turnPhase !== 'DRAGON_PLACE') return state

  const dfData = getDfState(state)
  if (!dfData) return state

  // Validate the target is a Dragon Hoard tile on the board
  const tileKey = coordKey(coord)
  const tile = state.board.tiles[tileKey]
  if (!tile) return state
  const def = state.staticTileMap[tile.definitionId]
  if (!def?.isDragonHoard) return state

  // Use robust helper to update location (clears held state)
  const newState = moveDragon(state, { type: 'BOARD', coordinate: coord })

  const updatedDf: DragonFairyState = {
    ...dfData,
    dragonFacing: null,  // Player must orient
    dragonInPlay: true,
  }

  return {
    ...newState,
    turnPhase: 'DRAGON_ORIENT',
    expansionData: { ...newState.expansionData, dragonFairy: updatedDf },
  }
}

/**
 * Execute a SINGLE TILE step of the dragon's movement.
 * Used for animating the path tile-by-tile.
 * Returns null if the dragon cannot move forward (hit edge or fairy).
 */
export function executeDragonTileStep(state: GameState): { state: GameState; eatenMeeples: { playerId: string; meepleType: MeepleType; segmentId: string; coordinate: Coordinate }[] } | null {
  const dfData = getDfState(state)
  const dragonPos = getDragonPosition(state)
  if (!dragonPos || !dfData?.dragonMovement || !dfData.dragonFacing) return null

  const { dx, dy } = DIRECTION_DELTAS[dfData.dragonFacing]
  const nextX = dragonPos.x + dx
  const nextY = dragonPos.y + dy
  const nextKey = coordKey({ x: nextX, y: nextY })
  const nextTile = state.board.tiles[nextKey]

  if (!nextTile) return null // Edge of board

  const fairyPos = getFairyPosition(state)

  // Fairy contact
  if (fairyPos && coordKey(fairyPos.coordinate) === nextKey) {
    // Handle fairy contact: remove dragon from board
    let dragonHeldBy: string | null = getDragonHeldBy(state)
    const fairyKey = `${coordKey(fairyPos.coordinate)}:${fairyPos.segmentId}`
    const fairyMeeple = state.boardMeeples[fairyKey]
    if (fairyMeeple) dragonHeldBy = fairyMeeple.playerId

    const updatedDf: DragonFairyState = {
      ...dfData,
      dragonFacing: null,
      dragonMovement: null, // Stop movement sequence
    }
    const newState = moveDragon(state, dragonHeldBy ? { type: 'PLAYER_FRONT', playerId: dragonHeldBy } : { type: 'OUT_OF_PLAY' })
    return {
      state: {
        ...newState,
        turnPhase: dfData.dragonMovement.nextPhase,
        expansionData: { ...newState.expansionData, dragonFairy: updatedDf }
      },
      eatenMeeples: []
    }
  }

  // Move to next tile and eat meeples
  const { state: newStateAfterEating, eatenMeeples } = eatMeeplesOnTile(state, { x: nextX, y: nextY })

  const newState = moveDragon(newStateAfterEating, { type: 'BOARD', coordinate: { x: nextX, y: nextY } })

  return {
    state: newState,
    eatenMeeples: eatenMeeples.map(m => ({ ...m, coordinate: { x: nextX, y: nextY } }))
  }
}

/**
 * Perform reorientation logic after a straight-line movement step is finished.
 */
export function finishDragonMovementStep(state: GameState): GameState {
  const dfData = getDfState(state)
  if (!dfData || !dfData.dragonMovement) return state

  const remaining = dfData.dragonMovement.movesRemaining - 1
  const dragonOnBoard = getDragonPosition(state) !== null

  const baseNextDf: DragonFairyState = {
    ...dfData,
    dragonMovement: !dragonOnBoard || remaining <= 0 ? null : { ...dfData.dragonMovement, movesRemaining: remaining },
  }

  const nextState: GameState = {
    ...state,
    expansionData: { ...state.expansionData, dragonFairy: baseNextDf },
  }

  if (!dragonOnBoard || (remaining <= 0)) {
    // Movement sequence finished
    const opts = !dragonOnBoard ? [] : getValidDragonOrientations(nextState)
    if (opts.length > 1) {
      return { ...nextState, turnPhase: 'DRAGON_ORIENT' }
    } else {
      const finalDf = { ...baseNextDf, dragonFacing: opts.length === 1 ? opts[0] : baseNextDf.dragonFacing }
      return {
        ...nextState,
        turnPhase: dfData.dragonMovement.nextPhase,
        expansionData: { ...nextState.expansionData, dragonFairy: finalDf }
      }
    }
  } else {
    // Intermediate step: Check orientations for next move
    const opts = getValidDragonOrientations(nextState)
    if (opts.length > 1) {
      return { ...nextState, turnPhase: 'DRAGON_ORIENT' }
    } else {
      const finalDf = { ...baseNextDf, dragonFacing: opts.length === 1 ? opts[0] : baseNextDf.dragonFacing }
      return {
        ...nextState,
        turnPhase: 'DRAGON_MOVEMENT',
        expansionData: { ...nextState.expansionData, dragonFairy: finalDf }
      }
    }
  }
}

/**
 * Execute ONE straight-line step of the dragon's movement (C3.1 rules).
 * Moves straight in current facing until no more tiles or fairy hit.
 * Eats all meeples on tiles entered.
 * Then checks if further moves or reorientation is needed.
 */
export function executeDragonMovement(state: GameState): GameState {
  const dfData = getDfState(state)
  const dragonStartPos = getDragonPosition(state)
  if (!dragonStartPos || !dfData?.dragonMovement) {
    return { ...state, turnPhase: 'PLACE_TILE' }
  }

  let current = { ...state }
  let dragonPos = { ...dragonStartPos }
  let dragonFacing = dfData.dragonFacing
  let updatedPlayers = [...state.players]
  let updatedBoardMeeples = { ...state.boardMeeples }
  let updatedUfState = { ...state.featureUnionFind }
  let updatedBoardTiles = { ...state.board.tiles }
  let dragonRemoved = false

  // If dragon has no facing, pick a default or fallback
  if (!dragonFacing) {
    const adjacent = getValidDragonOrientations(state)
    dragonFacing = adjacent.length > 0 ? adjacent[0] : 'NORTH'
  }

  const fairyPos = getFairyPosition(state)

  // 1. Move straight forward tile by tile until no more tiles or fairy hit
  const { dx, dy } = DIRECTION_DELTAS[dragonFacing]
  let x = dragonPos.x + dx
  let y = dragonPos.y + dy

  while (true) {
    const nextKey = coordKey({ x, y })
    const nextTile = updatedBoardTiles[nextKey]
    if (!nextTile) break

    // Fairy contact
    if (fairyPos && coordKey(fairyPos.coordinate) === nextKey) {
      dragonRemoved = true
      break
    }

    // Enter tile and eat meeples
    dragonPos = { x, y }
    const { state: newStateAfterEating } = eatMeeplesOnTile(
      { ...current, players: updatedPlayers, boardMeeples: updatedBoardMeeples, featureUnionFind: updatedUfState, board: { ...current.board, tiles: updatedBoardTiles } },
      dragonPos,
    )
    updatedPlayers = newStateAfterEating.players
    updatedBoardMeeples = newStateAfterEating.boardMeeples
    updatedUfState = newStateAfterEating.featureUnionFind
    updatedBoardTiles = newStateAfterEating.board.tiles

    x += dx
    y += dy
  }

  // 2. Post-movement logic
  const remaining = dfData.dragonMovement.movesRemaining - 1
  
  // Fairy hit logic
  let dragonHeldBy: string | null = getDragonHeldBy(state)
  if (dragonRemoved && fairyPos) {
    const fairyKey = `${coordKey(fairyPos.coordinate)}:${fairyPos.segmentId}`
    const fairyMeeple = updatedBoardMeeples[fairyKey] ?? current.boardMeeples[fairyKey]
    if (fairyMeeple) dragonHeldBy = fairyMeeple.playerId
  }

  const baseNextDf: DragonFairyState = {
    ...dfData,
    dragonFacing: dragonRemoved ? null : dragonFacing,
    dragonMovement: dragonRemoved || remaining <= 0 ? null : { ...dfData.dragonMovement!, movesRemaining: remaining },
  }

  let nextState: GameState = {
    ...current,
    board: { ...current.board, tiles: updatedBoardTiles },
    players: updatedPlayers,
    boardMeeples: updatedBoardMeeples,
    featureUnionFind: updatedUfState,
    expansionData: { ...current.expansionData, dragonFairy: baseNextDf },
  }

  // Update dragon location in registry
  nextState = moveDragon(nextState, dragonRemoved ? (dragonHeldBy ? { type: 'PLAYER_FRONT', playerId: dragonHeldBy } : { type: 'OUT_OF_PLAY' }) : { type: 'BOARD', coordinate: dragonPos })

  if (dragonRemoved || (remaining <= 0)) {
    // Movement sequence finished
    const opts = dragonRemoved ? [] : getValidDragonOrientations(nextState)
    if (!dragonRemoved && opts.length > 1) {
      return { ...nextState, turnPhase: 'DRAGON_ORIENT' }
    } else {
      const finalDf = { 
        ...baseNextDf, 
        dragonFacing: (!dragonRemoved && opts.length === 1) ? opts[0] : (nextState.expansionData['dragonFairy'] as DragonFairyState).dragonFacing,
        dragonMovement: null 
      }
      return {
        ...nextState,
        turnPhase: dfData.dragonMovement.nextPhase,
        expansionData: { ...nextState.expansionData, dragonFairy: finalDf }
      }
    }
  } else {
    // Intermediate step: Check orientations for next move
    const opts = getValidDragonOrientations(nextState)
    if (opts.length > 1) {
      return { ...nextState, turnPhase: 'DRAGON_ORIENT' }
    } else if (opts.length === 1) {
      // Automatic reorientation for a single option
      const finalDf = { ...baseNextDf, dragonFacing: opts[0] }
      return {
        ...nextState,
        turnPhase: 'DRAGON_MOVEMENT',
        expansionData: { ...nextState.expansionData, dragonFairy: finalDf }
      }
    } else {
      // Dead end: finish movement sequence prematurely
      const finalDf = { ...baseNextDf, dragonMovement: null }
      return {
        ...nextState,
        turnPhase: dfData.dragonMovement.nextPhase,
        expansionData: { ...nextState.expansionData, dragonFairy: finalDf }
      }
    }
  }
}

/**
 * Remove all meeples from a tile (dragon eating them).
 * Returns meeples to owners' supplies without scoring.
 */
function eatMeeplesOnTile(
  state: GameState,
  coord: Coordinate,
): {
  state: GameState
  eatenMeeples: { playerId: string; meepleType: MeepleType; segmentId: string; coordinate: Coordinate }[]
} {
  const tileKey = coordKey(coord)
  const tile = state.board.tiles[tileKey]
  const eatenMeeples: { playerId: string; meepleType: MeepleType; segmentId: string; coordinate: Coordinate }[] = []
  if (!tile || Object.keys(tile.meeples).length === 0) {
    return { state, eatenMeeples }
  }

  let currentState = state
  let updatedPlayers = [...state.players]
  let updatedBoardMeeples = { ...state.boardMeeples }
  let updatedUfState = { ...state.featureUnionFind, featureData: { ...state.featureUnionFind.featureData } }
  let updatedBoardTiles = { ...state.board.tiles }

  const affectedFeatureIds = new Set<string>()
  const affectedPlayerIds = new Set<string>()

  // 1. Eat the meeples physically on the tile
  for (const [segmentId, meeple] of Object.entries(tile.meeples)) {
    const nKey = `${tileKey}:${segmentId}`
    eatenMeeples.push({ playerId: meeple.playerId, meepleType: meeple.meepleType as MeepleType, segmentId, coordinate: coord })

    affectedPlayerIds.add(meeple.playerId)
    const root = findRoot(updatedUfState, nKey)
    affectedFeatureIds.add(root)

    // registry update
    if (currentState.pieces) {
      const pieceId = Object.keys(currentState.pieces).find(k => {
        const p = currentState.pieces[k]
        return p.ownerId === meeple.playerId && p.type === meeple.meepleType &&
          p.location.type === 'BOARD' && coordKey(p.location.coordinate) === tileKey && p.location.segmentId === segmentId
      })
      if (pieceId) {
        currentState = movePiece(currentState, pieceId, { type: 'SUPPLY', playerId: meeple.playerId })
      }
    }

    // Remove from player's onBoard list
    updatedPlayers = updatedPlayers.map(p =>
      p.id === meeple.playerId
        ? {
          ...p,
          meeples: {
            ...p.meeples,
            available: {
              ...p.meeples.available,
              [meeple.meepleType]: p.meeples.available[meeple.meepleType as MeepleType] + 1,
            },
            onBoard: p.meeples.onBoard.filter(k => k !== nKey),
          },
        }
        : p,
    )

    // Remove from board meeples
    delete updatedBoardMeeples[nKey]

    // Remove from union-find feature
    const feature = updatedUfState.featureData[root]
    if (feature) {
      updatedUfState = updateFeatureMeeples(
        updatedUfState, root,
        feature.meeples.filter(m =>
          !(coordKey(m.coordinate) === tileKey && m.segmentId === segmentId)
        ),
      )
    }
  }

  // 2. Clear meeples from the specific tile in the board record
  updatedBoardTiles[tileKey] = { ...tile, meeples: {} }

  // 3. Check for orphaned Builders/Pigs on affected features
  for (const featureId of affectedFeatureIds) {
    const feature = updatedUfState.featureData[featureId]
    if (!feature) continue

    for (const playerId of affectedPlayerIds) {
      // Check if this player still has any regular meeples on this feature
      const hasRegularMeeple = feature.meeples.some(m =>
        m.playerId === playerId && (m.meepleType === 'NORMAL' || m.meepleType === 'BIG')
      )

      if (!hasRegularMeeple) {
        // Player has no regular meeples left on this feature -> remove their Builder/Pig too
        const specialMeeples = feature.meeples.filter(m =>
          m.playerId === playerId && (m.meepleType === 'BUILDER' || m.meepleType === 'PIG')
        )

        for (const special of specialMeeples) {
          const sTileKey = coordKey(special.coordinate)
          const sNodeKey = `${sTileKey}:${special.segmentId}`

          eatenMeeples.push({
            playerId: special.playerId,
            meepleType: special.meepleType as MeepleType,
            segmentId: special.segmentId,
            coordinate: special.coordinate
          })

          // registry update
          if (currentState.pieces) {
            const pieceId = Object.keys(currentState.pieces).find(k => {
              const p = currentState.pieces[k]
              return p.ownerId === special.playerId && p.type === special.meepleType &&
                p.location.type === 'BOARD' && coordKey(p.location.coordinate) === sTileKey && p.location.segmentId === special.segmentId
            })
            if (pieceId) {
              currentState = movePiece(currentState, pieceId, { type: 'SUPPLY', playerId: special.playerId })
            }
          }

          // Return special meeple to owner
          updatedPlayers = updatedPlayers.map(p =>
            p.id === playerId
              ? {
                ...p,
                meeples: {
                  ...p.meeples,
                  available: {
                    ...p.meeples.available,
                    [special.meepleType]: p.meeples.available[special.meepleType as MeepleType] + 1,
                  },
                  onBoard: p.meeples.onBoard.filter(k => k !== sNodeKey),
                },
              }
              : p,
          )

          // Remove from board records
          delete updatedBoardMeeples[sNodeKey]
          const sTile = updatedBoardTiles[sTileKey]
          if (sTile) {
            // tile.meeples uses "segmentId_TYPE" for secondary meeples (BUILDER/PIG)
            const tileMeepleKey = `${special.segmentId}_${special.meepleType}`
            const { [tileMeepleKey]: _removed, ...remMeeples } = sTile.meeples
            updatedBoardTiles[sTileKey] = { ...sTile, meeples: remMeeples }
          }
        }

        // Clean up union-find feature
        updatedUfState = updateFeatureMeeples(
          updatedUfState, featureId,
          feature.meeples.filter(m =>
            !(m.playerId === playerId && (m.meepleType === 'BUILDER' || m.meepleType === 'PIG'))
          )
        )
      }
    }
  }

  return {
    state: {
      ...currentState,
      players: updatedPlayers,
      boardMeeples: updatedBoardMeeples,
      featureUnionFind: updatedUfState,
      board: { ...currentState.board, tiles: updatedBoardTiles }
    },
    eatenMeeples,
  }
}

/**
 * Move fairy to a tile with one of the current player's meeples.
 */
export function moveFairy(state: GameState, coord: Coordinate, segmentId: string): GameState {
  if (state.turnPhase !== 'FAIRY_MOVE') return state

  const dfData = getDfState(state)
  if (!dfData) return state

  const player = state.players[state.currentPlayerIndex]
  const nKey = `${coordKey(coord)}:${segmentId}`
  const meeple = state.boardMeeples[nKey]

  // Must be the current player's meeple
  if (!meeple || meeple.playerId !== player.id) return state

  const newState = moveFairyToLocation(state, { type: 'BOARD', coordinate: coord, segmentId })

  const updatedDf: DragonFairyState = {
    ...dfData,
    canMoveFairy: false,
  }

  return {
    ...newState,
    turnPhase: 'SCORE',
    expansionData: {
      ...newState.expansionData,
      dragonFairy: updatedDf,
    },
  }
}

/**
 * Skip fairy movement.
 */
export function skipFairyMove(state: GameState): GameState {
  if (state.turnPhase !== 'FAIRY_MOVE') return state

  const dfData = getDfState(state)
  if (!dfData) return { ...state, turnPhase: 'SCORE' }

  return {
    ...state,
    turnPhase: 'SCORE',
    expansionData: {
      ...state.expansionData,
      dragonFairy: { ...dfData, canMoveFairy: false },
    },
  }
}

/**
 * Transition from PLACE_MEEPLE to FAIRY_MOVE.
 */
export function prepareFairyMove(state: GameState): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state
  return { ...state, turnPhase: 'FAIRY_MOVE' }
}

/**
 * Get all board positions where the current player has a meeple (for fairy placement targets).
 */
export function getFairyMoveTargets(state: GameState): { coordinate: Coordinate; segmentId: string }[] {
  const dfData = getDfState(state)
  if (!dfData) return []

  const player = state.players[state.currentPlayerIndex]
  const targets: { coordinate: Coordinate; segmentId: string }[] = []

  for (const [, meeple] of Object.entries(state.boardMeeples)) {
    if (meeple.playerId === player.id) {
      targets.push({ coordinate: meeple.coordinate, segmentId: meeple.segmentId })
    }
  }

  return targets
}

/**
 * Get all segments on the board where a meeple can be placed via magic portal.
 * Returns segments from ALL tiles (not just last-placed) that are in unoccupied, incomplete features.
 */
export function getMagicPortalPlacements(state: GameState): { coordinate: Coordinate; segmentId: string }[] {
  const player = state.players[state.currentPlayerIndex]
  const results: { coordinate: Coordinate; segmentId: string }[] = []
  const dragonPos = getDragonPosition(state)

  for (const [tileKey] of Object.entries(state.board.tiles)) {
    const coord = keyToCoord(tileKey)

    // Reuse unified logic for segment availability
    const segmentsOnTile = getPlaceableSegments(state.featureUnionFind, state.staticTileMap, state.board, coord, player, dragonPos)

    for (const segmentId of segmentsOnTile) {
      const nKey = nodeKey(coord, segmentId)
      const feature = getFeature(state.featureUnionFind, nKey)

      // Magic Portal specific rule: feature must not be completed.
      if (feature && !feature.isComplete) {
        results.push({ coordinate: coord, segmentId })
      }
    }
  }

  return results
}

/**
 * Place a meeple via magic portal on any qualifying tile on the board.
 */
export function placeMeepleViaPortal(
  state: GameState,
  coord: Coordinate,
  segmentId: string,
  meepleType: MeepleType = 'NORMAL',
  secondaryMeepleType?: 'PIG' | 'BUILDER',
): GameState {
  if (state.turnPhase !== 'PLACE_MEEPLE') return state

  const player = state.players[state.currentPlayerIndex]
  const dragonPos = getDragonPosition(state)

  // Centralized validation for primary meeple (availability, occupancy, expansion rules)
  if (!canPlaceMeeple(state.featureUnionFind, player, coord, segmentId, meepleType, dragonPos)) {
    return state
  }

  const nKey = nodeKey(coord, segmentId)
  const feature = getFeature(state.featureUnionFind, nKey)

  // Magic Portal specific rule: target feature must be incomplete.
  if (!feature || feature.isComplete) return state

  // ── Simultaneous PIG/BUILDER Validation (C3.1) ─────────────────
  if (secondaryMeepleType) {
    if (meepleType !== 'NORMAL' && meepleType !== 'BIG') return state
    if (availableMeepleCount(player, secondaryMeepleType) <= 0) return state

    const tileKey = coordKey(coord)
    const existingTile = state.board.tiles[tileKey]
    if (!existingTile) return state
    const def = state.staticTileMap[existingTile.definitionId]
    const segment = def?.segments.find(s => s.id === segmentId)
    if (!segment) return state

    if (secondaryMeepleType === 'PIG' && segment.type !== 'FIELD') return state
    if (secondaryMeepleType === 'BUILDER' && (segment.type !== 'CITY' && segment.type !== 'ROAD')) return state
  }

  return applyMeeplePlacement(state, coord, segmentId, meepleType, secondaryMeepleType)
}

/**
 * Check if the current tile is a magic portal tile.
 */
export function isMagicPortalTile(state: GameState): boolean {
  if (!state.currentTile) return false
  const def = state.staticTileMap[state.currentTile.definitionId]
  return def?.hasMagicPortal ?? false
}

/**
 * Check if the current tile is a Dragon Hoard tile (no meeple placement).
 */
export function isDragonHoardTile(state: GameState): boolean {
  if (!state.currentTile) return false
  const def = state.staticTileMap[state.currentTile.definitionId]
  return def?.isDragonHoard ?? false
}

export function getValidMeepleTypes(state: GameState): MeepleType[] {
  if (state.turnPhase !== 'PLACE_MEEPLE' || !state.currentTile) return []

  const lastCoord = state.lastPlacedCoord ?? findLastPlacedCoord(state)
  if (!lastCoord) return []

  const player = state.players[state.currentPlayerIndex]
  const validTypes: MeepleType[] = []
  const dragonPos = getDragonPosition(state)

  // If the current tile has a Magic Portal, we must consider all possible portal targets
  const isPortal = isMagicPortalTile(state)
  const portalTargets = isPortal ? getMagicPortalPlacements(state) : []

  // Cannot place anything if dragon is on this tile (standard placement only)
  const dragonOnLastTile = dragonPos && lastCoord.x === dragonPos.x && lastCoord.y === dragonPos.y

  // Get all segments from the tile definition
  const def = state.staticTileMap[state.currentTile.definitionId]
  if (!def) return []

  // Distinct segment IDs on this tile
  const segments = Array.from(new Set(def.segments.map(n => n.id)))

  // Helper to check if a meeple type can be placed ANYWHERE (on this tile or via portal)
  const canPlaceMeepleAnywhere = (type: MeepleType) => {
    if (availableMeepleCount(player, type) <= 0) return false
    // Option 1: Standard placement on the just-placed tile
    if (!dragonOnLastTile && segments.some(segId => canPlaceMeeple(state.featureUnionFind, player, lastCoord, segId, type, dragonPos))) {
      return true
    }
    // Option 2: Magic Portal placement on another tile
    if (isPortal) {
      return portalTargets.some(target => {
        // canPlaceMeeple already handles occupancy and expansion rules (like Abbot/Garden)
        return canPlaceMeeple(state.featureUnionFind, player, target.coordinate, target.segmentId, type, dragonPos)
      })
    }
    return false
  }

  // Check NORMAL
  if (canPlaceMeepleAnywhere('NORMAL')) validTypes.push('NORMAL')

  // Check BIG
  if (canPlaceMeepleAnywhere('BIG')) validTypes.push('BIG')

  // Check BUILDER
  const tbData = state.expansionData['tradersBuilders'] as { useModernRules?: boolean } | undefined
  const isModernRules = tbData?.useModernRules ?? false

  if ((player.meeples.available.BUILDER ?? 0) > 0) {
    // Standalone placement (classic)
    const canPlaceStandalone = !dragonOnLastTile && segments.some(segId => canPlaceBuilderOrPig(state.featureUnionFind, player, lastCoord, segId, 'BUILDER', dragonPos))

    // Simultaneous placement (modern C3.1)
    const canPlaceSimultaneous = isModernRules && (
      // On the just-placed tile
      (!dragonOnLastTile && segments.some(segId => {
        const feature = getFeature(state.featureUnionFind, nodeKey(lastCoord, segId))
        const isRoadOrCity = feature && (feature.type === 'CITY' || feature.type === 'ROAD')
        return isRoadOrCity && (
          canPlaceMeeple(state.featureUnionFind, player, lastCoord, segId, 'NORMAL', dragonPos) ||
          canPlaceMeeple(state.featureUnionFind, player, lastCoord, segId, 'BIG', dragonPos)
        )
      })) ||
      // Or via Magic Portal
      (isPortal && portalTargets.some(target => {
        const feature = getFeature(state.featureUnionFind, nodeKey(target.coordinate, target.segmentId))
        const isRoadOrCity = feature && (feature.type === 'CITY' || feature.type === 'ROAD')
        // Magic Portal already ensures feature is incomplete
        return isRoadOrCity && (
          canPlaceMeeple(state.featureUnionFind, player, target.coordinate, target.segmentId, 'NORMAL', dragonPos) ||
          canPlaceMeeple(state.featureUnionFind, player, target.coordinate, target.segmentId, 'BIG', dragonPos)
        )
      }))
    )

    if (canPlaceStandalone || canPlaceSimultaneous) validTypes.push('BUILDER')
  }

  // Check PIG
  if ((player.meeples.available.PIG ?? 0) > 0) {
    const canPlaceStandalone = !dragonOnLastTile && segments.some(segId => canPlaceBuilderOrPig(state.featureUnionFind, player, lastCoord, segId, 'PIG', dragonPos))

    const canPlaceSimultaneous = isModernRules && (
      (!dragonOnLastTile && segments.some(segId => {
        const feature = getFeature(state.featureUnionFind, nodeKey(lastCoord, segId))
        return feature?.type === 'FIELD' && (
          canPlaceMeeple(state.featureUnionFind, player, lastCoord, segId, 'NORMAL', dragonPos) ||
          canPlaceMeeple(state.featureUnionFind, player, lastCoord, segId, 'BIG', dragonPos)
        )
      })) ||
      (isPortal && portalTargets.some(target => {
        const feature = getFeature(state.featureUnionFind, nodeKey(target.coordinate, target.segmentId))
        return feature?.type === 'FIELD' && (
          canPlaceMeeple(state.featureUnionFind, player, target.coordinate, target.segmentId, 'NORMAL', dragonPos) ||
          canPlaceMeeple(state.featureUnionFind, player, target.coordinate, target.segmentId, 'BIG', dragonPos)
        )
      }))
    )

    if (canPlaceStandalone || canPlaceSimultaneous) validTypes.push('PIG')
  }

  // Check ABBOT
  if (canPlaceMeepleAnywhere('ABBOT')) validTypes.push('ABBOT')

  return validTypes
}
