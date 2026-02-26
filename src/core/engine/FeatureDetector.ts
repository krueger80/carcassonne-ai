/**
 * FeatureDetector: Union-Find implementation for Carcassonne feature tracking.
 *
 * Each node represents one segment on one placed tile: key = "x,y:segmentId"
 * When a tile is placed, segments on the new tile are connected to matching
 * segments on adjacent tiles via union operations.
 */

import type { Board, Coordinate, PlacedTile } from '../types/board.ts'
import type { TileDefinition, Direction, EdgePosition } from '../types/tile.ts'
import type { Feature, UnionFindState } from '../types/feature.ts'
import { coordKey } from '../types/board.ts'
import { nodeKey } from '../types/feature.ts'
import { DIRECTION_DELTA, getSegmentAtEdgePosition, rotateEdgePosition } from './TilePlacement.ts'

const DIRECTIONS: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST']

const EDGE_POSITIONS_BY_DIR: Record<Direction, EdgePosition[]> = {
  NORTH: ['NORTH_LEFT', 'NORTH_CENTER', 'NORTH_RIGHT'],
  EAST: ['EAST_LEFT', 'EAST_CENTER', 'EAST_RIGHT'],
  SOUTH: ['SOUTH_LEFT', 'SOUTH_CENTER', 'SOUTH_RIGHT'],
  WEST: ['WEST_LEFT', 'WEST_CENTER', 'WEST_RIGHT'],
}

// The "mirror" position on the opposite edge (for matching neighbors)
const MIRROR_POSITION: Record<EdgePosition, EdgePosition> = {
  NORTH_LEFT: 'SOUTH_RIGHT', NORTH_CENTER: 'SOUTH_CENTER', NORTH_RIGHT: 'SOUTH_LEFT',
  EAST_LEFT: 'WEST_RIGHT', EAST_CENTER: 'WEST_CENTER', EAST_RIGHT: 'WEST_LEFT',
  SOUTH_LEFT: 'NORTH_RIGHT', SOUTH_CENTER: 'NORTH_CENTER', SOUTH_RIGHT: 'NORTH_LEFT',
  WEST_LEFT: 'EAST_RIGHT', WEST_CENTER: 'EAST_CENTER', WEST_RIGHT: 'EAST_LEFT',
}

// ─── Union-Find operations (all pure / returns new state) ─────────────────────

// ─── Union-Find operations (all pure / returns new state) ─────────────────────

function ufFind(state: UnionFindState, key: string): string {
  if (!(key in state.parent)) return key
  if (state.parent[key] === key) return key
  // Path compression (we mutate the working copy of state here)
  state.parent[key] = ufFind(state, state.parent[key])
  return state.parent[key]
}

/**
 * Non-mutating version of Find, for use in read-only queries (e.g. valid placement checks).
 * Does NOT perform path compression.
 */
function ufFindReadOnly(state: UnionFindState, key: string): string {
  if (!(key in state.parent)) return key
  let curr = key
  while (state.parent[curr] !== curr) {
    curr = state.parent[curr]
  }
  return curr
}

function ufMakeSet(state: UnionFindState, key: string, initialFeature: Feature): void {
  state.parent[key] = key
  state.rank[key] = 0
  state.featureData[key] = initialFeature
}

/**
 * Merge two feature metadata objects.
 * - Commodity counts (CLOTH/WHEAT/WINE) are summed.
 * - Boolean flags (hasInn, hasCathedral) are OR'd (true wins).
 * - All other keys: last-write wins.
 */
