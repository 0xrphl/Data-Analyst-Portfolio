import React from "react";

const ch = (label, wKey, pfKey, color, latest) => {
  const w = latest?.[wKey];
  const pf = latest?.[pfKey];
  return { label, w, pf, color };
};

const ChannelRow = ({ label, w, pf, color }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-white text-[12px] font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-white text-[12px] font-bold tabular-nums">
        {w != null ? `${Math.round(w)}W` : "—"}
      </span>
      <span className="text-secondary text-[10px] tabular-nums w-12 text-right">
        PF {pf != null ? pf.toFixed(2) : "—"}
      </span>
    </div>
  </div>
);

const ChannelDetails = ({ latest }) => {
  const channels = [
    ch("A1 — Solar P1", "a1_w", "a1_pf", "#FFD700", latest),
    ch("A2 — Grid P1", "a2_w", "a2_pf", "#ff6b6b", latest),
    ch("B1 — House P2", "b1_w", "b1_pf", "#4ecdc4", latest),
    ch("B2 — Solar P2", "b2_w", "b2_pf", "#FFD700", latest),
    ch("C1 — Shower", "c1_w", "c1_pf", "#4ecdc4", latest),
    ch("C2 — Grid P2", "c2_w", "c2_pf", "#ff6b6b", latest),
  ];

  return (
    <div>
      {channels.map((c) => (
        <ChannelRow key={c.label} {...c} />
      ))}
    </div>
  );
};

export default ChannelDetails;
