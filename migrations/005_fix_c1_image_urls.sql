-- =============================================================================
-- Migration 005: Fix image_url for editions with non-standard filename patterns
-- =============================================================================
--
-- InnsAndCathedrals_C1  → Inns_C1_01.jpg … Inns_C1_16.jpg,
--                          Inns_C1_17_new_junction.jpg, Inns_C1_17_old_junction.jpg
--   Tiles are mapped by alphabetical order of their suffix (A=01 … Q=18).
--   Position 17 (tile P) → _new_junction; position 18 (tile Q) → _old_junction.
--
-- TradersAndBuilders_C1 → Trad_c1_tile_01.jpg … Trad_c1_tile_24.jpg
--   24 tiles mapped A=01 … X=24 by alphabetical order.
--
-- TradersAndBuilders_C3 → Traders_And_Builders_C3_Tile_A.png (same letter pattern
--   as C31, but .png extension, not .jpg).
-- =============================================================================

-- ── Inns & Cathedrals C1 ─────────────────────────────────────────────────────
UPDATE carcassonne_tiles t
SET image_url = '/images/InnsAndCathedrals_C1/' || CASE
    WHEN rn <= 16 THEN 'Inns_C1_' || LPAD(rn::text, 2, '0') || '.jpg'
    WHEN rn = 17  THEN 'Inns_C1_17_new_junction.jpg'
    ELSE               'Inns_C1_17_old_junction.jpg'
  END
FROM (
  SELECT tile_id, ROW_NUMBER() OVER (ORDER BY tile_id) AS rn
  FROM carcassonne_tiles
  WHERE tile_id ~ '^ic1_'
) s
WHERE t.tile_id = s.tile_id;

-- ── Traders & Builders C1 ────────────────────────────────────────────────────
UPDATE carcassonne_tiles t
SET image_url = '/images/TradersAndBuilders_C1/Trad_c1_tile_' || LPAD(rn::text, 2, '0') || '.jpg'
FROM (
  SELECT tile_id, ROW_NUMBER() OVER (ORDER BY tile_id) AS rn
  FROM carcassonne_tiles
  WHERE tile_id ~ '^tb1_'
) s
WHERE t.tile_id = s.tile_id;

-- ── Traders & Builders C3 (.jpg → .png) ──────────────────────────────────────
UPDATE carcassonne_tiles
SET image_url = REPLACE(image_url, '.jpg', '.png')
WHERE tile_id ~ '^tb3_'
  AND image_url LIKE '%.jpg';
