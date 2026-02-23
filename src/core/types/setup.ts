/**
 * Setup-time configuration types.
 *
 * These types are used only during game setup (SetupScreen) and are not
 * stored in GameState. They are resolved into GameConfig before initGame.
 */

/** Which rule set to use for an expansion that has multiple editions. */
export type RulesVersion = 'classic' | 'modern'

/** Which physical tile set edition to use. */
export type TileEdition = 'C1' | 'C2' | 'C3' | 'C3.1'

/** Canonical expansion identifiers (edition-agnostic). */
export type ExpansionId = 'inns-cathedrals' | 'traders-builders' | 'dragon-fairy'

/**
 * Per-expansion configuration chosen during setup.
 * `rulesVersion` is meaningful for I&C (Classic = 0 pts incomplete, Modern = 1 pt/tile)
 * and T&B (Classic = C2 pig/builder, Modern = C3.1 pig/builder).
 * `tileEdition` is only meaningful for base / I&C / T&B (D&F is always C3.1).
 */
export interface ExpansionSelection {
  id: ExpansionId
  rulesVersion: RulesVersion
  tileEdition: TileEdition
}

/** Maps an ExpansionSelection to the versioned expansionId string used in tile data. */
export function getVersionedExpansionId(sel: ExpansionSelection): string {
  if (sel.id === 'inns-cathedrals') {
    const map: Record<TileEdition, string> = {
      'C1': 'inns-cathedrals-c1',
      'C2': 'inns-cathedrals-c2',
      'C3': 'inns-cathedrals-c3',
      'C3.1': 'inns-cathedrals-c31',
    }
    return map[sel.tileEdition] ?? 'inns-cathedrals-c3'
  }
  if (sel.id === 'traders-builders') {
    const map: Record<TileEdition, string> = {
      'C1': 'traders-builders-c1',
      'C2': 'traders-builders-c2',
      'C3': 'traders-builders-c3',
      'C3.1': 'traders-builders-c31',
    }
    return map[sel.tileEdition] ?? 'traders-builders-c2'
  }
  return 'dragon-fairy-c31'
}
