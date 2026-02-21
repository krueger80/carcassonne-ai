import { useState } from 'react'
import { motion } from 'framer-motion'
import { GameConfig } from '../../core/engine/GameEngine'

interface NewGameScreenProps {
    currentConfig: {
        playerCount: number
        expansions: string[]
    }
    onStart: (config: GameConfig) => void
    onCancel: () => void
}

export function NewGameScreen({ currentConfig, onStart, onCancel }: NewGameScreenProps) {
    const [playerCount, setPlayerCount] = useState(currentConfig.playerCount)
    const [expansions, setExpansions] = useState<string[]>(currentConfig.expansions)

    const toggleExpansion = (id: string) => {
        setExpansions(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        )
    }

    const handleStart = () => {
        const playerNames = Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`)
        onStart({
            playerNames,
            expansions,
        })
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
        }}
            onPointerDown={(e) => e.stopPropagation()}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                    background: 'rgba(30, 30, 40, 0.95)',
                    border: '1px solid #555',
                    borderRadius: 24,
                    padding: 32,
                    width: '100%',
                    maxWidth: 480,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                }}
            >
                <h2 style={{ margin: 0, color: 'white', fontSize: 24, textAlign: 'center' }}>
                    Start New Game
                </h2>

                {/* Player Count */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label style={{ color: '#aaa', fontSize: 14 }}>Number of Players</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {[2, 3, 4, 5].map(count => (
                            <button
                                key={count}
                                onClick={() => setPlayerCount(count)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: playerCount === count ? '#3498db' : '#333',
                                    color: playerCount === count ? 'white' : '#aaa',
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    transform: playerCount === count ? 'scale(1.05)' : 'scale(1)',
                                }}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expansions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label style={{ color: '#aaa', fontSize: 14 }}>Expansions</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 16,
                            background: '#333',
                            borderRadius: 12,
                            cursor: 'pointer',
                            border: expansions.includes('inns-cathedrals') ? '1px solid #9955cc' : '1px solid transparent',
                        }}>
                            <input
                                type="checkbox"
                                checked={expansions.includes('inns-cathedrals')}
                                onChange={() => toggleExpansion('inns-cathedrals')}
                                style={{ width: 20, height: 20, accentColor: '#9955cc' }}
                            />
                            <div>
                                <span style={{ color: 'white', fontWeight: 500 }}>Inns & Cathedrals</span>
                                <span style={{ display: 'block', fontSize: 12, color: '#888', marginTop: 2 }}>+18 tiles</span>
                            </div>
                        </label>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 16,
                            background: '#333',
                            borderRadius: 12,
                            cursor: 'pointer',
                            border: expansions.includes('traders-builders') ? '1px solid #c8a46e' : '1px solid transparent',
                        }}>
                            <input
                                type="checkbox"
                                checked={expansions.includes('traders-builders')}
                                onChange={() => toggleExpansion('traders-builders')}
                                style={{ width: 20, height: 20, accentColor: '#c8a46e' }}
                            />
                            <div>
                                <span style={{ color: 'white', fontWeight: 500 }}>Traders & Builders</span>
                                <span style={{ display: 'block', fontSize: 12, color: '#888', marginTop: 2 }}>+24 tiles · Builder & Pig meeples</span>
                            </div>
                        </label>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 16,
                            background: '#333',
                            borderRadius: 12,
                            cursor: 'pointer',
                            border: expansions.includes('dragon-fairy') ? '1px solid #e74c3c' : '1px solid transparent',
                        }}>
                            <input
                                type="checkbox"
                                checked={expansions.includes('dragon-fairy')}
                                onChange={() => toggleExpansion('dragon-fairy')}
                                style={{ width: 20, height: 20, accentColor: '#e74c3c' }}
                            />
                            <div>
                                <span style={{ color: 'white', fontWeight: 500 }}>Dragon & Fairy</span>
                                <span style={{ display: 'block', fontSize: 12, color: '#888', marginTop: 2 }}>+30 tiles · Dragon & Fairy figures</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: 12,
                            border: '1px solid #555',
                            background: 'transparent',
                            color: '#ccc',
                            fontSize: 16,
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStart}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: 12,
                            border: 'none',
                            background: '#27ae60',
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(39, 174, 96, 0.4)',
                        }}
                    >
                        Start Game
                    </button>
                </div>

            </motion.div>
        </div>
    )
}
