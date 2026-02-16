/**
 * Expansion registry — maps expansion IDs to their configuration.
 * New expansions register here so GameEngine can resolve them by ID string.
 */

import type { TileDefinition } from '../types/tile.ts'
import type { ScoringRule } from '../engine/ScoreCalculator.ts'
import { INNS_CATHEDRALS_EXPANSION } from './innsCathedrals.ts'

export interface ExpansionConfig {
  id: string
  tiles: TileDefinition[]
  scoringRules: ScoringRule[]
  enableBigMeeple: boolean
}

const EXPANSION_REGISTRY: Record<string, ExpansionConfig> = {
  'inns-cathedrals': INNS_CATHEDRALS_EXPANSION,
}

export function getExpansionConfig(id: string): ExpansionConfig | undefined {
  return EXPANSION_REGISTRY[id]
}
