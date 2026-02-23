import { BASE_TILES_C3 } from './baseTiles_C3.ts'
import { remapToEdition } from './tileEditionUtils.ts'

/** Base game — 3rd edition (C3). Same tile layouts as C3.1, C3 artwork. */
export const BASE3_TILES = remapToEdition(BASE_TILES_C3, 'base3', 'base-c3')
