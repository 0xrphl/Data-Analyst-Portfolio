import React, { useMemo, useState, useCallback, useRef } from 'react'
import { useControls } from 'leva'
import MinorLossesScene from './MinorLossesScene.jsx'
import DerivationPanel from '../DerivationPanel.jsx'
import DataTable from '../DataTable.jsx'
import FittingTooltip from './FittingTooltip.jsx'
import ColorLegend from '../ColorLegend.jsx'
import { getDerivation } from './derivation.js'
import { solveMinorLosses, FITTINGS } from './solver.js'

const S = {
  app: { display: 'flex', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' },
  viewport: { flex: 1, position: 'relative' },
  sidebar: { width: 460, borderLeft: '1px solid #1e2338', background: '#0b0d1a', display: 'flex', flexDirection: 'column' },
  sidebarInner: { flex: 1, overflowY: 'auto' },
  hud: {
    position: 'absolute', top: 14, left: 14, zIndex: 10,
    background: 'rgba(11,13,26,0.92)', border: '1px solid #2a3152',
    borderRadius: 10, padding: '12px 16px', fontSize: 12.5, lineHeight: 1.7, minWidth: 260,
  },
  hudTitle: { fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#fff' },
  sep: { height: 1, background: '#232a45', margin: '7px 0' },
  val: { color: '#82cfff', fontVariantNumeric: 'tabular-nums' },
  hot: { color: '#ff8f5a', fontVariantNumeric: 'tabular-nums' },
  fittingChip: (c) => ({
    display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 4,
    background: c + '22', color: c, border: `1px solid ${c}55`, marginRight: 4, marginBottom: 4,
  }),
  tableWrap: { padding: '12px 16px', borderTop: '1px solid #1e2338' },
}

const ALL_FITTINGS = Object.keys(FITTINGS)
const DEFAULT_SELECTED = [
  '90° elbow (standard)', '45° elbow', 'Gate valve (full open)',
  'Globe valve (full open)', 'Sudden expansion',
]

const COLUMNS = [
  { key: 'name', label: 'Fitting' },
  { key: 'K', label: 'K theo', decimals: 2 },
  { key: 'hL', label: 'hL theo', unit: 'm', decimals: 4 },
  { key: 'hL_meas', label: 'hL meas', unit: 'm', editable: true, decimals: 4 },
  { key: 'dp', label: 'ΔP', unit: 'Pa', decimals: 1 },
  { key: 'Leq', label: 'L_eq', unit: 'm', decimals: 3 },
  { key: 'error', label: 'Error', unit: '%', decimals: 2 },
]

export default function MinorLossesSim() {
  const { D, Q, D2 } = useControls('Minor Losses', {
    D: { value: 0.025, min: 0.005, max: 0.15, step: 0.001, label: 'D pipe (m)' },
    Q: { value: 1.0, min: 0.01, max: 30, step: 0.1, label: 'Flow Q (L/min)' },
    D2: { value: 0.040, min: 0.01, max: 0.2, step: 0.001, label: 'D2 (exp/con) (m)' },
  })

  const { colorMode, particleCount } = useControls('Visualization', {
    colorMode: { options: ['Velocity', 'Pressure', 'Energy Loss'], value: 'Velocity' },
    particleCount: { value: 400, min: 100, max: 1200, step: 50, label: 'Particles' },
  })

  const [selected, setSelected] = useState(DEFAULT_SELECTED)
  const toggleFitting = useCallback((name) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }, [])

  // ── Tooltip state ──
  const [tooltipFitting, setTooltipFitting] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleFittingHover = useCallback((fitting, pos) => {
    setTooltipFitting(fitting)
    setTooltipPos(pos)
  }, [])
  const handleFittingLeave = useCallback(() => {
    setTooltipFitting(null)
  }, [])

  // For chip hover — build a fitting-like object from the FITTINGS dict
  const chipHover = useCallback((name, e) => {
    const fit = FITTINGS[name]
    if (!fit) return
    setTooltipFitting({ name, K: fit.K, color: fit.color, img: fit.img, hL: null, dp: null, Leq: null })
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }, [])
  const chipLeave = useCallback(() => {
    setTooltipFitting(null)
  }, [])

  const Qm3s = Q / 60000
  const results = useMemo(
    () => solveMinorLosses({ Q: Qm3s, D, selectedFittings: selected, D2 }),
    [Qm3s, D, selected, D2],
  )
  const sections = useMemo(() => getDerivation(results), [results])

  const [measData, setMeasData] = useState({})
  const tableRows = useMemo(() =>
    results.fittings.map((f, i) => ({
      id: i, ...f,
      hL_meas: measData[f.name] ?? null,
      error: measData[f.name] != null && f.hL > 0
        ? Math.abs((measData[f.name] - f.hL) / f.hL) * 100 : null,
    })),
    [results.fittings, measData],
  )

  const handleChange = useCallback((rowId, key, value) => {
    if (key === 'hL_meas') {
      const name = results.fittings[rowId]?.name
      if (name) setMeasData(prev => ({ ...prev, [name]: value }))
    }
  }, [results.fittings])

  return (
    <div style={S.app}>
      <div style={S.viewport}>
        <div style={S.hud}>
          <div style={S.hudTitle}>⚙️ Minor Losses — Fittings</div>
          <div>Q = <span style={S.val}>{Q.toFixed(1)} L/min</span></div>
          <div>V = <span style={S.val}>{results.V.toFixed(3)} m/s</span></div>
          <div>V²/2g = <span style={S.val}>{results.Vh.toFixed(4)} m</span></div>
          <div>Re = <span style={S.val}>{results.Re.toFixed(0)}</span></div>
          <div style={S.sep} />
          <div>ΣK = <span style={S.hot}>{results.totalK.toFixed(2)}</span></div>
          <div>Σh_L = <span style={S.hot}>{results.totalHL.toFixed(4)} m</span></div>
          <div>ΣΔP = <span style={S.hot}>{results.totalDP.toFixed(1)} Pa</span></div>
          <div style={S.sep} />
          <div style={{ fontSize: 11, color: '#5c648a', marginBottom: 6 }}>Select fittings:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {ALL_FITTINGS.map(name => {
              const active = selected.includes(name)
              const c = FITTINGS[name].color
              return (
                <span
                  key={name}
                  style={{ ...S.fittingChip(active ? c : '#555'), cursor: 'pointer', opacity: active ? 1 : 0.5 }}
                  onClick={() => toggleFitting(name)}
                  onMouseEnter={(e) => chipHover(name, e)}
                  onMouseMove={(e) => chipHover(name, e)}
                  onMouseLeave={chipLeave}
                >
                  {name}
                </span>
              )
            })}
          </div>
        </div>
        <MinorLossesScene
          results={results}
          onFittingHover={handleFittingHover}
          onFittingLeave={handleFittingLeave}
          colorMode={colorMode}
          particleCount={particleCount}
        />
        <FittingTooltip fitting={tooltipFitting} mousePos={tooltipPos} />
        <ColorLegend fieldName={colorMode} min={0} max={results.V} unit="m/s" />
      </div>
      <div style={S.sidebar}>
        <div style={S.sidebarInner}>
          <DerivationPanel sections={sections} />
          <div style={S.tableWrap}>
            <DataTable columns={COLUMNS} rows={tableRows} onChange={handleChange} title="📊 Minor Losses Lab Data" />
          </div>
        </div>
      </div>
    </div>
  )
}
