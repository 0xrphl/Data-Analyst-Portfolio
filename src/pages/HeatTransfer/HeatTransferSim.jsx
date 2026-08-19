import React, { useEffect, useRef, useState } from 'react'
import { useControls, button, Leva } from 'leva'
import CubeScene from './CubeScene.jsx'
import DerivationPanel from './DerivationPanel.jsx'
import { gradientCSS } from './colormap.js'

/**
 * Cavity fill for Case B (the furnace interior) — effective conductivity [W/m·K].
 * Natural convection + radiation are lumped into k_eff = Nu · k_fluid,
 * the standard engineering treatment for an enclosed cavity.
 */
const CAVITY_FILLS = {
  'Still air (k=0.03)': 0.03,
  'Air + convection (k=0.09)': 0.09,
  'Air + radiation, hot furnace': 0.35,
  'Argon (k=0.018)': 0.018,
  'Vacuum — radiation only': 0.12,
  'Custom': null,
}

/** Insulating / refractory SHELL materials: k [W/m·K], K [m²/s] */
const MATERIALS = {
  'Ceramic fiber blanket': { k: 0.10, K: 2.5e-7 },
  'Mineral wool':          { k: 0.045, K: 1.2e-6 },
  'Insulating firebrick':  { k: 0.30, K: 3.0e-7 },
  'Refractory brick':      { k: 1.20, K: 5.5e-7 },
  'Fused silica':          { k: 1.40, K: 8.0e-7 },
  'Concrete':              { k: 1.70, K: 7.0e-7 },
}

const S = {
  app: { display: 'flex', height: '100vh', width: '100vw' },
  viewport: { flex: 1, position: 'relative' },
  sidebar: { width: 460, borderLeft: '1px solid #1e2338', background: '#0b0d1a' },
  tabs: {
    position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
    zIndex: 20, display: 'flex', gap: 8,
  },
  tab: (a) => ({
    padding: '8px 18px', fontSize: 13, borderRadius: 8, cursor: 'pointer',
    border: '1px solid #2a3152', fontWeight: 600,
    background: a ? '#4589ff' : 'rgba(11,13,26,0.9)', color: a ? '#fff' : '#9aa2c0',
  }),
  hud: {
    position: 'absolute', top: 14, left: 14, zIndex: 10,
    background: 'rgba(11,13,26,0.92)', border: '1px solid #2a3152',
    borderRadius: 10, padding: '12px 16px', fontSize: 12.5, lineHeight: 1.7, minWidth: 245,
  },
  hudTitle: { fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#fff' },
  sep: { height: 1, background: '#232a45', margin: '7px 0' },
  banner: (ok) => ({
    position: 'absolute', top: 62, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
    background: ok ? 'linear-gradient(135deg,#42be65,#08bdba)' : 'rgba(11,13,26,0.9)',
    border: ok ? 'none' : '1px solid #2a3152',
    color: ok ? '#fff' : '#ffab48',
    borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700,
  }),
  legend: { position: 'absolute', bottom: 20, right: 480, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 },
  legendBar: { width: 16, height: 170, borderRadius: 4, border: '1px solid #2a3152' },
  legendLabels: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 170, fontSize: 11, color: '#9aa2c0' },
  val: { color: '#82cfff', fontVariantNumeric: 'tabular-nums' },
  hot: { color: '#ff8f5a', fontVariantNumeric: 'tabular-nums' },
  ok: { color: '#42be65' },
}

const fmtTime = (t) =>
  t < 60 ? `${t.toFixed(1)} s` : t < 3600 ? `${(t / 60).toFixed(1)} min` : `${(t / 3600).toFixed(2)} h`

