-- =============================================================================
-- Migration 003: Insert missing base-c3 tiles (if 002 already ran with base31_ source)
-- =============================================================================
--
-- Migration 002 originally cloned base3_ from base31_ rows which don't exist.
-- This inserts base3_ by cloning from base2_ instead. The ON CONFLICT DO NOTHING
-- guard means it's also safe to run even if 002 (fixed) already inserted them.
-- =============================================================================

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
