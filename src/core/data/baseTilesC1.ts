import { BASE_TILES } from './baseTiles.ts'
import { remapToEdition } from './tileEditionUtils.ts'

/** Base game — 1st edition (C1). Same tile layouts as C2, different artwork. */
export const BASE1_TILES = remapToEdition(BASE_TILES, 'base1', 'base-c1')
