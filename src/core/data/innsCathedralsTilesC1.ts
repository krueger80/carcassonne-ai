import { IC_TILES } from './innsCathedralsTiles.ts'
import { remapToEdition } from './tileEditionUtils.ts'

/** Inns & Cathedrals — 1st edition (C1). Same tile layouts as C3, C1 artwork. */
export const IC1_TILES = remapToEdition(IC_TILES, 'ic1', 'inns-cathedrals-c1')
