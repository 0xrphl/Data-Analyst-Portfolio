import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const PROFILE_NAMES = [
  "OFF","BN","OCT","BN+OCT","AV_LO","AV_LO+BN","AV_LO+OCT","AV_LO+BN+OCT",
  "AV_MD","AV_MD+BN","AV_HI","AV_MD+OCT","AV_HI+BN","AV_MD+BN+OCT","AV_HI+OCT","AV_HI+BN+OCT"
];

const TransitionsTimeline = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("transitions")
          .select("*")
          .order("ts", { ascending: false })
          .limit(8);
        setRows(data || []);
      } catch (e) { /* silent */ }
      setLoading(false);
    };
    fetch();
    const iv = setInterval(fetch, 60000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return <div className="text-secondary text-[11px] py-2">Loading…</div>;
  if (!rows.length) return <div className="text-secondary text-[11px] py-2">No transitions yet.</div>;

  return (
    <div className="flex flex-col gap-1">
      {rows.map((t, i) => {
        const time = new Date(t.ts);
        const fromName = PROFILE_NAMES[t.old_id] || `#${t.old_id}`;
        const toName = PROFILE_NAMES[t.new_id] || `#${t.new_id}`;
        const isUp = (t.new_id || 0) > (t.old_id || 0);
        return (
          <div key={t.id} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
            <span className={`text-[12px] ${isUp ? "text-green-400" : "text-red-400"}`}>
              {isUp ? "▲" : "▼"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-white truncate">
                <span className="text-secondary">{fromName}</span>
                <span className="text-secondary mx-1">→</span>
                <span className="font-semibold">{toName}</span>
              </div>
              <div className="text-[9px] text-secondary tabular-nums">
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" · "}
                {Math.round(t.surplus || 0)}W surplus
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransitionsTimeline;
