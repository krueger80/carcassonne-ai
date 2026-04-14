export function Dragon3D({ 
  position = [0, 0, 0], 
  facing = 0 
}: { 
  position?: [number, number, number], 
  facing?: number 
}) {
  return (
    <group position={position} rotation={[0, -facing * (Math.PI / 180), 0]}>
      {/* Body */}
      <mesh castShadow position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 2, 1.5]} />
        <meshStandardMaterial color="#8B0000" roughness={0.4} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 2.5, 0.75]}>
        <boxGeometry args={[1, 1, 1.2]} />
        <meshStandardMaterial color="#8B0000" roughness={0.4} />
      </mesh>
      {/* Spikes */}
      <mesh castShadow position={[0, 2.2, -0.7]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[0.3, 1, 4]} />
        <meshStandardMaterial color="#FF4500" />
      </mesh>
    </group>
  )
}
