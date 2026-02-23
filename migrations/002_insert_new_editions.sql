-- =============================================================================
-- Migration 002: Insert tile rows for new editions (C1/C3 for base, I&C, T&B)
-- =============================================================================
--
-- Each block clones config JSONB from an existing edition, remapping tile_id,
-- expansion, image_url, and version for the new edition.
--
-- Source editions (already in DB after migration 001):
--   base-c2   (base2_*)  → base-c1   (base1_*)
--   base-c2   (base2_*)  → base-c3   (base3_*)  ← base31_ may not be in DB
--   inns-cathedrals-c3   (ic3_*)   → inns-cathedrals-c1  (ic1_*)
--   inns-cathedrals-c3   (ic3_*)   → inns-cathedrals-c2  (ic2_*)
--   traders-builders-c2  (tb2_*)   → traders-builders-c1 (tb1_*)
--   traders-builders-c31 (tb31_*)  → traders-builders-c3 (tb3_*)
--
-- ON CONFLICT DO NOTHING makes this migration safe to re-run.
-- =============================================================================

BEGIN;

-- ── Base C1 (clone from base-c2 / base2_*) ───────────────────────────────────
INSERT INTO carcassonne_tiles (tile_id, expansion, count, image_url, version, config)
SELECT
  'base1_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1),
  'base-c1',
  count,
  '/images/BaseGame_C1/Base_Game_C1_Tile_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1) || '.jpg',
  'C1',
  config
FROM carcassonne_tiles
WHERE tile_id ~ '^base2_'
ON CONFLICT (tile_id) DO NOTHING;

-- ── Base C3 (clone from base-c2 / base2_* — base31_ may not be in DB) ────────
INSERT INTO carcassonne_tiles (tile_id, expansion, count, image_url, version, config)
SELECT
  'base3_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1),
  'base-c3',
  count,
  '/images/BaseGame_C3/Base_Game_C3_Tile_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1) || '.jpg',
  'C3',
  config
FROM carcassonne_tiles
WHERE tile_id ~ '^base2_'
ON CONFLICT (tile_id) DO NOTHING;

-- ── Inns & Cathedrals C1 (clone from inns-cathedrals-c3 / ic3_*) ─────────────
-- image_url left NULL — non-standard numbered filenames set by migration 005.
INSERT INTO carcassonne_tiles (tile_id, expansion, count, image_url, version, config)
SELECT
  'ic1_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1),
  'inns-cathedrals-c1',
  count,
  NULL,
  'C1',
  config
FROM carcassonne_tiles
WHERE tile_id ~ '^ic3_'
ON CONFLICT (tile_id) DO NOTHING;

-- ── Inns & Cathedrals C2 (clone from inns-cathedrals-c3 / ic3_*) ─────────────
INSERT INTO carcassonne_tiles (tile_id, expansion, count, image_url, version, config)
SELECT
  'ic2_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1),
  'inns-cathedrals-c2',
  count,
  '/images/InnsAndCathedrals_C2/Inns_And_Cathedrals_C2_Tile_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1) || '.jpg',
  'C2',
  config
FROM carcassonne_tiles
WHERE tile_id ~ '^ic3_'
ON CONFLICT (tile_id) DO NOTHING;

-- ── Traders & Builders C1 (clone from traders-builders-c2 / tb2_*) ───────────
-- image_url left NULL — non-standard numbered filenames set by migration 005.
INSERT INTO carcassonne_tiles (tile_id, expansion, count, image_url, version, config)
SELECT
  'tb1_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1),
  'traders-builders-c1',
  count,
  NULL,
  'C1',
  config
FROM carcassonne_tiles
WHERE tile_id ~ '^tb2_'
ON CONFLICT (tile_id) DO NOTHING;

-- ── Traders & Builders C3 (clone from traders-builders-c31 / tb31_*) ─────────
INSERT INTO carcassonne_tiles (tile_id, expansion, count, image_url, version, config)
SELECT
  'tb3_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1),
  'traders-builders-c3',
  count,
  '/images/TradersAndBuilders_C3/Traders_And_Builders_C3_Tile_' || SUBSTRING(tile_id FROM POSITION('_' IN tile_id) + 1) || '.png',
  'C3',
  config
FROM carcassonne_tiles
WHERE tile_id ~ '^tb31_'
ON CONFLICT (tile_id) DO NOTHING;

COMMIT;
