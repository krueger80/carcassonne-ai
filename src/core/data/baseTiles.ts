/**
 * All 71 base-game Carcassonne tile definitions.
 *
 * Tile IDs use the canonical letter labeling from the Carcassonne rulebook.
 * Each tile has:
 *   - edges: quick lookup for placement validation (4 edges × EdgeType)
 *   - segments: all terrain regions with their connectivity data
 *   - edgePositionToSegment: maps each of 12 sub-positions to a segment id
 *
 * SVG paths use a 100×100 viewBox.
 * Segment shapes:
 *   - FIELD covers the background (drawn first, fills remainder)
 *   - CITY is a trapezoid/polygon from one or more edges toward center
 *   - ROAD is a thin strip through the center
 *   - CLOISTER is a centered rectangle
 *
 * Rotation note: definitions are for the tile in its 0° orientation.
 * The engine applies rotation at read time; tile data is never rotated.
 *
 * ─── Edge position layout ────────────────────────────────────────────────────
 *
 * Each of the 4 edges is divided into 3 positions (LEFT / CENTER / RIGHT).
 * Positions are named from the perspective of an observer standing OUTSIDE the
 * tile and looking inward — equivalently, they follow the clockwise perimeter.
 *
 *              NL      NC      NR
 *           ┌───────┬───────┬───────┐
 *        WR │                       │ EL
 *           │                       │
 *        WC │       (center)        │ EC
 *           │                       │
 *        WL │                       │ ER
 *           └───────┴───────┴───────┘
 *              SR      SC      SL
 *
 *  Corner mappings (each physical corner is shared by two edges):
 *    NW corner = NORTH_LEFT  = WEST_RIGHT
 *    NE corner = NORTH_RIGHT = EAST_LEFT
 *    SE corner = EAST_RIGHT  = SOUTH_LEFT
 *    SW corner = SOUTH_RIGHT = WEST_LEFT
 *
 *  A road that exits an edge uses only the CENTER position of that edge.
 *  The two FIELD segments on either side of the road each claim one of the
 *  LEFT / RIGHT positions (plus any corner positions that wrap around).
 */

import type { TileDefinition } from '../types/tile.ts'

// ─── SVG path helpers ────────────────────────────────────────────────────────

// City cap from one edge (NORTH = top)
// The city occupies the top portion, field fills the rest
const CITY_N = 'M0,0 L100,0 L70,25 L50,30 L30,25 Z'
const CITY_E = 'M100,0 L100,100 L75,70 L70,50 L75,30 Z'
const CITY_S = 'M0,100 L100,100 L70,75 L50,70 L30,75 Z'
const CITY_NW = 'M0,100 L0,0 L100,0 L70,25 L40,40 L30,75 Z'
const CITY_WNE = 'M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z'
const CITY_WE = 'M0,100 L0,0 L30,25 L50,30 L70,25 L100,0 L100,100 L70,75 L50,70 L30,75 Z'

// Full field (background rectangle — rendered underneath everything)
const FIELD_FULL = 'M0,0 L100,0 L100,100 L0,100 Z'

// Road strip (horizontal or vertical, 8px wide through center)
const ROAD_NS = 'M46,0 L54,0 L54,100 L46,100 Z'
const ROAD_EW = 'M0,46 L100,46 L100,54 L0,54 Z'

// Road curve: south→west (used by tile V and similar)
const ROAD_CURVE_SW_PATH = 'M0,46 L54,46 L54,100 L46,100 L46,54 L0,54 Z'
const ROAD_CURVE_ES_PATH = 'M46,46 L100,46 L100,54 L54,54 L54,100 L46,100 Z'


// Cloister building
const CLOISTER_RECT = 'M30,30 L70,30 L70,70 L30,70 Z'

