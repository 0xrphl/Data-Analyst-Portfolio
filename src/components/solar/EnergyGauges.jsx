import React from "react";
import { motion } from "framer-motion";
import { useLatestEnergy } from "../../lib/useLatestEnergy";

const CompactGauge = ({ label, value, unit, color, icon, max = 3000 }) => {
  const pct = Math.min(100, Math.max(0, (Math.abs(value || 0) / max) * 100));
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="text-[16px] w-5 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[11px] text-secondary uppercase tracking-wider">{label}</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-white font-black text-[18px] tabular-nums" style={{ color }}>
              {value != null ? Math.round(value).toLocaleString() : "—"}
            </span>
            <span className="text-secondary text-[10px]">{unit}</span>
          </div>
        </div>
        <div className="w-full h-[4px] rounded-full bg-white/8 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

const EnergyGauges = ({ latest: latestProp, loading: loadingProp, error: errorProp, lastUpdated: lastUpdatedProp, compact = false }) => {
  const own = useLatestEnergy();
  const latest = latestProp !== undefined ? latestProp : own.latest;
  const loading = loadingProp !== undefined ? loadingProp : own.loading;
  const error = errorProp !== undefined ? errorProp : own.error;
  const lastUpdated = lastUpdatedProp !== undefined ? lastUpdatedProp : own.lastUpdated;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1">
        <CompactGauge label="Solar" value={latest?.solar} unit="W" color="#FFD700" icon="☀️" max={7740} />
        <CompactGauge label="Grid" value={latest?.grid} unit="W" color={latest?.grid < 0 ? "#4ecdc4" : "#ff6b6b"} icon="⚡" max={3000} />
        <CompactGauge label="Home" value={latest?.home} unit="W" color="#4ecdc4" icon="🏠" max={3000} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[9px] text-secondary">
        <span>
          {loading
            ? "Connecting…"
            : error
            ? `⚠️ ${error}`
            : latest?.grid < 0
            ? "🟢 Exporting surplus"
            : "🟡 Importing from grid"}
        </span>
        {lastUpdated && <span>{lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>}
      </div>
    </div>
  );
};

export default EnergyGauges;
