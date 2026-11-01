import React, { useMemo, useState, useCallback } from 'react'
import { useControls } from 'leva'
import PipeFrictionScene from './PipeFrictionScene.jsx'
import DerivationPanel from '../DerivationPanel.jsx'
import DataTable from '../DataTable.jsx'
import ColorLegend from '../ColorLegend.jsx'
import { getDerivation } from './derivation.js'
import { solvePipeFriction, FLUIDS, ROUGHNESS } from './solver.js'

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
  ok: { color: '#42be65' },
  regime: (r) => ({
    color: r === 'Laminar' ? '#42be65' : r === 'Turbulent' ? '#ff6b6b' : '#ffab48',
    fontWeight: 700,
  }),
  tableWrap: { padding: '12px 16px', borderTop: '1px solid #1e2338' },
}

const COLUMNS = [
  { key: 'id', label: '#' },
  { key: 'Q_meas', label: 'Q meas', unit: 'L/min', editable: true, decimals: 2 },
  { key: 'hf_meas', label: 'hf meas', unit: 'm', editable: true, decimals: 4 },
  { key: 'V_calc', label: 'V calc', unit: 'm/s', decimals: 4 },
  { key: 'Re_calc', label: 'Re', decimals: 0 },
  { key: 'f_calc', label: 'f calc', decimals: 6 },
  { key: 'hf_calc', label: 'hf calc', unit: 'm', decimals: 4 },
  { key: 'error', label: 'Error', unit: '%', decimals: 2 },
]

function makeRows(n, D, L, eps, rho, mu) {
  const rows = []
  for (let i = 0; i < n; i++) {
    rows.push({ id: i + 1, Q_meas: null, hf_meas: null, V_calc: null, Re_calc: null, f_calc: null, hf_calc: null, error: null })
  }
  return rows
}

export default function PipeFrictionSim() {
  const { fluid, roughPreset, D, L, Q } = useControls('Pipe Friction', {
    fluid: { options: Object.keys(FLUIDS), value: 'Water 20 °C' },
    roughPreset: { options: Object.keys(ROUGHNESS), value: 'Commercial steel', label: 'Roughness' },
    D: { value: 0.025, min: 0.005, max: 0.3, step: 0.001, label: 'Diameter D (m)' },
    L: { value: 1.0, min: 0.1, max: 20, step: 0.1, label: 'Length L (m)' },
    Q: { value: 0.5, min: 0.01, max: 50, step: 0.01, label: 'Flow Q (L/min)' },
  })

  const { colorMode, showIso, isoLevels, particleCount } = useControls('Visualization', {
    colorMode: { options: ['Velocity', 'Wall Shear', 'Viscous Layer'], value: 'Velocity' },
    showIso: { value: true, label: 'Iso-lines' },
    isoLevels: { value: 8, min: 3, max: 20, step: 1, label: 'Iso levels' },
    particleCount: { value: 500, min: 100, max: 1500, step: 50, label: 'Particles' },
  })

  const { rho, mu } = FLUIDS[fluid]
  const eps = ROUGHNESS[roughPreset]
  const Qm3s = Q / 60000

  const results = useMemo(
    () => solvePipeFriction({ Q: Qm3s, D, L, eps, rho, mu }),
    [Qm3s, D, L, eps, rho, mu],
  )

  const sections = useMemo(
    () => getDerivation({ ...results, relRough: eps / D }),
    [results, eps, D],
  )

  // Data table with editable measured values
  const [rows, setRows] = useState(() => makeRows(8, D, L, eps, rho, mu))

  const handleChange = useCallback((rowId, key, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r
      const updated = { ...r, [key]: value }
      // Recalculate from measured Q if available
      if (updated.Q_meas != null && !isNaN(updated.Q_meas)) {
        const Qm = updated.Q_meas / 60000
        const res = solvePipeFriction({ Q: Qm, D, L, eps, rho, mu })
        updated.V_calc = res.V
        updated.Re_calc = res.Re
        updated.f_calc = res.f
        updated.hf_calc = res.hf
        if (updated.hf_meas != null && !isNaN(updated.hf_meas) && updated.hf_meas > 0) {
          updated.error = Math.abs((updated.hf_meas - res.hf) / res.hf) * 100
        }
      }
      return updated
    }))
  }, [D, L, eps, rho, mu])

  return (
    <div style={S.app}>
      <div style={S.viewport}>
        <div style={S.hud}>
          <div style={S.hudTitle}>🔧 Pipe Friction Losses</div>
          <div>Q = <span style={S.val}>{Q.toFixed(2)} L/min</span> = <span style={S.val}>{(Qm3s * 1e6).toFixed(1)} mL/s</span></div>
          <div>V = <span style={S.val}>{results.V.toFixed(4)} m/s</span></div>
          <div>Re = <span style={S.val}>{results.Re.toFixed(0)}</span> <span style={S.regime(results.regime)}>{results.regime}</span></div>
          <div style={S.sep} />
          <div>f = <span style={S.hot}>{results.f.toFixed(6)}</span></div>
          <div>h_f = <span style={S.hot}>{results.hf.toFixed(4)} m</span></div>
          <div>ΔP = <span style={S.hot}>{results.dp.toFixed(1)} Pa</span></div>
          <div style={S.sep} />
          <div>ε/D = <span style={S.val}>{(eps / D).toExponential(3)}</span></div>
          <div>τ_w = <span style={S.val}>{results.wallShear.toFixed(3)} Pa</span></div>
          <div>Power = <span style={S.val}>{results.power.toFixed(4)} W</span></div>
          <div style={S.sep} />
          <div style={{ fontSize: 11, color: '#5c648a' }}>
            ρ={rho} kg/m³ · μ={mu.toExponential(2)} Pa·s
          </div>
        </div>
        <PipeFrictionScene results={results} colorMode={colorMode} showIso={showIso} isoLevels={isoLevels} particleCount={particleCount} />
        <ColorLegend fieldName={colorMode} min={0} max={results.V} unit="m/s" />
      </div>
      <div style={S.sidebar}>
        <div style={S.sidebarInner}>
          <DerivationPanel sections={sections} />
          <div style={S.tableWrap}>
            <DataTable columns={COLUMNS} rows={rows} onChange={handleChange} title="📊 Lab Data" />
          </div>
        </div>
      </div>
    </div>
  )
}
