/**
 * Minor (local) losses in pipe fittings — K-factor method.
 * All SI units.
 */

const g = 9.81

const IMG = '/college/hydraulics-lab/cycle1/imgs/'

export const FITTINGS = {
  '90° elbow (standard)':   { K: 0.90, color: '#e91e63', img: IMG + '90-elbow-standard.png' },
  '90° elbow (long radius)':{ K: 0.60, color: '#f44336', img: IMG + '90-elbow-long-radius.png' },
  '45° elbow':              { K: 0.40, color: '#ff5722', img: IMG + '45-elbow.png' },
  'Tee (branch flow)':      { K: 1.80, color: '#ff9800', img: IMG + 'tee-branch-flow.png' },
  'Tee (line flow)':        { K: 0.40, color: '#ffc107', img: IMG + 'tee-line-flow.png' },
  'Gate valve (full open)': { K: 0.19, color: '#4caf50', img: IMG + 'gate-valve-full-open.png' },
  'Gate valve (½ open)':    { K: 5.60, color: '#8bc34a', img: IMG + 'gate-valve-half-open.png' },
  'Globe valve (full open)':{ K: 10.0, color: '#00bcd4', img: IMG + 'globe-valve-full-open.png' },
  'Check valve (swing)':    { K: 2.50, color: '#2196f3', img: IMG + 'check-valve.png' },
  'Sudden expansion':       { K: null, color: '#9c27b0', img: IMG + 'sudden-expansion.png' }, // computed
  'Sudden contraction':     { K: null, color: '#673ab7', img: IMG + 'sudden-contraction.png' }, // computed
  'Entrance (sharp)':       { K: 0.50, color: '#795548', img: IMG + 'entrance-sharp.png' },
  'Entrance (rounded)':     { K: 0.03, color: '#607d8b', img: IMG + 'entrance-rounded.png' },
  'Exit':                   { K: 1.00, color: '#9e9e9e', img: null },
}

/** K for sudden expansion: K = (1 - A1/A2)² */
export function KsuddenExpansion(D1, D2) {
  const ratio = (D1 / D2) ** 2
  return (1 - ratio) ** 2
}

/** K for sudden contraction: K ≈ 0.5(1 - A2/A1) */
export function KsuddenContraction(D1, D2) {
  const ratio = (D2 / D1) ** 2
  return 0.5 * (1 - ratio)
}

/**
 * Solve minor losses for selected fittings.
 * @param {Object} params - { Q, D, selectedFittings, D2 (for expansion/contraction), rho, mu }
 * @returns {Object} - results per fitting and totals
 */
export function solveMinorLosses({ Q, D, selectedFittings, D2 = null, rho = 998, mu = 1.002e-3 }) {
  const A = Math.PI * D * D / 4
  const V = Q / A
  const Re = (rho * V * D) / mu
  const Vh = V * V / (2 * g) // velocity head

  const results = selectedFittings.map(name => {
    const fit = FITTINGS[name]
    let K = fit.K
    if (name === 'Sudden expansion' && D2) K = KsuddenExpansion(D, D2)
    if (name === 'Sudden contraction' && D2) K = KsuddenContraction(D, D2)
    if (K == null) K = 0
    const hL = K * Vh
    const dp = rho * g * hL
    const Leq = K * D / 0.02 // equivalent length assuming f≈0.02
    return { name, K, hL, dp, Leq, color: fit.color, img: fit.img }
  })

  const totalK = results.reduce((s, r) => s + r.K, 0)
  const totalHL = results.reduce((s, r) => s + r.hL, 0)
  const totalDP = results.reduce((s, r) => s + r.dp, 0)

  return {
    Q, D, V, Re, Vh, A, rho, mu,
    fittings: results,
    totalK, totalHL, totalDP,
    regime: Re < 2300 ? 'Laminar' : Re > 4000 ? 'Turbulent' : 'Transitional',
  }
}