// Meeple centroids for standard segments
const C_NORTH = { x: 50, y: 20 }  // city north
const C_EAST = { x: 80, y: 50 }  // city east
const C_SOUTH = { x: 50, y: 80 }  // city south
const C_WEST = { x: 20, y: 50 }  // city west
const C_CENTER = { x: 50, y: 50 }  // cloister / road intersection
const C_FIELD_NE = { x: 75, y: 25 }
const C_FIELD_SE = { x: 75, y: 75 }
const C_FIELD_SW = { x: 25, y: 75 }
const C_FIELD_NW = { x: 25, y: 25 }
const C_ROAD_N = { x: 50, y: 25 }
const C_ROAD_E = { x: 75, y: 50 }
const C_ROAD_S = { x: 50, y: 75 }
const C_ROAD_W = { x: 25, y: 50 }

// ─── Tile definitions ─────────────────────────────────────────────────────────

export const BASE_TILES: TileDefinition[] = [
  // ── Tile A: Cloister with road to south ──
  {
    id: 'base_A',
    count: 2,
    edges: { NORTH: 'FIELD', EAST: 'FIELD', SOUTH: 'ROAD', WEST: 'FIELD' },
    segments: [
      {
        id: 'field0', type: 'FIELD',
        svgPath: FIELD_FULL, meepleCentroid: C_FIELD_NE,
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: 'M46,50 L54,50 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S,
      },
      {
        id: 'cloister0', type: 'CLOISTER',
        svgPath: CLOISTER_RECT, meepleCentroid: C_CENTER,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },


  // ── Tile B: Cloister, surrounded by fields ──
  {
    id: 'base_B',
    count: 4,
    edges: { NORTH: 'FIELD', EAST: 'FIELD', SOUTH: 'FIELD', WEST: 'FIELD' },
    segments: [
      {
        id: 'field0', type: 'FIELD',
        svgPath: FIELD_FULL, meepleCentroid: C_FIELD_NE,
      },
      {
        id: 'cloister0', type: 'CLOISTER',
        svgPath: CLOISTER_RECT, meepleCentroid: C_CENTER,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'field0', SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },


  // ── Tile C: City (all four sides, with pennant) ──
  {
    id: 'base_C',
    count: 1,
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'CITY', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasPennant: true,
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

  // ── Tile D: City top + road EW through middle ──
  // Road goes WEST→EAST through center, city on NORTH
  // count=4: one copy is placed as the starting tile before shuffling
  {
    id: 'base_D',
    count: 4,
    edges: { NORTH: 'CITY', EAST: 'ROAD', SOUTH: 'FIELD', WEST: 'ROAD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_N, meepleCentroid: C_NORTH,
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_EW, meepleCentroid: C_CENTER,
      },
      {
        id: 'field0', type: 'FIELD',  // below road
        svgPath: 'M0,54 L100,54 L100,100 L0,100 Z', meepleCentroid: C_SOUTH
      },
      {
        id: 'field1', type: 'FIELD',  // between city and road, left
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

  // ── Tile E: City top only ──
  {
    id: 'base_E',
    count: 5,
    edges: { NORTH: 'CITY', EAST: 'FIELD', SOUTH: 'FIELD', WEST: 'FIELD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
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

  // ── Tile F: City east + west connected (with pennant), no road ──
  {
    id: 'base_F',
    count: 2,
    edges: { NORTH: 'FIELD', EAST: 'CITY', SOUTH: 'FIELD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasPennant: true,
        svgPath: CITY_WE, meepleCentroid: C_CENTER,
      },
      {
        id: 'field0', type: 'FIELD',  // north
        svgPath: 'M40,0 L60,0 L50,50 Z', meepleCentroid: { x: 50, y: 25 },
      },
      {
        id: 'field1', type: 'FIELD',  // south
        svgPath: 'M40,100 L60,100 L50,50 Z', meepleCentroid: { x: 50, y: 75 },
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'field1', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── Tile G: City east + west connected (no pennant) ──
  {
    id: 'base_G',
    count: 1,
    edges: { NORTH: 'FIELD', EAST: 'CITY', SOUTH: 'FIELD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_WE, meepleCentroid: C_CENTER,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M40,0 L60,0 L50,50 Z', meepleCentroid: { x: 50, y: 25 },
      },
      {
        id: 'field1', type: 'FIELD',
        svgPath: 'M40,100 L60,100 L50,50 Z', meepleCentroid: { x: 50, y: 75 },
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'field1', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── Tile H: City north + south (separate, not connected) ──
  {
    id: 'base_H',
    count: 3,
    edges: { NORTH: 'CITY', EAST: 'FIELD', SOUTH: 'CITY', WEST: 'FIELD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_N, meepleCentroid: C_NORTH,
      },
      {
        id: 'city1', type: 'CITY',
        svgPath: CITY_S, meepleCentroid: C_SOUTH,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M40,50 L60,50 L60,60 L100,60 L100,40 L60,40 L60,50 L40,50 L40,40 L0,40 L0,60 L40,60 Z',
        meepleCentroid: C_CENTER,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0', EAST_CENTER: 'field0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'city1', SOUTH_CENTER: 'city1', SOUTH_RIGHT: 'city1',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── Tile I: City east + south (separate) ──
  {
    id: 'base_I',
    count: 2,
    edges: { NORTH: 'FIELD', EAST: 'CITY', SOUTH: 'CITY', WEST: 'FIELD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_E, meepleCentroid: C_EAST,
      },
      {
        id: 'city1', type: 'CITY',
        svgPath: CITY_S, meepleCentroid: C_SOUTH,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M0,0 L60,0 L50,50 L0,60 Z', meepleCentroid: C_FIELD_NW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'city1', SOUTH_CENTER: 'city1', SOUTH_RIGHT: 'city1',
      WEST_LEFT: 'field0', WEST_CENTER: 'field0', WEST_RIGHT: 'field0',
    },
  },

  // ── Tile J: City east, road south→west ──
  {
    id: 'base_J',
    count: 3,
    edges: { NORTH: 'FIELD', EAST: 'CITY', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_E, meepleCentroid: C_EAST,
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_CURVE_SW_PATH, meepleCentroid: C_SOUTH,
      },
      {
        id: 'field0', type: 'FIELD',  // north of road + above city
        svgPath: 'M0,0 L60,0 L50,50 L0,54 Z', meepleCentroid: C_FIELD_NW,
      },
      {
        id: 'field1', type: 'FIELD',  // south of road
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'city0', EAST_CENTER: 'city0', EAST_RIGHT: 'city0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'road0', WEST_RIGHT: 'field0',
    },
  },

  // ── Tile K: City north, road south→west ──
  {
    id: 'base_K',
    count: 3,
    edges: { NORTH: 'CITY', EAST: 'FIELD', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_N, meepleCentroid: C_NORTH,
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_CURVE_SW_PATH, meepleCentroid: C_SOUTH,
      },
      {
        id: 'field0', type: 'FIELD',  // east of road
        svgPath: 'M54,46 L100,46 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field1', type: 'FIELD',  // west of road (below city, left)
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

  // ── Tile L: City north, T-junction road (E+S+W) ──
  {
    id: 'base_L',
    count: 3,
    edges: { NORTH: 'CITY', EAST: 'ROAD', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_N, meepleCentroid: C_NORTH,
      },
      {
        id: 'road_e', type: 'ROAD',
        svgPath: 'M54,46 L100,46 L100,54 L54,54 Z', meepleCentroid: C_ROAD_E,
      },
      {
        id: 'road_s', type: 'ROAD',
        svgPath: 'M46,54 L54,54 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S,
      },
      {
        id: 'road_w', type: 'ROAD',
        svgPath: 'M0,46 L46,46 L46,54 L0,54 Z', meepleCentroid: C_ROAD_W,
      },
      {
        id: 'field0', type: 'FIELD',  // between east road and south road
        svgPath: 'M54,54 L100,54 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field1', type: 'FIELD',  // between south road and west road
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
      {
        id: 'field2', type: 'FIELD',  // between west road and east road (above)
        svgPath: 'M46,40 L54,40 L54,46 L100,46 L100,40 Q75,35 54,46 L46,46 L0,40 Q25,35 46,40 Z',
        meepleCentroid: { x: 50, y: 43 },
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field2', EAST_CENTER: 'road_e', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road_s', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1', WEST_CENTER: 'road_w', WEST_RIGHT: 'field2',
    },
  },

  // ── Tile M: City north+west connected (with pennant) ──
  {
    id: 'base_M',
    count: 2,
    edges: { NORTH: 'CITY', EAST: 'FIELD', SOUTH: 'FIELD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasPennant: true,
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

  // ── Tile N: City north+west connected (no pennant) ──
  {
    id: 'base_N',
    count: 3,
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

  // ── Tile O: City north+west connected (pennant) + road S ──
  {
    id: 'base_O',
    count: 2,
    edges: { NORTH: 'CITY', EAST: 'ROAD', SOUTH: 'ROAD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasPennant: true,
        svgPath: CITY_NW, meepleCentroid: { x: 25, y: 25 },
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_CURVE_ES_PATH, meepleCentroid: C_ROAD_S,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M54,50 L100,40 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field1', type: 'FIELD',
        svgPath: 'M0,60 L46,50 L46,100 L0,100 Z', meepleCentroid: C_CENTER
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field1', EAST_CENTER: 'road0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── Tile P: City north+west connected (no pennant) + road S ──
  {
    id: 'base_P',
    count: 3,
    edges: { NORTH: 'CITY', EAST: 'ROAD', SOUTH: 'ROAD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY',
        svgPath: CITY_NW, meepleCentroid: { x: 25, y: 25 },
      },
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_CURVE_ES_PATH, meepleCentroid: C_ROAD_S,
      },
      {
        id: 'field0', type: 'FIELD',
        svgPath: 'M54,50 L100,40 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field1', type: 'FIELD',
        svgPath: 'M0,60 L46,50 L46,100 L0,100 Z', meepleCentroid: C_CENTER,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0', NORTH_CENTER: 'city0', NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field1', EAST_CENTER: 'road0', EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── Tile Q: City N+E+W connected (with pennant) ──
  {
    id: 'base_Q',
    count: 1,
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

  // ── Tile R: City N+E+W connected (no pennant) ──
  {
    id: 'base_R',
    count: 3,
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'FIELD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY',
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

  // ── Tile S: City N+E+W (pennant) + road south ──
  {
    id: 'base_S',
    count: 2,
    edges: { NORTH: 'CITY', EAST: 'CITY', SOUTH: 'ROAD', WEST: 'CITY' },
    segments: [
      {
        id: 'city0', type: 'CITY', hasPennant: true,
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
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road0', SOUTH_RIGHT: 'field2',
      WEST_LEFT: 'city0', WEST_CENTER: 'city0', WEST_RIGHT: 'city0',
    },
  },

  // ── Tile T: City N+E+W (no pennant) + road south ──
  {
    id: 'base_T',
    count: 1,
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

  // ── Tile U: Road north-south (straight) ──
  {
    id: 'base_U',
    count: 8,
    edges: { NORTH: 'ROAD', EAST: 'FIELD', SOUTH: 'ROAD', WEST: 'FIELD' },
    segments: [
      {
        id: 'road0', type: 'ROAD',
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

  // ── Tile V: Road curve south→west ──
  {
    id: 'base_V',
    count: 9,
    edges: { NORTH: 'FIELD', EAST: 'FIELD', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'road0', type: 'ROAD',
        svgPath: ROAD_CURVE_SW_PATH, meepleCentroid: C_WEST,
      },
      {
        id: 'field0', type: 'FIELD',  // north+east (outside of curve)
        svgPath: 'M0,0 L100,0 L100,100 L54,100 L46,54 L0,54 Z', meepleCentroid: C_FIELD_NE,
      },
      {
        id: 'field1', type: 'FIELD',  // inside of curve (SW corner)
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

  // ── Tile W: T-junction (3 roads: E, S, W) no city ──
  {
    id: 'base_W',
    count: 4,
    edges: { NORTH: 'FIELD', EAST: 'ROAD', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'road_e', type: 'ROAD',
        svgPath: 'M54,46 L100,46 L100,54 L54,54 Z', meepleCentroid: C_ROAD_E,
      },
      {
        id: 'road_s', type: 'ROAD',
        svgPath: 'M46,54 L54,54 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S,
      },
      {
        id: 'road_w', type: 'ROAD',
        svgPath: 'M0,46 L46,46 L46,54 L0,54 Z', meepleCentroid: C_ROAD_W,
      },
      {
        id: 'field0', type: 'FIELD',  // north + east-left + west-right
        svgPath: 'M0,0 L100,0 L100,46 L54,46 L54,46 L50,50 L46,46 L0,46 Z', meepleCentroid: C_FIELD_NE,
      },
      {
        id: 'field1', type: 'FIELD',  // between east road and south road
        svgPath: 'M54,54 L100,54 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field2', type: 'FIELD',  // between south road and west road
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0', EAST_CENTER: 'road_e', EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'road_s', SOUTH_RIGHT: 'field2',
      WEST_LEFT: 'field2', WEST_CENTER: 'road_w', WEST_RIGHT: 'field0',
    },
  },

  // ── Tile X: 4-way road junction ──
  {
    id: 'base_X',
    count: 1,
    edges: { NORTH: 'ROAD', EAST: 'ROAD', SOUTH: 'ROAD', WEST: 'ROAD' },
    segments: [
      {
        id: 'road_n', type: 'ROAD',
        svgPath: 'M46,0 L54,0 L54,46 L46,46 Z', meepleCentroid: C_ROAD_N,
      },
      {
        id: 'road_e', type: 'ROAD',
        svgPath: 'M54,46 L100,46 L100,54 L54,54 Z', meepleCentroid: C_ROAD_E,
      },
      {
        id: 'road_s', type: 'ROAD',
        svgPath: 'M46,54 L54,54 L54,100 L46,100 Z', meepleCentroid: C_ROAD_S,
      },
      {
        id: 'road_w', type: 'ROAD',
        svgPath: 'M0,46 L46,46 L46,54 L0,54 Z', meepleCentroid: C_ROAD_W,
      },
      {
        id: 'field0', type: 'FIELD', // NE quadrant
        svgPath: 'M54,0 L100,0 L100,46 L54,46 Z', meepleCentroid: C_FIELD_NE,
      },
      {
        id: 'field1', type: 'FIELD', // SE quadrant
        svgPath: 'M54,54 L100,54 L100,100 L54,100 Z', meepleCentroid: C_FIELD_SE,
      },
      {
        id: 'field2', type: 'FIELD', // SW quadrant
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z', meepleCentroid: C_FIELD_SW,
      },
      {
        id: 'field3', type: 'FIELD', // NW quadrant
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

  // ── Starting tile (special): city south, road N→W+E ──
  // This is the canonical starting tile placed at (0,0) at game start
  // In the base game it's the tile with city on south and road going N-S
  // Using tile D rotated 180° logic, but defined as a distinct starting tile
  // Actual starting tile: CITY on SOUTH, FIELD N,E,W — tile E rotated 180°
  // The canonical starting tile in Carcassonne is a city/road tile.
  // We use tile D (city N + road EW) as the starting tile.

]

// ─── Lookup map ──────────────────────────────────────────────────────────────

export const TILE_MAP: Record<string, TileDefinition> = Object.fromEntries(
  BASE_TILES.map(t => [t.id, t])
)

  // Mark the starting tile
  ; (TILE_MAP['base_D'] as TileDefinition & { startingTile?: boolean }).startingTile = true

// Total tile count for verification
export const BASE_TILE_COUNT = BASE_TILES.reduce((sum, t) => sum + t.count, 0)

