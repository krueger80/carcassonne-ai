export type EdgeType = 'CITY' | 'ROAD' | 'FIELD'
export type FeatureType = 'CITY' | 'ROAD' | 'CLOISTER' | 'FIELD'
export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST'
export type Rotation = 0 | 90 | 180 | 270

// Each edge is divided into 3 sub-positions (LEFT, CENTER, RIGHT viewed from outside).
// Roads always occupy CENTER. Cities can span the full edge. Fields fill the rest.
export type EdgePosition =
  | 'NORTH_LEFT' | 'NORTH_CENTER' | 'NORTH_RIGHT'
  | 'EAST_LEFT' | 'EAST_CENTER' | 'EAST_RIGHT'
  | 'SOUTH_LEFT' | 'SOUTH_CENTER' | 'SOUTH_RIGHT'
  | 'WEST_LEFT' | 'WEST_CENTER' | 'WEST_RIGHT'

// All edge positions grouped by direction
export const EDGE_POSITIONS: Record<Direction, EdgePosition[]> = {
  NORTH: ['NORTH_LEFT', 'NORTH_CENTER', 'NORTH_RIGHT'],
  EAST: ['EAST_LEFT', 'EAST_CENTER', 'EAST_RIGHT'],
  SOUTH: ['SOUTH_LEFT', 'SOUTH_CENTER', 'SOUTH_RIGHT'],
  WEST: ['WEST_LEFT', 'WEST_CENTER', 'WEST_RIGHT'],
}

// One discrete terrain region within a tile.
// A tile may have 1–6 segments (e.g. a road splits a field into two halves).
export interface Segment {
  id: string           // local to this tile, e.g. 'city0', 'road0', 'field0'
  type: FeatureType
  hasPennant?: boolean        // cities only
  hasInn?: boolean            // roads only – inn on lake
  hasCathedral?: boolean      // cities only – cathedral
  // SVG path for visual rendering (100x100 viewBox)
  svgPath: string
  // Where to place a meeple visually (in 0-100 viewBox coords)
  meepleCentroid: { x: number; y: number }
}

// The blueprint for one tile type. Shared across all copies.
export interface TileDefinition {
  id: string            // e.g. 'base_D' (matches canonical Carcassonne tile IDs)
  count: number         // how many copies in the bag

  // The terrain segments
  segments: Segment[]
  // Bridge from edge sub-position → segment id (used by FeatureDetector)
  edgePositionToSegment: Record<EdgePosition, string>
  startingTile?: boolean
  expansionId?: string  // undefined = base game
  imageUrl?: string     // Optional image asset to render instead of SVG
}

// An instance of a tile (either in the bag or placed on the board)
export interface TileInstance {
  definitionId: string
  rotation: Rotation
}
