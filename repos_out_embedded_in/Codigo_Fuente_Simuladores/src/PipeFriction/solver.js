/**
 * Pipe-friction solver — Darcy-Weisbach, Colebrook-White, Moody.
 * ─────────────────────────────────────────────────────────────
 * All SI units: m, s, kg, Pa.
 */

/** Fluid property presets */
export const FLUIDS = {
  'Water 20 °C':    { rho: 998,  mu: 1.002e-3 },
  'Water 40 °C':    { rho: 992,  mu: 0.653e-3 },
  'Water 60 °C':    { rho: 983,  mu: 0.467e-3 },
  'Water 80 °C':    { rho: 972,  mu: 0.355e-3 },
  'SAE 10 Oil':     { rho: 870,  mu: 65e-3 },
  'SAE 30 Oil':     { rho: 890,  mu: 200e-3 },
  'Glycerin':       { rho: 1260, mu: 1.412 },
  'Air 20 °C':      { rho: 1.204, mu: 1.825e-5 },
  'Mercury':        { rho: 13546, mu: 1.526e-3 },
}

/** Pipe roughness presets (m) */
export const ROUGHNESS = {
  'Smooth (glass/plastic)': 0.0,
  'Drawn tubing':           0.0015e-3,
  'Commercial steel':       0.045e-3,
  'Galvanized iron':        0.15e-3,
  'Cast iron':              0.26e-3,
  'Concrete':               1.0e-3,
  'Riveted steel':          3.0e-3,
}

const g = 9.81

/** Reynolds number */
export function reynolds(rho, V, D, mu) {
  return (rho * V * D) / mu
}

/** Velocity from flow rate */
export function velocity(Q, D) {
  return Q / (Math.PI * D * D / 4)
}

/** Laminar friction factor */
export function fLaminar(Re) {
  return 64 / Re
}

/**
 * Colebrook-White (iterative) — turbulent friction factor.
 * 1/√f = −2 log₁₀(ε/(3.7D) + 2.51/(Re√f))
 */
export function fColebrook(Re, eps, D) {
  if (Re < 2300) return fLaminar(Re)
  // Swamee-Jain initial guess
  const eD = eps / D
  let f = 0.25 / Math.pow(Math.log10(eD / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2)
  for (let i = 0; i < 50; i++) {
    const rhs = -2.0 * Math.log10(eD / 3.7 + 2.51 / (Re * Math.sqrt(f)))
    const fNew = 1.0 / (rhs * rhs)
    if (Math.abs(fNew - f) < 1e-10) break
    f = fNew
  }
  return f
}

/** Swamee-Jain explicit approximation */
export function fSwameeJain(Re, eps, D) {
  if (Re < 2300) return fLaminar(Re)
  const eD = eps / D
  return 0.25 / Math.pow(Math.log10(eD / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2)
}

/** Darcy-Weisbach head loss (m) */
export function headLossDW(f, L, D, V) {
  return f * (L / D) * (V * V) / (2 * g)
}

/** Hagen-Poiseuille pressure drop for laminar flow (Pa) */
export function dpHagenPoiseuille(mu, L, Q, D) {
  return (128 * mu * L * Q) / (Math.PI * Math.pow(D, 4))
}

/** Pressure drop from head loss (Pa) */
export function headToPressure(hL, rho) {
  return rho * g * hL
}

/** Flow regime string */
export function flowRegime(Re) {
  if (Re < 2300) return 'Laminar'
  if (Re < 4000) return 'Transitional'
  return 'Turbulent'
}

/**
 * Full solve: given operating conditions, return all results.
 */
export function solvePipeFriction({ Q, D, L, eps, rho, mu }) {
  const A = Math.PI * D * D / 4
  const V = Q / A
  const Re = reynolds(rho, V, D, mu)
  const regime = flowRegime(Re)
  const fLam = fLaminar(Re)
  const fTurb = fColebrook(Re, eps, D)
  const fSJ = fSwameeJain(Re, eps, D)
  const f = Re < 2300 ? fLam : fTurb
  const hf = headLossDW(f, L, D, V)
  const dp = headToPressure(hf, rho)
  const dpHP = dpHagenPoiseuille(mu, L, Q, D)
  const wallShear = dp * D / (4 * L) // τ_w = ΔP·D/(4L)
  const power = dp * Q               // Pumping power W = ΔP·Q

  return {
    Q, D, L, eps, rho, mu, A, V, Re, regime,
    fLam, fTurb, fSJ, f, hf, dp, dpHP, wallShear, power,
    relRough: eps / D,
  }
}

/**
 * Generate Moody diagram data points.
 * Returns { laminar: [{Re, f}], turbulent: [{Re, f, eD}] }
 */
export function moodyData() {
  const laminar = []
  for (let re = 500; re <= 2300; re += 100) {
    laminar.push({ Re: re, f: 64 / re })
  }

  const eDs = [0, 1e-6, 1e-5, 5e-5, 1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2, 2e-2, 5e-2]
  const turbulent = eDs.map(eD => {
    const pts = []
    for (let logRe = Math.log10(4000); logRe <= 8; logRe += 0.1) {
      const Re = Math.pow(10, logRe)
      const D = 1 // normalize
      const eps = eD * D
      const f = fColebrook(Re, eps, D)
      pts.push({ Re, f })
    }
    return { eD, points: pts }
  })

  return { laminar, turbulent }
}
