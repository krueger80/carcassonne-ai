import { TB_SCORING_RULES } from './tradersBuilders.ts'
import { TB_C31_TILES } from '../data/tradersBuildersC31Tiles.ts'

/**
 * Traders & Builders C3.1 Edition expansion configuration.
 */
export const TRADERS_BUILDERS_C31_EXPANSION = {
    id: 'traders-builders' as const,
    version: 'C3.1',
    tiles: TB_C31_TILES,
    scoringRules: TB_SCORING_RULES,
    enableBigMeeple: true,
    enableBuilderAndPig: true,
}
