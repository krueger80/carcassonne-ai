
import React, { useState, useMemo } from 'react';
import FULL_TILES_RAW from '../data/tiles.json';

interface TileData {
    edition: string;
    expansion: string;
    name: string;
    image: string;
    count: number;
    sides?: string;
    original_image?: string;
}

const FULL_TILES = FULL_TILES_RAW as TileData[];

export const CarcassonneGallery: React.FC = () => {
    const [selectedExpansion, setSelectedExpansion] = useState('All');
    const [selectedEdition, setSelectedEdition] = useState('All');
    const [selectedSides, setSelectedSides] = useState('All');

    // Helper to get unique sorted values
    const getUniqueValues = (data: TileData[], field: keyof TileData) => {
        const values = new Set(data.map(t => t[field]).filter(Boolean));
        return Array.from(values).sort() as string[];
    };

    const uniqueExpansions = useMemo(() => getUniqueValues(FULL_TILES, 'expansion'), []);
    const uniqueEditions = useMemo(() => getUniqueValues(FULL_TILES, 'edition'), []);
    const uniqueSides = useMemo(() => getUniqueValues(FULL_TILES, 'sides'), []);

    const galleryTiles = useMemo(() => {
        return FULL_TILES.filter(t => {
            const matchExpansion = selectedExpansion === 'All' || t.expansion === selectedExpansion;
            const matchEdition = selectedEdition === 'All' || t.edition === selectedEdition;
            const matchSides = selectedSides === 'All' || t.sides === selectedSides;
            return matchExpansion && matchEdition && matchSides;
        });
    }, [selectedExpansion, selectedEdition, selectedSides]);

    const totalGalleryCount = galleryTiles.reduce((acc, t) => acc + t.count, 0);

    if (!FULL_TILES || FULL_TILES.length === 0) {
        return <div style={{ padding: 20, color: 'red' }}>Error: No data loaded from tiles.json</div>
    }

    return (
        <div className="gallery-container" style={{ padding: '20px', background: '#1a1a2e', minHeight: '100vh', color: '#eee', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#e8d8a0', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Carcassonne Tile Gallery</h2>

            <div className="filters-container" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
                <div className="filter-group">
                    <label style={{ marginRight: '5px' }}>Edition:</label>
                    <select value={selectedEdition} onChange={e => setSelectedEdition(e.target.value)}>
                        <option value="All">All Editions</option>
                        {uniqueEditions.map(ed => <option key={ed} value={ed}>{ed}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label style={{ marginRight: '5px' }}>Expansion:</label>
                    <select value={selectedExpansion} onChange={e => setSelectedExpansion(e.target.value)}>
                        <option value="All">All Expansions</option>
                        {uniqueExpansions.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label style={{ marginRight: '5px' }}>Configuration (Sides):</label>
                    <select value={selectedSides} onChange={e => setSelectedSides(e.target.value)}>
                        <option value="All">All Configurations</option>
                        <option value="Unknown">Unknown / Misc</option>
                        {uniqueSides.map(side => <option key={side} value={side}>{side}</option>)}
                    </select>
                </div>

                <div style={{ marginLeft: '10px', alignSelf: 'center' }}>
                    <strong>{galleryTiles.length} unique</strong> ({totalGalleryCount} total)
                </div>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                {galleryTiles.map((tile, idx) => (
                    <div key={idx} className="tile-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', border: '1px solid #444', borderRadius: '8px', background: '#222', color: '#eee' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            backgroundImage: `url(${tile.image})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            marginBottom: '0.5rem'
                        }} />
                        <div className="tile-info" style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold' }}>x{tile.count}</div>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tile.name}>{tile.name}</div>
                            {tile.sides && <div style={{ fontSize: '0.7em', background: '#e2e8f0', padding: '2px 6px', borderRadius: '10px', marginTop: '4px', display: 'inline-block' }}>{tile.sides}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
