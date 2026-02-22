import type { TileDefinition } from '../types/tile.ts'

export const BASE_TILES: TileDefinition[] = [
  // base_A
  {
    id: 'base_A',
    count: 2,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_A.jpg',
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
  // base_B
  {
    id: 'base_B',
    count: 4,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_B.jpg',
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
  // base_C
  {
    id: 'base_C',
    count: 1,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_C.jpg',
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
  // base_D
  {
    id: 'base_D',
    count: 4,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_D.jpg',
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
  // base_E
  {
    id: 'base_E',
    count: 5,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_E.jpg',
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
  // base_F
  {
    id: 'base_F',
    count: 2,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_F.jpg',
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
  // base_G
  {
    id: 'base_G',
    count: 1,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_G.jpg',
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
  // base_H
  {
    id: 'base_H',
    count: 3,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_H.jpg',
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
  // base_I
  {
    id: 'base_I',
    count: 2,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_I.jpg',
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
  // base_J
  {
    id: 'base_J',
    count: 3,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_J.jpg',
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
  // base_K
  {
    id: 'base_K',
    count: 3,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_K.jpg',
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
  // base_L
  {
    id: 'base_L',
    count: 3,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_L.jpg',
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
  // base_M
  {
    id: 'base_M',
    count: 2,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_M.jpg',
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
  // base_N
  {
    id: 'base_N',
    count: 3,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_N.jpg',
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
  // base_O
  {
    id: 'base_O',
    count: 2,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_O.jpg',
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
  // base_P
  {
    id: 'base_P',
    count: 3,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_P.jpg',
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
  // base_Q
  {
    id: 'base_Q',
    count: 1,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_Q.jpg',
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
  // base_R
  {
    id: 'base_R',
    count: 3,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_R.jpg',
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
  // base_S
  {
    id: 'base_S',
    count: 2,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_S.jpg',
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
  // base_T
  {
    id: 'base_T',
    count: 1,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_T.jpg',
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
  // base_U
  {
    id: 'base_U',
    count: 8,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_U.jpg',
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
  // base_V
  {
    id: 'base_V',
    count: 9,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_V.jpg',
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
  // base_W
  {
    id: 'base_W',
    count: 4,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_W.jpg',
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
  // base_X
  {
    id: 'base_X',
    count: 1,
    imageUrl: '/images/BaseGame_C2/Base_Game_C2_Tile_X.jpg',
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
