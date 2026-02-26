import { TB_TILES } from './tradersBuildersTiles.ts'
import { remapToEdition } from './tileEditionUtils.ts'

/** Traders & Builders — 1st edition (C1). Same tile layouts as C2, C1 artwork. */
export const TB1_TILES = remapToEdition(TB_TILES, 'tb1', 'traders-builders-c1')
