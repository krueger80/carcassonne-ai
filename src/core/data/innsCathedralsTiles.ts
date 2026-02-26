import type { TileDefinition } from '../types/tile.ts'

export const IC_TILES: TileDefinition[] = [
  // ic3_A
  {
    id: 'ic3_A',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_A.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 38,
          y: 22
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 26,
          y: 72
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        hasInn: true,
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 57,
          y: 61
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field1',
      EAST_LEFT: 'field1',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field1',
      NORTH_LEFT: 'field1',
      NORTH_RIGHT: 'field1',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'road0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field1'
    },
    adjacencies: [
      [
        'road0',
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // ic3_B
  {
    id: 'ic3_B',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_B.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 34,
          y: 28
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 51,
          y: 77
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        hasInn: true,
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 52,
          y: 57
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field1',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'road0',
      WEST_LEFT: 'field1',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'road0',
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // ic3_C
  {
    id: 'ic3_C',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_C.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 50,
          y: 28
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 79,
          y: 76
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 25,
          y: 75
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        hasInn: true,
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 80,
          y: 52
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 57,
          y: 78
        }
      },
      {
        id: 'road2',
        type: 'ROAD',
        hasInn: true,
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 26,
          y: 55
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road1',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
      WEST_CENTER: 'road2',
      WEST_LEFT: 'field2',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'field0',
        'road0'
      ],
      [
        'field0',
        'road2'
      ],
      [
        'road1',
        'field2'
      ],
      [
        'road1',
        'field1'
      ],
      [
        'road2',
        'field2'
      ],
      [
        'field1',
        'road0'
      ]
    ]
  },
  // ic3_D
  {
    id: 'ic3_D',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_D.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 54,
          y: 24
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 50,
          y: 84
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 81,
          y: 50
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 17,
          y: 70
        }
      },
      {
        id: 'cloister0',
        type: 'CLOISTER',
        svgPath: 'M40,40 L60,40 L60,60 L40,60 Z',
        meepleCentroid: {
          x: 51,
          y: 52
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field1',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'road1',
      WEST_LEFT: 'field1',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'cloister0',
        'field0'
      ],
      [
        'cloister0',
        'road0'
      ],
      [
        'cloister0',
        'field1'
      ],
      [
        'cloister0',
        'road1'
      ],
      [
        'field0',
        'road1'
      ],
      [
        'field0',
        'road0'
      ],
      [
        'field1',
        'road0'
      ],
      [
        'field1',
        'road1'
      ]
    ]
  },
  // ic3_E
  {
    id: 'ic3_E',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_E.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 20,
          y: 21
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 85,
          y: 85
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 56,
          y: 49
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 35,
          y: 32
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 73,
          y: 72
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road1',
      EAST_LEFT: 'field2',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'road0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field2',
      SOUTH_CENTER: 'road1',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
      WEST_CENTER: 'road0',
      WEST_LEFT: 'field2',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'road0',
        'field0'
      ],
      [
        'road0',
        'field2'
      ],
      [
        'road1',
        'field2'
      ],
      [
        'road1',
        'field1'
      ]
    ]
  },
  // ic3_F
  {
    id: 'ic3_F',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_F.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 78,
          y: 36
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 57,
          y: 78
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 69,
          y: 59
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 30,
          y: 29
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'field1',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'field0',
        'city0'
      ],
      [
        'field0',
        'road0'
      ],
      [
        'city0',
        'road0'
      ],
      [
        'city0',
        'field1'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // ic3_G
  {
    id: 'ic3_G',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_G.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 28,
          y: 35
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,40 L100,40 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 50,
          y: 16
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 69,
          y: 73
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field1',
      EAST_LEFT: 'field1',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field1',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ],
      [
        'city0',
        'field1'
      ]
    ]
  },
  // ic3_H
  {
    id: 'ic3_H',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_H.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 50,
          y: 18
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 82,
          y: 46
        }
      },
      {
        id: 'city2',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 52,
          y: 81
        }
      },
      {
        id: 'city3',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 15,
          y: 47
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 52,
          y: 45
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city1',
      EAST_LEFT: 'city1',
      EAST_RIGHT: 'city1',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city2',
      SOUTH_LEFT: 'city2',
      SOUTH_RIGHT: 'city2',
      WEST_CENTER: 'city3',
      WEST_LEFT: 'city3',
      WEST_RIGHT: 'city3'
    },
    adjacencies: [
      [
        'field0',
        'city0'
      ],
      [
        'field0',
        'city3'
      ],
      [
        'field0',
        'city2'
      ],
      [
        'field0',
        'city1'
      ]
    ]
  },
  // ic3_I
  {
    id: 'ic3_I',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_I.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 83,
          y: 30
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 80,
          y: 72
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 23,
          y: 72
        }
      },
      {
        id: 'field3',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 23,
          y: 36
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 85,
          y: 47
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 20,
          y: 53
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 50,
          y: 21
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 50,
          y: 78
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city1',
      SOUTH_LEFT: 'city1',
      SOUTH_RIGHT: 'city1',
      WEST_CENTER: 'road1',
      WEST_LEFT: 'field2',
      WEST_RIGHT: 'field3'
    },
    adjacencies: [
      [
        'field3',
        'city0'
      ],
      [
        'field3',
        'road1'
      ],
      [
        'city1',
        'field2'
      ],
      [
        'city1',
        'field1'
      ],
      [
        'road1',
        'field2'
      ],
      [
        'road0',
        'field1'
      ],
      [
        'road0',
        'field0'
      ],
      [
        'field0',
        'city0'
      ]
    ]
  },
  // ic3_J
  {
    id: 'ic3_J',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_J.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 77,
          y: 55
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 24,
          y: 57
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 53,
          y: 61
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 50,
          y: 19
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'field1',
      WEST_LEFT: 'field1',
      WEST_RIGHT: 'field1'
    },
    adjacencies: [
      [
        'road0',
        'field1'
      ],
      [
        'road0',
        'field0'
      ],
      [
        'road0',
        'city0'
      ],
      [
        'field0',
        'city0'
      ],
      [
        'field1',
        'city0'
      ]
    ]
  },
  // ic3_Ka
  {
    id: 'ic3_Ka',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_Ka.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        hasCathedral: true,
        meepleCentroid: {
          x: 50,
          y: 50
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0',
      EAST_LEFT: 'city0',
      EAST_RIGHT: 'city0',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city0',
      SOUTH_LEFT: 'city0',
      SOUTH_RIGHT: 'city0',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    }
  },
  // ic3_Kb
  {
    id: 'ic3_Kb',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_Kb.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        hasCathedral: true,
        meepleCentroid: {
          x: 50,
          y: 50
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0',
      EAST_LEFT: 'city0',
      EAST_RIGHT: 'city0',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city0',
      SOUTH_LEFT: 'city0',
      SOUTH_RIGHT: 'city0',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    }
  },
  // ic3_L
  {
    id: 'ic3_L',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_L.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 26,
          y: 80
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 77,
          y: 75
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        hasInn: true,
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 60,
          y: 59
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 32,
          y: 32
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ],
      [
        'road0',
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // ic3_M
  {
    id: 'ic3_M',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_M.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 63,
          y: 51
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 26,
          y: 72
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 40,
          y: 63
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 51,
          y: 22
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'road0',
      WEST_LEFT: 'field1',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'field0',
        'city0'
      ],
      [
        'field0',
        'road0'
      ],
      [
        'field1',
        'road0'
      ]
    ]
  },
  // ic3_N
  {
    id: 'ic3_N',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_N.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 79,
          y: 50
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 29,
          y: 81
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        hasInn: true,
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 55,
          y: 78
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 28,
          y: 30
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ],
      [
        'city0',
        'road0'
      ],
      [
        'city0',
        'field1'
      ],
      [
        'road0',
        'field1'
      ],
      [
        'road0',
        'field0'
      ]
    ]
  },
  // ic3_O
  {
    id: 'ic3_O',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_O.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 53,
          y: 57
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 56,
          y: 11
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 90,
          y: 47
        }
      },
      {
        id: 'city2',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 18,
          y: 50
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city1',
      EAST_LEFT: 'city1',
      EAST_RIGHT: 'city1',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'field0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'city2',
      WEST_LEFT: 'city2',
      WEST_RIGHT: 'city2'
    },
    adjacencies: [
      [
        'field0',
        'city1'
      ],
      [
        'field0',
        'city0'
      ],
      [
        'field0',
        'city2'
      ]
    ]
  },
  // ic3_P
  {
    id: 'ic3_P',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_P.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 69,
          y: 60
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 42,
          y: 27
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 51,
          y: 81
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'city1',
      SOUTH_LEFT: 'city1',
      SOUTH_RIGHT: 'city1',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'field0',
        'city0'
      ],
      [
        'field0',
        'city1'
      ]
    ]
  },
  // ic3_Q
  {
    id: 'ic3_Q',
    count: 1,
    expansionId: 'inns-cathedrals-c3',
    imageUrl: '/images/InnsAndCathedrals_C3/Inns_And_Cathedrals_C3_Tile_Q.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 27,
          y: 16
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 70,
          y: 17
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 73,
          y: 86
        }
      },
      {
        id: 'field3',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 31,
          y: 88
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 49,
          y: 19
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 50,
          y: 86
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 50,
          y: 53
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0',
      EAST_LEFT: 'city0',
      EAST_RIGHT: 'city0',
      NORTH_CENTER: 'road0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field1',
      SOUTH_CENTER: 'road1',
      SOUTH_LEFT: 'field2',
      SOUTH_RIGHT: 'field3',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ],
      [
        'city0',
        'road0'
      ],
      [
        'city0',
        'field1'
      ],
      [
        'city0',
        'field2'
      ],
      [
        'city0',
        'road1'
      ],
      [
        'city0',
        'field3'
      ],
      [
        'road1',
        'field3'
      ],
      [
        'road1',
        'field2'
      ],
      [
        'road0',
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
]
