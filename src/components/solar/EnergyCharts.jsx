import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

// Compact SVG line chart for sidebar
const MiniLineChart = ({ data, keys, colors, labels, height = 140 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-secondary text-[11px]" style={{ height }}>
        No data yet
      </div>
    );
  }

  const width = 300;
  const padding = 20;
  const allValues = data.flatMap((d) => keys.map((k) => Number(d[k]) || 0));
  const maxVal = Math.max(...allValues, 100);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;
  const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);

  const toPoints = (key) =>
    data
      .map((d, i) => {
        const x = padding + i * xStep;
        const y = height - padding - ((Number(d[key]) || 0) - minVal) / range * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

  // Area fill
  const toArea = (key) => {
    const pts = data.map((d, i) => {
      const x = padding + i * xStep;
      const y = height - padding - ((Number(d[key]) || 0) - minVal) / range * (height - padding * 2);
      return { x, y };
    });
    const bottom = height - padding;
    return `M ${pts[0].x},${bottom} ${pts.map(p => `L ${p.x},${p.y}`).join(" ")} L ${pts[pts.length-1].x},${bottom} Z`;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={padding} x2={width - padding}
            y1={padding + f * (height - padding * 2)} y2={padding + f * (height - padding * 2)}
            stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
        ))}
        {/* Y-axis labels */}
        {[0, 0.5, 1].map((f) => (
          <text key={`y${f}`} x={padding - 2} y={padding + f * (height - padding * 2) + 3}
            fill="#aaa6c3" fontSize="7" textAnchor="end">
            {Math.round(maxVal - f * range)}
          </text>
        ))}
        {/* Area fills */}
        {keys.map((key, idx) => (
          <path key={`area-${key}`} d={toArea(key)} fill={colors[idx]} opacity="0.08" />
        ))}
        {/* Lines */}
        {keys.map((key, idx) => (
          <polyline key={key} points={toPoints(key)} fill="none"
            stroke={colors[idx]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <div className="flex gap-3 mt-1.5 flex-wrap">
        {keys.map((key, idx) => (
          <div key={key} className="flex items-center gap-1 text-[10px] text-secondary">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors[idx] }} />
            {labels[idx]}
          </div>
        ))}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
      active ? "bg-[#FFA500] text-black" : "bg-white/5 text-secondary hover:bg-white/10"
    }`}>
    {children}
  </button>
);

const EnergyCharts = ({ compact = false }) => {
  const [range, setRange] = useState("hourly");
  const [chartType, setChartType] = useState("power"); // power | phases | saved
  const [rows, setRows] = useState([]);
  const [phaseRows, setPhaseRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (view) => {
    setLoading(true);
    try {
      const { data } = await supabase.from(view).select("*").limit(24);
      if (view === "daily_phases") {
        setPhaseRows((data || []).slice().reverse());
      } else {
        setRows((data || []).slice().reverse());
      }
    } catch (e) { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (chartType === "phases") {
      fetchData("daily_phases");
    } else {
      fetchData(range);
    }
  }, [range, chartType, fetchData]);

  const chartHeight = compact ? 130 : 180;

  const renderChart = () => {
    if (loading) {
      return <div className="flex items-center justify-center text-secondary text-[11px]" style={{ height: chartHeight }}>Loading…</div>;
    }

    if (chartType === "phases") {
      return (
        <MiniLineChart data={phaseRows} height={chartHeight}
          keys={["solar_p1", "solar_p2", "grid_p1", "grid_p2"]}
          colors={["#FFD700", "#FFA500", "#ff6b6b", "#ff3344"]}
          labels={["Solar P1", "Solar P2", "Grid P1", "Grid P2"]}
        />
      );
    }

    if (chartType === "saved") {
      return (
        <MiniLineChart data={rows} height={chartHeight}
          keys={["solar", "home", "saved"]}
          colors={["#FFD700", "#4ecdc4", "#00ff88"]}
          labels={["Solar (W)", "Home (W)", "Saved (W)"]}
        />
      );
    }

    // Default: power
    return (
      <MiniLineChart data={rows} height={chartHeight}
        keys={["solar", "grid", "home"]}
        colors={["#FFD700", "#ff6b6b", "#4ecdc4"]}
        labels={["Solar (W)", "Grid (W)", "Home (W)"]}
      />
    );
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <TabButton active={chartType === "power"} onClick={() => setChartType("power")}>Power</TabButton>
        <TabButton active={chartType === "saved"} onClick={() => setChartType("saved")}>Saved</TabButton>
        <TabButton active={chartType === "phases"} onClick={() => setChartType("phases")}>Phases</TabButton>
        <span className="mx-1 text-white/20">|</span>
        {chartType !== "phases" && (
          <>
            <TabButton active={range === "hourly"} onClick={() => setRange("hourly")}>1H</TabButton>
            <TabButton active={range === "daily"} onClick={() => setRange("daily")}>1D</TabButton>
          </>
        )}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {renderChart()}
      </motion.div>
    </div>
  );
};

export default EnergyCharts;
