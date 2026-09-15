/**
 * solver.js
 * Solucionador hidrodinámico para el medidor Venturi y Sonda Pitot (Demostración Teorema de Bernoulli)
 * Basado en los datos y geometría del Banco Hidráulico Edibon FME-03 / UTP Laboratorio de Hidráulica.
 */

export const g = 9.81

export const FLUIDS = {
  'Agua 20 °C (ρ = 1000 kg/m³)': { rho: 1000, mu: 1.002e-3 },
  'Agua 40 °C (ρ = 992 kg/m³)':  { rho: 992,  mu: 0.653e-3 },
  'Aceite SAE 10':              { rho: 870,  mu: 65e-3 },
  'Aire 20 °C':                 { rho: 1.204, mu: 1.825e-5 },
}

/** Áreas por defecto de la sección del tubo Venturi (Banco FME-03) [mm²] */
export const DEFAULT_AREAS_MM2 = [490.87, 78.54, 88.41, 98.87, 121.73, 174.35, 490.87]

/** Convierte Área [m²] a Diámetro circular equivalente [m] */
export function diamFromArea(A) {
  return Math.sqrt((4 * A) / Math.PI)
}

/** Convierte Diámetro [m] a Área circular [m²] */
export function areaFromDiam(D) {
  return (Math.PI * D * D) / 4
}


/**
 * Genera la geometría discreta de las 7 secciones de prueba (S0 a S6)
 */
export function venturiGeometryFromAreas({ areas_mm2 = DEFAULT_AREAS_MM2, Ltotal = 0.45 }) {
  const normPositions = [0.0, 0.28, 0.42, 0.56, 0.70, 0.84, 1.0]

  return areas_mm2.map((A_mm2, i) => {
    const A = A_mm2 * 1e-6 // m²
    const D = diamFromArea(A) // m
    const xNorm = normPositions[i] ?? i / (areas_mm2.length - 1)
    const x = xNorm * Ltotal
    return {
      index: i,
      id: `S${i}`,
      name: `S${i}`,
      label: `S${i}`,
      x,
      xNorm,
      A,
      A_mm2,
      D,
      D_mm: D * 1000,
    }
  })
}

/**
 * Función de interpolación continua de radio para el mallado 3D del tubo Venturi
 */
export function getInterpolatedRadius(t, taps) {
  const clampedT = Math.max(0, Math.min(1, t))
  if (!taps || taps.length === 0) return 0.0125
  if (taps.length === 1) return taps[0].D / 2

  for (let i = 0; i < taps.length - 1; i++) {
    const t0 = taps[i].xNorm
    const t1 = taps[i + 1].xNorm
    if (clampedT >= t0 && clampedT <= t1) {
      const frac = t1 > t0 ? (clampedT - t0) / (t1 - t0) : 0
      const s = frac * frac * (3 - 2 * frac)
      const r0 = taps[i].D / 2
      const r1 = taps[i + 1].D / 2
      return r0 + (r1 - r0) * s
    }
  }
  return taps[taps.length - 1].D / 2
}

/**
 * Resuelve el balance de energía de Bernoulli y la conservación de masa
 */
export function solveBernoulli({
  Q,
  taps,
  rho = 1000,
  mu = 1.002e-3,
  alpha = 1.0,
  h0_m = 0.240,
  pitotIndex = 3,
  useRealLosses = true,
}) {
  const V0 = Q / taps[0].A
  const hv0 = alpha * (V0 * V0) / (2 * g)
  const H0_total = h0_m + hv0

  const diffuserLossWeights = [0.0, 0.05, 0.25, 0.50, 0.75, 0.90, 1.0]
  const Vthroat = taps[1] ? Q / taps[1].A : V0
  const Vexit = taps[taps.length - 1] ? Q / taps[taps.length - 1].A : V0
  const totalDiffuserLoss_m = useRealLosses
    ? Math.max(0, 0.25 * ((Vthroat * Vthroat) - (Vexit * Vexit)) / (2 * g))
    : 0

  return taps.map((tap, i) => {
    const V = Q / tap.A
    const velocityHead = alpha * (V * V) / (2 * g)
    const dynamicP = 0.5 * rho * V * V

    const headLoss = useRealLosses ? (diffuserLossWeights[i] || 0) * totalDiffuserLoss_m : 0
    const totalHead = H0_total - headLoss
    const pressureHead = totalHead - velocityHead
    const P = pressureHead * rho * g
    const Re = (rho * V * tap.D) / (mu || 1.002e-3)

    const centerlineVelocityFactor = 1.1537
    const Vpitot_real = V * centerlineVelocityFactor
    const pitotDynamicHead_calc = (Vpitot_real * Vpitot_real) / (2 * g)

    const isPitotLocation = i === pitotIndex
    const stagnationHead = pressureHead + pitotDynamicHead_calc
    const stagnationP = P + (0.5 * rho * Vpitot_real * Vpitot_real)

    const pitotDeltaH = stagnationHead - pressureHead
    const Vpitot = Math.sqrt(Math.max(0, 2 * g * pitotDeltaH))
    const Qpitot = tap.A * Vpitot

    return {
      ...tap,
      V,
      velocityHead,
      velocityHead_mm: velocityHead * 1000,
      pressureHead,
      pressureHead_mm: pressureHead * 1000,
      totalHead,
      totalHead_mm: totalHead * 1000,
      headLoss,
      headLoss_mm: headLoss * 1000,
      P,
      dynamicP,
      Re,
      isPitotLocation,
      stagnationHead,
      stagnationHead_mm: stagnationHead * 1000,
      stagnationP,
      pitotDeltaH,
      pitotDeltaH_mm: pitotDeltaH * 1000,
      Vpitot,
      Qpitot,
      Qpitot_Ls: Qpitot * 1000,
    }
  })
}

/**
 * Calcula el caudal teórico ideal y coeficiente de descarga Cd mediante Ecuación 3.17
 */
export function computeVenturiTheoreticalFlow(tap0, tap3, Q_real) {
  if (!tap0 || !tap3) return { m: 1, m2_minus_1: 0, deltaH: 0, deltaH_mm: 0, Q_teorico: 0, Q_teorico_Ls: 0, Cd: 0, errorPorcentual: 0 }
  const A0 = tap0.A
  const A3 = tap3.A
  const m = A0 / A3
  const m2_minus_1 = m * m - 1
  const deltaH = Math.max(0, tap0.pressureHead - tap3.pressureHead)

  let Q_teorico = 0
  if (m2_minus_1 > 0 && deltaH > 0) {
    Q_teorico = A0 * Math.sqrt((2 * g * deltaH) / m2_minus_1)
  }

  const Cd = Q_teorico > 0 ? Q_real / Q_teorico : 0
  const errorPorcentual = Q_real > 0 ? (Math.abs(Q_real - Q_teorico) / Q_real) * 100 : 0

  return {
    m,
    m2_minus_1,
    deltaH,
    deltaH_mm: deltaH * 1000,
    Q_teorico,
    Q_teorico_Ls: Q_teorico * 1000,
    Cd,
    errorPorcentual,
  }
}
