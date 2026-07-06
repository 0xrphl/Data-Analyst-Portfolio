import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

const ANTPOOL_URL =
  "https://www.antpool.com/observer?accessKey=K8KhLkMH9hDRPzIB2TAp&coinType=BCH&observerUserId=qp4tgw9esf466zs5udmjv6anzw9h9xvrrgudul2agn";


const AntPoolCard = () => {
  const [loadState, setLoadState] = useState("loading"); // loading | ok | blocked
  const timeoutRef = useRef(null);
  const iframeRef = useRef(null);

  const handleLoad = useCallback(() => {
    // onLoad fires even for blocked frames sometimes (about:blank fallback),
    // so we still keep a short grace period to detect actual paint via a timer.
    clearTimeout(timeoutRef.current);
    setLoadState("ok");
  }, []);

  const startTimeoutCheck = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setLoadState((prev) => (prev === "loading" ? "blocked" : prev));
    }, 6000);
  }, []);

  React.useEffect(() => {
    startTimeoutCheck();
    return () => clearTimeout(timeoutRef.current);
  }, [startTimeoutCheck]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative rounded-2xl border border-white/10 overflow-hidden bg-black/40"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-[22px]">⛏️</span>
          <h4 className="text-white font-bold text-[18px]">AntPool Mining Dashboard</h4>
        </div>
        <a
          href={ANTPOOL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-secondary transition-colors"
        >
          Open in new tab ↗
        </a>
      </div>



      <div className="relative w-full" style={{ height: 720, background: "#0a0a0a" }}>
        {loadState === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center text-secondary text-[13px]">
            Loading AntPool dashboard…
          </div>
        )}

        {loadState === "blocked" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-[32px]">🔒</span>
            <p className="text-secondary text-[13px] max-w-md">
              AntPool doesn't allow their observer dashboard to be embedded in other websites
              (cross-origin security policy). Open it directly in a new tab to view live stats.
            </p>
            <a
              href={ANTPOOL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl font-semibold text-black text-[14px] transition-transform hover:scale-105"
              style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}
            >
              Open AntPool Observer ↗
            </a>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={ANTPOOL_URL}
          title="AntPool Observer Dashboard"
          onLoad={handleLoad}
          className="w-full h-full border-0"
          style={{
            opacity: loadState === "ok" ? 1 : 0,
            colorScheme: "dark",
            filter: "invert(0.92) hue-rotate(180deg)",
            transition: "opacity 0.4s ease",
          }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          loading="lazy"
        />
      </div>
    </motion.div>
  );
};

export default AntPoolCard;
