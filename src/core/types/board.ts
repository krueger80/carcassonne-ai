import type { Rotation } from './tile.ts'

export interface Coordinate {
  x: number   // column, increases rightward
  y: number   // row, increases downward
}

export function coordKey(c: Coordinate): string {
  return `${c.x},${c.y}`
}

export function keyToCoord(key: string): Coordinate {
  const [x, y] = key.split(',').map(Number)
  return { x, y }
}

export interface MeeplePlacement {
  playerId: string
  meepleType: string   // MeepleType — kept as string to avoid circular dep
  segmentId: string
  coordinate: Coordinate
}

export interface PlacedTile {
  coordinate: Coordinate
  definitionId: string
  rotation: Rotation
  // segmentId → meeple placed on it
  meeples: Record<string, MeeplePlacement>
}

export interface Board {
  // key = "x,y"
  tiles: Record<string, PlacedTile>
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function emptyBoard(): Board {
  return { tiles: {}, minX: 0, maxX: 0, minY: 0, maxY: 0 }
}
