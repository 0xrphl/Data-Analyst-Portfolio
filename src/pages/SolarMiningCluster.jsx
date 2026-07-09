import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { logo, github } from "../assets";
import SolarHouseScene from "../components/solar/SolarHouseScene";
import EnergyGauges from "../components/solar/EnergyGauges";
import EnergyCharts from "../components/solar/EnergyCharts";
import MinerFleet from "../components/solar/MinerFleet";
import MiningProfiles from "../components/solar/MiningProfiles";
import AntPoolCard from "../components/solar/AntPoolCard";
import AdminPanel from "../components/solar/AdminPanel";
import SidebarPanel, { SidebarSection } from "../components/solar/SidebarPanel";
import ChannelDetails from "../components/solar/ChannelDetails";
import PhaseBreakdown from "../components/solar/PhaseBreakdown";
import EnergySavedCard from "../components/solar/EnergySavedCard";
import ProfileUsageChart from "../components/solar/ProfileUsageChart";
import TransitionsTimeline from "../components/solar/TransitionsTimeline";
import { useLatestEnergy } from "../lib/useLatestEnergy";
import { supabase } from "../lib/supabaseClient";

const PROFILE_NAMES = [
  "OFF","BN","OCT","BN+OCT","AV_LO","AV_LO+BN","AV_LO+OCT","AV_LO+BN+OCT",
  "AV_MD","AV_MD+BN","AV_HI","AV_MD+OCT","AV_HI+BN","AV_MD+BN+OCT","AV_HI+OCT","AV_HI+BN+OCT"
];
const PROFILE_WATTS = [0,81,180,261,800,881,980,1061,1600,1681,1720,1780,1801,1861,1900,2001];

