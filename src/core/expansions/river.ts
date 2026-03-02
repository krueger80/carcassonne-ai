/**
 * River I expansion — no custom scoring rules, just tiles.
 * The river is placed at game start before the normal tile bag is used.
 */

import { RIVER_C3_TILES } from '../data/riverTilesC3.ts'
import type { ExpansionConfig } from './registry.ts'

export const RIVER_C3_EXPANSION: ExpansionConfig = {
  id: 'river-c3',
  tiles: RIVER_C3_TILES,
  scoringRules: [],
  enableBigMeeple: false,
}
