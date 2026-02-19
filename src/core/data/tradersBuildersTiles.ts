/**
 * 24 tile definitions for the Traders & Builders expansion.
 *
 * Tile IDs: tb_A through tb_V (22 types, 24 total instances via count > 1).
 * Commodity distribution:
 *   - CLOTH:  6 tile instances
 *   - WHEAT:  9 tile instances
 *   - WINE:   9 tile instances
 *
 * Special segment flags:
 *   - commodity: 'CLOTH' | 'WHEAT' | 'WINE'  on CITY segments with trade goods
 *
 * SVG paths use the same 100×100 viewBox as baseTiles.ts and innsCathedralsTiles.ts.
 */

import type { TileDefinition } from '../types/tile.ts'

// ─── SVG path helpers ────────────────────────────────────────────────────────

// City caps
const CITY_N  = 'M0,0 L100,0 L70,25 L50,30 L30,25 Z'
const CITY_E  = 'M100,0 L100,100 L75,70 L70,50 L75,30 Z'
const CITY_S  = 'M0,100 L100,100 L70,75 L50,70 L30,75 Z'
const CITY_W  = 'M0,0 L0,100 L25,70 L30,50 L25,30 Z'

// Two-sided connected cities
const CITY_NE  = 'M0,0 L100,0 L100,100 L75,70 L60,60 L30,25 Z'
const CITY_NW  = 'M0,100 L0,0 L100,0 L70,25 L40,40 L30,75 Z'
// NES = N+E+S connected (open on W side)
const CITY_NES = 'M0,0 L100,0 L100,100 L0,100 L25,75 L30,50 L25,25 Z'

// Three-sided city (W+N+E connected, open south)
const CITY_WNE = 'M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z'

// Full-tile fills
const FIELD_FULL = 'M0,0 L100,0 L100,100 L0,100 Z'

// Road strips
const ROAD_NS = 'M46,0 L54,0 L54,100 L46,100 Z'
const ROAD_EW = 'M0,46 L100,46 L100,54 L0,54 Z'

// Road curves
const ROAD_CURVE_SW = 'M0,46 L54,46 L54,100 L46,100 L46,54 L0,54 Z'
const ROAD_CURVE_ES = 'M46,46 L100,46 L100,54 L54,54 L54,100 L46,100 Z'
const ROAD_CURVE_EN = 'M46,0 L54,0 L54,54 L100,54 L100,46 L46,46 Z'

// Road dead-end stub (center to south)
const ROAD_STUB_S = 'M46,50 L54,50 L54,100 L46,100 Z'

// Meeple centroids
const C_NORTH  = { x: 50, y: 15 }
const C_EAST   = { x: 85, y: 50 }
const C_SOUTH  = { x: 50, y: 85 }
const C_WEST   = { x: 15, y: 50 }
const C_CENTER = { x: 50, y: 50 }
const C_FIELD_NE = { x: 75, y: 25 }
const C_FIELD_SE = { x: 75, y: 75 }
const C_FIELD_SW = { x: 25, y: 75 }
const C_FIELD_NW = { x: 25, y: 25 }
const C_ROAD_E = { x: 75, y: 50 }
const C_ROAD_S = { x: 50, y: 75 }

// ─── Tile definitions ────────────────────────────────────────────────────────

