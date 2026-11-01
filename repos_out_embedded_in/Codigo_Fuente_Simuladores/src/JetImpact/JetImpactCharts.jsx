import React, { useState } from 'react'
import { JET_AREA_M2, RHO_WATER, VANE_CONFIGS } from './solver.js'

const S = {
  wrap: { padding: '16px 18px', color: '#c8cfe8' },
  header: { marginBottom: 14 },
  title: { color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 4 },
  subtitle: { color: '#94a3b8', fontSize: 11.5, lineHeight: 1.4 },
  tabs: { display: 'flex', gap: 6, marginBottom: 14 },
  tabBtn: (active) => ({
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 6,
    border: active ? '1px solid #4589ff' : '1px solid #2a3152',
    background: active ? '#1a237e' : '#0d1020',
    color: active ? '#82cfff' : '#9aa2c0',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  chartBox: {
    background: '#0d1020',
    border: '1px solid #2a3152',
    borderRadius: 8,
    padding: '12px 10px 8px 10px',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    fontSize: 11,
    color: '#94a3b8',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5 },
  dot: (color) => ({ width: 9, height: 9, borderRadius: '50%', background: color }),
  dash: (color) => ({ width: 14, height: 2, background: color }),
}

export default function JetImpactCharts({ tableData = {} }) {
  const [chartType, setChartType] = useState('force_flow')

  const W = 460
  const H = 260
  const padL = 48
  const padR = 20
  const padT = 24
  const padB = 40
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const qMax_Lmin = 30
  const qSteps = 30
  const qVals = Array.from({ length: qSteps + 1 }, (_, i) => (i * qMax_Lmin) / qSteps)

  const colors = {
    vane_90: '#42a5f5',
    vane_102: '#ffa726',
    vane_180: '#66bb6a',
  }

  const theoreticalCurves = Object.keys(VANE_CONFIGS).map((vKey) => {
    const config = VANE_CONFIGS[vKey]
    const points = qVals.map((qLmin) => {
      const qM3s = (qLmin / 60) * 1e-3
      const Fteo = (config.guideFactor * RHO_WATER * Math.pow(qM3s, 2)) / JET_AREA_M2
      const Fmax = (2 * RHO_WATER * Math.pow(qM3s, 2)) / JET_AREA_M2
      const eta = Fmax > 0 ? (Fteo / Fmax) * 100 : 0
      return { qLmin, Fteo, eta }
    })
    return { vKey, config, points, color: colors[vKey] }
  })

  const expPoints = Object.keys(VANE_CONFIGS).flatMap((vKey) => {
    const rows = tableData[vKey] || []
    return rows
      .filter((r) => r.Q_m3s > 0 && r.Fexp > 0)
      .map((r) => {
        const qLmin = r.Q_m3s * 60 * 1000
        return {
          vKey,
          qLmin,
          Fexp: r.Fexp,
          Fteo: r.Fteo,
          eta: r.efficiency,
          error: r.errorPercent,
          color: colors[vKey],
        }
      })
  })

  let yMax = 3.2
  let yLabel = 'Fuerza [N]'
  let xLabel = 'Caudal Q [L/min]'

  if (chartType === 'force_flow') {
    yMax = 3.2
    yLabel = 'Fuerza (Fteo y Fexp) [N]'
  } else if (chartType === 'error_flow') {
    yMax = 30
    yLabel = 'Error [%]'
  } else if (chartType === 'efficiency_flow') {
    yMax = 110
    yLabel = 'Eficiencia η [%]'


  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <div style={S.title}>📈 Gráficas Comparativas del Informe</div>
        <div style={S.subtitle}>
          Visualización de los requerimientos 2, 3 y 4 del informe con datos registrados.
        </div>
      </div>

      <div style={S.tabs}>
        <button
          style={S.tabBtn(chartType === 'force_flow')}
          onClick={() => setChartType('force_flow')}
        >
          2 · F vs Q (Teo y Exp)
        </button>
        <button
          style={S.tabBtn(chartType === 'error_flow')}
          onClick={() => setChartType('error_flow')}
        >
          3 · Error vs Q
        </button>
        <button
          style={S.tabBtn(chartType === 'efficiency_flow')}
          onClick={() => setChartType('efficiency_flow')}
        >
          4 · Eficiencia η vs Q
        </button>
      </div>

      <div style={S.chartBox}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padT + plotH * (1 - pct)
            const val = pct * yMax
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#1f2642" strokeDasharray="3,3" />
                <text x={padL - 6} y={y + 3.5} fill="#64748b" fontSize={9.5} textAnchor="end">
                  {val.toFixed(chartType === 'force_flow' ? 1 : 0)}
                </text>
              </g>
            )
          })}

          {[0, 5, 10, 15, 20, 25, 30].map((q, i) => {
            const x = toX(q)
            return (
              <g key={i}>
                <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#1f2642" strokeDasharray="3,3" />
                <text x={x} y={padT + plotH + 14} fill="#64748b" fontSize={9.5} textAnchor="middle">
                  {q}
                </text>
              </g>
            )
          })}

          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#3b4870" strokeWidth={1.2} />
          <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="#3b4870" strokeWidth={1.2} />

          <text x={padL + plotW / 2} y={H - 6} fill="#94a3b8" fontSize={10.5} textAnchor="middle" fontWeight={600}>
            {xLabel}
          </text>
          <text
            x={13}
            y={padT + plotH / 2}
            fill="#94a3b8"
            fontSize={10.5}
            textAnchor="middle"
            fontWeight={600}
            transform={`rotate(-90 13 ${padT + plotH / 2})`}
          >
            {yLabel}
          </text>

          {chartType === 'force_flow' &&
            theoreticalCurves.map(({ vKey, points, color }) => {
              const pathD = points
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.qLmin).toFixed(1)} ${toY(p.Fteo).toFixed(1)}`)
                .join(' ')
              return (
                <path
                  key={vKey}
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={0.85}
                />
              )
            })}

          {chartType === 'efficiency_flow' &&
            theoreticalCurves.map(({ vKey, points, color }) => {
              const pathD = points
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.qLmin).toFixed(1)} ${toY(p.eta).toFixed(1)}`)
                .join(' ')
              return (
                <path
                  key={vKey}
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={0.85}
                />
              )
            })}

          {expPoints.map((pt, i) => {
            let val = 0
            if (chartType === 'force_flow') val = pt.Fexp
            else if (chartType === 'error_flow') val = pt.error || 0
            else if (chartType === 'efficiency_flow') val = pt.eta || 0

            return (
              <circle
                key={i}
                cx={toX(pt.qLmin)}
                cy={toY(val)}
                r={4.5}
                fill={pt.color}
                stroke="#fff"
                strokeWidth={1.2}
              />
            )
          })}
        </svg>

        <div style={S.legend}>
          <div style={S.legendItem}>
            <div style={S.dash(colors.vane_90)} />
            <span>90° Plano</span>
          </div>
          <div style={S.legendItem}>
            <div style={S.dash(colors.vane_102)} />
            <span>102° Curvo</span>
          </div>
          <div style={S.legendItem}>
            <div style={S.dash(colors.vane_180)} />
            <span>180° Semiesf.</span>
          </div>
          <div style={S.legendItem}>
            <div style={S.dot('#fff')} />
            <span>Puntos experimentales</span>
          </div>
        </div>
      </div>
    </div>
  )
}

  }

  const toX = (q) => padL + (q / qMax_Lmin) * plotW
  const toY = (v) => padT + plotH - (Math.min(Math.max(v, 0), yMax) / yMax) * plotH
