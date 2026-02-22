import type { TileDefinition } from '../types/tile.ts'

export const TB_TILES: TileDefinition[] = [
  // tb_A
  {
    id: 'tb_A',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_A.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L78,22 L52,30 L21,20 Z',
        meepleCentroid: {
          x: 53,
          y: 13
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M54,25 L48,47 L68,56 L100,50',
        meepleCentroid: {
          x: 56,
          y: 52
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 80,
          y: 35
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 29,
          y: 69
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
        'city0'
      ],
      [
        'road0',
        'field0'
      ],
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
  // tb_B
  {
    id: 'tb_B',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_B.jpg',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L30,25 L60,60 L75,70 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 82,
          y: 29
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 74,
          y: 78
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 20,
          y: 76
        }
      },
      {
        id: 'field3',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 26,
          y: 26
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M52,100 L34,69 L71,34 L50,0',
        meepleCentroid: {
          x: 39,
          y: 64
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M0,50 L37,44 L70,62 L100,50',
        meepleCentroid: {
          x: 72,
          y: 60
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road1',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'road0',
      NORTH_LEFT: 'field3',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
      WEST_CENTER: 'road1',
      WEST_LEFT: 'field2',
      WEST_RIGHT: 'field3'
    },
    adjacencies: [
      [
        'road0',
        'field3'
      ],
      [
        'road0',
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
        'road1',
        'field1'
      ],
      [
        'road1',
        'field0'
      ],
      [
        'road1',
        'field3'
      ],
      [
        'road1',
        'field2'
      ]
    ]
  },
  // tb_C
  {
    id: 'tb_C',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_C.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M13,22 L0,0 L100,0 L80,19 L57,28 L31,28 Z',
        hasPennant: false,
        meepleCentroid: {
          x: 46,
          y: 17
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 75,
          y: 76
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 18,
          y: 74
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 19,
          y: 35
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L36,44 L63,61 L71,61',
        meepleCentroid: {
          x: 17,
          y: 48
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M53,23 L61,36 L32,69 L50,100',
        meepleCentroid: {
          x: 34,
          y: 69
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
      SOUTH_CENTER: 'road1',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'road0',
      WEST_LEFT: 'field1',
      WEST_RIGHT: 'field2'
    },
    adjacencies: [
      [
        'city0',
        'field2'
      ],
      [
        'city0',
        'field0'
      ],
      [
        'city0',
        'road1'
      ],
      [
        'road0',
        'field2'
      ],
      [
        'road0',
        'field1'
      ],
      [
        'road0',
        'road1'
      ],
      [
        'road1',
        'field0'
      ],
      [
        'road1',
        'field1'
      ],
      [
        'road1',
        'field2'
      ],
      [
        'field0',
        'road0'
      ]
    ]
  },
  // tb_D
  {
    id: 'tb_D',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_D.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L85,36 L25,67 L16,85 L0,100 Z',
        commodity: 'WHEAT',
        meepleCentroid: {
          x: 46,
          y: 27
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M0,100 L26,83 L51,78 L79,84 L100,100 Z',
        meepleCentroid: {
          x: 49,
          y: 88
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 87,
          y: 36
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 66,
          y: 71
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M49,51 L62,59 L74,52 L100,50',
        meepleCentroid: {
          x: 78,
          y: 52
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
        'field0'
      ],
      [
        'road0',
        'field1'
      ],
      [
        'city1',
        'field1'
      ]
    ]
  },
  // tb_E
  {
    id: 'tb_E',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_E.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L23,17 L41,16 L62,21 L100,0 L100,100 L71,72 L40,69 L0,100 Z',
        commodity: 'WHEAT',
        meepleCentroid: {
          x: 51,
          y: 44
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M52,68 L48,79 L53,89 L49,100',
        meepleCentroid: {
          x: 50,
          y: 82
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,54 L100,54 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 70,
          y: 86
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M30,25 L70,25 L100,0 L100,46 L0,46 L0,0 Z',
        meepleCentroid: {
          x: 34,
          y: 86
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 49,
          y: 17
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0',
      EAST_LEFT: 'city0',
      EAST_RIGHT: 'city0',
      NORTH_CENTER: 'field2',
      NORTH_LEFT: 'field2',
      NORTH_RIGHT: 'field2',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'field2',
        'city0'
      ],
      [
        'city0',
        'field1'
      ],
      [
        'city0',
        'road0'
      ],
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
  // tb_F
  {
    id: 'tb_F',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_F.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L57,47 L57,57 L0,100 Z',
        commodity: 'WHEAT',
        meepleCentroid: {
          x: 38,
          y: 28
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 82,
          y: 57
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 37,
          y: 84
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,60 L68,71 L65,82 L50,100',
        meepleCentroid: {
          x: 67,
          y: 80
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
        'field1'
      ],
      [
        'city0',
        'road0'
      ],
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
  // tb_G
  {
    id: 'tb_G',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_G.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L90,18 L82,33 L57,49 L28,65 Z',
        commodity: 'WHEAT',
        hasPennant: false,
        meepleCentroid: {
          x: 50,
          y: 15
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,100 L0,0 L100,0 L100,100 Z',
        meepleCentroid: {
          x: 63,
          y: 77
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
      SOUTH_CENTER: 'field0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'field0',
        'city0'
      ]
    ]
  },
  // tb_H
  {
    id: 'tb_H',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_H.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z',
        commodity: 'WHEAT',
        meepleCentroid: {
          x: 50,
          y: 34
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M30,75 L50,70 L70,75 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 50,
          y: 85
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
      SOUTH_CENTER: 'field0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ]
    ]
  },
  // tb_I
  {
    id: 'tb_I',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_I.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L86,33 L88,60 L100,100 L61,70 L33,70 L0,100 Z',
        commodity: 'WHEAT',
        meepleCentroid: {
          x: 42,
          y: 34
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L25,25 L30,50 L25,75 L0,100 Z',
        meepleCentroid: {
          x: 91,
          y: 44
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 66,
          y: 86
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 30,
          y: 87
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 49,
          y: 82
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
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
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
      ],
      [
        'city0',
        'road0'
      ],
      [
        'city0',
        'field2'
      ],
      [
        'road0',
        'field2'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // tb_J
  {
    id: 'tb_J',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_J.jpg',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 56,
          y: 22
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 84,
          y: 78
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 28,
          y: 85
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M68,55 L80,50 L87,49 L100,50',
        meepleCentroid: {
          x: 86,
          y: 49
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M52,68 L62,77 L67,84 L49,100',
        meepleCentroid: {
          x: 65,
          y: 86
        }
      },
      {
        id: 'road2',
        type: 'ROAD',
        svgPath: 'M0,50 L10,56 L11,75 L37,68',
        meepleCentroid: {
          x: 14,
          y: 72
        }
      },
      {
        id: 'cloister0',
        type: 'CLOISTER',
        svgPath: 'M40,40 L60,40 L60,60 L40,60 Z',
        meepleCentroid: {
          x: 49,
          y: 54
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
        'cloister0',
        'field2'
      ],
      [
        'cloister0',
        'road2'
      ],
      [
        'road2',
        'field0'
      ],
      [
        'road2',
        'field2'
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
        'road0',
        'field1'
      ],
      [
        'road0',
        'field0'
      ]
    ]
  },
  // tb_K
  {
    id: 'tb_K',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_K.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M36,25 L0,0 L100,0 L100,100 L71,61 L79,52 Z',
        commodity: 'CLOTH',
        meepleCentroid: {
          x: 63,
          y: 22
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 76,
          y: 83
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 27,
          y: 60
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M49,29 L45,38 L68,68 L50,100',
        meepleCentroid: {
          x: 65,
          y: 65
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
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'field1',
      WEST_LEFT: 'field1',
      WEST_RIGHT: 'field1'
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
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // tb_L
  {
    id: 'tb_L',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_L.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L92,16 L84,35 L26,65 L0,100 Z',
        commodity: 'CLOTH',
        hasPennant: false,
        meepleCentroid: {
          x: 45,
          y: 25
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M0,100 L28,82 L56,79 L85,86 L100,100 Z',
        meepleCentroid: {
          x: 51,
          y: 86
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 87,
          y: 37
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 70,
          y: 74
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M49,51 L61,58 L78,52 L100,50',
        meepleCentroid: {
          x: 78,
          y: 52
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
        'field0'
      ],
      [
        'road0',
        'field1'
      ],
      [
        'city1',
        'field1'
      ]
    ]
  },
  // tb_M
  {
    id: 'tb_M',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_M.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L79,32 L59,46 L42,56 L22,66 L15,83 L0,100 Z',
        commodity: 'CLOTH',
        meepleCentroid: {
          x: 47,
          y: 27
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M100,0 L83,28 L82,51 L83,75 L100,100 Z',
        meepleCentroid: {
          x: 88,
          y: 51
        }
      },
      {
        id: 'city2',
        type: 'CITY',
        svgPath: 'M23,82 L50,77 L79,83 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 51,
          y: 88
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 62,
          y: 63
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
      ],
      [
        'field0',
        'city2'
      ]
    ]
  },
  // tb_N
  {
    id: 'tb_N',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_N.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L100,100 L77,85 L49,82 L19,86 Z',
        meepleCentroid: {
          x: 53,
          y: 90
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M41,20 L60,20 L100,0 L100,100 L66,70 L36,70 L0,100 L0,0 Z',
        commodity: 'CLOTH',
        meepleCentroid: {
          x: 52,
          y: 44
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 52,
          y: 11
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 49,
          y: 75
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city1',
      EAST_LEFT: 'city1',
      EAST_RIGHT: 'city1',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'city0',
      SOUTH_LEFT: 'city0',
      SOUTH_RIGHT: 'city0',
      WEST_CENTER: 'city1',
      WEST_LEFT: 'city1',
      WEST_RIGHT: 'city1'
    },
    adjacencies: [
      [
        'field1',
        'city0'
      ],
      [
        'field1',
        'city1'
      ],
      [
        'city1',
        'field0'
      ]
    ]
  },
  // tb_O
  {
    id: 'tb_O',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_O.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L88,15 L88,62 L100,100 L66,70 L36,72 L19,82 Z',
        commodity: 'CLOTH',
        hasPennant: false,
        meepleCentroid: {
          x: 51,
          y: 32
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 91,
          y: 27
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 92,
          y: 65
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 70,
          y: 83
        }
      },
      {
        id: 'field3',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 32,
          y: 84
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M84,47 L100,50',
        meepleCentroid: {
          x: 90,
          y: 46
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M50,69 L53,77 L50,88 L51,100',
        meepleCentroid: {
          x: 50,
          y: 83
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
        'field3'
      ],
      [
        'city0',
        'road1'
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
        'field1'
      ],
      [
        'road0',
        'field0'
      ]
    ]
  },
  // tb_P
  {
    id: 'tb_P',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_P.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M33,83 L70,83 L100,100 L0,100 Z',
        commodity: 'WINE',
        hasPennant: false,
        meepleCentroid: {
          x: 52,
          y: 91
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M24,20 L69,20 L100,0 L100,100 L71,74 L33,72 L0,100 L0,0 Z',
        commodity: 'WINE',
        meepleCentroid: {
          x: 50,
          y: 46
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 49,
          y: 14
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 51,
          y: 74
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city1',
      EAST_LEFT: 'city1',
      EAST_RIGHT: 'city1',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'city0',
      SOUTH_LEFT: 'city0',
      SOUTH_RIGHT: 'city0',
      WEST_CENTER: 'city1',
      WEST_LEFT: 'city1',
      WEST_RIGHT: 'city1'
    },
    adjacencies: [
      [
        'field1',
        'city0'
      ],
      [
        'city1',
        'field0'
      ],
      [
        'city1',
        'field1'
      ]
    ]
  },
  // tb_Q
  {
    id: 'tb_Q',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_Q.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M66,21 L100,0 L100,100 L69,72 L34,74 L0,100 L0,0 L28,19 Z',
        commodity: 'WINE',
        meepleCentroid: {
          x: 51,
          y: 47
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L0,100 L100,100 L100,0 Z',
        meepleCentroid: {
          x: 50,
          y: 15
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L0,100 L100,100 L100,0 Z',
        meepleCentroid: {
          x: 52,
          y: 82
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0',
      EAST_LEFT: 'city0',
      EAST_RIGHT: 'city0',
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
  // tb_R
  {
    id: 'tb_R',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_R.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L35,29 L66,28 L100,0 L100,100 L75,81 L42,81 Z',
        commodity: 'WINE',
        meepleCentroid: {
          x: 53,
          y: 53
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 69,
          y: 15
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 71,
          y: 89
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 35,
          y: 90
        }
      },
      {
        id: 'field3',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 34,
          y: 15
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M53,32 L44,23 L55,11 L50,0',
        meepleCentroid: {
          x: 51,
          y: 17
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M54,77 L50,85 L50,91 L53,100',
        meepleCentroid: {
          x: 50,
          y: 88
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0',
      EAST_LEFT: 'city0',
      EAST_RIGHT: 'city0',
      NORTH_CENTER: 'road0',
      NORTH_LEFT: 'field3',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road1',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
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
        'field3'
      ],
      [
        'city0',
        'field2'
      ],
      [
        'city0',
        'field1'
      ],
      [
        'city0',
        'road1'
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
        'road0',
        'field3'
      ],
      [
        'road0',
        'field0'
      ]
    ]
  },
  // tb_S
  {
    id: 'tb_S',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_S.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M65,20 L100,0 L100,100 L67,73 L33,73 L0,100 L0,0 L28,19 Z',
        commodity: 'WINE',
        meepleCentroid: {
          x: 50,
          y: 47
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M50,70 L47,80 L53,88 L49,100',
        meepleCentroid: {
          x: 51,
          y: 86
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 49,
          y: 14
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 68,
          y: 86
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 30,
          y: 85
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0',
      EAST_LEFT: 'city0',
      EAST_RIGHT: 'city0',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
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
        'field2'
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
        'field2'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // tb_T
  {
    id: 'tb_T',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_T.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M100,0 L81,38 L33,63 L0,100 L0,0 Z',
        commodity: 'WINE',
        meepleCentroid: {
          x: 47,
          y: 27
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 70,
          y: 70
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
      SOUTH_CENTER: 'field0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'field0',
        'city0'
      ]
    ]
  },
  // tb_U
  {
    id: 'tb_U',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_U.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L37,66 L77,43 L100,0 L0,0 Z',
        commodity: 'WINE',
        meepleCentroid: {
          x: 44,
          y: 31
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 89,
          y: 35
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 78,
          y: 76
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 29,
          y: 85
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M66,46 L76,50 L86,52 L100,50',
        meepleCentroid: {
          x: 84,
          y: 51
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M45,58 L40,75 L59,85 L50,100',
        meepleCentroid: {
          x: 55,
          y: 81
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
      SOUTH_CENTER: 'road1',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'road1',
        'field2'
      ],
      [
        'road1',
        'field1'
      ],
      [
        'city0',
        'field2'
      ],
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
      ],
      [
        'city0',
        'road1'
      ],
      [
        'city0',
        'field1'
      ],
      [
        'city0',
        'road0'
      ]
    ]
  },
  // tb_V
  {
    id: 'tb_V',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_V.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L0,100 L41,80 L78,81 L100,100 L100,0 Z',
        commodity: 'WINE',
        meepleCentroid: {
          x: 55,
          y: 42
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 71,
          y: 88
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 30,
          y: 88
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M54,77 L52,83 L49,89 L50,100',
        meepleCentroid: {
          x: 52,
          y: 85
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
        'field1'
      ],
      [
        'city0',
        'road0'
      ],
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
  // tb_W
  {
    id: 'tb_W',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_W.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M100,0 L85,15 L87,56 L100,100 L68,72 L35,71 L0,100 L0,0 Z',
        commodity: 'WINE',
        meepleCentroid: {
          x: 48,
          y: 31
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,40 L50,50 L100,40 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 90,
          y: 28
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 91,
          y: 63
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 63,
          y: 86
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M83,47 L89,47 L95,49 L100,51',
        meepleCentroid: {
          x: 91,
          y: 47
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
      SOUTH_CENTER: 'field2',
      SOUTH_LEFT: 'field2',
      SOUTH_RIGHT: 'field2',
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
        'road0',
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // tb_X
  {
    id: 'tb_X',
    count: 1,
    expansionId: 'traders-builders',
    imageUrl: '/images/TradersAndBuilders_C2/Traders_And_Builders_C2_Tile_X.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L48,42 L32,49 L22,66 L0,100 Z',
        commodity: 'WINE',
        meepleCentroid: {
          x: 41,
          y: 18
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M78,52 L72,43 L100,0 L100,100 L0,100 L22,83 L42,73 L61,65 Z',
        meepleCentroid: {
          x: 77,
          y: 77
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 52,
          y: 51
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
]
