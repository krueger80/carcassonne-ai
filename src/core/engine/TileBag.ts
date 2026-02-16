import type { TileDefinition, TileInstance } from '../types/tile.ts'

/**
 * Generates a cryptographically secure random number in the range [0, 1).
 * Similar to Math.random() but using the Web Crypto API.
 */
function secureRandom(): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  // Divide by 2^32 to get a float in [0, 1)
  return array[0] / (0xffffffff + 1)
}

/** Fisher-Yates shuffle (in-place) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Expand tile definitions into individual instances, find and remove the
 * starting tile, shuffle, then return the bag + starting tile separately.
 */
export function createTileBag(
  definitions: TileDefinition[],
  extraTiles: TileInstance[] = [],
): { bag: TileInstance[]; startingTile: TileInstance } {
  const instances: TileInstance[] = []
  let startingTile: TileInstance | null = null

  for (const def of definitions) {
    for (let i = 0; i < def.count; i++) {
      const instance: TileInstance = { definitionId: def.id, rotation: 0 }
      if (def.startingTile && startingTile === null) {
        // Reserve the first copy as the starting tile
        startingTile = instance
      } else {
        instances.push(instance)
      }
    }
  }

  if (startingTile === null) {
    throw new Error('No starting tile found in tile definitions. Mark one with startingTile: true.')
  }

  instances.push(...extraTiles)
  shuffle(instances)

  return { bag: instances, startingTile }
}

export function drawTile(bag: TileInstance[]): { tile: TileInstance; remaining: TileInstance[] } | null {
  if (bag.length === 0) return null
  const [tile, ...remaining] = bag
  return { tile, remaining }
}

export function peekTile(bag: TileInstance[]): TileInstance | null {
  return bag[0] ?? null
}
