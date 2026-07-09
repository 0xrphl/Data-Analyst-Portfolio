import React from "react";

const StatBox = ({ label, value, unit, color, icon }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-[12px] text-secondary flex items-center gap-1.5">
      <span>{icon}</span> {label}
    </span>
    <span className="text-[13px] font-bold tabular-nums" style={{ color }}>
      {value != null ? `${Math.round(value)} ${unit}` : "—"}
    </span>
  </div>
);

const EnergySavedCard = ({ latest }) => {
  const savedW = latest?.saved_w;
  const savedVA = latest?.saved_va;
  const isExporting = savedW != null && savedW > 0;

  return (
    <div>
      <div className={`text-[11px] font-semibold px-2 py-1 rounded-md mb-2 inline-block ${
        isExporting ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
      }`}>
        {isExporting ? "✓ Mining with surplus solar" : "⚠ No surplus available"}
      </div>

      <StatBox label="Active Surplus" value={savedW} unit="W" color={isExporting ? "#00ff88" : "#ff3344"} icon="⚡" />
      <StatBox label="Apparent Surplus" value={savedVA} unit="VA" color="#aaa6c3" icon="〰" />

      <div className="border-t border-white/5 mt-1 pt-1">
        <StatBox label="Solar VA" value={latest?.solar_va} unit="VA" color="#FFD700" icon="☀️" />
        <StatBox label="Grid VA" value={latest?.grid_va} unit="VA" color="#ff6b6b" icon="🔌" />
        <StatBox label="Home VA" value={latest?.home_va} unit="VA" color="#4ecdc4" icon="🏠" />
      </div>
    </div>
  );
};

export default EnergySavedCard;
