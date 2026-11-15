import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useControls, folder } from 'leva'
import BernoulliScene from './BernoulliScene.jsx'
import PitotTooltip from './PitotTooltip.jsx'
import DerivationPanel from '../DerivationPanel.jsx'
import DataTable from '../DataTable.jsx'
import ColorLegend from '../ColorLegend.jsx'
import { getDerivation } from './derivation.js'
import {
  venturiGeometryFromAreas,
  solveBernoulli,
  solvePitotAtPosition,
  computeVenturiTheoreticalFlow,
  FLUIDS,
  DEFAULT_FLUID_KEY,
  DEFAULT_AREAS_MM2,
} from './solver.js'

const SIDEBAR_WIDTH = 'clamp(640px, 44vw, 780px)'

const S = {
  app: { display: 'flex', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' },
  viewport: { flex: 1, position: 'relative', height: '100%', minWidth: 0 },
  
  sidebar: (isOpen, isMobile) => ({
    width: isOpen ? (isMobile ? '100vw' : SIDEBAR_WIDTH) : '0px',
    maxWidth: isMobile ? '100vw' : '820px',
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
  sidebarInner: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  
  tabHeader: {
    display: 'flex',
    borderBottom: '1px solid #1e2338',
    background: '#0d1020',
    padding: '4px 6px',
    gap: 6,
  },
  tabBtn: (active) => ({
    flex: 1,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: active ? '#1a237e' : 'transparent',
    color: active ? '#82cfff' : '#9aa2c0',
    transition: 'all 0.18s ease',
  }),

  sidebarToggleBtn: (isOpen, isMobile) => ({
    position: 'absolute',
    top: 14,
    right: isOpen && !isMobile ? `calc(${SIDEBAR_WIDTH} + 14px)` : 14,
    zIndex: 130,
    background: 'rgba(13, 16, 32, 0.92)',
    border: '1px solid #2a3152',
    color: '#82cfff',
    borderRadius: 7,
    padding: '5px 9px',
    fontSize: 11.5,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    transition: 'right 0.28s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s',
  }),

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
    background: 'rgba(11, 13, 26, 0.94)',
    border: '1px solid #2a3152',
    borderRadius: 10,
    padding: isCollapsed ? '8px 14px' : '14px 18px',
    fontSize: 12,
    lineHeight: 1.65,
    minWidth: isCollapsed ? 'auto' : 280,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100% - 28px)',
    overflowY: 'auto',
    backdropFilter: 'blur(10px)',
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
  hudTitle: { fontWeight: 800, fontSize: 13.5, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 },
  toggleIcon: {
    fontSize: 11,
    padding: '2px 6px',
    borderRadius: 4,
    background: '#1a237e',
    color: '#82cfff',
    fontWeight: 700,
  },
  sep: { height: 1, background: '#232a45', margin: '8px 0' },
  val: { color: '#82cfff', fontVariantNumeric: 'tabular-nums', fontWeight: 600 },
  hot: { color: '#ff8f5a', fontVariantNumeric: 'tabular-nums', fontWeight: 600 },
  green: { color: '#00e676', fontVariantNumeric: 'tabular-nums', fontWeight: 700 },
  tableWrap: { padding: '12px 14px', flex: 1, overflowY: 'auto' },
}

const COLUMNS = [
  { key: 'name', label: 'Sección' },
  { key: 'A_mm2', label: 'Área', unit: 'mm²', decimals: 2 },
  { key: 'D_mm', label: '∅', unit: 'mm', decimals: 2 },
  { key: 'P_kPa', label: 'P est', unit: 'kPa', decimals: 2 },
  { key: 'pressureHead_mm', label: 'h calc', unit: 'mm', decimals: 1 },
  { key: 'h_meas_mm', label: 'h med', unit: 'mm', editable: true, decimals: 1 },
  { key: 'error_h', label: 'Error h', unit: '%', decimals: 2 },
  { key: 'V', label: 'V', unit: 'm/s', decimals: 4 },
  { key: 'velocityHead_mm', label: 'V²/2g', unit: 'mm', decimals: 1 },
  { key: 'totalHead_mm', label: 'hTotal*', unit: 'mm', decimals: 1 },
  { key: 'stagnationHead_mm', label: 'hPitot calc', unit: 'mm', decimals: 1 },
  { key: 'pitot_meas_mm', label: 'hTotal** (Pitot)', unit: 'mm', editable: true, decimals: 1 },
  { key: 'error_pitot', label: 'Error Pitot', unit: '%', decimals: 2 },
]

export default function BernoulliSim() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900)
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1100)
  const [hudOpen, setHudOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('table')

  useEffect(() => {
    const handleResize = () => {
      const mob = window.innerWidth < 900
      setIsMobile(mob)
      if (mob) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [controls, setControls] = useControls(() => ({
    'Operación Hidráulica': folder({
      fluid: { options: Object.keys(FLUIDS), value: DEFAULT_FLUID_KEY, label: 'Fluido (Tabla ρ, T)' },
      Q_Lmin: { value: 10.0, min: 0.1, max: 30, step: 0.1, label: 'Caudal Q (L/min)' },
      h0_mm: { value: 240, min: 50, max: 500, step: 5, label: 'Carga entrada h₀ (mm)' },
      pitotSection: { options: ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'], value: 'S3', label: 'Sonda Pitot en' },
      useLosses: { value: true, label: 'Pérdidas Reales (difusor)' },
      alpha: { value: 1.0, min: 1.0, max: 2.0, step: 0.05, label: 'Factor Coriolis α' },
      Ltotal: { value: 0.45, min: 0.2, max: 1.5, step: 0.05, label: 'Longitud L (m)' },
    }),
    'Áreas Secciones Transversales A [mm²]': folder({
      A0: { value: DEFAULT_AREAS_MM2[0], min: 50, max: 800, step: 0.1, label: 'A₀ Entrada (mm²)' },
      A1: { value: DEFAULT_AREAS_MM2[1], min: 20, max: 500, step: 0.1, label: 'A₁ Garganta (mm²)' },
      A2: { value: DEFAULT_AREAS_MM2[2], min: 20, max: 500, step: 0.1, label: 'A₂ Difusor 1 (mm²)' },
      A3: { value: DEFAULT_AREAS_MM2[3], min: 20, max: 500, step: 0.1, label: 'A₃ Difusor 2 (mm²)' },
      A4: { value: DEFAULT_AREAS_MM2[4], min: 20, max: 500, step: 0.1, label: 'A₄ Difusor 3 (mm²)' },
      A5: { value: DEFAULT_AREAS_MM2[5], min: 20, max: 500, step: 0.1, label: 'A₅ Difusor 4 (mm²)' },
      A6: { value: DEFAULT_AREAS_MM2[6], min: 50, max: 800, step: 0.1, label: 'A₆ Salida (mm²)' },
    }),
    'Visualización 3D': folder({
      colorMode: { options: ['Velocidad', 'Presión', 'Carga Dinámica'], value: 'Velocidad', label: 'Mapa de color' },
      showIso: { value: true, label: 'Isolíneas de flujo' },
      isoLevels: { value: 6, min: 3, max: 18, step: 1, label: 'Niveles isolíneas' },
      particleCount: { value: 600, min: 100, max: 1500, step: 50, label: 'Partículas 3D' },
    }),
  }))

  const {
    fluid, Q_Lmin, h0_mm, pitotSection, useLosses, alpha, Ltotal,
    A0, A1, A2, A3, A4, A5, A6,
    colorMode, showIso, isoLevels, particleCount,
  } = controls

  const [pitotCustomXNorm, setPitotCustomXNorm] = useState(null)
  const [cutawayMode, setCutawayMode] = useState(true)
  const [showStreamlines, setShowStreamlines] = useState(true)
  const [tooltipHoverData, setTooltipHoverData] = useState(null)
  const [tooltipPinned, setTooltipPinned] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 350, y: 150 })

  useEffect(() => {
    setPitotCustomXNorm(null)
  }, [pitotSection])

  const parsedPitot = parseInt(pitotSection.replace('S', ''), 10)
  const pitotTapIdx = Number.isNaN(parsedPitot) ? 3 : parsedPitot
  const areas_mm2 = useMemo(() => [A0, A1, A2, A3, A4, A5, A6], [A0, A1, A2, A3, A4, A5, A6])
  const activeFluidObj = FLUIDS[fluid] || FLUIDS[DEFAULT_FLUID_KEY] || {
    rho: 998.21,
    mu: 1.002e-3,
    tempC: 20,
    family: 'Agua Pura (IAPWS-IF97)',
    color: '#0288d1',
    meniscusColor: '#4fc3f7',
  }
  const { rho, mu, tempC = 20, family: fluidFamily = 'Agua Pura', color: fluidColor = '#0288d1', meniscusColor = '#4fc3f7' } = activeFluidObj
  const Q_m3s = (Q_Lmin / 60) * 1e-3

  const taps = useMemo(
    () => venturiGeometryFromAreas({ areas_mm2, Ltotal }),
    [areas_mm2, Ltotal],
  )

  const tapResults = useMemo(
    () => solveBernoulli({
      Q: Q_m3s,
      taps,
      rho,
      mu,
      alpha,
      h0_m: (h0_mm || 240) / 1000,
      pitotIndex: pitotTapIdx,
      useRealLosses: useLosses,
    }),
    [Q_m3s, taps, rho, mu, alpha, h0_mm, pitotTapIdx, useLosses],
  )

  const activeXNorm = useMemo(() => {
    if (pitotCustomXNorm != null) return pitotCustomXNorm
    return tapResults[pitotTapIdx]?.xNorm ?? 0.56
  }, [pitotCustomXNorm, tapResults, pitotTapIdx])

  const tapPitot = useMemo(
    () =>
      solvePitotAtPosition({
        xNorm: activeXNorm,
        tapResults,
        Q: Q_m3s,
        rho,
        mu,
        alpha,
        Ltotal,
      }) || tapResults[pitotTapIdx] || tapResults[3] || {},
    [activeXNorm, tapResults, Q_m3s, rho, mu, alpha, Ltotal, pitotTapIdx],
  )

  const effectivePitotIdx = tapPitot.index ?? pitotTapIdx

  const tapResultsForScene = useMemo(
    () =>
      tapResults.map((t, i) => ({
        ...t,
        isPitotLocation: i === effectivePitotIdx,
      })),
    [tapResults, effectivePitotIdx],
  )

  const handleSelectPosition = useCallback((xNorm) => {
    setPitotCustomXNorm(Math.max(0.0, Math.min(1.0, xNorm)))
  }, [])

  const handlePitotHover = useCallback((data, pos) => {
    setTooltipHoverData(data)
    if (!tooltipPinned && pos) {
      setTooltipPos(pos)
    }
  }, [tooltipPinned])

  const handlePitotLeave = useCallback(() => {
    if (!tooltipPinned) {
      setTooltipHoverData(null)
    }
  }, [tooltipPinned])

  const handlePitotClick = useCallback((data, pos) => {
    if (pos) setTooltipPos(pos)
    setTooltipHoverData(data)
    setTooltipPinned(prev => !prev)
  }, [])

  const venturiData = useMemo(() => {
    const t0 = tapResults[0]
    const tp = tapPitot || tapResults[pitotTapIdx] || tapResults[3]
    return computeVenturiTheoreticalFlow(t0, tp, Q_m3s)
  }, [tapResults, tapPitot, pitotTapIdx, Q_m3s])

  const sections = useMemo(() => {
    return getDerivation({
      taps: tapResults,
      Q: Q_m3s,
      rho,
      mu,
      fluidName: fluid,
      tempC,
      alpha,
      pitotTapIndex: effectivePitotIdx,
      venturiData,
    })
  }, [tapResults, Q_m3s, rho, mu, fluid, tempC, alpha, effectivePitotIdx, venturiData])

  const [measRows, setMeasRows] = useState(() =>
    Array.from({ length: 7 }, (_, i) => ({
      index: i,
      h_meas_mm: null,
      pitot_meas_mm: null,
    })),
  )

  const handleTableChange = useCallback((rowId, key, value) => {
    setMeasRows(prev => prev.map((r, i) => (i === rowId ? { ...r, [key]: value } : r)))
  }, [])

  const tableRows = useMemo(() => {
    return tapResults.map((t, i) => {
      const m = measRows[i] || {}
      const h_med = typeof m.h_meas_mm === 'number' && !isNaN(m.h_meas_mm) ? m.h_meas_mm : null
      const error_h = h_med != null && Math.abs(t.pressureHead_mm) > 1e-6
        ? (Math.abs(t.pressureHead_mm - h_med) / Math.abs(t.pressureHead_mm)) * 100
        : null

      const pitot_med = typeof m.pitot_meas_mm === 'number' && !isNaN(m.pitot_meas_mm) ? m.pitot_meas_mm : null
      const refPitotHead = t.stagnationHead_mm > 0 ? t.stagnationHead_mm : t.totalHead_mm
      const error_pitot = pitot_med != null && refPitotHead > 0
        ? (Math.abs(refPitotHead - pitot_med) / refPitotHead) * 100
        : null

      return {
        id: i,
        name: i === effectivePitotIdx ? `${t.name} 🎯` : t.name,
        A_mm2: t.A_mm2,
        D_mm: t.D_mm,
        P_kPa: (t.P || 0) / 1000,
        pressureHead_mm: t.pressureHead_mm,
        h_meas_mm: h_med,
        error_h,
        V: t.V,
        velocityHead_mm: t.velocityHead_mm,
        totalHead_mm: t.totalHead_mm,
        stagnationHead_mm: t.stagnationHead_mm,
        pitot_meas_mm: pitot_med,
        error_pitot,
      }
    })
  }, [tapResults, measRows, effectivePitotIdx])

  const tap0 = tapResults[0] || {}
  const tap1 = tapResults[1] || {}
  const legendBounds = useMemo(() => {
    if (!tapResults || tapResults.length === 0) {
      return { min: 0, max: 1.7, unit: 'm/s' }
    }
    if (colorMode === 'Presión') {
      const phs = tapResults.map(t => t.pressureHead_mm)
      return {
        min: Math.min(...phs),
        max: Math.max(...phs),
        unit: 'mm',
      }
    }
    if (colorMode === 'Carga Dinámica') {
      const vhs = tapResults.map(t => t.velocityHead_mm)
      return {
        min: Math.min(...vhs),
        max: Math.max(...vhs),
        unit: 'mm',
      }
    }
    return {
      min: 0,
      max: Math.max(...tapResults.map(t => t.V), 0.1),
      unit: 'm/s',
    }
  }, [tapResults, colorMode])

  return (
    <div style={S.app}>
      {/* Botón flotante compacto para abrir/cerrar barra lateral */}
      <button
        style={S.sidebarToggleBtn(sidebarOpen, isMobile)}
        onClick={() => setSidebarOpen(prev => !prev)}
        title={sidebarOpen ? 'Ocultar panel lateral (Pantalla completa)' : 'Mostrar panel lateral de resultados'}
      >
        <span>{sidebarOpen ? '››' : '« Panel'}</span>
      </button>

      {/* Visor 3D Three.js */}
      <div style={S.viewport}>
        {/* HUD de telemetría colapsable */}
        <div style={S.hudWrap}>
          <div style={S.hud(!hudOpen)}>
            <div style={S.hudHeader} onClick={() => setHudOpen(prev => !prev)}>
              <div style={S.hudTitle}>
                <span>💧</span>
                <span>{hudOpen ? 'Telemetría — Medidor Venturi' : 'Telemetría'}</span>
              </div>
              <span style={S.toggleIcon}>{hudOpen ? '— Minimizar' : '+ Expandir'}</span>
            </div>

            {hudOpen && (
              <>
                <div style={S.sep} />
                <div style={{ background: 'rgba(2, 136, 209, 0.12)', border: `1px solid ${meniscusColor}44`, borderLeft: `3px solid ${meniscusColor}`, borderRadius: 6, padding: '5px 8px', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: meniscusColor }}>
                    {fluidFamily} · T = {tempC} °C
                  </div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>
                    ρ(T) = <span style={S.val}>{rho.toFixed(2)} kg/m³</span> · μ(T) = <span style={S.val}>{(mu * 1000).toFixed(3)} mPa·s</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
                    γ = {((rho * 9.81) / 1000).toFixed(3)} kN/m³ · Re₁ = <span style={S.green}>{Math.round(tap1.Re || 0).toLocaleString()}</span> ({(tap1.Re || 0) < 2300 ? 'Laminar' : (tap1.Re || 0) < 4000 ? 'Transición' : 'Turbulento'})
                  </div>
                </div>
                <div>Caudal Q = <span style={S.val}>{(Q_m3s * 1000).toFixed(4)} L/s</span> ({Q_Lmin.toFixed(2)} L/min)</div>
                <div>Velocidad Entrada V₀ = <span style={S.val}>{(tap0.V || 0).toFixed(3)} m/s</span></div>
                <div>Velocidad Garganta V₁ = <span style={S.hot}>{(tap1.V || 0).toFixed(3)} m/s</span></div>
                <div>Relación V₁ / V₀ = <span style={S.hot}>{((tap1.V || 0) / Math.max(tap0.V || 1e-6, 1e-6)).toFixed(2)}×</span></div>
                
                <div style={S.sep} />
                <div>Carga Total H₀* = <span style={S.val}>{(tap0.totalHead_mm || 0).toFixed(1)} mm</span> ({(tap0.totalHead || 0).toFixed(4)} m)</div>
                <div>Presión Entrada P₀ = <span style={S.val}>{((tap0.P || 0) / 1000).toFixed(2)} kPa</span> (h₀ = {(tap0.pressureHead_mm || 0).toFixed(1)} mm)</div>
                <div>Presión Garganta P₁ = <span style={S.hot}>{((tap1.P || 0) / 1000).toFixed(2)} kPa</span> (h₁ = {(tap1.pressureHead_mm || 0).toFixed(1)} mm)</div>
                {(() => {
                  const tapLast = tapResults[tapResults.length - 1] || {}
                  const netLoss = (tap0.totalHead_mm || 0) - (tapLast.totalHead_mm || 0)
                  const lossPercent = (tap0.totalHead_mm || 0) > 0 ? (netLoss / tap0.totalHead_mm) * 100 : 0
                  return (
                    <div>
                      Pérdida neta difusor ΔhL ={' '}
                      <span style={S.hot}>
                        {useLosses ? `${netLoss.toFixed(1)} mm (${lossPercent.toFixed(1)}%)` : '0.0 mm (Ideal)'}
                      </span>
                    </div>
                  )
                })()}

                <div style={S.sep} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={S.hudTitle}>
                    <span>💡</span>
                    <span>Sonda Pitot ({tapPitot.name || pitotSection})</span>
                  </div>
                  <button
                    onClick={() => {
                      setTooltipHoverData(tapPitot)
                      setTooltipPinned(prev => !prev)
                    }}
                    style={{
                      background: tooltipPinned ? '#ff9100' : 'rgba(255,145,0,0.16)',
                      color: tooltipPinned ? '#0b0d1a' : '#ffb74d',
                      border: '1px solid #ff9100',
                      borderRadius: 5,
                      padding: '2px 7px',
                      fontSize: 10.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {tooltipPinned ? '📌 Tooltip Activo' : '🔍 Ver Punta Pitot'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                  <button
                    onClick={() => setCutawayMode(prev => !prev)}
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      borderRadius: 5,
                      cursor: 'pointer',
                      border: cutawayMode ? '1px solid #00e5ff' : '1px solid #334155',
                      background: cutawayMode ? 'rgba(0,229,255,0.16)' : 'rgba(15,23,42,0.8)',
                      color: cutawayMode ? '#84ffff' : '#94a3b8',
                    }}
                  >
                    {cutawayMode ? '✂️ Tubería 1/2 (Modo Pitot)' : '🔵 Tubería Completa'}
                  </button>
                  <button
                    onClick={() => setShowStreamlines(prev => !prev)}
                    style={{
                      padding: '4px 7px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      borderRadius: 5,
                      cursor: 'pointer',
                      border: showStreamlines ? '1px solid #00e676' : '1px solid #334155',
                      background: showStreamlines ? 'rgba(0,230,118,0.14)' : 'rgba(15,23,42,0.8)',
                      color: showStreamlines ? '#69f0ae' : '#94a3b8',
                    }}
                    title="Mostrar/ocultar líneas de corriente alrededor de la punta Pitot"
                  >
                    🌊 Corrientes
                  </button>
                </div>

                <div style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid #1e293b', borderRadius: 6, padding: '5px 8px', marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#94a3b8', marginBottom: 2 }}>
                    <span>Posición axial Pitot (o clic en tubo 3D)</span>
                    <span style={{ color: '#00e676', fontWeight: 700 }}>{((activeXNorm || 0) * Ltotal * 1000).toFixed(0)} mm</span>
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.98}
                    step={0.005}
                    value={activeXNorm}
                    onChange={(e) => setPitotCustomXNorm(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#00e676', cursor: 'pointer', height: 5 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 3, marginTop: 4 }}>
                    {tapResults.map((t) => {
                      const isSel = Math.abs(activeXNorm - t.xNorm) < 0.01
                      return (
                        <button
                          key={t.name}
                          onClick={() => {
                            setControls({ pitotSection: t.name })
                            setPitotCustomXNorm(t.xNorm)
                          }}
                          style={{
                            flex: 1,
                            padding: '2px 0',
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: 4,
                            cursor: 'pointer',
                            border: isSel ? '1px solid #00e676' : '1px solid #26324d',
                            background: isSel ? 'rgba(0,230,118,0.22)' : 'rgba(11,13,26,0.9)',
                            color: isSel ? '#00e676' : '#9aa2c0',
                          }}
                        >
                          {t.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>hTotal** (Altura Pitot) = <span style={S.green}>{(tapPitot.stagnationHead_mm || 0).toFixed(1)} mm</span></div>
                <div>h estático (Pared) = <span style={S.val}>{(tapPitot.pressureHead_mm || 0).toFixed(1)} mm</span></div>
                <div>Diámetro local ∅D = <span style={S.val}>{(tapPitot.D_mm || 0).toFixed(2)} mm</span> (A = {(tapPitot.A_mm2 || 0).toFixed(1)} mm²)</div>
                <div style={{ marginTop: 6, padding: '6px 8px', background: 'rgba(255, 145, 0, 0.09)', border: '1px solid rgba(255, 145, 0, 0.35)', borderLeft: '3px solid #ff9100', borderRadius: 6, fontSize: 11, lineHeight: 1.55 }}>
                  <div style={{ color: '#ffb74d', fontWeight: 800, marginBottom: 2 }}>
                    📝 Práctica Estudiante — Calcular en punto Pitot:
                  </div>
                  <div style={{ color: '#e2e8f0' }}>
                    1. Cabeza Dinámica <strong>Δh din</strong> = <span style={S.hot}>? mm</span> <span style={{ color: '#94a3b8' }}>(hTotal** − h estático)</span>
                  </div>
                  <div style={{ color: '#e2e8f0' }}>
                    2. Velocidad <strong>V (Pitot)</strong> = <span style={S.hot}>? m/s</span> <span style={{ color: '#94a3b8' }}>(√(2·g·Δh din))</span>
                  </div>
                  <div style={{ color: '#e2e8f0' }}>
                    3. Caudal <strong>Q (Pitot)</strong> = <span style={S.hot}>? L/s</span> <span style={{ color: '#94a3b8' }}>(A · V)</span>
                  </div>
                </div>

                <div style={S.sep} />
                <div style={S.hudTitle}>
                  <span>📐</span>
                  <span>Ecuación 3.17 (Venturi)</span>
                </div>
                <div>Q teórico ideal = <span style={S.val}>{venturiData.Q_teorico_Ls.toFixed(4)} L/s</span></div>
                <div>Coeficiente de Descarga Cd = <span style={S.hot}>{venturiData.Cd.toFixed(4)}</span></div>
                <div>Error Q teórico vs real = <span style={S.hot}>{venturiData.errorPorcentual.toFixed(2)}%</span></div>

                <div style={S.sep} />
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  ρ({tempC} °C) = {rho.toFixed(2)} kg/m³ · μ = {(mu * 1000).toFixed(3)} mPa·s · α = {alpha}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Escena 3D WebGL */}
        <BernoulliScene
          tapResults={tapResultsForScene}
          Ltotal={Ltotal}
          colorMode={colorMode}
          showIso={showIso}
          isoLevels={isoLevels}
          particleCount={particleCount}
          pitotTapIdx={effectivePitotIdx}
          pitotData={tapPitot}
          cutawayMode={cutawayMode}
          showStreamlines={showStreamlines}
          fluidColor={fluidColor}
          meniscusColor={meniscusColor}
          onPitotHover={handlePitotHover}
          onPitotLeave={handlePitotLeave}
          onPitotClick={handlePitotClick}
          onSelectPosition={handleSelectPosition}
        />

        {/* Tooltip SOTA de la Punta Encogida y Presión de Estancamiento */}
        <PitotTooltip
          pitotData={tooltipPinned ? tapPitot : (tooltipHoverData ? tapPitot : null)}
          mousePos={tooltipPos}
          pinned={tooltipPinned}
          onClose={() => {
            setTooltipPinned(false)
            setTooltipHoverData(null)
          }}
        />

        {/* Leyenda de colores */}
        <ColorLegend
          fieldName={colorMode}
          min={legendBounds.min}
          max={legendBounds.max}
          unit={legendBounds.unit}
        />
      </div>
      {/* Barra Lateral Derecha con Pestañas */}
      <div style={S.sidebar(sidebarOpen, isMobile)}>
        <div style={S.tabHeader}>
          <button
            style={S.tabBtn(activeTab === 'table')}
            onClick={() => setActiveTab('table')}
          >
            📊 Tabla 3.3
          </button>
          <button
            style={S.tabBtn(activeTab === 'fluids')}
            onClick={() => setActiveTab('fluids')}
          >
            🌡️ Tabla ρ(T), μ(T)
          </button>
          <button
            style={S.tabBtn(activeTab === 'derivation')}
            onClick={() => setActiveTab('derivation')}
          >
            📖 Memoria Teórica
          </button>
        </div>

        <div style={S.sidebarInner}>
          {activeTab === 'table' && (
            <div style={S.tableWrap}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 13.5, marginBottom: 4 }}>
                Tabla 3.3. Resultados Experimentales y Teóricos — {fluidFamily} ({tempC} °C)
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11.5, marginBottom: 8, lineHeight: 1.4 }}>
                Propiedades de tabla activas: <strong style={{ color: meniscusColor }}>ρ = {rho.toFixed(2)} kg/m³</strong> · <strong style={{ color: meniscusColor }}>μ = {(mu * 1000).toFixed(3)} mPa·s</strong> · <strong style={{ color: '#00e676' }}>h₀ = {(tap0.pressureHead_mm || 0).toFixed(1)} mm</strong>. Ingrese valores en <strong>h med</strong> o <strong>hTotal**</strong> para evaluar el error experimental en tiempo real.
              </div>
              <DataTable
                columns={COLUMNS}
                rows={tableRows}
                onChange={handleTableChange}
                title=""
              />
              <div style={{ marginTop: 12, fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                * <strong>hTotal*</strong>: Altura de carga total calculada con velocidad media (h calc + α·V²/2g) en columna de fluido a {tempC} °C.<br />
                ** <strong>hPitot calc / hTotal** (Pitot)</strong>: Altura piezométrica de estancamiento registrada en el eje del conducto por la sonda Pitot (🎯 marca la sección activa).
              </div>
            </div>
          )}

          {activeTab === 'fluids' && (
            <div style={S.tableWrap}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 13.5, marginBottom: 4 }}>
                Tabla Termofísica Oficial de Líquidos por Temperatura (IAPWS-IF97 / NIST / ASTM)
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11.5, marginBottom: 10, lineHeight: 1.4 }}>
                Haga clic en cualquier líquido y temperatura para seleccionarlo en el simulador y actualizar todas las alturas piezométricas <strong>H</strong>, presiones y número de Reynolds:
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, fontVariantNumeric: 'tabular-nums' }}>
                <thead>
                  <tr style={{ background: '#13172b', color: '#82cfff', borderBottom: '2px solid #26324d', textAlign: 'left' }}>
                    <th style={{ padding: '7px 8px' }}>Fluido / Estándar</th>
                    <th style={{ padding: '7px 8px', textAlign: 'right' }}>T (°C)</th>
                    <th style={{ padding: '7px 8px', textAlign: 'right' }}>ρ (kg/m³)</th>
                    <th style={{ padding: '7px 8px', textAlign: 'right' }}>γ (kN/m³)</th>
                    <th style={{ padding: '7px 8px', textAlign: 'right' }}>μ (mPa·s)</th>
                    <th style={{ padding: '7px 8px', textAlign: 'right' }}>ν (mm²/s)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(FLUIDS).map(([key, item]) => {
                    const isActive = key === fluid
                    const nu_cSt = (item.mu / item.rho) * 1e6
                    const gamma_kN = (item.rho * 9.81) / 1000
                    return (
                      <tr
                        key={key}
                        onClick={() => setControls({ fluid: key })}
                        style={{
                          cursor: 'pointer',
                          background: isActive ? 'rgba(2, 136, 209, 0.24)' : 'transparent',
                          borderBottom: '1px solid #1e2338',
                          color: isActive ? '#fff' : '#cbd5e1',
                          fontWeight: isActive ? 700 : 400,
                        }}
                      >
                        <td style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: item.meniscusColor || '#4fc3f7', display: 'inline-block' }} />
                          <span>{item.family}</span>
                          {isActive && <span style={{ color: '#00e676', fontSize: 10, fontWeight: 800 }}>● ACTIVO</span>}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#ffb74d' }}>{item.tempC} °C</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#82cfff', fontWeight: 700 }}>{item.rho.toFixed(2)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{gamma_kN.toFixed(3)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(item.mu * 1000).toFixed(3)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94a3b8' }}>{nu_cSt.toFixed(3)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'derivation' && (
            <DerivationPanel sections={sections} />
          )}
        </div>
      </div>
    </div>
  )
}


