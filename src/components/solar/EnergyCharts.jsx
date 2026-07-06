import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

// Lightweight, dependency-free SVG line chart
const LineChart = ({ data, keys, colors, labels, height = 220 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-secondary text-sm">
        No data yet — waiting for first sync.
      </div>
    );
  }

  const width = 800;
  const padding = 30;
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

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px]" style={{ height }}>
        {/* grid lines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padding}
            x2={width - padding}
            y1={padding + f * (height - padding * 2)}
            y2={padding + f * (height - padding * 2)}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="4"
          />
        ))}
        {keys.map((key, idx) => (
          <polyline
            key={key}
            points={toPoints(key)}
            fill="none"
            stroke={colors[idx]}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="flex gap-4 mt-2 flex-wrap">
        {keys.map((key, idx) => (
          <div key={key} className="flex items-center gap-1.5 text-[12px] text-secondary">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: colors[idx] }} />
            {labels[idx]}
          </div>
        ))}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
      active ? "bg-[#FFA500] text-black" : "bg-white/5 text-secondary hover:bg-white/10"
    }`}
  >
    {children}
  </button>
);

const EnergyCharts = () => {
  const [range, setRange] = useState("hourly");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (view) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(view)
        .select("*")
        .limit(24);
      if (error) throw error;
      setRows((data || []).slice().reverse());
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  return (
    <div className="bg-tertiary/40 backdrop-blur-md rounded-2xl border border-white/10 p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h4 className="text-white font-bold text-[18px]">Energy History</h4>
        <div className="flex gap-2">
          <TabButton active={range === "hourly"} onClick={() => setRange("hourly")}>
            Hourly
          </TabButton>
          <TabButton active={range === "daily"} onClick={() => setRange("daily")}>
            Daily
          </TabButton>
        </div>
      </div>
      {loading ? (
        <div className="h-[220px] flex items-center justify-center text-secondary text-sm">
          Loading chart…
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <LineChart
            data={rows}
            keys={["solar", "grid", "home"]}
            colors={["#FFD700", "#ff6b6b", "#4ecdc4"]}
            labels={["Solar (W)", "Grid (W)", "Home (W)"]}
          />
        </motion.div>
      )}
    </div>
  );
};

export default EnergyCharts;