function mergeMetadata(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...a }
  for (const [key, value] of Object.entries(b)) {
    if (key === 'CLOTH' || key === 'WHEAT' || key === 'WINE') {
      result[key] = ((result[key] as number) ?? 0) + (value as number)
    } else if (typeof value === 'boolean') {
      result[key] = Boolean(result[key]) || value
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Union two nodes. Returns the new root key.
 * Merges feature data (sums tile counts, pennants; reduces open edges by 2 for the joined edge pair).
 */
function ufUnion(state: UnionFindState, keyA: string, keyB: string): string {
  const rootA = ufFind(state, keyA)
  const rootB = ufFind(state, keyB)

  if (rootA === rootB) {
    // The two edge positions are already in the same feature, but that position is now
    // an internal connection (no longer open). Subtract 2 open edges (1 from each side of the connection).
    const existing = state.featureData[rootA]
    if (existing) {
      existing.openEdgeCount -= 2
      existing.isComplete = isFeatureComplete(existing)
    }
    return rootA
  }

  const featureA = state.featureData[rootA]
  const featureB = state.featureData[rootB]

  // Merge by rank
  let newRoot: string, oldRoot: string
  if ((state.rank[rootA] ?? 0) >= (state.rank[rootB] ?? 0)) {
    newRoot = rootA; oldRoot = rootB
  } else {
    newRoot = rootB; oldRoot = rootA
  }

  state.parent[oldRoot] = newRoot
  if ((state.rank[rootA] ?? 0) === (state.rank[rootB] ?? 0)) {
    state.rank[newRoot] = (state.rank[newRoot] ?? 0) + 1
  }

  // Merge feature data: joining two features removes 2 open edges (the shared pair)
  const featureA_data = featureA ?? createEmptyFeature(keyA, 'FIELD')
  const featureB_data = featureB ?? createEmptyFeature(keyB, 'FIELD')

  const mergedNodes = [...featureA_data.nodes, ...featureB_data.nodes]
  // Distinct tile count
  const tileKeys = new Set(mergedNodes.map(n => coordKey(n.coordinate)))

  state.featureData[newRoot] = {
    ...featureA_data,
    id: newRoot,
    nodes: mergedNodes,
    meeples: [...featureA_data.meeples, ...featureB_data.meeples],
    tileCount: tileKeys.size,
    pennantCount: featureA_data.pennantCount + featureB_data.pennantCount,
    // -2 per ufUnion call: each call represents exactly one connection (2 ends) being closed.
    openEdgeCount: featureA_data.openEdgeCount + featureB_data.openEdgeCount - 2,
    touchingCityIds: [...new Set([...featureA_data.touchingCityIds, ...featureB_data.touchingCityIds])],
    isComplete: false,  // recalculated below
    metadata: mergeMetadata(featureA_data.metadata, featureB_data.metadata),
  }

  // Update isComplete
  const merged = state.featureData[newRoot]
  merged.isComplete = isFeatureComplete(merged)

  // Remove the old root's feature data
  delete state.featureData[oldRoot]

  return newRoot
}

function createEmptyFeature(id: string, type: Feature['type']): Feature {
  return {
    id, type, nodes: [], meeples: [],
    isComplete: false, tileCount: 0, pennantCount: 0,
    openEdgeCount: 0, touchingCityIds: [], metadata: {},
  }
}

function isFeatureComplete(feature: Feature): boolean {
  if (feature.type === 'FIELD') return false   // fields never complete mid-game
  if (feature.type === 'CLOISTER') return false  // cloisters tracked separately
  return feature.openEdgeCount === 0
}

// ─── Count open edge positions for a segment on a newly placed tile ───────────

function countOpenEdgePositions(
  physicalPositions: EdgePosition[],
): number {
  // We now count EVERY physical position as an open edge initially.
  // Connections to neighbors will be handled by the subtract-2 logic in ufUnion.
  return physicalPositions.length
}

// ─── Main: add a tile to the union-find ──────────────────────────────────────

/**
 * Called when a tile is placed on the board.
 * Mutates a copy of state (caller should clone if needed).
 * Returns the updated UnionFindState plus a list of newly completed feature IDs.
 */
export function addTileToUnionFind(
  state: UnionFindState,
  board: Board,
  tileMap: Record<string, TileDefinition>,
  placedTile: PlacedTile,
): { state: UnionFindState; completedFeatureIds: string[] } {
  const working: UnionFindState = {
    parent: { ...state.parent },
    rank: { ...state.rank },
    featureData: { ...state.featureData },
  }

  const coord = placedTile.coordinate
  const def = tileMap[placedTile.definitionId]
  const rotation = placedTile.rotation

  if (!def) throw new Error(`Unknown tile definition: ${placedTile.definitionId}`)

  // ── Step 1: Register new nodes for each segment ───────────────────────────

  for (const seg of def.segments) {
    if (seg.type === 'CLOISTER') continue  // cloisters tracked separately

    const key = nodeKey(coord, seg.id)

    // Derive logical edge positions for this segment from the tile's lookup map,
    // then rotate them to physical positions for the current tile placement.
    const physicalEdgePositions = (Object.entries(def.edgePositionToSegment) as [EdgePosition, string][])
      .filter(([, segId]) => segId === seg.id)
      .map(([lp]) => rotateEdgePosition(lp, rotation))

    const openEdges = countOpenEdgePositions(physicalEdgePositions)

    // Initial adjacencies from tile definition — only track CITY neighbours
    // (touchingCityIds is used for field-scoring: 3 pts per completed city)
    const initialTouchIds = (def.adjacencies ?? [])
      .filter(([a, b]) => a === seg.id || b === seg.id)
      .filter(([a, b]) => {
        const otherSegId = a === seg.id ? b : a
        return def.segments.find(s => s.id === otherSegId)?.type === 'CITY'
      })
      .map(([a, b]) => nodeKey(coord, a === seg.id ? b : a))

    const feature: Feature = {
      id: key,
      type: seg.type,
      nodes: [{ coordinate: coord, segmentId: seg.id }],
      meeples: [],
      isComplete: false,
      tileCount: 1,
      pennantCount: seg.hasPennant ? 1 : 0,
      openEdgeCount: openEdges,
      touchingCityIds: initialTouchIds,
      metadata: {
        ...(seg.hasInn ? { hasInn: true } : {}),
        ...(seg.hasCathedral ? { hasCathedral: true } : {}),
        ...(seg.commodity ? { [seg.commodity]: 1 } : {}),
      },
    }

    ufMakeSet(working, key, feature)
  }

  // ── Step 2: Connect segments within this tile that share the same segmentId ─
  // (They're already the same node since we use segmentId as the node key,
  //  so no extra union needed — different segments within a tile are different nodes
  //  UNLESS they're the same segment (e.g., a city wrapping around N+E edges).)
  // This is already handled by the segment model: one segment id = one node.

  // ── Step 3: Union with adjacent tiles ─────────────────────────────────────

  const affectedRoots = new Set<string>()

  for (const dir of DIRECTIONS) {
    const { dx, dy } = DIRECTION_DELTA[dir]
    const neighborCoord = { x: coord.x + dx, y: coord.y + dy }
    const neighborKey = coordKey(neighborCoord)
    const neighborTile = board.tiles[neighborKey]

    if (!neighborTile) continue

    const neighborDef = tileMap[neighborTile.definitionId]
    if (!neighborDef) continue

    // For each sub-position on this edge, union the matching segments
    const physPositions = EDGE_POSITIONS_BY_DIR[dir]

    for (const physPos of physPositions) {
      // My segment at this physical position
      const mySegId = getSegmentAtEdgePosition(def, rotation, physPos)

      // Neighbor's segment at the mirrored physical position
      const mirrorPos = MIRROR_POSITION[physPos]
      const neighborSegId = getSegmentAtEdgePosition(
        neighborDef,
        neighborTile.rotation,
        mirrorPos,
      )

      const myNodeKey = nodeKey(coord, mySegId)
      const neighborNodeKey = nodeKey(neighborCoord, neighborSegId)

      // Only union non-cloister segments
      if (
        def.segments.find(s => s.id === mySegId)?.type === 'CLOISTER' ||
        neighborDef.segments.find(s => s.id === neighborSegId)?.type === 'CLOISTER'
      ) continue

      if (myNodeKey in working.parent && neighborNodeKey in working.parent) {
        const newRoot = ufUnion(working, myNodeKey, neighborNodeKey)
        affectedRoots.add(newRoot)
      }
    }
  }

  // ── Step 4: Collect newly completed features ───────────────────────────────

  const completedFeatureIds: string[] = []

  // Also check all affected roots
  for (const key of Object.keys(working.parent)) {
    const root = ufFind(working, key)
    if (root === key && working.featureData[root]) {
      affectedRoots.add(root)
    }
  }

  for (const root of affectedRoots) {
    const feature = working.featureData[root]
    if (feature && feature.isComplete && !state.featureData[root]?.isComplete) {
      completedFeatureIds.push(root)
    }
  }

  // ── Step 5: Update cloister completion ────────────────────────────────────

  // Check: did placing this tile complete any cloisters within a 1-tile radius?
  const cloisterCoordsToCheck: Coordinate[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      cloisterCoordsToCheck.push({ x: coord.x + dx, y: coord.y + dy })
    }
  }

  // We need the updated board (with the new tile included) for cloister counting.
  // The board passed in should already include the new tile.
  for (const checkCoord of cloisterCoordsToCheck) {
    const checkKey = coordKey(checkCoord)
    const checkTile = board.tiles[checkKey]
    if (!checkTile) continue

    const checkDef = tileMap[checkTile.definitionId]
    if (!checkDef) continue

    const cloisterSegments = checkDef.segments.filter(s => s.type === 'CLOISTER')
    for (const cloisterSeg of cloisterSegments) {
      const cloisterNodeKey = nodeKey(checkCoord, cloisterSeg.id)
      if (!(cloisterNodeKey in working.parent)) {
        // Create the cloister node if it doesn't exist
        const surroundCount = countSurroundingTiles(board, checkCoord)
        const feature: Feature = {
          id: cloisterNodeKey,
          type: 'CLOISTER',
          nodes: [{ coordinate: checkCoord, segmentId: cloisterSeg.id }],
          meeples: [],
          isComplete: surroundCount === 8,
          tileCount: surroundCount + 1,  // including the cloister tile itself
          pennantCount: 0,
          openEdgeCount: 8 - surroundCount,
          touchingCityIds: [],
          metadata: {},
        }
        ufMakeSet(working, cloisterNodeKey, feature)
      } else {
        // Update existing cloister
        const root = ufFind(working, cloisterNodeKey)
        const existing = working.featureData[root]
        if (existing) {
          const surroundCount = countSurroundingTiles(board, checkCoord)
          const wasComplete = existing.isComplete
          existing.openEdgeCount = 8 - surroundCount
          existing.tileCount = surroundCount + 1
          existing.isComplete = surroundCount === 8

          if (!wasComplete && existing.isComplete) {
            completedFeatureIds.push(root)
          }
        }
      }
    }
  }

  return { state: working, completedFeatureIds }
}

// ─── Utility functions ────────────────────────────────────────────────────────

/**
 * Count how many of the 8 surrounding tiles are present.
 */
export function countSurroundingTiles(board: Board, coord: Coordinate): number {
  let count = 0
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      const key = coordKey({ x: coord.x + dx, y: coord.y + dy })
      if (board.tiles[key]) count++
    }
  }
  return count
}

