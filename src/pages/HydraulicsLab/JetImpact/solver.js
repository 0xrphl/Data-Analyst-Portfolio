/**
 * EXPERIMENTO N° 6: IMPACTO DE UN CHORRO SOBRE ÁLABES
 * Solver y modelo matemático basado en la guía técnica y formato de laboratorio.
 */

export const GRAVITY = 9.81
export const D_JET_FIXED_M = 0.008 // 8 mm fijo
export const DISTANCE_JET_VANE_M = 0.020 // 20 mm
export const JET_AREA_M2 = (Math.PI * D_JET_FIXED_M * D_JET_FIXED_M) / 4 // ~5.0265e-5 m²
export const RHO_WATER = 1000 // kg/m³

export const AVAILABLE_WEIGHTS = [5, 10, 20, 50, 100] // gramos

export const VANE_CONFIGS = {
  vane_90: {
    id: 'vane_90',
    angleDeg: 90,
    angleRad: Math.PI / 2,
    name: 'Álabe Plano (90°)',
    shortName: 'Plano 90°',
    tableTitle: 'Tabla 6.1 Superficie de impacto α = 90° (Plana)',
    cosAlpha: Math.cos(Math.PI / 2),
    kFactor: 1.0,
    guideFactor: 1.0,
    formulaTex: 'F_{\\text{TEO}} = \\frac{\\rho Q^2}{A}',
    efficiencyTex: '\\eta = \\left(\\frac{F_{\\text{exp}}}{2\\,\\frac{\\rho Q^2}{A}}\\right) \\times 100\\%',
  },
  vane_102: {
    id: 'vane_102',
    angleDeg: 102,
    angleRad: (102 * Math.PI) / 180,
    name: 'Álabe Curvo (102°)',
    shortName: 'Curvo 102°',
    tableTitle: 'Tabla 6.2 Superficie de impacto α = 102° (Curva)',
    cosAlpha: Math.cos((102 * Math.PI) / 180),
    kFactor: 1 - Math.cos((102 * Math.PI) / 180),
    guideFactor: 1.2,
    formulaTex: 'F_{\\text{TEO}} = 1.2\\,\\frac{\\rho Q^2}{A}',
    efficiencyTex: '\\eta = \\left(\\frac{F_{\\text{exp}}}{2\\,\\frac{\\rho Q^2}{A}}\\right) \\times 100\\%',
  },
  vane_180: {
    id: 'vane_180',
    angleDeg: 180,
    angleRad: Math.PI,
    name: 'Álabe Semiesférico (180°)',
    shortName: 'Semiesférico 180°',
    tableTitle: 'Tabla 6.3 Superficie de impacto α = 180° (Curva)',
    cosAlpha: Math.cos(Math.PI),
    kFactor: 2.0,
    guideFactor: 2.0,
    formulaTex: 'F_{\\text{TEO}} = 2\\,\\frac{\\rho Q^2}{A}',
    efficiencyTex: '\\eta = \\left(\\frac{F_{\\text{exp}}}{2\\,\\frac{\\rho Q^2}{A}}\\right) \\times 100\\%',
  },
}


/**
 * Resuelve el modelo hidrodinámico y experimental de impacto de chorro.
 */
