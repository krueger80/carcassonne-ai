import { useMemo } from 'react'
import { Meeple3D } from './Meeple3D.tsx'

interface DistributedMeeple {
  id: string
  type: any
  color: string
  isFarmer: boolean
  position: [number, number, number]
  rotation: [number, number, number]
  isTentative?: boolean
}

function distributeMeeples(meeples: any[], coord: { x: number; y: number }): DistributedMeeple[] {
  // Simple deterministic hash for rotation
  const seed = (coord.x * 12.9898 + coord.y * 78.233)
  const hash = Math.abs(Math.sin(seed)) * Math.PI * 2

  // Linear distribution based on bounding box width
  return meeples.map((m, i) => {
    const spacing = 1.5
    const offsetX = (i - (meeples.length - 1) / 2) * spacing
    
    return {
      id: m.id || `${coord.x}_${coord.y}_${i}`,
      type: m.type,
      color: m.color,
      isFarmer: m.type === 'FARMER',
      position: [offsetX, 0, 0] as [number, number, number],
      rotation: [0, hash + (i * 0.2), 0] as [number, number, number],
      isTentative: m.isTentative
    }
  })
}

export function MeepleGroup3D({ 
  meeples, 
  coordinate, 
  segmentCenter = [0, 0, 0] 
}: { 
  meeples: any[], 
  coordinate: { x: number, y: number },
  segmentCenter?: [number, number, number]
}) {
  const distributed = useMemo(() => distributeMeeples(meeples, coordinate), [meeples, coordinate])

  return (
    <group position={segmentCenter}>
      {distributed.map((m) => (
        <Meeple3D 
          key={m.id}
          type={m.type}
          color={m.color}
          isFarmer={m.isFarmer}
          position={m.position}
          rotation={m.rotation}
          isTentative={m.isTentative}
        />
      ))}
    </group>
  )
}
