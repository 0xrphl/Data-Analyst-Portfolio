import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function IoTVehicleTelemetry() {
  const [lang, setLang] = useState(() => localStorage.getItem('iot-lang') || 'en');
  const [showDocs, setShowDocs] = useState(false);
  const iframeRef = useRef(null);

  const datasheets = [
    { label: 'Final Circuit PNG', file: '/college/iot-vehicle-telemetry/hardware_schematics/circuit_layout_full.png' },
    { label: 'Final Circuit SVG', file: '/college/iot-vehicle-telemetry/hardware_schematics/circuit_layout_full.svg' },
    { label: 'SIM7672X / 7670G PDF', file: '/college/iot-vehicle-telemetry/hardware_schematics/SIM7672X_Series_Hardware_Design_V1.02.pdf' },
    { label: 'TI INA228 (48V DC) PDF', file: '/college/iot-vehicle-telemetry/hardware_schematics/INA228.PDF' },
    { label: 'Sensirion SHT31 PDF', file: '/college/iot-vehicle-telemetry/hardware_schematics/SHT31_Datasheet.pdf' },
    { label: 'Maxim DS18B20 PDF', file: '/college/iot-vehicle-telemetry/hardware_schematics/DS18B20.PDF' },
    { label: 'Bosch BMI160 IMU PDF', file: '/college/iot-vehicle-telemetry/hardware_schematics/bmi160-inertial-measurement-units.pdf' },
    { label: 'Maxim DS3231 RTC PDF', file: '/college/iot-vehicle-telemetry/hardware_schematics/DS3231.PDF' },
    { label: 'AT24C32 EEPROM PDF', file: '/college/iot-vehicle-telemetry/hardware_schematics/AT24C32.PDF' },
    { label: 'FNIRSI 2C53T Scope PDF', file: '/college/iot-vehicle-telemetry/hardware_schematics/FNIRSI_2C53T_Manual.pdf' },
  ];

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
    en: { back: 'Portfolio', title: 'Electric Delta-Kart SOTA Telemetry (LilyGO T-SIM7672G)' },
    es: { back: 'Portafolio', title: 'Telemetría SOTA Delta-Kart Eléctrico (LilyGO T-SIM7672G)' },
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
          <button
            onClick={() => setShowDocs((v) => !v)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 border bg-[rgba(16,185,129,0.14)] border-[rgba(16,185,129,0.45)] text-[#34d399] hover:bg-[rgba(16,185,129,0.25)]"
          >
            {lang === 'es' ? '📄 Datasheets y Circuito ⬇' : '📄 Datasheets & Circuit ⬇'}
          </button>
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
            style={{ background: 'linear-gradient(90deg, #0284c7, #2563eb)', color: '#fff' }}>
            T-SIM7672G · 4G + GNSS + R3F
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
            style={{ background: 'rgba(255,255,255,0.03)', color: '#555', borderColor: 'rgba(255,255,255,0.08)' }}>
            Pereira, Colombia
          </span>
        </div>
      </header>

      {showDocs && (
        <div className="px-4 sm:px-8 py-2.5 flex flex-wrap items-center gap-2 border-b border-[rgba(56,189,248,0.2)] bg-[#070d19]">
          <span className="text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider mr-1">
            {lang === 'es' ? 'Descargar Oficiales:' : 'Official Downloads:'}
          </span>
          {datasheets.map((d) => (
            <a
              key={d.label}
              href={d.file}
              download
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#0f172a] hover:bg-[#1e293b] text-[#e2e8f0] border border-[rgba(56,189,248,0.28)] transition-colors"
            >
              ⬇ {d.label}
            </a>
          ))}
        </div>
      )}

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