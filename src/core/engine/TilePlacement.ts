import type { Board, Coordinate } from '../types/board.ts'
import type { TileDefinition, TileInstance, Direction, EdgeType, EdgePosition, Rotation } from '../types/tile.ts'
import { coordKey } from '../types/board.ts'
import { TILE_MAP } from '../data/baseTiles.ts'

// Re-export for convenience
export { coordKey }

// ─── Direction utilities ──────────────────────────────────────────────────────

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  NORTH: 'SOUTH',
  EAST: 'WEST',
  SOUTH: 'NORTH',
  WEST: 'EAST',
}

export const DIRECTION_DELTA: Record<Direction, { dx: number; dy: number }> = {
  NORTH: { dx: 0, dy: -1 },
  EAST: { dx: 1, dy: 0 },
  SOUTH: { dx: 0, dy: 1 },
  WEST: { dx: -1, dy: 0 },
}

const DIRECTIONS: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST']

/**
 * Rotate a direction clockwise by the given rotation.
 * e.g. rotateDirection('NORTH', 90) → 'EAST'
 */
export function rotateDirection(dir: Direction, rotation: Rotation): Direction {
  const order: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST']
  const steps = rotation / 90
  return order[(order.indexOf(dir) + steps) % 4]
}

/**
 * Un-rotate a physical direction back to logical.
 * Given a tile rotated R degrees clockwise, the physical edge D
 * corresponds to logical edge unrotateDirection(D, R).
 */
export function unrotateDirection(physicalDir: Direction, rotation: Rotation): Direction {
  const order: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST']
  const steps = rotation / 90
  const idx = order.indexOf(physicalDir)
  return order[((idx - steps) % 4 + 4) % 4]
}

/**
 * Get the EdgeType of a tile at a physical direction, taking rotation into account.
 */
export function getEdge(def: TileDefinition, rotation: Rotation, physicalDir: Direction): EdgeType {
  const logicalDir = unrotateDirection(physicalDir, rotation)
  return def.edges[logicalDir]
}

/**
 * Rotate an EdgePosition clockwise by the tile's rotation.
 * e.g. rotateEdgePosition('NORTH_LEFT', 90) → 'EAST_LEFT'
 *   (what was the left side of NORTH is now the left side of EAST)
 */
export function rotateEdgePosition(pos: EdgePosition, rotation: Rotation): EdgePosition {
  if (rotation === 0) return pos

  const [dir, side] = pos.split('_') as [string, string]
  const rotatedDir = rotateDirection(dir as Direction, rotation)

  // When rotating, LEFT/RIGHT meanings relative to viewer also change.
  // For a 90° CW rotation: NORTH_LEFT → EAST_RIGHT (the left of north becomes right of east)
  // Actually: if you rotate the tile 90° CW, then what was NORTH_LEFT becomes EAST_RIGHT
  // because LEFT of NORTH (=NW corner) becomes RIGHT of EAST (=NE corner)
  // Wait, let me think more carefully:
  // Original NORTH edge: LEFT=NW corner, RIGHT=NE corner
  // After 90° CW rotation, NORTH becomes EAST:
  //   Old NW corner → becomes NE corner → that's LEFT of NORTH in old, but now it's at...
  //   Actually after 90° CW rotation, the old NORTH_LEFT (NW corner) is now at EAST_LEFT position
  //   because from the EAST side looking in, the left side is the top-right of the original square.

  // Let's be concrete:
  // Original corners: NW(0,0), NE(1,0), SE(1,1), SW(0,1)
  // After 90° CW: NW→NE→SE→SW→NW
  //   Old NW(0,0) → new NE(1,0): position on NORTH edge: was LEFT, now RIGHT on NORTH...
  //   No wait — the tile rotates, the positions are physical.
  //
  // After 90° CW rotation, the physical EAST edge of the placed tile was the logical NORTH edge.
  // NORTH_LEFT (logical) = upper-left of original tile = top of EAST edge (physical) after rotation.
  // So NORTH_LEFT → EAST_LEFT? Let me think again...
  //
  // NORTH edge positions (left→right, viewed from outside): NW_corner=LEFT, center=CENTER, NE_corner=RIGHT
  // EAST edge positions (left→right, viewed from outside): NE_corner=LEFT, center=CENTER, SE_corner=RIGHT
  //
  // After 90° CW rotation:
  //   The NW corner of the tile moves to the NE position → NORTH_LEFT → becomes part of EAST edge at LEFT position → EAST_LEFT?
  //   Hmm, but NW corner of original tile is at position NORTH_LEFT.
  //   After 90° CW, NW → NE (physically). The NE corner is EAST_LEFT (left side of EAST edge viewed from outside).
  //   So NORTH_LEFT → EAST_LEFT ✓
  //   NORTH_CENTER → EAST_CENTER ✓
  //   NORTH_RIGHT (NE corner) → SE corner (physically after 90° CW) → EAST_RIGHT ✓
  //   (SE corner = right of EAST edge viewed from outside ✓)
  //
  // So for 90° CW rotation: the side (LEFT/CENTER/RIGHT) is preserved!
  // This makes sense: rotating the whole tile keeps relative positions within each edge consistent.

  return `${rotatedDir}_${side}` as EdgePosition
}

/**
 * Un-rotate an EdgePosition from physical to logical.
 * Given a tile rotated R degrees, map physical edge position back to logical.
 */
