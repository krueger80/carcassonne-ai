/**
 * Dragon & Fairy expansion tile definitions (C3.1).
 *
 * 26 land tiles + 2 double-sized river tiles (Source + Lake).
 * Tile types:
 *   - Volcano (~6): Dragon teleports here, no meeple placement
 *   - Dragon Hoard (~12): Triggers dragon movement
 *   - Magic Portal (~4): Player can place meeple on any unoccupied feature
 *   - Normal (~4): Standard tiles with the expansion icon
 *
 * Double-sized river tiles:
 *   - Source: River splits in two directions
 *   - Lake: Dragon's lair, river ends here
 *
 * SVG paths use the same 100×100 viewBox as baseTiles.ts.
 */

import type { TileDefinition } from '../types/tile.ts'

// ─── SVG path helpers (reused from baseTiles pattern) ────────────────────────

// City caps
const CITY_N = 'M0,0 L100,0 L70,25 L50,30 L30,25 Z'
const CITY_E = 'M100,0 L100,100 L75,70 L70,50 L75,30 Z'
const CITY_S = 'M0,100 L100,100 L70,75 L50,70 L30,75 Z'
const CITY_W = 'M0,0 L0,100 L25,70 L30,50 L25,30 Z'
const CITY_NE = 'M0,0 L100,0 L100,100 L75,70 L60,60 L30,25 Z'
const CITY_WNE = 'M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z'

// Full-tile fills
const FIELD_FULL = 'M0,0 L100,0 L100,100 L0,100 Z'

// Road strips
const ROAD_NS = 'M46,0 L54,0 L54,100 L46,100 Z'
const ROAD_EW = 'M0,46 L100,46 L100,54 L0,54 Z'

// Road curves
const ROAD_CURVE_SW = 'M0,46 L54,46 L54,100 L46,100 L46,54 L0,54 Z'
const ROAD_CURVE_SE = 'M46,46 L100,46 L100,54 L54,54 L54,100 L46,100 Z'
const ROAD_CURVE_NE = 'M46,0 L54,0 L54,46 L100,46 L100,54 L46,54 Z'

// Cloister
const CLOISTER_RECT = 'M30,30 L70,30 L70,70 L30,70 Z'

// Meeple centroids
const C_NORTH = { x: 50, y: 20 }
const C_EAST = { x: 80, y: 50 }
const C_SOUTH = { x: 50, y: 80 }
const C_WEST = { x: 20, y: 50 }
const C_CENTER = { x: 50, y: 50 }
const C_FIELD_NE = { x: 75, y: 25 }
const C_FIELD_SE = { x: 75, y: 75 }
const C_FIELD_SW = { x: 25, y: 75 }
const C_FIELD_NW = { x: 25, y: 25 }
const C_ROAD_N = { x: 50, y: 25 }
const C_ROAD_S = { x: 50, y: 75 }
const C_ROAD_W = { x: 25, y: 50 }
const C_ROAD_E = { x: 75, y: 50 }

// ─── Volcano Tiles (6) ──────────────────────────────────────────────────────

