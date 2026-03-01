import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
import { getAllPotentialPlacements, getValidMeepleTypes } from '../../core/engine/GameEngine.ts'
import { getFallbackTileMap } from '../../services/tileRegistry.ts'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo, useRef } from 'react'
import { SetupScreen } from '../setup/SetupScreen.tsx'
import { PlayerCard } from '../ui/PlayerCard.tsx'
import { TileSVG } from '../svg/TileSVG.tsx'
import { useCastSender } from '../../cast/useCastSender.ts'

const floatingBtnStyle = (from: string, to: string): React.CSSProperties => ({
    background: `linear-gradient(135deg, ${from}, ${to})`,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 3px 12px rgba(0,0,0,0.5)',
})

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

    const { selectedMeepleType, setSelectedMeepleType, boardScale, boardOffset } = useUIStore()
    const { sdkReady } = useCastSender()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showNewGameScreen, setShowNewGameScreen] = useState(false)
    const [showOpponents, setShowOpponents] = useState(true)
    const [showScoreboard, setShowScoreboard] = useState(false)

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

    // Hide system cursor and inject tile-cursor when in PLACE_TILE+IDLE
    const isCursorModePre = gameState?.turnPhase === 'PLACE_TILE' && interactionState === 'IDLE'
    useEffect(() => {
        if (!isCursorModePre) return
        const style = document.createElement('style')
        style.textContent = '* { cursor: none !important; }'
        document.head.appendChild(style)
        return () => { document.head.removeChild(style) }
    }, [isCursorModePre])

    // Scroll wheel rotates tile during PLACE_TILE
    useEffect(() => {
        if (gameState?.turnPhase !== 'PLACE_TILE') return
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            rotateTentativeTile()
        }
        window.addEventListener('wheel', handleWheel, { passive: false })
        return () => window.removeEventListener('wheel', handleWheel)
    }, [gameState?.turnPhase, rotateTentativeTile])

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

    // ── Tile cursor ───────────────────────────────────────────────────────────
    const TILE_CURSOR_SIZE = 72
    // isCursorMode: tile image follows cursor during PLACE_TILE+IDLE
    const isCursorMode = turnPhase === 'PLACE_TILE' && interactionState === 'IDLE'

    // ── Floating buttons near the active tile ──────────────────────────────────
    const CELL_SIZE = 88
    const BOARD_PADDING = 3
    const tentativeTileCoord = useGameStore(s => s.tentativeTileCoord)

    // Which coordinate to anchor floating buttons to
    const floatingCoord = interactionState === 'TILE_PLACED_TENTATIVELY'
        ? tentativeTileCoord
        : (turnPhase === 'PLACE_MEEPLE' ? gameState?.lastPlacedCoord : null)

    const tileButtonPos = useMemo(() => {
        if (!floatingCoord || !gameState) return null
        const board = gameState.board
        const minX = board.minX - BOARD_PADDING
        const maxX = board.maxX + BOARD_PADDING
        const minY = board.minY - BOARD_PADDING
        const maxY = board.maxY + BOARD_PADDING
        const boardWidth  = (maxX - minX + 1) * CELL_SIZE
        const boardHeight = (maxY - minY + 1) * CELL_SIZE
        const { x: cx, y: cy } = floatingCoord
        // Bottom-center of the tile in screen coords
        const dx = (cx - minX + 0.5) * CELL_SIZE - boardWidth  / 2
        const dy = (cy - minY + 1)   * CELL_SIZE - boardHeight / 2
        return {
            x: window.innerWidth  / 2 + boardOffset.x + dx * boardScale,
            y: window.innerHeight / 2 + boardOffset.y + dy * boardScale + 8,
        }
    }, [floatingCoord, gameState, boardOffset, boardScale])

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

            {/* ── Top-right controls — single unified pill ─────────────────────── */}
            <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                zIndex: 41,
                pointerEvents: 'none',
                background: 'rgba(0,0,0,0.65)',
                border: '1px solid #444',
                borderRadius: 24,
                overflow: 'hidden',
            }}>
                {/* Chromecast */}
                {sdkReady && (
                    <div style={{
                        padding: '7px 10px',
                        borderRight: '1px solid #444',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'auto',
                    }}>
                        <google-cast-launcher style={{
                            display: 'inline-block',
                            width: 20,
                            height: 20,
                            cursor: 'pointer',
                            '--connected-color': '#4CAF50',
                            '--disconnected-color': '#aaa',
                        } as React.CSSProperties} />
                    </div>
                )}

                {/* Scoreboard toggle */}
                <button
                    onClick={() => setShowScoreboard(v => !v)}
                    style={{
                        background: showScoreboard ? 'rgba(232,216,160,0.18)' : 'transparent',
                        border: 'none',
                        borderRight: '1px solid #444',
                        color: '#e8d8a0',
                        padding: '7px 12px',
                        fontSize: 15,
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    title="Tableau des scores"
                    aria-label="Tableau des scores"
                >
                    🏆
                </button>

                {/* Tiles counter */}
                <div style={{
                    color: '#ddd',
                    padding: '7px 14px',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                }}>
                    {tileBag.length} tuiles
                    {hasDragonFairy && (
                        <span style={{ marginLeft: 8, fontSize: 11 }}>
                            <span style={{ color: '#e74c3c' }}>{dfData?.dragonInPlay ? '\u25C6' : '\u25C7'}</span>
                            {' '}
                            <span style={{ color: '#f1c40f' }}>{dfData?.fairyPosition ? '\u2605' : '\u2606'}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* ── Scoreboard Panel ─────────────────────────────────────────────── */}
            {showScoreboard && (
                <>
                    {/* Backdrop — click to close */}
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 58, pointerEvents: 'auto' }}
                        onPointerDown={() => setShowScoreboard(false)}
                    />
                    {/* Panel */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 64,
                            right: 16,
                            width: 340,
                            background: 'rgba(20,22,32,0.97)',
                            border: '1px solid #444',
                            borderRadius: 14,
                            padding: '16px 18px',
                            zIndex: 59,
                            pointerEvents: 'auto',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
                            color: '#f0f0f0',
                            fontSize: 13,
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontWeight: 'bold', color: '#e8d8a0', fontSize: 15, marginBottom: 12, textAlign: 'center' }}>
                            🏆 Tableau des scores
                        </div>
                        {(() => {
                            const sorted = [...players].sort((a, b) => b.score - a.score)
                            const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }
                            const cats: Array<'ROAD' | 'CITY' | 'CLOISTER' | 'FIELD' | 'TRADER'> = ['ROAD', 'CITY', 'CLOISTER', 'FIELD', ...(hasTradersBuilders ? ['TRADER' as const] : [])]
                            const activeCats = cats.filter(c => players.some(p => (p.scoreBreakdown?.[c] ?? 0) > 0))
                            const CAT_ICONS: Record<string, string> = { ROAD: '🛤️', CITY: '🏰', CLOISTER: '⛪', FIELD: '🌾', TRADER: '📦' }
                            return (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: 24, padding: '4px 2px' }} />
                                            <th style={{ textAlign: 'left', padding: '4px 6px', color: '#aaa', fontWeight: 'normal' }}>Joueur</th>
                                            {activeCats.map(c => (
                                                <th key={c} style={{ textAlign: 'center', padding: '4px 4px', color: '#888', fontWeight: 'normal', fontSize: 16 }} title={c}>{CAT_ICONS[c]}</th>
                                            ))}
                                            <th style={{ textAlign: 'center', padding: '4px 6px', color: '#e8d8a0', fontWeight: 'bold', borderLeft: '1px solid #444' }}>Pts</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sorted.map((p, rank) => (
                                            <tr key={p.id} style={{ borderTop: '1px solid #333' }}>
                                                <td style={{ padding: '6px 2px', fontSize: 16 }}>{MEDAL[rank] ?? `#${rank + 1}`}</td>
                                                <td style={{ padding: '6px 6px' }}>
                                                    <span style={{ color: p.color, fontWeight: 'bold' }}>{p.name}</span>
                                                </td>
                                                {activeCats.map(c => (
                                                    <td key={c} style={{ textAlign: 'center', padding: '6px 4px' }}>
                                                        {(p.scoreBreakdown?.[c] ?? 0) > 0
                                                            ? <span>{p.scoreBreakdown![c]}</span>
                                                            : <span style={{ color: '#444' }}>—</span>}
                                                    </td>
                                                ))}
                                                <td style={{ textAlign: 'center', padding: '6px 6px', fontWeight: 'bold', fontSize: 15, color: rank === 0 ? '#e8d8a0' : '#f0f0f0', borderLeft: '1px solid #444' }}>
                                                    {p.score}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        })()}
                    </div>
                </>
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
                        aria-label="Menu"
                        aria-expanded={isMenuOpen}
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
                    {/* All players — inactive collapsed when showOpponents=false, active always visible */}
                    <AnimatePresence mode="popLayout">
                        {orderedPlayers.map((p) => {
                            const isActive = p.id === currentPlayer.id
                            return (
                                <motion.div
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={
                                        isActive
                                            ? { opacity: 1, scale: 1, x: 0 }
                                            : showOpponents
                                                ? { opacity: 0.7, scale: 0.95, x: 0 }
                                                : { opacity: 0.5, scale: 0.92, x: 0 }
                                    }
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    style={{
                                        position: 'relative',
                                        zIndex: isActive ? 10 : 1,
                                        pointerEvents: 'auto',
                                        cursor: isActive ? 'default' : 'pointer',
                                        ...(!isActive && !showOpponents ? {
                                            height: 8,
                                            overflow: 'hidden',
                                            marginBottom: -4,
                                        } : {}),
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        if (isActive) return
                                        if ((e.target as HTMLElement).closest('button')) return
                                        setShowOpponents(!showOpponents)
                                    }}
                                >
                                    <PlayerCard
                                        player={p}
                                        isCurrentTurn={isActive}
                                        isBuilderBonusTurn={isActive && isBuilderBonusTurn}
                                        hasTradersBuilders={hasTradersBuilders}
                                        hasInnsCathedrals={hasInnsCathedrals}
                                        hasDragonHeldBy={dfData?.dragonHeldBy ?? null}
                                        useModernTerminology={useModernTerminology}
                                        turnState={isActive ? currentPlayerTurnState : undefined}
                                    />
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Floating action buttons near tile ────────────────────────── */}
            {tileButtonPos && (
                <div
                    style={{
                        position: 'absolute',
                        left: tileButtonPos.x,
                        top: tileButtonPos.y,
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 8,
                        zIndex: 60,
                        pointerEvents: 'auto',
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {interactionState === 'TILE_PLACED_TENTATIVELY' && (
                        <>
                            <button onClick={confirmTilePlacement} style={floatingBtnStyle('#27ae60', '#1e8449')}>
                                ✓ Confirm
                            </button>
                            <button onClick={cancelTilePlacement} style={floatingBtnStyle('#c0392b', '#922b21')}>
                                ✕ Cancel
                            </button>
                        </>
                    )}
                    {turnPhase === 'PLACE_MEEPLE' && interactionState === 'MEEPLE_SELECTED_TENTATIVELY' && (
                        <>
                            <button onClick={confirmMeeplePlacement} style={floatingBtnStyle('#27ae60', '#1e8449')}>
                                ✓ Confirm
                            </button>
                            <button onClick={cancelMeeplePlacement} style={floatingBtnStyle('#c0392b', '#922b21')}>
                                ✕ Cancel
                            </button>
                        </>
                    )}
                    {turnPhase === 'PLACE_MEEPLE' && interactionState !== 'MEEPLE_SELECTED_TENTATIVELY' && (
                        <>
                            <button onClick={undoTilePlacement} style={floatingBtnStyle('#c0392b', '#922b21')}>
                                ↩ Undo
                            </button>
                            <button onClick={skipMeeple} style={floatingBtnStyle('#7f8c8d', '#606c6d')}>
                                Skip
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ── Tile cursor (replaces hand cursor during PLACE_TILE+IDLE) ─── */}
            {isCursorMode && currentTile && gameState.staticTileMap[currentTile.definitionId] && (
                <div style={{
                    position: 'absolute',
                    left: cursorPos.x - TILE_CURSOR_SIZE / 2,
                    top: cursorPos.y - TILE_CURSOR_SIZE / 2,
                    width: TILE_CURSOR_SIZE,
                    height: TILE_CURSOR_SIZE,
                    borderRadius: 6,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    zIndex: 70,
                    opacity: 0.88,
                    boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 0 2px ${currentPlayer.color}80`,
                }}>
                    <TileSVG
                        definition={gameState.staticTileMap[currentTile.definitionId]}
                        rotation={currentTile.rotation}
                        size={TILE_CURSOR_SIZE}
                    />
                </div>
            )}
        </div>
    )
}

