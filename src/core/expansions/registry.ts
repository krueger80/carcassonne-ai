/**
 * Expansion registry — maps versioned expansion IDs to their configuration.
 * New expansions register here so GameEngine can resolve them by ID string.
 */

import type { TileDefinition } from '../types/tile.ts'
import type { ScoringRule } from '../engine/ScoreCalculator.ts'
import type { ExpansionSelection } from '../types/setup.ts'
import {
  INNS_CATHEDRALS_C1_EXPANSION,
  INNS_CATHEDRALS_C2_EXPANSION,
  INNS_CATHEDRALS_C3_EXPANSION,
} from './innsCathedrals.ts'
import { INNS_CATHEDRALS_C31_EXPANSION } from './innsCathedralsC31.ts'
import {
  TRADERS_BUILDERS_C1_EXPANSION,
  TRADERS_BUILDERS_C2_EXPANSION,
  TRADERS_BUILDERS_C3_EXPANSION,
} from './tradersBuilders.ts'
import { TRADERS_BUILDERS_C31_EXPANSION } from './tradersBuildersC31.ts'
import { DRAGON_FAIRY_C31_EXPANSION } from './dragonFairy.ts'

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
  'inns-cathedrals-c1':   INNS_CATHEDRALS_C1_EXPANSION,
  'inns-cathedrals-c2':   INNS_CATHEDRALS_C2_EXPANSION,
  'inns-cathedrals-c3':   INNS_CATHEDRALS_C3_EXPANSION,
  'inns-cathedrals-c31':  INNS_CATHEDRALS_C31_EXPANSION,
  'traders-builders-c1':  TRADERS_BUILDERS_C1_EXPANSION,
  'traders-builders-c2':  TRADERS_BUILDERS_C2_EXPANSION,
  'traders-builders-c3':  TRADERS_BUILDERS_C3_EXPANSION,
  'traders-builders-c31': TRADERS_BUILDERS_C31_EXPANSION,
  'dragon-fairy-c31':     DRAGON_FAIRY_C31_EXPANSION,
}

export function getExpansionConfig(id: string): ExpansionConfig | undefined {
  return EXPANSION_REGISTRY[id]
}

/**
 * Build an ExpansionConfig from an ExpansionSelection, independently combining
 * the chosen rules version with the chosen tile set edition.
 */
export function buildExpansionConfig(selection: ExpansionSelection): ExpansionConfig {
  if (selection.id === 'inns-cathedrals') {
    const rules = selection.rulesVersion === 'modern'
      ? INNS_CATHEDRALS_C31_EXPANSION.scoringRules
      : INNS_CATHEDRALS_C3_EXPANSION.scoringRules
    const tilesMap = {
      'C1':  INNS_CATHEDRALS_C1_EXPANSION.tiles,
      'C2':  INNS_CATHEDRALS_C2_EXPANSION.tiles,
      'C3':  INNS_CATHEDRALS_C3_EXPANSION.tiles,
      'C3.1': INNS_CATHEDRALS_C31_EXPANSION.tiles,
    }
    return {
      id: selection.id,
      tiles: tilesMap[selection.tileEdition] ?? INNS_CATHEDRALS_C3_EXPANSION.tiles,
      scoringRules: rules,
      enableBigMeeple: true,
    }
  }

  if (selection.id === 'traders-builders') {
    // T&B C3 (modern) rules not yet implemented — both versions use classic rules for now
    const tilesMap = {
      'C1':  TRADERS_BUILDERS_C1_EXPANSION.tiles,
      'C2':  TRADERS_BUILDERS_C2_EXPANSION.tiles,
      'C3':  TRADERS_BUILDERS_C3_EXPANSION.tiles,
      'C3.1': TRADERS_BUILDERS_C31_EXPANSION.tiles,
    }
    return {
      id: selection.id,
      tiles: tilesMap[selection.tileEdition] ?? TRADERS_BUILDERS_C2_EXPANSION.tiles,
      scoringRules: TRADERS_BUILDERS_C2_EXPANSION.scoringRules,
      enableBigMeeple: true,
      enableBuilderAndPig: true,
    }
  }

  // dragon-fairy — only one edition
  return {
    ...DRAGON_FAIRY_C31_EXPANSION,
    id: selection.id,
  }
}
