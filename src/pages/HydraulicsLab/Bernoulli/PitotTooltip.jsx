import React from 'react'

/**
 * Tooltip técnico SOTA para la Punta Encogida del Tubo de Pitot y Zona de Estancamiento.
 * Incluye diagrama vectorial en vivo de líneas de corriente, cono de nariz ahusado,
 * punto de estancamiento (V -> 0) y desglose energético completo.
 */

const TT = {
  wrap: (pinned) => ({
    position: 'fixed',
    zIndex: 9999,
    pointerEvents: pinned ? 'auto' : 'none',
    transition: 'opacity 0.16s ease, transform 0.14s ease',
  }),
  card: (pinned) => ({
    background: 'rgba(8, 11, 24, 0.96)',
    border: pinned ? '1px solid #ff9100' : '1px solid #2e3b68',
    borderRadius: 14,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    boxShadow: pinned
      ? '0 16px 52px rgba(0,0,0,0.82), 0 0 24px rgba(255,145,0,0.22)'
      : '0 14px 48px rgba(0,0,0,0.75), 0 0 0 1px rgba(130,207,255,0.14)',
    overflow: 'hidden',
    width: 372,
    maxWidth: 'calc(100vw - 24px)',
    color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'linear-gradient(90deg, rgba(255,109,0,0.18) 0%, rgba(2,136,209,0.14) 100%)',
    borderBottom: '1px solid #1e293b',
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: '#ff9100',
    boxShadow: '0 0 10px #ff9100, 0 0 4px #fff',
  },
  title: {
    fontSize: 13,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '0.02em',
  },
  subtitle: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: 500,
  },
  badge: {
    fontSize: 10.5,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 5,
    background: 'rgba(0, 230, 118, 0.16)',
    color: '#00e676',
    border: '1px solid rgba(0, 230, 118, 0.4)',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid #334155',
    color: '#cbd5e1',
    borderRadius: 6,
    padding: '2px 7px',
    fontSize: 11,
    cursor: 'pointer',
    fontWeight: 700,
    marginLeft: 6,
  },
  diagramWrap: {
    width: '100%',
    height: 148,
    background: 'radial-gradient(circle at 38% 50%, rgba(255, 109, 0, 0.14), rgba(7, 10, 22, 0.98) 70%)',
    borderBottom: '1px solid #1e293b',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '11px 14px 13px',
  },
  eqBanner: {
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid #26324d',
    borderRadius: 8,
    padding: '6px 10px',
    marginBottom: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 11.5,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
    marginBottom: 8,
  },
  metricBox: (accent) => ({
    background: 'rgba(15, 23, 42, 0.72)',
    border: `1px solid ${accent}44`,
    borderLeft: `3px solid ${accent}`,
    borderRadius: 6,
    padding: '5px 8px',
  }),
  metricLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginBottom: 1,
  },
  metricVal: (color) => ({
    fontSize: 12.5,
    fontWeight: 800,
    color: color || '#fff',
    fontVariantNumeric: 'tabular-nums',
  }),
  metricSub: {
    fontSize: 10,
    color: '#64748b',
    fontVariantNumeric: 'tabular-nums',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 11.5,
    lineHeight: 1.75,
    color: '#9aa2c0',
  },
  val: {
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: '#82cfff',
  },
  footerHint: {
    marginTop: 7,
    paddingTop: 6,
    borderTop: '1px solid #1e293b',
    fontSize: 10.5,
    color: '#64748b',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}
