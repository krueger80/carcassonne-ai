import { IC_TILES } from './innsCathedralsTiles.ts'
import { remapToEdition } from './tileEditionUtils.ts'

/** Inns & Cathedrals — 2nd edition (C2). Same tile layouts as C3, C2 artwork. */
export const IC2_TILES = remapToEdition(IC_TILES, 'ic2', 'inns-cathedrals-c2')
