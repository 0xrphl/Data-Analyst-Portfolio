import React, { useMemo, useState, useCallback } from 'react'
import { useControls } from 'leva'
import JetImpactScene from './JetImpactScene.jsx'
import DerivationPanel from '../DerivationPanel.jsx'
import DataTable from '../DataTable.jsx'
import ColorLegend from '../ColorLegend.jsx'
import { getDerivation } from './derivation.js'
import { solveJetImpact, VANE_TYPES } from './solver.js'

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
  tableWrap: { padding: '12px 16px', borderTop: '1px solid #1e2338' },
}

const COLUMNS = [
  { key: 'id', label: '#' },
  { key: 'Q_meas', label: 'Q', unit: 'L/min', editable: true, decimals: 2 },
  { key: 'F_meas', label: 'F meas', unit: 'N', editable: true, decimals: 4 },
  { key: 'V_calc', label: 'V jet', unit: 'm/s', decimals: 3 },
  { key: 'F_theo', label: 'F theo', unit: 'N', decimals: 4 },
  { key: 'error', label: 'Error', unit: '%', decimals: 2 },
]

export default function JetImpactSim() {
  const { vaneType, Djet, Q } = useControls('Jet Impact', {
    vaneType: { options: Object.keys(VANE_TYPES), value: 'Flat plate (90°)', label: 'Vane' },
    Djet: { value: 0.010, min: 0.003, max: 0.05, step: 0.001, label: 'D nozzle (m)' },
    Q: { value: 2.0, min: 0.1, max: 30, step: 0.1, label: 'Flow Q (L/min)' },
  })

  const { colorMode, particleCount } = useControls('Visualization', {
    colorMode: { options: ['Velocity', 'Height', 'Momentum'], value: 'Velocity' },
    particleCount: { value: 400, min: 100, max: 1200, step: 50, label: 'Particles' },
  })

  const Qm3s = Q / 60000
  const results = useMemo(() => solveJetImpact({ Q: Qm3s, Djet, vaneType }), [Qm3s, Djet, vaneType])
  const sections = useMemo(() => getDerivation(results), [results])

  const [rows, setRows] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({ id: i + 1, Q_meas: null, F_meas: null, V_calc: null, F_theo: null, error: null })),
  )

  const handleChange = useCallback((rowId, key, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r
      const u = { ...r, [key]: value }
      if (u.Q_meas != null && !isNaN(u.Q_meas)) {
        const res = solveJetImpact({ Q: u.Q_meas / 60000, Djet, vaneType })
        u.V_calc = res.Vjet
        u.F_theo = res.Ftheo
        if (u.F_meas != null && !isNaN(u.F_meas) && res.Ftheo > 0) {
          u.error = Math.abs((u.F_meas - res.Ftheo) / res.Ftheo) * 100
        }
      }
      return u
    }))
  }, [Djet, vaneType])

  return (
    <div style={S.app}>
      <div style={S.viewport}>
        <div style={S.hud}>
          <div style={S.hudTitle}>🚿 Jet Impact on Vanes</div>
          <div>Vane: <span style={{ color: '#be95ff', fontWeight: 600 }}>{results.vaneLabel}</span></div>
          <div>β = <span style={S.val}>{(results.beta * 180 / Math.PI).toFixed(0)}°</span></div>
          <div style={S.sep} />
          <div>Q = <span style={S.val}>{Q.toFixed(1)} L/min</span></div>
          <div>V_jet = <span style={S.hot}>{results.Vjet.toFixed(3)} m/s</span></div>
          <div>ṁ = <span style={S.val}>{results.massFlow.toFixed(4)} kg/s</span></div>
          <div style={S.sep} />
          <div>F_theo = <span style={S.hot}>{results.Ftheo.toFixed(4)} N</span></div>
          <div>K = 1−cos β = <span style={S.val}>{results.Kfactor.toFixed(3)}</span></div>
          <div>Jet height = <span style={S.val}>{results.jetHeight.toFixed(3)} m</span></div>
          <div>P_kinetic = <span style={S.val}>{results.kineticPower.toFixed(3)} W</span></div>
        </div>
        <JetImpactScene results={results} colorMode={colorMode} particleCount={particleCount} />
        <ColorLegend fieldName={colorMode} min={0} max={results.Vjet} unit="m/s" />
      </div>
      <div style={S.sidebar}>
        <div style={S.sidebarInner}>
          <DerivationPanel sections={sections} />
          <div style={S.tableWrap}>
            <DataTable columns={COLUMNS} rows={rows} onChange={handleChange} title="📊 Jet Impact Lab Data" />
          </div>
        </div>
      </div>
    </div>
  )
}