export default function PitotTooltip({ pitotData, mousePos, pinned = false, onClose }) {
  if (!pitotData) return null

  const winW = typeof window !== 'undefined' ? window.innerWidth : 1280
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800

  const rawX = mousePos?.x || winW * 0.5
  const rawY = mousePos?.y || winH * 0.35
  const left = Math.max(12, Math.min(rawX + 20, winW - 390))
  const top = Math.max(12, Math.min(rawY - 20, winH - 435))

  const stag_mm = pitotData.stagnationHead_mm ?? 0
  const stat_mm = pitotData.pressureHead_mm ?? 0
  const stag_kPa = (pitotData.stagnationP ?? 0) / 1000
  const stat_kPa = (pitotData.P ?? 0) / 1000
  const x_mm = (pitotData.x ?? 0) * 1000

  return (
    <div style={{ ...TT.wrap(pinned), left, top }}>
      <div style={TT.card(pinned)}>
        <div style={TT.header}>
          <div style={TT.titleWrap}>
            <span style={TT.pulseDot} />
            <div>
              <div style={TT.title}>Sonda Pitot-Prandtl · Punta de Estancamiento</div>
              <div style={TT.subtitle}>
                Corte de boquilla ahusada en x = {x_mm.toFixed(0)} mm ({pitotData.sectionLabel || pitotData.name})
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={TT.badge}>{pitotData.name || 'S3'}</span>
            {pinned && onClose && (
              <button style={TT.closeBtn} onClick={onClose} title="Cerrar tooltip fijo">
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={TT.diagramWrap}>
          <svg width="352" height="140" viewBox="0 0 352 140" fill="none">
            <defs>
              <linearGradient id="pitotMetal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="45%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <radialGradient id="stagGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff9100" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#ff3d00" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ff3d00" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="pipeWall" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0288d1" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            <line x1="10" y1="18" x2="342" y2="18" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 3" />
            <rect x="10" y="12" width="332" height="6" fill="url(#pipeWall)" />
            <line x1="10" y1="122" x2="342" y2="122" stroke="#38bdf8" strokeWidth="2.5" />
            <rect x="10" y="122" width="332" height="6" fill="url(#pipeWall)" />
            <text x="16" y="30" fill="#7dd3fc" fontSize="9.5" fontWeight="600">
              CORTE LONGITUDINAL (1/2 TUBERÍA) · ∅ {pitotData.D_mm?.toFixed(1)} mm
            </text>

            <path d="M 14 48 C 75 48, 105 46, 136 37 C 168 29, 210 29, 285 30" stroke="#38bdf8" strokeWidth="1.6" strokeOpacity="0.85" fill="none" />
            <path d="M 14 59 C 80 59, 108 57, 134 45 C 160 35, 205 36, 285 37" stroke="#00e5ff" strokeWidth="1.8" fill="none" />
            <path d="M 14 81 C 80 81, 108 83, 134 95 C 160 105, 205 104, 285 103" stroke="#00e5ff" strokeWidth="1.8" fill="none" />
            <path d="M 14 92 C 75 92, 105 94, 136 103 C 168 111, 210 111, 285 110" stroke="#38bdf8" strokeWidth="1.6" strokeOpacity="0.85" fill="none" />

            <line x1="14" y1="70" x2="124" y2="70" stroke="#ff9100" strokeWidth="2.4" strokeDasharray="4 2" />
            <polygon points="118,66 126,70 118,74" fill="#ff9100" />

            <ellipse cx="131" cy="70" rx="14" ry="16" fill="url(#stagGlow)" />
            <circle cx="132" cy="70" r="4.2" fill="#fff" stroke="#ff6d00" strokeWidth="2" />

            <path d="M 134 63 L 166 54 L 272 54 L 272 86 L 166 86 L 134 77 Z" fill="url(#pitotMetal)" stroke="#fef08a" strokeWidth="1.2" />
            <rect x="248" y="14" width="18" height="42" fill="url(#pitotMetal)" stroke="#fef08a" strokeWidth="1" />

            <path d="M 134 66.5 L 168 65 L 257 65 L 257 16" stroke="#ff6d00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 134 66.5 L 168 65 L 257 65 L 257 16" stroke="#ffd180" strokeWidth="1.6" strokeDasharray="3 2" />
            <path d="M 134 63 C 139 65, 139 75, 134 77" fill="#090d16" stroke="#ff9100" strokeWidth="1.5" />

            <circle cx="195" cy="55.5" r="2.2" fill="#00e5ff" />
            <circle cx="212" cy="55.5" r="2.2" fill="#00e5ff" />
            <circle cx="195" cy="84.5" r="2.2" fill="#00e5ff" />
            <circle cx="212" cy="84.5" r="2.2" fill="#00e5ff" />
            <text x="20" y="64" fill="#ffb74d" fontSize="9.5" fontWeight="700">V = √(2g·Δh) (Calcular)</text>
            <text x="64" y="114" fill="#ff9100" fontSize="9.5" fontWeight="800">Punto Estancamiento (V = 0)</text>
            <line x1="122" y1="104" x2="130" y2="77" stroke="#ff9100" strokeWidth="1.2" />
            <text x="172" y="74" fill="#fff" fontSize="9" fontWeight="700">Canal P₀ (hTotal** = {stag_mm.toFixed(1)} mm)</text>
          </svg>
        </div>
        <div style={TT.body}>
          <div style={TT.eqBanner}>
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Teorema de Pitot:</span>
            <span style={{ color: '#00e676', fontWeight: 800, fontFamily: 'monospace', fontSize: 12 }}>
              hTotal** = h_est + V²/(2g)
            </span>
          </div>

          <div style={TT.grid}>
            <div style={TT.metricBox('#ff9100')}>
              <div style={TT.metricLabel}>Altura Pitot hTotal**</div>
              <div style={TT.metricVal('#ff9100')}>{stag_mm.toFixed(1)} mm</div>
              <div style={TT.metricSub}>P₀ = {stag_kPa.toFixed(2)} kPa</div>
            </div>

            <div style={TT.metricBox('#38bdf8')}>
              <div style={TT.metricLabel}>Altura Estática Pared</div>
              <div style={TT.metricVal('#38bdf8')}>{stat_mm.toFixed(1)} mm</div>
              <div style={TT.metricSub}>P_est = {stat_kPa.toFixed(2)} kPa</div>
            </div>

            <div style={TT.metricBox('#00e676')}>
              <div style={TT.metricLabel}>1. Cabeza Dinámica Δh_din</div>
              <div style={TT.metricVal('#00e676')}>? mm</div>
              <div style={TT.metricSub}>Calcular: hTotal** − h_est</div>
            </div>

            <div style={TT.metricBox('#c084fc')}>
              <div style={TT.metricLabel}>2. Velocidad en Punta (V)</div>
              <div style={TT.metricVal('#e9d5ff')}>? m/s</div>
              <div style={TT.metricSub}>Calcular: √(2·g·Δh_din)</div>
            </div>
          </div>

          <div style={TT.row}>
            <span>Geometría local en la punta (Dato)</span>
            <span style={TT.val}>
              ∅ {pitotData.D_mm?.toFixed(2)} mm · A = {pitotData.A_mm2?.toFixed(1)} mm²
            </span>
          </div>
          <div style={TT.row}>
            <span>3. Caudal estimado por Pitot (Q = A · V_Pitot)</span>
            <span style={{ ...TT.val, color: '#ffb74d' }}>
              ? L/s (Calcular)
            </span>
          </div>

          <div style={TT.footerHint}>
            <span>
              {pinned
                ? '📌 Tooltip fijado · Clic en ✕ o en la punta para soltar'
                : '💡 Clic en la punta encogida para fijar este panel'}
            </span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Clic en tubo = mover Pitot</span>
          </div>
        </div>
      </div>
    </div>
  )
}
