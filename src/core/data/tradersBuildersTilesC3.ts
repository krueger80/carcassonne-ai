import { TB_C31_TILES } from './tradersBuildersC31Tiles.ts'
import { remapToEdition } from './tileEditionUtils.ts'

/** Traders & Builders — 3rd edition (C3). Same tile layouts as C3.1, C3 artwork. */
export const TB3_TILES = remapToEdition(TB_C31_TILES, 'tb3', 'traders-builders-c3')
