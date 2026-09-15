import React from 'react'
import { pressureGradientCSS } from './colormap.js'

/**
 * Vertical rainbow legend bar overlay.
 * Shows field name + min/max values next to a jet-colormap gradient.
 */
const S = {
  wrap: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 25,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(11, 13, 26, 0.88)',
    border: '1px solid #2a3152',
    borderRadius: 8,
    padding: '8px 12px 10px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  header: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#82cfff',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  body: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  labels: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 140,
    fontSize: 10.5,
    color: '#9aa2c0',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    lineHeight: 1,
  },
  bar: {
    width: 14,
    height: 140,
    borderRadius: 3,
    border: '1px solid #2a3152',
    background: pressureGradientCSS(),
  },
}

export default function ColorLegend({ fieldName = 'Velocity', min = 0, max = 1, unit = 'm/s', style }) {
  const safeMin = typeof min === 'number' && !Number.isNaN(min) ? min : 0
  const safeMax = typeof max === 'number' && !Number.isNaN(max) ? max : 1
  const mid = (safeMax + safeMin) / 2

  return (
    <div style={{ ...S.wrap, ...style }}>
      <div style={S.header}>{fieldName}</div>
      <div style={S.body}>
        <div style={S.labels}>
          <span style={{ color: '#ff7b72', fontWeight: 600 }}>
            {safeMax.toFixed(3)} {unit}
          </span>
          <span style={{ color: '#9aa2c0' }}>
            {mid.toFixed(3)}
          </span>
          <span style={{ color: '#79c0ff', fontWeight: 600 }}>
            {safeMin.toFixed(3)} {unit}
          </span>
        </div>
        <div style={S.bar} />
      </div>
    </div>
  )
}

