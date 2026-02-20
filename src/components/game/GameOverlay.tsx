import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
import { getAllPotentialPlacements, getValidMeepleTypes } from '../../core/engine/GameEngine.ts'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { NewGameScreen } from './NewGameScreen.tsx'
import { PlayerCard } from '../ui/PlayerCard.tsx'

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

    const { selectedMeepleType, setSelectedMeepleType } = useUIStore()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showNewGameScreen, setShowNewGameScreen] = useState(false)

    // Reset meeple type selection when turn changes
    useEffect(() => {
        setSelectedMeepleType('NORMAL')
    }, [gameState?.currentPlayerIndex, setSelectedMeepleType])

    // Failsafe: if we are in PLACE_TILE but have no valid placements, try to recalculate
    useEffect(() => {
        if (!gameState) return
        if (gameState.turnPhase === 'PLACE_TILE' && gameState.currentTile) {
            const store = useGameStore.getState()
            if (store.validPlacements.length === 0 && store.interactionState !== 'TILE_PLACED_TENTATIVELY') {
                const tileMap = gameState.staticTileMap
                const potential = getAllPotentialPlacements(gameState.board, tileMap, gameState.currentTile)
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
    const expansionList = (gameState.expansionData?.expansions as string[] | undefined) ?? []
    const hasTradersBuilders = expansionList.includes('traders-builders')
    const tbData = gameState.expansionData?.['tradersBuilders'] as { isBuilderBonusTurn?: boolean } | undefined
    const isBuilderBonusTurn = tbData?.isBuilderBonusTurn ?? false

    // Determine status text
    let statusText = isBuilderBonusTurn
        ? `${currentPlayer.name}'s BONUS TURN`
        : `${currentPlayer.name}'s turn`
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
            <AnimatePresence>
                {showNewGameScreen && (
                    <div style={{ pointerEvents: 'auto' }}>
                        <NewGameScreen
                            currentConfig={{
                                playerCount: gameState.players.length,
                                expansions: (gameState.expansionData?.expansions as string[]) || []
                            }}
                            onStart={(config) => {
                                useGameStore.getState().newGame(config)
                                setShowNewGameScreen(false)
                                setIsMenuOpen(false)
                            }}
                            onCancel={() => setShowNewGameScreen(false)}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* ── Backdrop for Menu Click-Away ──────────────────────────────── */}
            {isMenuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 45,
                        pointerEvents: 'auto',
                    }}
                    onPointerDown={() => setIsMenuOpen(false)}
                />
            )}

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
                    width: 320, // Increased width for the expanded card
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 24,
                    zIndex: 50,
                    pointerEvents: 'none',
                }}
            >
                {/* ── Hamburger Menu (Top Left) ─────────────────────────────── */}
                <div style={{ position: 'relative', pointerEvents: 'auto', alignSelf: 'flex-start', marginBottom: 20 }} onPointerDown={(e) => e.stopPropagation()}>
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
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    marginTop: 8,
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
                                    pointerEvents: 'auto',
                                    zIndex: 60,
                                }}
                            >
                                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', paddingBottom: 8, borderBottom: '1px solid #444', marginBottom: 4 }}>
                                    Menu
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowNewGameScreen(true)
                                        setIsMenuOpen(false)
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

                            // Construct TurnState for the active player
                            let turnState = undefined;
                            if (isCurrent) {
                                const validMeepleTypes = getValidMeepleTypes(gameState)
                                turnState = {
                                    phase: turnPhase,
                                    interactionState,
                                    statusText,
                                    instructionText,
                                    currentTile: currentTile ?? undefined,
                                    tileDefinition: currentTile ? gameState.staticTileMap[currentTile.definitionId] : undefined,
                                    actions: {
                                        rotate: rotateTentativeTile,
                                        confirm: confirmTilePlacement,
                                        cancel: cancelTilePlacement,
                                        skip: skipMeeple,
                                        undo: undoTilePlacement,
                                        selectMeeple: setSelectedMeepleType,
                                        confirmMeeple: confirmMeeplePlacement,
                                        cancelMeeple: cancelMeeplePlacement,
                                    },
                                    selectedMeepleType: selectedMeepleType,
                                    validMeepleTypes,
                                };
                            }

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
                                        position: 'relative',
                                        zIndex: isCurrent ? 10 : 1,
                                    }}
                                >
                                    <PlayerCard
                                        player={p}
                                        isCurrentTurn={isCurrent}
                                        hasTradersBuilders={hasTradersBuilders}
                                        turnState={turnState}
                                    />
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

