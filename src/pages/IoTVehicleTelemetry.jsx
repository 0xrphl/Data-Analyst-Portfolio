import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function IoTVehicleTelemetry() {
  const [lang, setLang] = useState(() => localStorage.getItem('iot-lang') || 'en');
  const iframeRef = useRef(null);

  useEffect(() => {
    document.title = lang === 'es'
      ? 'Telemetría Vehicular IoT — Pereira, Risaralda | 0xRaphael'
      : 'IoT Vehicle Telemetry — Pereira, Risaralda | 0xRaphael';
    return () => { document.title = '0xRaphael Portfolio'; };
  }, [lang]);

  const toggleLang = (l) => {
    setLang(l);
    localStorage.setItem('iot-lang', l);
    // Sync lang to iframe
    try {
      const iframeWin = iframeRef.current?.contentWindow;
      if (iframeWin && typeof iframeWin.setLang === 'function') {
        iframeWin.setLang(l);
      }
    } catch (e) { /* cross-origin safety */ }
  };

  const t = {
    en: { back: 'Portfolio', title: 'IoT Vehicle Telemetry' },
    es: { back: 'Portafolio', title: 'Telemetría Vehicular IoT' },
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-[#666] hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t[lang].back}
          </Link>
          <span className="text-[#222]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">📡</span>
            <h1 className="text-white font-bold text-sm sm:text-base tracking-tight">
              {t[lang].title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => toggleLang('en')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 border ${lang === 'en' ? 'bg-[rgba(88,166,255,0.15)] border-[rgba(88,166,255,0.4)] text-[#58a6ff]' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#555] hover:text-white hover:border-[rgba(255,255,255,0.2)]'}`}
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => toggleLang('es')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 border ${lang === 'es' ? 'bg-[rgba(88,166,255,0.15)] border-[rgba(88,166,255,0.4)] text-[#58a6ff]' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#555] hover:text-white hover:border-[rgba(255,255,255,0.2)]'}`}
            >
              🇪🇸 ES
            </button>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
            style={{ background: 'linear-gradient(90deg, #0097A7, #1565C0)', color: '#fff' }}>
            LoRa + 4G
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
            style={{ background: 'rgba(255,255,255,0.03)', color: '#555', borderColor: 'rgba(255,255,255,0.08)' }}>
            Pereira, Colombia
          </span>
        </div>
      </header>

      {/* Full-screen iframe */}
      <iframe
        ref={iframeRef}
        src="/college/iot-vehicle-telemetry/index.html"
        title="IoT Vehicle Telemetry Dashboard"
        className="flex-1 w-full border-0"
        style={{ minHeight: 'calc(100vh - 52px)', background: '#000' }}
        allow="fullscreen"
      />
    </div>
  );
}