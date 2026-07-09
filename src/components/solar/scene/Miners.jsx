import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  solarProductBitaxe,
  solarProductNerdqaxe,
  solarProductOctaxe,
  solarProductAvalonQ,
} from "../../../assets";

/* Profile-based miner state lookup */
const PROFILES = [
  { r1: false, r2: false, avalon: "off" },
  { r1: true,  r2: false, avalon: "off" },
  { r1: false, r2: true,  avalon: "off" },
  { r1: true,  r2: true,  avalon: "off" },
  { r1: false, r2: false, avalon: "low" },
  { r1: true,  r2: false, avalon: "low" },
  { r1: false, r2: true,  avalon: "low" },
  { r1: true,  r2: true,  avalon: "low" },
  { r1: false, r2: false, avalon: "mid" },
  { r1: true,  r2: false, avalon: "mid" },
  { r1: false, r2: false, avalon: "high" },
  { r1: false, r2: true,  avalon: "mid" },
  { r1: true,  r2: false, avalon: "high" },
  { r1: true,  r2: true,  avalon: "mid" },
  { r1: false, r2: true,  avalon: "high" },
  { r1: true,  r2: true,  avalon: "high" },
];

export const getMinerStates = (profileId) => {
  const p = PROFILES[profileId] || PROFILES[0];
  return {
    bitaxe: p.r1,
    nerdqaxe: p.r1,
    octaxe: p.r2,
    avalonq: p.avalon !== "off",
    avalonMode: p.avalon,
  };
};

export const MINER_INFO = [
  { pos: [3.2, 0.22, 1.2], color: "#4ecdc4", label: "BitAxe", hashrate: "1.5 TH/s", power: "21W", ip: "192.168.1.21", relay: "R1", scale: 0.8, img: solarProductBitaxe, stateKey: "bitaxe" },
  { pos: [3.2, 0.22, 0.4], color: "#4ecdc4", label: "NerdQAxe+", hashrate: "2.5 TH/s", power: "60W", ip: "192.168.1.28", relay: "R1", scale: 0.85, img: solarProductNerdqaxe, stateKey: "nerdqaxe" },
  { pos: [3.2, 0.22, -0.4], color: "#FFD700", label: "Octaxe", hashrate: "10.7 TH/s", power: "180W", ip: "192.168.1.37", relay: "R2", scale: 0.95, img: solarProductOctaxe, stateKey: "octaxe" },
  { pos: [3.2, 0.22, -1.2], color: "#ff6b6b", label: "Avalon Q", hashrate: "52-90 TH/s", power: "800-1720W", ip: "192.168.1.51", relay: "API", scale: 1.15, img: solarProductAvalonQ, stateKey: "avalonq" },
];

const NeonSign = ({ position, label, active }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const flicker = active ? (0.8 + Math.sin(t * 8 + position[2] * 5) * 0.2) : (0.3 + Math.sin(t * 3) * 0.15);
    ref.current.material.emissiveIntensity = flicker;
    ref.current.material.opacity = 0.7 + flicker * 0.3;
  });
  const neonColor = active ? "#00ff88" : "#ff3344";
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.6, 0.12, 0.02]} />
      <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={0.8} transparent opacity={0.9} />
    </mesh>
  );
};

export const MinerBox = ({ miner, active, onHover, onUnhover }) => {
  const ledRef = useRef();
  const heatRef = useRef();
  const s = miner.scale;

  useFrame(({ clock }) => {
    if (ledRef.current && active) {
      ledRef.current.material.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 5 + miner.pos[0] * 3) * 0.4;
    }
    if (heatRef.current) {
      const t = clock.getElapsedTime();
      heatRef.current.material.opacity = active ? 0.08 + Math.sin(t * 3) * 0.04 : 0;
      heatRef.current.scale.y = active ? 1 + Math.sin(t * 2) * 0.1 : 1;
    }
  });

  return (
    <group
      position={miner.pos}
      onPointerOver={(e) => { e.stopPropagation(); onHover(miner); }}
      onPointerOut={(e) => { e.stopPropagation(); onUnhover(); }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.7 * s, 0.45 * s, 0.5 * s]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.26 * s]}>
        <circleGeometry args={[0.15 * s, 16]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.265 * s]}>
        <ringGeometry args={[0.06 * s, 0.14 * s, 16]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={ledRef} position={[0, 0.18 * s, 0.26 * s]}>
        <boxGeometry args={[0.5 * s, 0.04 * s, 0.01]} />
        <meshStandardMaterial color={miner.color} emissive={miner.color} emissiveIntensity={active ? 0.7 : 0.1} />
      </mesh>
      {[-0.2, -0.1, 0, 0.1, 0.2].map((x) => (
        <mesh key={x} position={[x * s, 0.24 * s, 0]}>
          <boxGeometry args={[0.03 * s, 0.02 * s, 0.45 * s]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh ref={heatRef} position={[0, 0.5 * s, 0]}>
        <boxGeometry args={[0.6 * s, 0.4, 0.4 * s]} />
        <meshStandardMaterial color={miner.color} transparent opacity={0} />
      </mesh>
      <NeonSign position={[0, 0.42 * s, 0.26 * s]} label={miner.label} active={active} />
    </group>
  );
};

export const MinerTooltip = ({ miner, active }) => (
  <Html position={[miner.pos[0], miner.pos[1] + 0.8, miner.pos[2]]} center zIndexRange={[100, 0]}>
    <div style={{
      background: "rgba(10,10,15,0.92)",
      border: `1px solid ${miner.color}44`,
      borderRadius: 12,
      padding: "10px 14px",
      minWidth: 180,
      backdropFilter: "blur(8px)",
      pointerEvents: "none",
      fontFamily: "Poppins, sans-serif",
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
        <img src={miner.img} alt={miner.label} style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 6 }} />
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{miner.label}</div>
          <div style={{ color: active ? "#00ff88" : "#ff3344", fontSize: 11, fontWeight: 600 }}>{active ? "● ONLINE" : "● OFFLINE"}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#aaa6c3", lineHeight: 1.6 }}>
        <div>⚡ {miner.hashrate} · {miner.power}</div>
        <div>🔌 {miner.relay} · {miner.ip}</div>
      </div>
    </div>
  </Html>
);
