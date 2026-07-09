import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const COLORS = [
  "#555","#4ecdc4","#FFD700","#4ecdc4","#fa709a","#fa709a","#FFD700","#fa709a",
  "#ff6b6b","#ff6b6b","#ff3344","#ff6b6b","#ff3344","#ff6b6b","#ff3344","#ff3344"
];

const ProfileUsageChart = () => {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase.from("profile_usage").select("*");
        setUsage(data || []);
      } catch (e) { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-secondary text-[11px] py-2">Loading usage…</div>;
  if (!usage.length) return <div className="text-secondary text-[11px] py-2">No profile usage data yet.</div>;

  const total = usage.reduce((s, u) => s + (u.readings || 0), 0) || 1;

  // Donut chart via SVG
  const size = 120;
  const cx = size / 2, cy = size / 2, r = 44, strokeW = 16;
  let cumAngle = -90; // start at top

  const arcs = usage.map((u) => {
    const pct = (u.readings || 0) / total;
    const angle = pct * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const largeArc = angle > 180 ? 1 : 0;

    const rad = (a) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(startAngle));
    const y1 = cy + r * Math.sin(rad(startAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));

    return {
      ...u,
      pct,
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: COLORS[u.profile_id] || "#888",
    };
  });

  return (
    <div className="flex gap-3 items-start">
      <svg width={size} height={size} className="shrink-0">
        {arcs.map((a) => (
          <path
            key={a.profile_id}
            d={a.d}
            fill="none"
            stroke={a.color}
            strokeWidth={strokeW}
            strokeLinecap="butt"
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">
          {usage.length}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#aaa6c3" fontSize="9">
          profiles
        </text>
      </svg>
      <div className="flex flex-col gap-1 overflow-y-auto max-h-[140px]">
        {usage.map((u) => (
          <div key={u.profile_id} className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[u.profile_id] || "#888" }} />
            <span className="text-white font-medium">{u.name}</span>
            <span className="text-secondary ml-auto tabular-nums">{u.hours_approx}h</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileUsageChart;
