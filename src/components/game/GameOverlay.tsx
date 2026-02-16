import { useGameStore } from '../../store/gameStore.ts'
import { TileSVG } from '../svg/TileSVG.tsx'
import { TILE_MAP, getAllPotentialPlacements } from '../../core/engine/GameEngine.ts'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'

export function GameOverlay() {
    const {
        gameState,
        interactionState,
        rotateTentativeTile,
        confirmTilePlacement,
        cancelTilePlacement,
        confirmMeeplePlacement,
        cancelMeeplePlacement,
        skipMeeple,
        undoTilePlacement,
        drawTile,
    } = useGameStore()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showNewGameConfirm, setShowNewGameConfirm] = useState(false)
    const [newGamePlayerCount, setNewGamePlayerCount] = useState(4)

    // Reset confirm state when menu closes
    useEffect(() => {
        if (!isMenuOpen) {
            setShowNewGameConfirm(false)
            setNewGamePlayerCount(4)
        }
    }, [isMenuOpen])

    const startNewGame = () => {
        const names = Array.from({ length: newGamePlayerCount }, (_, i) => `Player ${i + 1}`)
        useGameStore.getState().newGame({
            playerNames: names
        })
        setIsMenuOpen(false)
    }

    // Failsafe: if we are in PLACE_TILE but have no valid placements, try to recalculate
    useEffect(() => {
        if (!gameState) return
        if (gameState.turnPhase === 'PLACE_TILE' && gameState.currentTile) {
            const store = useGameStore.getState()
            if (store.validPlacements.length === 0 && store.interactionState !== 'TILE_PLACED_TENTATIVELY') {
                const potential = getAllPotentialPlacements(gameState.board, TILE_MAP, gameState.currentTile)
                if (potential.length > 0) {
                    useGameStore.setState({ validPlacements: potential })
                }
            }
        }
    }, [gameState?.turnPhase, gameState?.currentTile])

    // Auto-draw if in DRAW_TILE phase (handles refresh/persistence)
    useEffect(() => {
        if (gameState?.turnPhase === 'DRAW_TILE') {
            const timer = setTimeout(() => {
                drawTile()
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [gameState?.turnPhase, drawTile])

    const orderedPlayers = useMemo(() => {
        if (!gameState) return []
        const { players, currentPlayerIndex } = gameState

        // Strategy: We want the Active Player at the BOTTOM.
        // We want the Next Player just ABOVE the Active Player.
        // And so on upwards.
        // Example: Players [0, 1, 2, 3]. Active 0. Next 1.
        // Desired Visual Stack (Top to Bottom):
        // 3 (Prev)
        // 2
        // 1 (Next)
        // 0 (Active)

        // 1. Get List rotated starting from Next Player: [1, 2, 3, 0]
        const rotated = []
        for (let i = 1; i < players.length; i++) {
            rotated.push(players[(currentPlayerIndex + i) % players.length])
        }

        // 2. Reverse the "waiting" players: [3, 2, 1]
        rotated.reverse()

        // 3. Add Active Player at the end: [3, 2, 1, 0]
        rotated.push(players[currentPlayerIndex])

        return rotated
    }, [gameState?.players, gameState?.currentPlayerIndex])

    if (!gameState) return null

    const { players, currentPlayerIndex, turnPhase, tileBag } = gameState
    const { currentTile } = gameState
    const currentPlayer = players[currentPlayerIndex]

    // Determine status text
    let statusText = `${currentPlayer.name}'s turn`
    let instructionText = ''

    if (turnPhase === 'DRAW_TILE') {
        instructionText = 'Drawing...'
    } else if (turnPhase === 'PLACE_TILE') {
        if (interactionState === 'TILE_PLACED_TENTATIVELY') {
            instructionText = 'Rotate & Confirm'
        } else {
            instructionText = 'Place your tile'
        }
    } else if (turnPhase === 'PLACE_MEEPLE') {
        if (interactionState === 'MEEPLE_SELECTED_TENTATIVELY') {
            instructionText = 'Confirm Meeple'
        } else {
            instructionText = 'Place Meeple or Skip'
        }
    } else if (turnPhase === 'SCORE') {
        instructionText = 'Turn ending...'
    }

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
        }}>

            {/* ── Game Info (Tiles Left) ────────────────────────────────────── */}
            <div style={{
                position: 'absolute',
                top: 24,
                right: 24,
                background: 'rgba(0,0,0,0.6)',
                color: '#ddd',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 14,
                fontFamily: 'monospace',
                pointerEvents: 'none',
                zIndex: 40,
            }}>
                Tiles: {tileBag.length}
            </div>

            {/* ── Left Sidebar: Players & Menu ──────────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 280,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 24,
                    zIndex: 50,
                    pointerEvents: 'none',
                }}
            >
                {/* ── Hamburger Menu (Top Left) ─────────────────────────────── */}
                <div style={{ pointerEvents: 'auto', alignSelf: 'flex-start' }} onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen) }}
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            border: '1px solid #555',
                            borderRadius: 8,
                            color: 'white',
                            padding: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    top: 40,
                                    left: 0,
                                    background: 'rgba(30, 30, 40, 0.95)',
                                    border: '1px solid #555',
                                    borderRadius: 12,
                                    padding: 12,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                    minWidth: 220,
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                    pointerEvents: 'auto', // CRITICAL FIX: Ensure clicks are captured
                                }}
                            >
                                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', paddingBottom: 8, borderBottom: '1px solid #444', marginBottom: 4 }}>
                                    Menu
                                </div>

                                {!showNewGameConfirm ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setNewGamePlayerCount(players.length) // Preselect current player count
                                            setShowNewGameConfirm(true)
                                        }}
                                        style={{
                                            background: '#3a3a4a',
                                            border: 'none',
                                            borderRadius: 6,
                                            color: 'white',
                                            padding: '10px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#4a4a5a')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = '#3a3a4a')}
                                    >
                                        <span>🔄</span> New Game
                                    </button>
                                ) : (
                                    <div style={{
                                        background: '#2a2a35',
                                        padding: 12,
                                        borderRadius: 8,
                                        border: '1px solid #444',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 12
                                    }}>
                                        <div style={{ fontSize: 13, color: '#ccc', fontWeight: 'bold' }}>New Game Setup</div>

                                        {/* Player Count Selector */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <label style={{ fontSize: 11, color: '#888' }}>Players:</label>
                                            <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
                                                {[2, 3, 4, 5].map(count => (
                                                    <button
                                                        key={count}
                                                        onClick={(e) => { e.stopPropagation(); setNewGamePlayerCount(count); }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '6px 0',
                                                            borderRadius: 4,
                                                            border: newGamePlayerCount === count ? '1px solid #3498db' : '1px solid #444',
                                                            background: newGamePlayerCount === count ? 'rgba(52, 152, 219, 0.2)' : '#333',
                                                            color: newGamePlayerCount === count ? '#3498db' : '#aaa',
                                                            cursor: 'pointer',
                                                            fontSize: 12,
                                                            fontWeight: newGamePlayerCount === count ? 'bold' : 'normal',
                                                        }}
                                                    >
                                                        {count}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    startNewGame()
                                                }}
                                                style={{
                                                    flex: 1,
                                                    background: '#27ae60', // Green for start
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    color: 'white',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Start
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setShowNewGameConfirm(false)
                                                }}
                                                style={{
                                                    flex: 1,
                                                    background: '#555',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    color: 'white',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic', paddingTop: 4 }}>
                                    More features soon...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Vertical Player Stack ─────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    width: '100%',
                    pointerEvents: 'auto',
                    marginTop: 'auto', // Keep players at bottom of sidebar
                }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <AnimatePresence mode="popLayout">
                        {orderedPlayers.map((p) => {
                            const isCurrent = p.id === currentPlayer.id
                            return (
                                <motion.div
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                        opacity: isCurrent ? 1 : 0.7,
                                        scale: isCurrent ? 1.05 : 0.95,
                                        x: 0,
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    style={{
                                        backgroundColor: p.color,
                                        position: 'relative',
                                        padding: '10px 16px',
                                        borderRadius: 12,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        color: '#fff',
                                        boxShadow: isCurrent ? '0 4px 15px rgba(0,0,0,0.4)' : 'none',
                                        border: isCurrent ? '2px solid #fff' : `1px solid rgba(255,255,255,0.2)`,
                                        filter: isCurrent ? 'brightness(1.1)' : 'brightness(0.8) grayscale(30%)',
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: isCurrent ? 16 : 14, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                            {p.name}
                                        </span>
                                        {isCurrent && (
                                            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ textAlign: 'center', lineHeight: 1 }}>
                                            <div style={{ fontSize: 10, opacity: 0.8, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>VP</div>
                                            <div style={{ fontWeight: 'bold', fontSize: 15, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{p.score}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', lineHeight: 1 }}>
                                            <div style={{ fontSize: 10, opacity: 0.8, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Meep</div>
                                            <div style={{ fontWeight: 'bold', fontSize: 15, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{p.meeples.available['NORMAL'] ?? 0}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Bottom Controls: Beside Sidebar ───────────────────────────── */}
            <div style={{
                position: 'absolute',
                bottom: 24,
                left: 300, // Positioned to the right of the sidebar (280px)
                display: 'flex',
                gap: 24,
                alignItems: 'flex-start', // Align to bottom-left area
                pointerEvents: 'none', // Wrapper pass-through
                zIndex: 60,
            }}>

                {/* Instruction Banner & Controls Wrapper */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start', // Left align text/controls
                    gap: 16,
                }}>
                    {/* Instruction Banner */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        key={statusText + instructionText}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{
                            background: 'rgba(20, 20, 20, 0.9)',
                            color: '#fff',
                            padding: '8px 24px',
                            borderRadius: 40, // Pill shape
                            fontSize: 16,
                            fontWeight: 500,
                            backdropFilter: 'blur(8px)',
                            border: `2px solid ${currentPlayer.color}`,
                            boxShadow: `0 4px 15px rgba(0,0,0,0.3)`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            pointerEvents: 'auto',
                        }}
                    >
                        <span style={{ fontWeight: 'bold', color: currentPlayer.color }}>{statusText}</span>
                        <span style={{ width: 1, height: 16, background: '#555' }} />
                        <span>{instructionText}</span>
                    </motion.div>

                    {/* Action Controls Box */}
                    <div
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 24,
                            background: 'rgba(20, 30, 20, 0.95)',
                            padding: 20,
                            borderRadius: 24,
                            border: '1px solid #444',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            pointerEvents: 'auto',
                        }}
                    >
                        {/* Current Tile Preview */}
                        <div style={{
                            position: 'relative',
                            width: 100,
                            height: 100,
                            background: '#0a0a0a',
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: '2px solid #555',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                        }}>
                            {currentTile && TILE_MAP[currentTile.definitionId] ? (
                                <TileSVG
                                    definition={TILE_MAP[currentTile.definitionId]}
                                    rotation={currentTile.rotation}
                                    size={100}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                                    ?
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.4)',
                                opacity: turnPhase === 'PLACE_TILE' && interactionState !== 'TILE_PLACED_TENTATIVELY' ? 0 : 0.6,
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s'
                            }} />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 140 }}>
                            {/* PHASE: PLACE TILE */}
                            {turnPhase === 'PLACE_TILE' && (
                                <>
                                    {interactionState === 'TILE_PLACED_TENTATIVELY' ? (
                                        <>
                                            <Button onClick={rotateTentativeTile}>Rotate (R)</Button>
                                            <Button onClick={confirmTilePlacement} primary>Confirm</Button>
                                            <Button onClick={cancelTilePlacement} danger>Cancel</Button>
                                        </>
                                    ) : (
                                        <div style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic', textAlign: 'center' }}>
                                            Select board location...
                                        </div>
                                    )}
                                </>
                            )}

                            {/* PHASE: PLACE MEEPLE */}
                            {turnPhase === 'PLACE_MEEPLE' && (
                                <>
                                    {interactionState === 'MEEPLE_SELECTED_TENTATIVELY' ? (
                                        <>
                                            <Button onClick={confirmMeeplePlacement} primary>Confirm Meeple</Button>
                                            <Button onClick={cancelMeeplePlacement} danger>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={undoTilePlacement} danger>Back</Button>
                                            <Button onClick={skipMeeple}>Skip Meeple</Button>
                                        </>
                                    )}
                                </>
                            )}

                            {(turnPhase === 'DRAW_TILE' || turnPhase === 'SCORE') && (
                                <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>Processing...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Button({ children, onClick, primary, danger }: { children: React.ReactNode, onClick: () => void, primary?: boolean, danger?: boolean }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onClick() }}
            style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: primary ? 'linear-gradient(135deg, #4a9a4a, #3a7a3a)' : danger ? 'linear-gradient(135deg, #9a4a4a, #7a3a3a)' : '#444',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: 14,
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {children}
        </motion.button>
    )
}
