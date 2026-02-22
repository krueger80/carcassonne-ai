/**
 * Expansion registry — maps expansion IDs to their configuration.
 * New expansions register here so GameEngine can resolve them by ID string.
 */

import type { TileDefinition } from '../types/tile.ts'
import type { ScoringRule } from '../engine/ScoreCalculator.ts'
import { INNS_CATHEDRALS_EXPANSION } from './innsCathedrals.ts'
import { INNS_CATHEDRALS_C31_EXPANSION } from './innsCathedralsC31.ts'
import { TRADERS_BUILDERS_EXPANSION } from './tradersBuilders.ts'
import { TRADERS_BUILDERS_C31_EXPANSION } from './tradersBuildersC31.ts'
import { DRAGON_FAIRY_EXPANSION } from './dragonFairy.ts'

export interface ExpansionConfig {
  id: string
  version?: string
  tiles: TileDefinition[]
  scoringRules: ScoringRule[]
  enableBigMeeple: boolean
  enableBuilderAndPig?: boolean
  enableDragonAndFairy?: boolean
}

const EXPANSION_REGISTRY: Record<string, ExpansionConfig> = {
  'inns-cathedrals': INNS_CATHEDRALS_EXPANSION,
  'inns-cathedrals-c31': INNS_CATHEDRALS_C31_EXPANSION,
  'traders-builders': TRADERS_BUILDERS_EXPANSION,
  'traders-builders-c31': TRADERS_BUILDERS_C31_EXPANSION,
  'dragon-fairy': DRAGON_FAIRY_EXPANSION,
}

export function getExpansionConfig(id: string): ExpansionConfig | undefined {
  return EXPANSION_REGISTRY[id]
}
