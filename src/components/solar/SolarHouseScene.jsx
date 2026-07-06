import React, { Suspense, useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, QuadraticBezierLine, Sparkles, Html } from "@react-three/drei";
import * as THREE from "three";
import CanvasLoader from "../Loader";
import {
  solarProductBitaxe,
  solarProductNerdqaxe,
  solarProductOctaxe,
  solarProductAvalonQ,
} from "../../assets";

/* ═══════════════════════════════════════════════════════
   HOUSE — walls, pitched roof, door, windows
   ═══════════════════════════════════════════════════════ */
const House = () => {
  const wallColor = "#e8ddd0";
  const roofColor = "#3a2a1a";
  const roofAngle = 0.52; // radians

  return (
    <group position={[0, 0, 0]}>
      {/* Walls */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1.2, 2.8]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Door */}
      <mesh position={[0.3, 0.35, 1.41]}>
        <boxGeometry args={[0.55, 0.9, 0.03]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0.5, 0.35, 1.44]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Front Windows — large */}
      {[-1.2, 1.4].map((x) => (
        <group key={x} position={[x, 0.65, 1.41]}>
          <mesh>
            <boxGeometry args={[0.65, 0.55, 0.02]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.6, 0.5, 0.03]} />
            <meshStandardMaterial color="#8ec5e8" emissive="#4a90c4" emissiveIntensity={0.15} metalness={0.3} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[0.02, 0.5, 0.01]} />
            <meshStandardMaterial color="#f5f0e8" />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[0.6, 0.02, 0.01]} />
            <meshStandardMaterial color="#f5f0e8" />
          </mesh>
        </group>
      ))}

      {/* ROOF — pitched (Λ shape — slopes meet at top ridge) */}
      <group position={[0, 1.2, 0]}>
        {/* Front slope — tilts DOWN toward front */}
        <mesh position={[0, 0.35, 0.82]} rotation={[roofAngle, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.3, 0.08, 1.85]} />
          <meshStandardMaterial color={roofColor} roughness={0.7} />
        </mesh>
        {/* Back slope — tilts DOWN toward back */}
        <mesh position={[0, 0.35, -0.82]} rotation={[-roofAngle, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.3, 0.08, 1.85]} />
          <meshStandardMaterial color={roofColor} roughness={0.7} />
        </mesh>

        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[4.35, 0.1, 0.12]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
        </mesh>

        {/* Gable ends — triangular fill (inverted V — fill top of side walls) */}
        {[2.16, -2.16].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.05, 0.36, 1.75]} />
              <meshStandardMaterial color={wallColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.44, 0]}>
              <boxGeometry args={[0.05, 0.16, 1.2]} />
              <meshStandardMaterial color={wallColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.58, 0]}>
              <boxGeometry args={[0.05, 0.12, 0.6]} />
              <meshStandardMaterial color={wallColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.67, 0]}>
              <boxGeometry args={[0.05, 0.08, 0.2]} />
              <meshStandardMaterial color={wallColor} roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Foundation */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[4.1, 0.06, 2.9]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.8} />
      </mesh>
    </group>
  );
};

/* ═══════════════════════════════════════════════════════
   SOLAR PANELS — flush on front roof
   ═══════════════════════════════════════════════════════ */
const SolarPanel = ({ position, intensity }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.82, 0.52, 0.025]} />
      <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
    </mesh>
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

const RoofPanels = ({ solarPct }) => {
  const panels = [];
  const intensity = 0.15 + solarPct * 0.9;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++)
      panels.push(<SolarPanel key={`p${r}-${c}`} position={[-(3) * 0.88 / 2 + c * 0.88, -(2) * 0.58 / 2 + r * 0.58, 0]} intensity={intensity} />);

  // Panels lie flat ON TOP of the front roof surface.
  // The front roof center is at y=1.55, z=2.02 (1.2+0.35+0.82 offset) with rotation +0.52
  // We position the panel group just above the roof and match its slope.
  return (
    <group position={[0, 1.72, 0.95]} rotation={[-Math.PI / 2 + 0.52, 0, 0]}>
      {panels}
    </group>
  );



};

/* ═══════════════════════════════════════════════════════
   SUN with animated rays to house
   ═══════════════════════════════════════════════════════ */
const SunRayParticle = ({ start, end, speed, delay }) => {
  const ref = useRef();
  const mid = [(start[0]+end[0])/2, (start[1]+end[1])/2 + 0.8, (start[2]+end[2])/2];
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start), new THREE.Vector3(...mid), new THREE.Vector3(...end)
  ), [start, mid, end]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.copy(curve.getPoint((clock.getElapsedTime() * speed + delay) % 1));
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2.5} transparent opacity={0.8} />
    </mesh>
  );
};