const SolarMiningCluster = () => {
  const { latest, loading, error, lastUpdated } = useLatestEnergy();
  const [activeProfileId, setActiveProfileId] = React.useState(0);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from("transitions")
          .select("new_id")
          .order("ts", { ascending: false })
          .limit(1)
          .single();
        if (data) setActiveProfileId(data.new_id);
      } catch (e) { /* silent */ }
    };
    fetchProfile();
    const interval = setInterval(fetchProfile, 60000);
    return () => clearInterval(interval);
  }, []);

  const profileName = PROFILE_NAMES[activeProfileId] || "OFF";
  const profileWatts = PROFILE_WATTS[activeProfileId] || 0;

  return (
    <div className="relative z-0 bg-primary min-h-screen overflow-hidden">
      {/* ═══ MOBILE PORTRAIT — Rotate prompt (hidden on landscape + desktop) ═══ */}
      <style>{`
        .rotate-prompt { display: flex; }
        @media (min-width: 768px), (orientation: landscape) {
          .rotate-prompt { display: none !important; }
        }
      `}</style>
      <div className="rotate-prompt fixed inset-0 z-[999] bg-black/95 flex-col items-center justify-center text-center p-8">
        <div className="text-[48px] mb-4 animate-pulse">📱🔄</div>
        <h2 className="text-white font-bold text-[18px] mb-2">Rotate Your Device</h2>
        <p className="text-secondary text-[13px] max-w-xs">
          This solar mining dashboard is optimized for landscape orientation. Please rotate your device for the best experience.
        </p>
      </div>

      {/* ═══ FULL-SCREEN 3D SCENE (background) ═══ */}
      <SolarHouseScene
        solarWatts={latest?.solar || 0}
        activeProfileId={activeProfileId}
        fullScreen
      />

      {/* ═══ TOP NAV BAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
          <span className="text-white font-bold text-[14px] hidden sm:inline">Raphael</span>
        </Link>

        {/* Title appears in navbar after overlay fades — left aligned next to logo */}
        <motion.div
          className="pointer-events-none select-none hidden sm:flex flex-col ml-3 leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 6, duration: 1 }}
        >
          <span className="text-[#FFD700] text-[10px] uppercase tracking-[0.2em] font-semibold">
            ☀️ Solar Mining Cluster
          </span>
          <span className="text-white/60 text-[9px] font-medium">
            Autonomous Surplus Maximization
          </span>
        </motion.div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          {/* Live status pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : error ? "bg-red-400" : "bg-green-400"}`} />
            <span className="text-secondary">
              {loading ? "Connecting…" : error ? "Offline" : "Live"}
            </span>
          </div>

          {/* Solar badge */}
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-bold"
            style={{ background: "rgba(255,215,0,0.12)", color: "#FFD700" }}>
            ☀️ {latest?.solar != null ? `${Math.round(latest.solar)}W` : "—"}
          </div>

          {/* Profile badge */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold"
            style={{ background: "rgba(78,205,196,0.12)", color: "#4ecdc4" }}>
            ⛏️ {profileName} · {profileWatts}W
          </div>

          <a
            href="https://github.com/0xrphl/Solar-crypto-mining-farm-maximization-control"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-[12px] transition-colors"
          >
            <img src={github} alt="github" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </nav>

      {/* ═══ LEFT SIDEBAR — Energy & Analytics ═══ */}
      <SidebarPanel side="left" defaultOpen={true}>
        {/* Status bar — moved from bottom */}
        <div className="rounded-xl border border-gray-800 px-3 py-2.5 flex flex-col gap-1.5 backdrop-blur-xl" style={{ background: "rgba(5,5,12,0.6)" }}>
          <div className="flex items-center justify-between text-[11px]">
            <span>
              {latest?.grid != null ? (
                latest.grid < 0 ? (
                  <span className="text-green-400">🟢 Exporting {Math.abs(Math.round(latest.grid))}W</span>
                ) : (
                  <span className="text-yellow-400">🟡 Importing {Math.round(latest.grid)}W</span>
                )
              ) : (
                <span className="text-secondary">Waiting for data…</span>
              )}
            </span>
            <span className="text-secondary text-[11px]">
              🏠 {latest?.home != null ? `${Math.round(latest.home)}W` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-secondary">
            <span>Drag to orbit · Scroll to zoom</span>
            {lastUpdated && (
              <span className="tabular-nums">
                {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        <SidebarSection title="Live Energy" icon="⚡" defaultOpen={true}>
          <EnergyGauges latest={latest} loading={loading} error={error} lastUpdated={lastUpdated} compact />
        </SidebarSection>

        <SidebarSection title="Energy Saved" icon="💰" defaultOpen={true}>
          <EnergySavedCard latest={latest} />
        </SidebarSection>

        <SidebarSection title="Phase Breakdown" icon="🔀" defaultOpen={true}>
          <PhaseBreakdown latest={latest} />
        </SidebarSection>

        <SidebarSection title="Channel Details" icon="📊" defaultOpen={false}>
          <ChannelDetails latest={latest} />
        </SidebarSection>

        <SidebarSection title="Energy Charts" icon="📈" defaultOpen={true}>
          <EnergyCharts compact />
        </SidebarSection>

        <SidebarSection title="Admin Panel" icon="🔐" defaultOpen={false}>
          <AdminPanel />
        </SidebarSection>
      </SidebarPanel>

      {/* ═══ RIGHT SIDEBAR — Mining & Control ═══ */}
      <SidebarPanel side="right" defaultOpen={true}>
        <SidebarSection title="Mining Fleet" icon="⛏️" defaultOpen={true} subtitle="66.7–104.7 TH/s · 0–2001W">
          <MinerFleet activeProfileId={activeProfileId} />
        </SidebarSection>

        <SidebarSection title="Mining Profiles" icon="⚙️" defaultOpen={true}>
          <MiningProfiles />
        </SidebarSection>

        <SidebarSection title="Profile Usage" icon="📊" defaultOpen={true}>
          <ProfileUsageChart />
        </SidebarSection>

        <SidebarSection title="Mining BTC Pool - Antpool" icon="₿" defaultOpen={false}>
          <AntPoolCard />
        </SidebarSection>

        <SidebarSection title="Recent Transitions" icon="🔄" defaultOpen={true}>
          <TransitionsTimeline />
        </SidebarSection>
      </SidebarPanel>

      {/* ═══ CENTER TITLE OVERLAY — fades & flies up to navbar center ═══ */}
      <motion.div
        className="fixed z-20 left-1/2 text-center pointer-events-none select-none"
        style={{ top: "30vh", x: "-50%" }}
        initial={{ opacity: 1, y: 0, scale: 1 }}
        animate={{ opacity: 0, y: "-30vh", scale: 0.35 }}
        transition={{ delay: 4, duration: 2, ease: [0.4, 0, 0.2, 1] }}
      >
        <p className="text-[#FFD700] text-[11px] uppercase tracking-[0.3em] font-semibold mb-1">
          ☀️ Solar Mining Cluster
        </p>
        <h1 className="text-white font-black text-[20px] sm:text-[28px] leading-tight drop-shadow-lg">
          Autonomous Surplus Maximization
        </h1>
        <p className="text-secondary/80 text-[11px] mt-1 max-w-md mx-auto">
          ESP32-S3 scales Bitcoin mining (0–2001W) to match real-time solar surplus
        </p>
      </motion.div>
    </div>
  );
};

export default SolarMiningCluster;
