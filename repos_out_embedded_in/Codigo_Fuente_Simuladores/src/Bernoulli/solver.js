/**
 * solver.js
 * Solucionador hidrodinámico avanzado para el medidor Venturi y Sonda Pitot (Teorema de Bernoulli)
 * Basado en el Banco Hidráulico Edibon FME-03 / UTP y tablas termofísicas (IAPWS-IF97, NIST, ASTM D341).
 */

export const g = 9.81
export const RHO_REF_WATER_20C = 998.21 // kg/m³ (Agua pura a 20 °C según IAPWS-IF97)
export const PMMA_ROUGHNESS_M = 1.5e-6  // Rugosidad absoluta del acrílico PMMA [m]

/**
 * Tabla Termofísica Oficial de Líquidos a Distintas Temperaturas (IAPWS-IF97 / NIST / ASTM D341)
 */
export const FLUIDS = {
  // 1. Agua Pura Destilada (IAPWS-IF97) — 4 Temperaturas
  'Agua Pura — 10 °C (ρ = 999.70 kg/m³)': { family: 'Agua Pura (IAPWS-IF97)', tempC: 10, rho: 999.70, mu: 1.307e-3, color: '#0288d1', meniscusColor: '#4fc3f7' },
  'Agua Pura — 20 °C (ρ = 998.21 kg/m³)': { family: 'Agua Pura (IAPWS-IF97)', tempC: 20, rho: 998.21, mu: 1.002e-3, color: '#0288d1', meniscusColor: '#4fc3f7' },
  'Agua Pura — 40 °C (ρ = 992.22 kg/m³)': { family: 'Agua Pura (IAPWS-IF97)', tempC: 40, rho: 992.22, mu: 0.653e-3, color: '#039be5', meniscusColor: '#81d4fa' },
  'Agua Pura — 60 °C (ρ = 983.20 kg/m³)': { family: 'Agua Pura (IAPWS-IF97)', tempC: 60, rho: 983.20, mu: 0.467e-3, color: '#00acc1', meniscusColor: '#84ffff' },

  // 2. Líquido Adicional 1: Aceite Hidráulico SAE 10W (ASTM D341) — 3 Temperaturas
  'Aceite SAE 10W — 20 °C (ρ = 876.0 kg/m³)': { family: 'Aceite SAE 10W (ASTM)', tempC: 20, rho: 876.00, mu: 100.0e-3, color: '#f57f17', meniscusColor: '#ffd54f' },
  'Aceite SAE 10W — 40 °C (ρ = 864.0 kg/m³)': { family: 'Aceite SAE 10W (ASTM)', tempC: 40, rho: 864.00, mu: 31.5e-3,  color: '#fb8c00', meniscusColor: '#ffe082' },
  'Aceite SAE 10W — 60 °C (ρ = 852.0 kg/m³)': { family: 'Aceite SAE 10W (ASTM)', tempC: 60, rho: 852.00, mu: 13.8e-3,  color: '#ffa000', meniscusColor: '#ffecb3' },

  // 3. Líquido Adicional 2: Alcohol Etílico / Etanol Anhidro (NIST) — 3 Temperaturas
  'Etanol (Alcohol) — 20 °C (ρ = 789.3 kg/m³)': { family: 'Etanol Anhidro (NIST)', tempC: 20, rho: 789.30, mu: 1.194e-3, color: '#00bfa5', meniscusColor: '#64ffda' },
  'Etanol (Alcohol) — 40 °C (ρ = 772.0 kg/m³)': { family: 'Etanol Anhidro (NIST)', tempC: 40, rho: 772.00, mu: 0.834e-3, color: '#1de9b6', meniscusColor: '#a7ffeb' },
  'Etanol (Alcohol) — 60 °C (ρ = 754.1 kg/m³)': { family: 'Etanol Anhidro (NIST)', tempC: 60, rho: 754.10, mu: 0.592e-3, color: '#00e676', meniscusColor: '#b9f6ca' },

  // 4. Líquido Adicional 3: Glicerina Líquida Pura (USP / NIST) — 3 Temperaturas
  'Glicerina Pura — 20 °C (ρ = 1261.1 kg/m³)': { family: 'Glicerina Pura (USP)', tempC: 20, rho: 1261.10, mu: 1412.0e-3, color: '#8e24aa', meniscusColor: '#ea80fc' },
  'Glicerina Pura — 40 °C (ρ = 1249.0 kg/m³)': { family: 'Glicerina Pura (USP)', tempC: 40, rho: 1249.00, mu: 284.0e-3,  color: '#ab47bc', meniscusColor: '#f3e5f5' },
  'Glicerina Pura — 60 °C (ρ = 1236.0 kg/m³)': { family: 'Glicerina Pura (USP)', tempC: 60, rho: 1236.00, mu: 81.3e-3,   color: '#ba68c8', meniscusColor: '#f8bbd0' },

  // 5. Agua de Mar Estándar (IAPSO 35 PSU) — 3 Temperaturas
  'Agua de Mar — 10 °C (ρ = 1026.9 kg/m³)': { family: 'Agua de Mar (IAPSO 35‰)', tempC: 10, rho: 1026.90, mu: 1.390e-3, color: '#1565c0', meniscusColor: '#64b5f6' },
  'Agua de Mar — 20 °C (ρ = 1024.8 kg/m³)': { family: 'Agua de Mar (IAPSO 35‰)', tempC: 20, rho: 1024.80, mu: 1.077e-3, color: '#1976d2', meniscusColor: '#90caf9' },
  'Agua de Mar — 40 °C (ρ = 1018.0 kg/m³)': { family: 'Agua de Mar (IAPSO 35‰)', tempC: 40, rho: 1018.00, mu: 0.710e-3, color: '#1e88e5', meniscusColor: '#bbdefb' },
}