const VOLCANO_TILES: TileDefinition[] = [
  // ── df_V1: Volcano with all-field edges ──
  {
    id: 'df_V1',
    count: 1,
    expansionId: 'dragon-fairy',
    isVolcano: true,
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_NE },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_V2: Volcano with city on north ──
  {
    id: 'df_V2',
    count: 1,
    expansionId: 'dragon-fairy',
    isVolcano: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_V3: Volcano with road N-S ──
  {
    id: 'df_V3',
    count: 1,
    expansionId: 'dragon-fairy',
    isVolcano: true,
    segments: [
      { id: 'road0', type: 'ROAD', svgPath: ROAD_NS, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L46,0 L46,100 L0,100 Z', meepleCentroid: C_WEST },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,0 L100,0 L100,100 L54,100 Z', meepleCentroid: C_EAST },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'road0', NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1', EAST_CENTER: 'field1', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_V4: Volcano with city on north + road E-S ──
  {
    id: 'df_V4',
    count: 1,
    expansionId: 'dragon-fairy',
    isVolcano: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_CURVE_SE, meepleCentroid: C_FIELD_SE },
      { id: 'field0', type: 'FIELD', svgPath: 'M30,25 L54,46 L54,100 L0,100 L0,0 Z', meepleCentroid: C_FIELD_SW },
      { id: 'field1', type: 'FIELD', svgPath: 'M100,0 L100,46 L46,46 L46,100 L70,75 Z', meepleCentroid: C_FIELD_SE },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field1', EAST_CENTER: 'road0', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_V5: Volcano with city on east ──
  {
    id: 'df_V5',
    count: 1,
    expansionId: 'dragon-fairy',
    isVolcano: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_E, meepleCentroid: C_EAST },
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_V6: Volcano with road E-W ──
  {
    id: 'df_V6',
    count: 1,
    expansionId: 'dragon-fairy',
    isVolcano: true,
    segments: [
      { id: 'road0', type: 'ROAD', svgPath: ROAD_EW, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,46 L0,46 Z', meepleCentroid: C_NORTH },
      { id: 'field1', type: 'FIELD', svgPath: 'M0,54 L100,54 L100,100 L0,100 Z', meepleCentroid: C_SOUTH },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'road0', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'field1', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },
]

// ─── Dragon Hoard Tiles (12) ────────────────────────────────────────────────

const DRAGON_HOARD_TILES: TileDefinition[] = [
  // ── df_D1: Dragon hoard, city N, road S ──
  {
    id: 'df_D1',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'road0', type: 'ROAD', svgPath: 'M46,30 L54,30 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L30,25 L46,30 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
      { id: 'field1', type: 'FIELD', svgPath: 'M100,0 L70,25 L54,30 L54,100 L100,100 Z', meepleCentroid: C_FIELD_SE },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field1', EAST_CENTER: 'field1', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_D2: Dragon hoard, all field ──
  {
    id: 'df_D2',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_CENTER },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_D3: Dragon hoard, city N+E (connected, with pennant) ──
  {
    id: 'df_D3',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'city0', type: 'CITY', hasPennant: true, svgPath: CITY_NE, meepleCentroid: C_FIELD_NE },
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_D4: Dragon hoard, road N-S, city W ──
  {
    id: 'df_D4',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_W, meepleCentroid: C_WEST },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_NS, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M25,30 L46,0 L46,100 L25,70 Z', meepleCentroid: { x: 38, y: 50 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,0 L100,0 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'road0', NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1', EAST_CENTER: 'field1', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── df_D5: Dragon hoard, road W-S (curve) ──
  {
    id: 'df_D5',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'road0', type: 'ROAD', svgPath: ROAD_CURVE_SW, meepleCentroid: { x: 30, y: 70 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L54,100 L54,46 L0,46 Z', meepleCentroid: C_FIELD_NE },
      { id: 'field1', type: 'FIELD', svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_D6: Dragon hoard, cloister ──
  {
    id: 'df_D6',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_NE },
      { id: 'cloister0', type: 'CLOISTER', svgPath: CLOISTER_RECT, meepleCentroid: C_CENTER },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_D7: Dragon hoard, city N, road E-W ──
  {
    id: 'df_D7',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_EW, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L30,25 L0,46 Z', meepleCentroid: C_FIELD_NW },
      { id: 'field1', type: 'FIELD', svgPath: 'M100,0 L70,25 L100,46 Z', meepleCentroid: C_FIELD_NE },
      { id: 'field2', type: 'FIELD', svgPath: 'M0,54 L100,54 L100,100 L0,100 Z', meepleCentroid: C_SOUTH },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field1', EAST_CENTER: 'road0', EAST_RIGHT: 'field2',
      SOUTH_LEFT: 'field2', SOUTH_CENTER: 'field2', SOUTH_RIGHT: 'field2',
      WEST_LEFT: 'field2', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_D8: Dragon hoard, city S ──
  {
    id: 'df_D8',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_S, meepleCentroid: C_SOUTH },
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_NORTH },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'city0', SOUTH_CENTER: 'city0', SOUTH_RIGHT: 'city0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_D9: Dragon hoard, road N-E (curve) ──
  {
    id: 'df_D9',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'road0', type: 'ROAD', svgPath: ROAD_CURVE_NE, meepleCentroid: C_FIELD_NE },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L46,0 L46,54 L100,54 L100,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,0 L100,0 L100,46 L54,46 Z', meepleCentroid: C_FIELD_NE },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'road0', NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1', EAST_CENTER: 'road0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_D10: Dragon hoard, city N+E+W (3-sided) ──
  {
    id: 'df_D10',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_WNE, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M30,75 L50,70 L70,75 L100,100 L0,100 Z', meepleCentroid: C_SOUTH },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── df_D11: Dragon hoard, cloister with road S ──
  {
    id: 'df_D11',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_NE },
      { id: 'road0', type: 'ROAD', svgPath: 'M46,50 L54,50 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S },
      { id: 'cloister0', type: 'CLOISTER', svgPath: CLOISTER_RECT, meepleCentroid: C_CENTER },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_D12: Dragon hoard, city N with pennant ──
  {
    id: 'df_D12',
    count: 1,
    expansionId: 'dragon-fairy',
    hasDragonHoard: true,
    segments: [
      { id: 'city0', type: 'CITY', hasPennant: true, svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },
]

// ─── Magic Portal Tiles (4) ────────────────────────────────────────────────

const MAGIC_PORTAL_TILES: TileDefinition[] = [
  // ── df_P1: Portal, road N-S ──
  {
    id: 'df_P1',
    count: 1,
    expansionId: 'dragon-fairy',
    hasMagicPortal: true,
    segments: [
      { id: 'road0', type: 'ROAD', svgPath: ROAD_NS, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L46,0 L46,100 L0,100 Z', meepleCentroid: C_WEST },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,0 L100,0 L100,100 L54,100 Z', meepleCentroid: C_EAST },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'road0', NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1', EAST_CENTER: 'field1', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_P2: Portal, city N, field ──
  {
    id: 'df_P2',
    count: 1,
    expansionId: 'dragon-fairy',
    hasMagicPortal: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_P3: Portal, road E-W, city S ──
  {
    id: 'df_P3',
    count: 1,
    expansionId: 'dragon-fairy',
    hasMagicPortal: true,
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_S, meepleCentroid: C_SOUTH },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_EW, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,46 L0,46 Z', meepleCentroid: C_NORTH },
      { id: 'field1', type: 'FIELD', svgPath: 'M0,54 L30,75 L70,75 L100,54 Z', meepleCentroid: { x: 50, y: 62 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'road0', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'city0', SOUTH_CENTER: 'city0', SOUTH_RIGHT: 'city0',
      WEST_LEFT: 'field1', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_P4: Portal, cloister with road E ──
  {
    id: 'df_P4',
    count: 1,
    expansionId: 'dragon-fairy',
    hasMagicPortal: true,
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_NW },
      { id: 'road0', type: 'ROAD', svgPath: 'M50,50 L100,46 L100,54 L50,50 Z', meepleCentroid: C_ROAD_E },
      { id: 'cloister0', type: 'CLOISTER', svgPath: CLOISTER_RECT, meepleCentroid: C_CENTER },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'road0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },
]

// ─── Normal Tiles (4) ───────────────────────────────────────────────────────
// Standard tiles without special symbols but included in the expansion

const NORMAL_TILES: TileDefinition[] = [
  // ── df_N1: City N+S (separate), field E+W ──
  {
    id: 'df_N1',
    count: 1,
    expansionId: 'dragon-fairy',
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'city1', type: 'CITY', svgPath: CITY_S, meepleCentroid: C_SOUTH },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L30,25 L30,75 L0,100 Z', meepleCentroid: C_WEST },
      { id: 'field1', type: 'FIELD', svgPath: 'M100,0 L70,25 L70,75 L100,100 Z', meepleCentroid: C_EAST },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field1', EAST_CENTER: 'field1', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'city1', SOUTH_CENTER: 'city1', SOUTH_RIGHT: 'city1',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_N2: Road 3-way intersection (N, E, S) ──
  {
    id: 'df_N2',
    count: 1,
    expansionId: 'dragon-fairy',
    segments: [
      { id: 'road0', type: 'ROAD', svgPath: 'M46,0 L54,0 L54,46 L46,46 Z', meepleCentroid: C_ROAD_N },
      { id: 'road1', type: 'ROAD', svgPath: 'M54,46 L100,46 L100,54 L54,54 Z', meepleCentroid: C_ROAD_E },
      { id: 'road2', type: 'ROAD', svgPath: 'M46,54 L54,54 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L46,0 L46,46 L100,46 L100,100 L54,100 L54,54 L0,54 Z', meepleCentroid: C_FIELD_NW },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,0 L100,0 L100,46 L54,46 Z', meepleCentroid: C_FIELD_NE },
      { id: 'field2', type: 'FIELD', svgPath: 'M46,54 L46,100 L0,100 L0,54 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'road0', NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1', EAST_CENTER: 'road1', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road2', SOUTH_RIGHT: 'field2',
      WEST_LEFT: 'field2', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_N3: City N+E (connected) ──
  {
    id: 'df_N3',
    count: 1,
    expansionId: 'dragon-fairy',
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_NE, meepleCentroid: C_FIELD_NE },
      { id: 'field0', type: 'FIELD', svgPath: FIELD_FULL, meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_N4: Road N-S, city E ──
  {
    id: 'df_N4',
    count: 1,
    expansionId: 'dragon-fairy',
    segments: [
      { id: 'city0', type: 'CITY', svgPath: CITY_E, meepleCentroid: C_EAST },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_NS, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L46,0 L46,100 L0,100 Z', meepleCentroid: C_WEST },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,0 L75,30 L75,70 L54,100 Z', meepleCentroid: { x: 62, y: 50 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'road0', NORTH_RIGHT: 'field1',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },
]

// ─── Double-Sized River Tiles (2) ────────────────────────────────────────────
// Each double-sized tile is represented as two linked tile halves.
// The river flows through both halves.

const RIVER_TILES: TileDefinition[] = [
  // ── df_RS_A: Source tile (left half) — river exits south and east ──
  {
    id: 'df_RS_A',
    count: 1,
    expansionId: 'dragon-fairy',
    startingTile: true,
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,46 L54,46 L54,100 L0,100 Z', meepleCentroid: C_FIELD_NW },
      { id: 'field1', type: 'FIELD', svgPath: 'M100,54 L100,100 L46,100 L46,54 Z', meepleCentroid: C_FIELD_SE },
      { id: 'road0', type: 'ROAD', svgPath: 'M46,46 L54,46 L100,46 L100,54 L54,54 L54,100 L46,100 L46,54 Z', meepleCentroid: C_CENTER },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'road0', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_RS_B: Source tile (right half) — river exits west ──
  {
    id: 'df_RS_B',
    count: 1,
    expansionId: 'dragon-fairy',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 L0,54 L50,54 L50,46 L0,46 Z', meepleCentroid: C_FIELD_SE },
      { id: 'road0', type: 'ROAD', svgPath: 'M0,46 L50,46 L50,54 L0,54 Z', meepleCentroid: C_ROAD_W },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_RL_A: Lake tile (left half) — river exits east, dragon lair ──
  {
    id: 'df_RL_A',
    count: 1,
    expansionId: 'dragon-fairy',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,46 L50,46 L50,100 L0,100 Z', meepleCentroid: C_FIELD_NW },
      { id: 'field1', type: 'FIELD', svgPath: 'M100,54 L100,100 L50,100 L50,54 Z', meepleCentroid: C_FIELD_SE },
      { id: 'road0', type: 'ROAD', svgPath: 'M50,46 L100,46 L100,54 L50,54 Z', meepleCentroid: C_ROAD_E },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'road0', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'field1', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── df_RL_B: Lake tile (right half) — river exits west, dragon lair ──
  {
    id: 'df_RL_B',
    count: 1,
    expansionId: 'dragon-fairy',
    isVolcano: true,  // Lake is the dragon's lair — dragon starts here
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 L0,54 L50,54 L50,46 L0,46 Z', meepleCentroid: C_CENTER },
      { id: 'road0', type: 'ROAD', svgPath: 'M0,46 L50,46 L50,54 L0,54 Z', meepleCentroid: C_ROAD_W },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },
]

// ─── Export all tiles ────────────────────────────────────────────────────────

export const DF_TILES: TileDefinition[] = [
  ...VOLCANO_TILES,
  ...DRAGON_HOARD_TILES,
  ...MAGIC_PORTAL_TILES,
  ...NORMAL_TILES,
  ...RIVER_TILES,
]
