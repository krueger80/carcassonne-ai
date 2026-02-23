/**
 * Inns & Cathedrals C3.1 Edition expansion configuration.
 *
 * Scoring changes from standard I&C:
 *  - Incomplete Road with Inn: 1 pt/tile (standard I&C is 0)
 *  - Incomplete City with Cathedral: 1 pt/(tile+pennant) (standard I&C is 0)
 *  - Completed features remain same (Road+Inn: 2x, City+Cathedral: 3x)
 */

import { ScoringRule, countAdjacentCompletedCities } from '../engine/ScoreCalculator.ts'
import { IC_C31_TILES } from '../data/innsCathedralsC31Tiles.ts'

export const IC_C31_SCORING_RULES: ScoringRule[] = [
    {
        featureType: 'ROAD',
        scoreComplete: (f) => (f.metadata as any)?.hasInn ? f.tileCount * 2 : f.tileCount,
        scoreIncomplete: (f) => f.tileCount, // Inn still gives 1pt/tile in C3.1
    },
    {
        featureType: 'CITY',
        scoreComplete: (f) => {
            const base = f.tileCount + f.pennantCount
            return (f.metadata as any)?.hasCathedral ? base * 3 : base * 2
        },
        scoreIncomplete: (f) => {
            return f.tileCount + f.pennantCount // Cathedral still gives 1pt in C3.1
        },
    },
    {
        featureType: 'CLOISTER',
        scoreComplete: () => 9,
        scoreIncomplete: (f) => f.tileCount,
    },
    {
        featureType: 'FIELD',
        scoreComplete: (f, state) => countAdjacentCompletedCities(f, state) * 3,
        scoreIncomplete: (f, state) => countAdjacentCompletedCities(f, state) * 3,
    },
]

export const INNS_CATHEDRALS_C31_EXPANSION = {
    id: 'inns-cathedrals-c31' as const,
    version: 'C3.1',
    tiles: IC_C31_TILES,
    scoringRules: IC_C31_SCORING_RULES,
    enableBigMeeple: true,
}
