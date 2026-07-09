import React, { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, Sparkles } from "@react-three/drei";
import CanvasLoader from "../Loader";

// Scene modules
import House, { RoofPanels } from "./scene/House";
import Sun from "./scene/Sun";
import { getMinerStates, MINER_INFO, MinerBox, MinerTooltip } from "./scene/Miners";
import { WireWithFlow } from "./scene/Wires";
import { BigBlackCat, SmallFatCat, GoldenRetriever, CalicoCat, GalgoDog } from "./scene/Pets";
import { Ground, PowerPole } from "./scene/Environment";

/* ═══════════════════════════════════════════════════════
   FULL SCENE — composes all sub-modules
   ═══════════════════════════════════════════════════════ */
const Scene = ({ solarPct, hoveredMiner, setHoveredMiner, activeProfileId }) => {
  const minerStates = useMemo(() => getMinerStates(activeProfileId), [activeProfileId]);
  const anyActive = Object.values(minerStates).some((v) => v === true);

  return (
    <group>
      <House />
      <RoofPanels solarPct={solarPct} />
      <Sun solarPct={solarPct} />
      <PowerPole />

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

      {anyActive && <Sparkles count={30} scale={10} size={1.5} speed={0.2} color="#FFD700" opacity={solarPct * 0.3 + 0.1} position={[1, 2, 0]} />}

      {/* Pets */}
      <BigBlackCat />
      <SmallFatCat />
      <GoldenRetriever />
      <CalicoCat />
      <GalgoDog />

      <Ground />
    </group>
  );
};

/* ═══════════════════════════════════════════════════════
   CANVAS — Full-screen or embedded
   ═══════════════════════════════════════════════════════ */
const SolarHouseScene = ({ solarWatts = 0, maxWatts = 7740, activeProfileId = 0, fullScreen = false }) => {
  const solarPct = Math.min(1, Math.max(0, solarWatts / maxWatts));
  const [hoveredMiner, setHoveredMiner] = useState(null);

  return (
    <div
      className={fullScreen ? "fixed inset-0 z-0" : "w-full h-[500px] sm:h-[650px] relative rounded-2xl overflow-hidden"}
      style={{ background: "#0a0d12" }}
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [7, 4, 7], fov: 38 }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <fog attach="fog" args={["#0a0d12", 15, 35]} />

          <directionalLight position={[6, 8, 4]} intensity={1.8} color="#FFE8C0" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={20} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
          <directionalLight position={[-5, 4, -3]} intensity={0.6} color="#b8d4f0" />
          <ambientLight intensity={0.45} />
          <hemisphereLight intensity={0.35} color="#c8ddf0" groundColor="#2a1f15" />

          <Scene solarPct={solarPct} hoveredMiner={hoveredMiner} setHoveredMiner={setHoveredMiner} activeProfileId={activeProfileId} />

          <OrbitControls
            enableZoom
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.25}
            minDistance={3}
            maxDistance={22}
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={Math.PI / 6}
          />
        </Suspense>
        <Preload all />
      </Canvas>

      {!fullScreen && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-secondary/70 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm select-none">
          ☀️ Solar: {Math.round(solarPct * 100)}% — Drag to orbit · Scroll to zoom · Hover miners for info
        </div>
      )}
    </div>
  );
};

export default SolarHouseScene;
