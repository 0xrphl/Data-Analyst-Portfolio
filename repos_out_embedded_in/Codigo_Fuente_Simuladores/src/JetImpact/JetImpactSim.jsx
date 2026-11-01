import React, { useMemo, useState, useCallback, useEffect } from 'react'
import JetImpactScene from './JetImpactScene.jsx'
import DerivationPanel from '../DerivationPanel.jsx'
import JetImpactCharts from './JetImpactCharts.jsx'
import { getDerivation } from './derivation.js'
import {
  solveJetImpactLab,
  VANE_CONFIGS,
  AVAILABLE_WEIGHTS,
  D_JET_FIXED_M,
  JET_AREA_M2,
  DISTANCE_JET_VANE_M,
  GRAVITY,
} from './solver.js'

const SIDEBAR_WIDTH = 'clamp(520px, 40vw, 700px)'

const S = {
  app: { display: 'flex', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' },
  viewport: { flex: 1, position: 'relative', height: '100%', minWidth: 0 },

  sidebar: (isOpen, isMobile) => ({
    width: isOpen ? (isMobile ? '100vw' : SIDEBAR_WIDTH) : '0px',
    maxWidth: isMobile ? '100vw' : '760px',
    borderLeft: isOpen ? '1px solid #1e2338' : 'none',
    background: '#0b0d1a',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    zIndex: isMobile ? 120 : 20,
    position: isMobile ? 'fixed' : 'relative',
    right: 0,
    top: 0,
    bottom: 0,
    boxShadow: isMobile && isOpen ? '-8px 0 24px rgba(0,0,0,0.7)' : 'none',
  }),
  sidebarInner: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    scrollbarWidth: 'thin',
    scrollbarColor: '#2a3152 #0d1020',
  },

  tabHeader: {
    display: 'flex',
    borderBottom: '1px solid #1e2338',
    background: '#0d1020',
    padding: '4px 6px',
    gap: 6,
  },
  tabBtn: (active) => ({
    flex: 1,
    padding: '8px 10px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: active ? '#1a237e' : 'transparent',
    color: active ? '#82cfff' : '#9aa2c0',
    transition: 'all 0.18s ease',
  }),

  sidebarOpenBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 130,
    background: 'rgba(13, 16, 32, 0.94)',
    border: '1px solid #2a3152',
    color: '#82cfff',
    borderRadius: 7,
    padding: '7px 13px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
    transition: 'all 0.15s ease',
  },
  sidebarCloseBtn: {
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 6,
    border: '1px solid #2a3152',
    background: 'rgba(255,255,255,0.05)',
    color: '#82cfff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },

  hudWrap: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  hud: (isCollapsed) => ({
    background: 'rgba(11, 13, 26, 0.95)',
    border: '1px solid #2a3152',
    borderRadius: 10,
    padding: isCollapsed ? '6px 12px' : '10px 14px',
    fontSize: 11.5,
    lineHeight: 1.5,
    width: isCollapsed ? 'auto' : 'clamp(270px, 22vw, 305px)',
    maxWidth: 'calc(100vw - 28px)',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#2a3152 rgba(11, 13, 26, 0.8)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
    transition: 'all 0.2s ease',
  }),
  hudHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
  },
  hudTitle: { fontWeight: 800, fontSize: 13, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 },
  collapseBtn: {
    background: 'rgba(42, 49, 82, 0.5)',
    border: '1px solid #2a3152',
    borderRadius: 4,
    color: '#82cfff',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 7px',
    cursor: 'pointer',
  },
  sep: { height: 1, background: '#1e2338', margin: '8px 0' },
  val: { color: '#82cfff', fontVariantNumeric: 'tabular-nums', fontWeight: 600 },
  hot: { color: '#ff8f5a', fontVariantNumeric: 'tabular-nums', fontWeight: 600 },
  green: { color: '#00e676', fontVariantNumeric: 'tabular-nums', fontWeight: 700 },
  red: { color: '#ff3b30', fontVariantNumeric: 'tabular-nums', fontWeight: 700 },
}


