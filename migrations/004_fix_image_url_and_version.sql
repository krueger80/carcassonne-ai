-- =============================================================================
-- Migration 004: Back-fill image_url and version for rows inserted with NULL
-- =============================================================================
--
-- Migrations 002 and 003 (original versions) left image_url = NULL and
-- version unset. This migration updates only those rows (WHERE image_url IS NULL)
-- so it is safe to re-run and won't overwrite any manually corrected values.
--
-- ic1_ and tb1_ are intentionally skipped here — their filenames require
-- ROW_NUMBER logic handled by migration 005.
-- =============================================================================

-- ── Base C1 ──────────────────────────────────────────────────────────────────
UPDATE carcassonne_tiles
SET
  image_url = '/images/BaseGame_C1/Base_Game_C1_Tile_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1) || '.jpg',
  version   = 'C1'
WHERE tile_id ~ '^base1_' AND image_url IS NULL;

-- ── Base C3 ──────────────────────────────────────────────────────────────────
UPDATE carcassonne_tiles
SET
  image_url = '/images/BaseGame_C3/Base_Game_C3_Tile_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1) || '.jpg',
  version   = 'C3'
WHERE tile_id ~ '^base3_' AND image_url IS NULL;

-- ── Inns & Cathedrals C2 ─────────────────────────────────────────────────────
UPDATE carcassonne_tiles
SET
  image_url = '/images/InnsAndCathedrals_C2/Inns_And_Cathedrals_C2_Tile_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1) || '.jpg',
  version   = 'C2'
WHERE tile_id ~ '^ic2_' AND image_url IS NULL;

-- ── Traders & Builders C3 ────────────────────────────────────────────────────
UPDATE carcassonne_tiles
SET
  image_url = '/images/TradersAndBuilders_C3/Traders_And_Builders_C3_Tile_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1) || '.png',
  version   = 'C3'
WHERE tile_id ~ '^tb3_' AND image_url IS NULL;