export const TB_TILES: TileDefinition[] = [

  // ══════════════════════════════════════════════════════════
  // CLOTH tiles (6 instances total)
  // ══════════════════════════════════════════════════════════

  // ── tb_A: Full city (all 4 sides), CLOTH ──
  {
    id: 'tb_A', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'CLOTH', svgPath: FIELD_FULL, meepleCentroid: C_CENTER },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'city0', SOUTH_CENTER: 'city0', SOUTH_RIGHT: 'city0',
      WEST_LEFT:  'city0', WEST_CENTER:  'city0', WEST_RIGHT:  'city0',
    },
  },

  // ── tb_B: City NE connected + pennant, CLOTH ──
  {
    id: 'tb_B', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', hasPennant: true, commodity: 'CLOTH', svgPath: CITY_NE, meepleCentroid: C_FIELD_NE },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L30,25 L60,60 L75,70 L100,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_C: City NW connected + pennant, CLOTH ──
  {
    id: 'tb_C', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', hasPennant: true, commodity: 'CLOTH', svgPath: CITY_NW, meepleCentroid: C_FIELD_NW },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,100 L30,75 L40,40 L70,25 L100,0 L100,100 Z', meepleCentroid: C_FIELD_SE },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field0', EAST_CENTER:  'field0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'city0', WEST_CENTER:  'city0', WEST_RIGHT:  'city0',
    },
  },

  // ── tb_D: City NE connected (no pennant), CLOTH ──
  {
    id: 'tb_D', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'CLOTH', svgPath: CITY_NE, meepleCentroid: C_FIELD_NE },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L30,25 L60,60 L75,70 L100,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_E: City N cap + road E→W crossing, CLOTH ──
  {
    id: 'tb_E', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'CLOTH', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_EW, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,54 L100,54 L100,100 L0,100 Z', meepleCentroid: C_SOUTH },
      { id: 'field1', type: 'FIELD', svgPath: 'M30,25 L70,25 L100,0 L100,46 L0,46 L0,0 Z', meepleCentroid: C_FIELD_NW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field1', EAST_CENTER:  'road0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'field0', WEST_CENTER:  'road0', WEST_RIGHT:  'field1',
    },
  },

  // ── tb_F: City N cap (no road), CLOTH ──
  {
    id: 'tb_F', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'CLOTH', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,40 L50,50 L100,40 L100,100 L0,100 Z', meepleCentroid: C_SOUTH },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field0', EAST_CENTER:  'field0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ══════════════════════════════════════════════════════════
  // WHEAT tiles (9 instances total)
  // ══════════════════════════════════════════════════════════

  // ── tb_G: City WNE (3-sided) + pennant, WHEAT ──
  {
    id: 'tb_G', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', hasPennant: true, commodity: 'WHEAT', svgPath: CITY_WNE, meepleCentroid: C_NORTH },
      { id: 'field0', type: 'FIELD', svgPath: 'M30,75 L50,70 L70,75 L100,100 L0,100 Z', meepleCentroid: C_SOUTH },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'city0', WEST_CENTER:  'city0', WEST_RIGHT:  'city0',
    },
  },

  // ── tb_H: City WNE (3-sided, no pennant), WHEAT ──
  {
    id: 'tb_H', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WHEAT', svgPath: CITY_WNE, meepleCentroid: C_NORTH },
      { id: 'field0', type: 'FIELD', svgPath: 'M30,75 L50,70 L70,75 L100,100 L0,100 Z', meepleCentroid: C_SOUTH },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'city0', WEST_CENTER:  'city0', WEST_RIGHT:  'city0',
    },
  },

  // ── tb_I: City NES (3-sided), WHEAT ──
  {
    id: 'tb_I', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WHEAT', svgPath: CITY_NES, meepleCentroid: C_EAST },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L25,25 L30,50 L25,75 L0,100 Z', meepleCentroid: C_WEST },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'city0', SOUTH_CENTER: 'city0', SOUTH_RIGHT: 'city0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_J: City N + pennant + road curve SW, WHEAT ──
  {
    id: 'tb_J', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', hasPennant: true, commodity: 'WHEAT', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_CURVE_SW, meepleCentroid: C_ROAD_S },
      { id: 'field0', type: 'FIELD', svgPath: 'M54,46 L100,46 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE },
      { id: 'field1', type: 'FIELD', svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field0', EAST_CENTER:  'field0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT:  'field1', WEST_CENTER:  'road0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_K: City NW connected (no pennant), WHEAT ──
  {
    id: 'tb_K', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WHEAT', svgPath: CITY_NW, meepleCentroid: C_FIELD_NW },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,100 L30,75 L40,40 L70,25 L100,0 L100,100 Z', meepleCentroid: C_FIELD_SE },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field0', EAST_CENTER:  'field0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'city0', WEST_CENTER:  'city0', WEST_RIGHT:  'city0',
    },
  },

  // ── tb_L: City NE + pennant, WHEAT ──
  {
    id: 'tb_L', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', hasPennant: true, commodity: 'WHEAT', svgPath: CITY_NE, meepleCentroid: C_FIELD_NE },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L30,25 L60,60 L75,70 L100,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_M: City N cap (large field), WHEAT — count 2 ──
  {
    id: 'tb_M', count: 2,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WHEAT', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,40 L50,50 L100,40 L100,100 L0,100 Z', meepleCentroid: C_SOUTH },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field0', EAST_CENTER:  'field0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_N: City N cap + road dead-end S, WHEAT ──
  {
    id: 'tb_N', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WHEAT', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_STUB_S, meepleCentroid: C_ROAD_S },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,40 L100,40 L100,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field0', EAST_CENTER:  'field0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ══════════════════════════════════════════════════════════
  // WINE tiles (9 instances total)
  // ══════════════════════════════════════════════════════════

  // ── tb_O: City WNE (3-sided) + pennant + road stub S, WINE ──
  {
    id: 'tb_O', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', hasPennant: true, commodity: 'WINE', svgPath: CITY_WNE, meepleCentroid: C_NORTH },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_STUB_S, meepleCentroid: C_ROAD_S },
      { id: 'field0', type: 'FIELD', svgPath: 'M30,75 L46,70 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,70 L70,75 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'city0', WEST_CENTER:  'city0', WEST_RIGHT:  'city0',
    },
  },

  // ── tb_P: City NES (3-sided) + pennant, WINE ──
  {
    id: 'tb_P', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', hasPennant: true, commodity: 'WINE', svgPath: CITY_NES, meepleCentroid: C_EAST },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L25,25 L30,50 L25,75 L0,100 Z', meepleCentroid: C_WEST },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'city0', SOUTH_CENTER: 'city0', SOUTH_RIGHT: 'city0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_Q: City NE connected + road curve SW, WINE ──
  {
    id: 'tb_Q', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WINE', svgPath: CITY_NE, meepleCentroid: C_FIELD_NE },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_CURVE_SW, meepleCentroid: C_ROAD_S },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L30,25 L50,50 L54,46 L100,46 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE },
      { id: 'field1', type: 'FIELD', svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT:  'field1', WEST_CENTER:  'road0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_R: City NW connected + road curve ES, WINE ──
  {
    id: 'tb_R', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WINE', svgPath: CITY_NW, meepleCentroid: C_FIELD_NW },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_CURVE_ES, meepleCentroid: C_ROAD_E },
      { id: 'field0', type: 'FIELD', svgPath: 'M54,54 L100,54 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE },
      { id: 'field1', type: 'FIELD', svgPath: 'M0,100 L30,75 L40,40 L70,25 L100,0 L100,46 L46,46 L46,100 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field1', EAST_CENTER:  'road0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT:  'city0', WEST_CENTER:  'city0', WEST_RIGHT:  'city0',
    },
  },

  // ── tb_S: City N cap + road curve EN (dead-end NE corner), WINE ──
  {
    id: 'tb_S', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WINE', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_CURVE_EN, meepleCentroid: C_ROAD_E },
      { id: 'field0', type: 'FIELD', svgPath: 'M54,0 L70,25 L100,0 L100,46 L54,46 Z', meepleCentroid: C_FIELD_NE },
      { id: 'field1', type: 'FIELD', svgPath: 'M0,40 L54,54 L100,54 L100,100 L0,100 Z', meepleCentroid: C_FIELD_SW },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field0', EAST_CENTER:  'road0', EAST_RIGHT:  'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'field1', SOUTH_RIGHT: 'field1',
      WEST_LEFT:  'field1', WEST_CENTER:  'field1', WEST_RIGHT:  'field1',
    },
  },

  // ── tb_T: City E (straight cap) + field, WINE ──
  {
    id: 'tb_T', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WINE', svgPath: CITY_E, meepleCentroid: C_EAST },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L75,30 L70,50 L75,70 L0,100 Z', meepleCentroid: C_WEST },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT:  'city0', EAST_CENTER:  'city0', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_U: City S cap + road straight N→S, WINE ──
  {
    id: 'tb_U', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WINE', svgPath: CITY_S, meepleCentroid: C_SOUTH },
      { id: 'road0', type: 'ROAD', svgPath: ROAD_NS, meepleCentroid: C_CENTER },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L46,0 L46,60 L30,75 L0,100 Z', meepleCentroid: C_FIELD_NW },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,0 L100,0 L100,100 L70,75 L54,60 Z', meepleCentroid: C_FIELD_NE },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'road0', NORTH_RIGHT: 'field1',
      EAST_LEFT:  'field1', EAST_CENTER:  'field1', EAST_RIGHT:  'city0',
      SOUTH_LEFT: 'city0', SOUTH_CENTER: 'city0', SOUTH_RIGHT: 'city0',
      WEST_LEFT:  'city0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

  // ── tb_V: City W (straight cap, no road), WINE ──
  {
    id: 'tb_V', count: 1,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WINE', svgPath: CITY_W, meepleCentroid: C_WEST },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L25,30 L30,50 L25,70 L0,100 L100,100 L100,0 Z', meepleCentroid: C_EAST },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT:  'field0', EAST_CENTER:  'field0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'city0', WEST_CENTER:  'city0', WEST_RIGHT:  'city0',
    },
  },

  // ── tb_W: City N cap (no road), WINE — count 2 ──
  {
    id: 'tb_W', count: 2,
    expansionId: 'traders-builders',
    segments: [
      { id: 'city0', type: 'CITY', commodity: 'WINE', svgPath: CITY_N, meepleCentroid: C_NORTH },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,40 L50,50 L100,40 L100,100 L0,100 Z', meepleCentroid: C_SOUTH },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT:  'field0', EAST_CENTER:  'field0', EAST_RIGHT:  'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT:  'field0', WEST_CENTER:  'field0', WEST_RIGHT:  'field0',
    },
  },

]

export const TB_TILE_COUNT = TB_TILES.reduce((sum, t) => sum + t.count, 0)
