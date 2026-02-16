import { useState } from 'react'
import { TileSVG } from '../svg/TileSVG.tsx'
import { BASE_TILES } from '../../core/data/baseTiles.ts'
import type { Rotation } from '../../core/types/tile.ts'

const ROTATIONS: Rotation[] = [0, 90, 180, 270]

/**
 * Dev-only component: renders all 71 tile definitions at all 4 rotations.
 * Used during Phase 2 to visually verify tile graphics.
 */
export function TileGallery() {
  const [selectedRotation, setSelectedRotation] = useState<Rotation | 'all'>('all')
  const [filter, setFilter] = useState('')
  const [tileSize, setTileSize] = useState(80)

  const rotationsToShow = selectedRotation === 'all' ? ROTATIONS : [selectedRotation]

  const filteredTiles = BASE_TILES.filter(def =>
    def.id.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh', color: '#f0f0f0', padding: '20px', overflowY: 'auto' }}>
      <h1 style={{ marginBottom: '16px', fontFamily: 'monospace', color: '#e8d8a0' }}>
        Carcassonne Tile Gallery
      </h1>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>Filter:</span>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="tile id..."
            style={{ background: '#333', border: '1px solid #555', color: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}
          />
        </label>

        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>Rotation:</span>
          <select
            value={selectedRotation}
            onChange={e => setSelectedRotation(e.target.value === 'all' ? 'all' : Number(e.target.value) as Rotation)}
            style={{ background: '#333', border: '1px solid #555', color: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}
          >
            <option value="all">All rotations</option>
            <option value={0}>0°</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </label>

        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>Size: {tileSize}px</span>
          <input
            type="range" min={40} max={160} value={tileSize}
            onChange={e => setTileSize(Number(e.target.value))}
            style={{ width: '100px' }}
          />
        </label>

        <span style={{ color: '#aaa', fontSize: '13px' }}>
          {filteredTiles.length} tile types × {rotationsToShow.length} rotations = {filteredTiles.length * rotationsToShow.length} tiles
        </span>
      </div>

      {/* Tile grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {filteredTiles.map(def => (
          <div
            key={def.id}
            style={{
              background: '#2a2a3e',
              border: '1px solid #444',
              borderRadius: '6px',
              padding: '8px',
            }}
          >
            {/* Tile ID + count */}
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px', fontFamily: 'monospace' }}>
              {def.id}
              <span style={{ color: '#666', marginLeft: '6px' }}>×{def.count}</span>
              {def.startingTile && (
                <span style={{ color: '#e8d8a0', marginLeft: '6px' }}>★</span>
              )}
            </div>

            {/* Rotations */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {rotationsToShow.map(rot => (
                <div key={rot} style={{ textAlign: 'center' }}>
                  <TileSVG definition={def} rotation={rot} size={tileSize} />
                  {selectedRotation === 'all' && (
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>{rot}°</div>
                  )}
                </div>
              ))}
            </div>

            {/* Edge summary */}
            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', fontFamily: 'monospace' }}>
              N:{def.edges.NORTH[0]} E:{def.edges.EAST[0]} S:{def.edges.SOUTH[0]} W:{def.edges.WEST[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
