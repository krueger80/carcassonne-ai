import { TileSVG } from '../svg/TileSVG.tsx'
import { TILE_MAP } from '../../core/data/baseTiles.ts'
import { useGameStore, selectCurrentPlayer } from '../../store/gameStore.ts'
import { useUIStore } from '../../store/uiStore.ts'

export function CurrentTilePanel() {
  const { gameState, rotateTile, drawTile, skipMeeple, endTurn, placeableSegments } = useGameStore()
  const currentPlayer = useGameStore(selectCurrentPlayer)
  const { selectedMeepleType, setSelectedMeepleType } = useUIStore()

  if (!gameState) return null

  const { currentTile, turnPhase, tileBag } = gameState
  const def = currentTile ? TILE_MAP[currentTile.definitionId] : null

  const hasBigMeeple = (currentPlayer?.meeples.available.BIG ?? 0) > 0
  const hasNormalMeeple = (currentPlayer?.meeples.available.NORMAL ?? 0) > 0

  // Reset to NORMAL if the selected type isn't available
  const effectiveType = selectedMeepleType === 'BIG' && !hasBigMeeple ? 'NORMAL' : selectedMeepleType

  return (
    <div style={{
      background: '#1e2a1e',
      borderLeft: '1px solid #333',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: 180,
      userSelect: 'none',
    }}>
      <div style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>
        Tiles remaining: {tileBag.length}
      </div>

      {/* Current tile */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {def && currentTile ? (
          <>
            <div style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>
              {currentTile.definitionId} · {currentTile.rotation}°
            </div>
            <div style={{
              border: '2px solid #555',
              borderRadius: 4,
              overflow: 'hidden',
              background: '#111',
            }}>
              <TileSVG
                definition={def}
                rotation={currentTile.rotation}
                size={120}
              />
            </div>
            {turnPhase === 'PLACE_TILE' && (
              <button onClick={rotateTile} style={actionBtnStyle('#3a6a3a')}>
                Rotate (R)
              </button>
            )}
          </>
        ) : (
          <div style={{
            width: 120, height: 120,
            border: '2px dashed #333',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#555',
            fontSize: 13,
          }}>
            {turnPhase === 'DRAW_TILE' ? 'Draw tile' : 'No tile'}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {turnPhase === 'DRAW_TILE' && (
          <button onClick={drawTile} style={actionBtnStyle('#2a5a9a')}>
            Draw Tile
          </button>
        )}

        {turnPhase === 'PLACE_MEEPLE' && (
          <>
            {placeableSegments.length > 0 && (
              <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>
                Click a segment to place meeple
              </div>
            )}

            {/* Meeple type selector (only shown when big meeple is available) */}
            {hasBigMeeple && placeableSegments.length > 0 && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setSelectedMeepleType('NORMAL')}
                  style={{
                    ...meepleToggleStyle,
                    background: effectiveType === 'NORMAL' ? '#4a6a4a' : '#333',
                    border: `1px solid ${effectiveType === 'NORMAL' ? '#6a9a6a' : '#555'}`,
                    opacity: hasNormalMeeple ? 1 : 0.4,
                  }}
                  disabled={!hasNormalMeeple}
                >
                  Normal
                </button>
                <button
                  onClick={() => setSelectedMeepleType('BIG')}
                  style={{
                    ...meepleToggleStyle,
                    background: effectiveType === 'BIG' ? '#6a4a6a' : '#333',
                    border: `1px solid ${effectiveType === 'BIG' ? '#9a6a9a' : '#555'}`,
                  }}
                >
                  Big (x2)
                </button>
              </div>
            )}

            <button onClick={skipMeeple} style={actionBtnStyle('#5a3a2a')}>
              Skip Meeple
            </button>
          </>
        )}

        {turnPhase === 'SCORE' && (
          <button onClick={endTurn} style={actionBtnStyle('#4a3a6a')}>
            End Turn
          </button>
        )}
      </div>
    </div>
  )
}

const actionBtnStyle = (bg: string): React.CSSProperties => ({
  background: bg,
  color: '#f0f0f0',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: '8px 12px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 'bold',
  width: '100%',
  transition: 'opacity 0.1s',
})

const meepleToggleStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 0',
  color: '#f0f0f0',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 'bold',
}
