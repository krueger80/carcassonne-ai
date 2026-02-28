import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
import { getAllPotentialPlacements, getValidMeepleTypes } from '../../core/engine/GameEngine.ts'
import { getFallbackTileMap } from '../../services/tileRegistry.ts'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo, useRef } from 'react'
import { SetupScreen } from '../setup/SetupScreen.tsx'
import { PlayerCard } from '../ui/PlayerCard.tsx'
import { useCastSender } from '../../cast/useCastSender.ts'

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
    const { sdkReady } = useCastSender()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showNewGameScreen, setShowNewGameScreen] = useState(false)
    const [showOpponents, setShowOpponents] = useState(true)

    // Track cursor position for floating active player card
    const [cursorPos, setCursorPos] = useState({ x: 200, y: 400 })
    const rafRef = useRef<number>(0)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(() => {
                setCursorPos({ x: e.clientX, y: e.clientY })
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(rafRef.current)
        }
    }, [])

    // Reset meeple type selection when turn changes
    useEffect(() => {
        setSelectedMeepleType('NORMAL')
    }, [gameState?.currentPlayerIndex, setSelectedMeepleType])

    // Failsafe: recalculate valid placements on mount/phase-change.
    // Always merges fallback tile map with persisted map to cover the page-refresh
    // case where staticTileMap from localStorage may be stale/incomplete.
    useEffect(() => {
        if (!gameState) return
        if (gameState.turnPhase === 'PLACE_TILE' && gameState.currentTile) {
            const store = useGameStore.getState()
            if (store.interactionState === 'TILE_PLACED_TENTATIVELY') return
            // Merge: fallback covers all hardcoded tiles; persisted map may have DB-only tiles
            const mergedMap = { ...getFallbackTileMap(), ...(gameState.staticTileMap ?? {}) }
            const potential = getAllPotentialPlacements(gameState.board, mergedMap, gameState.currentTile)
            useGameStore.setState((draft) => {
                draft.validPlacements = potential
                // Patch staticTileMap so subsequent isValidPlacement calls also work
                if (draft.gameState) {
                    draft.gameState.staticTileMap = mergedMap
                }
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState?.turnPhase, gameState?.currentTile?.definitionId, gameState?.currentTile?.rotation])

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

    // ── Current player turn state (shared between floating card and map) ─────
    const validMeepleTypesForCard = getValidMeepleTypes(gameState)
    const currentPlayerTurnState = {
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
                if (useModernTerminology && (type === 'BUILDER' || type === 'PIG')) {
                    const currentSecondary = useGameStore.getState().tentativeSecondaryMeepleType
                    if (currentSecondary === type) {
                        useGameStore.setState({ tentativeSecondaryMeepleType: null })
                    } else {
                        useGameStore.setState({ tentativeSecondaryMeepleType: type })
                        const currentPrimary = useUIStore.getState().selectedMeepleType
                        if (currentPrimary !== 'NORMAL' && currentPrimary !== 'BIG') {
                            setSelectedMeepleType('NORMAL')
                            if (interactionState === 'MEEPLE_SELECTED_TENTATIVELY') {
                                setTentativeMeepleType('NORMAL')
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
        validMeepleTypes: validMeepleTypesForCard,
        dragonOrientations,
        tentativeDragonFacing,
        dragonPlaceTargets,
        dragonMovesRemaining: dfData?.dragonMovement?.movesRemaining,
        canUndo: turnPhase === 'DRAGON_ORIENT' && !dfData?.dragonMovement && !!gameState.lastPlacedCoord,
    }

    // ── Floating card opacity based on interaction state ──────────────────────
    const floatingCardOpacity =
        turnPhase === 'PLACE_TILE' && interactionState === 'IDLE' ? 0.38 :
        turnPhase === 'PLACE_TILE' && interactionState === 'TILE_PLACED_TENTATIVELY' ? 0.72 :
        1.0

    // ── Floating card position (cursor-relative, clamped to screen) ───────────
    const CARD_W = 300
    const CARD_H = 320
    const rawLeft = cursorPos.x + 20
    const rawTop  = cursorPos.y - 50
    const flipLeft = rawLeft + CARD_W > window.innerWidth - 8
    const floatingLeft = Math.max(8, flipLeft ? cursorPos.x - CARD_W - 20 : rawLeft)
    const floatingTop  = Math.max(8, Math.min(rawTop, window.innerHeight - CARD_H - 8))

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            userSelect: 'none',
            WebkitUserSelect: 'none',
        }}>
            {/* ── Bonus Turn Banner (Top Center) ─────────────────────────────── */}
            <AnimatePresence>
                {isBuilderBonusTurn && (
                    <motion.div
                        key="bonus-turn-banner"
                        initial={{ opacity: 0, y: -30, scale: 0.9, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        style={{
                            position: 'absolute',
                            top: 16,
                            left: '50%',
                            zIndex: 55,
                            pointerEvents: 'none',
                        }}
                    >
                        <motion.div
                            animate={{ boxShadow: [
                                `0 0 15px ${currentPlayer.color}60, 0 4px 20px rgba(0,0,0,0.5)`,
                                `0 0 35px ${currentPlayer.color}90, 0 4px 20px rgba(0,0,0,0.5)`,
                                `0 0 15px ${currentPlayer.color}60, 0 4px 20px rgba(0,0,0,0.5)`,
                            ]}}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                background: 'rgba(20, 25, 35, 0.92)',
                                backdropFilter: 'blur(8px)',
                                border: `2px solid ${currentPlayer.color}`,
                                borderRadius: 12,
                                padding: '8px 28px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            <span style={{ fontSize: 20 }}>&#x2692;</span>
                            <span style={{
                                fontSize: 18,
                                fontWeight: 900,
                                letterSpacing: 2,
                                textTransform: 'uppercase',
                                color: currentPlayer.color,
                            }}>
                                Bonus Turn
                            </span>
                            <span style={{ fontSize: 20 }}>&#x2692;</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

            {/* ── Chromecast Button ───────────────────────────────────────────── */}
            {sdkReady && (
                <div style={{
                    position: 'absolute',
                    top: 28,
                    right: 140,
                    pointerEvents: 'auto',
                    zIndex: 40,
                }}>
                    <google-cast-launcher style={{
                        display: 'inline-block',
                        width: 24,
                        height: 24,
                        cursor: 'pointer',
                        '--connected-color': '#4CAF50',
                        '--disconnected-color': '#fff',
                    } as React.CSSProperties} />
                </div>
            )}

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

                                <div style={{ borderTop: '1px solid #444', margin: '4px 0' }} />

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        window.open(
                                            `${window.location.origin}${window.location.pathname}#cast`,
                                            '_blank',
                                        )
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
                                    <span>📺</span> Cast to TV
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Vertical Player Stack ─────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: showOpponents ? 8 : 0,
                    width: '100%',
                    pointerEvents: 'none',
                    marginTop: 'auto',
                }}
                >
                    {/* Inactive players only — current player floats near cursor */}
                    <AnimatePresence mode="popLayout">
                        {orderedPlayers.filter(p => p.id !== currentPlayer.id).map((p) => (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={
                                    showOpponents
                                        ? { opacity: 0.7, scale: 0.95, x: 0 }
                                        : { opacity: 0.5, scale: 0.92, x: 0 }
                                }
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    pointerEvents: 'auto',
                                    cursor: 'pointer',
                                    ...(!showOpponents ? {
                                        height: 8,
                                        overflow: 'hidden',
                                        marginBottom: -4,
                                    } : {}),
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('button')) return
                                    setShowOpponents(!showOpponents)
                                }}
                            >
                                <PlayerCard
                                    player={p}
                                    isCurrentTurn={false}
                                    isBuilderBonusTurn={false}
                                    hasTradersBuilders={hasTradersBuilders}
                                    hasInnsCathedrals={hasInnsCathedrals}
                                    hasDragonHeldBy={dfData?.dragonHeldBy ?? null}
                                    useModernTerminology={useModernTerminology}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Floating active player card (follows cursor) ───────────────── */}
            <div
                style={{
                    position: 'absolute',
                    left: floatingLeft,
                    top: floatingTop,
                    width: CARD_W,
                    zIndex: 55,
                    pointerEvents: 'none',
                    opacity: floatingCardOpacity,
                    transition: 'opacity 0.25s ease',
                }}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <div style={{ pointerEvents: 'auto' }}>
                    <PlayerCard
                        player={currentPlayer}
                        isCurrentTurn={true}
                        isBuilderBonusTurn={isBuilderBonusTurn}
                        hasTradersBuilders={hasTradersBuilders}
                        hasInnsCathedrals={hasInnsCathedrals}
                        hasDragonHeldBy={dfData?.dragonHeldBy ?? null}
                        useModernTerminology={useModernTerminology}
                        turnState={currentPlayerTurnState}
                    />
                </div>
            </div>
        </div>
    )
}

