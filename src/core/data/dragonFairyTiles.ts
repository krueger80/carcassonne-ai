import type { TileDefinition } from '../types/tile.ts'

export const DF_TILES: TileDefinition[] = [
  // df_1
  {
    id: 'df_1',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_1.jpg',
    isDragonHoard: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 71,
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
    }
  },
  // df_2
  {
    id: 'df_2',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_2.jpg',
    isDragonHoard: true,
    segments: [
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M51,0 L49,13 L33,23 L38,35 L19,46 L26,64 L51,76 L50,100',
        meepleCentroid: {
          x: 25,
          y: 61
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L46,0 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 81,
          y: 67
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M54,0 L100,0 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 18,
          y: 81
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'field1',
      EAST_LEFT: 'field1',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'road0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field1',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'field0',
      WEST_LEFT: 'field0',
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
  // df_C
  {
    id: 'df_C',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_C.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 31,
          y: 76
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 81,
          y: 84
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M50,100 L50,82 L78,54 L100,50',
        meepleCentroid: {
          x: 69,
          y: 71
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L81,31 L80,42 L72,45 L48,63 L23,73 L0,100 Z',
        meepleCentroid: {
          x: 30,
          y: 35
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
  // df_D
  {
    id: 'df_D',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_D.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 52,
          y: 83
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L100,100 L71,72 L51,70 L32,74 L15,88 Z',
        meepleCentroid: {
          x: 51,
          y: 36
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
        'field0',
        'city0'
      ]
    ]
  },
  // df_E
  {
    id: 'df_E',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_E.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L0,0 L100,0 L87,11 L91,27 L91,66 L100,89 L100,100 L65,72 L50,70 L31,74 Z',
        meepleCentroid: {
          x: 43,
          y: 32
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,100 L0,0 L100,0 L100,100 Z',
        meepleCentroid: {
          x: 87,
          y: 43
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 49,
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
  // df_F
  {
    id: 'df_F',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_F.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L21,51 L30,61 L0,100 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 32,
          y: 18
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 91,
          y: 45
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M72,39 L100,0 L100,11 L84,38 L100,88 L100,100 L0,100 L69,51 Z',
        meepleCentroid: {
          x: 71,
          y: 81
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 49,
          y: 48
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
        'field1',
        'city0'
      ],
      [
        'field1',
        'city1'
      ],
      [
        'field0',
        'city1'
      ]
    ]
  },
  // df_G
  {
    id: 'df_G',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_G.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,46 L54,46 L54,100 L46,100 L46,54 L0,54 Z',
        meepleCentroid: {
          x: 43,
          y: 60
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L54,100 L54,46 L0,46 Z',
        meepleCentroid: {
          x: 75,
          y: 25
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
        'road0',
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // df_H
  {
    id: 'df_H',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_H.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 36,
          y: 22
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 76,
          y: 77
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 20,
          y: 77
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 81,
          y: 49
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 48,
          y: 78
        }
      },
      {
        id: 'road2',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 18,
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
        'field0',
        'road0'
      ],
      [
        'field0',
        'road2'
      ],
      [
        'field2',
        'road2'
      ],
      [
        'field2',
        'road1'
      ],
      [
        'field1',
        'road1'
      ],
      [
        'field1',
        'road0'
      ]
    ]
  },
  // df_I
  {
    id: 'df_I',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_I.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 49,
          y: 60
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L86,17 L70,25 L53,21 L33,27 L29,22 L15,14 Z',
        meepleCentroid: {
          x: 51,
          y: 16
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
        'field0',
        'city0'
      ]
    ]
  },
  // df_J
  {
    id: 'df_J',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_J.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 71,
          y: 68
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L87,29 L81,34 L74,37 L29,61 L22,66 L0,100 Z',
        meepleCentroid: {
          x: 33,
          y: 29
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
  // df_K
  {
    id: 'df_K',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_K.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 50,
          y: 18
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,30 L54,30 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 41,
          y: 63
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L30,25 L46,30 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 73,
          y: 60
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M100,0 L70,25 L54,30 L54,100 L100,100 Z',
        meepleCentroid: {
          x: 19,
          y: 73
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
  // df_L
  {
    id: 'df_L',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_L.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L0,100 L25,70 L30,50 L25,30 Z',
        meepleCentroid: {
          x: 50,
          y: 18
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,0 L54,0 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 55,
          y: 65
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M25,30 L46,0 L46,100 L25,70 Z',
        meepleCentroid: {
          x: 34,
          y: 48
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M54,0 L100,0 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 79,
          y: 77
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
        'road0',
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // df_M
  {
    id: 'df_M',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_M.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        hasPennant: true,
        meepleCentroid: {
          x: 49,
          y: 54
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L30,25 L0,46 Z',
        meepleCentroid: {
          x: 45,
          y: 16
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M100,0 L70,25 L100,46 Z',
        meepleCentroid: {
          x: 51,
          y: 87
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
  // df_N
  {
    id: 'df_N',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_N.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 54,
          y: 18
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L30,25 L30,75 L0,100 Z',
        meepleCentroid: {
          x: 38,
          y: 89
        }
      },
      {
        id: 'cloister0',
        type: 'CLOISTER',
        svgPath: 'M40,40 L60,40 L60,60 L40,60 Z',
        meepleCentroid: {
          x: 51,
          y: 64
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
      ],
      [
        'cloister0',
        'field0'
      ]
    ]
  },
  // df_O
  {
    id: 'df_O',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_O.jpg',
    hasDragon: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 51,
          y: 23
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,50 L54,50 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 86,
          y: 53
        }
      },
      {
        id: 'cloister0',
        type: 'CLOISTER',
        svgPath: 'M30,30 L70,30 L70,70 L30,70 Z',
        meepleCentroid: {
          x: 54,
          y: 63
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 59,
          y: 86
        }
      },
      {
        id: 'road2',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 18,
          y: 65
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 83,
          y: 78
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 18,
          y: 89
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
        'road1'
      ],
      [
        'cloister0',
        'road2'
      ],
      [
        'cloister0',
        'field1'
      ],
      [
        'cloister0',
        'field2'
      ],
      [
        'field1',
        'road0'
      ],
      [
        'field1',
        'road1'
      ],
      [
        'field2',
        'road1'
      ],
      [
        'field2',
        'road2'
      ],
      [
        'field0',
        'road2'
      ],
      [
        'field0',
        'road0'
      ]
    ]
  },
  // df_P
  {
    id: 'df_P',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_P.jpg',
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M100,0 L100,100 L75,70 L70,50 L75,30 Z',
        meepleCentroid: {
          x: 53,
          y: 46
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,0 L54,0 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 51,
          y: 23
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L46,0 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 34,
          y: 13
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M54,0 L75,30 L75,70 L54,100 Z',
        meepleCentroid: {
          x: 44,
          y: 79
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'city0',
      EAST_LEFT: 'city0',
      EAST_RIGHT: 'city0',
      NORTH_CENTER: 'road0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field1',
      WEST_CENTER: 'city0',
      WEST_LEFT: 'city0',
      WEST_RIGHT: 'city0'
    },
    adjacencies: [
      [
        'field0',
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
        'field0',
        'city0'
      ]
    ]
  },
  // df_Q
  {
    id: 'df_Q',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_Q.jpg',
    hasMagicPortal: true,
    segments: [
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,0 L54,0 L54,46 L46,46 Z',
        meepleCentroid: {
          x: 16,
          y: 54
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M54,46 L100,46 L100,54 L54,54 Z',
        meepleCentroid: {
          x: 86,
          y: 50
        }
      },
      {
        id: 'road2',
        type: 'ROAD',
        svgPath: 'M46,54 L54,54 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 46,
          y: 79
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L46,0 L46,46 L100,46 L100,100 L54,100 L54,54 L0,54 Z',
        meepleCentroid: {
          x: 48,
          y: 21
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M54,0 L100,0 L100,46 L54,46 Z',
        meepleCentroid: {
          x: 80,
          y: 75
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M46,54 L46,100 L0,100 L0,54 Z',
        meepleCentroid: {
          x: 25,
          y: 75
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road1',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field1',
      NORTH_CENTER: 'field0',
      NORTH_LEFT: 'field0',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road2',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field2',
      WEST_CENTER: 'road0',
      WEST_LEFT: 'field2',
      WEST_RIGHT: 'field0'
    },
    adjacencies: [
      [
        'field1',
        'road1'
      ],
      [
        'field1',
        'road2'
      ],
      [
        'road0',
        'field0'
      ],
      [
        'road0',
        'field2'
      ],
      [
        'road2',
        'field2'
      ],
      [
        'field0',
        'road1'
      ]
    ]
  },
  // df_R
  {
    id: 'df_R',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_R.jpg',
    hasMagicPortal: true,
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 51,
          y: 27
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 40,
          y: 84
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
  // df_S
  {
    id: 'df_S',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_S.jpg',
    hasMagicPortal: true,
    segments: [
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M46,0 L54,0 L54,100 L46,100 Z',
        meepleCentroid: {
          x: 43,
          y: 59
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L46,0 L46,100 L0,100 Z',
        meepleCentroid: {
          x: 55,
          y: 42
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M54,0 L100,0 L100,100 L54,100 Z',
        meepleCentroid: {
          x: 24,
          y: 75
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 50,
          y: 16
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
  // df_T
  {
    id: 'df_T',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_T.jpg',
    hasMagicPortal: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 17,
          y: 72
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M50,50 L100,46 L100,54 L50,50 Z',
        meepleCentroid: {
          x: 75,
          y: 50
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 77,
          y: 78
        }
      },
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 49,
          y: 21
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
        'road0',
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // df_U
  {
    id: 'df_U',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_U.jpg',
    hasMagicPortal: true,
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,100 L100,100 L70,75 L50,70 L30,75 Z',
        meepleCentroid: {
          x: 33,
          y: 30
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,46 L100,46 L100,54 L0,54 Z',
        meepleCentroid: {
          x: 68,
          y: 69
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,46 L0,46 Z',
        meepleCentroid: {
          x: 80,
          y: 43
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,54 L30,75 L70,75 L100,54 Z',
        meepleCentroid: {
          x: 80,
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
      SOUTH_CENTER: 'road0',
      SOUTH_LEFT: 'field1',
      SOUTH_RIGHT: 'field0',
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
        'field0'
      ]
    ]
  },
  // df_V
  {
    id: 'df_V',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_V.jpg',
    hasMagicPortal: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 46,
          y: 51
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 16,
          y: 23
        }
      },
      {
        id: 'field2',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 85,
          y: 83
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 30,
          y: 30
        }
      },
      {
        id: 'road1',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 74,
          y: 69
        }
      }
    ],
    edgePositionToSegment: {
      EAST_CENTER: 'road1',
      EAST_LEFT: 'field0',
      EAST_RIGHT: 'field2',
      NORTH_CENTER: 'road0',
      NORTH_LEFT: 'field1',
      NORTH_RIGHT: 'field0',
      SOUTH_CENTER: 'road1',
      SOUTH_LEFT: 'field2',
      SOUTH_RIGHT: 'field0',
      WEST_CENTER: 'road0',
      WEST_LEFT: 'field0',
      WEST_RIGHT: 'field1'
    },
    adjacencies: [
      [
        'field1',
        'road0'
      ],
      [
        'field0',
        'road0'
      ],
      [
        'field0',
        'road1'
      ],
      [
        'field2',
        'road1'
      ]
    ]
  },
  // df_W
  {
    id: 'df_W',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_W.jpg',
    isDragonHoard: true,
    segments: [
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 17,
          y: 83
        }
      },
      {
        id: 'field1',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 78,
          y: 60
        }
      },
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,50 L33,50 L67,50 L100,50',
        meepleCentroid: {
          x: 30,
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
        'road0',
        'field0'
      ],
      [
        'road0',
        'field1'
      ]
    ]
  },
  // df_X
  {
    id: 'df_X',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_X.jpg',
    isDragonHoard: true,
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 53,
          y: 11
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,100 L0,100 Z',
        meepleCentroid: {
          x: 69,
          y: 68
        }
      },
      {
        id: 'city1',
        type: 'CITY',
        svgPath: 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z',
        meepleCentroid: {
          x: 17,
          y: 54
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
      WEST_CENTER: 'city1',
      WEST_LEFT: 'city1',
      WEST_RIGHT: 'city1'
    },
    adjacencies: [
      [
        'field0',
        'city1'
      ],
      [
        'field0',
        'city0'
      ]
    ]
  },
  // df_Y
  {
    id: 'df_Y',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_Y.jpg',
    isDragonHoard: true,
    segments: [
      {
        id: 'city0',
        type: 'CITY',
        svgPath: 'M0,0 L100,0 L70,25 L50,30 L30,25 Z',
        meepleCentroid: {
          x: 54,
          y: 21
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M30,25 L54,46 L54,100 L0,100 L0,0 Z',
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
        'city0'
      ]
    ]
  },
  // df_Z
  {
    id: 'df_Z',
    count: 1,
    expansionId: 'dragon-fairy',
    imageUrl: '/images/DragonAndFairy_C31/Dragon_And_Fairy_C31_Tile_Z.jpg',
    isDragonHoard: true,
    segments: [
      {
        id: 'road0',
        type: 'ROAD',
        svgPath: 'M0,46 L100,46 L100,54 L0,54 Z',
        meepleCentroid: {
          x: 62,
          y: 81
        }
      },
      {
        id: 'field0',
        type: 'FIELD',
        svgPath: 'M0,0 L100,0 L100,46 L0,46 Z',
        meepleCentroid: {
          x: 50,
          y: 20
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
      ]
    ]
  },
]
