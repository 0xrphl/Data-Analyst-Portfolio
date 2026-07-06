import React from "react";
import { Tilt } from "react-tilt";
import { motion } from "framer-motion";
import {
  solarProductBitaxe,
  solarProductNerdqaxe,
  solarProductOctaxe,
  solarProductAvalonQ,
} from "../../assets";

const MINERS = [
  {
    name: "BitAxe Gamma 601",
    image: solarProductBitaxe,
    hashrate: "1.5 TH/s",
    power: "21W",
    ip: "192.168.1.21",
    relay: "R1",
    color: "#4ecdc4",
  },
  {
    name: "NerdQAxe+",
    image: solarProductNerdqaxe,
    hashrate: "2.5 TH/s",
    power: "60W",
    ip: "192.168.1.28",
    relay: "R1",
    color: "#4ecdc4",
  },
  {
    name: "Nerd Octaxe",
    image: solarProductOctaxe,
    hashrate: "10.7 TH/s",
    power: "180W",
    ip: "192.168.1.37",
    relay: "R2",
    color: "#FFD700",
  },
  {
    name: "Canaan Avalon Q",
    image: solarProductAvalonQ,
    hashrate: "52-90 TH/s",
    power: "800-1720W",
    ip: "192.168.1.51:4028",
    relay: "API",
    color: "#ff6b6b",
  },
];

const MinerCard = ({ miner, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    <Tilt options={{ max: 20, scale: 1.02, speed: 400 }}>
      <div className="bg-tertiary/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center gap-2 h-full">
        <div className="w-full h-[100px] flex items-center justify-center">
          <img src={miner.image} alt={miner.name} className="max-h-full max-w-full object-contain" />
        </div>
        <h5 className="text-white font-semibold text-[14px] text-center">{miner.name}</h5>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: `${miner.color}22`, color: miner.color }}>
            {miner.relay}
          </span>
          <span className="text-[11px] text-secondary">{miner.ip}</span>
        </div>
        <div className="flex justify-between w-full mt-2 text-[13px]">
          <div className="text-center flex-1">
            <div className="text-white font-bold">{miner.hashrate}</div>
            <div className="text-secondary text-[10px] uppercase">Hashrate</div>
          </div>
          <div className="text-center flex-1">
            <div className="font-bold" style={{ color: miner.color }}>{miner.power}</div>
            <div className="text-secondary text-[10px] uppercase">Power</div>
          </div>
        </div>
      </div>
    </Tilt>
  </motion.div>
);

const MinerFleet = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {MINERS.map((m, i) => (
        <MinerCard key={m.name} miner={m} index={i} />
      ))}
    </div>
  );
};

export default MinerFleet;
