
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SidebarPanel = ({ side = "left", children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const isLeft = side === "left";

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 flex items-center justify-center w-8 h-8 rounded-full bg-black/70 border border-white/10 text-white text-[14px] hover:bg-white/10 transition-colors backdrop-blur-md"
        style={{
          top: 72,
          [isLeft ? "left" : "right"]: open ? 420 : 12,
          transition: "left 0.35s cubic-bezier(.4,0,.2,1), right 0.35s cubic-bezier(.4,0,.2,1)",
        }}
        title={open ? `Collapse ${side} panel` : `Expand ${side} panel`}
      >
        {open ? (isLeft ? "◀" : "▶") : isLeft ? "▶" : "◀"}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: isLeft ? -360 : 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLeft ? -360 : 360, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed z-40 top-[56px] bottom-0 overflow-y-auto overflow-x-hidden scrollbar-thin"
            style={{
              [isLeft ? "left" : "right"]: 0,
              width: 420,
              background: "transparent",
              borderRight: "none",
              borderLeft: "none",
            }}
          >
            <div className="p-3 flex flex-col gap-3 pb-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* Collapsible section inside a sidebar */
export const SidebarSection = ({ title, icon, children, defaultOpen = true, subtitle }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden backdrop-blur-xl" style={{ background: "rgba(5,5,12,0.6)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-[16px]">{icon}</span>
          <span className="text-white font-semibold text-[13px]">{title}</span>
        </span>
        <span className="flex items-center gap-2">
          {subtitle && <span className="text-secondary text-[9px] font-normal">{subtitle}</span>}
          <span className="text-secondary text-[11px]">{open ? "▾" : "▸"}</span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarPanel;
