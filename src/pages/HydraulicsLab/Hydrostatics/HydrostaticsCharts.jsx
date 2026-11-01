import React from 'react'

export default function HydrostaticsCharts({ samples = [], FH, FV, FR, pMax, h }) {
  if (!samples || samples.length === 0) return null

  const step = Math.max(1, Math.floor(samples.length / 10))
  const chartPoints = []
  for (let i = 0; i < samples.length; i += step) {
    chartPoints.push(samples[i])
  }
  if (chartPoints[chartPoints.length - 1] !== samples[samples.length - 1]) {
    chartPoints.push(samples[samples.length - 1])
  }

  const maxP = Math.max(1, pMax)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: '#82cfff', fontWeight: 700 }}>
          Perfil de Presion Hidrostatica vs Profundidad
        </h4>
        <div
          style={{
            background: 'rgba(5, 7, 16, 0.7)',
            border: '1px solid #1e2338',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {chartPoints.map((pt, idx) => {
            const pct = Math.min(100, Math.max(0, (pt.pressure / maxP) * 100))
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ width: 65, color: '#94a3b8', fontFamily: 'monospace' }}>
                  y = {pt.y.toFixed(2)} m
                </span>
                <div style={{ flex: 1, background: '#1e293b', height: 12, borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: pct + '%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #38bdf8, #f59e0b)',
                      transition: 'width 0.2s',
                    }}
                  />
                </div>
                <span style={{ width: 85, color: '#f59e0b', textAlign: 'right', fontFamily: 'monospace' }}>
                  {(pt.pressure / 1000).toFixed(2)} kPa
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: '#82cfff', fontWeight: 700 }}>
          Descomposicion Vectorial de Fuerzas Resultantes
        </h4>
        <div
          style={{
            background: 'rgba(5, 7, 16, 0.7)',
            border: '1px solid #1e2338',
            borderRadius: 8,
            padding: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            textAlign: 'center',
          }}
        >
          <div style={{ background: '#0b1329', padding: 8, borderRadius: 6, border: '1px solid #1e3a8a' }}>
            <div style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700 }}>Fuerza Horizontal (F_H)</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 4 }}>
              {(FH / 1000).toFixed(2)} <span style={{ fontSize: 10, color: '#94a3b8' }}>kN</span>
            </div>
            <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 2 }}>Proyeccion Vertical</div>
          </div>

          <div style={{ background: '#1c102b', padding: 8, borderRadius: 6, border: '1px solid #581c87' }}>
            <div style={{ fontSize: 10, color: '#c084fc', fontWeight: 700 }}>Fuerza Vertical (F_V)</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 4 }}>
              {(Math.abs(FV) / 1000).toFixed(2)} <span style={{ fontSize: 10, color: '#94a3b8' }}>kN</span>
            </div>
            <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 2 }}>Peso Columna Fluido</div>
          </div>

          <div style={{ background: '#261214', padding: 8, borderRadius: 6, border: '1px solid #991b1b' }}>
            <div style={{ fontSize: 10, color: '#f87171', fontWeight: 700 }}>Resultante Total (F_R)</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 4 }}>
              {(FR / 1000).toFixed(2)} <span style={{ fontSize: 10, color: '#94a3b8' }}>kN</span>
            </div>
            <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 2 }}>sqrt(F_H^2 + F_V^2)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
