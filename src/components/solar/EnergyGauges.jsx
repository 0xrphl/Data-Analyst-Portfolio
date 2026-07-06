import React from "react";
import { motion } from "framer-motion";
import { useLatestEnergy } from "../../lib/useLatestEnergy";

const Gauge = ({ label, value, unit, color, icon, max = 3000 }) => {
  const pct = Math.min(100, Math.max(0, (Math.abs(value || 0) / max) * 100));
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative bg-tertiary/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col gap-3 min-w-[200px] flex-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-secondary text-[13px] uppercase tracking-wider">{label}</span>
        <span className="text-[22px]">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-white font-black text-[32px]" style={{ color }}>
          {value !== null && value !== undefined ? Math.round(value).toLocaleString() : "—"}
        </span>
        <span className="text-secondary text-[14px]">{unit}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

const EnergyGauges = ({ latest: latestProp, loading: loadingProp, error: errorProp, lastUpdated: lastUpdatedProp }) => {
  // If parent already fetched the data (shared with 3D scene), use it; otherwise fetch independently.
  const own = useLatestEnergy();
  const latest = latestProp !== undefined ? latestProp : own.latest;
  const loading = loadingProp !== undefined ? loadingProp : own.loading;
  const error = errorProp !== undefined ? errorProp : own.error;
  const lastUpdated = lastUpdatedProp !== undefined ? lastUpdatedProp : own.lastUpdated;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4">
        <Gauge label="Solar" value={latest?.solar} unit="W" color="#FFD700" icon="☀️" max={7740} />
        <Gauge label="Grid" value={latest?.grid} unit="W" color={latest?.grid < 0 ? "#4ecdc4" : "#ff6b6b"} icon="⚡" max={3000} />
        <Gauge label="Home" value={latest?.home} unit="W" color="#4ecdc4" icon="🏠" max={3000} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-secondary">
        <span>
          {loading
            ? "Connecting to live feed…"
            : error
            ? `⚠️ ${error}`
            : latest?.grid < 0
            ? "🟢 Exporting surplus solar to mining cluster"
            : "🟡 Importing from grid — mining scaled down"}
        </span>
        {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
};

export default EnergyGauges;
