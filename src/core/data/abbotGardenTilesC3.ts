import type { TileDefinition } from '../types/tile.ts'

/**
 * Abbot Garden variant tiles for Base Game C3 edition.
 * Each is a copy of the original tile with a garden0 segment added.
 * The user will map segments via the debug configurator tool.
 * These tiles are part of the base game and always included in the bag.
 * In C3, the garden artwork is already on the original tile image.
 */
export const ABBOT_C3_GARDEN_TILES: TileDefinition[] = [
  {
    "id": "base3_E_garden",
    "imageUrl": "/images/BaseGame_C3/Base_Game_C3_Tile_E.png",
    "count": 1,
    "expansionId": "base-c3",
    "version": "C3",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M0,0 L100,0 L73,41 L35,57 L32,37 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 20
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M35,57 L73,40 L100,0 L100,100 L0,100 L0,0 L32,37 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 71
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M30,60 L70,60 L70,90 L30,90 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 75
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "field0",
      "WEST_LEFT": "field0",
      "EAST_RIGHT": "field0",
      "NORTH_LEFT": "city0",
      "SOUTH_LEFT": "field0",
      "WEST_RIGHT": "field0",
      "EAST_CENTER": "field0",
      "NORTH_RIGHT": "city0",
      "SOUTH_RIGHT": "field0",
      "WEST_CENTER": "field0",
      "NORTH_CENTER": "city0",
      "SOUTH_CENTER": "field0"
    },
    "adjacencies": [
      [
        "city0",
        "field0"
      ],
      [
        "garden0",
        "field0"
      ]
    ]
  },
  {
    "id": "base3_H_garden",
    "imageUrl": "/images/BaseGame_C3/Base_Game_C3_Tile_H.png",
    "count": 1,
    "expansionId": "base-c3",
    "version": "C3",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M100,0 L67,22 L66,33 L26,31 L0,0 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 15
        }
      },
      {
        "id": "city1",
        "type": "CITY",
        "svgPath": "M0,100 L0,100 L100,100 L67,72 L19,77 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 85
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M0,0 L0,100 L19,77 L44,74 L67,72 L100,100 L100,0 L66,22 L66,33 L26,31 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 50
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M35,40 L65,40 L65,65 L35,65 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 52
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "field0",
      "WEST_LEFT": "field0",
      "EAST_RIGHT": "field0",
      "NORTH_LEFT": "city0",
      "SOUTH_LEFT": "city1",
      "WEST_RIGHT": "field0",
      "EAST_CENTER": "field0",
      "NORTH_RIGHT": "city0",
      "SOUTH_RIGHT": "city1",
      "WEST_CENTER": "field0",
      "NORTH_CENTER": "city0",
      "SOUTH_CENTER": "city1"
    },
    "adjacencies": [
      [
        "city0",
        "field0"
      ],
      [
        "field0",
        "city1"
      ],
      [
        "garden0",
        "field0"
      ]
    ]
  },
  {
    "id": "base3_I_garden",
    "imageUrl": "/images/BaseGame_C3/Base_Game_C3_Tile_I.png",
    "count": 1,
    "expansionId": "base-c3",
    "version": "C3",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M0,0 L0,100 L23,79 L29,47 L24,24 Z",
        "meepleCentroid": {
          "x": 14,
          "y": 47
        }
      },
      {
        "id": "city1",
        "type": "CITY",
        "svgPath": "M0,0 L100,0 L78,22 L50,23 L36,25 Z",
        "meepleCentroid": {
          "x": 51,
          "y": 14
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M78,22 L100,0 L100,100 L0,100 L23,79 L29,47 L27,36 L24,24 L0,0 L36,25 L50,22 Z",
        "meepleCentroid": {
          "x": 60,
          "y": 60
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M45,45 L80,45 L80,75 L45,75 Z",
        "meepleCentroid": {
          "x": 62,
          "y": 60
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "field0",
      "WEST_LEFT": "city0",
      "EAST_RIGHT": "field0",
      "NORTH_LEFT": "city1",
      "SOUTH_LEFT": "field0",
      "WEST_RIGHT": "city0",
      "EAST_CENTER": "field0",
      "NORTH_RIGHT": "city1",
      "SOUTH_RIGHT": "field0",
      "WEST_CENTER": "city0",
      "NORTH_CENTER": "city1",
      "SOUTH_CENTER": "field0"
    },
    "adjacencies": [
      [
        "city1",
        "field0"
      ],
      [
        "field0",
        "city0"
      ],
      [
        "garden0",
        "field0"
      ]
    ]
  },
  {
    "id": "base3_M_garden",
    "imageUrl": "/images/BaseGame_C3/Base_Game_C3_Tile_M.png",
    "count": 1,
    "expansionId": "base-c3",
    "version": "C3",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M61,58 L20,37 L0,0 L100,0 L100,100 L80,77 L60,71 Z",
        "hasPennant": true,
        "meepleCentroid": {
          "x": 67,
          "y": 29
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M20,38 L61,58 L61,72 L80,77 L100,100 L0,100 L0,0 Z",
        "meepleCentroid": {
          "x": 33,
          "y": 69
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M15,55 L45,55 L45,85 L15,85 Z",
        "meepleCentroid": {
          "x": 30,
          "y": 70
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "city0",
      "WEST_LEFT": "field0",
      "EAST_RIGHT": "city0",
      "NORTH_LEFT": "city0",
      "SOUTH_LEFT": "field0",
      "WEST_RIGHT": "field0",
      "EAST_CENTER": "city0",
      "NORTH_RIGHT": "city0",
      "SOUTH_RIGHT": "field0",
      "WEST_CENTER": "field0",
      "NORTH_CENTER": "city0",
      "SOUTH_CENTER": "field0"
    },
    "adjacencies": [
      [
        "city0",
        "field0"
      ],
      [
        "garden0",
        "field0"
      ]
    ]
  },
  {
    "id": "base3_N_garden",
    "imageUrl": "/images/BaseGame_C3/Base_Game_C3_Tile_N.png",
    "count": 1,
    "expansionId": "base-c3",
    "version": "C3",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M63,60 L18,35 L0,0 L100,0 L100,100 L82,78 L61,71 Z",
        "meepleCentroid": {
          "x": 69,
          "y": 30
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M18,36 L62,60 L60,71 L81,78 L100,100 L0,100 L0,0 Z",
        "meepleCentroid": {
          "x": 32,
          "y": 69
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M15,55 L45,55 L45,85 L15,85 Z",
        "meepleCentroid": {
          "x": 30,
          "y": 70
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "city0",
      "WEST_LEFT": "field0",
      "EAST_RIGHT": "city0",
      "NORTH_LEFT": "city0",
      "SOUTH_LEFT": "field0",
      "WEST_RIGHT": "field0",
      "EAST_CENTER": "city0",
      "NORTH_RIGHT": "city0",
      "SOUTH_RIGHT": "field0",
      "WEST_CENTER": "field0",
      "NORTH_CENTER": "city0",
      "SOUTH_CENTER": "field0"
    },
    "adjacencies": [
      [
        "city0",
        "field0"
      ],
      [
        "garden0",
        "field0"
      ]
    ]
  },
  {
    "id": "base3_R_garden",
    "imageUrl": "/images/BaseGame_C3/Base_Game_C3_Tile_R.png",
    "count": 1,
    "expansionId": "base-c3",
    "version": "C3",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M0,100 L0,0 L100,0 L100,100 L70,75 L50,70 L30,75 Z",
        "meepleCentroid": {
          "x": 52,
          "y": 31
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M30,75 L50,70 L71,75 L100,100 L0,100 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 80
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M35,78 L65,78 L65,95 L35,95 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 87
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "city0",
      "WEST_LEFT": "city0",
      "EAST_RIGHT": "city0",
      "NORTH_LEFT": "city0",
      "SOUTH_LEFT": "field0",
      "WEST_RIGHT": "city0",
      "EAST_CENTER": "city0",
      "NORTH_RIGHT": "city0",
      "SOUTH_RIGHT": "field0",
      "WEST_CENTER": "city0",
      "NORTH_CENTER": "city0",
      "SOUTH_CENTER": "field0"
    },
    "adjacencies": [
      [
        "city0",
        "field0"
      ],
      [
        "garden0",
        "field0"
      ]
    ]
  },
  {
    "id": "base3_U_garden",
    "imageUrl": "/images/BaseGame_C3/Base_Game_C3_Tile_U.png",
    "count": 1,
    "expansionId": "base-c3",
    "version": "C3",
    "segments": [
      {
        "id": "road0",
        "type": "ROAD",
        "svgPath": "M49,0 L48,14 L42,26 L47,38 L40,52 L43,65 L54,75 L51,86 L51,100",
        "meepleCentroid": {
          "x": 42,
          "y": 50
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M58,80 L58,68 L47,54 L54,38 L48,26 L55,11 L55,0 L100,0 L100,100 L54,100 Z",
        "meepleCentroid": {
          "x": 73,
          "y": 50
        }
      },
      {
        "id": "field1",
        "type": "FIELD",
        "svgPath": "M0,0 L43,0 L44,9 L38,23 L42,37 L36,56 L41,69 L49,78 L46,100 L0,100 Z",
        "meepleCentroid": {
          "x": 20,
          "y": 50
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M60,25 L90,25 L90,55 L60,55 Z",
        "meepleCentroid": {
          "x": 75,
          "y": 40
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "field0",
      "WEST_LEFT": "field1",
      "EAST_RIGHT": "field0",
      "NORTH_LEFT": "field1",
      "SOUTH_LEFT": "field0",
      "WEST_RIGHT": "field1",
      "EAST_CENTER": "field0",
      "NORTH_RIGHT": "field0",
      "SOUTH_RIGHT": "field1",
      "WEST_CENTER": "field1",
      "NORTH_CENTER": "road0",
      "SOUTH_CENTER": "road0"
    },
    "adjacencies": [
      [
        "field0",
        "road0"
      ],
      [
        "field1",
        "road0"
      ],
      [
        "garden0",
        "field0"
      ]
    ]
  },
  {
    "id": "base3_V_garden",
    "imageUrl": "/images/BaseGame_C3/Base_Game_C3_Tile_V.png",
    "count": 1,
    "expansionId": "base-c3",
    "version": "C3",
    "segments": [
      {
        "id": "road0",
        "type": "ROAD",
        "svgPath": "M0,51 L32,49 L41,54 L41,65 L50,72 L51,84 L50,100",
        "meepleCentroid": {
          "x": 41,
          "y": 57
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M0,0 L100,0 L100,100 L54,100 L58,69 L48,61 L45,48 L27,43 L0,46 Z",
        "meepleCentroid": {
          "x": 65,
          "y": 36
        }
      },
      {
        "id": "field1",
        "type": "FIELD",
        "svgPath": "M0,54 L32,55 L36,67 L44,75 L46,100 L0,100 Z",
        "meepleCentroid": {
          "x": 23,
          "y": 74
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M55,15 L85,15 L85,45 L55,45 Z",
        "meepleCentroid": {
          "x": 70,
          "y": 30
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "field0",
      "WEST_LEFT": "field1",
      "EAST_RIGHT": "field0",
      "NORTH_LEFT": "field0",
      "SOUTH_LEFT": "field0",
      "WEST_RIGHT": "field0",
      "EAST_CENTER": "field0",
      "NORTH_RIGHT": "field0",
      "SOUTH_RIGHT": "field1",
      "WEST_CENTER": "road0",
      "NORTH_CENTER": "field0",
      "SOUTH_CENTER": "road0"
    },
    "adjacencies": [
      [
        "field1",
        "road0"
      ],
      [
        "field0",
        "road0"
      ],
      [
        "garden0",
        "field0"
      ]
    ]
  }
]
