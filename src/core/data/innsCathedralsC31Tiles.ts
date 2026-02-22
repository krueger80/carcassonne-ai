import type { TileDefinition } from '../types/tile.ts'

/**
 * Inns & Cathedrals 3rd Edition (C3.1) tile definitions.
 * 24 tiles total: 23 normal tiles + 1 river tile.
 * 
 * Note: Topology for A-P, Ka, Kb is inherited from the 2nd Edition (C2).
 * Tiles Q, R, S, U, V, W are new or variants in this edition.
 */
export const IC_C31_TILES: TileDefinition[] = [
  // ── ic31_A: Inn + Highwaymen ──
  {
    id: 'ic31_A', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_A.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 38, y: 22 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 26, y: 72 } },
      { id: 'road0', type: 'ROAD', hasInn: true, svgPath: '', meepleCentroid: { x: 57, y: 61 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field1', EAST_LEFT: 'field1', EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field1', NORTH_LEFT: 'field1', NORTH_RIGHT: 'field1',
      SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'road0', WEST_LEFT: 'field0', WEST_RIGHT: 'field1'
    },
    adjacencies: [['road0', 'field0'], ['road0', 'field1']]
  },
  // ── ic31_B: Inn + Garden ──
  {
    id: 'ic31_B', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_B.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 34, y: 28 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 51, y: 77 } },
      { id: 'road0', type: 'ROAD', hasInn: true, svgPath: '', meepleCentroid: { x: 52, y: 57 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field1', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'road0', WEST_LEFT: 'field1', WEST_RIGHT: 'field0'
    },
    adjacencies: [['road0', 'field0'], ['road0', 'field1']]
  },
  // ── ic31_C: Inn + Crossroad + Pigsty ──
  {
    id: 'ic31_C', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_C.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 50, y: 28 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 79, y: 76 } },
      { id: 'field2', type: 'FIELD', svgPath: '', meepleCentroid: { x: 25, y: 75 } },
      { id: 'road0', type: 'ROAD', hasInn: true, svgPath: '', meepleCentroid: { x: 80, y: 52 } },
      { id: 'road1', type: 'ROAD', svgPath: '', meepleCentroid: { x: 57, y: 78 } },
      { id: 'road2', type: 'ROAD', hasInn: true, svgPath: '', meepleCentroid: { x: 26, y: 55 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road1', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field2',
      WEST_CENTER: 'road2', WEST_LEFT: 'field2', WEST_RIGHT: 'field0'
    },
    adjacencies: [['field0', 'road0'], ['field0', 'road2'], ['road1', 'field2'], ['road1', 'field1'], ['road2', 'field2'], ['field1', 'road0']]
  },
  // ── ic31_D: Monastery ──
  {
    id: 'ic31_D', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_D.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 54, y: 24 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 50, y: 84 } },
      { id: 'road0', type: 'ROAD', svgPath: '', meepleCentroid: { x: 81, y: 50 } },
      { id: 'road1', type: 'ROAD', svgPath: '', meepleCentroid: { x: 17, y: 70 } },
      { id: 'cloister0', type: 'CLOISTER', svgPath: '', meepleCentroid: { x: 51, y: 52 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field1', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'road1', WEST_LEFT: 'field1', WEST_RIGHT: 'field0' // fixed fallback
    },
    adjacencies: [['cloister0', 'field0'], ['cloister0', 'road0'], ['cloister0', 'field1'], ['cloister0', 'road1']]
  },
  // ── ic31_E: Farmhouse ──
  {
    id: 'ic31_E', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_E.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 20, y: 21 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 85, y: 85 } },
      { id: 'field2', type: 'FIELD', svgPath: '', meepleCentroid: { x: 56, y: 49 } },
      { id: 'road0', type: 'ROAD', svgPath: '', meepleCentroid: { x: 35, y: 32 } },
      { id: 'road1', type: 'ROAD', svgPath: '', meepleCentroid: { x: 73, y: 72 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road1', EAST_LEFT: 'field2', EAST_RIGHT: 'field1',
      NORTH_CENTER: 'road0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field2',
      SOUTH_CENTER: 'road1', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field2',
      WEST_CENTER: 'road0', WEST_LEFT: 'field2', WEST_RIGHT: 'field0'
    },
    adjacencies: [['road0', 'field0'], ['road0', 'field2'], ['road1', 'field2'], ['road1', 'field1']]
  },
  // ── ic31_F: Donkey Stable ──
  {
    id: 'ic31_F', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_F.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 78, y: 36 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 57, y: 78 } },
      { id: 'road0', type: 'ROAD', svgPath: '', meepleCentroid: { x: 69, y: 59 } },
      { id: 'city0', type: 'CITY', svgPath: '', meepleCentroid: { x: 30, y: 29 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field1',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'field1', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
    },
    adjacencies: [['field0', 'city0'], ['field0', 'road0'], ['city0', 'road0'], ['city0', 'field1'], ['road0', 'field1']]
  },
  // ── ic31_G: Water Tower 1 ──
  {
    id: 'ic31_G', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_G.jpg',
    segments: [
      { id: 'city0', type: 'CITY', svgPath: '', meepleCentroid: { x: 28, y: 35 } },
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 50, y: 16 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 69, y: 73 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field1', EAST_LEFT: 'field1', EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field1', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
    },
    adjacencies: [['city0', 'field0'], ['city0', 'field1']]
  },
  // ── ic31_H: Inner Field + Garden ──
  {
    id: 'ic31_H', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_H.jpg',
    segments: [
      { id: 'city0', type: 'CITY', svgPath: '', meepleCentroid: { x: 50, y: 18 } },
      { id: 'city1', type: 'CITY', svgPath: '', meepleCentroid: { x: 82, y: 46 } },
      { id: 'city2', type: 'CITY', svgPath: '', meepleCentroid: { x: 52, y: 81 } },
      { id: 'city3', type: 'CITY', svgPath: '', meepleCentroid: { x: 15, y: 47 } },
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 52, y: 45 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city1', EAST_LEFT: 'city1', EAST_RIGHT: 'city1',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city2', SOUTH_LEFT: 'city2', SOUTH_RIGHT: 'city2',
      WEST_CENTER: 'city3', WEST_LEFT: 'city3', WEST_RIGHT: 'city3'
    },
    adjacencies: [['field0', 'city0'], ['field0', 'city3'], ['field0', 'city2'], ['field0', 'city1']]
  },
  // ── ic31_I: Village ──
  {
    id: 'ic31_I', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_I.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 83, y: 30 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 80, y: 72 } },
      { id: 'field2', type: 'FIELD', svgPath: '', meepleCentroid: { x: 23, y: 72 } },
      { id: 'field3', type: 'FIELD', svgPath: '', meepleCentroid: { x: 23, y: 36 } },
      { id: 'road0', type: 'ROAD', svgPath: '', meepleCentroid: { x: 85, y: 47 } },
      { id: 'road1', type: 'ROAD', svgPath: '', meepleCentroid: { x: 20, y: 53 } },
      { id: 'city0', type: 'CITY', svgPath: '', meepleCentroid: { x: 50, y: 21 } },
      { id: 'city1', type: 'CITY', svgPath: '', meepleCentroid: { x: 50, y: 78 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field1',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city1', SOUTH_LEFT: 'city1', SOUTH_RIGHT: 'city1',
      WEST_CENTER: 'road1', WEST_LEFT: 'field2', WEST_RIGHT: 'field3'
    },
    adjacencies: [['field3', 'city0'], ['field3', 'road1'], ['city1', 'field2'], ['city1', 'field1'], ['road1', 'field2'], ['road0', 'field1'], ['road0', 'field0'], ['field0', 'city0']]
  },
  // ── ic31_J: Highwaymen ──
  {
    id: 'ic31_J', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_J.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 77, y: 55 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 24, y: 57 } },
      { id: 'road0', type: 'ROAD', svgPath: '', meepleCentroid: { x: 53, y: 61 } },
      { id: 'city0', type: 'CITY', svgPath: '', meepleCentroid: { x: 50, y: 19 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'field1', WEST_LEFT: 'field1', WEST_RIGHT: 'field1'
    },
    adjacencies: [['road0', 'field1'], ['road0', 'field0'], ['road0', 'city0'], ['field0', 'city0'], ['field1', 'city0']]
  },
  // ── ic31_Ka: Cathedral ──
  {
    id: 'ic31_Ka', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_Ka.jpg',
    segments: [
      { id: 'city0', type: 'CITY', hasCathedral: true, svgPath: '', meepleCentroid: { x: 50, y: 50 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0', EAST_LEFT: 'city0', EAST_RIGHT: 'city0',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city0', SOUTH_LEFT: 'city0', SOUTH_RIGHT: 'city0',
      WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
    }
  },
  // ── ic31_Kb: Cathedral ──
  {
    id: 'ic31_Kb', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_Kb.jpg',
    segments: [
      { id: 'city0', type: 'CITY', hasCathedral: true, svgPath: '', meepleCentroid: { x: 50, y: 50 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0', EAST_LEFT: 'city0', EAST_RIGHT: 'city0',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city0', SOUTH_LEFT: 'city0', SOUTH_RIGHT: 'city0',
      WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
    }
  },
  // ── ic31_L: Inn ──
  {
    id: 'ic31_L', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_L.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 26, y: 80 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 77, y: 75 } },
      { id: 'road0', type: 'ROAD', hasInn: true, svgPath: '', meepleCentroid: { x: 60, y: 59 } },
      { id: 'city0', type: 'CITY', hasPennant: true, svgPath: '', meepleCentroid: { x: 32, y: 32 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field1',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
    },
    adjacencies: [['city0', 'field0'], ['road0', 'field0'], ['road0', 'field1']]
  },
  // ── ic31_M: Inn ──
  {
    id: 'ic31_M', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_M.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 63, y: 51 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 26, y: 72 } },
      { id: 'road0', type: 'ROAD', svgPath: '', meepleCentroid: { x: 40, y: 63 } },
      { id: 'city0', type: 'CITY', svgPath: '', meepleCentroid: { x: 51, y: 22 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'road0', WEST_LEFT: 'field1', WEST_RIGHT: 'field0'
    },
    adjacencies: [['field0', 'city0'], ['field0', 'road0'], ['field1', 'road0']]
  },
  // ── ic31_N: Inn ──
  {
    id: 'ic31_N', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_N.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 79, y: 50 } },
      { id: 'field1', type: 'FIELD', svgPath: '', meepleCentroid: { x: 29, y: 81 } },
      { id: 'road0', type: 'ROAD', hasInn: true, svgPath: '', meepleCentroid: { x: 55, y: 78 } },
      { id: 'city0', type: 'CITY', svgPath: '', meepleCentroid: { x: 28, y: 30 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
    },
    adjacencies: [['city0', 'field0'], ['city0', 'road0'], ['city0', 'field1'], ['road0', 'field1'], ['road0', 'field0']]
  },
  // ── ic31_O: Farmhouse ──
  {
    id: 'ic31_O', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_O.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 53, y: 57 } },
      { id: 'city0', type: 'CITY', svgPath: '', meepleCentroid: { x: 56, y: 11 } },
      { id: 'city1', type: 'CITY', svgPath: '', meepleCentroid: { x: 90, y: 47 } },
      { id: 'city2', type: 'CITY', svgPath: '', meepleCentroid: { x: 18, y: 50 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city1', EAST_LEFT: 'city1', EAST_RIGHT: 'city1',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'city2', WEST_LEFT: 'city2', WEST_RIGHT: 'city2'
    },
    adjacencies: [['field0', 'city1'], ['field0', 'city0'], ['field0', 'city2']]
  },
  // ── ic31_P: Water Tower 2 ──
  {
    id: 'ic31_P', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_P.jpg',
    segments: [
      { id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 69, y: 60 } },
      { id: 'city0', type: 'CITY', svgPath: '', meepleCentroid: { x: 42, y: 27 } },
      { id: 'city1', type: 'CITY', hasPennant: true, svgPath: '', meepleCentroid: { x: 51, y: 81 } }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city1', SOUTH_LEFT: 'city1', SOUTH_RIGHT: 'city1',
      WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
    },
    adjacencies: [['field0', 'city0'], ['field0', 'city1']]
  },
  // ── ic31_Q: (Unknown Bonus Tile) ──
  {
    id: 'ic31_Q', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_Q.jpg',
    segments: [{ id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 50, y: 50 } }],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
    }
  },
  // ── ic31_R: (Unknown Bonus Tile) ──
  {
    id: 'ic31_R', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_R.jpg',
    segments: [{ id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 50, y: 50 } }],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
    }
  },
  // ── ic31_S: (Unknown Bonus Tile) ──
  {
    id: 'ic31_S', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_S.jpg',
    segments: [{ id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 50, y: 50 } }],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
    }
  },
  // ── ic31_T: River with Inn ──
  {
    id: 'ic31_T', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_T.jpg',
    segments: [{ id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 50, y: 50 } }],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
    }
  },
  // ── ic31_U: (Unknown Bonus Tile) ──
  {
    id: 'ic31_U', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_U.jpg',
    segments: [{ id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 50, y: 50 } }],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
    }
  },
  // ── ic31_V: (Unknown Bonus Tile) ──
  {
    id: 'ic31_V', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_V.jpg',
    segments: [{ id: 'field0', type: 'FIELD', svgPath: '', meepleCentroid: { x: 50, y: 50 } }],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
    }
  },
  // ── ic31_W: Inn Variant ──
  {
    id: 'ic31_W', count: 1,
    expansionId: 'inns-cathedrals-c31',
    imageUrl: '/images/InnsAndCathedrals_C31/Inns_And_Cathedrals_C31_Tile_W.jpg',
    segments: [{ id: 'field0', type: 'FIELD', hasInn: true, svgPath: '', meepleCentroid: { x: 50, y: 50 } }],
    edgePositionToSegment: {
      EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
    }
  }
]
