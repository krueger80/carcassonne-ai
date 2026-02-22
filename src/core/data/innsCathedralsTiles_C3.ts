import type { TileDefinition } from '../types/tile.ts'

// These definitions are for the Inns and Cathedrals expansion (C3 Edition).
// They use the images from /images/InnsAndCathedrals_C3/.
// Configurations (sides/segments) are adapted from the C2 definitions but mapped to the C3 tile distribution.

export const IC_TILES_C3: TileDefinition[] = [
    // A: Inn, FRRF
    {
        id: 'ic_c3_A',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_A.jpg',
        segments: [
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 25, y: 25 } },
            { id: 'road0', type: 'ROAD', hasInn: true, svgPath: 'M100,50 L50,50 L50,100', meepleCentroid: { x: 75, y: 75 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 75, y: 25 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'field1', NORTH_LEFT: 'field1', NORTH_RIGHT: 'field1',
            EAST_CENTER: 'road0', EAST_LEFT: 'field1', EAST_RIGHT: 'field0',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field1',
            WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['field0', 'road0'], ['field1', 'road0']]
    },
    // B: Inn, RFFR
    {
        id: 'ic_c3_B',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_B.jpg',
        segments: [
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 75, y: 75 } },
            { id: 'road0', type: 'ROAD', hasInn: true, svgPath: 'M50,0 L50,50 L0,50', meepleCentroid: { x: 25, y: 25 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 25, y: 75 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'road0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field1',
            EAST_CENTER: 'field1', EAST_LEFT: 'field1', EAST_RIGHT: 'field1',
            SOUTH_CENTER: 'field1', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field1',
            WEST_CENTER: 'road0', WEST_LEFT: 'field1', WEST_RIGHT: 'field0'
        },
        adjacencies: [['field0', 'road0'], ['field1', 'road0']]
    },
    // C: Inn, RRRR
    {
        id: 'ic_c3_C',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_C.jpg',
        segments: [
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L50,50 L100,0 Z', meepleCentroid: { x: 50, y: 20 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M100,0 L50,50 L100,100 Z', meepleCentroid: { x: 80, y: 50 } },
            { id: 'field2', type: 'FIELD', svgPath: 'M100,100 L50,50 L0,100 Z', meepleCentroid: { x: 50, y: 80 } },
            { id: 'field3', type: 'FIELD', svgPath: 'M0,100 L50,50 L0,0 Z', meepleCentroid: { x: 20, y: 50 } },
            { id: 'road0', type: 'ROAD', hasInn: true, svgPath: 'M50,0 L50,100 M0,50 L100,50', meepleCentroid: { x: 50, y: 50 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'road0', NORTH_LEFT: 'field3', NORTH_RIGHT: 'field0',
            EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field1',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field2',
            WEST_CENTER: 'road0', WEST_LEFT: 'field2', WEST_RIGHT: 'field3'
        },
        adjacencies: [['field0', 'road0'], ['field1', 'road0'], ['field2', 'road0'], ['field3', 'road0']]
    },
    // D: FFRF (Road South)
    {
        id: 'ic_c3_D',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_D.jpg',
        segments: [
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 40 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M50,50 L50,100', meepleCentroid: { x: 50, y: 75 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'field0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field0',
            EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['field0', 'road0']]
    },
    // E: RFRF (Straight Road)
    {
        id: 'ic_c3_E',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_E.jpg',
        segments: [
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L50,0 L50,100 L0,100 Z', meepleCentroid: { x: 25, y: 50 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M50,0 L100,0 L100,100 L50,100 Z', meepleCentroid: { x: 75, y: 50 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M50,0 L50,100', meepleCentroid: { x: 50, y: 50 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'road0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field1',
            EAST_CENTER: 'field1', EAST_LEFT: 'field1', EAST_RIGHT: 'field1',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['field0', 'road0'], ['field1', 'road0']]
    },
    // F: CCFF (City North/East)
    {
        id: 'ic_c3_F',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_F.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,100 Z', meepleCentroid: { x: 65, y: 35 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,100 L0,100 Z', meepleCentroid: { x: 35, y: 65 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'city0', EAST_LEFT: 'city0', EAST_RIGHT: 'city0',
            SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['city0', 'field0']]
    },
    // G: CFFC (City North/West)
    {
        id: 'ic_c3_G',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_G.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L0,100 Z', meepleCentroid: { x: 35, y: 35 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M100,0 L100,100 L0,100 Z', meepleCentroid: { x: 65, y: 65 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'field0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
            SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
        },
        adjacencies: [['city0', 'field0']]
    },
    // H: CCCC (Cathedral-like but normal?)
    {
        id: 'ic_c3_H',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_H.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 50 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'city0', EAST_LEFT: 'city0', EAST_RIGHT: 'city0',
            SOUTH_CENTER: 'city0', SOUTH_LEFT: 'city0', SOUTH_RIGHT: 'city0',
            WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
        }
    },
    // I: CRRC
    {
        id: 'ic_c3_I',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_I.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L0,100 Z', meepleCentroid: { x: 25, y: 25 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M100,50 L50,50 L50,100', meepleCentroid: { x: 75, y: 75 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M0,100 L100,100 L100,0 Z', meepleCentroid: { x: 65, y: 65 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
        },
        adjacencies: [['city0', 'field0'], ['field0', 'road0']]
    },
    // J: RCRF
    {
        id: 'ic_c3_J',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_J.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M100,0 L100,100 L50,50 Z', meepleCentroid: { x: 80, y: 50 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M50,0 L50,100', meepleCentroid: { x: 50, y: 50 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L50,0 L0,100 Z', meepleCentroid: { x: 20, y: 30 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M50,0 L100,0 L50,50 L50,0 Z', meepleCentroid: { x: 65, y: 20 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'road0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field1',
            EAST_CENTER: 'city0', EAST_LEFT: 'city0', EAST_RIGHT: 'city0',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'city0', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['city0', 'field1'], ['road0', 'field0'], ['road0', 'city0']]
    },
    // Ka: Cathedral
    {
        id: 'ic_c3_Ka',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_Ka.jpg',
        segments: [{ id: 'city0', type: 'CITY', hasCathedral: true, svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 50 } }],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'city0', EAST_LEFT: 'city0', EAST_RIGHT: 'city0',
            SOUTH_CENTER: 'city0', SOUTH_LEFT: 'city0', SOUTH_RIGHT: 'city0',
            WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
        }
    },
    // Kb: Cathedral
    {
        id: 'ic_c3_Kb',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_Kb.jpg',
        segments: [{ id: 'city0', type: 'CITY', hasCathedral: true, svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 50 } }],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'city0', EAST_LEFT: 'city0', EAST_RIGHT: 'city0',
            SOUTH_CENTER: 'city0', SOUTH_LEFT: 'city0', SOUTH_RIGHT: 'city0',
            WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
        }
    },
    // L: Inn CFRR
    {
        id: 'ic_c3_L',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_L.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,40 L0,40 Z', meepleCentroid: { x: 50, y: 20 } },
            { id: 'road0', type: 'ROAD', hasInn: true, svgPath: 'M100,50 L50,50 L50,100', meepleCentroid: { x: 75, y: 75 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M0,40 L100,40 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 70 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['city0', 'field0'], ['road0', 'field0']]
    },
    // M: Inn CRRF
    {
        id: 'ic_c3_M',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_M.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,40 L0,40 Z', meepleCentroid: { x: 50, y: 20 } },
            { id: 'road0', type: 'ROAD', hasInn: true, svgPath: 'M100,50 L50,50 L50,100', meepleCentroid: { x: 75, y: 75 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M0,40 L100,40 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 70 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['city0', 'field0'], ['road0', 'field0']]
    },
    // N: Inn RFRC
    {
        id: 'ic_c3_N',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_N.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,100 L100,100 L100,60 L0,60 Z', meepleCentroid: { x: 50, y: 80 } },
            { id: 'road0', type: 'ROAD', hasInn: true, svgPath: 'M50,0 L50,100', meepleCentroid: { x: 50, y: 50 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L50,0 L0,60 Z', meepleCentroid: { x: 20, y: 30 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M50,0 L100,0 L100,60 L50,60 Z', meepleCentroid: { x: 75, y: 30 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'road0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field1',
            EAST_CENTER: 'field1', EAST_LEFT: 'field1', EAST_RIGHT: 'city0',
            SOUTH_CENTER: 'city0', SOUTH_LEFT: 'city0', SOUTH_RIGHT: 'city0',
            WEST_CENTER: 'field0', WEST_LEFT: 'city0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['road0', 'field0'], ['road0', 'field1'], ['city0', 'field0'], ['city0', 'field1']]
    },
    // O: CFCF
    {
        id: 'ic_c3_O',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_O.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,40 L0,40 Z', meepleCentroid: { x: 50, y: 20 } },
            { id: 'city1', type: 'CITY', svgPath: 'M0,100 L100,100 L100,60 L0,60 Z', meepleCentroid: { x: 50, y: 80 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M0,40 L100,40 L100,60 L0,60 Z', meepleCentroid: { x: 50, y: 50 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'field0', EAST_LEFT: 'city0', EAST_RIGHT: 'city1',
            SOUTH_CENTER: 'city1', SOUTH_LEFT: 'city1', SOUTH_RIGHT: 'city1',
            WEST_CENTER: 'field0', WEST_LEFT: 'city1', WEST_RIGHT: 'city0'
        },
        adjacencies: [['city0', 'field0'], ['city1', 'field0']]
    },
    // P: CRRC
    {
        id: 'ic_c3_P',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_P.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L0,100 Z', meepleCentroid: { x: 25, y: 25 } },
            { id: 'city1', type: 'CITY', svgPath: 'M100,100 L0,100 L100,0 Z', meepleCentroid: { x: 75, y: 75 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M0,50 L100,50', meepleCentroid: { x: 50, y: 50 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'road0', EAST_LEFT: 'city0', EAST_RIGHT: 'city1',
            SOUTH_CENTER: 'city1', SOUTH_LEFT: 'city1', SOUTH_RIGHT: 'city1',
            WEST_CENTER: 'road0', WEST_LEFT: 'city1', WEST_RIGHT: 'city0'
        }
    },
    // Q: CCCF
    {
        id: 'ic_c3_Q',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_Q.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 50 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M0,100 L100,100 L50,50 Z', meepleCentroid: { x: 50, y: 80 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'city0', EAST_LEFT: 'city0', EAST_RIGHT: 'city0',
            SOUTH_CENTER: 'field0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'city0', WEST_LEFT: 'city0', WEST_RIGHT: 'city0'
        },
        adjacencies: [['city0', 'field0']]
    },
    // R: CCRR
    {
        id: 'ic_c3_R',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_R.jpg',
        segments: [
            { id: 'city0', type: 'CITY', svgPath: 'M0,0 L100,0 L100,40 L0,40 Z', meepleCentroid: { x: 50, y: 20 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M100,50 L50,50 L50,100', meepleCentroid: { x: 75, y: 75 } },
            { id: 'field0', type: 'FIELD', svgPath: 'M0,40 L100,40 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 70 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'city0', NORTH_LEFT: 'city0', NORTH_RIGHT: 'city0',
            EAST_CENTER: 'road0', EAST_LEFT: 'field0', EAST_RIGHT: 'field0',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field0', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['city0', 'field0'], ['road0', 'field0']]
    },
    // S: RFRF (Straight Road)
    {
        id: 'ic_c3_S',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_S.jpg',
        segments: [
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L50,0 L50,100 L0,100 Z', meepleCentroid: { x: 25, y: 50 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M50,0 L100,0 L100,100 L50,100 Z', meepleCentroid: { x: 75, y: 50 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M50,0 L50,100', meepleCentroid: { x: 50, y: 50 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'road0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field1',
            EAST_CENTER: 'field1', EAST_LEFT: 'field1', EAST_RIGHT: 'field1',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field0',
            WEST_CENTER: 'field0', WEST_LEFT: 'field0', WEST_RIGHT: 'field0'
        },
        adjacencies: [['field0', 'road0'], ['field1', 'road0']]
    },
    // U: RRFF (L-bend Road)
    {
        id: 'ic_c3_U',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_U.jpg',
        segments: [
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 75, y: 75 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M50,0 L50,50 L0,50', meepleCentroid: { x: 25, y: 25 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M0,0 L100,0 L100,100 L0,100 Z', meepleCentroid: { x: 25, y: 75 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'road0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field1',
            EAST_CENTER: 'field1', EAST_LEFT: 'field1', EAST_RIGHT: 'field1',
            SOUTH_CENTER: 'field1', SOUTH_LEFT: 'field1', SOUTH_RIGHT: 'field1',
            WEST_CENTER: 'road0', WEST_LEFT: 'field1', WEST_RIGHT: 'field0'
        },
        adjacencies: [['field0', 'road0'], ['field1', 'road0']]
    },
    // V: RRRF (3-way junction)
    {
        id: 'ic_c3_V',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_V.jpg',
        segments: [
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L50,0 L0,50 Z', meepleCentroid: { x: 15, y: 15 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M50,0 L100,0 L100,50 Z', meepleCentroid: { x: 85, y: 15 } },
            { id: 'field2', type: 'FIELD', svgPath: 'M0,50 L100,50 L100,100 L0,100 Z', meepleCentroid: { x: 50, y: 75 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M50,0 L50,50', meepleCentroid: { x: 50, y: 25 } },
            { id: 'road1', type: 'ROAD', svgPath: 'M0,50 L100,50', meepleCentroid: { x: 50, y: 50 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'road0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field1',
            EAST_CENTER: 'road1', EAST_LEFT: 'field1', EAST_RIGHT: 'field2',
            SOUTH_CENTER: 'field2', SOUTH_LEFT: 'field2', SOUTH_RIGHT: 'field2',
            WEST_CENTER: 'road1', WEST_LEFT: 'field2', WEST_RIGHT: 'field0'
        },
        adjacencies: [['road0', 'field0'], ['road0', 'field1'], ['road1', 'field1'], ['road1', 'field2'], ['road1', 'field0']]
    },
    // W: RRRR (4-way junction)
    {
        id: 'ic_c3_W',
        count: 1,
        expansionId: 'inns-cathedrals-c3',
        imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_W.jpg',
        segments: [
            { id: 'field0', type: 'FIELD', svgPath: 'M0,0 L50,0 L0,50 Z', meepleCentroid: { x: 15, y: 15 } },
            { id: 'field1', type: 'FIELD', svgPath: 'M50,0 L100,0 L100,50 Z', meepleCentroid: { x: 85, y: 15 } },
            { id: 'field2', type: 'FIELD', svgPath: 'M100,50 L100,100 L50,100 Z', meepleCentroid: { x: 85, y: 85 } },
            { id: 'field3', type: 'FIELD', svgPath: 'M50,100 L0,100 L0,50 Z', meepleCentroid: { x: 15, y: 85 } },
            { id: 'road0', type: 'ROAD', svgPath: 'M50,0 L50,100 M0,50 L100,50', meepleCentroid: { x: 50, y: 50 } }
        ],
        edgePositionToSegment: {
            NORTH_CENTER: 'road0', NORTH_LEFT: 'field0', NORTH_RIGHT: 'field1',
            EAST_CENTER: 'road0', EAST_LEFT: 'field1', EAST_RIGHT: 'field2',
            SOUTH_CENTER: 'road0', SOUTH_LEFT: 'field2', SOUTH_RIGHT: 'field3',
            WEST_CENTER: 'road0', WEST_LEFT: 'field3', WEST_RIGHT: 'field0'
        },
        adjacencies: [['field0', 'road0'], ['field1', 'road0'], ['field2', 'road0'], ['field3', 'road0']]
    }
]
