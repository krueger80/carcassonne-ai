import { useTranslation } from 'react-i18next'
import { Player, MeepleType } from "../../core/types/player";
import { MeepleSVG } from "../svg/MeepleSVG";
import { TileSVG } from "../svg/TileSVG";
import { TileDefinition, Rotation, Direction } from "../../core/types/tile";
import { Coordinate } from "../../core/types/board";
import { Button } from "./Button";
import { getRotatedOffset } from "../../core/engine/TilePlacement";

interface TurnState {
    phase: string;
    interactionState: string;
    statusText: string;
    instructionText: string;
    currentTile?: { definitionId: string, rotation: Rotation };
    tileDefinition?: TileDefinition;
    actions: {
        rotate?: () => void;
        flip?: () => void;
        confirm?: () => void;
        cancel?: () => void;
        skip?: () => void;
        undo?: () => void;
        selectMeeple?: (type: MeepleType) => void;
        confirmMeeple?: () => void;
        cancelMeeple?: () => void;
        skipFairy?: () => void;
        startFairyMove?: () => void;
        executeDragon?: () => void;
        cycleDragonFacing?: () => void;
        confirmDragonOrientation?: () => void;
        placeDragonOnHoard?: (coord: Coordinate) => void;
        playDoubleLake?: () => void;
        discardTile?: () => void;
    };
    selectedMeepleType?: MeepleType;
    tentativeMeepleType?: MeepleType | null;
    tentativeSecondaryMeepleType?: 'BUILDER' | 'PIG' | null;
    validMeepleTypes?: MeepleType[];
    dragonOrientations?: Direction[];
    tentativeDragonFacing?: Direction | null;
    dragonPlaceTargets?: Coordinate[];
    dragonMovesRemaining?: number;
    canUndo?: boolean;
    staticTileMap?: Record<string, TileDefinition>;
    hasValidPlacements?: boolean;
}

interface PlayerCardProps {
    player: Player;
    isCurrentTurn: boolean;
    isBuilderBonusTurn?: boolean;
    hasTradersBuilders: boolean;
    hasInnsCathedrals: boolean;
    hasDragonHeldBy?: string | null;
    useModernTerminology?: boolean;
    turnState?: TurnState;
    style?: React.CSSProperties;
}

const COMMODITY_IMAGES = {
    CLOTH: '/images/TradersAndBuilders_Shared/Good_Cloth.png',
    WHEAT: '/images/TradersAndBuilders_Shared/Good_Grain.png',
    WINE: '/images/TradersAndBuilders_Shared/Good_Wine.png',
}

interface MeepleIconProps {
    type: MeepleType;
    count: number;
    tooltip: string;
    color: string;
    onClick?: () => void;
    isSelected?: boolean;
    disabled?: boolean;
    isCompact?: boolean;
}

const MeepleIcon = ({ type, count, tooltip, color, onClick, isSelected, disabled, isCompact }: MeepleIconProps) => {
    const isAvailable = count > 0;
    const isInteractive = !!onClick;
    const size = isCompact ? 20 : 24;

    return (
        <div
            onClick={!disabled && onClick ? onClick : undefined}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: isAvailable ? (isInteractive && disabled ? 0.4 : 1) : 0.3,
                cursor: isInteractive && !disabled ? 'pointer' : 'default',
                background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                padding: isCompact ? 2 : 4,
                borderRadius: 6,
                border: isSelected ? `1px solid ${color}` : '1px solid transparent',
                transition: 'all 0.2s'
            }}
            title={tooltip}
        >
            <div style={{ width: size, height: size, position: 'relative' }}>
                <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))', overflow: 'visible' }}>
                    <MeepleSVG
                        color={color}
                        x={12} y={20}
                        size={type === 'BIG' ? 9 : 8}
                        isBig={type === 'BIG'}
                        isBuilder={type === 'BUILDER'}
                        isPig={type === 'PIG'}
                    />
                </svg>
                <div style={{
                    position: 'absolute', bottom: isCompact ? -4 : -2, right: isCompact ? -6 : -4,
                    background: '#222', color: '#fff',
                    fontSize: isCompact ? 8 : 9, fontWeight: 'bold',
                    padding: '1px 3px', borderRadius: 4,
                    border: '1px solid #555',
                    pointerEvents: 'none',
                }}>
                    {count}
                </div>
            </div>
        </div>
    );
};

