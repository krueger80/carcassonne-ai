import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
import { getAllPotentialPlacements, getValidMeepleTypes } from '../../core/engine/GameEngine.ts'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { SetupScreen } from '../setup/SetupScreen.tsx'
import { PlayerCard } from '../ui/PlayerCard.tsx'

export function GameOverlay() {
    const {
        gameState,
        interactionState,
        tentativeMeepleType,
        tentativeSecondaryMeepleType,
        rotateTentativeTile,
        confirmTilePlacement,
        cancelTilePlacement,
        confirmMeeplePlacement,
        cancelMeeplePlacement,
        skipMeeple,
        setTentativeMeepleType,
        undoTilePlacement,
        drawTile,
        skipFairyMove,
        startFairyMove,
        cancelFairyMove,
        executeDragon,
        cycleDragonFacing,
        confirmDragonOrientation,
        tentativeDragonFacing,
        dragonOrientations,
        dragonPlaceTargets,
        placeDragonOnHoard,
        resolveFarmerReturn,
    } = useGameStore()

    const { selectedMeepleType, setSelectedMeepleType } = useUIStore()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showNewGameScreen, setShowNewGameScreen] = useState(false)
    const [showOpponents, setShowOpponents] = useState(true)

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
    const hasInnsCathedrals = expansionList.includes('inns-cathedrals')
    const hasTradersBuilders = expansionList.includes('traders-builders')
    const hasDragonFairy = expansionList.includes('dragon-fairy')
    const tbData = gameState.expansionData?.['tradersBuilders'] as {
        isBuilderBonusTurn?: boolean;
        useModernTerminology?: boolean;
        pendingFarmerReturns?: { playerId: string; pigNodeKey: string; fieldFeatureId: string; points: number }[];
    } | undefined
    const isBuilderBonusTurn = tbData?.isBuilderBonusTurn ?? false
    const useModernTerminology = tbData?.useModernTerminology ?? false
    const dfData = gameState.expansionData?.['dragonFairy'] as {
        dragonPosition?: { x: number; y: number } | null;
        dragonInPlay?: boolean;
        fairyPosition?: { coordinate: { x: number; y: number }; segmentId: string } | null;
        dragonHeldBy?: string | null;
        dragonMovement?: { movesRemaining: number; nextPhase: string } | null;
    } | undefined

    const pendingFarmerReturns = tbData?.pendingFarmerReturns as { playerId: string; pigNodeKey: string; fieldFeatureId: string; points: number }[] | undefined
    const activeFarmerPrompt = turnPhase === 'RETURN_FARMER' && pendingFarmerReturns && pendingFarmerReturns.length > 0 ? pendingFarmerReturns[0] : null

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
        const { magicPortalTargets } = useGameStore.getState()
        const hasPortal = magicPortalTargets.length > 0
        if (interactionState === 'MEEPLE_SELECTED_TENTATIVELY') {
            instructionText = 'Confirm or click meeple to remove'
        } else if (hasPortal) {
            instructionText = '🌀 Portal: Place Meeple Anywhere!'
        } else {
            instructionText = 'Place Meeple or Skip'
        }
    } else if (turnPhase === 'DRAGON_PLACE') {
        instructionText = '🐉 Place dragon on a Dragon Hoard tile'
    } else if (turnPhase === 'DRAGON_ORIENT') {
        const facingLabel = tentativeDragonFacing
            ? `Facing ${tentativeDragonFacing} — click to rotate`
            : 'Click dragon to orient'
        instructionText = `🐉 ${facingLabel}`
    } else if (turnPhase === 'DRAGON_MOVEMENT') {
        instructionText = '🐉 Dragon Moving...'
    } else if (turnPhase === 'FAIRY_MOVE') {
        instructionText = '✨ Place Fairy on a Meeple'
    } else if (turnPhase === 'RETURN_FARMER') {
        instructionText = 'Returning Farmers...'
    } else if (turnPhase === 'SCORE') {
        instructionText = 'Turn ending...'
    }

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            userSelect: 'none',
            WebkitUserSelect: 'none',
        }}>
            <AnimatePresence>
                {showNewGameScreen && (
                    <div style={{ pointerEvents: 'auto' }}>
                        <SetupScreen
                            onCancel={() => {
                                setShowNewGameScreen(false)
                                setIsMenuOpen(false)
                            }}
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

            {/* ── Farmer Return Prompt (C3.1) ────────────────────────────── */}
            <AnimatePresence>
                {activeFarmerPrompt && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            background: 'rgba(30, 30, 40, 0.95)',
                            border: '1px solid #555',
                            borderRadius: 12,
                            padding: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 16,
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                            pointerEvents: 'auto',
                            zIndex: 100,
                            maxWidth: 400,
                            textAlign: 'center'
                        }}
                    >
                        <h2 style={{ margin: 0, color: '#fff', fontSize: 20 }}>Return Farmer?</h2>
                        <p style={{ margin: 0, color: '#ccc', fontSize: 14 }}>
                            <strong style={{ color: players.find(p => p.id === activeFarmerPrompt.playerId)?.color }}>{players.find(p => p.id === activeFarmerPrompt.playerId)?.name}</strong>, your Pig just scored {activeFarmerPrompt.points} points and was returned. Do you want to return the farmer assigned to this pig as well?
                        </p>
                        <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 8 }}>
                            <button
                                onClick={() => resolveFarmerReturn(true)}
                                style={{
                                    flex: 1, padding: '10px 0', borderRadius: 6, border: 'none',
                                    background: '#2ecc71', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#27ae60'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#2ecc71'}
                            >
                                Yes, Return Farmer
                            </button>
                            <button
                                onClick={() => resolveFarmerReturn(false)}
                                style={{
                                    flex: 1, padding: '10px 0', borderRadius: 6, border: 'none',
                                    background: '#7f8c8d', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#95a5a6'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#7f8c8d'}
                            >
                                No, Keep Farmer
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                {hasDragonFairy && (
                    <div style={{ marginTop: 4, fontSize: 12 }}>
                        <span style={{ color: '#e74c3c' }}>{dfData?.dragonInPlay ? '\u25C6 Dragon' : '\u25C7 No Dragon'}</span>
                        {' '}
                        <span style={{ color: '#f1c40f' }}>{dfData?.fairyPosition ? '\u2605 Fairy' : '\u2606 No Fairy'}</span>
                    </div>
                )}
            </div>

            {/* ── Left Sidebar: Players & Menu ──────────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: 320, // Limit width to 320 on larger screens
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px 16px', // Better padding for mobile
                    boxSizing: 'border-box',
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

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        window.location.hash = '#catalog'
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
                                    <span>📚</span> Extension Catalog
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        window.location.hash = '#debug'
                                        setIsMenuOpen(false)
                                    }}
                                    style={{
                                        background: '#3a4a3a',
                                        border: 'none',
                                        borderRadius: 6,
                                        color: '#cfc',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#4a5a4a')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = '#3a4a3a')}
                                >
                                    <span>🔧</span> Debug Configurator
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Vertical Player Stack ─────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start', // Don't stretch cards to sidebar width
                    gap: 8,
                    width: '100%',
                    pointerEvents: 'none',
                    marginTop: 'auto', // Keep players at bottom of sidebar
                }}
                >
                    {orderedPlayers.length > 1 && (
                        <div style={{ pointerEvents: 'auto', alignSelf: 'flex-start', marginBottom: 0 }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowOpponents(!showOpponents); }}
                                style={{
                                    background: 'rgba(30, 30, 40, 0.85)',
                                    border: '1px solid #444',
                                    borderRadius: 16,
                                    color: '#ccc',
                                    padding: '4px 10px',
                                    fontSize: 11,
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(50, 50, 60, 0.95)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 30, 40, 0.85)'}
                            >
                                {showOpponents ? '▼ Hide Opponents' : '▲ Show Opponents'}
                            </button>
                        </div>
                    )}
                    <AnimatePresence mode="popLayout">
                        {orderedPlayers.map((p) => {
                            const isCurrent = p.id === currentPlayer.id;
                            if (!isCurrent && !showOpponents) return null;

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
                                        selectMeeple: (type: any) => {
                                            const useModernTerminology = tbData?.useModernTerminology ?? false
                                            console.log('--- selectMeeple ---')
                                            console.log('type clicked: ', type)
                                            console.log('modern rules: ', useModernTerminology)

                                            if (useModernTerminology && (type === 'BUILDER' || type === 'PIG')) {
                                                const currentSecondary = useGameStore.getState().tentativeSecondaryMeepleType
                                                if (currentSecondary === type) {
                                                    // Toggle off
                                                    useGameStore.setState({ tentativeSecondaryMeepleType: null })
                                                } else {
                                                    // Set secondary directly
                                                    useGameStore.setState({ tentativeSecondaryMeepleType: type })

                                                    // If normal or big isn't already selected, default to normal
                                                    const currentPrimary = useUIStore.getState().selectedMeepleType
                                                    if (currentPrimary !== 'NORMAL' && currentPrimary !== 'BIG') {
                                                        const primaryType = 'NORMAL'
                                                        setSelectedMeepleType(primaryType)
                                                        if (interactionState === 'MEEPLE_SELECTED_TENTATIVELY') {
                                                            setTentativeMeepleType(primaryType)
                                                        }
                                                    }
                                                }
                                            } else {
                                                setSelectedMeepleType(type)
                                                if (interactionState === 'MEEPLE_SELECTED_TENTATIVELY') {
                                                    setTentativeMeepleType(type)
                                                }
                                            }
                                        },
                                        confirmMeeple: confirmMeeplePlacement,
                                        cancelMeeple: turnPhase === 'FAIRY_MOVE' ? cancelFairyMove : cancelMeeplePlacement,
                                        skipFairy: skipFairyMove,
                                        startFairyMove: startFairyMove,
                                        executeDragon: executeDragon,
                                        cycleDragonFacing: cycleDragonFacing,
                                        confirmDragonOrientation: confirmDragonOrientation,
                                        placeDragonOnHoard: placeDragonOnHoard,
                                    },
                                    selectedMeepleType: selectedMeepleType,
                                    tentativeMeepleType: tentativeMeepleType,
                                    tentativeSecondaryMeepleType: tentativeSecondaryMeepleType,
                                    validMeepleTypes,
                                    dragonOrientations,
                                    tentativeDragonFacing,
                                    dragonPlaceTargets,
                                    dragonMovesRemaining: dfData?.dragonMovement?.movesRemaining,
                                    canUndo: turnPhase === 'DRAGON_ORIENT' && !dfData?.dragonMovement && !!gameState.lastPlacedCoord,
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
                                        pointerEvents: 'auto',
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    <PlayerCard
                                        player={p}
                                        isCurrentTurn={isCurrent}
                                        hasTradersBuilders={hasTradersBuilders}
                                        hasInnsCathedrals={hasInnsCathedrals}
                                        hasDragonHeldBy={dfData?.dragonHeldBy ?? null}
                                        useModernTerminology={useModernTerminology}
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