export function unrotateEdgePosition(physicalPos: EdgePosition, rotation: Rotation): EdgePosition {
  const inverse = ((360 - rotation) % 360) as Rotation
  return rotateEdgePosition(physicalPos, inverse)
}

/**
 * Get the segment id at a physical edge position, accounting for tile rotation.
 */
export function getSegmentAtEdgePosition(
  def: TileDefinition,
  rotation: Rotation,
  physicalPos: EdgePosition,
): string {
  const logicalPos = unrotateEdgePosition(physicalPos, rotation)
  return def.edgePositionToSegment[logicalPos]
}

// ─── Placement validation ─────────────────────────────────────────────────────

function getNeighborCoord(coord: Coordinate, dir: Direction): Coordinate {
  const { dx, dy } = DIRECTION_DELTA[dir]
  return { x: coord.x + dx, y: coord.y + dy }
}

/**
 * Returns true if placing `instance` at `coord` on `board` is valid.
 * Rules:
 *  1. The cell must be empty.
 *  2. The cell must be adjacent to at least one placed tile.
 *  3. All adjacent tile edges must match on the shared edge.
 */
export function isValidPlacement(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  instance: TileInstance,
  coord: Coordinate,
): boolean {
  const key = coordKey(coord)
  if (board.tiles[key]) return false  // cell occupied

  const def = tileMap[instance.definitionId]
  if (!def) return false

  // Empty board: only (0,0) is a valid starting position
  if (Object.keys(board.tiles).length === 0) {
    return coord.x === 0 && coord.y === 0
  }

  let hasNeighbor = false

  for (const dir of DIRECTIONS) {
    const neighborCoord = getNeighborCoord(coord, dir)
    const neighborKey = coordKey(neighborCoord)
    const neighborTile = board.tiles[neighborKey]

    if (!neighborTile) continue
    hasNeighbor = true

    const neighborDef = tileMap[neighborTile.definitionId]
    if (!neighborDef) return false

    // My physical edge facing this neighbor
    const myEdge = getEdge(def, instance.rotation, dir)
    // Neighbor's physical edge facing back at me
    const neighborEdge = getEdge(neighborDef, neighborTile.rotation, OPPOSITE_DIRECTION[dir])

    if (myEdge !== neighborEdge) return false
  }

  return hasNeighbor
}

/**
 * Returns all valid board positions where `instance` can be placed.
 * Only checks candidate positions adjacent to existing tiles.
 */
export function getValidPositions(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  instance: TileInstance,
): Coordinate[] {
  const candidates = new Set<string>()

  for (const key of Object.keys(board.tiles)) {
    const [x, y] = key.split(',').map(Number)
    for (const dir of DIRECTIONS) {
      const { dx, dy } = DIRECTION_DELTA[dir]
      const candidateKey = coordKey({ x: x + dx, y: y + dy })
      if (!board.tiles[candidateKey]) {
        candidates.add(candidateKey)
      }
    }
  }

  // Special case: empty board — starting position is (0,0)
  if (Object.keys(board.tiles).length === 0) {
    candidates.add('0,0')
  }

  const valid: Coordinate[] = []
  for (const key of candidates) {
    const [x, y] = key.split(',').map(Number)
    if (isValidPlacement(board, tileMap, instance, { x, y })) {
      valid.push({ x, y })
    }
  }
  return valid
}

/**
 * Returns which rotations of `instance` are valid at `coord`.
 */
export function getValidRotations(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  instance: TileInstance,
  coord: Coordinate,
): Rotation[] {
  const rotations: Rotation[] = [0, 90, 180, 270]
  return rotations.filter(r =>
    isValidPlacement(board, tileMap, { ...instance, rotation: r }, coord)
  )
}

/**
 * Returns true if there is at least one valid placement for this tile
 * anywhere on the board at any rotation.
 */
export function hasAnyValidPlacement(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  instance: TileInstance,
): boolean {
  for (const rotation of [0, 90, 180, 270] as Rotation[]) {
    const positions = getValidPositions(board, tileMap, { ...instance, rotation })
    if (positions.length > 0) return true
  }
  return false
}

/**
 * Returns all board positions where `instance` can be placed with ANY valid rotation.
 * Returns a list of coordinates.
 */
export function getAllPotentialPlacements(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  instance: TileInstance,
): Coordinate[] {
  const candidates = new Set<string>()

  // 1. Identify all candidate cells (empty cells adjacent to existing tiles)
  for (const key of Object.keys(board.tiles)) {
    const [x, y] = key.split(',').map(Number)
    for (const dir of DIRECTIONS) {
      const { dx, dy } = DIRECTION_DELTA[dir]
      const candidateKey = coordKey({ x: x + dx, y: y + dy })
      if (!board.tiles[candidateKey]) {
        candidates.add(candidateKey)
      }
    }
  }

  // Special case: empty board
  if (Object.keys(board.tiles).length === 0) {
    candidates.add('0,0')
  }

  const valid: Coordinate[] = []

  // 2. Check each candidate
  for (const key of candidates) {
    const [x, y] = key.split(',').map(Number)
    const coord = { x, y }

    // Check if ANY rotation works here
    let canFit = false
    for (const rotation of [0, 90, 180, 270] as Rotation[]) {
      if (isValidPlacement(board, tileMap, { ...instance, rotation }, coord)) {
        canFit = true
        break
      }
    }

    if (canFit) {
      valid.push(coord)
    }
  }

  return valid
}

// Export TILE_MAP for convenience (engines can pass it through)
export { TILE_MAP }