const Sun = ({ solarPct }) => {
  const meshRef = useRef();
  const haloRef = useRef();
  const sunPos = [5, 5.5, -4];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) meshRef.current.scale.setScalar(0.5 + solarPct * 0.4);
    if (haloRef.current) {
      haloRef.current.scale.setScalar((0.8 + solarPct * 0.5) * (1 + Math.sin(t * 1.5) * 0.06));
      haloRef.current.material.opacity = 0.1 + solarPct * 0.2;
    }
  });

  const color = useMemo(() => new THREE.Color("#666").lerp(new THREE.Color("#FFD700"), solarPct), [solarPct]);

  // Ray targets on the roof
  const rayTargets = [[-1, 1.7, 0.5], [0, 1.7, 0.5], [1, 1.7, 0.5]];

  return (
    <group>
      <group position={sunPos}>
        <mesh ref={haloRef}>
          <sphereGeometry args={[1.2, 24, 24]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.15} />
        </mesh>
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Sun rays — golden lines from sun to roof */}
      {solarPct > 0.05 && rayTargets.map((target, i) => (
        <React.Fragment key={i}>
          <QuadraticBezierLine
            start={sunPos}
            mid={[(sunPos[0]+target[0])/2, (sunPos[1]+target[1])/2 + 0.8, (sunPos[2]+target[2])/2]}
            end={target}
            color="#FFD700"
            lineWidth={1.2}
            transparent
            opacity={solarPct * 0.4}
          />
          <SunRayParticle start={sunPos} end={target} speed={0.3 + i * 0.05} delay={i * 0.33} />
        </React.Fragment>
      ))}
    </group>
  );
};

/* ═══════════════════════════════════════════════════════
   MINERS — with neon status signs + hover tooltip
   ═══════════════════════════════════════════════════════ */
// Profile-based miner state lookup (matches the 16 profiles from supabase_schema.sql)
// Each profile has: r1 (BitAxe+NerdQAxe), r2 (Octaxe), avalon (off/low/mid/high)
const PROFILES = [
  { r1: false, r2: false, avalon: "off" },    // 0: OFF
  { r1: true,  r2: false, avalon: "off" },     // 1: BN
  { r1: false, r2: true,  avalon: "off" },     // 2: OCT
  { r1: true,  r2: true,  avalon: "off" },     // 3: BN+OCT
  { r1: false, r2: false, avalon: "low" },     // 4: AV_LO
  { r1: true,  r2: false, avalon: "low" },     // 5: AV_LO+BN
  { r1: false, r2: true,  avalon: "low" },     // 6: AV_LO+OCT
  { r1: true,  r2: true,  avalon: "low" },     // 7: AV_LO+BN+OCT
  { r1: false, r2: false, avalon: "mid" },     // 8: AV_MD
  { r1: true,  r2: false, avalon: "mid" },     // 9: AV_MD+BN
  { r1: false, r2: false, avalon: "high" },    // 10: AV_HI
  { r1: false, r2: true,  avalon: "mid" },     // 11: AV_MD+OCT
  { r1: true,  r2: false, avalon: "high" },    // 12: AV_HI+BN
  { r1: true,  r2: true,  avalon: "mid" },     // 13: AV_MD+BN+OCT
  { r1: false, r2: true,  avalon: "high" },    // 14: AV_HI+OCT
  { r1: true,  r2: true,  avalon: "high" },    // 15: AV_HI+BN+OCT
];

const getMinerStates = (profileId) => {
  const p = PROFILES[profileId] || PROFILES[0];
  return {
    bitaxe: p.r1,
    nerdqaxe: p.r1,
    octaxe: p.r2,
    avalonq: p.avalon !== "off",
    avalonMode: p.avalon,
  };
};

const MINER_INFO = [
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
    // Neon flicker
    const flicker = active ? (0.8 + Math.sin(t * 8 + position[2] * 5) * 0.2) : (0.3 + Math.sin(t * 3) * 0.15);
    ref.current.material.emissiveIntensity = flicker;
    ref.current.material.opacity = 0.7 + flicker * 0.3;
  });

  const neonColor = active ? "#00ff88" : "#ff3344";

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.6, 0.12, 0.02]} />
      <meshStandardMaterial
        color={neonColor}
        emissive={neonColor}
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

const MinerBox = ({ miner, active, onHover, onUnhover }) => {
  const ledRef = useRef();
  const s = miner.scale;

  useFrame(({ clock }) => {
    if (ledRef.current && active) {
      ledRef.current.material.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 5 + miner.pos[0] * 3) * 0.4;
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

      {/* Neon status sign above */}
      <NeonSign position={[0, 0.42 * s, 0.26 * s]} label={miner.label} active={active} />
    </group>
  );
};

/* Hover tooltip rendered as HTML overlay inside the Canvas */
const MinerTooltip = ({ miner, active }) => (
  <Html position={[miner.pos[0], miner.pos[1] + 0.8, miner.pos[2]]} center distanceFactor={8} zIndexRange={[100, 0]}>
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

/* ═══════════════════════════════════════════════════════
   WIRES with energy flow
   ═══════════════════════════════════════════════════════ */
const EnergyFlowParticle = ({ start, mid, end, speed = 0.35, color = "#FFD700", delay = 0 }) => {
  const ref = useRef();
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start), new THREE.Vector3(...mid), new THREE.Vector3(...end)
  ), [start, mid, end]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.copy(curve.getPoint((clock.getElapsedTime() * speed + delay) % 1));
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  );
};

