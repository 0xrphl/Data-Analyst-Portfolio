import React from "react";

/* ═══════════════════════════════════════════════════════
   HOUSE — walls, pitched roof, door, windows
   ═══════════════════════════════════════════════════════ */
const House = () => {
  const wallColor = "#e8ddd0";
  const roofColor = "#3a2a1a";
  const roofAngle = 0.52;

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1.2, 2.8]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.35, 1.41]}>
        <boxGeometry args={[0.55, 0.9, 0.03]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0.5, 0.35, 1.44]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.8} roughness={0.2} />
      </mesh>
      {[-1.2, 1.4].map((x) => (
        <group key={x} position={[x, 0.65, 1.41]}>
          <mesh><boxGeometry args={[0.65, 0.55, 0.02]} /><meshStandardMaterial color="#f5f0e8" roughness={0.5} /></mesh>
          <mesh position={[0, 0, 0.01]}><boxGeometry args={[0.6, 0.5, 0.03]} /><meshStandardMaterial color="#8ec5e8" emissive="#4a90c4" emissiveIntensity={0.15} metalness={0.3} roughness={0.1} /></mesh>
          <mesh position={[0, 0, 0.025]}><boxGeometry args={[0.02, 0.5, 0.01]} /><meshStandardMaterial color="#f5f0e8" /></mesh>
          <mesh position={[0, 0, 0.025]}><boxGeometry args={[0.6, 0.02, 0.01]} /><meshStandardMaterial color="#f5f0e8" /></mesh>
        </group>
      ))}
      <group position={[0, 1.2, 0]}>
        <mesh position={[0, 0.35, 0.82]} rotation={[roofAngle, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.3, 0.08, 1.85]} /><meshStandardMaterial color={roofColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, -0.82]} rotation={[-roofAngle, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.3, 0.08, 1.85]} /><meshStandardMaterial color={roofColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.72, 0]}><boxGeometry args={[4.35, 0.1, 0.12]} /><meshStandardMaterial color="#2a1a0a" roughness={0.6} /></mesh>
        {[2.16, -2.16].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.18, 0]}><boxGeometry args={[0.05, 0.36, 1.75]} /><meshStandardMaterial color={wallColor} roughness={0.9} /></mesh>
            <mesh position={[0, 0.44, 0]}><boxGeometry args={[0.05, 0.16, 1.2]} /><meshStandardMaterial color={wallColor} roughness={0.9} /></mesh>
            <mesh position={[0, 0.58, 0]}><boxGeometry args={[0.05, 0.12, 0.6]} /><meshStandardMaterial color={wallColor} roughness={0.9} /></mesh>
            <mesh position={[0, 0.67, 0]}><boxGeometry args={[0.05, 0.08, 0.2]} /><meshStandardMaterial color={wallColor} roughness={0.9} /></mesh>
          </group>
        ))}
      </group>
      <mesh position={[0, -0.02, 0]}><boxGeometry args={[4.1, 0.06, 2.9]} /><meshStandardMaterial color="#8a8a8a" roughness={0.8} /></mesh>
    </group>
  );
};

/* ═══════════════════════════════════════════════════════
   SOLAR PANELS
   ═══════════════════════════════════════════════════════ */
const SolarPanel = ({ position, intensity }) => (
  <group position={position}>
    <mesh><boxGeometry args={[0.82, 0.52, 0.025]} /><meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} /></mesh>
    {[-0.24, 0, 0.24].map((cx) =>
      [-0.13, 0.13].map((cy) => (
        <mesh key={`${cx}-${cy}`} position={[cx, cy, 0.014]}>
          <boxGeometry args={[0.23, 0.22, 0.005]} />
          <meshStandardMaterial color="#0a2f55" emissive="#2266cc" emissiveIntensity={intensity} metalness={0.8} roughness={0.15} />
        </mesh>
      ))
    )}
  </group>
);

export const RoofPanels = ({ solarPct }) => {
  const panels = [];
  const intensity = 0.15 + solarPct * 0.9;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++)
      panels.push(<SolarPanel key={`p${r}-${c}`} position={[-(3) * 0.88 / 2 + c * 0.88, -(2) * 0.58 / 2 + r * 0.58, 0]} intensity={intensity} />);

  return (
    <group position={[0, 1.72, 0.95]} rotation={[-Math.PI / 2 + 0.52, 0, 0]}>
      {panels}
    </group>
  );
};

export default House;
