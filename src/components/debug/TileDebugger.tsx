import { useState, useRef, useEffect } from 'react'
import { tileService } from '../../services/tileService.ts'
import { TileSVG } from '../svg/TileSVG.tsx'
import type { TileDefinition, Segment, FeatureType, EdgePosition } from '../../core/types/tile.ts'
import { EDGE_POSITIONS } from '../../core/types/tile.ts'

export function TileDebugger() {
    const [viewMode, setViewMode] = useState<'GRID' | 'EDIT'>('GRID')
    const [selectedTileId, setSelectedTileId] = useState<string>('')
    const [editedTiles, setEditedTiles] = useState<Record<string, TileDefinition>>({})
    const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)
    const [allTiles, setAllTiles] = useState<TileDefinition[]>([])
    const [filterExpansion, setFilterExpansion] = useState<string>('ALL')
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    useEffect(() => {
        loadTiles()
    }, [])

    const loadTiles = async () => {
        try {
            const tiles = await tileService.fetchAll()
            setAllTiles(tiles)
            if (tiles.length > 0 && !selectedTileId) setSelectedTileId(tiles[0].id)
        } catch (e) {
            console.error("Failed to load tiles", e)
        }
    }

    const handleSave = async () => {
        if (!selectedTileId) return
        const tile = editedTiles[selectedTileId]
        if (!tile) return

        try {
            await tileService.update(selectedTileId, tile)
            setEditedTiles(prev => {
                const next = { ...prev }
                delete next[selectedTileId]
                return next
            })
            await loadTiles()
            setToast({ message: 'Saved to Database!', type: 'success' })
        } catch (e) {
            setToast({ message: 'Save failed: ' + e, type: 'error' })
        }
    }



    const handleTileSelect = (id: string) => {
        setSelectedTileId(id)
        setViewMode('EDIT')
        // Reset segment selection on tile change
        setSelectedSegmentId(null)
    }

    const activeTile = editedTiles[selectedTileId] || allTiles.find(t => t.id === selectedTileId)

    if (!activeTile) return <div>Tile not found</div>

    const handleUpdate = (updates: Partial<TileDefinition>) => {
        setEditedTiles(prev => ({
            ...prev,
            [selectedTileId]: { ...activeTile, ...updates }
        }))
    }

    const handleSegmentUpdate = (segId: string, updates: Partial<Segment>) => {
        const newSegments = activeTile.segments.map(s => {
            if (s.id !== segId) return s

            const next = { ...s, ...updates }

            // Cleanup flags incompatible with new type
            if (next.type !== 'CITY') {
                delete next.hasPennant
                delete next.hasCathedral
                delete next.commodity
            }
            if (next.type !== 'ROAD') {
                delete next.hasInn
            }
            return next
        })
        handleUpdate({ segments: newSegments })
    }

    const handleEdgeUpdate = (pos: EdgePosition, segId: string) => {
        handleUpdate({
            edgePositionToSegment: {
                ...activeTile.edgePositionToSegment,
                [pos]: segId
            }
        })
    }

    const handleAddSegment = (type: FeatureType = 'FIELD') => {
        const prefix = type.toLowerCase()
        let i = 0
        while (activeTile.segments.some(s => s.id === `${prefix}${i}`)) {
            i++
        }
        const newId = `${prefix}${i}`

        let initialPath = 'M0,0 L100,0 L100,100 L0,100 Z' // Default Field (4 corners)
        if (type === 'CLOISTER') {
            initialPath = 'M40,40 L60,40 L60,60 L40,60 Z' // Fixed small box for Abbey
        } else if (type === 'ROAD') {
            initialPath = 'M0,50 L33,50 L67,50 L100,50' // 4-point horizontal road line
        } else if (type !== 'FIELD') {
            // 8-point shape for detailed editing (Cities)
            initialPath = 'M40,20 L60,20 L80,40 L80,60 L60,80 L40,80 L20,60 L20,40 Z'
        }

        const newSeg: Segment = {
            id: newId,
            type: type,
            svgPath: initialPath,
            meepleCentroid: { x: 50, y: 50 }
        }
        handleUpdate({ segments: [...activeTile.segments, newSeg] })
        setSelectedSegmentId(newId)
    }

    const handleDeleteSegment = (segId: string) => {
        // Removed confirm dialog as it might be blocked by browser policies
        // if (!confirm(`Delete segment ${segId}?`)) return

        const newSegments = activeTile.segments.filter(s => s.id !== segId)

        // Clean up edge mappings
        const newEdgeMapping = { ...activeTile.edgePositionToSegment }

        // Only keep mappings that don't point to the deleted segment
        Object.keys(newEdgeMapping).forEach(key => {
            if (newEdgeMapping[key as EdgePosition] === segId) {
                delete newEdgeMapping[key as EdgePosition]
            }
        })

        handleUpdate({
            segments: newSegments,
            edgePositionToSegment: newEdgeMapping
        })

        if (selectedSegmentId === segId) setSelectedSegmentId(null)
    }

    const handleSaveAll = async () => {
        const ids = Object.keys(editedTiles)
        if (ids.length === 0) return

        if (!confirm(`Save changes for ${ids.length} tiles?`)) return

        try {
            await Promise.all(ids.map(id => tileService.update(id, editedTiles[id])))
            setEditedTiles({})
            await loadTiles()
            setToast({ message: `Saved changes for ${ids.length} tiles!`, type: 'success' })
        } catch (e) {
            console.error(e)
            setToast({ message: 'Failed to save changes.', type: 'error' })
        }
    }

    if (viewMode === 'GRID') {
        const expansions = Array.from(new Set(allTiles.map(t => t.expansionId || 'base-game').filter(Boolean))).sort()
        const filteredTiles = allTiles.filter(t => filterExpansion === 'ALL' || (t.expansionId || 'base-game') === filterExpansion)
        const changesCount = Object.keys(editedTiles).length

        return (
            <div style={{ height: '100vh', overflowY: 'auto', padding: 20, background: '#222', color: '#eee', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
                <div style={{
                    marginBottom: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 20,
                    borderBottom: '1px solid #444',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: '#222'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <h2 style={{ margin: 0 }}>Tile Debugger</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <label style={{ fontSize: 14, color: '#aaa' }}>Filter:</label>
                            <select
                                value={filterExpansion}
                                onChange={e => setFilterExpansion(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: 4, background: '#333', color: '#fff', border: '1px solid #555', fontSize: 14 }}
                            >
                                <option value="ALL">All Expansions ({allTiles.length})</option>
                                {expansions.map(e => (
                                    <option key={e} value={e}>
                                        {e} ({allTiles.filter(t => (t.expansionId || 'base-game') === e).length})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={() => window.location.hash = ''}
                            style={{
                                padding: '10px 20px',
                                background: '#3a3a4a',
                                color: 'white',
                                border: '1px solid #555',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 14,
                            }}
                        >
                            Close
                        </button>

                        <button
                            onClick={handleSaveAll}
                            disabled={changesCount === 0}
                            style={{
                                padding: '10px 20px',
                                background: changesCount > 0 ? '#4CAF50' : '#444',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: changesCount > 0 ? 'pointer' : 'default',
                                fontWeight: 'bold',
                                opacity: changesCount > 0 ? 1 : 0.5,
                                fontSize: 14,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                            }}
                        >
                            Save All ({changesCount})
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 20, paddingBottom: 50 }}>
                    {filteredTiles.map(tile => {
                        const t = editedTiles[tile.id] || tile
                        const isEdited = !!editedTiles[tile.id]
                        return (
                            <div
                                key={t.id}
                                onClick={() => handleTileSelect(t.id)}
                                style={{
                                    background: '#333',
                                    padding: 10,
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    border: isEdited ? '2px solid #4CAF50' : '2px solid transparent', // Green border for edited
                                    position: 'relative',
                                    transition: 'transform 0.1s',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 8,
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    color: '#ccc',
                                    borderBottom: '1px solid #444',
                                    paddingBottom: 4
                                }}>
                                    <span>{t.id}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {(() => {
                                            const commodity = t.segments.find(s => s.commodity)?.commodity
                                            if (!commodity) return null
                                            const icon = commodity === 'CLOTH' ? '🧵' : commodity === 'WHEAT' ? '🌾' : '🍷'
                                            const color = commodity === 'CLOTH' ? '#5588cc' : commodity === 'WHEAT' ? '#ccaa33' : '#cc4466'
                                            return <span title={commodity} style={{ fontSize: 11, background: color, borderRadius: 3, padding: '0 3px', lineHeight: '16px' }}>{icon}</span>
                                        })()}
                                        {t.isDragonHoard && (
                                            <span title="Dragon Hoard" style={{ fontSize: 11, background: '#ff6b35', borderRadius: 3, padding: '0 3px', lineHeight: '16px' }}>🏰</span>
                                        )}
                                        {t.hasDragon && (
                                            <span title="Dragon" style={{ fontSize: 11, background: '#22aa44', borderRadius: 3, padding: '0 3px', lineHeight: '16px' }}>🐉</span>
                                        )}
                                        {t.hasMagicPortal && (
                                            <span title="Magic Portal" style={{ fontSize: 11, background: '#9955cc', borderRadius: 3, padding: '0 3px', lineHeight: '16px' }}>🌀</span>
                                        )}
                                        <span>x{t.count}</span>
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
                                    <TileSVG definition={t} size={120} />
                                </div>
                                {isEdited && <div style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />}
                            </div>
                        )
                    })}
                </div>
                {toast && (
                    <div style={{
                        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                        background: toast.type === 'error' ? '#cc0000' : '#4CAF50',
                        color: 'white', padding: '10px 20px', borderRadius: 4, zIndex: 1000,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        {toast.message}
                    </div>
                )}
            </div>
        )
    }

    // EDIT MODE
    return (
        <div style={{ display: 'flex', height: '100vh', background: '#222', color: '#eee', fontFamily: 'sans-serif' }}>

            {/* Left Sidebar: Navigation */}
            <div style={{ width: 200, borderRight: '1px solid #444', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 20, background: '#222' }}>
                <button
                    onClick={() => setViewMode('GRID')}
                    style={{ padding: 15, background: '#444', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #555' }}
                >
                    ← Back to Grid
                </button>
                <div style={{ padding: 10, fontWeight: 'bold', borderBottom: '1px solid #444' }}>Quick Switch</div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {allTiles.map(t => (
                        <div
                            key={t.id}
                            onClick={() => handleTileSelect(t.id)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                background: selectedTileId === t.id ? '#0066cc' : 'transparent',
                                borderBottom: '1px solid #333',
                                fontSize: 14
                            }}
                        >
                            {t.id} {editedTiles[t.id] ? '*' : ''}
                        </div>
                    ))}
                </div>
            </div>

            {/* Center: Visual Editor */}
            <EditorArea
                tile={activeTile}
                activeSegmentId={selectedSegmentId}
                onUpdate={handleUpdate}
                onSelectSegment={setSelectedSegmentId}
                onSegmentUpdate={handleSegmentUpdate}
                onEdgeUpdate={handleEdgeUpdate}
            />

            {/* Right Sidebar: Properties */}
            <PropertiesPanel
                tile={activeTile}
                editedTiles={editedTiles}
                selectedSegmentId={selectedSegmentId}
                onSelectSegment={setSelectedSegmentId}
                onUpdate={handleUpdate}
                onSegmentUpdate={handleSegmentUpdate}
                onAddSegment={handleAddSegment}
                onDeleteSegment={handleDeleteSegment}
                onSave={handleSave}
                onSetToast={setToast}
            />
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? '#cc0000' : '#4CAF50',
                    color: 'white', padding: '10px 20px', borderRadius: 4, zIndex: 1000,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    )
}

// ------------------------------------------------------------------

function EditorArea({
    tile, activeSegmentId, onUpdate, onSelectSegment, onSegmentUpdate, onEdgeUpdate
}: {
    tile: TileDefinition,
    activeSegmentId: string | null,
    onUpdate: (u: Partial<TileDefinition>) => void,
    onSelectSegment: (id: string | null) => void,
    onSegmentUpdate: (id: string, u: Partial<Segment>) => void,
    onEdgeUpdate: (pos: EdgePosition, segId: string) => void
}) {
    const [showSchematic, setShowSchematic] = useState(true)

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 10, display: 'flex', gap: 20, alignItems: 'center' }}>
                <h2>{tile.id}</h2>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#333', padding: '5px 10px', borderRadius: 4 }}>
                    <input
                        type="checkbox"
                        checked={showSchematic}
                        onChange={e => setShowSchematic(e.target.checked)}
                    />
                    Show Boundaries (Overlay)
                </label>
                {activeSegmentId && (
                    <div style={{ padding: '5px 10px', background: '#0066cc', borderRadius: 4, fontWeight: 'bold' }}>
                        Active Segment: {activeSegmentId}
                    </div>
                )}
            </div>

            <div style={{ padding: 20, background: '#333', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                <EditorCanvas
                    tile={tile}
                    activeSegmentId={activeSegmentId}
                    onUpdate={onUpdate}
                    onSelectSegment={onSelectSegment}
                    onSegmentUpdate={onSegmentUpdate}
                    onEdgeUpdate={onEdgeUpdate}
                    showSchematic={showSchematic}
                />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#aaa', maxWidth: 600, textAlign: 'center' }}>
                Click a square edge marker to assign the Active Segment to that edge position.
                Drag blue pebbles to move meeple positions.
            </div>
        </div>
    )
}

function PropertiesPanel({
    tile, editedTiles, selectedSegmentId, onSelectSegment,
    onUpdate, onSegmentUpdate, onAddSegment, onDeleteSegment, onSave, onSetToast
}: {
    tile: TileDefinition,
    editedTiles: any,
    selectedSegmentId: string | null,
    onSelectSegment: (id: string) => void,
    onUpdate: (u: Partial<TileDefinition>) => void,
    onSegmentUpdate: (id: string, u: Partial<Segment>) => void,
    onAddSegment: (type?: FeatureType) => void,
    onDeleteSegment: (id: string) => void,
    onSave: () => void,
    onSetToast: (t: { message: string, type: 'success' | 'error' } | null) => void
}) {


    return (
        <div style={{ width: 500, borderLeft: '1px solid #444', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 15, position: 'relative', zIndex: 20, background: '#222' }}>
            <div style={{ marginBottom: 20, borderBottom: '1px solid #444', paddingBottom: 15 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label>
                        <span style={{ fontSize: 10, color: '#aaa', display: 'block' }}>Count</span>
                        <input
                            type="number"
                            value={tile.count}
                            onChange={e => onUpdate({ count: parseInt(e.target.value) || 0 })}
                            style={{ width: 60, background: '#333', border: '1px solid #555', color: 'white', padding: 5 }}
                        />
                    </label>
                    <label>
                        <span style={{ fontSize: 10, color: '#aaa', display: 'block' }}>Image URL</span>
                        <input
                            value={tile.imageUrl || ''}
                            onChange={e => onUpdate({ imageUrl: e.target.value })}
                            style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: 5 }}
                        />
                    </label>

                    {/* Dragon & Fairy tile-level flags */}
                    {(tile.expansionId === 'dragon-fairy' || tile.isDragonHoard || tile.hasDragon || tile.hasMagicPortal) && (
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 5 }}>
                            <label
                                onClick={e => e.stopPropagation()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                                    color: tile.isDragonHoard ? '#ff6b35' : '#aaa'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={tile.isDragonHoard || false}
                                    onChange={e => onUpdate({ isDragonHoard: e.target.checked || undefined })}
                                />
                                <span>🏰 Dragon Hoard</span>
                            </label>
                            <label
                                onClick={e => e.stopPropagation()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                                    color: tile.hasDragon ? '#22aa44' : '#aaa'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={tile.hasDragon || false}
                                    onChange={e => onUpdate({ hasDragon: e.target.checked || undefined })}
                                />
                                <span>🐉 Dragon</span>
                            </label>
                            <label
                                onClick={e => e.stopPropagation()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                                    color: tile.hasMagicPortal ? '#9955cc' : '#aaa'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={tile.hasMagicPortal || false}
                                    onChange={e => onUpdate({ hasMagicPortal: e.target.checked || undefined })}
                                />
                                <span>🌀 Magic Portal</span>
                            </label>
                        </div>
                    )}

                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                <h4 style={{ margin: 0 }}>Segments</h4>
                <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => onAddSegment('FIELD')} style={{ fontSize: 10, padding: 4, background: '#446644', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>+Field</button>
                    <button onClick={() => onAddSegment('ROAD')} style={{ fontSize: 10, padding: 4, background: '#888', color: 'black', border: 'none', borderRadius: 4, cursor: 'pointer' }}>+Road</button>
                    <button onClick={() => onAddSegment('CITY')} style={{ fontSize: 10, padding: 4, background: '#8B4513', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>+City</button>
                    <button onClick={() => onAddSegment('CLOISTER')} style={{ fontSize: 10, padding: 4, background: '#DAA520', color: 'black', border: 'none', borderRadius: 4, cursor: 'pointer' }}>+Abbey</button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <h4 style={{ margin: '15px 0 5px 0' }}>Adjacencies (Touching Segments)</h4>
                <div style={{ background: '#333', padding: 10, borderRadius: 4, marginBottom: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {(tile.adjacencies || []).map(([id1, id2], idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#222', padding: '4px 8px', borderRadius: 4 }}>
                                <span style={{ fontSize: 12, flex: 1 }}>{id1} ↔ {id2}</span>
                                <button
                                    onClick={() => {
                                        const newAdj = (tile.adjacencies || []).filter((_, i) => i !== idx)
                                        onUpdate({ adjacencies: newAdj.length > 0 ? newAdj : undefined })
                                    }}
                                    style={{ background: '#600', color: '#fff', border: 'none', borderRadius: 3, padding: '2px 6px', cursor: 'pointer', fontSize: 10 }}
                                >Remove</button>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 5 }}>
                        <select id="adj-source" style={{ flex: 1, fontSize: 11 }}>
                            <option value="">Source...</option>
                            {tile.segments.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                        </select>
                        <span style={{ fontSize: 12 }}>↔</span>
                        <select id="adj-target" style={{ flex: 1, fontSize: 11 }}>
                            <option value="">Target...</option>
                            {tile.segments.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                        </select>
                        <button
                            onClick={() => {
                                const s = (document.getElementById('adj-source') as HTMLSelectElement).value
                                const t = (document.getElementById('adj-target') as HTMLSelectElement).value
                                if (!s || !t || s === t) return
                                const current = tile.adjacencies || []
                                if (current.some(([a, b]) => (a === s && b === t) || (a === t && b === s))) {
                                    onSetToast({ message: 'Adjacency already exists!', type: 'error' })
                                    return
                                }
                                onUpdate({ adjacencies: [...current, [s, t]] })
                            }}
                            style={{ background: '#0066cc', color: '#fff', border: 'none', borderRadius: 3, padding: '2px 10px', cursor: 'pointer', fontSize: 11 }}
                        >Add</button>
                    </div>
                </div>

                {tile.segments.map(seg => {
                    const isSelected = selectedSegmentId === seg.id
                    return (
                        <div
                            key={seg.id}
                            onClick={() => onSelectSegment(seg.id)}
                            style={{
                                background: isSelected ? '#445566' : '#333',
                                padding: 10,
                                marginBottom: 10,
                                borderRadius: 4,
                                borderLeft: `4px solid ${getColorForType(seg.type)}`,
                                border: isSelected ? '2px solid #0066cc' : '2px solid transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <input
                                    value={seg.id}
                                    readOnly
                                    title="Segment ID is read-only"
                                    onClick={e => e.stopPropagation()}
                                    style={{ width: 80, fontSize: 12, border: '1px solid #555', background: '#222', color: '#aaa', cursor: 'not-allowed' }}
                                />
                                <select
                                    value={seg.type}
                                    onChange={e => onSegmentUpdate(seg.id, { type: e.target.value as FeatureType })}
                                    onClick={e => e.stopPropagation()}
                                    style={{ fontSize: 12 }}
                                >
                                    <option value="CITY">CITY</option>
                                    <option value="ROAD">ROAD</option>
                                    <option value="FIELD">FIELD</option>
                                    <option value="CLOISTER">CLOISTER</option>
                                </select>
                                <button
                                    title="Delete Segment"
                                    onClick={(e) => { e.stopPropagation(); onDeleteSegment(seg.id) }}
                                    style={{
                                        color: '#ffdddd',
                                        fontWeight: 'bold',
                                        fontSize: 14,
                                        padding: '2px 8px',
                                        border: '1px solid #cc0000',
                                        background: '#AA0000',
                                        borderRadius: 4,
                                        cursor: 'pointer'
                                    }}
                                >Del</button>
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginBottom: 5, fontSize: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                {seg.type === 'CITY' && (
                                    <>
                                        <label onClick={e => e.stopPropagation()}><input type="checkbox" checked={seg.hasPennant || false} onChange={e => onSegmentUpdate(seg.id, { hasPennant: e.target.checked })} /> Penn</label>
                                        <label onClick={e => e.stopPropagation()}><input type="checkbox" checked={seg.hasCathedral || false} onChange={e => onSegmentUpdate(seg.id, { hasCathedral: e.target.checked })} /> Cath</label>
                                    </>
                                )}
                                {seg.type === 'ROAD' && (
                                    <label onClick={e => e.stopPropagation()}><input type="checkbox" checked={seg.hasInn || false} onChange={e => onSegmentUpdate(seg.id, { hasInn: e.target.checked })} /> Inn</label>
                                )}
                                {seg.type === 'CITY' && (
                                    <label onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ color: '#aaa' }}>Commodity:</span>
                                        <select
                                            value={seg.commodity || ''}
                                            onChange={e => {
                                                const val = e.target.value as 'CLOTH' | 'WHEAT' | 'WINE' | ''
                                                onSegmentUpdate(seg.id, { commodity: val || undefined } as Partial<Segment>)
                                            }}
                                            style={{ fontSize: 11, background: '#222', color: '#fff', border: '1px solid #555', borderRadius: 3, padding: '2px 4px' }}
                                        >
                                            <option value="">None</option>
                                            <option value="CLOTH">🧵 Cloth</option>
                                            <option value="WHEAT">🌾 Wheat</option>
                                            <option value="WINE">🍷 Wine</option>
                                        </select>
                                    </label>
                                )}
                            </div>

                            <div style={{ marginBottom: 5 }}>
                                <label style={{ fontSize: 10 }}>SVG Path:</label>
                                <textarea
                                    value={seg.svgPath}
                                    onChange={e => onSegmentUpdate(seg.id, { svgPath: e.target.value })}
                                    onClick={e => e.stopPropagation()}
                                    style={{ width: '100%', height: 40, fontSize: 10, background: '#222', color: '#aaa', border: '1px solid #444' }}
                                />
                            </div>

                            <div style={{ fontSize: 10, color: '#aaa' }}>
                                Pos: ({Math.round(seg.meepleCentroid.x)}, {Math.round(seg.meepleCentroid.y)})
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #444', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={onSave}
                    disabled={!editedTiles[tile.id]}
                    style={{
                        padding: '12px 24px',
                        background: editedTiles[tile.id] ? '#4CAF50' : '#444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: editedTiles[tile.id] ? 'pointer' : 'default',
                        fontWeight: 'bold',
                        fontSize: 16,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}
                >
                    {editedTiles[tile.id] ? 'Save Changes' : 'No Changes'}
                </button>
            </div>

        </div>
    )
}

function getColorForType(type: string) {
    switch (type) {
        case 'CITY': return '#8B4513' // SaddleBrown
        case 'ROAD': return '#FFF'
        case 'FIELD': return '#32CD32' // LimeGreen
        case 'CLOISTER': return '#FFD700' // Gold
        default: return '#888'
    }
}

function EditorCanvas({
    tile, activeSegmentId, onUpdate, onSelectSegment, onSegmentUpdate, onEdgeUpdate, showSchematic
}: {
    tile: TileDefinition,
    activeSegmentId: string | null,
    onUpdate: (u: Partial<TileDefinition>) => void,
    onSelectSegment: (id: string | null) => void,
    onSegmentUpdate: (id: string, u: Partial<Segment>) => void,
    onEdgeUpdate: (pos: EdgePosition, segId: string) => void,
    showSchematic: boolean
}) {
    const size = 600
    // Helper to parse simple polygon paths
    const parsePath = (d: string) => {
        const points: { x: number, y: number }[] = []
        if (!d) return points
        // Handle M and L, ignore Z
        const clean = d.replace(/Z/g, '').trim()
        const parts = clean.split(/[ML]/).filter(p => p.trim())
        parts.forEach(p => {
            const [x, y] = p.split(',').map(n => parseFloat(n.trim()))
            if (!isNaN(x) && !isNaN(y)) points.push({ x, y })
        })
        return points
    }

    const serializePath = (points: { x: number, y: number }[], type: FeatureType) => {
        if (points.length === 0) return ''
        const d = `M${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L${p.x},${p.y}`).join(' ')
        return type === 'ROAD' ? d : d + ' Z'
    }

    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null)
    const svgRef = useRef<SVGSVGElement>(null)
    const activeSegment = tile.segments.find(s => s.id === activeSegmentId)

    const handlePointerDown = (e: React.PointerEvent, segId: string) => {
        setDraggingId(segId)
        e.currentTarget.setPointerCapture(e.pointerId)
        e.stopPropagation()
    }

    const handlePointerDownPoint = (e: React.PointerEvent, index: number) => {
        setDraggingPointIndex(index)
        e.currentTarget.setPointerCapture(e.pointerId)
        e.stopPropagation()
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if ((!draggingId && draggingPointIndex === null) || !svgRef.current) return

        const rect = svgRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        // Snap to grid (optional, but good for 100x100) - making it integer based for cleaner SVG
        const clampedX = Math.round(Math.max(0, Math.min(100, x)))
        const clampedY = Math.round(Math.max(0, Math.min(100, y)))

        if (draggingId) {
            onSegmentUpdate(draggingId, { meepleCentroid: { x: clampedX, y: clampedY } })
        } else if (draggingPointIndex !== null && activeSegmentId) {
            const activeSeg = tile.segments.find(s => s.id === activeSegmentId)
            if (activeSeg) {
                const points = parsePath(activeSeg.svgPath)
                if (points[draggingPointIndex]) {
                    points[draggingPointIndex] = { x: clampedX, y: clampedY }
                    onSegmentUpdate(activeSegmentId, { svgPath: serializePath(points, activeSeg.type) })
                }
            }
        }
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setDraggingId(null)
        setDraggingPointIndex(null)
        e.currentTarget.releasePointerCapture(e.pointerId)
    }

    const toggleAdjacency = (id1: string, id2: string) => {
        if (id1 === id2) return
        const current = tile.adjacencies || []
        const exists = current.some(([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1))

        if (exists) {
            const next = current.filter(([a, b]) => !((a === id1 && b === id2) || (a === id2 && b === id1)))
            onUpdate({ adjacencies: next.length > 0 ? next : undefined })
        } else {
            onUpdate({ adjacencies: [...current, [id1, id2]] })
        }
    }

    // Helper to get coordinates for edge markers
    const getMarkerCoords = (pos: EdgePosition) => {
        const [dir, sub] = pos.split('_')
        let offset: number
        if (sub === 'LEFT') offset = 25
        else if (sub === 'CENTER') offset = 50
        else offset = 75 // RIGHT

        // Adjust for visual intuition: 
        if (dir === 'NORTH') return { x: offset, y: 3 }
        if (dir === 'EAST') return { x: 97, y: offset }
        if (dir === 'SOUTH') return { x: 100 - offset, y: 97 } // 100-offset reverses order for South bottom
        if (dir === 'WEST') return { x: 3, y: 100 - offset } // 100-offset reverses order for West left
        return { x: 0, y: 0 }
    }

    return (
        <div
            style={{ width: size, height: size, position: 'relative' }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerDown={(e) => {
                // Unselect if clicking the background area
                if (e.target === e.currentTarget) onSelectSegment(null)
            }}
        >
            <TileSVG definition={tile} size={size} showSchematic={showSchematic} />

            <svg
                ref={svgRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}
                viewBox="0 0 100 100"
            >
                {/* 0. Adjacency Lines */}
                <g opacity="0.6">
                    {(tile.adjacencies || []).map(([id1, id2], idx) => {
                        const s1 = tile.segments.find(s => s.id === id1)
                        const s2 = tile.segments.find(s => s.id === id2)
                        if (!s1 || !s2) return null

                        const isActive = id1 === activeSegmentId || id2 === activeSegmentId

                        return (
                            <line
                                key={`adj-line-${idx}`}
                                x1={s1.meepleCentroid.x} y1={s1.meepleCentroid.y}
                                x2={s2.meepleCentroid.x} y2={s2.meepleCentroid.y}
                                stroke={isActive ? "#FFD700" : "#fff"}
                                strokeWidth={isActive ? 1.5 : 0.8}
                                strokeDasharray={isActive ? "none" : "2 1"}
                                style={{ pointerEvents: 'none', transition: 'all 0.2s' }}
                            />
                        )
                    })}
                </g>

                {/* 1. Edge Markers */}
                {Object.values(EDGE_POSITIONS).flat().map((pos) => {
                    const { x, y } = getMarkerCoords(pos)
                    const assignedSegId = tile.edgePositionToSegment?.[pos]
                    const assignedSeg = tile.segments.find(s => s.id === assignedSegId)
                    const color = assignedSeg ? getColorForType(assignedSeg.type) : '#333'
                    const isAssignedToActive = assignedSegId === activeSegmentId
                    const isSelected = activeSegmentId !== null

                    return (
                        <rect
                            key={pos}
                            x={x - 2.5}
                            y={y - 2.5}
                            width="5"
                            height="5"
                            fill={color}
                            stroke={isAssignedToActive ? '#fff' : '#000'}
                            strokeWidth={isAssignedToActive ? 0.8 : 0.2}
                            style={{ cursor: isSelected ? 'pointer' : 'not-allowed' }}
                            onClick={(e) => {
                                e.stopPropagation() // Prevent drag
                                if (activeSegmentId) {
                                    onEdgeUpdate(pos, activeSegmentId)
                                } else {
                                    alert('Select a segment first to assign it to this edge.')
                                }
                            }}
                        >
                            <title>{`${pos} -> ${assignedSegId || 'None'}`}</title>
                        </rect>
                    )
                })}

                {/* 2. Pebbles */}
                {tile.segments.map(seg => {
                    const isSelected = seg.id === activeSegmentId
                    return (
                        <g
                            key={seg.id}
                            transform={`translate(${seg.meepleCentroid.x}, ${seg.meepleCentroid.y})`}
                            style={{ cursor: 'pointer' }}
                            onPointerDown={(e) => {
                                e.stopPropagation()

                                // 1. Toggle Link if another is already selected
                                if (activeSegmentId && activeSegmentId !== seg.id) {
                                    toggleAdjacency(activeSegmentId, seg.id)
                                    return
                                }

                                // 2. Toggle selection
                                onSelectSegment(isSelected ? null : seg.id)

                                // 3. Start drag
                                handlePointerDown(e, seg.id)
                            }}
                        >
                            <circle r="6" fill="transparent" />
                            <circle
                                r={isSelected ? "4" : "3"}
                                fill={isSelected ? "#FFD700" : "#00BFFF"}
                                stroke="white"
                                strokeWidth={isSelected ? "1.5" : "1"}
                            />
                            {isSelected && (
                                <circle r="6" fill="none" stroke="#FFD700" strokeWidth="0.5">
                                    <animate attributeName="r" from="4" to="8" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                            )}
                            <text y="-6" fontSize="3.5" textAnchor="middle" fill="white" style={{ textShadow: '0 0 3px black', pointerEvents: 'none', fontWeight: 'bold' }}>
                                {seg.id}
                            </text>
                        </g>
                    )
                })}

                {/* 3. Shape Editor Handles (Active Segment Only) - Skip for Cloisters */}
                {activeSegment && activeSegment.type !== 'CLOISTER' && parsePath(activeSegment.svgPath).map((p, i) => (
                    <circle
                        key={`handle-${i}`}
                        cx={p.x} cy={p.y} r="2"
                        fill="white" stroke="red" strokeWidth="0.5"
                        style={{ cursor: 'crosshair', pointerEvents: 'auto' }}
                        onPointerDown={(e) => handlePointerDownPoint(e, i)}
                    >
                        <title>Drag to move point {i}</title>
                    </circle>
                ))}
            </svg>
        </div>
    )
}