const WireWithFlow = ({ start, end, active, color }) => {
  const mid = [(start[0]+end[0])/2, Math.max(start[1],end[1])+0.35, (start[2]+end[2])/2];
  return (
    <>
      <QuadraticBezierLine start={start} mid={mid} end={end} color={active ? color : "#444"} lineWidth={1.8} transparent opacity={active ? 0.85 : 0.25} />
      {active && <>
        <EnergyFlowParticle start={start} mid={mid} end={end} color={color} delay={0} />
        <EnergyFlowParticle start={start} mid={mid} end={end} color={color} delay={0.5} />
      </>}
    </>
  );
};

/* ═══════════════════════════════════════════════════════
   ENVIRONMENT — green ground, road, trees
   ═══════════════════════════════════════════════════════ */
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

const Ground = () => (
  <group>
    {/* Green grass */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#2d5a1e" roughness={0.95} />
    </mesh>

    {/* Road from house to miners */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.6, -0.035, 0]}>
      <planeGeometry args={[1.8, 3.5]} />
      <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
    </mesh>
    {/* Road center line */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.6, -0.033, 0]}>
      <planeGeometry args={[0.06, 3.2]} />
      <meshStandardMaterial color="#888" roughness={0.8} />
    </mesh>

    {/* Driveway */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, -0.035, 2.2]}>
      <planeGeometry args={[0.8, 1.2]} />
      <meshStandardMaterial color="#555" roughness={0.9} />
    </mesh>

    {/* Trees scattered */}
    <Tree position={[-3.5, 0, 3]} height={1.0} />
    <Tree position={[-4.2, 0, 1.5]} height={0.7} />
    <Tree position={[-3.8, 0, -1]} height={0.85} />
    <Tree position={[-3.2, 0, -2.5]} height={0.95} />
    <Tree position={[5.5, 0, 2.5]} height={0.75} />
    <Tree position={[5.8, 0, -1.5]} height={0.9} />
    <Tree position={[-2.5, 0, -3.5]} height={0.6} />
    <Tree position={[4.5, 0, -3]} height={0.8} />
  </group>
);

/* ═══════════════════════════════════════════════════════
   FULL SCENE
   ═══════════════════════════════════════════════════════ */
const Scene = ({ solarPct, hoveredMiner, setHoveredMiner, activeProfileId }) => {
  const minerStates = useMemo(() => getMinerStates(activeProfileId), [activeProfileId]);
  const anyActive = Object.values(minerStates).some((v) => v === true);

  return (
    <group>
      <House />
      <RoofPanels solarPct={solarPct} />
      <Sun solarPct={solarPct} />

      {MINER_INFO.map((m) => {
        const isOn = minerStates[m.stateKey];
        return (
          <MinerBox key={m.label} miner={m} active={isOn} onHover={setHoveredMiner} onUnhover={() => setHoveredMiner(null)} />
        );
      })}

      {hoveredMiner && <MinerTooltip miner={hoveredMiner} active={minerStates[hoveredMiner.stateKey]} />}

      {MINER_INFO.map((m) => {
        const isOn = minerStates[m.stateKey];
        return (
          <WireWithFlow key={`w-${m.label}`} start={[2.0, 0.4, m.pos[2]]} end={m.pos} active={isOn} color={m.color} />
        );
      })}

      {anyActive && <Sparkles count={25} scale={8} size={1.5} speed={0.2} color="#FFD700" opacity={solarPct * 0.3 + 0.1} position={[1, 2, 0]} />}

      <Ground />
    </group>
  );
};


/* ═══════════════════════════════════════════════════════
   CANVAS
   ═══════════════════════════════════════════════════════ */
const SolarHouseScene = ({ solarWatts = 0, maxWatts = 7740, activeProfileId = 0 }) => {
  const solarPct = Math.min(1, Math.max(0, solarWatts / maxWatts));
  const [hoveredMiner, setHoveredMiner] = useState(null);


  return (
    <div className="w-full h-[500px] sm:h-[650px] relative rounded-2xl overflow-hidden" style={{ background: "#0f1318" }}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [6, 3.5, 6], fov: 40 }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <directionalLight position={[6, 8, 4]} intensity={1.8} color="#FFE8C0" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={20} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
          <directionalLight position={[-5, 4, -3]} intensity={0.6} color="#b8d4f0" />
          <ambientLight intensity={0.5} />
          <hemisphereLight intensity={0.35} color="#c8ddf0" groundColor="#2a1f15" />

          <Scene solarPct={solarPct} hoveredMiner={hoveredMiner} setHoveredMiner={setHoveredMiner} activeProfileId={activeProfileId} />


          <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.3} minDistance={3} maxDistance={20} maxPolarAngle={Math.PI / 2.05} minPolarAngle={Math.PI / 6} />

        </Suspense>
        <Preload all />
      </Canvas>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-secondary/70 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm select-none">
        ☀️ Solar: {Math.round(solarPct * 100)}% — Drag to orbit · Scroll to zoom · Hover miners for info
      </div>
    </div>
  );
};

export default SolarHouseScene;
