import React from "react";
import { motion } from "framer-motion";
import {
  solarProductBitaxe,
  solarProductNerdqaxe,
  solarProductOctaxe,
  solarProductAvalonQ,
} from "../../assets";

const MINERS = [
  { name: "BitAxe Gamma 601", image: solarProductBitaxe, hashrate: "1.5 TH/s", power: "21W", relay: "R1", color: "#4ecdc4", stateKey: "bitaxe" },
  { name: "NerdQAxe+", image: solarProductNerdqaxe, hashrate: "2.5 TH/s", power: "60W", relay: "R1", color: "#4ecdc4", stateKey: "nerdqaxe" },
  { name: "Nerd Octaxe", image: solarProductOctaxe, hashrate: "10.7 TH/s", power: "180W", relay: "R2", color: "#FFD700", stateKey: "octaxe" },
  { name: "Canaan Avalon Q", image: solarProductAvalonQ, hashrate: "52-90 TH/s", power: "800-1720W", relay: "API", color: "#ff6b6b", stateKey: "avalonq" },
];

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

const getMinerOnline = (profileId, stateKey) => {
  const p = PROFILES[profileId] || PROFILES[0];
  if (stateKey === "bitaxe" || stateKey === "nerdqaxe") return p.r1;
  if (stateKey === "octaxe") return p.r2;
  if (stateKey === "avalonq") return p.avalon !== "off";
  return false;
};

const MinerCard = ({ miner, index, online }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.08, type: "spring", damping: 20 }}
    whileHover={{ scale: 1.04, y: -2 }}
    className="rounded-xl border border-gray-800 overflow-hidden flex flex-col"
    style={{ background: "rgba(255,255,255,0.03)" }}
  >
    {/* Image — maximized */}
    <div className="w-full aspect-square bg-black/30 flex items-center justify-center p-3 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{ background: `radial-gradient(circle at 50% 80%, ${miner.color}40, transparent 70%)` }}
      />
      <motion.img
        src={miner.image}
        alt={miner.name}
        className="w-full h-full object-contain relative z-10 drop-shadow-lg"
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", damping: 15 }}
      />
      {/* Relay badge — top right */}
      <span
        className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-bold z-20"
        style={{ background: `${miner.color}20`, color: miner.color, border: `1px solid ${miner.color}30` }}
      >
        {miner.relay}
      </span>
      {/* Online/Offline breathing dot — top left */}
      <span className="absolute top-2 left-2 z-20 flex items-center gap-1">
        <span className="relative flex h-2.5 w-2.5">
          {online && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: "#00ff88" }}
            />
          )}
          <span className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: online ? "#00ff88" : "#ff3344" }}
          />
        </span>
        <span className="text-[8px] font-bold" style={{ color: online ? "#00ff88" : "#ff3344" }}>
          {online ? "ON" : "OFF"}
        </span>
      </span>
    </div>

    {/* Info */}
    <div className="px-2.5 py-2 flex flex-col gap-0.5">
      <div className="text-white text-[11px] font-bold truncate">{miner.name}</div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold" style={{ color: miner.color }}>{miner.hashrate}</span>
        <span className="text-[10px] text-secondary">{miner.power}</span>
      </div>
    </div>
  </motion.div>
);

const MinerFleet = ({ activeProfileId = 0 }) => (
  <div>
    <div className="grid grid-cols-2 gap-2.5">
      {MINERS.map((m, i) => (
        <MinerCard
          key={m.name}
          miner={m}
          index={i}
          online={getMinerOnline(activeProfileId, m.stateKey)}
        />
      ))}
    </div>
  </div>
);

export default MinerFleet;