export function solveJetImpactLab({
  Q_Lmin = 10,
  vaneKey = 'vane_90',
  totalMass_g = 50,
  volumenL = 5.0,
  rho = RHO_WATER,
}) {
  const vane = VANE_CONFIGS[vaneKey] || VANE_CONFIGS.vane_90
  const D = D_JET_FIXED_M
  const A = JET_AREA_M2
  const s = DISTANCE_JET_VANE_M

  const Q_m3s = (Q_Lmin / 60) * 1e-3
  const Q_Ls = Q_Lmin / 60

  // Velocidad a la salida de la tobera (V0 = Q / A)
  const V0 = Q_m3s > 0 ? Q_m3s / A : 0

  // Velocidad al nivel del álabe (conservación de Bernoulli con distancia s = 20 mm)
  const v1Square = V0 * V0 - 2 * GRAVITY * s
  const V1 = v1Square > 0 ? Math.sqrt(v1Square) : 0

  const massFlow = rho * Q_m3s

  // Fuerza teórica según la expresión analítica de la guía del laboratorio:
  // FTEO = guideFactor * (ρ * Q^2) / A
  const Fteo_guide = A > 0 ? (vane.guideFactor * rho * Math.pow(Q_m3s, 2)) / A : 0
  const Fteo_analytic = A > 0 ? (vane.kFactor * rho * Math.pow(Q_m3s, 2)) / A : 0
  const Fteo = Fteo_guide

  // Fuerza experimental por contrapesos: Fexp = m * g
  const mass_kg = totalMass_g / 1000
  const Fexp = mass_kg * GRAVITY

  // Máxima fuerza teórica (álabe de 180° = 2 * ρ * Q^2 / A)
  const Fmax_possible = A > 0 ? (2 * rho * Math.pow(Q_m3s, 2)) / A : 1e-9

  // Eficiencia según guía: η = [ Fexp / (2 * (ρ * Q^2) / A) ] * 100%
  const efficiency = Fmax_possible > 0 ? (Fexp / Fmax_possible) * 100 : 0

  // Tiempo de aforo volumétrico: t = ∀ / Q
  const vol_m3 = volumenL * 1e-3
  const time_s = Q_m3s > 0 ? vol_m3 / Q_m3s : 0

  // Detección de nivelación / equilibrio (99% - 100% de igualdad)
  let balancePercent = 0
  let isBalanced = false
  let balanceStatus = 'unbalanced' // 'balanced' | 'under' | 'over'

  if (Fexp > 0 && Fteo > 0) {
    balancePercent = (Math.min(Fexp, Fteo) / Math.max(Fexp, Fteo)) * 100
    if (balancePercent >= 99.0) {
      isBalanced = true
      balanceStatus = 'balanced'
    } else if (Fteo < Fexp) {
      balanceStatus = 'under'
    } else {
      balanceStatus = 'over'
    }
  } else if (Fexp === 0 && Fteo === 0) {
    balancePercent = 100
    isBalanced = true
    balanceStatus = 'balanced'
  } else if (Fexp > 0 && Fteo === 0) {
    balancePercent = 0
    balanceStatus = 'under'
  } else {
    balancePercent = 0
    balanceStatus = 'over'
  }

  // Desplazamiento dinámico vertical para la escena 3D (metros)
  let displacementY = 0
  if (Fexp > 0 || Fteo > 0) {
    const netForce = Fteo - Fexp
    const kStiffness = 40.0
    displacementY = Math.max(-0.035, Math.min(0.035, netForce / kStiffness))
    if (isBalanced) {
      displacementY = 0
    }
  }

  const errorPercent = Fteo > 0 && Fexp > 0 ? (Math.abs(Fexp - Fteo) / Fteo) * 100 : null

  // Caudal necesario para equilibrar la masa exactamente al 100%
  let Q_equilibrium_Lmin = 0
  if (Fexp > 0 && vane.guideFactor > 0 && rho > 0) {
    const Q_eq_m3s = Math.sqrt((Fexp * A) / (vane.guideFactor * rho))
    Q_equilibrium_Lmin = Q_eq_m3s * 60 * 1000
  }

  return {
    vaneKey,
    vane,
    vaneName: vane.name,
    shortName: vane.shortName,
    angleDeg: vane.angleDeg,
    kFactor: vane.kFactor,
    guideFactor: vane.guideFactor,
    D,
    A,
    s,
    rho,
    Q_Lmin,
    Q_Ls,
    Q_m3s,
    V0,
    V1,
    massFlow,
    totalMass_g,
    mass_kg,
    Fexp,
    Fteo,
    Fteo_guide,
    Fteo_analytic,
    Fmax_possible,
    efficiency,
    volumenL,
    time_s,
    balancePercent,
    isBalanced,
    balanceStatus,
    displacementY,
    errorPercent,
    Q_equilibrium_Lmin,
  }
}

