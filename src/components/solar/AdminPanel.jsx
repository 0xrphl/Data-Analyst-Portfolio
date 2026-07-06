import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";
const SESSION_KEY = "solar_admin_authed";

const PasswordGate = ({ onSuccess }) => {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!ADMIN_PASSWORD) {
      setErr("Admin password not configured on this deployment.");
      return;
    }
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onSuccess();
    } else {
      setErr("Incorrect password.");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 max-w-sm mx-auto">
      <p className="text-secondary text-[13px] text-center">
        🔒 Enter the admin password to access remote miner controls.
      </p>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Admin password"
        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] outline-none focus:border-[#FFD700]"
      />
      {err && <p className="text-red-400 text-[12px] text-center">{err}</p>}
      <button
        type="submit"
        className="px-4 py-2.5 rounded-xl font-semibold text-black text-[14px]"
        style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}
      >
        Unlock Admin Panel
      </button>
    </form>
  );
};

const CommandButton = ({ label, onClick, active, color = "#4ecdc4" }) => (
  <button
    onClick={onClick}
    className="px-3 py-2 rounded-lg text-[12px] font-medium transition-all border"
    style={{
      background: active ? `${color}22` : "rgba(255,255,255,0.03)",
      borderColor: active ? color : "rgba(255,255,255,0.1)",
      color: active ? color : "#aaa6c3",
    }}
  >
    {label}
  </button>
);

const AdminDashboard = ({ onLock }) => {
  const [sending, setSending] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [transitions, setTransitions] = useState([]);
  const [config, setConfig] = useState(null);

  const loadData = useCallback(async () => {
    const { data: trans } = await supabase
      .from("transitions")
      .select("*")
      .order("ts", { ascending: false })
      .limit(10);
    setTransitions(trans || []);

    const { data: cfg } = await supabase.from("config").select("*");
    setConfig(cfg || []);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sendCommand = async (type, payload = {}) => {
    setSending(type);
    setFeedback(null);
    try {
      const { error } = await supabase.from("commands").insert({
        type,
        payload,
        status: "pending",
      });
      if (error) throw error;
      setFeedback({ ok: true, msg: `Command "${type}" queued. ESP32 will apply it within 30s.` });
    } catch (e) {
      setFeedback({
        ok: false,
        msg: `Could not queue command: ${e.message}. Make sure the "commands" table exists (see supabase_commands.sql).`,
      });
    } finally {
      setSending(null);
      loadData();
    }
  };

  const lock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    onLock();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-bold text-[18px]">🔧 Remote Control Panel</h4>
        <button onClick={lock} className="text-[12px] text-secondary hover:text-white">
          Lock 🔒
        </button>
      </div>

      {feedback && (
        <div
          className={`text-[13px] px-4 py-2 rounded-lg ${
            feedback.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <p className="text-secondary text-[12px] uppercase mb-2">Relay R1 — BitAxe + NerdQAxe (81W)</p>
          <div className="flex gap-2">
            <CommandButton
              label={sending === "r1_on" ? "Sending…" : "Turn ON"}
              onClick={() => sendCommand("r1_on")}
              color="#4ecdc4"
            />
            <CommandButton
              label={sending === "r1_off" ? "Sending…" : "Turn OFF"}
              onClick={() => sendCommand("r1_off")}
              color="#ff6b6b"
            />
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <p className="text-secondary text-[12px] uppercase mb-2">Relay R2 — Octaxe (180W)</p>
          <div className="flex gap-2">
            <CommandButton
              label={sending === "r2_on" ? "Sending…" : "Turn ON"}
              onClick={() => sendCommand("r2_on")}
              color="#4ecdc4"
            />
            <CommandButton
              label={sending === "r2_off" ? "Sending…" : "Turn OFF"}
              onClick={() => sendCommand("r2_off")}
              color="#ff6b6b"
            />
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 border border-white/10 sm:col-span-2">
          <p className="text-secondary text-[12px] uppercase mb-2">Canaan Avalon Q</p>
          <div className="flex flex-wrap gap-2">
            <CommandButton
              label="Sleep"
              onClick={() => sendCommand("avalon_mode", { mode: "off" })}
              color="#555"
              active={sending === "avalon_sleep"}
            />
            <CommandButton
              label="Low (800W)"
              onClick={() => sendCommand("avalon_mode", { mode: "low" })}
              color="#FFD700"
            />
            <CommandButton
              label="Mid (1600W)"
              onClick={() => sendCommand("avalon_mode", { mode: "mid" })}
              color="#fa709a"
            />
            <CommandButton
              label="High (1720W)"
              onClick={() => sendCommand("avalon_mode", { mode: "high" })}
              color="#ff6b6b"
            />
            <CommandButton
              label="Reboot"
              onClick={() => sendCommand("avalon_reboot")}
              color="#aaa6c3"
            />
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 border border-white/10 sm:col-span-2">
          <p className="text-secondary text-[12px] uppercase mb-2">System</p>
          <div className="flex flex-wrap gap-2">
            <CommandButton label="Force Supabase Sync Now" onClick={() => sendCommand("force_sync")} color="#4ecdc4" />
            <CommandButton label="Enable Auto-Pilot" onClick={() => sendCommand("auto_enable")} color="#4ecdc4" />
            <CommandButton label="Disable Auto-Pilot (Manual Mode)" onClick={() => sendCommand("auto_disable")} color="#ff6b6b" />
          </div>
        </div>
      </div>

      <div>
        <h5 className="text-white font-semibold text-[14px] mb-2">Recent Transitions</h5>
        <div className="bg-black/30 rounded-xl border border-white/10 overflow-x-auto">
          <table className="w-full text-[12px] text-left">
            <thead>
              <tr className="text-secondary border-b border-white/10">
                <th className="p-2">Time</th>
                <th className="p-2">From</th>
                <th className="p-2">To</th>
                <th className="p-2">Surplus (W)</th>
                <th className="p-2">Grid (W)</th>
              </tr>
            </thead>
            <tbody>
              {transitions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-secondary">
                    No transitions logged yet.
                  </td>
                </tr>
              ) : (
                transitions.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 text-white">
                    <td className="p-2">{new Date(t.ts).toLocaleString()}</td>
                    <td className="p-2">#{t.old_id}</td>
                    <td className="p-2">#{t.new_id}</td>
                    <td className="p-2">{Math.round(t.surplus || 0)}</td>
                    <td className="p-2">{Math.round(t.grid || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {config && config.length > 0 && (
        <div>
          <h5 className="text-white font-semibold text-[14px] mb-2">Config (read-only view)</h5>
          <div className="bg-black/30 rounded-xl border border-white/10 p-3 text-[12px] text-secondary font-mono overflow-x-auto">
            {config.map((c) => (
              <div key={c.key} className="mb-1">
                <span className="text-white">{c.key}</span>: {JSON.stringify(c.value)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPanel = () => {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setUnlocked(true);
  }, []);

  return (
    <div className="bg-tertiary/40 backdrop-blur-md rounded-2xl border border-white/10 p-6">
      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.div key="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PasswordGate onSuccess={() => setUnlocked(true)} />
          </motion.div>
        ) : (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminDashboard onLock={() => setUnlocked(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