export const DEFAULT_FLUID_KEY = 'Agua Pura — 20 °C (ρ = 998.21 kg/m³)'

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
 * Factor de fricción de Darcy-Weisbach mediante la ecuación universal de Churchill (1977)
 */
export function computeDarcyFrictionFactor(Re, D, eps = PMMA_ROUGHNESS_M) {
  if (Re <= 1e-6) return 0
  if (Re < 10) return 64 / Math.max(Re, 1)
  const relRough = Math.max(0, eps / Math.max(D, 1e-5))
  const A_term = Math.pow(-2.457 * Math.log(Math.pow(7 / Re, 0.9) + 0.27 * relRough), 16)
  const B_term = Math.pow(37530 / Re, 16)
  const f = 8 * Math.pow(Math.pow(8 / Re, 12) + 1 / Math.pow(A_term + B_term, 1.5), 1 / 12)
  return Math.min(Math.max(f, 0.008), 2.5)
}

/**
 * Factor de relación de velocidad en el eje central (u_max / V_media) para la Sonda Pitot
 */
export function computeCenterlineVelocityFactor(Re) {
  if (Re <= 0) return 1.1537
  if (Re < 2000) {
    return 1.1537 + 0.22 * (1 - Re / 2000)
  }
  const f = computeDarcyFrictionFactor(Re, 0.015)
  return Math.max(1.11, Math.min(1.38, 1 + 1.10 * Math.sqrt(Math.max(f, 0.01))))
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
 * Resuelve el balance de energía de Bernoulli, efectos termofísicos (ρ(T), μ(T)),
 * pérdidas viscosas de Darcy-Weisbach + expansión gradual de Gibson, y conservación de masa.
 */
export function solveBernoulli({
  Q,
  taps,
  rho = RHO_REF_WATER_20C,
  mu = 1.002e-3,
  alpha = 1.0,
  h0_m = 0.240,
  pitotIndex = 3,
  useRealLosses = true,
}) {
  if (!taps || taps.length === 0) return []

  const safeRho = Math.max(rho || RHO_REF_WATER_20C, 1e-3)
  const safeMu = Math.max(mu || 1.002e-3, 1e-7)
  const nu = safeMu / safeRho // Viscosidad cinemática ν = μ / ρ [m²/s]
  const gamma = safeRho * g   // Peso específico γ = ρ·g [N/m³]

  // Presión manométrica suministrada por la bomba en la entrada S0:
  // P0_supply = γ_ref(Agua 20°C) * h0_m -> La columna real del fluido a su densidad ρ(T) es h0_fluid = P0_supply / (ρ(T)*g)
  const P0_supply = RHO_REF_WATER_20C * g * h0_m
  const h0_fluid_m = P0_supply / gamma

  const V0 = Q / taps[0].A
  const hv0 = alpha * (V0 * V0) / (2 * g)
  const H0_total = h0_fluid_m + hv0

  // Cálculo acumulativo de pérdidas de carga reales tramo a tramo (S0 -> S1 -> ... -> S6)
  const cumulativeHeadLoss = new Array(taps.length).fill(0)

  if (useRealLosses) {
    let runningLoss = 0
    for (let i = 1; i < taps.length; i++) {
      const prev = taps[i - 1]
      const curr = taps[i]
      const dx = Math.max(1e-4, Math.abs(curr.x - prev.x))
      const Dm = 0.5 * (prev.D + curr.D)
      const Vprev = Q / prev.A
      const Vcurr = Q / curr.A
      const Vm = 0.5 * (Vprev + Vcurr)
      const Rem = (safeRho * Vm * Dm) / safeMu

      // 1. Pérdida por fricción de pared en conducto corto (acotada por desarrollo de capa límite de entrada)
      const fRaw = computeDarcyFrictionFactor(Rem, Dm)
      const fEffective = Math.min(fRaw, 0.14)
      const hf_seg = 0.35 * fEffective * (dx / Dm) * ((Vm * Vm) / (2 * g))

      // 2. Pérdida secundaria por cambio de sección (Borda-Carnot / Gibson acotado físicamente K <= 0.65)
      let hForm_seg = 0
      if (curr.A > prev.A) {
        const dR = 0.5 * (curr.D - prev.D)
        const halfAngleRad = Math.atan2(dR, dx)
        const fullAngleDeg = (2 * halfAngleRad * 180) / Math.PI
        const angleFactor = Math.min(0.45, Math.max(0.13, 0.14 + 0.008 * fullAngleDeg))
        // En régimen laminar/viscoso la separación en el difusor incrementa K gradualmente (acotado por Borda-Carnot)
        const viscFactor = 1 + 0.85 / Math.pow(1 + Rem / 1200, 0.65)
        const K_diff = Math.min(0.72, angleFactor * viscFactor)
        const dV2 = Math.max(0, (Vprev * Vprev) - (Vcurr * Vcurr))
        hForm_seg = K_diff * (dV2 / (2 * g))
      } else if (curr.A < prev.A) {
        // Tobera convergente lisa: coeficiente de pérdida muy bajo (Cv ≈ 0.98 - 0.99)
        const K_noz = Math.min(0.06, 0.012 + 0.035 / Math.pow(1 + Rem / 1500, 0.6))
        const dV2 = Math.max(0, (Vcurr * Vcurr) - (Vprev * Vprev))
        hForm_seg = K_noz * (dV2 / (2 * g))
      }

      runningLoss += Math.max(0, hf_seg + hForm_seg)
      cumulativeHeadLoss[i] = runningLoss
    }
  }

  return taps.map((tap, i) => {
    const V = Q / tap.A
    const Re = (safeRho * V * tap.D) / safeMu
    const fDarcy = computeDarcyFrictionFactor(Re, tap.D)
    const velocityHead = alpha * (V * V) / (2 * g)
    const dynamicP = 0.5 * safeRho * V * V

    const headLoss = useRealLosses ? cumulativeHeadLoss[i] : 0
    const totalHead = H0_total - headLoss
    const pressureHead = totalHead - velocityHead
    const P = pressureHead * gamma
    const pressureHead_mmH2O = (P / (RHO_REF_WATER_20C * g)) * 1000

    const centerlineVelocityFactor = computeCenterlineVelocityFactor(Re)
    const Vpitot_real = V * centerlineVelocityFactor
    const pitotDynamicHead_calc = (Vpitot_real * Vpitot_real) / (2 * g)

    const isPitotLocation = i === pitotIndex
    const stagnationHead = pressureHead + pitotDynamicHead_calc
    const stagnationP = P + (0.5 * safeRho * Vpitot_real * Vpitot_real)

    const pitotDeltaH = stagnationHead - pressureHead
    const Vpitot = Math.sqrt(Math.max(0, 2 * g * pitotDeltaH))
    const Qpitot = tap.A * Vpitot

    return {
      ...tap,
      rho: safeRho,
      mu: safeMu,
      nu,
      gamma,
      V,
      velocityHead,
      velocityHead_mm: velocityHead * 1000,
      pressureHead,
      pressureHead_mm: pressureHead * 1000,
      pressureHead_mmH2O,
      totalHead,
      totalHead_mm: totalHead * 1000,
      headLoss,
      headLoss_mm: headLoss * 1000,
      P,
      dynamicP,
      Re,
      fDarcy,
      isPitotLocation,
      stagnationHead,
      stagnationHead_mm: stagnationHead * 1000,
      stagnationP,
      pitotDeltaH,
      pitotDeltaH_mm: pitotDeltaH * 1000,
      Vpitot,
      Qpitot,
      Qpitot_Ls: Qpitot * 1000,
      centerlineFactor: centerlineVelocityFactor,
    }
  })
}

/**
 * Calcula el estado hidráulico completo de la sonda Pitot en cualquier posición normalizada xNorm ∈ [0, 1]
 */
export function solvePitotAtPosition({
  xNorm = 0.56,
  tapResults = [],
  Q = 0.0001667,
  rho = RHO_REF_WATER_20C,
  mu = 1.002e-3,
  alpha = 1.0,
  Ltotal = 0.45,
}) {
  if (!tapResults || tapResults.length === 0) {
    return null
  }
  const safeRho = Math.max(rho || RHO_REF_WATER_20C, 1e-3)
  const safeMu = Math.max(mu || 1.002e-3, 1e-7)
  const clampedT = Math.max(0, Math.min(1, xNorm))

  let nearestTap = tapResults[0]
  let minDist = Math.abs(clampedT - tapResults[0].xNorm)
  for (let i = 1; i < tapResults.length; i++) {
    const d = Math.abs(clampedT - tapResults[i].xNorm)
    if (d < minDist) {
      minDist = d
      nearestTap = tapResults[i]
    }
  }

  if (minDist < 0.008) {
    return {
      ...nearestTap,
      xNorm: nearestTap.xNorm,
      x: nearestTap.xNorm * Ltotal,
      isExactSection: true,
      sectionLabel: nearestTap.name,
      nearestSectionName: nearestTap.name,
      centerlineFactor: nearestTap.centerlineFactor ?? computeCenterlineVelocityFactor(nearestTap.Re),
    }
  }

  let segIdx = 0
  for (let j = 0; j < tapResults.length - 1; j++) {
    if (clampedT >= tapResults[j].xNorm && clampedT <= tapResults[j + 1].xNorm) {
      segIdx = j
      break
    }
  }
  const t0 = tapResults[segIdx]
  const t1 = tapResults[Math.min(segIdx + 1, tapResults.length - 1)]
  const span = Math.max(1e-9, t1.xNorm - t0.xNorm)
  const frac = Math.max(0, Math.min(1, (clampedT - t0.xNorm) / span))
  const s = frac * frac * (3 - 2 * frac)

  const r = (t0.D / 2) + ((t1.D / 2) - (t0.D / 2)) * s
  const D = r * 2
  const A = Math.PI * r * r
  const V = A > 0 ? Q / A : 0
  const velocityHead = alpha * (V * V) / (2 * g)
  const dynamicP = 0.5 * safeRho * V * V

  const totalHead = t0.totalHead + (t1.totalHead - t0.totalHead) * s
  const headLoss = t0.headLoss + (t1.headLoss - t0.headLoss) * s
  const pressureHead = totalHead - velocityHead
  const P = pressureHead * safeRho * g
  const Re = (safeRho * V * D) / safeMu

  const centerlineVelocityFactor = computeCenterlineVelocityFactor(Re)
  const Vpitot_real = V * centerlineVelocityFactor
  const pitotDynamicHead_calc = (Vpitot_real * Vpitot_real) / (2 * g)
  const stagnationHead = pressureHead + pitotDynamicHead_calc
  const stagnationP = P + 0.5 * safeRho * Vpitot_real * Vpitot_real
  const pitotDeltaH = stagnationHead - pressureHead
  const Vpitot = Math.sqrt(Math.max(0, 2 * g * pitotDeltaH))
  const Qpitot = A * Vpitot

  return {
    index: nearestTap.index,
    id: `X_${(clampedT * 100).toFixed(0)}`,
    name: `${t0.name}→${t1.name}`,
    label: `${t0.name}–${t1.name} (${(clampedT * Ltotal * 1000).toFixed(0)} mm)`,
    sectionLabel: `${t0.name}–${t1.name}`,
    nearestSectionName: nearestTap.name,
    isExactSection: false,
    xNorm: clampedT,
    x: clampedT * Ltotal,
    rho: safeRho,
    mu: safeMu,
    A,
    A_mm2: A * 1e6,
    D,
    D_mm: D * 1000,
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
    isPitotLocation: true,
    stagnationHead,
    stagnationHead_mm: stagnationHead * 1000,
    stagnationP,
    pitotDeltaH,
    pitotDeltaH_mm: pitotDeltaH * 1000,
    Vpitot,
    Qpitot,
    Qpitot_Ls: Qpitot * 1000,
    centerlineFactor: centerlineVelocityFactor,
  }
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
  if (Math.abs(m2_minus_1) > 1e-6 && deltaH > 0) {
    Q_teorico = A0 * Math.sqrt((2 * g * deltaH) / Math.abs(m2_minus_1))
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
