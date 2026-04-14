import { useState } from 'react'
import { Html } from '@react-three/drei'
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
  onCancelSecondary?: () => void
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
  onCancelSecondary
}: PlacementOverlay3DProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <group position={position}>
      {/* Clickable interaction sphere */}
      <mesh 
        onPointerOver={() => setIsHovered(true)} 
        onPointerOut={() => setIsHovered(false)}
        onClick={(e) => { e.stopPropagation(); onConfirm(); }}
      >
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial 
          color={isHovered ? "yellow" : "orange"} 
          transparent 
          opacity={isHovered ? 0.4 : 0.2} 
        />
      </mesh>

      {/* Meeple Preview */}
      {(isHovered || isTentative) && (
        <group position={[0, 0, 0]}>
          <Meeple3D 
            type={type} 
            color={color} 
            isTentative={isHovered && !isTentative} 
            position={[secondaryType ? -0.6 : 0, 0, 0]}
          />
          {secondaryType && (
            <group 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (isTentative && onCancelSecondary) onCancelSecondary();
              }}
            >
              <Meeple3D 
                type={secondaryType} 
                color={color} 
                isTentative={isHovered && !isTentative} 
                position={[0.6, 0, 0]}
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
              <span style={{ fontSize: '18px' }}>✓</span> Confirm
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
              <span style={{ fontSize: '18px' }}>✕</span> Cancel
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}
