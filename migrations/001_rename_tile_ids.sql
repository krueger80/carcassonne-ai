-- =============================================================================
-- Migration 001: Rename tile IDs to include edition suffix
-- =============================================================================
--
-- Old ID format   → New ID format     Expansion value change
-- ─────────────── ──────────────────  ─────────────────────────────────────────
-- base_A          → base2_A           * → 'base-c2'
-- ic_A            → ic3_A             'inns-cathedrals'      → 'inns-cathedrals-c3'
-- ic31_A          (unchanged)         * → 'inns-cathedrals-c31'
-- tb_A            → tb2_A             'traders-builders'     → 'traders-builders-c2'
-- tb31_A          (unchanged)         * → 'traders-builders-c31'
-- df_1, df_C …    → df31_1, df31_C …  'dragon-fairy'         → 'dragon-fairy-c31'
-- base31_A        (unchanged, C3.1)   * → 'base-c31'
--
-- Safe to run multiple times (WHERE clause won't match already-renamed rows).
-- =============================================================================

BEGIN;

-- ── Base C2 tiles (24 tile types, ~72 copies by count) ────────────────────────
UPDATE carcassonne_tiles
SET   tile_id   = 'base2_' || SUBSTRING(tile_id FROM 6),  -- strip 'base_', prepend 'base2_'
      expansion = 'base-c2'
WHERE tile_id ~ '^base_[A-Z]$';

-- ── Base C3.1 tiles (if imported) ────────────────────────────────────────────
UPDATE carcassonne_tiles
SET   expansion = 'base-c31'
WHERE tile_id ~ '^base31_';

-- ── Inns & Cathedrals C3 tiles (18 tile types, uses C3 artwork) ──────────────
-- Handles single-letter (ic_A) AND two-letter (ic_Ka, ic_Kb) suffixes
UPDATE carcassonne_tiles
SET   tile_id   = 'ic3_' || SUBSTRING(tile_id FROM 4),  -- strip 'ic_'
      expansion = 'inns-cathedrals-c3'
WHERE tile_id ~ '^ic_';

-- ── Inns & Cathedrals C3.1 tiles (expansion string update only) ──────────────
UPDATE carcassonne_tiles
SET   expansion = 'inns-cathedrals-c31'
WHERE tile_id ~ '^ic31_';

-- ── Traders & Builders C2 tiles (24 tile types) ──────────────────────────────
UPDATE carcassonne_tiles
SET   tile_id   = 'tb2_' || SUBSTRING(tile_id FROM 4),  -- strip 'tb_'
      expansion = 'traders-builders-c2'
WHERE tile_id ~ '^tb_';

-- ── Traders & Builders C3.1 tiles (expansion string update only) ─────────────
UPDATE carcassonne_tiles
SET   expansion = 'traders-builders-c31'
WHERE tile_id ~ '^tb31_';

-- ── Princess & Dragon / Fairy C3.1 tiles (26 tile types) ─────────────────────
-- Suffixes: 1, 2 (numeric) and C–Z (alpha)
UPDATE carcassonne_tiles
SET   tile_id   = 'df31_' || SUBSTRING(tile_id FROM 4),  -- strip 'df_'
      expansion = 'dragon-fairy-c31'
WHERE tile_id ~ '^df_';

COMMIT;
