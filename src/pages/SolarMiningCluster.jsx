import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { logo, github } from "../assets";
import SolarHouseScene from "../components/solar/SolarHouseScene";
import EnergyGauges from "../components/solar/EnergyGauges";
import { useLatestEnergy } from "../lib/useLatestEnergy";
import { supabase } from "../lib/supabaseClient";

import EnergyCharts from "../components/solar/EnergyCharts";

import MinerFleet from "../components/solar/MinerFleet";
import MiningProfiles from "../components/solar/MiningProfiles";
import AntPoolCard from "../components/solar/AntPoolCard";
import AdminPanel from "../components/solar/AdminPanel";

const SectionTitle = ({ eyebrow, title }) => (
  <div className="mb-5">
    <p className="text-secondary text-[12px] uppercase tracking-wider">{eyebrow}</p>
    <h3 className="text-white font-bold text-[22px] sm:text-[28px]">{title}</h3>
  </div>
);

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

  return (


    <div className="relative z-0 bg-primary min-h-screen">
      {/* Top nav */}
      <nav className="w-full flex items-center justify-between px-6 sm:px-16 py-5 sticky top-0 z-20 bg-primary/90 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-10 h-10 object-contain" />
          <span className="text-white font-bold text-[16px]">Raphael | Portfolio</span>
        </Link>
        <a
          href="https://github.com/0xrphl/Solar-crypto-mining-farm-maximization-control"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-[13px] transition-colors"
        >
          <img src={github} alt="github" className="w-4 h-4" />
          Source Code
        </a>
      </nav>

      {/* Hero */}
      <div className="px-6 sm:px-16 pt-10 pb-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-[#FFD700] text-[13px] uppercase tracking-widest font-semibold">
            ☀️ Solar Mining Cluster — Live Dashboard
          </p>
          <h1 className="text-white font-black text-[32px] sm:text-[46px] leading-tight mt-1">
            Autonomous Surplus Maximization Control
          </h1>
          <p className="text-secondary text-[14px] sm:text-[16px] max-w-3xl mt-3 leading-relaxed">
            An ESP32-S3 controller dynamically scales Bitcoin mining hash power (0–2001W, 0–104.5 TH/s)
            to match real-time solar surplus — mining ONLY with free solar energy, zero grid consumption, ever.
            This page displays live public telemetry synced directly from Supabase.
          </p>
        </motion.div>
        <SolarHouseScene solarWatts={latest?.solar || 0} activeProfileId={activeProfileId} />

      </div>

      {/* Live gauges */}
      <div className="px-6 sm:px-16 py-6 max-w-7xl mx-auto">
        <SectionTitle eyebrow="Real-Time Telemetry" title="Live Energy Readings" />
        <EnergyGauges latest={latest} loading={loading} error={error} lastUpdated={lastUpdated} />
      </div>


      {/* Charts */}
      <div className="px-6 sm:px-16 py-6 max-w-7xl mx-auto">
        <SectionTitle eyebrow="Historical Data" title="Energy Trends" />
        <EnergyCharts />
      </div>

      {/* Miner fleet */}
      <div className="px-6 sm:px-16 py-6 max-w-7xl mx-auto">
        <SectionTitle eyebrow="Hardware" title="Mining Fleet Status" />
        <MinerFleet />
      </div>

      {/* Mining profiles */}
      <div className="px-6 sm:px-16 py-6 max-w-7xl mx-auto">
        <SectionTitle eyebrow="Decision Engine" title="Mining Profiles" />
        <MiningProfiles />
      </div>

      {/* AntPool */}
      <div className="px-6 sm:px-16 py-6 max-w-7xl mx-auto">
        <SectionTitle eyebrow="Mining Pool" title="AntPool Integration" />
        <AntPoolCard />
      </div>

      {/* Admin */}
      <div className="px-6 sm:px-16 py-6 pb-20 max-w-7xl mx-auto">
        <SectionTitle eyebrow="Restricted Access" title="Remote Admin Panel" />
        <AdminPanel />
      </div>

      <footer className="text-center text-secondary text-[12px] pb-8">
        Built with ESP32-S3 · Refoss EM06P · Tasmota · Supabase · React Three Fiber
      </footer>
    </div>
  );
};

export default SolarMiningCluster;
