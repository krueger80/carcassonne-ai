import { Player, MeepleType } from "../../core/types/player";
import { MeepleSVG } from "../svg/MeepleSVG";
import { TileSVG } from "../svg/TileSVG";
import { TileDefinition, Rotation, Direction } from "../../core/types/tile";
import { Coordinate } from "../../core/types/board";
import { Button } from "./Button";

interface TurnState {
    phase: string;
    interactionState: string;
    statusText: string;
    instructionText: string;
    currentTile?: { definitionId: string, rotation: Rotation };
    tileDefinition?: TileDefinition;
    actions: {
        rotate?: () => void;
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
    const size = isCompact ? 20 : 24;
    const label = type === 'WINE' ? (useModernTerminology ? 'Chicken' : 'Wine') :
        type === 'WHEAT' ? (useModernTerminology ? 'Grain' : 'Wheat') : 'Cloth';

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
                                        tooltip="Meeple"
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
                                            tooltip="Big Meeple"
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
                                                tooltip="Builder"
                                                color={color}
                                                onClick={isCurrentTurn && isMeeplePhase && turnState?.actions.selectMeeple ? () => turnState.actions.selectMeeple?.('BUILDER') : undefined}
                                                isSelected={isMeeplePhase && (turnState?.selectedMeepleType === 'BUILDER' || turnState?.tentativeSecondaryMeepleType === 'BUILDER')}
                                                disabled={!isCurrentTurn || !isMeeplePhase || (meeples.available.BUILDER ?? 0) <= 0 || (turnState?.validMeepleTypes && !turnState.validMeepleTypes.includes('BUILDER'))}
                                                isCompact={!isCurrentTurn}
                                            />
                                            <MeepleIcon
                                                type="PIG"
                                                count={getAdjustedCount('PIG')}
                                                tooltip="Pig"
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
                            }} title="Dragon">
                                <div style={{ width: isCurrentTurn ? 24 : 20, height: isCurrentTurn ? 24 : 20 }}>
                                    <svg width={isCurrentTurn ? 24 : 20} height={isCurrentTurn ? 24 : 20} viewBox="0 0 24 24"
                                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                                        <text x="12" y="18" textAnchor="middle" fontSize={isCurrentTurn ? 16 : 14} fill="#e74c3c">
                                            🐉
                                        </text>
                                    </svg>
                                </div>
                                {isCurrentTurn && <div style={{ fontSize: 9, color: '#e74c3c', marginTop: 2, fontWeight: 'bold' }}>Dragon</div>}
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

                {/* Right Col: Tile Preview (Active only) */}
                {isCurrentTurn && turnState?.currentTile && turnState.tileDefinition && (
                    <div
                        style={{
                            width: 80,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            cursor: (turnState.phase === 'DRAGON_ORIENT' || turnState.phase === 'PLACE_TILE') ? 'pointer' : 'default'
                        }}
                        onClick={
                            turnState.phase === 'DRAGON_ORIENT'
                                ? turnState.actions.cycleDragonFacing
                                : turnState.phase === 'PLACE_TILE'
                                    ? turnState.actions.rotate
                                    : undefined
                        }
                    >
                        <div style={{
                            width: 80, height: 80,
                            borderRadius: 8, overflow: 'hidden',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                            border: '1px solid #666',
                            background: '#000',
                            position: 'relative'
                        }}>
                            <TileSVG
                                definition={turnState.tileDefinition}
                                rotation={turnState.currentTile.rotation}
                                size={80}
                            />
                            {turnState.phase === 'DRAGON_ORIENT' && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(231, 76, 60, 0.1)',
                                    zIndex: 5,
                                }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24">
                                        <text x="12" y="17" textAnchor="middle" fontSize="16" fill="#e74c3c"
                                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}>
                                            {turnState.tentativeDragonFacing === 'NORTH' ? '\u25B2' :
                                                turnState.tentativeDragonFacing === 'SOUTH' ? '\u25BC' :
                                                    turnState.tentativeDragonFacing === 'EAST' ? '\u25B6' :
                                                        turnState.tentativeDragonFacing === 'WEST' ? '\u25C0' : '\u2666'}
                                        </text>
                                    </svg>
                                </div>
                            )}
                        </div>
                        {turnState.phase === 'PLACE_TILE' && (
                            <div style={{ fontSize: 9, color: '#aaa', fontWeight: 'bold' }}>
                                Cliquer pour tourner ⭮
                            </div>
                        )}
                        {turnState.phase === 'DRAGON_ORIENT' && (
                            <div style={{ fontSize: 9, color: '#e74c3c', fontWeight: 'bold' }}>
                                Click to Rotate ↻
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 4. Action Buttons (Active only) */}
            {isCurrentTurn && turnState && (
                <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                    {turnState.phase === 'PLACE_TILE' && turnState.interactionState === 'TILE_PLACED_TENTATIVELY' && (
                        <>
                            <Button onClick={turnState.actions.confirm!} primary style={{ flex: 1 }}>Confirm</Button>
                            <Button onClick={turnState.actions.cancel!} danger style={{ flex: 1 }}>Cancel</Button>
                        </>
                    )}
                    {turnState.phase === 'PLACE_MEEPLE' && (
                        turnState.interactionState === 'MEEPLE_SELECTED_TENTATIVELY' ? (
                            <>
                                <Button onClick={turnState.actions.confirmMeeple!} primary style={{ flex: 1 }}>Confirm</Button>
                                <Button onClick={turnState.actions.cancelMeeple!} danger style={{ flex: 1 }}>Cancel</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={turnState.actions.undo!} danger style={{ flex: 1 }}>Undo Tile</Button>
                                <Button onClick={turnState.actions.skip!} style={{ flex: 1 }}>Skip Meeple</Button>
                            </>
                        )
                    )}
                    {turnState.phase === 'DRAGON_ORIENT' && turnState.actions.confirmDragonOrientation && (
                        <>
                            <Button
                                onClick={turnState.actions.confirmDragonOrientation}
                                primary
                                style={{ flex: 1 }}
                                disabled={!turnState.tentativeDragonFacing}
                            >
                                {turnState.dragonMovesRemaining && turnState.dragonMovesRemaining > 0 ? 'Confirm & Move' : 'Confirm'}
                            </Button>
                            {turnState.canUndo && (
                                <Button
                                    onClick={turnState.actions.undo!}
                                    danger
                                    style={{ flex: 1 }}
                                >
                                    Undo Tile
                                </Button>
                            )}
                        </>
                    )}
                    {turnState.phase === 'DRAGON_PLACE' && turnState.dragonPlaceTargets && turnState.dragonPlaceTargets.length > 0 && (
                        <div style={{ fontSize: 12, color: '#e74c3c', textAlign: 'center', flex: 1, padding: '6px 0' }}>
                            🐉 Click a Dragon Hoard tile on the board
                        </div>
                    )}
                    {turnState.phase === 'DRAGON_MOVEMENT' && turnState.actions.executeDragon && (
                        <Button onClick={turnState.actions.executeDragon} primary style={{ flex: 1 }}>🐉 Move Dragon</Button>
                    )}
                    {turnState.phase === 'FAIRY_MOVE' && (
                        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                            {turnState.actions.cancelMeeple && (
                                <Button onClick={turnState.actions.cancelMeeple} danger style={{ flex: 1 }}>Cancel</Button>
                            )}
                            {turnState.actions.skipFairy && (
                                <Button onClick={turnState.actions.skipFairy} style={{ flex: 1 }}>Skip Fairy</Button>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
