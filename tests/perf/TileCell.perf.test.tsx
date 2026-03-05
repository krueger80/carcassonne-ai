import { describe, it } from 'vitest'

describe('TileCell Performance Optimization', () => {
  it('measures meeple mapping time before and after', () => {
    const players = Array.from({ length: 6 }, (_, i) => ({
      id: `player-${i}`,
      color: `#00000${i}`,
      score: 0,
      meeples: { available: { NORMAL: 7 }, total: { NORMAL: 7 } },
      resources: {}
    }))

    // Pre-calculate player colors map
    const playerColors: Record<string, string> = {}
    for (const p of players) {
      playerColors[p.id] = p.color
    }

    // Simulate a tile with 5 meeples
    const tile: any = {
      coordinate: { x: 0, y: 0 },
      definitionId: 'base-d',
      rotation: 0,
      meeples: {
        seg1: { playerId: 'player-5', meepleType: 'NORMAL' },
        seg2: { playerId: 'player-4', meepleType: 'NORMAL' },
        seg3: { playerId: 'player-5', meepleType: 'NORMAL' },
        seg4: { playerId: 'player-4', meepleType: 'NORMAL' },
        seg5: { playerId: 'player-5', meepleType: 'NORMAL' },
      }
    }

    const def: any = {
      id: 'base-d',
      segments: []
    }

    // BASELINE: Find in array
    const startBaseline = performance.now()
    for (let i = 0; i < 100000; i++) {
      const meepleColors: any = {}
      for (const [segId, meeple] of Object.entries(tile.meeples) as any) {
        const player = players.find(p => p.id === meeple.playerId)
        if (player) {
          meepleColors[segId] = {
            color: player.color,
            isBig: meeple.meepleType === 'BIG',
            isBuilder: meeple.meepleType === 'BUILDER',
            isPig: meeple.meepleType === 'PIG',
          }
        }
      }
    }
    const endBaseline = performance.now()

    // OPTIMIZED: Lookup in map
    const startOptimized = performance.now()
    for (let i = 0; i < 100000; i++) {
      const meepleColors: any = {}
      for (const [segId, meeple] of Object.entries(tile.meeples) as any) {
        const color = playerColors[meeple.playerId]
        if (color) {
          meepleColors[segId] = {
            color: color,
            isBig: meeple.meepleType === 'BIG',
            isBuilder: meeple.meepleType === 'BUILDER',
            isPig: meeple.meepleType === 'PIG',
          }
        }
      }
    }
    const endOptimized = performance.now()

    console.log(`Baseline iteration time: ${endBaseline - startBaseline}ms`)
    console.log(`Optimized iteration time: ${endOptimized - startOptimized}ms`)
  })
})