/**
 * Get a Feature by any node key (finds root first).
 */
/**
 * Get a Feature by any node key (finds root first).
 */
export function getFeature(state: UnionFindState, nodeKey_: string): Feature | null {
  const root = ufFindReadOnly(state, nodeKey_)
  return state.featureData[root] ?? null
}

/**
 * Get all distinct features (one per root).
 */
export function getAllFeatures(state: UnionFindState): Feature[] {
  const roots = new Set<string>()
  for (const key of Object.keys(state.parent)) {
    roots.add(ufFindReadOnly(state, key))
  }
  return Array.from(roots)
    .map(root => state.featureData[root])
    .filter((f): f is Feature => f !== undefined)
}

/**
 * Get the node key for a tile+segment.
 */
export function getNodeKey(coord: Coordinate, segmentId: string): string {
  return nodeKey(coord, segmentId)
}

/**
 * Check if a feature (identified by any node key) has meeples.
 */
export function featureHasMeeples(state: UnionFindState, nKey: string): boolean {
  const feature = getFeature(state, nKey)
  return (feature?.meeples.length ?? 0) > 0
}

/**
 * Resolve the root ID for a node key.
 */
export function getFeatureRoot(state: UnionFindState, key: string): string {
  return ufFindReadOnly(state, key)
}

/**
 * Find the root node key for a given node key.
 * Exported for use by GameEngine builder-bonus detection.
 */
export function findRoot(state: UnionFindState, key: string): string {
  // Work on a mutable copy to allow path compression
  const working = {
    parent: { ...state.parent },
    rank: { ...state.rank },
    featureData: state.featureData,
  }
  return ufFind(working, key)
}

/**
 * Update meeples on a feature (after placing or returning a meeple).
 */
export function updateFeatureMeeples(
  state: UnionFindState,
  nKey: string,
  meeples: Feature['meeples'],
): UnionFindState {
  const working = {
    parent: { ...state.parent },
    rank: { ...state.rank },
    featureData: { ...state.featureData },
  }
  const root = ufFind(working, nKey)
  if (working.featureData[root]) {
    working.featureData[root] = { ...working.featureData[root], meeples }
  }
  return working
}
