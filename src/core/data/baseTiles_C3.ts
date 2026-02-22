import type { TileDefinition } from '../types/tile.ts'

export const BASE_TILES_C3: TileDefinition[] = [
  // base_c3_A
  {
    id: 'base_c3_A',
    count: 2, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_A.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 75,
          y: 25
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,50 L54,50 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 76,
          y: 81
        }
      },
      {
        id: 'cloister0',
        type: 'CLOISTER',
        svgPath: 'M30,30 L70,30 L70,70 L30,70 Z',
        meepleCentroid: {
          x: 50,
          y: 50
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'field0',
        'road0'
      ],
      [
        'cloister0',
        'road0'
      ],
      [
        'cloister0',
        'field0'
      ]
    ]
  },
  // base_c3_B
  {
    id: 'base_c3_B',
    count: 4, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_B.png',
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 75,
          y: 25
        }
      },
      {
        id: 'cloister0',
        type: 'CLOISTER',
        svgPath: 'M30,30 L70,30 L70,70 L30,70 Z',
        meepleCentroid: {
          x: 50,
          y: 50
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'field0',
        'cloister0'
      ]
    ]
  },
  // base_c3_C
  {
    id: 'base_c3_C',
    count: 1, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_C.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        hasPennant: true,
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
  // base_c3_D
  {
    id: 'base_c3_D',
    count: 4, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_D.png',
    startingTile: true,
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 50,
          y: 20
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,46 L100,46 L100,54 L0,54 Z',
        meepleCentroid: {
          x: 55,
          y: 58
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,54 L100,54 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 50,
          y: 80
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,40 L46,40 L46,46 L0,46 Z',
        meepleCentroid: {
          x: 26,
          y: 31
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0',
      EAST_LEFT: 'field1',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'field0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'road0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field1'
    },
    adjacencies: [
      [
        'city0',
        'field1'
      ],
      [
        'field1',
        'road0'
      ],
      [
        'road0',
        'field0'
      ]
    ]
  },
  // base_c3_E
  {
    id: 'base_c3_E',
    count: 5, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_E.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 50,
          y: 20
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,40 L50,50 L100,40 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 50,
          y: 65
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
      WEST_CENTER: 'field0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ]
    ]
  },
  // base_c3_F
  {
    id: 'base_c3_F',
    count: 2, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_F.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L30,25 L50,30 L70,25 L100,0 L100,100 L70,75 L50,70 L30,75 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 50,
          y: 50
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M40,0 L60,0 L50,50 Z',
        meepleCentroid: {
          x: 50,
          y: 25
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M40,100 L60,100 L50,50 Z',
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
        'field0',
        'city0'
      ],
      [
        'city0',
        'field1'
      ]
    ]
  },
  // base_c3_G
  {
    id: 'base_c3_G',
    count: 1, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_G.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L30,25 L50,30 L70,25 L100,0 L100,100 L70,75 L50,70 L30,75 Z',
        meepleCentroid: {
          x: 50,
          y: 50
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M40,0 L60,0 L50,50 Z',
        meepleCentroid: {
          x: 50,
          y: 25
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M40,100 L60,100 L50,50 Z',
        meepleCentroid: {
          x: 50,
          y: 75
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
        'field0',
        'city0'
      ],
      [
        'city0',
        'field1'
      ]
    ]
  },
  // base_c3_H
  {
    id: 'base_c3_H',
    count: 3, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_H.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M100,0 L100,100 L75,70 L70,50 L75,30 Z',
        meepleCentroid: {
          x: 80,
          y: 50
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M0,0 L0,100 L25,70 L30,50 L25,30 Z',
        meepleCentroid: {
          x: 20,
          y: 50
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L60,0 L50,30 L50,70 L60,100 L0,100 Z',
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
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'field0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'city1',
      WEST_LEFT: 'city1',
      WEST_RIGHT: 'city1'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ],
      [
        'field0',
        'city1'
      ]
    ]
  },
  // base_c3_I
  {
    id: 'base_c3_I',
    count: 2, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_I.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M100,0 L100,100 L75,70 L70,50 L75,30 Z',
        meepleCentroid: {
          x: 80,
          y: 50
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M0,100 L100,100 L70,75 L50,70 L30,75 Z',
        meepleCentroid: {
          x: 50,
          y: 21
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L60,0 L50,50 L0,60 Z',
        meepleCentroid: {
          x: 41,
          y: 56
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0',
      EAST_LEFT: 'city0',
      EAST_RIGHT: 'city0',
      NORTH_CENTER: 'city1',
      NORTH_LEFT: 'city1',
      NORTH_RIGHT: 'city1',
      SOUTH_CENTER: 'field0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'city1',
        'field0'
      ],
      [
        'field0',
        'city0'
      ]
    ]
  },
  // base_c3_J
  {
    id: 'base_c3_J',
    count: 3, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_J.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M100,0 L100,100 L75,70 L70,50 L75,30 Z',
        meepleCentroid: {
          x: 55,
          y: 20
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,46 L54,46 L54,100 L46,100 L46,54 L0,54 Z',
        meepleCentroid: {
          x: 40,
          y: 63
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L60,0 L50,50 L0,54 Z',
        meepleCentroid: {
          x: 17,
          y: 54
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 77,
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
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'field0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ],
      [
        'field0',
        'road0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // base_c3_K
  {
    id: 'base_c3_K',
    count: 3, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_K.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 50,
          y: 20
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,46 L54,46 L54,100 L46,100 L46,54 L0,54 Z',
        meepleCentroid: {
          x: 53,
          y: 52
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M54,46 L100,46 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 75,
          y: 75
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 25,
          y: 75
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
  // base_c3_L
  {
    id: 'base_c3_L',
    count: 3, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_L.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 50,
          y: 20
        }
      },
      {
        id: 'road_e',
        type: 'ROAD',
        svgPath: 'M54,46 L100,46 L100,54 L54,54 Z',
        meepleCentroid: {
          x: 79,
          y: 46
        }
      },
      {
        id: 'road_s',
        type: 'ROAD',
        svgPath: 'M46,54 L54,54 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 45,
          y: 77
        }
      },
      {
        id: 'road_w',
        type: 'ROAD',
        svgPath: 'M0,46 L46,46 L46,54 L0,54 Z',
        meepleCentroid: {
          x: 21,
          y: 50
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M54,54 L100,54 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 75,
          y: 75
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 24,
          y: 74
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M46,40 L54,40 L54,46 L100,46 L100,40 Q75,35 54,46 L46,46 L0,40 Q25,35 46,40 Z',
        meepleCentroid: {
          x: 50,
          y: 37
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road_e',
      EAST_LEFT: 'field2',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'city0',
      NORTH_LEFT: 'city0',
      NORTH_RIGHT: 'city0',
      SOUTH_CENTER: 'road_s',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'road_w',
      WEST_LEFT: 'field1',
      WEST_RIGHT: 'field2'
    },
    adjacencies: [
      [
        'city0',
        'field2'
      ],
      [
        'road_w',
        'field2'
      ],
      [
        'road_e',
        'field2'
      ],
      [
        'road_e',
        'field0'
      ],
      [
        'road_s',
        'field0'
      ],
      [
        'road_s',
        'field1'
      ],
      [
        'road_w',
        'field1'
      ]
    ]
  },
  // base_c3_M
  {
    id: 'base_c3_M',
    count: 2, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_M.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L70,25 L40,40 L30,75 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 67,
          y: 29
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M51,54 L100,40 L100,100 L0,100 L0,60 Z',
        meepleCentroid: {
          x: 33,
          y: 69
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
      WEST_CENTER: 'field0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ]
    ]
  },
  // base_c3_N
  {
    id: 'base_c3_N',
    count: 3, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_N.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L70,25 L40,40 L30,75 Z',
        meepleCentroid: {
          x: 69,
          y: 30
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M50,50 L100,40 L100,100 L0,100 L0,60 Z',
        meepleCentroid: {
          x: 32,
          y: 69
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
      WEST_CENTER: 'field0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'city0',
        'field0'
      ]
    ]
  },
  // base_c3_O
  {
    id: 'base_c3_O',
    count: 2, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_O.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L70,25 L40,40 L30,75 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 32,
          y: 29
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,46 L100,46 L100,54 L54,54 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 58,
          y: 71
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M54,50 L100,40 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 79,
          y: 77
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,60 L46,50 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 60,
          y: 53
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0',
      EAST_LEFT: 'field1',
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
        'road0',
        'field1'
      ],
      [
        'road0',
        'field0'
      ]
    ]
  },
  // base_c3_P
  {
    id: 'base_c3_P',
    count: 3, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_P.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L70,25 L40,40 L30,75 Z',
        meepleCentroid: {
          x: 25,
          y: 25
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,46 L100,46 L100,54 L54,54 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 66,
          y: 70
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M54,50 L100,40 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 80,
          y: 77
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,60 L46,50 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 57,
          y: 52
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road0',
      EAST_LEFT: 'field1',
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
        'road0',
        'field1'
      ],
      [
        'road0',
        'field0'
      ],
      [
        'city0',
        'field1'
      ]
    ]
  },
  // base_c3_Q
  {
    id: 'base_c3_Q',
    count: 1, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_Q.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 49,
          y: 29
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,60 L50,50 L100,60 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 50,
          y: 80
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
  // base_c3_R
  {
    id: 'base_c3_R',
    count: 3, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_R.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z',
        meepleCentroid: {
          x: 52,
          y: 31
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,60 L50,50 L100,60 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 50,
          y: 80
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
  // base_c3_S
  {
    id: 'base_c3_S',
    count: 2, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_S.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 51,
          y: 30
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,70 L54,70 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 52,
          y: 80
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,60 L46,60 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 25,
          y: 75
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M54,60 L100,60 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 75,
          y: 75
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
  // base_c3_T
  {
    id: 'base_c3_T',
    count: 1, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_T.png',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z',
        meepleCentroid: {
          x: 49,
          y: 33
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,70 L54,70 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 50,
          y: 75
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,60 L46,60 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 25,
          y: 75
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M54,60 L100,60 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 75,
          y: 75
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
        'city0',
        'field1'
      ],
      [
        'city0',
        'road0'
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
  // base_c3_U
  {
    id: 'base_c3_U',
    count: 8, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_U.png',
    segments: [
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,0 L54,0 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 50,
          y: 50
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M54,0 L100,0 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 80,
          y: 50
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L46,0 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 20,
          y: 50
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'road0',
      NORTH_LEFT: 'field1',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'field1',
      WEST_LEFT: 'field1',
      WEST_RIGHT: 'field1'
    },
    adjacencies: [
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
  // base_c3_V
  {
    id: 'base_c3_V',
    count: 9, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_V.png',
    segments: [
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,46 L54,46 L54,100 L46,100 L46,54 L0,54 Z',
        meepleCentroid: {
          x: 36,
          y: 60
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L54,100 L46,54 L0,54 Z',
        meepleCentroid: {
          x: 70,
          y: 32
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 23,
          y: 74
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field0',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field0',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field0',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'road0',
      WEST_LEFT: 'field1',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'field1',
        'road0'
      ],
      [
        'field0',
        'road0'
      ]
    ]
  },
  // base_c3_W
  {
    id: 'base_c3_W',
    count: 4, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_W.png',
    segments: [
      {
        id: 'road_e',
        type: 'ROAD',
        svgPath: 'M54,46 L100,46 L100,54 L54,54 Z',
        meepleCentroid: {
          x: 80,
          y: 55
        }
      },
      {
        id: 'road_s',
        type: 'ROAD',
        svgPath: 'M46,54 L54,54 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 50,
          y: 75
        }
      },
      {
        id: 'road_w',
        type: 'ROAD',
        svgPath: 'M0,46 L46,46 L46,54 L0,54 Z',
        meepleCentroid: {
          x: 21,
          y: 52
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,46 L54,46 L54,46 L50,50 L46,46 L0,46 Z',
        meepleCentroid: {
          x: 50,
          y: 20
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M54,54 L100,54 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 75,
          y: 75
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 25,
          y: 75
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road_e',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road_s',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
      WEST_CENTER: 'road_w',
      WEST_LEFT: 'field2',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'field0',
        'road_w'
      ],
      [
        'field0',
        'road_e'
      ],
      [
        'field1',
        'road_e'
      ],
      [
        'field1',
        'road_s'
      ],
      [
        'field2',
        'road_s'
      ],
      [
        'field2',
        'road_w'
      ]
    ]
  },
  // base_c3_X
  {
    id: 'base_c3_X',
    count: 1, expansionId: 'base-c3',
    imageUrl: '/images/BaseGame_C3/Base_Game_C3_Tile_X.png',
    segments: [
      {
        id: 'road_n',
        type: 'ROAD',
        svgPath: 'M46,0 L54,0 L54,46 L46,46 Z',
        meepleCentroid: {
          x: 50,
          y: 25
        }
      },
      {
        id: 'road_e',
        type: 'ROAD',
        svgPath: 'M54,46 L100,46 L100,54 L54,54 Z',
        meepleCentroid: {
          x: 75,
          y: 50
        }
      },
      {
        id: 'road_s',
        type: 'ROAD',
        svgPath: 'M46,54 L54,54 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 50,
          y: 75
        }
      },
      {
        id: 'road_w',
        type: 'ROAD',
        svgPath: 'M0,46 L46,46 L46,54 L0,54 Z',
        meepleCentroid: {
          x: 25,
          y: 50
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M54,0 L100,0 L100,46 L54,46 Z',
        meepleCentroid: {
          x: 75,
          y: 25
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M54,54 L100,54 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 75,
          y: 75
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,54 L46,54 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 25,
          y: 75
        }
      },
      {
        id: 'field3',
        type: 'FIELD',
        svgPath: 'M0,0 L46,0 L46,46 L0,46 Z',
        meepleCentroid: {
          x: 25,
          y: 25
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road_e',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'road_n',
      NORTH_LEFT: 'field3',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road_s',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
      WEST_CENTER: 'road_w',
      WEST_LEFT: 'field2',
      WEST_RIGHT: 'field3'
    },
    adjacencies: [
      [
        'field0',
        'road_e'
      ],
      [
        'field1',
        'road_e'
      ],
      [
        'field1',
        'road_s'
      ],
      [
        'field2',
        'road_s'
      ],
      [
        'field2',
        'road_w'
      ],
      [
        'field3',
        'road_w'
      ],
      [
        'field3',
        'road_n'
      ],
      [
        'field0',
        'road_n'
      ]
    ]
  },
]
