import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useControls, folder } from 'leva'
import BernoulliScene from './BernoulliScene.jsx'
import DerivationPanel from '../DerivationPanel.jsx'
import DataTable from '../DataTable.jsx'
import ColorLegend from '../ColorLegend.jsx'
import { getDerivation } from './derivation.js'
import {
  venturiGeometryFromAreas,
  solveBernoulli,
  computeVenturiTheoreticalFlow,
  FLUIDS,
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
  { key: 'pressureHead_mm', label: 'h calc', unit: 'mm', decimals: 1 },
  { key: 'h_meas_mm', label: 'h med', unit: 'mm', editable: true, decimals: 1 },
  { key: 'error_h', label: 'Error h', unit: '%', decimals: 2 },
  { key: 'V', label: 'V', unit: 'm/s', decimals: 4 },
  { key: 'velocityHead_mm', label: 'V²/2g', unit: 'mm', decimals: 1 },
  { key: 'totalHead_mm', label: 'hTotal*', unit: 'mm', decimals: 1 },
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

  const controls = useControls({
    'Operación Hidráulica': folder({
      fluid: { options: Object.keys(FLUIDS), value: 'Agua 20 °C (ρ = 1000 kg/m³)', label: 'Fluido' },
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
  })

  const {
    fluid, Q_Lmin, h0_mm, pitotSection, useLosses, alpha, Ltotal,
    A0, A1, A2, A3, A4, A5, A6,
    colorMode, showIso, isoLevels, particleCount,
  } = controls

  const parsedPitot = parseInt(pitotSection.replace('S', ''), 10)
  const pitotTapIdx = Number.isNaN(parsedPitot) ? 3 : parsedPitot
  const areas_mm2 = useMemo(() => [A0, A1, A2, A3, A4, A5, A6], [A0, A1, A2, A3, A4, A5, A6])
  const { rho, mu } = FLUIDS[fluid] || { rho: 1000, mu: 1.002e-3 }
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

  const venturiData = useMemo(() => {
    const t0 = tapResults[0]
    const tp = tapResults[pitotTapIdx] || tapResults[3]
    return computeVenturiTheoreticalFlow(t0, tp, Q_m3s)
  }, [tapResults, pitotTapIdx, Q_m3s])

  const sections = useMemo(() => {
    return getDerivation({
      taps: tapResults,
      Q: Q_m3s,
      rho,
      alpha,
      pitotTapIndex: pitotTapIdx,
      venturiData,
    })
  }, [tapResults, Q_m3s, rho, alpha, pitotTapIdx, venturiData])

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
      const error_h = h_med != null && t.pressureHead_mm > 0
        ? (Math.abs(t.pressureHead_mm - h_med) / t.pressureHead_mm) * 100
        : null

      const isPitotSec = i === pitotTapIdx
      const pitot_med = typeof m.pitot_meas_mm === 'number' && !isNaN(m.pitot_meas_mm) ? m.pitot_meas_mm : null
      const error_pitot = isPitotSec && pitot_med != null && t.totalHead_mm > 0
        ? (Math.abs(t.totalHead_mm - pitot_med) / t.totalHead_mm) * 100
        : null

      return {
        id: i,
        name: t.name,
        A_mm2: t.A_mm2,
        D_mm: t.D_mm,
        pressureHead_mm: t.pressureHead_mm,
        h_meas_mm: h_med,
        error_h,
        V: t.V,
        velocityHead_mm: t.velocityHead_mm,
        totalHead_mm: t.totalHead_mm,
        pitot_meas_mm: pitot_med,
        error_pitot,
      }
    })
  }, [tapResults, measRows, pitotTapIdx])

  const tap0 = tapResults[0] || {}
  const tap1 = tapResults[1] || {}
  const tapPitot = tapResults[pitotTapIdx] || tapResults[3] || {}
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
                <div style={S.hudTitle}>
                  <span>💡</span>
                  <span>Sonda Pitot ({pitotSection})</span>
                </div>
                <div>hTotal** (Estancamiento) = <span style={S.green}>{(tapPitot.stagnationHead_mm || 0).toFixed(1)} mm</span></div>
                <div>h estático (Pared) = <span style={S.val}>{(tapPitot.pressureHead_mm || 0).toFixed(1)} mm</span></div>
                <div>Cabeza Dinámica Δh din = <span style={S.green}>{(tapPitot.pitotDeltaH_mm || 0).toFixed(1)} mm</span></div>
                <div>Velocidad V (Pitot) = <span style={S.green}>{(tapPitot.Vpitot || 0).toFixed(3)} m/s</span></div>
                <div>Caudal Q (Pitot) = <span style={S.val}>{(tapPitot.Qpitot_Ls || 0).toFixed(4)} L/s</span></div>

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
                  ρ = {rho} kg/m³ · α = {alpha} · g = 9.81 m/s²
                </div>
              </>
            )}
          </div>
        </div>

        {/* Escena 3D WebGL */}
        <BernoulliScene
          tapResults={tapResults}
          Ltotal={Ltotal}
          colorMode={colorMode}
          showIso={showIso}
          isoLevels={isoLevels}
          particleCount={particleCount}
          pitotTapIdx={pitotTapIdx}
        />

        {/* Leyenda de colores */}
        <ColorLegend
          fieldName={colorMode}
          min={0}
          max={tap1.V || 1.7}
          unit={colorMode === 'Presión' ? 'mm' : 'm/s'}
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
                Tabla 3.3. Resultados Experimentales y Teóricos
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11.5, marginBottom: 10, lineHeight: 1.4 }}>
                Ingrese valores en la columna <strong>h med</strong> para evaluar el error experimental en tiempo real.
              </div>
              <DataTable
                columns={COLUMNS}
                rows={tableRows}
                onChange={handleTableChange}
                title=""
              />
              <div style={{ marginTop: 12, fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                * <strong>hTotal*</strong>: Altura de carga total teórica/calculada con velocidad media (h calc + V²/2g).<br />
                ** <strong>hTotal** (Pitot)</strong>: Altura piezométrica de estancamiento registrada por la sonda Pitot. Ingrese el valor medido en la sección de ensayo para evaluar el error experimental.
              </div>
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


