import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

const PROFILES = [
  { id: 0, name: "OFF", w: 0, r1: false, r2: false, avalon: "off" },
  { id: 1, name: "BN", w: 81, r1: true, r2: false, avalon: "off" },
  { id: 2, name: "OCT", w: 180, r1: false, r2: true, avalon: "off" },
  { id: 3, name: "BN+OCT", w: 261, r1: true, r2: true, avalon: "off" },
  { id: 4, name: "AV_LO", w: 800, r1: false, r2: false, avalon: "low" },
  { id: 5, name: "AV_LO+BN", w: 881, r1: true, r2: false, avalon: "low" },
  { id: 6, name: "AV_LO+OCT", w: 980, r1: false, r2: true, avalon: "low" },
  { id: 7, name: "AV_LO+BN+OCT", w: 1061, r1: true, r2: true, avalon: "low" },
  { id: 8, name: "AV_MD", w: 1600, r1: false, r2: false, avalon: "mid" },
  { id: 9, name: "AV_MD+BN", w: 1681, r1: true, r2: false, avalon: "mid" },
  { id: 10, name: "AV_HI", w: 1720, r1: false, r2: false, avalon: "high" },
  { id: 11, name: "AV_MD+OCT", w: 1780, r1: false, r2: true, avalon: "mid" },
  { id: 12, name: "AV_HI+BN", w: 1801, r1: true, r2: false, avalon: "high" },
  { id: 13, name: "AV_MD+BN+OCT", w: 1861, r1: true, r2: true, avalon: "mid" },
  { id: 14, name: "AV_HI+OCT", w: 1900, r1: false, r2: true, avalon: "high" },
  { id: 15, name: "AV_HI+BN+OCT", w: 2001, r1: true, r2: true, avalon: "high" },
];

const avalonColor = { off: "#555", low: "#FFD700", mid: "#fa709a", high: "#ff6b6b" };

const MiningProfiles = () => {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const fetchTransition = async () => {
      try {
        const { data, error } = await supabase
          .from("transitions")
          .select("new_id")
          .order("ts", { ascending: false })
          .limit(1)
          .single();
        if (!error && data) setActiveId(data.new_id);
      } catch (e) {
        /* silent fail — public visualization only */
      }
    };
    fetchTransition();
    const interval = setInterval(fetchTransition, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p className="text-secondary text-[10px] mb-2">
        16 profiles · Auto-selected every ~9 min based on solar surplus
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {PROFILES.map((p) => {
          const isActive = activeId === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: p.id * 0.02 }}
              className={`rounded-xl p-2.5 border text-center relative overflow-hidden ${
                isActive ? "border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.4)]" : "border-white/10"
              }`}
              style={{ background: isActive ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.02)" }}
            >
              {isActive && (
                <span className="absolute top-1 right-1 text-[9px] bg-[#FFD700] text-black px-1.5 py-0.5 rounded-full font-bold">
                  ACTIVE
                </span>
              )}
              <div className="text-[10px] text-secondary">#{p.id}</div>
              <div className="text-white font-semibold text-[11px] leading-tight">{p.name}</div>
              <div className="text-[13px] font-bold mt-1" style={{ color: avalonColor[p.avalon] }}>
                {p.w}W
              </div>
              <div className="flex justify-center gap-1 mt-1">
                <span className={`w-2 h-2 rounded-full ${p.r1 ? "bg-[#4ecdc4]" : "bg-white/10"}`} title="R1" />
                <span className={`w-2 h-2 rounded-full ${p.r2 ? "bg-[#FFD700]" : "bg-white/10"}`} title="R2" />
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: p.avalon === "off" ? "rgba(255,255,255,0.1)" : avalonColor[p.avalon] }}
                  title="Avalon"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MiningProfiles;
