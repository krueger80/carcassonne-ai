import type { TileDefinition } from '../types/tile.ts'

/**
 * River I — C3 (3rd) edition.  12 tiles, each ×1.
 *
 * Tile A = river source (starting tile for the river).
 * Tile I = pond / Tile L = lake+church (ending tiles).
 *
 * River segments use centerline stroke paths (rendered like roads but wider/blue).
 * SVG paths are approximate — refine with the #debug tile editor.
 */
export const RIVER_C3_TILES: TileDefinition[] = [
  // ─── A: Source / Spring ──────────────────────────────────────────────────
  // River springs from center, exits south. All field.
  {
    id: 'river_c3_A',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_A.png',
    startingTile: true,
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 25, y: 25 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M50,30 Q45,60 50,100', meepleCentroid: { x: 50, y: 65 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0', NORTH_CENTER: 'field0', NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0',  EAST_CENTER: 'field0',  EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0', SOUTH_CENTER: 'river0',  SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0',  WEST_CENTER: 'field0',  WEST_RIGHT: 'field0',
    },
    adjacencies: [['river0', 'field0']],
  },

  // ─── B: City N + Road E bridge + River W→S ──────────────────────────────
  {
    id: 'river_c3_B',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_B.png',
    segments: [
      { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,30 Q50,40 0,30 Z', meepleCentroid: { x: 50, y: 15 } },
      { id: 'road0', type: 'ROAD', svgPath: 'M100,50 L60,50', meepleCentroid: { x: 80, y: 50 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M0,50 Q40,50 50,100', meepleCentroid: { x: 30, y: 70 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,30 L100,30 L100,46 L0,46 Z', meepleCentroid: { x: 75, y: 38 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M100,54 L100,100 L54,100 Z', meepleCentroid: { x: 85, y: 75 } },
      { id: 'field2', type: 'FIELD', svgPath: 'M0,54 L46,100 L0,100 Z', meepleCentroid: { x: 20, y: 80 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0',  NORTH_CENTER: 'city0',  NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0',  EAST_CENTER: 'road0',   EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'river0',  SOUTH_RIGHT: 'field2',
      WEST_LEFT: 'field2',  WEST_CENTER: 'river0',  WEST_RIGHT: 'field0',
    },
    adjacencies: [
      ['city0', 'field0'], ['road0', 'field0'], ['road0', 'field1'],
      ['river0', 'field0'], ['river0', 'field1'], ['river0', 'field2'],
    ],
  },

  // ─── C: Big city N + River W→E ──────────────────────────────────────────
  {
    id: 'river_c3_C',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_C.png',
    segments: [
      { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,40 L0,40 Z', meepleCentroid: { x: 50, y: 20 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M0,55 L100,55', meepleCentroid: { x: 50, y: 55 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,40 L100,40 L100,48 L0,48 Z', meepleCentroid: { x: 50, y: 44 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M0,62 L100,62 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 80 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0',  NORTH_CENTER: 'city0',  NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0',  EAST_CENTER: 'river0',  EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1', SOUTH_CENTER: 'field1',  SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1',  WEST_CENTER: 'river0',  WEST_RIGHT: 'field0',
    },
    adjacencies: [
      ['city0', 'field0'], ['river0', 'field0'], ['river0', 'field1'],
    ],
  },

  // ─── D: Cloister + River N→S ────────────────────────────────────────────
  {
    id: 'river_c3_D',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_D.png',
    segments: [
      { id: 'cloister0', type: 'CLOISTER', svgPath: 'M25,35 L45,35 L45,65 L25,65 Z', meepleCentroid: { x: 35, y: 50 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M55,0 Q60,50 55,100', meepleCentroid: { x: 57, y: 50 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L48,0 L48,100 L0,100 Z', meepleCentroid: { x: 20, y: 20 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M62,0 L100,0 L100,100 L62,100 Z', meepleCentroid: { x: 80, y: 50 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0',  NORTH_CENTER: 'river0',  NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1',   EAST_CENTER: 'field1',   EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1',  SOUTH_CENTER: 'river0',  SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0',   WEST_CENTER: 'field0',   WEST_RIGHT: 'field0',
    },
    adjacencies: [
      ['cloister0', 'field0'], ['river0', 'field0'], ['river0', 'field1'],
    ],
  },

  // ─── E: City N + River S→W curve ────────────────────────────────────────
  {
    id: 'river_c3_E',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_E.png',
    segments: [
      { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,35 Q50,45 0,35 Z', meepleCentroid: { x: 50, y: 15 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M50,100 Q50,55 0,50', meepleCentroid: { x: 30, y: 70 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,35 L100,35 L100,100 L55,100 L0,55 Z', meepleCentroid: { x: 75, y: 65 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M0,45 L45,100 L0,100 Z', meepleCentroid: { x: 15, y: 80 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'city0',   NORTH_CENTER: 'city0',   NORTH_RIGHT: 'city0',
      EAST_LEFT: 'field0',   EAST_CENTER: 'field0',   EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0',  SOUTH_CENTER: 'river0',  SOUTH_RIGHT: 'field1',
      WEST_LEFT: 'field1',   WEST_CENTER: 'river0',   WEST_RIGHT: 'field0',
    },
    adjacencies: [
      ['city0', 'field0'], ['river0', 'field0'], ['river0', 'field1'],
    ],
  },

  // ─── F: S-curve River N→S (all field) ───────────────────────────────────
  {
    id: 'river_c3_F',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_F.png',
    segments: [
      { id: 'river0', type: 'RIVER', svgPath: 'M45,0 Q70,25 50,50 Q30,75 55,100', meepleCentroid: { x: 50, y: 50 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L40,0 L40,100 L0,100 Z', meepleCentroid: { x: 20, y: 50 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M60,0 L100,0 L100,100 L60,100 Z', meepleCentroid: { x: 80, y: 50 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0',  NORTH_CENTER: 'river0',  NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1',   EAST_CENTER: 'field1',   EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1',  SOUTH_CENTER: 'river0',  SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0',   WEST_CENTER: 'field0',   WEST_RIGHT: 'field0',
    },
    adjacencies: [['river0', 'field0'], ['river0', 'field1']],
  },

  // ─── G: Cloister + River N→E curve ──────────────────────────────────────
  {
    id: 'river_c3_G',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_G.png',
    segments: [
      { id: 'cloister0', type: 'CLOISTER', svgPath: 'M15,60 L40,60 L40,85 L15,85 Z', meepleCentroid: { x: 28, y: 73 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M45,0 Q45,45 100,50', meepleCentroid: { x: 65, y: 30 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L40,0 L0,45 Z', meepleCentroid: { x: 15, y: 20 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M50,0 L100,0 L100,44 Z', meepleCentroid: { x: 80, y: 20 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0',  NORTH_CENTER: 'river0',  NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1',   EAST_CENTER: 'river0',   EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0',  SOUTH_CENTER: 'field0',   SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0',   WEST_CENTER: 'field0',   WEST_RIGHT: 'field0',
    },
    adjacencies: [
      ['cloister0', 'field0'], ['river0', 'field0'], ['river0', 'field1'],
    ],
  },

  // ─── H: Cloister + Road bridge + River N→S, Road E→W ───────────────────
  {
    id: 'river_c3_H',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_H.png',
    segments: [
      { id: 'cloister0', type: 'CLOISTER', svgPath: 'M25,15 L48,15 L48,40 L25,40 Z', meepleCentroid: { x: 36, y: 28 } },
      { id: 'road0', type: 'ROAD', svgPath: 'M100,50 L0,50', meepleCentroid: { x: 80, y: 50 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M50,0 Q50,50 50,100', meepleCentroid: { x: 50, y: 25 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L46,0 L0,46 Z', meepleCentroid: { x: 15, y: 15 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,0 L100,0 L100,46 Z', meepleCentroid: { x: 80, y: 15 } },
      { id: 'field2', type: 'FIELD', svgPath: 'M100,54 L100,100 L54,100 Z', meepleCentroid: { x: 80, y: 80 } },
      { id: 'field3', type: 'FIELD', svgPath: 'M0,54 L46,100 L0,100 Z', meepleCentroid: { x: 15, y: 80 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0',  NORTH_CENTER: 'river0',  NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1',   EAST_CENTER: 'road0',    EAST_RIGHT: 'field2',
      SOUTH_LEFT: 'field2',  SOUTH_CENTER: 'river0',  SOUTH_RIGHT: 'field3',
      WEST_LEFT: 'field3',   WEST_CENTER: 'road0',    WEST_RIGHT: 'field0',
    },
    adjacencies: [
      ['cloister0', 'field0'],
      ['road0', 'field0'], ['road0', 'field1'], ['road0', 'field2'], ['road0', 'field3'],
      ['river0', 'field0'], ['river0', 'field1'], ['river0', 'field2'], ['river0', 'field3'],
    ],
  },

  // ─── I: Pond — river end (enters from N) ────────────────────────────────
  {
    id: 'river_c3_I',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_I.png',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 25, y: 75 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M45,0 Q50,40 55,65', meepleCentroid: { x: 55, y: 60 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0',  NORTH_CENTER: 'river0',  NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0',   EAST_CENTER: 'field0',   EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0',  SOUTH_CENTER: 'field0',  SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0',   WEST_CENTER: 'field0',   WEST_RIGHT: 'field0',
    },
    adjacencies: [['river0', 'field0']],
  },

  // ─── J: River curve S→E (field only) ────────────────────────────────────
  {
    id: 'river_c3_J',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_J.png',
    segments: [
      { id: 'river0', type: 'RIVER', svgPath: 'M50,100 Q50,50 100,45', meepleCentroid: { x: 70, y: 70 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,40 L45,100 L0,100 Z', meepleCentroid: { x: 25, y: 30 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M100,50 L55,100 L100,100 Z', meepleCentroid: { x: 85, y: 80 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0',  NORTH_CENTER: 'field0',   NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0',   EAST_CENTER: 'river0',    EAST_RIGHT: 'field1',
      SOUTH_LEFT: 'field1',  SOUTH_CENTER: 'river0',   SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0',   WEST_CENTER: 'field0',    WEST_RIGHT: 'field0',
    },
    adjacencies: [['river0', 'field0'], ['river0', 'field1']],
  },

  // ─── K: Road bridge E→W + River N→S ─────────────────────────────────────
  {
    id: 'river_c3_K',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_K.png',
    segments: [
      { id: 'road0', type: 'ROAD', svgPath: 'M0,50 L100,50', meepleCentroid: { x: 80, y: 50 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M50,0 L50,100', meepleCentroid: { x: 50, y: 25 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L46,0 L0,46 Z', meepleCentroid: { x: 15, y: 15 } },
      { id: 'field1', type: 'FIELD', svgPath: 'M54,0 L100,0 L100,46 Z', meepleCentroid: { x: 80, y: 15 } },
      { id: 'field2', type: 'FIELD', svgPath: 'M100,54 L100,100 L54,100 Z', meepleCentroid: { x: 80, y: 80 } },
      { id: 'field3', type: 'FIELD', svgPath: 'M0,54 L46,100 L0,100 Z', meepleCentroid: { x: 15, y: 80 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0',  NORTH_CENTER: 'river0',  NORTH_RIGHT: 'field1',
      EAST_LEFT: 'field1',   EAST_CENTER: 'road0',    EAST_RIGHT: 'field2',
      SOUTH_LEFT: 'field2',  SOUTH_CENTER: 'river0',  SOUTH_RIGHT: 'field3',
      WEST_LEFT: 'field3',   WEST_CENTER: 'road0',    WEST_RIGHT: 'field0',
    },
    adjacencies: [
      ['road0', 'field0'], ['road0', 'field1'], ['road0', 'field2'], ['road0', 'field3'],
      ['river0', 'field0'], ['river0', 'field1'], ['river0', 'field2'], ['river0', 'field3'],
    ],
  },

  // ─── L: Church (cloister) + Lake — river end (enters from S) ────────────
  {
    id: 'river_c3_L',
    count: 1,
    expansionId: 'river-c3',
    version: 'C3',
    imageUrl: '/images/River1_C3/River_I_C3_Tile_L.png',
    segments: [
      { id: 'cloister0', type: 'CLOISTER', svgPath: 'M15,55 L45,55 L45,85 L15,85 Z', meepleCentroid: { x: 30, y: 70 } },
      { id: 'river0', type: 'RIVER', svgPath: 'M55,100 Q60,60 65,35', meepleCentroid: { x: 65, y: 50 } },
      { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 25, y: 25 } },
    ],
    edgePositionToSegment: {
      NORTH_LEFT: 'field0',  NORTH_CENTER: 'field0',  NORTH_RIGHT: 'field0',
      EAST_LEFT: 'field0',   EAST_CENTER: 'field0',   EAST_RIGHT: 'field0',
      SOUTH_LEFT: 'field0',  SOUTH_CENTER: 'river0',  SOUTH_RIGHT: 'field0',
      WEST_LEFT: 'field0',   WEST_CENTER: 'field0',   WEST_RIGHT: 'field0',
    },
    adjacencies: [['cloister0', 'field0'], ['river0', 'field0']],
  },
]
