/**
 * 18 tile definitions for the Inns & Cathedrals expansion.
 *
 * Tile IDs: ic_A through ic_R (18 tiles, 18 total instances).
 * Special segment flags:
 *   - hasInn: true   on ROAD segments near a lake
 *   - hasCathedral: true  on CITY segments with a cathedral
 *
 * SVG paths use the same 100×100 viewBox as baseTiles.ts.
 * Edge position layout follows the same conventions.
 */

import type { TileDefinition } from '../types/tile.ts'

// ─── SVG path helpers (reused from baseTiles pattern) ────────────────────────

// City caps
const CITY_N = 'M0,0 L100,0 L70,25 L50,30 L30,25 Z'
const CITY_E = 'M100,0 L100,100 L75,70 L70,50 L75,30 Z'
const CITY_W = 'M0,0 L0,100 L25,70 L30,50 L25,30 Z'
const CITY_NE = 'M0,0 L100,0 L100,100 L75,70 L60,60 L30,25 Z'
const CITY_NW = 'M0,100 L0,0 L100,0 L70,25 L40,40 L30,75 Z'
const CITY_WNE = 'M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z'

// Full-tile fills
const FIELD_FULL = 'M0,0 L100,0 L100,100 L0,100 Z'

// Road strips
const ROAD_NS = 'M46,0 L54,0 L54,100 L46,100 Z'
const ROAD_EW = 'M0,46 L100,46 L100,54 L0,54 Z'

// Road curves
const ROAD_CURVE_SW = 'M0,46 L54,46 L54,100 L46,100 L46,54 L0,54 Z'
const ROAD_CURVE_ES = 'M46,46 L100,46 L100,54 L54,54 L54,100 L46,100 Z'

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
const C_ROAD_E = { x: 75, y: 50 }
const C_ROAD_S = { x: 50, y: 75 }
const C_ROAD_W = { x: 25, y: 50 }

// ─── Tile definitions ────────────────────────────────────────────────────────

