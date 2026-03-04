import type { Board, Coordinate } from '../types/board.ts'
import type { TileDefinition, TileInstance, Direction, EdgeType, EdgePosition, Rotation, FeatureType } from '../types/tile.ts'
import { coordKey } from '../types/board.ts'

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
 * Derived from the center segment of the edge.
 */
export function getEdge(def: TileDefinition, rotation: Rotation, physicalDir: Direction): EdgeType {
  const features = getEdgeFeatures(def, rotation, physicalDir)
  const center = features[1]
  /* CLOISTERS shouldn't be at edges usually, but if so treat as FIELD for simple type checks */
  return (center === 'CLOISTER' ? 'FIELD' : center) as EdgeType
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

/**
 * Get the feature types at a physical direction (Left, Center, Right), taking rotation into account.
 */
export function getEdgeFeatures(
  def: TileDefinition,
  rotation: Rotation,
  physicalDir: Direction
): [FeatureType, FeatureType, FeatureType] {
  const sides = ['LEFT', 'CENTER', 'RIGHT'] as const
  return sides.map(side => {
    const physicalPos = `${physicalDir}_${side}` as EdgePosition
    const segId = getSegmentAtEdgePosition(def, rotation, physicalPos)
    const seg = def.segments.find(s => s.id === segId)
    // Fallback to FIELD if missing, but data integrity should prevent this
    return seg ? seg.type : 'FIELD'
  }) as [FeatureType, FeatureType, FeatureType]
}

function getNeighborCoord(coord: Coordinate, dir: Direction): Coordinate {
  const { dx, dy } = DIRECTION_DELTA[dir]
  return { x: coord.x + dx, y: coord.y + dy }
}

export function getRotatedOffset(dx: number, dy: number, rotation: Rotation): { dx: number, dy: number } {
  if (rotation === 0) return { dx, dy }
  if (rotation === 90) return { dx: -dy, dy: dx }
  if (rotation === 180) return { dx: -dx, dy: -dy }
  if (rotation === 270) return { dx: dy, dy: -dx }
  return { dx, dy }
}

/**
 * Returns true if placing `instance` at `coord` on `board` is valid.
 * Rules:
 *  1. The entire footprint (base tile + linked tiles) must be on empty cells.
 *  2. At least one tile in the footprint must be adjacent to an existing board tile.
 *  3. All adjacent tile edges (between footprint and board) must match.
 */
export function isValidPlacement(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  instance: TileInstance,
  coord: Coordinate,
): boolean {
  const def = tileMap[instance.definitionId]
  if (!def) return false

  // Compute footprint: [ { coord, defId } ]
  const footprint: { coord: Coordinate, defId: string }[] = [
    { coord, defId: instance.definitionId }
  ]
  if (def.linkedTiles) {
    for (const link of def.linkedTiles) {
      const { dx, dy } = getRotatedOffset(link.dx, link.dy, instance.rotation)
      footprint.push({
        coord: { x: coord.x + dx, y: coord.y + dy },
        defId: link.definitionId
      })
    }
  }

  // 1. All cells in footprint must be empty
  const footprintKeys = new Set(footprint.map(f => coordKey(f.coord)))
  for (const f of footprint) {
    if (board.tiles[coordKey(f.coord)]) return false
  }

  // Empty board: only (0,0) is a valid starting position, and the base tile must be at (0,0)
  if (Object.keys(board.tiles).length === 0) {
    // Note: The base tile was clicked at (0,0). So coord === (0,0).
    return coord.x === 0 && coord.y === 0
  }

  let hasNeighbor = false

  // 2 & 3. Check adjacency and edge matching for all tiles in footprint
  for (const f of footprint) {
    const subDef = tileMap[f.defId]
    if (!subDef) return false

    for (const dir of DIRECTIONS) {
      const neighborCoord = getNeighborCoord(f.coord, dir)
      const neighborKey = coordKey(neighborCoord)

      // If the neighbor is part of the footprint being placed, ignore it
      // (we assume the compound tile itself is internally consistent)
      if (footprintKeys.has(neighborKey)) continue

      const neighborTile = board.tiles[neighborKey]
      if (!neighborTile) continue

      hasNeighbor = true

      const neighborDef = tileMap[neighborTile.definitionId]
      if (!neighborDef) return false

      // Check edges
      const myFeatures = getEdgeFeatures(subDef, instance.rotation, dir)
      const neighborDir = OPPOSITE_DIRECTION[dir]
      const neighborFeatures = getEdgeFeatures(neighborDef, neighborTile.rotation, neighborDir)

      if (myFeatures[0] !== neighborFeatures[2]) return false
      if (myFeatures[1] !== neighborFeatures[1]) return false
      if (myFeatures[2] !== neighborFeatures[0]) return false
    }
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

  const valid = new Set<string>()
  const def = tileMap[instance.definitionId]
  if (!def) return []

  for (const key of candidates) {
    const [cx, cy] = key.split(',').map(Number)

    // For the given instance rotation, what are the footprint offsets?
    const offsets = [{ dx: 0, dy: 0 }]
    if (def.linkedTiles) {
      for (const lt of def.linkedTiles) {
        offsets.push(getRotatedOffset(lt.dx, lt.dy, instance.rotation))
      }
    }

    for (const off of offsets) {
      const testCoord = { x: cx - off.dx, y: cy - off.dy }
      if (isValidPlacement(board, tileMap, instance, testCoord)) {
        valid.add(coordKey(testCoord))
      }
    }
  }

  return Array.from(valid).map(k => {
    const [x, y] = k.split(',').map(Number)
    return { x, y }
  })
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

  const valid = new Set<string>()
  const def = tileMap[instance.definitionId]
  if (!def) return []

  // 2. Check each candidate
  for (const key of candidates) {
    const [cx, cy] = key.split(',').map(Number)

    // Check if ANY rotation works here
    for (const rotation of [0, 90, 180, 270] as Rotation[]) {
      const offsets = [{ dx: 0, dy: 0 }]
      if (def.linkedTiles) {
        for (const lt of def.linkedTiles) {
          offsets.push(getRotatedOffset(lt.dx, lt.dy, rotation))
        }
      }

      for (const off of offsets) {
        const testCoord = { x: cx - off.dx, y: cy - off.dy }
        if (isValidPlacement(board, tileMap, { ...instance, rotation }, testCoord)) {
          valid.add(coordKey(testCoord))
        }
      }
    }
  }

  return Array.from(valid).map(k => {
    const [x, y] = k.split(',').map(Number)
    return { x, y }
  })
}

// ─── River placement helpers ────────────────────────────────────────────────

export type RiverTurnDirection = 'LEFT' | 'RIGHT' | 'STRAIGHT'

/**
 * Get the physical directions that have a RIVER at CENTER for a tile+rotation.
 */
export function getRiverEdges(def: TileDefinition, rotation: Rotation): Direction[] {
  const result: Direction[] = []
  for (const dir of DIRECTIONS) {
    const features = getEdgeFeatures(def, rotation, dir)
    if (features[1] === 'RIVER') result.push(dir)
  }
  return result
}

/**
 * Determine the turn direction of a river tile.
 * Given the entry direction (where the river flows IN from a neighbor)
 * and the exit direction (where it flows OUT), compute LEFT/RIGHT/STRAIGHT.
 */
export function computeRiverTurn(entryDir: Direction, exitDir: Direction): RiverTurnDirection {
  const idx: Record<Direction, number> = { NORTH: 0, EAST: 1, SOUTH: 2, WEST: 3 }
  const forwardIdx = (idx[entryDir] + 2) % 4  // opposite of entry = forward
  const delta = (idx[exitDir] - forwardIdx + 4) % 4
  if (delta === 0) return 'STRAIGHT'
  if (delta === 1) return 'RIGHT'
  return 'LEFT' // delta === 3
}

/**
 * Find the root tile info for a given coordinate. 
 * If the tile at coord is a linked sub-tile, finds its root.
 */
export function getRootTileInfo(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  coord: Coordinate
): { def: TileDefinition; coordinate: Coordinate; rotation: Rotation } | null {
  const tile = board.tiles[coordKey(coord)]
  if (!tile) return null
  const def = tileMap[tile.definitionId]
  if (!def) return null

  // If it has linkedTiles, it's likely the root
  if (def.linkedTiles && def.linkedTiles.length > 0) {
    return { def, coordinate: tile.coordinate, rotation: tile.rotation }
  }

  // Otherwise, search neighbors to see if we are a linked tile of someone else.
  // We only need to check immediate neighbors as compound tiles are contiguous.
  const neighbors = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
  ]
  for (const d of neighbors) {
    const nx = coord.x + d.dx, ny = coord.y + d.dy
    const neighbor = board.tiles[coordKey({ x: nx, y: ny })]
    if (!neighbor) continue
    const neighborDef = tileMap[neighbor.definitionId]
    if (neighborDef?.linkedTiles) {
      for (const lt of neighborDef.linkedTiles) {
        const off = getRotatedOffset(lt.dx, lt.dy, neighbor.rotation)
        if (nx + off.dx === coord.x && ny + off.dy === coord.y) {
          return { def: neighborDef, coordinate: neighbor.coordinate, rotation: neighbor.rotation }
        }
      }
    }
  }

  // Fallback: it's a single tile
  return { def, coordinate: tile.coordinate, rotation: tile.rotation }
}

/**
 * For a river tile (possibly compound) placed at `coord` with the given rotation,
 * find the entry direction (connecting to existing river) and exit direction.
 */
export function getRiverEntryExit(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  def: TileDefinition,
  rotation: Rotation,
  coord: Coordinate,
): { entry: Direction | null; exit: Direction | null } {
  // Trace all outwards river edges of the entire compound footprint
  const footprint = [{ dx: 0, dy: 0, defId: def.id }]
  if (def.linkedTiles) {
    for (const lt of def.linkedTiles) {
      footprint.push({ ...getRotatedOffset(lt.dx, lt.dy, rotation), defId: lt.definitionId })
    }
  }

  let entry: Direction | null = null
  let exit: Direction | null = null

  for (const part of footprint) {
    const partDef = tileMap[part.defId]
    if (!partDef) continue
    const partCoord = { x: coord.x + part.dx, y: coord.y + part.dy }
    const riverEdges = getRiverEdges(partDef, rotation)

    for (const dir of riverEdges) {
      const nx = partCoord.x + DIRECTION_DELTA[dir].dx
      const ny = partCoord.y + DIRECTION_DELTA[dir].dy
      const isInternal = footprint.some(f => (coord.x + f.dx) === nx && (coord.y + f.dy) === ny)
      if (isInternal) continue

      const neighborKey = coordKey({ x: nx, y: ny })
      const neighborTile = board.tiles[neighborKey]
      let connectsToRiver = false

      if (neighborTile) {
        const neighborDef = tileMap[neighborTile.definitionId]
        if (neighborDef) {
          const neighborFeatures = getEdgeFeatures(neighborDef, neighborTile.rotation, OPPOSITE_DIRECTION[dir])
          if (neighborFeatures[1] === 'RIVER') {
            connectsToRiver = true
          }
        }
      }

      if (connectsToRiver) {
        entry = dir // connects to existing river
      } else {
        exit = dir // open end, will connect to future tiles
      }
    }
  }
  return { entry, exit }
}

/**
 * Check if a river tile placement would create a forbidden U-turn or loop.
 * Returns true if the placement is ALLOWED.
 */
export function isRiverPlacementAllowed(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  instance: TileInstance,
  coord: Coordinate,
  lastTurnDirection: RiverTurnDirection | null,
): boolean {
  const def = tileMap[instance.definitionId]
  if (!def) return true

  // Trace all outwards river edges of the entire compound footprint
  const footprint = [{ dx: 0, dy: 0, defId: def.id }]
  if (def.linkedTiles) {
    for (const lt of def.linkedTiles) {
      footprint.push({ ...getRotatedOffset(lt.dx, lt.dy, instance.rotation), defId: lt.definitionId })
    }
  }

  let externalRiverEdgeCount = 0
  let entries: { dir: Direction; partCoord: Coordinate }[] = []
  let exits: { dir: Direction; partCoord: Coordinate }[] = []

  for (const part of footprint) {
    const partDef = tileMap[part.defId]
    if (!partDef) continue
    const partCoord = { x: coord.x + part.dx, y: coord.y + part.dy }
    const riverEdges = getRiverEdges(partDef, instance.rotation)

    for (const dir of riverEdges) {
      const nx = partCoord.x + DIRECTION_DELTA[dir].dx
      const ny = partCoord.y + DIRECTION_DELTA[dir].dy
      const isInternal = footprint.some(f => (coord.x + f.dx) === nx && (coord.y + f.dy) === ny)
      if (isInternal) continue

      externalRiverEdgeCount++
      const neighborKey = coordKey({ x: nx, y: ny })
      const neighborTile = board.tiles[neighborKey]
      let connectsToRiver = false

      if (neighborTile) {
        const neighborDef = tileMap[neighborTile.definitionId]
        if (neighborDef) {
          const neighborFeatures = getEdgeFeatures(neighborDef, neighborTile.rotation, OPPOSITE_DIRECTION[dir])
          if (neighborFeatures[1] === 'RIVER') {
            connectsToRiver = true
          }
        }
      }

      if (connectsToRiver) {
        entries.push({ dir, partCoord })
      } else {
        exits.push({ dir, partCoord })
      }
    }
  }

  if (entries.length === 0) return true // Source/isolated, allow placement
  
  if (exits.length === 0) {
    // No open ends remaining. This is only allowed for LAKES (exactly 1 external edge).
    // If it has 2+ edges but no exits, it's closing a loop.
    return externalRiverEdgeCount === 1
  }

  // Loop closure: if it connects to the river at more than one point, it's a loop.
  if (entries.length > 1) return false

  const exit = exits[0] // Standard tiles have 1 exit. 

  for (const entry of entries) {
    const turn = computeRiverTurn(entry.dir, exit.dir)
    if (turn === 'STRAIGHT') continue

    // Dynamic neighbor turn detection
    let neighborTurn: RiverTurnDirection | null = null
    const neighborX = entry.partCoord.x + DIRECTION_DELTA[entry.dir].dx
    const neighborY = entry.partCoord.y + DIRECTION_DELTA[entry.dir].dy
    
    const rootInfo = getRootTileInfo(board, tileMap, { x: neighborX, y: neighborY })
    if (rootInfo) {
      const { entry: nEntry, exit: nExit } = getRiverEntryExit(board, tileMap, rootInfo.def, rootInfo.rotation, rootInfo.coordinate)
      if (nEntry && nExit) {
        neighborTurn = computeRiverTurn(nEntry, nExit)
      } else if (rootInfo.def.startingTile) {
        neighborTurn = 'STRAIGHT'
      }
    }

    const previousTurn = neighborTurn !== null ? neighborTurn : lastTurnDirection
    if (turn === previousTurn) return false
  }

  return true
}

/**
 * Find the open end(s) of the river — empty cells adjacent to a river edge
 * that has no matching river neighbor. Returns the set of candidate coordinates.
 */
export function findRiverOpenEnds(
  board: Board,
  tileMap: Record<string, TileDefinition>,
): Set<string> {
  const openEnds = new Set<string>()

  // Build a set of all occupied physical cells
  const occupied = new Set<string>()
  for (const key of Object.keys(board.tiles)) {
    const tile = board.tiles[key]
    const def = tileMap[tile.definitionId]
    if (!def) continue
    occupied.add(key)
    if (def.linkedTiles) {
      for (const lt of def.linkedTiles) {
        const off = getRotatedOffset(lt.dx, lt.dy, tile.rotation)
        occupied.add(coordKey({ x: tile.coordinate.x + off.dx, y: tile.coordinate.y + off.dy }))
      }
    }
  }

  for (const key of Object.keys(board.tiles)) {
    const tile = board.tiles[key]
    const def = tileMap[tile.definitionId]
    if (!def) continue

    // Check all parts of the footprint for river edges
    const parts = [{ dx: 0, dy: 0, defId: def.id }]
    if (def.linkedTiles) {
      for (const lt of def.linkedTiles) {
        parts.push({ ...getRotatedOffset(lt.dx, lt.dy, tile.rotation), defId: lt.definitionId })
      }
    }

    for (const part of parts) {
      const partDef = tileMap[part.defId]
      if (!partDef) continue
      const riverEdges = getRiverEdges(partDef, tile.rotation)
      const partX = tile.coordinate.x + part.dx
      const partY = tile.coordinate.y + part.dy

      for (const dir of riverEdges) {
        const nx = partX + DIRECTION_DELTA[dir].dx
        const ny = partY + DIRECTION_DELTA[dir].dy
        const neighborKey = coordKey({ x: nx, y: ny })
        if (!occupied.has(neighborKey)) {
          openEnds.add(neighborKey)
        }
      }
    }
  }

  return openEnds
}

/**
 * River-aware version of getAllPotentialPlacements.
 * Only allows placement at the open end of the river, and
 * filters out rotations that would create a U-turn.
 */
export function getAllPotentialRiverPlacements(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  instance: TileInstance,
  lastTurnDirection: RiverTurnDirection | null,
): Coordinate[] {
  // Only consider cells at the open end of the river
  const openEnds = findRiverOpenEnds(board, tileMap)

  const valid = new Set<string>()
  const def = tileMap[instance.definitionId]
  if (!def) return []

  const isCompound = !!(def.linkedTiles && def.linkedTiles.length > 0)
  if (isCompound) {
    console.log(`[RIVER_PLACEMENT] Compound tile ${instance.definitionId}, openEnds:`, Array.from(openEnds))
  }

  for (const key of openEnds) {
    const [cx, cy] = key.split(',').map(Number)

    for (const rotation of [0, 90, 180, 270] as Rotation[]) {
      const inst = { ...instance, rotation }
      const offsets = [{ dx: 0, dy: 0 }]
      if (def.linkedTiles) {
        for (const lt of def.linkedTiles) {
          offsets.push(getRotatedOffset(lt.dx, lt.dy, rotation))
        }
      }

      for (const off of offsets) {
        const testCoord = { x: cx - off.dx, y: cy - off.dy }
        const validPlacement = isValidPlacement(board, tileMap, inst, testCoord)
        const riverAllowed = isRiverPlacementAllowed(board, tileMap, inst, testCoord, lastTurnDirection)

        if (isCompound) {
          console.log(`[RIVER_PLACEMENT] openEnd=(${cx},${cy}) rot=${rotation} off=(${off.dx},${off.dy}) root@(${testCoord.x},${testCoord.y}): valid=${validPlacement} riverAllowed=${riverAllowed}`)
        }

        if (validPlacement && riverAllowed) {
          valid.add(coordKey(testCoord))
        }
      }
    }
  }

  const result = Array.from(valid).map(k => {
    const [x, y] = k.split(',').map(Number)
    return { x, y }
  })

  if (isCompound) {
    console.log(`[RIVER_PLACEMENT] Final valid placements for ${instance.definitionId}:`, result)
  }

  return result
}

/**
 * River-aware version of getValidRotations.
 * Filters out rotations that would create a U-turn.
 */
export function getValidRiverRotations(
  board: Board,
  tileMap: Record<string, TileDefinition>,
  instance: TileInstance,
  coord: Coordinate,
  lastTurnDirection: RiverTurnDirection | null,
): Rotation[] {
  const openEnds = findRiverOpenEnds(board, tileMap)
  const def = tileMap[instance.definitionId]

  const rotations: Rotation[] = [0, 90, 180, 270]
  return rotations.filter(r => {
    const inst = { ...instance, rotation: r }

    // Check if the tile or any of its footprint parts lie on an open river end
    let isAtOpenEnd = false
    const offsets = [{ dx: 0, dy: 0 }]
    if (def?.linkedTiles) {
      for (const lt of def.linkedTiles) {
        offsets.push(getRotatedOffset(lt.dx, lt.dy, r))
      }
    }

    for (const off of offsets) {
      const footprintCoord = { x: coord.x + off.dx, y: coord.y + off.dy }
      if (openEnds.has(coordKey(footprintCoord))) {
        isAtOpenEnd = true
        break
      }
    }

    if (!isAtOpenEnd) return false

    return isValidPlacement(board, tileMap, inst, coord) &&
      isRiverPlacementAllowed(board, tileMap, inst, coord, lastTurnDirection)
  })
}
