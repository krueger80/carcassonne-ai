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
    hasTradersBuilders: boolean;
    hasInnsCathedrals: boolean;
    hasDragonFairy: boolean;
    hasDragonHeldBy?: string | null;
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
                padding: 4,
                borderRadius: 6,
                border: isSelected ? `1px solid ${color}` : '1px solid transparent',
                transition: 'all 0.2s'
            }}
            title={label}
        >
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

export function PlayerCard({ player, isCurrentTurn, hasTradersBuilders, hasInnsCathedrals, hasDragonFairy, hasDragonHeldBy, turnState, style }: PlayerCardProps) {
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
                        {(hasInnsCathedrals || hasTradersBuilders) && (
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
                        {/* Dragon held by this player */}
                        {hasDragonHeldBy === player.id && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 4,
                                borderRadius: 6,
                                border: `1px solid ${isCurrentTurn && (turnState?.phase === 'DRAGON_ORIENT' || turnState?.phase === 'DRAGON_PLACE') ? '#e74c3c' : '#666'}`,
                                background: isCurrentTurn && (turnState?.phase === 'DRAGON_ORIENT' || turnState?.phase === 'DRAGON_PLACE')
                                    ? 'rgba(231, 76, 60, 0.15)' : 'transparent',
                            }} title="Dragon">
                                <div style={{ width: 24, height: 24 }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24"
                                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                                        <text x="12" y="18" textAnchor="middle" fontSize="16" fill="#e74c3c">
                                            🐉
                                        </text>
                                    </svg>
                                </div>
                                <div style={{ fontSize: 9, color: '#e74c3c', marginTop: 2, fontWeight: 'bold' }}>Dragon</div>
                            </div>
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
                    <div 
                        style={{ 
                            width: 80, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: 4,
                            cursor: (turnState.phase === 'DRAGON_ORIENT' || (turnState.phase === 'PLACE_TILE' && turnState.interactionState === 'TILE_PLACED_TENTATIVELY')) ? 'pointer' : 'default'
                        }}
                        onClick={
                            turnState.phase === 'DRAGON_ORIENT' 
                                ? turnState.actions.cycleDragonFacing 
                                : (turnState.phase === 'PLACE_TILE' && turnState.interactionState === 'TILE_PLACED_TENTATIVELY')
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
                        {(turnState.phase === 'PLACE_TILE' && turnState.interactionState === 'TILE_PLACED_TENTATIVELY') && (
                            <div style={{ fontSize: 9, color: '#aaa', fontWeight: 'bold' }}>
                                Click to Rotate ⭮
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
                                <div style={{ display: 'flex', flex: 2, gap: 8 }}>
                                    <Button onClick={turnState.actions.skip!} style={{ flex: 1 }}>Skip</Button>
                                    {hasDragonFairy && turnState.actions.startFairyMove && (
                                        <Button onClick={turnState.actions.startFairyMove} style={{ flex: 1, background: '#f1c40f', color: '#000' }}>Fairy</Button>
                                    )}
                                </div>
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
