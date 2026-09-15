import React from 'react'

/**
 * Floating tooltip with large fitting image + details.
 * Follows the mouse position; shown when `fitting` is not null.
 *
 * Props:
 *   fitting  — { name, K, hL, dp, color, img } or null
 *   mousePos — { x, y } screen coordinates
 */

const TT = {
  wrap: {
    position: 'fixed', zIndex: 9999, pointerEvents: 'none',
    transition: 'opacity 0.18s ease, transform 0.15s ease',
  },
  card: {
    background: 'rgba(11, 13, 26, 0.96)',
    border: '1px solid #2a3152',
    borderRadius: 14,
    backdropFilter: 'blur(16px)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(69,137,255,0.12)',
    overflow: 'hidden',
    width: 320,
  },
  imgWrap: {
    width: '100%',
    height: 220,
    background: '#0d1020',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #1e2338',
    overflow: 'hidden',
  },
  img: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  body: {
    padding: '12px 16px',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    lineHeight: 1.8,
    color: '#9aa2c0',
  },
  val: {
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: '#82cfff',
  },
  colorDot: (c) => ({
    display: 'inline-block',
    width: 8, height: 8,
    borderRadius: '50%',
    background: c,
    marginRight: 6,
    verticalAlign: 'middle',
    boxShadow: `0 0 6px ${c}88`,
  }),
  noImg: {
    color: '#5c648a',
    fontSize: 13,
    fontStyle: 'italic',
  },
}

export default function FittingTooltip({ fitting, mousePos }) {
  if (!fitting) return null

  // Keep tooltip 18px right and 14px below cursor, but clamp so it doesn't overflow
  const left = Math.min(mousePos.x + 18, window.innerWidth - 340)
  const top = Math.min(mousePos.y + 14, window.innerHeight - 380)

  return (
    <div
      style={{
        ...TT.wrap,
        left,
        top,
        opacity: 1,
        transform: 'translateY(0)',
      }}
    >
      <div style={TT.card}>
        {/* Image */}
        <div style={TT.imgWrap}>
          {fitting.img ? (
            <img src={fitting.img} alt={fitting.name} style={TT.img} />
          ) : (
            <span style={TT.noImg}>No image available</span>
          )}
        </div>

        {/* Info body */}
        <div style={TT.body}>
          <div style={{ ...TT.title, color: fitting.color }}>
            <span style={TT.colorDot(fitting.color)} />
            {fitting.name}
          </div>

          <div style={TT.row}>
            <span>Loss coefficient</span>
            <span style={TT.val}>K = {fitting.K != null ? fitting.K.toFixed(2) : '—'}</span>
          </div>
          <div style={TT.row}>
            <span>Head loss</span>
            <span style={TT.val}>h_L = {fitting.hL != null ? fitting.hL.toFixed(4) : '—'} m</span>
          </div>
          <div style={TT.row}>
            <span>Pressure drop</span>
            <span style={TT.val}>ΔP = {fitting.dp != null ? fitting.dp.toFixed(1) : '—'} Pa</span>
          </div>
          {fitting.Leq != null && (
            <div style={TT.row}>
              <span>Equivalent length</span>
              <span style={TT.val}>L_eq = {fitting.Leq.toFixed(3)} m</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