const INITIAL_ROWS = {
  vane_90: [
    { id: 1, mass_g: 20, Fexp: 0.1962, volumenL: 5, time_s: 48.0, Q_m3s: 0.000104, Fteo: 0.215, efficiency: 54.8, errorPercent: 8.7 },
    { id: 2, mass_g: 50, Fexp: 0.4905, volumenL: 5, time_s: 30.5, Q_m3s: 0.000164, Fteo: 0.534, efficiency: 54.4, errorPercent: 8.1 },
    { id: 3, mass_g: 100, Fexp: 0.981, volumenL: 5, time_s: 21.6, Q_m3s: 0.000231, Fteo: 1.062, efficiency: 54.1, errorPercent: 7.6 },
  ],
  vane_102: [
    { id: 1, mass_g: 20, Fexp: 0.1962, volumenL: 5, time_s: 52.6, Q_m3s: 0.000095, Fteo: 0.215, efficiency: 65.8, errorPercent: 8.7 },
    { id: 2, mass_g: 50, Fexp: 0.4905, volumenL: 5, time_s: 33.3, Q_m3s: 0.000150, Fteo: 0.537, efficiency: 65.4, errorPercent: 8.6 },
    { id: 3, mass_g: 100, Fexp: 0.981, volumenL: 5, time_s: 23.6, Q_m3s: 0.000212, Fteo: 1.073, efficiency: 65.0, errorPercent: 8.5 },
  ],
  vane_180: [
    { id: 1, mass_g: 20, Fexp: 0.1962, volumenL: 5, time_s: 67.8, Q_m3s: 0.000074, Fteo: 0.217, efficiency: 99.1, errorPercent: 9.6 },
    { id: 2, mass_g: 50, Fexp: 0.4905, volumenL: 5, time_s: 43.0, Q_m3s: 0.000116, Fteo: 0.535, efficiency: 98.7, errorPercent: 8.3 },
    { id: 3, mass_g: 100, Fexp: 0.981, volumenL: 5, time_s: 30.5, Q_m3s: 0.000164, Fteo: 1.068, efficiency: 98.4, errorPercent: 8.1 },
  ],
}