export const IC_TILES: TileDefinition[] = [

  // ── ic_A: Full city (all 4 edges) with cathedral ──
  {
    id: 'ic_A',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'CITY', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasCathedral: true,
        svgPath: FIELD_FULL, meepleCentroid: C_CENTER,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'city0', SOUTH_CENTER: 'city0', SOUTH_RIGHT: 'city0',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── ic_B: 3-sided city (N+E+W connected) with cathedral ──
  {
    id: 'ic_B',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'FIELD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasCathedral: true,
        svgPath: CITY_WNE, meepleCentroid: C_NORTH,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M0,60 L50,50 L100,60 L100,100 L0,100 Z', meepleCentroid: C_SOUTH,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── ic_C: City N+E connected (no pennant) + road S→W ──
  {
    id: 'ic_C',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_NE, meepleCentroid: { x: 70, y: 25 },
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_CURVE_SW, meepleCentroid: C_ROAD_S,
      },
      {
        id: 'field0', type: 'FIELD',  // outside curve (between city and road)
        svgPath: 'M0,0 L30,25 L50,50 L54,46 L100,46 L100,100 L54,100 Z',
        meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field1', type: 'FIELD',  // inside curve (SW corner)
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },

  // ── ic_D: City N+E connected (with pennant) + road S→W ──
  {
    id: 'ic_D',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasPennant: true,
        svgPath: CITY_NE, meepleCentroid: { x: 70, y: 25 },
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_CURVE_SW, meepleCentroid: C_ROAD_S,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M0,0 L30,25 L50,50 L54,46 L100,46 L100,100 L54,100 Z',
        meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field1', type: 'FIELD',
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },

  // ── ic_E: City N + road S→W with inn ──
  {
    id: 'ic_E',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'FIELD', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_N, meepleCentroid: C_NORTH,
      },
      {
        id: 'road0', type: 'ROAD', hasInn: true,
        svgPath: ROAD_CURVE_SW, meepleCentroid: C_ROAD_S,
      },
      {
        id: 'field0', type: 'FIELD',  // east of road
        svgPath: 'M54,46 L100,46 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field1', type: 'FIELD',  // inside curve (SW corner)
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },

  // ── ic_F: City N + road E→W with inn ──
  {
    id: 'ic_F',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'ROAD', SOUTH: 'FIELD', WEST: 'ROAD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_N, meepleCentroid: C_NORTH,
      },
      {
        id: 'road0', type: 'ROAD', hasInn: true,
        svgPath: ROAD_EW, meepleCentroid: C_CENTER,
      },
      {
        id: 'field0', type: 'FIELD',  // below road
        svgPath: 'M0,54 L100,54 L100,100 L0,100 Z', meepleCentroid: C_SOUTH,
      },
      {
        id: 'field1', type: 'FIELD',  // between city and road
        svgPath: 'M0,40 L46,40 L46,46 L0,46 Z', meepleCentroid: C_FIELD_NW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field1', EAST_CENTER: 'road0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'road0', WEST_RIGHT: 'field1',
    },
  },

  // ── ic_G: City N + road dead-end S ──
  {
    id: 'ic_G',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'FIELD', SOUTH: 'ROAD', WEST: 'FIELD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_N, meepleCentroid: C_NORTH,
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: 'M46,50 L54,50 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M0,40 L100,40 L100,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── ic_H: City N with pennant (large city cap) ──
  {
    id: 'ic_H',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'FIELD', SOUTH: 'FIELD', WEST: 'FIELD' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasPennant: true,
        svgPath: CITY_N, meepleCentroid: C_NORTH,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M0,40 L50,50 L100,40 L100,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── ic_I: Straight road N→S with inn ──
  {
    id: 'ic_I',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'ROAD', EAST: 'FIELD', SOUTH: 'ROAD', WEST: 'FIELD' },
    segments: [
      {
        id: 'road0', type: 'ROAD', hasInn: true,
        svgPath: ROAD_NS, meepleCentroid: C_CENTER,
      },
      {
        id: 'field0', type: 'FIELD',  // east side
        svgPath: 'M54,0 L100,0 L100,100 L54,100 Z', meepleCentroid: C_EAST,
      },
      {
        id: 'field1', type: 'FIELD',  // west side
        svgPath: 'M0,0 L46,0 L46,100 L0,100 Z', meepleCentroid: C_WEST,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field1', NORTH_CENTER: 'road0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'field1', WEST_RIGHT: 'field1',
    },
  },

  // ── ic_J: Road curve S→W with inn ──
  {
    id: 'ic_J',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'FIELD', EAST: 'FIELD', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'road0', type: 'ROAD', hasInn: true,
        svgPath: ROAD_CURVE_SW, meepleCentroid: C_WEST,
      },
      {
        id: 'field0', type: 'FIELD',  // outside curve (NE)
        svgPath: 'M0,0 L100,0 L100,100 L54,100 L46,54 L0,54 Z', meepleCentroid: C_FIELD_NE,
      },
      {
        id: 'field1', type: 'FIELD',  // inside curve (SW corner)
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },

  // ── ic_K: City N+E connected (with pennant), field S+W ──
  {
    id: 'ic_K',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'FIELD', WEST: 'FIELD' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasPennant: true,
        svgPath: CITY_NE, meepleCentroid: { x: 70, y: 25 },
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M0,0 L30,25 L50,50 L0,60 Z', meepleCentroid: C_FIELD_NW,
      },
      {
        id: 'field1', type: 'FIELD',
        svgPath: 'M0,60 L50,50 L75,70 L100,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'field1', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── ic_L: City N+E+W connected (with pennant) ──
  {
    id: 'ic_L',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'FIELD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasPennant: true,
        svgPath: CITY_WNE, meepleCentroid: C_NORTH,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M0,60 L50,50 L100,60 L100,100 L0,100 Z', meepleCentroid: C_SOUTH,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── ic_M: City N+W connected (no pennant) ──
  {
    id: 'ic_M',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'FIELD', SOUTH: 'FIELD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_NW, meepleCentroid: { x: 25, y: 25 },
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M50,50 L100,40 L100,100 L0,100 L0,60 Z', meepleCentroid: C_FIELD_SE,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── ic_N: City E + City W (separate, not connected) ──
  {
    id: 'ic_N',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'FIELD', EAST: 'CITY', SOUTH: 'FIELD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_E, meepleCentroid: C_EAST,
      },
      {
        id: 'city1', type: 'CITY',
        svgPath: CITY_W, meepleCentroid: C_WEST,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M40,50 L60,50 L60,40 L100,40 L100,60 L60,60 L60,50 L40,50 L40,60 L0,60 L0,40 L40,40 Z',
        meepleCentroid: C_CENTER,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'city1', WEST_CENTER: 'city1', WEST_RIGHT: 'city1',
    },
  },

  // ── ic_O: 4-way road crossroads with inn ──
  {
    id: 'ic_O',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'ROAD', EAST: 'ROAD', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'road_n', type: 'ROAD', hasInn: true,
        svgPath: 'M46,0 L54,0 L54,46 L46,46 Z', meepleCentroid: C_ROAD_N,
      },
      {
        id: 'road_e', type: 'ROAD', hasInn: true,
        svgPath: 'M54,46 L100,46 L100,54 L54,54 Z', meepleCentroid: C_ROAD_E,
      },
      {
        id: 'road_s', type: 'ROAD', hasInn: true,
        svgPath: 'M46,54 L54,54 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S,
      },
      {
        id: 'road_w', type: 'ROAD', hasInn: true,
        svgPath: 'M0,46 L46,46 L46,54 L0,54 Z', meepleCentroid: C_ROAD_W,
      },
      {
        id: 'field0', type: 'FIELD',  // NE quadrant
        svgPath: 'M54,0 L100,0 L100,46 L54,46 Z', meepleCentroid: C_FIELD_NE,
      },
      {
        id: 'field1', type: 'FIELD',  // SE quadrant
        svgPath: 'M54,54 L100,54 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field2', type: 'FIELD',  // SW quadrant
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
      {
        id: 'field3', type: 'FIELD',  // NW quadrant
        svgPath: 'M0,0 L46,0 L46,46 L0,46 Z', meepleCentroid: C_FIELD_NW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field3', NORTH_CENTER: 'road_n', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'road_e', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road_s', SOUTH_RIGHT: 'field2',
      WEST_LEFT: 'field2', WEST_CENTER: 'road_w', WEST_RIGHT: 'field3',
    },
  },

  // ── ic_P: City N + road E→S ──
  {
    id: 'ic_P',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'ROAD', SOUTH: 'ROAD', WEST: 'FIELD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_N, meepleCentroid: C_NORTH,
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_CURVE_ES, meepleCentroid: C_ROAD_E,
      },
      {
        id: 'field0', type: 'FIELD',  // west + inside (between city/road and west)
        svgPath: 'M0,40 L46,46 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
      {
        id: 'field1', type: 'FIELD',  // SE corner (outside curve)
        svgPath: 'M54,54 L100,54 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0', EAST_CENTER: 'road0', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── ic_Q: City N+E+W connected + road S ──
  {
    id: 'ic_Q',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'ROAD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_WNE, meepleCentroid: C_NORTH,
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: 'M46,70 L54,70 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M0,60 L46,60 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
      {
        id: 'field1', type: 'FIELD',
        svgPath: 'M54,60 L100,60 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── ic_R: Cloister with road N→S ──
  {
    id: 'ic_R',
    count: 1,
    expansionId: 'inns-cathedrals',
    edges: { NORTH: 'ROAD', EAST: 'FIELD', SOUTH: 'ROAD', WEST: 'FIELD' },
    segments: [
      {
        id: 'field0', type: 'FIELD',
        svgPath: FIELD_FULL, meepleCentroid: C_FIELD_NE,
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_NS, meepleCentroid: C_ROAD_N,
      },
      {
        id: 'cloister0', type: 'CLOISTER',
        svgPath: CLOISTER_RECT, meepleCentroid: C_CENTER,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'road0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },
]

// Total tile count for verification
export const IC_TILE_COUNT = IC_TILES.reduce((sum, t) => sum + t.count, 0)
