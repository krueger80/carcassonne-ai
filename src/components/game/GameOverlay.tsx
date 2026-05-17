import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'
import { getPotentialPlacementsForState, getValidMeepleTypes, getDragonHeldBy } from '../../core/engine/GameEngine.ts'
import { getFallbackTileMap } from '../../services/tileRegistry.ts'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { SetupScreen } from '../setup/SetupScreen.tsx'
import { PlayerCard } from '../ui/PlayerCard.tsx'
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
    flexShrink: 0,
})

export function GameOverlay() {
    const { t, i18n } = useTranslation()
    const {
        gameState,
        interactionState,
        tentativeMeepleType,
        tentativeSecondaryMeepleType,
        tentativeDragonFacing,
        dragonOrientations,
        dragonPlaceTargets,
        validPlacements,
        tentativeFairyTarget,
        tentativeDragonPlaceTarget,
    } = useGameStore(useShallow(s => ({
        gameState: s.gameState,
        interactionState: s.interactionState,
        tentativeMeepleType: s.tentativeMeepleType,
        tentativeSecondaryMeepleType: s.tentativeSecondaryMeepleType,
        tentativeDragonFacing: s.tentativeDragonFacing,
        dragonOrientations: s.dragonOrientations,
        dragonPlaceTargets: s.dragonPlaceTargets,
        validPlacements: s.validPlacements,
        tentativeFairyTarget: s.tentativeFairyTarget,
        tentativeDragonPlaceTarget: s.tentativeDragonPlaceTarget,
    })))

    const {
        rotateTentativeTile,
        confirmTilePlacement,
        cancelTilePlacement,
        confirmMeeplePlacement,
        cancelMeeplePlacement,
        skipMeeple,
        setTentativeMeepleType,
        undoTilePlacement,
        drawTile,
        discardTile,
        skipFairyMove,
        startFairyMove,
        executeDragon,
        cycleDragonFacing,
        confirmDragonOrientation,
        placeDragonOnHoard,
        resolveFarmerReturn,
        playDoubleLake,
        flipTile,
        retrieveAbbot: storeRetrieveAbbot,
        confirmFairyMove,
        cancelFairyTarget,
        confirmDragonPlace,
        cancelDragonPlaceTarget,
    } = useGameStore(useShallow(s => ({
        rotateTentativeTile: s.rotateTentativeTile,
        confirmTilePlacement: s.confirmTilePlacement,
        cancelTilePlacement: s.cancelTilePlacement,
        confirmMeeplePlacement: s.confirmMeeplePlacement,
        cancelMeeplePlacement: s.cancelMeeplePlacement,
        skipMeeple: s.skipMeeple,
        setTentativeMeepleType: s.setTentativeMeepleType,
        undoTilePlacement: s.undoTilePlacement,
        drawTile: s.drawTile,
        discardTile: s.discardTile,
        skipFairyMove: s.skipFairyMove,
        startFairyMove: s.startFairyMove,
        executeDragon: s.executeDragon,
        cycleDragonFacing: s.cycleDragonFacing,
        confirmDragonOrientation: s.confirmDragonOrientation,
        placeDragonOnHoard: s.placeDragonOnHoard,
        resolveFarmerReturn: s.resolveFarmerReturn,
        playDoubleLake: s.playDoubleLake,
        flipTile: s.flipTile,
        retrieveAbbot: s.retrieveAbbot,
        confirmFairyMove: s.confirmFairyMove,
        cancelFairyTarget: s.cancelFairyTarget,
        confirmDragonPlace: s.confirmDragonPlace,
        cancelDragonPlaceTarget: s.cancelDragonPlaceTarget,
    })))

    const { selectedMeepleType, setSelectedMeepleType, tileButtonPos } = useUIStore(useShallow(s => ({
        selectedMeepleType: s.selectedMeepleType,
        setSelectedMeepleType: s.setSelectedMeepleType,
        tileButtonPos: s.tileButtonPos,
    })))
    const { sdkReady } = useCastSender()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showNewGameScreen, setShowNewGameScreen] = useState(false)
    const [showScoreboard, setShowScoreboard] = useState(false)

    // Reset meeple type selection when turn changes
    useEffect(() => {
        if (!gameState) return
        const validTypes = getValidMeepleTypes(gameState)
        if (validTypes.length > 0) {
            // Prefer NORMAL if it's valid, otherwise pick first available
            if (validTypes.includes('NORMAL')) {
                setSelectedMeepleType('NORMAL')
            } else {
                setSelectedMeepleType(validTypes[0])
            }
        } else {
            setSelectedMeepleType('NORMAL')
        }
    }, [gameState?.currentPlayerIndex, setSelectedMeepleType])

    useEffect(() => {
        if (!gameState) return
        if (gameState.turnPhase === 'PLACE_TILE' && gameState.currentTile) {
            const store = useGameStore.getState()
            if (store.interactionState === 'TILE_PLACED_TENTATIVELY') return
            const mergedMap = { ...getFallbackTileMap(), ...(gameState.staticTileMap ?? {}) }
            const potential = getPotentialPlacementsForState({ ...gameState, staticTileMap: mergedMap })
            useGameStore.setState((draft) => {
                draft.validPlacements = potential
                if (draft.gameState) {
                    draft.gameState.staticTileMap = mergedMap
                }
            })
        }
    }, [gameState?.turnPhase, gameState?.currentTile?.definitionId, gameState?.currentTile?.rotation])

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
        const rotated = []
        for (let i = 1; i < players.length; i++) {
            rotated.push(players[(currentPlayerIndex + i) % players.length])
        }
        rotated.reverse()
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
    const hasAbbot = expansionList.includes('abbot')
    const tbData = gameState.expansionData?.['tradersBuilders'] as any
    const isBuilderBonusTurn = tbData?.isBuilderBonusTurn ?? false
    const useModernRules = tbData?.useModernRules ?? false
    const dfData = gameState.expansionData?.['dragonFairy'] as any
    const hasDragonHeldBy = getDragonHeldBy(gameState)

    const pendingFarmerReturns = tbData?.pendingFarmerReturns as any[]
    const activeFarmerPrompt = turnPhase === 'RETURN_FARMER' && pendingFarmerReturns && pendingFarmerReturns.length > 0 ? pendingFarmerReturns[0] : null

    let statusText = isBuilderBonusTurn
        ? t('game.playerTurnBonus', { name: currentPlayer.name })
        : t('game.playerTurn', { name: currentPlayer.name })
    let instructionText = ''

    if (turnPhase === 'DRAW_TILE') {
        instructionText = t('game.drawing')
    } else if (turnPhase === 'PLACE_TILE') {
        instructionText = interactionState === 'TILE_PLACED_TENTATIVELY' ? t('game.rotateConfirm') : t('game.placeYourTile')
    } else if (turnPhase === 'PLACE_MEEPLE') {
        instructionText = interactionState === 'MEEPLE_SELECTED_TENTATIVELY' ? t('game.confirmOrRemove') : t('game.placeMeepleOrSkip')
    } else if (turnPhase === 'DRAGON_PLACE') {
        instructionText = '🐉 ' + t('game.dragonPlace')
    } else if (turnPhase === 'DRAGON_ORIENT') {
        instructionText = '🐉 ' + (tentativeDragonFacing ? t('game.dragonFacing', { direction: tentativeDragonFacing }) : t('game.dragonClickOrient'))
    } else if (turnPhase === 'DRAGON_MOVEMENT') {
        instructionText = '🐉 ' + t('game.dragonMoving')
    } else if (turnPhase === 'FAIRY_MOVE') {
        instructionText = '✨ ' + t('game.placeFairy')
    } else if (turnPhase === 'RETURN_FARMER') {
        instructionText = t('game.returningFarmers')
    } else if (turnPhase === 'SCORE') {
        instructionText = t('game.turnEnding')
    }

    const validMeepleTypesForCard = getValidMeepleTypes(gameState)
    
    let hasValidPlacementsAtAll = validPlacements.length > 0
    if (!hasValidPlacementsAtAll && currentTile && gameState) {
        const def = gameState.staticTileMap[currentTile.definitionId]
        if (def?.flipSideDefinitionId) {
            const flippedPlacements = getPotentialPlacementsForState({ ...gameState, currentTile: { definitionId: def.flipSideDefinitionId, rotation: 0 as const } })
            hasValidPlacementsAtAll = flippedPlacements.length > 0
        }
    }

    const currentPlayerTurnState = {
        phase: turnPhase,
        interactionState,
        statusText,
        instructionText,
        currentTile: currentTile ?? undefined,
        tileDefinition: currentTile ? gameState.staticTileMap[currentTile.definitionId] : undefined,
        actions: {
            rotate: rotateTentativeTile,
            flip: flipTile,
            confirm: confirmTilePlacement,
            cancel: cancelTilePlacement,
            skip: skipMeeple,
            undo: undoTilePlacement,
            discardTile: discardTile,
            selectMeeple: (type: any) => {
                if (useModernRules && (type === 'BUILDER' || type === 'PIG')) {
                    const store = useGameStore.getState()
                    const currentSecondary = store.tentativeSecondaryMeepleType
                    if (currentSecondary === type) {
                        useGameStore.setState({ tentativeSecondaryMeepleType: null })
                        return
                    }
                    // If a tentative primary is already placed, validate the segment before touching state.
                    if (interactionState === 'MEEPLE_SELECTED_TENTATIVELY' && store.tentativeMeepleSegment && gameState) {
                        const coord = store.tentativeTileCoord ?? gameState.lastPlacedCoord
                        if (coord) {
                            const tile = gameState.board.tiles[`${coord.x},${coord.y}`]
                            const def = gameState.staticTileMap[tile?.definitionId ?? '']
                            const segType = def?.segments.find(s => s.id === store.tentativeMeepleSegment)?.type
                            const ok = (type === 'BUILDER' && (segType === 'CITY' || segType === 'ROAD'))
                                    || (type === 'PIG' && segType === 'FIELD')
                            if (!ok) {
                                useUIStore.getState().showToast(t(type === 'BUILDER' ? 'meeple.builderNeedsRoadOrCity' : 'meeple.pigNeedsField'))
                                return
                            }
                        }
                    }
                    useGameStore.setState({ tentativeSecondaryMeepleType: type })
                    const currentPrimary = useUIStore.getState().selectedMeepleType
                    if (currentPrimary !== 'NORMAL' && currentPrimary !== 'BIG') {
                        const fallback = (currentPlayer.meeples.available.NORMAL > 0) ? 'NORMAL' : 'BIG'
                        setSelectedMeepleType(fallback)
                        if (interactionState === 'MEEPLE_SELECTED_TENTATIVELY') setTentativeMeepleType(fallback)
                    }
                } else {
                    setSelectedMeepleType(type)
                    if (interactionState === 'MEEPLE_SELECTED_TENTATIVELY') setTentativeMeepleType(type)
                }
            },
            confirmMeeple: confirmMeeplePlacement,
            cancelMeeple: turnPhase === 'FAIRY_MOVE' ? undoTilePlacement : cancelMeeplePlacement,
            skipFairy: skipFairyMove,
            startFairyMove: startFairyMove,
            executeDragon: executeDragon,
            cycleDragonFacing: cycleDragonFacing,
            confirmDragonOrientation: confirmDragonOrientation,
            placeDragonOnHoard: placeDragonOnHoard,
            playDoubleLake: dfData?.doubleLakeAvailable ? playDoubleLake : undefined,
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
        staticTileMap: gameState.staticTileMap,
        hasValidPlacements: hasValidPlacementsAtAll,
    }

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none' }}>
            {/* ── Top Center Instruction Banner ── */}
            <AnimatePresence>
                {instructionText && !showScoreboard && !isMenuOpen && !showNewGameScreen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        style={{
                            position: 'absolute',
                            top: isBuilderBonusTurn ? 80 : 20,
                            left: '50%',
                            maxWidth: 'min(calc(100vw - 120px), 520px)',
                            background: 'rgba(20, 25, 35, 0.9)',
                            border: `2px solid ${currentPlayer.color || '#555'}`,
                            borderRadius: 12,
                            padding: '8px 20px',
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            lineHeight: 1.3,
                            zIndex: 60,
                            pointerEvents: 'none',
                            backdropFilter: 'blur(4px)',
                            boxShadow: `0 4px 15px rgba(0,0,0,0.5), 0 0 10px ${currentPlayer.color}40`
                        }}
                    >
                        {instructionText}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Bonus Turn Banner ── */}
            <AnimatePresence>
                {isBuilderBonusTurn && (
                    <motion.div initial={{ opacity: 0, y: -30, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
                        style={{ position: 'absolute', top: 16, left: '50%', zIndex: 55, pointerEvents: 'none' }}>
                        <motion.div animate={{ boxShadow: [`0 0 15px ${currentPlayer.color}60`, `0 0 35px ${currentPlayer.color}90`, `0 0 15px ${currentPlayer.color}60`] }} transition={{ duration: 2, repeat: Infinity }}
                            style={{ background: 'rgba(20, 25, 35, 0.92)', backdropFilter: 'blur(8px)', border: `2px solid ${currentPlayer.color}`, borderRadius: 12, padding: '8px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 20 }}>⚒</span>
                            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: currentPlayer.color }}>{t('game.bonusTurn')}</span>
                            <span style={{ fontSize: 20 }}>⚒</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showNewGameScreen && <div style={{ pointerEvents: 'auto' }}><SetupScreen onCancel={() => { setShowNewGameScreen(false); setIsMenuOpen(false); }} /></div>}
            {isMenuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 45, pointerEvents: 'auto' }} onPointerDown={() => setIsMenuOpen(false)} />}

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
                        <h2 style={{ margin: 0, color: '#fff', fontSize: 20 }}>{t('farmer.returnTitle')}</h2>
                        <p style={{ margin: 0, color: '#ccc', fontSize: 14 }}>
                            {t('farmer.returnDescription', { name: players.find(p => p.id === activeFarmerPrompt.playerId)?.name, points: activeFarmerPrompt.points })}
                        </p>
                        <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 8 }}>
                            <button
                                onClick={() => resolveFarmerReturn(true)}
                                style={{
                                    flex: 1, padding: '10px 0', borderRadius: 6, border: 'none',
                                    background: '#2ecc71', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                            >
                                {t('farmer.yesReturn')}
                            </button>
                            <button
                                onClick={() => resolveFarmerReturn(false)}
                                style={{
                                    flex: 1, padding: '10px 0', borderRadius: 6, border: 'none',
                                    background: '#7f8c8d', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                            >
                                {t('farmer.noKeep')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Top-right Controls (cast only — trophy/tile-count moved into hamburger menu) ── */}
            {sdkReady && (
                <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', zIndex: 60, pointerEvents: 'auto', background: 'rgba(0,0,0,0.65)', border: '1px solid #444', borderRadius: 24, overflow: 'hidden' }}>
                    <div style={{ padding: '7px 10px', display: 'flex', alignItems: 'center' }}><google-cast-launcher style={{ width: 20, height: 20, cursor: 'pointer' } as any} /></div>
                </div>
            )}

            {/* ── Scoreboard ── */}
            {showScoreboard && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 58, pointerEvents: 'auto' }} onPointerDown={() => setShowScoreboard(false)} />
                    <div style={{ position: 'absolute', top: 64, right: 16, width: 340, background: 'rgba(20,22,32,0.97)', border: '1px solid #444', borderRadius: 14, padding: '16px 18px', zIndex: 59, pointerEvents: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.7)' }}>
                        <div style={{ fontWeight: 'bold', color: '#e8d8a0', fontSize: 15, marginBottom: 12, textAlign: 'center' }}>🏆 {t('menu.scoreboard')}</div>
                        <table style={{ width: '100%', color: '#fff' }}>
                            <tbody>
                                {[...players].sort((a,b) => b.score - a.score).map((p, i) => (
                                    <tr key={p.id}><td style={{padding:'4px'}}>{i+1}</td><td style={{color:p.color, fontWeight:'bold'}}>{p.name}</td><td style={{textAlign:'right'}}>{p.score}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ── Left Sidebar ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', padding: '24px 12px', zIndex: 50, pointerEvents: 'none' }}>
                <div style={{ position: 'relative', pointerEvents: 'auto', alignSelf: 'flex-start', marginBottom: 20 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen) }}
                        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #555', borderRadius: 8, color: 'white', padding: 8, cursor: 'pointer' }}
                        aria-label={t('menu.menu', 'Menu')}
                        aria-expanded={isMenuOpen}
                    >
                        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    </button>
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: 'absolute', top: '100%', left: 0, background: 'rgba(30, 30, 40, 0.95)', border: '1px solid #555', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220, pointerEvents: 'auto' }}>
                                <div style={{ color: '#ddd', fontSize: 13, fontFamily: 'monospace', padding: '4px 8px', borderBottom: '1px solid #444' }}>{t('game.tilesCount', { count: tileBag.length })}</div>
                                <button onClick={() => { setShowScoreboard(v => !v); setIsMenuOpen(false); }} style={{ background: '#3a3a4a', border: 'none', color: '#e8d8a0', padding: '8px', borderRadius: 4, cursor: 'pointer', textAlign: 'left' }}>🏆 {t('menu.scoreboard')}</button>
                                <button onClick={() => { setShowNewGameScreen(true); setIsMenuOpen(false); }} style={{ background: '#3a3a4a', border: 'none', color: '#fff', padding: '8px', borderRadius: 4, cursor: 'pointer', textAlign: 'left' }}>🔄 {t('menu.newGame')}</button>
                                <button onClick={() => { i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr'); }} style={{ background: '#3a3a4a', border: 'none', color: '#fff', padding: '8px', borderRadius: 4, cursor: 'pointer', textAlign: 'left' }}>🌐 {i18n.language === 'fr' ? 'English' : 'Français'}</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 'auto' }}>
                    <AnimatePresence>
                        {orderedPlayers.map((p) => (
                            <motion.div key={p.id} layout initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ pointerEvents: 'auto' }}>
                                <PlayerCard 
                                    player={p} 
                                    isCurrentTurn={p.id === currentPlayer.id} 
                                    hasTradersBuilders={hasTradersBuilders} 
                                    hasInnsCathedrals={hasInnsCathedrals} 
                                    hasAbbot={hasAbbot} 
                                    hasDragonHeldBy={hasDragonHeldBy}
                                    turnState={p.id === currentPlayer.id ? currentPlayerTurnState : undefined} 
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Floating Action Buttons (Projected from 3D) ── */}
            {tileButtonPos && !currentPlayer?.isBot && (
                <div style={{ 
                    position: 'absolute', 
                    left: tileButtonPos.x,
                    top: tileButtonPos.y + 40,
                    transform: 'translateX(-50%)',                    display: 'flex', 
                    gap: 10, 
                    zIndex: 100, 
                    pointerEvents: 'auto',
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '8px 12px',
                    borderRadius: 12,
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    {(interactionState === 'TILE_PLACED_TENTATIVELY' || interactionState === 'MEEPLE_SELECTED_TENTATIVELY' || (turnPhase === 'FAIRY_MOVE' && tentativeFairyTarget) || (turnPhase === 'DRAGON_PLACE' && tentativeDragonPlaceTarget)) ? (
                        <>
                            <button 
                                onClick={
                                    interactionState === 'TILE_PLACED_TENTATIVELY' ? confirmTilePlacement : 
                                    interactionState === 'MEEPLE_SELECTED_TENTATIVELY' ? confirmMeeplePlacement :
                                    turnPhase === 'FAIRY_MOVE' ? confirmFairyMove :
                                    confirmDragonPlace
                                } 
                                style={floatingBtnStyle('#27ae60', '#1e8449')}
                            >
                                {t('game.confirmBtn')}
                            </button>
                            <button 
                                onClick={
                                    interactionState === 'TILE_PLACED_TENTATIVELY' ? cancelTilePlacement : 
                                    interactionState === 'MEEPLE_SELECTED_TENTATIVELY' ? cancelMeeplePlacement :
                                    turnPhase === 'FAIRY_MOVE' ? cancelFairyTarget :
                                    cancelDragonPlaceTarget
                                } 
                                style={floatingBtnStyle('#c0392b', '#922b21')}
                            >
                                {t('game.cancelActionBtn')}
                            </button>
                        </>
                    ) : (turnPhase === 'PLACE_MEEPLE' || (turnPhase === 'DRAGON_PLACE' && !tentativeDragonPlaceTarget)) ? (
                        <>
                            <button onClick={undoTilePlacement} style={floatingBtnStyle('#c0392b', '#922b21')}>{t('game.undoBtn')}</button>
                            {turnPhase === 'PLACE_MEEPLE' && <button onClick={skipMeeple} style={floatingBtnStyle('#7f8c8d', '#606c6d')}>➜ {t('game.skip')}</button>}
                            {turnPhase === 'PLACE_MEEPLE' && hasAbbot && (currentPlayer.meeples.available.ABBOT ?? 0) === 0 && (() => {
                                const abbotOnBoard = currentPlayer.meeples.onBoard.find(nk => {
                                    const bm = gameState?.boardMeeples[nk]
                                    return bm && bm.meepleType === 'ABBOT' && bm.playerId === currentPlayer.id
                                })
                                if (!abbotOnBoard) return null
                                const bm = gameState!.boardMeeples[abbotOnBoard]
                                return (
                                    <button onClick={() => storeRetrieveAbbot(bm.coordinate, bm.segmentId)} style={floatingBtnStyle('#8e44ad', '#6c3483')}>⛪ {t('game.retrieveAbbot')}</button>
                                )
                            })()}
                        </>
                    ) : turnPhase === 'DRAGON_ORIENT' && confirmDragonOrientation ? (
                        <>
                            <button
                                onClick={confirmDragonOrientation}
                                style={{
                                    ...floatingBtnStyle('#27ae60', '#1e8449'),
                                    opacity: !tentativeDragonFacing ? 0.5 : 1,
                                    cursor: !tentativeDragonFacing ? 'not-allowed' : 'pointer'
                                }}
                                disabled={!tentativeDragonFacing}
                            >
                                {dfData?.dragonMovement?.movesRemaining && dfData.dragonMovement.movesRemaining > 0 ? t('game.confirmAndMove') : t('game.confirm')}
                            </button>
                            {(turnPhase === 'DRAGON_ORIENT' && !dfData?.dragonMovement && !!gameState.lastPlacedCoord) && (
                                <button
                                    onClick={undoTilePlacement!}
                                    style={floatingBtnStyle('#c0392b', '#922b21')}
                                >
                                    {t('game.undoTile')}
                                </button>
                            )}
                        </>
                    ) : (turnPhase === 'FAIRY_MOVE' && !tentativeFairyTarget) ? (
                        <>
                            <button onClick={undoTilePlacement!} style={floatingBtnStyle('#c0392b', '#922b21')}>{t('game.undoTile')}</button>
                            <button onClick={skipFairyMove} style={floatingBtnStyle('#7f8c8d', '#606c6d')}>➜ {t('game.skip')}</button>
                        </>
                    ) : null}
                </div>
            )}
        </div>
    )
}