export default function HeatTransferSim() {
  const workerRef = useRef(null)
  const [frame, setFrame] = useState(null)
  const [mode, setMode] = useState('solid')
  const [autoQ, setAutoQ] = useState(null)

  const { material, L, q, srcRadius, Twall, N, speed } = useControls('Physics', {
    material: { options: Object.keys(MATERIALS), value: 'Insulating firebrick' },
    L: { value: 1.0, min: 0.2, max: 2.0, step: 0.05, label: 'L outer edge (m)' },
    q: { value: 300, min: 0, max: 20000, step: 10, label: 'q heater (W)' },
    srcRadius: { value: 0.15, min: 0.03, max: 0.35, step: 0.01, label: 'heater radius (·L)' },
    Twall: { value: 60, min: 0, max: 200, step: 1, label: 'T outer wall (°C)' },
    N: { options: { '24³': 24, '32³': 32, '40³': 40 }, value: 32, label: 'grid N' },
    speed: { value: 120, min: 1, max: 1000, step: 1, label: 'speed (steps/frame)' },
  })

  const { wallD, cavityFill, kCavityCustom } = useControls('Furnace (Case B)', {
    wallD: { value: 0.15, min: 0.05, max: 0.4, step: 0.01, label: 'wall thickness D (·L)' },
    cavityFill: { options: Object.keys(CAVITY_FILLS), value: 'Air + radiation, hot furnace', label: 'cavity fill' },
    kCavityCustom: { value: 0.15, min: 0.01, max: 10, step: 0.01, label: 'k cavity custom' },
  })
  const kCavity = CAVITY_FILLS[cavityFill] ?? kCavityCustom

  const { targetCore } = useControls('Calibration', {
    targetCore: { value: 400, min: 100, max: 1200, step: 10, label: 'target core (°C)' },
    '🎯 Solve q for target': button(() => {
      workerRef.current?.postMessage({ type: 'calibrate', target: targetCoreRef.current })
    }),
  })
  const targetCoreRef = useRef(targetCore)
  useEffect(() => { targetCoreRef.current = targetCore }, [targetCore])

  const { mip, gamma, opacity, threshold, clipX, contours, bands } = useControls('Visualization', {
    mip: { value: false, label: 'MIP (max intensity)' },
    gamma: { value: 0.8, min: 0.05, max: 2.0, step: 0.01, label: 'contrast γ' },
    opacity: { value: 1.4, min: 0.1, max: 4.0, step: 0.05, label: 'density' },
    threshold: { value: 0.0, min: 0.0, max: 0.5, step: 0.005, label: 'cutoff' },
    clipX: { value: 0.02, min: -0.5, max: 0.5, step: 0.01, label: 'clip plane X' },
    contours: { value: true, label: 'contour bands' },
    bands: { value: 20, min: 3, max: 40, step: 1, label: '# bands' },
  })

  useControls('Simulation', {
    '▶ Play': button(() => workerRef.current?.postMessage({ type: 'play' })),
    '⏸ Pause': button(() => workerRef.current?.postMessage({ type: 'pause' })),
    '⟲ Reset': button(() => workerRef.current?.postMessage({ type: 'reset' })),
  })

  const mat = MATERIALS[material]

  useEffect(() => {
    const w = new Worker(new URL('./solverWorker.js', import.meta.url), { type: 'module' })
    workerRef.current = w
    w.onmessage = (e) => {
      const d = e.data
      if (d.type === 'frame') {
        setFrame({ ...d, field: new Float32Array(d.field) })
      } else if (d.type === 'calibrated') {
        setAutoQ(d.q)
      }
    }
    setTimeout(() => {
      w.postMessage({
        type: 'config', mode: 'solid', N: 32, L: 1.0,
        K: 3.0e-7, kCond: 0.30, q: 300, srcRadius: 0.15,
        Twall: 60, wallD: 0.15, kCavity: 0.15, speed: 120,
      })
      w.postMessage({ type: 'calibrate', target: 400 })
    }, 250)
    return () => w.terminate()
  }, [])

  useEffect(() => {
    workerRef.current?.postMessage({
      type: 'config', mode, N, L,
      K: mat.K, kCond: mat.k,
      q: autoQ != null ? autoQ : q,
      srcRadius, Twall, wallD, kCavity, speed,
    })
  }, [mode, N, L, mat, q, srcRadius, Twall, wallD, kCavity, speed, autoQ])

  // Manual q edits override the calibrated value
  useEffect(() => { setAutoQ(null) }, [q])

  const tMin = frame ? frame.minT : Twall
  const tMax = frame ? Math.max(frame.maxT, tMin + 1) : Twall + 1
  const qIn = frame?.qIn ?? q
  const balance = qIn > 0 ? (frame?.qWall ?? 0) / qIn : 0

  return (
    <div style={S.app}>
      <Leva collapsed={false} theme={{ sizes: { rootWidth: '320px' } }} />
      <div style={S.viewport}>
        <div style={S.tabs}>
          <button style={S.tab(mode === 'solid')} onClick={() => setMode('solid')}>🧱 Solid Cube</button>
          <button style={S.tab(mode === 'furnace')} onClick={() => setMode('furnace')}>🔥 Furnace (hollow)</button>
        </div>

        <div style={S.hud}>
          <div style={S.hudTitle}>
            {mode === 'furnace' ? '🔥 Furnace — hollow cube' : '🧱 Solid insulating cube'}
          </div>
          <div>t = <span style={S.val}>{frame ? fmtTime(frame.time) : '0 s'}</span></div>
          <div>T core = <span style={S.hot}>{frame ? frame.maxT.toFixed(1) : '—'}°C</span></div>
          {mode === 'furnace' && (
            <div>T cavity = <span style={S.hot}>{frame?.cavityT != null ? frame.cavityT.toFixed(1) : '—'}°C</span></div>
          )}
          <div>T inner surf = <span style={S.val}>{frame?.innerWallT != null ? frame.innerWallT.toFixed(1) : '—'}°C</span></div>
          <div>T outer wall = <span style={S.val}>{Twall.toFixed(1)}°C</span> <span style={{ color: '#5c648a' }}>(fixed)</span></div>
          <div>T avg = <span style={S.val}>{frame ? frame.avgT.toFixed(1) : '—'}°C</span></div>
          <div style={S.sep} />
          <div>q in = <span style={S.val}>{qIn.toFixed(0)} W</span></div>
          <div>q through wall = <span style={S.val}>{frame?.qWall != null ? frame.qWall.toFixed(0) : 0} W</span></div>
          <div>balance = <span style={{ color: Math.abs(balance - 1) < 0.02 ? '#42be65' : '#ffab48' }}>
            {(balance * 100).toFixed(1)}%
          </span></div>
          <div style={S.sep} />
          <div>{mode === 'furnace' ? 'shell: ' : 'material: '}<span style={{ color: '#be95ff' }}>{material}</span></div>
          <div style={{ fontSize: 11, color: '#5c648a' }}>
            k = {mat.k} W/mK · K = {mat.K.toExponential(1)} m²/s
          </div>
          {mode === 'furnace' && (
            <>
              <div>cavity: <span style={{ color: '#5ad1ff' }}>{cavityFill}</span></div>
              <div style={{ fontSize: 11, color: '#5c648a' }}>
                k_cav = {kCavity} W/mK · D = {(wallD * L).toFixed(3)} m · L_i = {(L - 2 * wallD * L).toFixed(3)} m
              </div>
            </>
          )}
          <div style={{ fontSize: 11, color: '#5c648a' }}>
            τ ≈ {(L * L / (3 * Math.PI * Math.PI * mat.K)).toFixed(0)} s · residual {frame?.residual != null ? frame.residual.toExponential(1) : '—'}
          </div>
        </div>

        <div style={S.banner(!!frame?.steady)}>
          {frame?.steady
            ? `✓ STEADY STATE at t = ${fmtTime(frame.time)} — q_in = q_out = ${frame.qWall.toFixed(0)} W`
            : `converging… ${(balance * 100).toFixed(0)}% of heat escaping`}
        </div>

        <div style={S.legend}>
          <div style={S.legendLabels}>
            <span>{tMax.toFixed(0)}°C</span>
            <span>{((tMax + tMin) / 2).toFixed(0)}</span>
            <span>{tMin.toFixed(0)}°C</span>
          </div>
          <div style={{ ...S.legendBar, background: gradientCSS() }} />
        </div>

        <CubeScene
          field={frame?.field}
          N={frame?.N ?? N}
          tMin={tMin} tMax={tMax}
          gamma={gamma} opacity={opacity} threshold={threshold}
          clipX={clipX} contours={contours} bands={bands} mip={mip}
        />
      </div>

      <div style={S.sidebar}>
        <DerivationPanel
          mode={mode} L={L} kCond={mat.k} Kdiff={mat.K}
          q={qIn} Twall={Twall} srcRadius={srcRadius}
          wallD={wallD} kCavity={kCavity}
        />
      </div>
    </div>
  )
}