interface GoodIconProps {
    type: 'WINE' | 'WHEAT' | 'CLOTH';
    count: number;
    useModernTerminology: boolean;
    isCompact?: boolean;
}

const GoodIcon = ({ type, count, useModernTerminology, isCompact }: GoodIconProps) => {
    const { t } = useTranslation();
    const size = isCompact ? 20 : 24;
    const label = type === 'WINE' ? (useModernTerminology ? t('goods.chicken') : t('goods.wine')) :
        type === 'WHEAT' ? (useModernTerminology ? t('goods.grain') : t('goods.wheat')) : t('goods.cloth');

    return (
        <div style={{ position: 'relative', width: size, height: size, opacity: count > 0 ? 1 : 0.3 }} title={label}>
            <img
                src={COMMODITY_IMAGES[type]}
                width={size} height={size}
                alt={type}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
            />
            <div style={{
                position: 'absolute', bottom: isCompact ? -4 : -2, right: isCompact ? -6 : -4,
                background: '#222', color: '#fff',
                fontSize: isCompact ? 8 : 9, fontWeight: 'bold',
                padding: '1px 3px', borderRadius: 4,
                border: '1px solid #555',
                pointerEvents: 'none',
            }}>
                {count}
            </div>
        </div>
    )
}

export function PlayerCard({ player, isCurrentTurn, isBuilderBonusTurn = false, hasTradersBuilders, hasInnsCathedrals, hasDragonHeldBy, useModernTerminology = false, turnState, style }: PlayerCardProps) {
    const { t } = useTranslation();
    const { color, name, score, meeples, traderTokens } = player;

    // Interaction logic
    const isMeeplePhase = turnState?.phase === 'PLACE_MEEPLE';

    return (
        <div
            id={`player-card-${player.id}`}
            style={{
                background: isCurrentTurn ? 'rgba(35, 40, 50, 0.95)' : 'rgba(30, 30, 40, 0.85)',
                borderLeft: `${isCurrentTurn ? 4 : 3}px solid ${color}`,
                borderRadius: 12,
                padding: isCurrentTurn ? 12 : 6,
                marginBottom: 8,
                boxShadow: isBuilderBonusTurn
                    ? `0 0 18px ${color}60, 0 4px 20px rgba(0,0,0,0.4)`
                    : isCurrentTurn ? `0 4px 20px rgba(0,0,0,0.4)` : '0 2px 4px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: isCurrentTurn ? 'column' : 'row',
                alignItems: isCurrentTurn ? 'stretch' : 'center',
                flexWrap: isCurrentTurn ? 'nowrap' : 'wrap',
                gap: isCurrentTurn ? 12 : 8,
                width: isCurrentTurn ? '100%' : 'fit-content',
                maxWidth: isCurrentTurn ? 280 : 'none',
                minWidth: isCurrentTurn ? 'auto' : 'auto',
                boxSizing: 'border-box',
                transform: isCurrentTurn ? 'scale(1.02) translateX(4px)' : 'none',
                zIndex: isCurrentTurn ? 10 : 1,
                ...style
            }}>
            {/* 1. Header: Status (Active) or Name (Inactive) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, width: isCurrentTurn ? 'auto' : 'auto', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        fontWeight: 'bold',
                        color: '#f0f0f0',
                        fontSize: isCurrentTurn ? 15 : 12,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: isCurrentTurn ? 'none' : '70px'
                    }}>
                        {name}
                    </div>
                </div>
                <div style={{
                    background: isCurrentTurn ? color : 'rgba(255,255,255,0.1)',
                    color: isCurrentTurn ? '#111' : '#eee',
                    fontWeight: 'bold', fontSize: isCurrentTurn ? 14 : 11,
                    padding: isCurrentTurn ? '1px 8px' : '0px 6px', borderRadius: 12,
                    minWidth: isCurrentTurn ? 20 : 16, textAlign: 'center'
                }}>
                    {score}
                </div>
            </div>

            {/* 2. Instruction Banner (Active only) */}
            {isCurrentTurn && turnState && (
                <div style={{
                    fontSize: 13, color: '#ddd',
                    background: isBuilderBonusTurn ? `${color}12` : 'rgba(255,255,255,0.05)',
                    padding: '6px 10px', borderRadius: 6,
                    borderLeft: `2px solid ${isBuilderBonusTurn ? color : '#777'}`
                }}>
                    {turnState.instructionText}
                </div>
            )}

            {/* 3. Main Content: Split columns if we have a tile preview */}
            {(() => {
                const showTilePreview = isCurrentTurn && turnState?.phase === 'PLACE_TILE' && turnState?.tileDefinition && turnState?.currentTile;
                return (
                    <div style={{ display: 'flex', gap: isCurrentTurn ? 16 : 4, alignItems: 'center' }}>

                        {/* Left Col: Inventory */}
                        <div style={{ display: 'flex', flexDirection: isCurrentTurn ? 'column' : 'row', gap: isCurrentTurn ? 8 : 2, flex: isCurrentTurn ? 1 : '0 1 auto', flexWrap: 'wrap', alignItems: isCurrentTurn ? 'flex-start' : 'center' }}>
                            {/* Meeple Row/Grid */}
                            <div style={{ display: 'flex', gap: isCurrentTurn ? 6 : 2, flexWrap: 'wrap' }}>
                                {(() => {
                                    const getAdjustedCount = (type: MeepleType) => {
                                        let count = meeples.available[type] || 0;
                                        if (isCurrentTurn && turnState?.interactionState === 'MEEPLE_SELECTED_TENTATIVELY' && turnState.tentativeMeepleType === type) {
                                            count = Math.max(0, count - 1);
                                        }
                                        if (isCurrentTurn && turnState?.interactionState === 'MEEPLE_SELECTED_TENTATIVELY' && turnState.tentativeSecondaryMeepleType === type) {
                                            count = Math.max(0, count - 1);
                                        }
                                        return count;
                                    };

                                    return (
                                        <>
                                            <MeepleIcon
                                                type="NORMAL"
                                                count={getAdjustedCount('NORMAL')}
                                                tooltip={t('meeple.meeple')}
                                                color={color}
                                                onClick={isCurrentTurn && isMeeplePhase && turnState?.actions.selectMeeple ? () => turnState.actions.selectMeeple?.('NORMAL') : undefined}
                                                isSelected={isMeeplePhase && turnState?.selectedMeepleType === 'NORMAL'}
                                                disabled={!isCurrentTurn || !isMeeplePhase || meeples.available.NORMAL <= 0 || (turnState?.validMeepleTypes && !turnState.validMeepleTypes.includes('NORMAL'))}
                                                isCompact={!isCurrentTurn}
                                            />
                                            {hasInnsCathedrals && (
                                                <MeepleIcon
                                                    type="BIG"
                                                    count={getAdjustedCount('BIG')}
                                                    tooltip={t('meeple.bigMeeple')}
                                                    color={color}
                                                    onClick={isCurrentTurn && isMeeplePhase && turnState?.actions.selectMeeple ? () => turnState.actions.selectMeeple?.('BIG') : undefined}
                                                    isSelected={isMeeplePhase && turnState?.selectedMeepleType === 'BIG'}
                                                    disabled={!isCurrentTurn || !isMeeplePhase || (meeples.available.BIG ?? 0) <= 0 || (turnState?.validMeepleTypes && !turnState.validMeepleTypes.includes('BIG'))}
                                                    isCompact={!isCurrentTurn}
                                                />
                                            )}
                                            {hasTradersBuilders && (
                                                <>
                                                    <MeepleIcon
                                                        type="BUILDER"
                                                        count={getAdjustedCount('BUILDER')}
                                                        tooltip={t('meeple.builder')}
                                                        color={color}
                                                        onClick={isCurrentTurn && isMeeplePhase && turnState?.actions.selectMeeple ? () => turnState.actions.selectMeeple?.('BUILDER') : undefined}
                                                        isSelected={isMeeplePhase && (turnState?.selectedMeepleType === 'BUILDER' || turnState?.tentativeSecondaryMeepleType === 'BUILDER')}
                                                        disabled={!isCurrentTurn || !isMeeplePhase || (meeples.available.BUILDER ?? 0) <= 0 || (turnState?.validMeepleTypes && !turnState.validMeepleTypes.includes('BUILDER'))}
                                                        isCompact={!isCurrentTurn}
                                                    />
                                                    <MeepleIcon
                                                        type="PIG"
                                                        count={getAdjustedCount('PIG')}
                                                        tooltip={t('meeple.pig')}
                                                        color={color}
                                                        onClick={isCurrentTurn && isMeeplePhase && turnState?.actions.selectMeeple ? () => turnState.actions.selectMeeple?.('PIG') : undefined}
                                                        isSelected={isMeeplePhase && (turnState?.selectedMeepleType === 'PIG' || turnState?.tentativeSecondaryMeepleType === 'PIG')}
                                                        disabled={!isCurrentTurn || !isMeeplePhase || (meeples.available.PIG ?? 0) <= 0 || (turnState?.validMeepleTypes && !turnState.validMeepleTypes.includes('PIG'))}
                                                        isCompact={!isCurrentTurn}
                                                    />
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                                {/* Dragon held by this player */}
                                {hasDragonHeldBy === player.id && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: isCurrentTurn ? 4 : 2,
                                        borderRadius: 6,
                                        border: `1px solid ${isCurrentTurn && (turnState?.phase === 'DRAGON_ORIENT' || turnState?.phase === 'DRAGON_PLACE') ? '#e74c3c' : '#666'}`,
                                        background: isCurrentTurn && (turnState?.phase === 'DRAGON_ORIENT' || turnState?.phase === 'DRAGON_PLACE')
                                            ? 'rgba(231, 76, 60, 0.15)' : 'transparent',
                                    }} title={t('meeple.dragon')}>
                                        <div style={{ width: isCurrentTurn ? 24 : 20, height: isCurrentTurn ? 24 : 20 }}>
                                            <svg width={isCurrentTurn ? 24 : 20} height={isCurrentTurn ? 24 : 20} viewBox="0 0 24 24"
                                                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                                                <text x="12" y="18" textAnchor="middle" fontSize={isCurrentTurn ? 16 : 14} fill="#e74c3c">
                                                    🐉
                                                </text>
                                            </svg>
                                        </div>
                                        {isCurrentTurn && <div style={{ fontSize: 9, color: '#e74c3c', marginTop: 2, fontWeight: 'bold' }}>{t('meeple.dragon')}</div>}
                                    </div>
                                )}
                            </div>

                            {/* Goods Collection (Traders) */}
                            {hasTradersBuilders && (
                                <div style={{
                                    display: 'flex', gap: isCurrentTurn ? 10 : 6,
                                    paddingTop: isCurrentTurn ? 8 : 0,
                                    marginTop: isCurrentTurn ? 4 : 0,
                                    borderTop: isCurrentTurn ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                    paddingLeft: !isCurrentTurn ? 4 : 0,
                                    borderLeft: !isCurrentTurn ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                }}>
                                    <GoodIcon type="WINE" count={traderTokens?.WINE ?? 0} useModernTerminology={useModernTerminology} isCompact={!isCurrentTurn} />
                                    <GoodIcon type="WHEAT" count={traderTokens?.WHEAT ?? 0} useModernTerminology={useModernTerminology} isCompact={!isCurrentTurn} />
                                    <GoodIcon type="CLOTH" count={traderTokens?.CLOTH ?? 0} useModernTerminology={useModernTerminology} isCompact={!isCurrentTurn} />
                                </div>
                            )}
                        </div>

                        {/* Right Col: Tile Preview (active player, PLACE_TILE phase only) */}
                        {showTilePreview && turnState.tileDefinition && turnState.currentTile && (() => {
                            const def = turnState.tileDefinition;
                            const currentRot = turnState.currentTile.rotation;
                            const parts = [{ dx: 0, dy: 0, defId: def.id }];
                            if (def.linkedTiles) {
                                for (const lt of def.linkedTiles) {
                                    parts.push({ ...getRotatedOffset(lt.dx, lt.dy, currentRot), defId: lt.definitionId });
                                }
                            }

                            let minDx = 0, maxDx = 0, minDy = 0, maxDy = 0;
                            parts.forEach(p => {
                                if (p.dx < minDx) minDx = p.dx;
                                if (p.dx > maxDx) maxDx = p.dx;
                                if (p.dy < minDy) minDy = p.dy;
                                if (p.dy > maxDy) maxDy = p.dy;
                            });

                            const gridW = maxDx - minDx + 1;
                            const gridH = maxDy - minDy + 1;

                            // Base size of each cell
                            const CELL_SIZE = 80;
                            // Scale down if it's very large? Double tiles can just take more space or we can scale.
                            // Better to just let the container be larger. 
                            // But usually we don't want it to overflow the screen. 
                            // 80x80 is default. Let's make it gridW*80 x gridH*80, but scaled down if it's > 2.
                            const scale = Math.max(1, Math.max(gridW, gridH) / 1.5); // scale down a bit if it's 2 or 3
                            const displayCellSize = CELL_SIZE / scale;

                            return (
                                <div style={{
                                    flexShrink: 0,
                                    width: gridW * displayCellSize,
                                    height: gridH * displayCellSize,
                                    borderRadius: 8,
                                    position: 'relative',
                                    border: `2px solid ${color}`,
                                    boxShadow: `0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px ${color}40`,
                                    background: '#000', // optional background to hide gaps if any
                                }}>
                                    {parts.map((p, idx) => {
                                        const partDef = turnState.staticTileMap ? turnState.staticTileMap[p.defId] : (p.defId === def.id ? def : null);
                                        if (!partDef) return null;
                                        return (
                                            <div key={idx} style={{
                                                position: 'absolute',
                                                left: (p.dx - minDx) * displayCellSize,
                                                top: (p.dy - minDy) * displayCellSize,
                                                width: displayCellSize,
                                                height: displayCellSize,
                                                overflow: 'hidden',
                                            }}>
                                                <TileSVG
                                                    definition={partDef}
                                                    rotation={currentRot}
                                                    size={displayCellSize}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}

                    </div>
                );
            })()}

            {/* 4. Action Buttons (Active only) */}
            {isCurrentTurn && turnState && (
                <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                    {turnState.phase === 'PLACE_TILE' && turnState.interactionState === 'IDLE' && (
                        <>
                            <Button onClick={turnState.actions.rotate!} style={{ flex: 1 }}>⭮ {t('game.rotate')}</Button>
                            {turnState.tileDefinition?.flipSideDefinitionId && turnState.actions.flip && (
                                <Button onClick={turnState.actions.flip} style={{ flex: 1 }}>⇅ {t('game.flip', 'Flip')}</Button>
                            )}
                            {turnState.actions.playDoubleLake && (
                                <Button
                                    onClick={turnState.actions.playDoubleLake}
                                    style={{ flex: 1, background: '#0099CC', color: '#fff', border: 'none' }}
                                >
                                    🌊 {t('game.playDoubleLake', 'Play Double Lake')}
                                </Button>
                            )}
                            {turnState.hasValidPlacements === false && !turnState.actions.playDoubleLake && turnState.actions.discardTile && (
                                <Button
                                    onClick={turnState.actions.discardTile}
                                    style={{ flex: 1, background: '#cc3300', color: '#fff', border: 'none' }}
                                    title="No valid placements available for this tile/side"
                                >
                                    🗑️ Discard
                                </Button>
                            )}
                        </>
                    )}
                    {/* PLACE_MEEPLE buttons are shown floating near the tile */}
                    {turnState.phase === 'DRAGON_ORIENT' && turnState.actions.confirmDragonOrientation && (
                        <>
                            <Button onClick={turnState.actions.cycleDragonFacing!} style={{ flex: 1 }}>↻ {t('game.cycle')}</Button>
                            <Button
                                onClick={turnState.actions.confirmDragonOrientation}
                                primary
                                style={{ flex: 1 }}
                                disabled={!turnState.tentativeDragonFacing}
                            >
                                {turnState.dragonMovesRemaining && turnState.dragonMovesRemaining > 0 ? t('game.confirmAndMove') : t('game.confirm')}
                            </Button>
                            {turnState.canUndo && (
                                <Button
                                    onClick={turnState.actions.undo!}
                                    danger
                                    style={{ flex: 1 }}
                                >
                                    {t('game.undoTile')}
                                </Button>
                            )}
                        </>
                    )}
                    {turnState.phase === 'DRAGON_PLACE' && turnState.dragonPlaceTargets && turnState.dragonPlaceTargets.length > 0 && (
                        <div style={{ fontSize: 12, color: '#e74c3c', textAlign: 'center', flex: 1, padding: '6px 0' }}>
                            🐉 {t('game.clickDragonHoard')}
                        </div>
                    )}
                    {turnState.phase === 'DRAGON_MOVEMENT' && turnState.actions.executeDragon && (
                        <Button onClick={turnState.actions.executeDragon} primary style={{ flex: 1 }}>🐉 {t('game.moveDragon')}</Button>
                    )}
                    {turnState.phase === 'FAIRY_MOVE' && (
                        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                            {turnState.actions.cancelMeeple && (
                                <Button onClick={turnState.actions.cancelMeeple} danger style={{ flex: 1 }}>{t('game.cancelBtn')}</Button>
                            )}
                            {turnState.actions.skipFairy && (
                                <Button onClick={turnState.actions.skipFairy} style={{ flex: 1 }}>{t('game.skipFairy')}</Button>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
