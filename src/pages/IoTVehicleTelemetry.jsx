import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function IoTVehicleTelemetry() {
  useEffect(() => {
    document.title = 'IoT Vehicle Telemetry — Pereira, Risaralda | 0xRaphael';
    return () => { document.title = '0xRaphael Portfolio'; };
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 border-b border-[#1a1a1a]"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #000000 100%)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-[#888] hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Portfolio
          </Link>
          <span className="text-[#333]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">📡</span>
            <h1 className="text-white font-bold text-sm sm:text-base tracking-tight">
              IoT Vehicle Telemetry
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
            style={{ background: 'linear-gradient(90deg, #0097A7, #1565C0)', color: '#fff' }}>
            LoRa + 4G
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#111] text-[#666] border border-[#222]">
            Pereira, Colombia
          </span>
        </div>
      </header>

      {/* Full-screen iframe */}
      <iframe
        src="/college/iot-vehicle-telemetry/index.html"
        title="IoT Vehicle Telemetry Dashboard"
        className="flex-1 w-full border-0"
        style={{ minHeight: 'calc(100vh - 52px)', background: '#000' }}
        allow="fullscreen"
      />
    </div>
  );
}