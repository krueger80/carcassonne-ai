import { useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore.ts'
import { TileCell } from '../game/TileCell.tsx'
import { DragonPiece } from '../game/DragonPiece.tsx'
import { useCastAutoFit } from './useCastAutoFit.ts'
import { CastScoreboard } from './CastScoreboard.tsx'
import { getAllFeatures } from '../../core/engine/FeatureDetector.ts'
import { useUIStore, type TerritoryOverlayMode } from '../../store/uiStore.ts'
import type { Feature, UnionFindState } from '../../core/types/feature.ts'
import type { Player } from '../../core/types/player.ts'
import type { Direction } from '../../core/types/tile.ts'

function getControllingColor(feature: Feature, players: Player[]): string | null {
  if (feature.meeples.length > 0) {
    const strength: Record<string, number> = {}
    for (const m of feature.meeples) {
      strength[m.playerId] = (strength[m.playerId] ?? 0) + (m.meepleType === 'BIG' ? 2 : 1)
    }
    const maxStr = Math.max(...Object.values(strength))
    const topPlayers = Object.keys(strength).filter(id => strength[id] === maxStr)
    const player = players.find(p => p.id === topPlayers[0])
    return player?.color ?? null
  }
  if (feature.lastOwnerIds?.length) {
    const player = players.find(p => p.id === feature.lastOwnerIds![0])
    return player?.color ?? null
  }
  return null
}

function computeSegmentOwnerMap(
  uf: UnionFindState,
  players: Player[],
  mode: TerritoryOverlayMode,
): Record<string, Record<string, string>> {
  if (mode === 'off') return {}
  const result: Record<string, Record<string, string>> = {}
  const features = getAllFeatures(uf)
  for (const feature of features) {
    if (mode === 'incomplete' && feature.isComplete) continue
    const color = getControllingColor(feature, players)
    if (!color) continue
    for (const node of feature.nodes) {
      const coordKey = `${node.coordinate.x},${node.coordinate.y}`
      if (!result[coordKey]) result[coordKey] = {}
      result[coordKey][node.segmentId] = color
    }
  }
  return result
}

const CELL_SIZE = 88
const BOARD_PADDING = 1  // Minimal padding (display only)

export function CastView() {
  const gameState = useGameStore(s => s.gameState)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scale, offsetX, offsetY } = useCastAutoFit(containerRef, gameState)

  // Fallback sync for old TV browsers without BroadcastChannel
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') return // primary handles it

    const handler = (e: StorageEvent) => {
      if (e.key === 'carcassonne-game' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed.state?.gameState) {
            useGameStore.setState({ gameState: parsed.state.gameState })
          }
        } catch { /* ignore parse errors */ }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  if (!gameState) {
    return <CastWaitingScreen />
  }

  const { board, players } = gameState
  const minX = board.minX - BOARD_PADDING
  const maxX = board.maxX + BOARD_PADDING
  const minY = board.minY - BOARD_PADDING
  const maxY = board.maxY + BOARD_PADDING
  const boardWidth = (maxX - minX + 1) * CELL_SIZE
  const boardHeight = (maxY - minY + 1) * CELL_SIZE

  // Dragon & Fairy data
  const dfData = gameState.expansionData?.['dragonFairy'] as {
    dragonPosition?: { x: number; y: number } | null
    dragonFacing?: Direction | null
    fairyPosition?: { coordinate: { x: number; y: number }; segmentId: string } | null
  } | undefined

  const dragonPos = dfData?.dragonPosition ?? null
  const dragonFacing = dfData?.dragonFacing ?? null

  const territoryOverlay = useUIStore(s => s.territoryOverlay)
  const segmentOwnerMap = useMemo(() => {
    if (!gameState.featureUnionFind || territoryOverlay === 'off') return {}
    return computeSegmentOwnerMap(gameState.featureUnionFind, players, territoryOverlay)
  }, [gameState.featureUnionFind, players, territoryOverlay])

  // Build fairy segment map
  const fairySegmentMap: Record<string, string> = {}
  if (dfData?.fairyPosition) {
    const { coordinate, segmentId } = dfData.fairyPosition
    fairySegmentMap[`${coordinate.x},${coordinate.y}`] = segmentId
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#1a2a1a',
        position: 'relative',
        cursor: 'default',
      }}
    >
      <style>{`
        @keyframes cast-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>

      {/* Auto-fit board container */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          transformOrigin: 'center',
          width: boardWidth,
          height: boardHeight,
          transition: 'transform 0.6s cubic-bezier(0.2, 0, 0.2, 1)',
        }}
      >
        {/* Tile grid */}
        {Array.from({ length: maxY - minY + 1 }, (_, rowIdx) => {
          const y = minY + rowIdx
          return (
            <div key={y} style={{ display: 'flex', height: CELL_SIZE }}>
              {Array.from({ length: maxX - minX + 1 }, (_, colIdx) => {
                const x = minX + colIdx
                const key = `${x},${y}`
                const placedTile = board.tiles[key]

                if (!placedTile) {
                  return <div key={key} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                }

                const definition = gameState.staticTileMap[placedTile.definitionId]
                if (!definition) {
                  return <div key={key} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                }

                return (
                  <div key={key} style={{ width: CELL_SIZE, height: CELL_SIZE, overflow: 'visible' }}>
                    <TileCell
                      tile={placedTile}
                      definition={definition}
                      size={CELL_SIZE}
                      players={players}
                      fairySegmentId={fairySegmentMap[key]}
                      segmentOwnerColors={segmentOwnerMap[key]}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Dragon overlay */}
        {dragonPos && (
          <DragonPiece
            x={dragonPos.x}
            y={dragonPos.y}
            minX={minX}
            minY={minY}
            facing={dragonFacing ?? null}
            cellSize={CELL_SIZE}
            isOrienting={false}
          />
        )}
      </div>

      {/* Scoreboard */}
      <CastScoreboard
        players={players}
        currentPlayerIndex={gameState.currentPlayerIndex}
        tilesRemaining={gameState.tileBag.length}
        turnPhase={gameState.turnPhase}
        expansionData={gameState.expansionData}
      />
    </div>
  )
}

function CastWaitingScreen() {
  const { t } = useTranslation()
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#1a2a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#888',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, color: '#b8a47a', fontStyle: 'italic' }}>
        Carcassonne
      </div>
      <div style={{ fontSize: 18, color: '#666' }}>{t('cast.waiting')}</div>
      <div style={{ fontSize: 14, marginTop: 8, color: '#444' }}>
        {t('cast.waitingHint')}
      </div>
    </div>
  )
}
