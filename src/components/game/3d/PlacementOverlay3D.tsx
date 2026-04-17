import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import { Meeple3D } from './Meeple3D.tsx'

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
}

export function PlacementOverlay3D({ 
  position, 
  type, 
  secondaryType, 
  color, 
  onConfirm, 
  onCancel,
  showButtons = false,
  isTentative = false,
  isFarmer = false,
  onCancelSecondary,
  onCancelPrimary
}: PlacementOverlay3DProps) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const spacing = 3.5

  return (
    <group position={position}>
      {/* Clickable interaction cylinder base */}
      <mesh 
        onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = 'pointer'; }} 
        onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); document.body.style.cursor = ''; }}
        onClick={(e) => { 
          e.stopPropagation()
          if (isTentative && onCancelPrimary) {
            document.body.style.cursor = ''
            onCancelPrimary()
          } else {
            onConfirm()
          }
        }}
      >
        <cylinderGeometry args={[1.6, 1.6, 0.15, 32]} />
        <meshBasicMaterial 
          color={isHovered ? "yellow" : "orange"} 
          transparent 
          opacity={isHovered ? 0.7 : 0.5} 
        />
      </mesh>

      {/* Meeple Preview */}
      {(isHovered || isTentative) && (
        <group position={[0, 0, 0]}>
          <group 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (isTentative && onCancelPrimary) {
                document.body.style.cursor = ''
                onCancelPrimary()
              } else if (!isTentative) {
                onConfirm()
              }
            }}
            onPointerOver={(e) => { 
              e.stopPropagation(); 
              setIsHovered(true); 
              document.body.style.cursor = 'pointer'; 
            }}
            onPointerOut={(e) => { 
              e.stopPropagation(); 
              setIsHovered(false); 
              document.body.style.cursor = ''; 
            }}
          >
            <Meeple3D 
              type={type} 
              color={color} 
              isFarmer={isFarmer}
              isTentative={isHovered && !isTentative} 
              position={[secondaryType ? -spacing / 2 : 0, 0, 0]}
            />
          </group>
          {secondaryType && (
            <group 
              onPointerOver={(e) => { 
                e.stopPropagation(); 
                setIsHovered(true); 
                document.body.style.cursor = 'pointer'; 
              }}
              onPointerOut={(e) => { 
                e.stopPropagation(); 
                setIsHovered(false); 
                document.body.style.cursor = ''; 
              }}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (isTentative && onCancelSecondary) {
                  document.body.style.cursor = ''
                  onCancelSecondary()
                } else if (!isTentative) {
                  onConfirm()
                }
              }}
            >
              <Meeple3D 
                type={secondaryType} 
                color={color} 
                isFarmer={secondaryType === 'PIG'} // Pig always behaves like a farmer
                isTentative={isHovered && !isTentative} 
                position={[spacing / 2, 0, 0]}
              />
            </group>
          )}
        </group>
      )}

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
