import type { FeatureType } from './tile.ts'
import type { Coordinate, MeeplePlacement } from './board.ts'

export interface FeatureNode {
  coordinate: Coordinate
  segmentId: string
}

// nodeKey format: "x,y:segmentId"
export function nodeKey(coord: Coordinate, segmentId: string): string {
  return `${coord.x},${coord.y}:${segmentId}`
}

export interface Feature {
  id: string                  // stable: root node key
  type: FeatureType
  nodes: FeatureNode[]
  meeples: MeeplePlacement[]
  isComplete: boolean
  tileCount: number           // distinct tiles (not segments)
  pennantCount: number
  openEdgeCount: number       // 0 = complete (for CITY/ROAD)
  // For farm scoring: set of adjacent city feature root IDs
  touchingCityIds: string[]
  // Extra data for expansions
  metadata: Record<string, unknown>
}

// Serializable union-find state (stored in GameState)
export interface UnionFindState {
  // nodeKey → parent nodeKey
  parent: Record<string, string>
  rank: Record<string, number>
  // rootKey → Feature (only roots have entries)
  featureData: Record<string, Feature>
}

export function emptyUnionFindState(): UnionFindState {
  return { parent: {}, rank: {}, featureData: {} }
}