export default function JetImpactSim() {
  const [vaneKey, setVaneKey] = useState('vane_90')
  const [activeTableKey, setActiveTableKey] = useState('vane_90')
  const [weights, setWeights] = useState({ 5: 0, 10: 0, 20: 0, 50: 1, 100: 0 }) // 50g inicial
  const [Q_Lmin, setQLmin] = useState(10.0)
  const [volumenL, setVolumenL] = useState(5.0)
  const [tableData, setTableData] = useState(INITIAL_ROWS)
  const [copied, setCopied] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)

  const [activeTab, setActiveTab] = useState('tables') // 'tables' | 'charts' | 'derivation'
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [hudCollapsed, setHudCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lista plana de contrapesos para la animación física 3D
  const weightItems = useMemo(() => {
    const items = []
    AVAILABLE_WEIGHTS.forEach((w) => {
      const count = weights[w] || 0
      for (let i = 0; i < count; i++) {
        items.push({ val: w })
      }
    })
    return items
  }, [weights])

  // Masa total en gramos
  const totalMass_g = useMemo(() => {
    return AVAILABLE_WEIGHTS.reduce((acc, w) => acc + w * (weights[w] || 0), 0)
  }, [weights])

  // Solución hidrodinámica y de equilibrio
  const results = useMemo(() => {
    return solveJetImpactLab({
      Q_Lmin,
      vaneKey,
      totalMass_g,
      volumenL,
    })
  }, [Q_Lmin, vaneKey, totalMass_g, volumenL])

  const sections = useMemo(() => getDerivation(results), [results])

  // Manejo de contrapesos
  const addWeight = (w) => setWeights((prev) => ({ ...prev, [w]: (prev[w] || 0) + 1 }))
  const removeWeight = (w) => setWeights((prev) => ({ ...prev, [w]: Math.max(0, (prev[w] || 0) - 1) }))
  const clearWeights = () => setWeights({ 5: 0, 10: 0, 20: 0, 50: 0, 100: 0 })
  const setPresetWeight = (grams) => {
    let rem = grams
    const next = { 5: 0, 10: 0, 20: 0, 50: 0, 100: 0 }
    const denoms = [100, 50, 20, 10, 5]
    denoms.forEach((d) => {
      while (rem >= d) {
        next[d]++
        rem -= d
      }
    })
    setWeights(next)
  }

  // Auto-nivelar caudal para 100% de equilibrio
  const handleAutoLevel = useCallback(() => {
    if (results.Q_equilibrium_Lmin > 0) {
      setQLmin(parseFloat(results.Q_equilibrium_Lmin.toFixed(2)))
    }
  }, [results.Q_equilibrium_Lmin])

  // Registrar medición en la tabla del álabe actual
  const handleSaveToTable = useCallback(() => {
    const targetTable = vaneKey
    const newRow = {
      id: Date.now(),
      mass_g: totalMass_g,
      Fexp: parseFloat(results.Fexp.toFixed(4)),
      volumenL: parseFloat(volumenL.toFixed(1)),
      time_s: parseFloat(results.time_s.toFixed(2)),
      Q_m3s: parseFloat(results.Q_m3s.toFixed(6)),
      Fteo: parseFloat(results.Fteo.toFixed(4)),
      efficiency: parseFloat(results.efficiency.toFixed(2)),
      errorPercent: results.errorPercent != null ? parseFloat(results.errorPercent.toFixed(2)) : 0,
    }

    setTableData((prev) => ({
      ...prev,
      [targetTable]: [...(prev[targetTable] || []), newRow],
    }))

    setActiveTableKey(targetTable)
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2000)
  }, [vaneKey, totalMass_g, results, volumenL])


  const handleDeleteRow = (vKey, rowId) => {
    setTableData((prev) => ({
      ...prev,
      [vKey]: prev[vKey].filter((r) => r.id !== rowId),
    }))
  }

  const handleClearTable = (vKey) => {
    setTableData((prev) => ({ ...prev, [vKey]: [] }))
  }

  const handleCopyTable = (vKey) => {
    const rows = tableData[vKey] || []
    const header = 'Masa [g]\tFexp [N]\t∀ [L]\tt [s]\tQ [m3/s]\tFTEO [N]\tη [%]\tError [%]'
    const body = rows
      .map(
        (r) =>
          `${r.mass_g}\t${r.Fexp.toFixed(4)}\t${r.volumenL}\t${r.time_s.toFixed(2)}\t${r.Q_m3s.toFixed(6)}\t${r.Fteo.toFixed(4)}\t${r.efficiency.toFixed(2)}\t${r.errorPercent?.toFixed(2) ?? '—'}`
      )
      .join('\n')
    navigator.clipboard.writeText(`${header}\n${body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const currentConfig = VANE_CONFIGS[vaneKey]

  return (
    <div style={S.app}>
      <style>{`
        .jet-custom-scroll,
        .jet-custom-scroll * {
          scrollbar-width: thin;
          scrollbar-color: #2a3152 rgba(13, 16, 32, 0.7);
        }
        .jet-custom-scroll::-webkit-scrollbar,
        .jet-custom-scroll *::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .jet-custom-scroll::-webkit-scrollbar-track,
        .jet-custom-scroll *::-webkit-scrollbar-track {
          background: rgba(13, 16, 32, 0.7);
          border-radius: 4px;
        }
        .jet-custom-scroll::-webkit-scrollbar-thumb,
        .jet-custom-scroll *::-webkit-scrollbar-thumb {
          background: #2a3152;
          border-radius: 4px;
        }
        .jet-custom-scroll::-webkit-scrollbar-thumb:hover,
        .jet-custom-scroll *::-webkit-scrollbar-thumb:hover {
          background: #4589ff;
        }
      `}</style>
      {/* Viewport Principal 3D */}
      <div style={S.viewport}>
        {!sidebarOpen && (
          <button
            style={S.sidebarOpenBtn}
            onClick={() => setSidebarOpen(true)}
            title="Abrir panel lateral y tablas"
          >
            <span>«</span>
            <span>Tablas / Informe</span>
          </button>
        )}

        {/* HUD Izquierdo: Controles del Laboratorio y Telemetría */}
        <div style={S.hudWrap}>
          <div style={S.hud(hudCollapsed)} className="jet-custom-scroll">
            <div style={S.hudHeader} onClick={() => setHudCollapsed((c) => !c)}>
              <div style={S.hudTitle}>
                <span>🚿</span>
                <span>EXP. 6: Impacto de Chorro</span>
              </div>
              <button
                style={S.collapseBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  setHudCollapsed((c) => !c)
                }}
              >
                {hudCollapsed ? '+ Expandir' : '— Minimizar'}
              </button>
            </div>

            {!hudCollapsed && (
              <>
                <div style={S.sep} />

                {/* Selector de Álabe de Impacto */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    OBJETO DE IMPACTO (ÁLABE)
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Object.keys(VANE_CONFIGS).map((key) => {
                      const cfg = VANE_CONFIGS[key]
                      const active = vaneKey === key
                      return (
                        <button
                          key={key}
                          onClick={() => setVaneKey(key)}
                          style={{
                            flex: 1,
                            padding: '6px 4px',
                            fontSize: 10.5,
                            fontWeight: 700,
                            borderRadius: 6,
                            border: active ? '1px solid #4589ff' : '1px solid #2a3152',
                            background: active ? '#1a237e' : 'rgba(13,16,32,0.8)',
                            color: active ? '#82cfff' : '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          {cfg.shortName}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Parámetros de tobera bloqueados */}
                <div
                  style={{
                    background: 'rgba(26,35,126,0.2)',
                    border: '1px solid #283593',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <div>
                    🔒 <strong>Tobera:</strong> 8.0 mm (Área fija)
                  </div>
                  <div style={{ color: '#82cfff' }}>s = 20 mm</div>
                </div>
                {/* Banco de Contrapesos Calibrados */}
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>
                      CONTRAPESOS CALIBRADOS
                    </span>
                    <span style={S.val}>
                      Total: <strong style={{ color: '#ffd54f' }}>{totalMass_g} g</strong> (
                      {results.Fexp.toFixed(4)} N)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 6 }}>
                    {AVAILABLE_WEIGHTS.map((w) => {
                      const cnt = weights[w] || 0
                      return (
                        <div
                          key={w}
                          style={{
                            background: '#12172e',
                            border: '1px solid #232a48',
                            borderRadius: 6,
                            padding: '4px 2px',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: 10, color: '#ffd54f', fontWeight: 700 }}>{w}g</div>
                          <div style={{ fontSize: 11, color: '#fff', fontWeight: 800 }}>{cnt}</div>
                          <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 3 }}>
                            <button
                              onClick={() => removeWeight(w)}
                              disabled={cnt === 0}
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 3,
                                border: 'none',
                                background: cnt > 0 ? '#b71c1c' : '#263238',
                                color: '#fff',
                                fontSize: 10,
                                cursor: cnt > 0 ? 'pointer' : 'default',
                                padding: 0,
                              }}
                            >
                              -
                            </button>
                            <button
                              onClick={() => addWeight(w)}
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 3,
                                border: 'none',
                                background: '#1b5e20',
                                color: '#fff',
                                fontSize: 10,
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {[20, 50, 100, 150, 200, 300].map((val) => (
                      <button
                        key={val}
                        onClick={() => setPresetWeight(val)}
                        style={{
                          flex: 1,
                          padding: '3px 4px',
                          fontSize: 10,
                          borderRadius: 4,
                          border: '1px solid #2a3152',
                          background: '#0d1020',
                          color: '#c8cfe8',
                          cursor: 'pointer',
                        }}
                      >
                        {val}g
                      </button>
                    ))}
                    <button
                      onClick={clearWeights}
                      style={{
                        padding: '3px 6px',
                        fontSize: 10,
                        borderRadius: 4,
                        border: '1px solid #b71c1c',
                        background: 'rgba(183,28,28,0.2)',
                        color: '#ff8a80',
                        cursor: 'pointer',
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                <div style={S.sep} />

                {/* Control de Caudal de Impacto Q */}
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: '#94a3b8', fontSize: 10.5, fontWeight: 700 }}>
                      CAUDAL DEL BANCO (Q)
                    </span>
                    <span style={S.hot}>{Q_Lmin.toFixed(2)} L/min</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="0.01"
                    value={Q_Lmin}
                    onChange={(e) => setQLmin(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#4589ff', cursor: 'pointer' }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 10,
                      color: '#64748b',
                      marginTop: 2,
                    }}
                  >
                    <span>0 L/min</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {(results.Q_m3s * 1e4).toFixed(3)} × 10⁻⁴ m³/s
                    </span>
                    <span>32 L/min</span>
                  </div>

                  {/* Micro-ajuste de caudal de alta resolución */}
                  <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                    {[
                      { label: '-0.1', delta: -0.1 },
                      { label: '-0.01', delta: -0.01 },
                      { label: '+0.01', delta: +0.01 },
                      { label: '+0.1', delta: +0.1 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() =>
                          setQLmin((q) =>
                            Math.max(0, Math.min(32, parseFloat((q + btn.delta).toFixed(2))))
                          )
                        }
                        title={`Ajuste fino ${btn.label} L/min`}
                        style={{
                          flex: 1,
                          padding: '2px 3px',
                          fontSize: 9.5,
                          fontWeight: 700,
                          borderRadius: 4,
                          border: '1px solid #2a3152',
                          background: '#0d1020',
                          color: '#82cfff',
                          cursor: 'pointer',
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleAutoLevel}
                    style={{
                      width: '100%',
                      marginTop: 5,
                      padding: '5px 8px',
                      borderRadius: 6,
                      border: '1px solid #4589ff',
                      background: 'rgba(69, 137, 255, 0.15)',
                      color: '#82cfff',
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <span>⚡</span>
                    <span>Auto-Nivelar ({results.Q_equilibrium_Lmin.toFixed(2)} L/min)</span>
                  </button>
                </div>

                <div style={S.sep} />

                {/* ── Indicador de Nivelación Horizontal con Altura Fija anti-jitter ── */}
                <div
                  style={{
                    background: results.isBalanced
                      ? 'rgba(0, 230, 118, 0.12)'
                      : 'rgba(255, 59, 48, 0.12)',
                    border: `1.5px solid ${results.isBalanced ? '#00e676' : '#ff3b30'}`,
                    borderRadius: 8,
                    padding: '6px 9px',
                    minHeight: 58,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: 800,
                      fontSize: 11,
                      color: results.isBalanced ? '#00e676' : '#ff3b30',
                    }}
                  >
                    <span>
                      {results.isBalanced ? '✔ ¡FUERZA NIVELADA!' : '❌ FUERZA DESEQUILIBRADA'}
                    </span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {results.balancePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: results.isBalanced ? '#a7f3d0' : '#fca5a5',
                      marginTop: 2,
                      lineHeight: 1.25,
                    }}
                  >
                    {results.isBalanced
                      ? 'Fuerzas al 99% - 100%. Ranura alineada con el índice.'
                      : results.balanceStatus === 'under'
                      ? 'Caudal bajo: chorro empuja menos que contrapeso.'
                      : 'Caudal alto: chorro supera contrapeso (álabe arriba).'}
                  </div>
                </div>

                {/* Telemetría Dinámica */}
                <div style={{ fontSize: 11.5, lineHeight: 1.6 }}>
                  <div>Velocidad salida tobera V₀: <span style={S.val}>{results.V0.toFixed(3)} m/s</span></div>
                  <div>Fuerza Teórica FTEO: <span style={S.hot}>{results.Fteo.toFixed(4)} N</span></div>
                  <div>Fuerza Exp Fexp: <span style={S.val}>{results.Fexp.toFixed(4)} N</span></div>
                  <div>Eficiencia η: <span style={S.green}>{results.efficiency.toFixed(2)}%</span></div>
                </div>

                <div style={S.sep} />

                {/* Botón para Guardar Datos en Tabla */}
                <button
                  onClick={handleSaveToTable}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: results.isBalanced
                      ? 'linear-gradient(135deg, #00e676, #00b0ff)'
                      : 'linear-gradient(135deg, #304ffe, #7c4dff)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: results.isBalanced ? '0 0 16px rgba(0,230,118,0.45)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <span>📥</span>
                  <span>Guardar Medición en {currentConfig.shortName}</span>
                </button>
                {savedNotice && (
                  <div style={{ color: '#00e676', fontSize: 11, textAlign: 'center', marginTop: 4, fontWeight: 700 }}>
                    ✓ ¡Punto registrado en la tabla!
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Escena 3D WebGL con Three.js */}
        <JetImpactScene
          results={results}
          weightItems={weightItems}
          particleCount={450}
        />
      </div>

      {/* Barra Lateral Derecha con Pestañas */}
      <div style={S.sidebar(sidebarOpen, isMobile)} className="jet-custom-scroll">
        <div style={S.tabHeader}>
          <button
            style={S.tabBtn(activeTab === 'tables')}
            onClick={() => setActiveTab('tables')}
          >
            📊 Tablas 6.1 - 6.3
          </button>
          <button
            style={S.tabBtn(activeTab === 'charts')}
            onClick={() => setActiveTab('charts')}
          >
            📈 Gráficas
          </button>
          <button
            style={S.tabBtn(activeTab === 'derivation')}
            onClick={() => setActiveTab('derivation')}
          >
            📖 Memoria Teórica
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            style={S.sidebarCloseBtn}
            title="Ocultar panel lateral"
          >
            <span>››</span>
            <span>Ocultar</span>
          </button>
        </div>

        <div style={S.sidebarInner} className="jet-custom-scroll">
          {activeTab === 'tables' && (
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {Object.keys(VANE_CONFIGS).map((key) => {
                  const cfg = VANE_CONFIGS[key]
                  const active = activeTableKey === key
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTableKey(key)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        border: active ? '1px solid #4589ff' : '1px solid #2a3152',
                        background: active ? '#1a237e' : '#0d1020',
                        color: active ? '#82cfff' : '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      {cfg.shortName}
                    </button>
                  )
                })}
              </div>

              <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
                {VANE_CONFIGS[activeTableKey].tableTitle}
              </div>
              <div style={{ color: '#82cfff', fontSize: 11.5, marginBottom: 12, lineHeight: 1.4 }}>
                Fórmula teórica: <code>{VANE_CONFIGS[activeTableKey].formulaTex}</code> ·{' '}
                <code>η = [Fexp / (2·ρ·Q²/A)] × 100%</code>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #2a3152', borderRadius: 8, background: '#0d1020' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                  <thead>
                    <tr style={{ background: '#0b0d1a', borderBottom: '1px solid #2a3152', color: '#9aa2c0' }}>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>Masa [g]</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>Fexp [N]</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>∀ [L]</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>t [s]</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>Q [m³/s]</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>FTEO [N]</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>η [%]</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>Error [%]</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(tableData[activeTableKey] || []).map((row, idx) => (
                      <tr
                        key={row.id || idx}
                        style={{
                          borderBottom: '1px solid #181d30',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                          textAlign: 'center',
                          color: '#c8cfe8',
                        }}
                      >
                        <td style={{ padding: '5px 4px' }}>{row.mass_g}</td>
                        <td style={{ padding: '5px 4px', color: '#82cfff' }}>{row.Fexp.toFixed(4)}</td>
                        <td style={{ padding: '5px 4px' }}>{row.volumenL}</td>
                        <td style={{ padding: '5px 4px' }}>{row.time_s.toFixed(2)}</td>
                        <td style={{ padding: '5px 4px' }}>{(row.Q_m3s * 1e4).toFixed(3)}e-4</td>
                        <td style={{ padding: '5px 4px', color: '#ff8f5a' }}>{row.Fteo.toFixed(4)}</td>
                        <td style={{ padding: '5px 4px', color: '#00e676', fontWeight: 700 }}>
                          {row.efficiency.toFixed(1)}%
                        </td>
                        <td style={{ padding: '5px 4px', color: row.errorPercent > 10 ? '#ff8a80' : '#82cfff' }}>
                          {row.errorPercent != null ? `${row.errorPercent.toFixed(1)}%` : '—'}
                        </td>
                        <td style={{ padding: '5px 4px' }}>
                          <button
                            onClick={() => handleDeleteRow(activeTableKey, row.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#ff5252',
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                            title="Eliminar fila"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(tableData[activeTableKey] || []).length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ padding: '18px 8px', color: '#64748b', textAlign: 'center' }}>
                          No hay datos registrados aún. Use el botón "Guardar Medición" en el panel de control.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Acciones de la tabla */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => handleCopyTable(activeTableKey)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #4589ff, #be95ff)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    padding: '7px 12px',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {copied ? '✓ ¡Copiado!' : '📋 Copiar tabla al portapapeles (CSV)'}
                </button>
                <button
                  onClick={() => handleClearTable(activeTableKey)}
                  style={{
                    background: 'rgba(183, 28, 28, 0.2)',
                    border: '1px solid #b71c1c',
                    borderRadius: 6,
                    color: '#ff8a80',
                    padding: '7px 12px',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  🗑️ Limpiar
                </button>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                * <strong>Fexp = m·g</strong>: Fuerza ejercida por los contrapesos.<br />
                * <strong>FTEO</strong>: Expresión analítica oficial de la guía.<br />
                * <strong>η</strong>: Eficiencia respecto a la máxima fuerza teórica (álabe de 180°).
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <JetImpactCharts tableData={tableData} />
          )}

          {activeTab === 'derivation' && (
            <DerivationPanel sections={sections} />
          )}
        </div>
      </div>
    </div>
  )
}


