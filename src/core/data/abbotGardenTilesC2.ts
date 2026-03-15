import type { TileDefinition } from '../types/tile.ts'

/**
 * Abbot Garden variant tiles for Base Game C2 edition.
 * Each is a copy of the original tile with a garden0 segment added.
 * The user will map segments via the debug configurator tool.
 * These tiles are only included when the Abbot expansion is active.
 */
export const ABBOT_C2_GARDEN_TILES: TileDefinition[] = [
  {
    "id": "base2_E_garden",
    "imageUrl": "/images/BaseGame_C2/Abbot-Base_Game_C2_Tile_E_Garden.jpg",
    "count": 1,
    "expansionId": "base-c2",
    "version": "C2",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M0,0 L100,0 L70,25 L50,30 L30,25 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 20
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M0,40 L50,50 L100,40 L100,100 L0,100 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 65
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
    "id": "base2_H_garden",
    "imageUrl": "/images/BaseGame_C2/Abbot-Base_Game_C2_Tile_H_Garden.jpg",
    "count": 1,
    "expansionId": "base-c2",
    "version": "C2",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M100,0 L100,100 L75,70 L70,50 L75,30 Z",
        "meepleCentroid": {
          "x": 80,
          "y": 50
        }
      },
      {
        "id": "city1",
        "type": "CITY",
        "svgPath": "M0,0 L0,100 L25,70 L30,50 L25,30 Z",
        "meepleCentroid": {
          "x": 20,
          "y": 50
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M0,0 L60,0 L50,30 L50,70 L60,100 L0,100 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 50
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M35,35 L65,35 L65,65 L35,65 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 50
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "city0",
      "WEST_LEFT": "city1",
      "EAST_RIGHT": "city0",
      "NORTH_LEFT": "field0",
      "SOUTH_LEFT": "field0",
      "WEST_RIGHT": "city1",
      "EAST_CENTER": "city0",
      "NORTH_RIGHT": "field0",
      "SOUTH_RIGHT": "field0",
      "WEST_CENTER": "city1",
      "NORTH_CENTER": "field0",
      "SOUTH_CENTER": "field0"
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
    "id": "base2_I_garden",
    "imageUrl": "/images/BaseGame_C2/Abbot-Base_Game_C2_Tile_I_Garden.jpg",
    "count": 1,
    "expansionId": "base-c2",
    "version": "C2",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M100,0 L100,100 L75,70 L70,50 L75,30 Z",
        "meepleCentroid": {
          "x": 80,
          "y": 50
        }
      },
      {
        "id": "city1",
        "type": "CITY",
        "svgPath": "M0,100 L100,100 L70,75 L50,70 L30,75 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 21
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M0,0 L60,0 L50,50 L0,60 Z",
        "meepleCentroid": {
          "x": 41,
          "y": 56
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M15,30 L45,30 L45,60 L15,60 Z",
        "meepleCentroid": {
          "x": 30,
          "y": 45
        }
      }
    ],
    "edgePositionToSegment": {
      "EAST_LEFT": "city0",
      "WEST_LEFT": "field0",
      "EAST_RIGHT": "city0",
      "NORTH_LEFT": "city1",
      "SOUTH_LEFT": "field0",
      "WEST_RIGHT": "field0",
      "EAST_CENTER": "city0",
      "NORTH_RIGHT": "city1",
      "SOUTH_RIGHT": "field0",
      "WEST_CENTER": "field0",
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
    "id": "base2_M_garden",
    "imageUrl": "/images/BaseGame_C2/Abbot-Base_Game_C2_Tile_M_Garden.jpg",
    "count": 1,
    "expansionId": "base-c2",
    "version": "C2",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M0,100 L0,0 L100,0 L70,25 L40,40 L30,75 Z",
        "hasPennant": true,
        "meepleCentroid": {
          "x": 67,
          "y": 29
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M51,54 L100,40 L100,100 L0,100 L0,60 Z",
        "meepleCentroid": {
          "x": 33,
          "y": 69
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M50,60 L80,60 L80,90 L50,90 Z",
        "meepleCentroid": {
          "x": 65,
          "y": 75
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
    "id": "base2_N_garden",
    "imageUrl": "/images/BaseGame_C2/Abbot-Base_Game_C2_Tile_N_Garden.jpg",
    "count": 1,
    "expansionId": "base-c2",
    "version": "C2",
    "segments": [
      {
        "id": "city0",
        "type": "CITY",
        "svgPath": "M0,100 L0,0 L100,0 L70,25 L40,40 L30,75 Z",
        "meepleCentroid": {
          "x": 69,
          "y": 30
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M50,50 L100,40 L100,100 L0,100 L0,60 Z",
        "meepleCentroid": {
          "x": 32,
          "y": 69
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M50,60 L80,60 L80,90 L50,90 Z",
        "meepleCentroid": {
          "x": 65,
          "y": 75
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
    "id": "base2_R_garden",
    "imageUrl": "/images/BaseGame_C2/Abbot-Base_Game_C2_Tile_R_Garden.jpg",
    "count": 1,
    "expansionId": "base-c2",
    "version": "C2",
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
        "svgPath": "M0,60 L50,50 L100,60 L100,100 L0,100 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 80
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M35,75 L65,75 L65,95 L35,95 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 85
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
    "id": "base2_U_garden",
    "imageUrl": "/images/BaseGame_C2/Abbot-Base_Game_C2_Tile_U_Garden.jpg",
    "count": 1,
    "expansionId": "abbot-c2",
    "version": "C2",
    "segments": [
      {
        "id": "road0",
        "type": "ROAD",
        "svgPath": "M46,0 L54,0 L54,100 L46,100 Z",
        "meepleCentroid": {
          "x": 50,
          "y": 50
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M54,0 L100,0 L100,100 L54,100 Z",
        "meepleCentroid": {
          "x": 80,
          "y": 50
        }
      },
      {
        "id": "field1",
        "type": "FIELD",
        "svgPath": "M0,0 L46,0 L46,100 L0,100 Z",
        "meepleCentroid": {
          "x": 20,
          "y": 50
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M60,30 L90,30 L90,70 L60,70 Z",
        "meepleCentroid": {
          "x": 75,
          "y": 50
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
    "id": "base2_V_garden",
    "imageUrl": "/images/BaseGame_C2/Abbot-Base_Game_C2_Tile_V_Garden.jpg",
    "count": 1,
    "expansionId": "abbot-c2",
    "version": "C2",
    "segments": [
      {
        "id": "road0",
        "type": "ROAD",
        "svgPath": "M0,46 L54,46 L54,100 L46,100 L46,54 L0,54 Z",
        "meepleCentroid": {
          "x": 36,
          "y": 60
        }
      },
      {
        "id": "field0",
        "type": "FIELD",
        "svgPath": "M0,0 L100,0 L100,100 L54,100 L46,54 L0,54 Z",
        "meepleCentroid": {
          "x": 70,
          "y": 32
        }
      },
      {
        "id": "field1",
        "type": "FIELD",
        "svgPath": "M0,54 L46,54 L46,100 L0,100 Z",
        "meepleCentroid": {
          "x": 23,
          "y": 74
        }
      },
      {
        "id": "garden0",
        "type": "GARDEN",
        "svgPath": "M60,15 L90,15 L90,45 L60,45 Z",
        "meepleCentroid": {
          "x": 75,
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
