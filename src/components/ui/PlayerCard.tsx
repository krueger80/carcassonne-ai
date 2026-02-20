import { Player, MeepleType } from "../../core/types/player";
import { MeepleSVG } from "../svg/MeepleSVG";
import { TileSVG } from "../svg/TileSVG";
import { TileDefinition, Rotation } from "../../core/types/tile";
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
    };
    selectedMeepleType?: MeepleType;
    validMeepleTypes?: MeepleType[];
}

interface PlayerCardProps {
    player: Player;
    isCurrentTurn: boolean;
    hasTradersBuilders: boolean;
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
    label: string;
    color: string;
    onClick?: () => void;
    isSelected?: boolean;
    disabled?: boolean;
}

const MeepleIcon = ({ type, count, label, color, onClick, isSelected, disabled }: MeepleIconProps) => {
    const isAvailable = count > 0;
    const isInteractive = !!onClick;

    const commonStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: isAvailable ? (isInteractive && disabled ? 0.4 : 1) : 0.3,
        cursor: isInteractive && !disabled ? 'pointer' : 'default',
        background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
        padding: 4,
        borderRadius: 6,
        border: isSelected ? `1px solid ${color}` : '1px solid transparent',
        transition: 'all 0.2s',
        ...(isInteractive ? {
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            color: 'inherit',
            margin: 0,
            textTransform: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
        } : {})
    };

    const content = (
        <>
            <div style={{ width: 24, height: 24, position: 'relative' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                    <MeepleSVG
                        color={color}
                        x={12} y={12}
                        size={type === 'BIG' ? 9 : 8}
                        isBig={type === 'BIG'}
                        isBuilder={type === 'BUILDER'}
                        isPig={type === 'PIG'}
                    />
                </svg>
                <div style={{
                    position: 'absolute', bottom: -2, right: -4,
                    background: '#222', color: '#fff',
                    fontSize: 9, fontWeight: 'bold',
                    padding: '1px 3px', borderRadius: 4,
                    border: '1px solid #555',
                    pointerEvents: 'none',
                }}>
                    {count}
                </div>
            </div>
            {label && <div style={{ fontSize: 9, color: isSelected ? color : '#aaa', marginTop: 2, fontWeight: isSelected ? 'bold' : 'normal' }}>{label}</div>}
        </>
    );

    if (isInteractive) {
        return (
            <button
                type="button"
                onClick={!disabled && onClick ? onClick : undefined}
                disabled={disabled}
                aria-label={`Select ${label || type} Meeple`}
                aria-pressed={isSelected}
                style={commonStyle}
                title={label}
            >
                {content}
            </button>
        );
    }

    return (
        <div
            onClick={undefined} // Not interactive
            style={commonStyle}
            title={label}
        >
            {content}
        </div>
    );
};

interface GoodIconProps {
    type: 'WINE' | 'WHEAT' | 'CLOTH';
    count: number;
}

const GoodIcon = ({ type, count }: GoodIconProps) => {
    return (
        <div style={{ position: 'relative', width: 24, height: 24, opacity: count > 0 ? 1 : 0.3 }} title={type}>
            <img
                src={COMMODITY_IMAGES[type]}
                width={24} height={24}
                alt={type}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
            />
            <div style={{
                position: 'absolute', bottom: -2, right: -4,
                background: '#222', color: '#fff',
                fontSize: 9, fontWeight: 'bold',
                padding: '1px 3px', borderRadius: 4,
                border: '1px solid #555',
                pointerEvents: 'none',
            }}>
                {count}
            </div>
        </div>
    )
}

export function PlayerCard({ player, isCurrentTurn, hasTradersBuilders, turnState, style }: PlayerCardProps) {
    const { color, name, score, meeples, traderTokens } = player;

    // Interaction logic
    const isMeeplePhase = turnState?.phase === 'PLACE_MEEPLE';

    return (
        <div style={{
            background: isCurrentTurn ? 'rgba(35, 40, 50, 0.95)' : 'rgba(30, 30, 40, 0.85)',
            borderLeft: `4px solid ${color}`,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            boxShadow: isCurrentTurn ? `0 4px 20px rgba(0,0,0,0.4)` : '0 2px 4px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minWidth: isCurrentTurn ? 280 : 220, // Expanded width for active player
            transform: isCurrentTurn ? 'scale(1.02) translateX(10px)' : 'none',
            zIndex: isCurrentTurn ? 10 : 1,
            ...style
        }}>
            {/* 1. Header: Status (Active) or Name (Inactive) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 'bold', color: '#f0f0f0', fontSize: 15 }}>
                        {name}
                    </div>
                </div>
                <div style={{
                    background: isCurrentTurn ? color : '#444',
                    color: isCurrentTurn ? '#111' : '#ccc',
                    fontWeight: 'bold', fontSize: 14,
                    padding: '2px 8px', borderRadius: 12,
                    minWidth: 24, textAlign: 'center'
                }}>
                    {score}
                </div>
            </div>

            {/* 2. Instruction Banner (Active only) */}
            {isCurrentTurn && turnState && (
                <div style={{
                    fontSize: 13, color: '#ddd',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '6px 10px', borderRadius: 6,
                    borderLeft: `2px solid #777`
                }}>
                    {turnState.instructionText}
                </div>
            )}

            {/* 3. Main Content: Split columns if we have a tile preview */}
            <div style={{ display: 'flex', gap: 16 }}>

                {/* Left Col: Inventory */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {/* Meeple Grid */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <MeepleIcon
                            type="NORMAL"
                            count={meeples.available.NORMAL}
                            label="Nrm"
                            color={color}
                            onClick={isCurrentTurn && isMeeplePhase && turnState?.actions.selectMeeple ? () => turnState.actions.selectMeeple?.('NORMAL') : undefined}
                            isSelected={isMeeplePhase && turnState?.selectedMeepleType === 'NORMAL'}
                            disabled={!isCurrentTurn || !isMeeplePhase || meeples.available.NORMAL <= 0 || (turnState?.validMeepleTypes && !turnState.validMeepleTypes.includes('NORMAL'))}
                        />
                        {(hasTradersBuilders || meeples.available.BIG !== undefined) && (
                            <MeepleIcon
                                type="BIG"
                                count={meeples.available.BIG ?? 0}
                                label="Big"
                                color={color}
                                onClick={isCurrentTurn && isMeeplePhase && turnState?.actions.selectMeeple ? () => turnState.actions.selectMeeple?.('BIG') : undefined}
                                isSelected={isMeeplePhase && turnState?.selectedMeepleType === 'BIG'}
                                disabled={!isCurrentTurn || !isMeeplePhase || (meeples.available.BIG ?? 0) <= 0 || (turnState?.validMeepleTypes && !turnState.validMeepleTypes.includes('BIG'))}
                            />
                        )}
                        {hasTradersBuilders && (
                            <>
                                <MeepleIcon
                                    type="BUILDER"
                                    count={meeples.available.BUILDER ?? 0}
                                    label="Bld"
                                    color={color}
                                    onClick={isCurrentTurn && isMeeplePhase && turnState?.actions.selectMeeple ? () => turnState.actions.selectMeeple?.('BUILDER') : undefined}
                                    isSelected={isMeeplePhase && turnState?.selectedMeepleType === 'BUILDER'}
                                    disabled={!isCurrentTurn || !isMeeplePhase || (meeples.available.BUILDER ?? 0) <= 0 || (turnState?.validMeepleTypes && !turnState.validMeepleTypes.includes('BUILDER'))}
                                />
                                <MeepleIcon
                                    type="PIG"
                                    count={meeples.available.PIG ?? 0}
                                    label="Pig"
                                    color={color}
                                    onClick={isCurrentTurn && isMeeplePhase && turnState?.actions.selectMeeple ? () => turnState.actions.selectMeeple?.('PIG') : undefined}
                                    isSelected={isMeeplePhase && turnState?.selectedMeepleType === 'PIG'}
                                    disabled={!isCurrentTurn || !isMeeplePhase || (meeples.available.PIG ?? 0) <= 0 || (turnState?.validMeepleTypes && !turnState.validMeepleTypes.includes('PIG'))}
                                />
                            </>
                        )}
                    </div>

                    {/* Goods Collection (Traders) */}
                    {hasTradersBuilders && (
                        <div style={{
                            display: 'flex', gap: 10,
                            paddingTop: 8, marginTop: 4,
                            borderTop: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <GoodIcon type="WINE" count={traderTokens?.WINE ?? 0} />
                            <GoodIcon type="WHEAT" count={traderTokens?.WHEAT ?? 0} />
                            <GoodIcon type="CLOTH" count={traderTokens?.CLOTH ?? 0} />
                        </div>
                    )}
                </div>

                {/* Right Col: Tile Preview (Active only) */}
                {isCurrentTurn && turnState?.currentTile && turnState.tileDefinition && (
                    <div style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                            width: 80, height: 80,
                            borderRadius: 8, overflow: 'hidden',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                            border: '1px solid #666',
                            background: '#000'
                        }}>
                            <TileSVG
                                definition={turnState.tileDefinition}
                                rotation={turnState.currentTile.rotation}
                                size={80}
                            />
                        </div>
                        {turnState.phase === 'PLACE_TILE' && turnState.interactionState === 'TILE_PLACED_TENTATIVELY' && (
                            <Button
                                onClick={turnState.actions.rotate!}
                                style={{ fontSize: 10, padding: '4px 8px', width: '100%' }}
                                title="Rotate Tile"
                            >
                                Rotate ⭮
                            </Button>
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
                </div>
            )}

        </div>
    );
}
