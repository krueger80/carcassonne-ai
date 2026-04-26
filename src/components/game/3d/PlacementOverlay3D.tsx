import { memo, useState } from 'react'
import { Html } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import { useUIStore, type HoveredMeepleSegment } from '../../../store/uiStore'

interface PlacementOverlay3DProps {
  position: [number, number, number]
  type: any
  secondaryType?: any
  color: string
  onConfirm: () => void
  onCancel: () => void
  showButtons?: boolean
  isTentative?: boolean
  isFarmer?: boolean
  onCancelSecondary?: () => void
  onCancelPrimary?: () => void
  /** Hover descriptor pushed into the UI store on pointerOver. SelectableMeeple3D
   *  reads it to render the 50%-opacity preview meeple at the hovered segment. */
  hoverDescriptor?: HoveredMeepleSegment
}

function PlacementOverlay3DImpl({
  position,
  onConfirm,
  onCancel,
  showButtons = false,
  isTentative = false,
  onCancelSecondary: _onCancelSecondary,
  onCancelPrimary,
  hoverDescriptor,
}: PlacementOverlay3DProps) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const setHoveredMeepleSegment = useUIStore((s) => s.setHoveredMeepleSegment)

  const onOver = (e: any) => {
    e.stopPropagation()
    setIsHovered(true)
    document.body.style.cursor = 'pointer'
    if (!isTentative && hoverDescriptor) setHoveredMeepleSegment(hoverDescriptor)
  }
  const onOut = (e: any) => {
    e.stopPropagation()
    setIsHovered(false)
    document.body.style.cursor = ''
    if (!isTentative) {
      const cur = useUIStore.getState().hoveredMeepleSegment
      if (cur && hoverDescriptor &&
          cur.coord.x === hoverDescriptor.coord.x &&
          cur.coord.y === hoverDescriptor.coord.y &&
          cur.segmentId === hoverDescriptor.segmentId) {
        setHoveredMeepleSegment(null)
      }
    }
  }
  const onClick = (e: any) => {
    e.stopPropagation()
    if (isTentative && onCancelPrimary) {
      document.body.style.cursor = ''
      onCancelPrimary()
    } else {
      // Confirming clears any pending hover descriptor — the meeple is now
      // owned by SelectableMeeple3D's tentative branch.
      setHoveredMeepleSegment(null)
      onConfirm()
    }
  }

  return (
    <group position={position}>
      {/* Clickable interaction cylinder base — emits hover/click events.
          The meeple body itself is rendered by SelectableMeeple3D at the
          top level so animations are continuous across hover→tentative
          and segment→segment transitions. */}
      <mesh
        position={[0, 0.15, 0]}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
        renderOrder={2}
      >
        <cylinderGeometry args={[1.6, 1.6, 0.15, 32]} />
        <meshBasicMaterial
          color={isHovered ? "yellow" : "orange"}
          transparent
          opacity={isHovered ? 0.7 : 0.5}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>

      {/* Action Buttons via HTML - floating below, fixed size */}
      {showButtons && (
        <Html position={[0, -2.5, 0]} center>
          <div style={{
            display: 'flex',
            gap: '12px',
            background: 'rgba(0,0,0,0.85)',
            padding: '10px 16px',
            borderRadius: '12px',
            pointerEvents: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            border: '1px solid #666',
            width: 'max-content',
            userSelect: 'none'
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onConfirm(); }}
              style={{
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {t('game.confirmBtn')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(); }}
              style={{
                background: '#c0392b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {t('game.undoBtn')}
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}

export const PlacementOverlay3D = memo(PlacementOverlay3DImpl)
