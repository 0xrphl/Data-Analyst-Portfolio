import React from "react";
import { QuadraticBezierLine } from "@react-three/drei";

const Tree = ({ position, height = 0.8 }) => (
  <group position={position}>
    <mesh position={[0, height * 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.07, height * 0.6, 6]} />
      <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
    </mesh>
    <mesh position={[0, height * 0.7, 0]} castShadow>
      <coneGeometry args={[0.35, height * 0.7, 8]} />
      <meshStandardMaterial color="#1a6b2a" roughness={0.8} />
    </mesh>
    <mesh position={[0, height * 1.0, 0]}>
      <coneGeometry args={[0.25, height * 0.5, 8]} />
      <meshStandardMaterial color="#228b3a" roughness={0.8} />
    </mesh>
  </group>
);

export const Ground = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
      <planeGeometry args={[25, 25]} />
      <meshStandardMaterial color="#2d5a1e" roughness={0.95} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.6, -0.035, 0]}>
      <planeGeometry args={[1.8, 3.5]} />
      <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.6, -0.033, 0]}>
      <planeGeometry args={[0.06, 3.2]} />
      <meshStandardMaterial color="#888" roughness={0.8} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, -0.035, 2.2]}>
      <planeGeometry args={[0.8, 1.2]} />
      <meshStandardMaterial color="#555" roughness={0.9} />
    </mesh>
    <Tree position={[-3.5, 0, 3]} height={1.0} />
    <Tree position={[-4.2, 0, 1.5]} height={0.7} />
    <Tree position={[-3.8, 0, -1]} height={0.85} />
    <Tree position={[-3.2, 0, -2.5]} height={0.95} />
    <Tree position={[5.5, 0, 2.5]} height={0.75} />
    <Tree position={[5.8, 0, -1.5]} height={0.9} />
    <Tree position={[-2.5, 0, -3.5]} height={0.6} />
    <Tree position={[4.5, 0, -3]} height={0.8} />
    <Tree position={[-5, 0, 0]} height={1.1} />
    <Tree position={[6.5, 0, 0.5]} height={0.65} />
    <Tree position={[-1.5, 0, -4]} height={0.9} />
  </group>
);

export const PowerPole = () => (
  <group position={[-4.5, 0, 0]}>
    <mesh position={[0, 1.5, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.08, 3, 8]} />
      <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
    </mesh>
    <mesh position={[0, 2.8, 0]}>
      <boxGeometry args={[1.4, 0.06, 0.06]} />
      <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
    </mesh>
    {[-0.5, 0, 0.5].map((x) => (
      <mesh key={x} position={[x, 2.65, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.15, 6]} />
        <meshStandardMaterial color="#6a8a6a" roughness={0.4} metalness={0.3} />
      </mesh>
    ))}
    <QuadraticBezierLine
      start={[0, 2.65, 0]}
      mid={[-1, 2.2, 0]}
      end={[2.5, 1.5, 0]}
      color="#444"
      lineWidth={1}
      transparent
      opacity={0.5}
    />
  </group>
);
