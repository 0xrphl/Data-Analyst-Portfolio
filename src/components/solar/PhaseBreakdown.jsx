import React from "react";

const PhaseBar = ({ label, value, max, color }) => {
  const pct = Math.min(100, Math.max(0, (Math.abs(value || 0) / (max || 1)) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-secondary w-16 text-right shrink-0">{label}</span>
      <div className="flex-1 h-[6px] rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] text-white font-bold tabular-nums w-14 text-right">
        {value != null ? `${Math.round(value)}W` : "—"}
      </span>
    </div>
  );
};

const PhaseBreakdown = ({ latest }) => {
  const max = Math.max(
    Math.abs(latest?.solar_p1 || 0),
    Math.abs(latest?.solar_p2 || 0),
    Math.abs(latest?.grid_p1 || 0),
    Math.abs(latest?.grid_p2 || 0),
    Math.abs(latest?.home_p1 || 0),
    Math.abs(latest?.home_p2 || 0),
    100
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] text-secondary uppercase tracking-wider mb-1">Phase 1 (A)</div>
      <PhaseBar label="Solar" value={latest?.solar_p1} max={max} color="#FFD700" />
      <PhaseBar label="Grid" value={latest?.grid_p1} max={max} color="#ff6b6b" />
      <PhaseBar label="Home" value={latest?.home_p1} max={max} color="#4ecdc4" />

      <div className="text-[10px] text-secondary uppercase tracking-wider mt-2 mb-1">Phase 2 (B/C)</div>
      <PhaseBar label="Solar" value={latest?.solar_p2} max={max} color="#FFD700" />
      <PhaseBar label="Grid" value={latest?.grid_p2} max={max} color="#ff6b6b" />
      <PhaseBar label="Home" value={latest?.home_p2} max={max} color="#4ecdc4" />
    </div>
  );
};

export default PhaseBreakdown;
