/**
 * solver.js
 * Solucionador fisico-matematico de Hidrostatica Avanzada (Nivel Doctoral / PhD).
 */

export const GRAVITY = 9.80665

export const FLUID_PRESETS = {
  water_20:     { name: 'Agua pura (20 °C)',        rho: 998.2,  color: '#29b6f6' },
  seawater:     { name: 'Agua de mar estándar',     rho: 1025.0, color: '#0288d1' },
  oil_crude:    { name: 'Petróleo crudo ligero',    rho: 850.0,  color: '#f57f17' },
  glycerin:     { name: 'Glicerina pura (100 %)',    rho: 1260.0, color: '#ab47bc' },
  mercury:      { name: 'Mercurio líquido (Hg)',    rho: 13546.0,color: '#78909c' },
  custom:       { name: 'Fluido Personalizado',     rho: 1000.0, color: '#00e5ff' },
}

export const WALL_GEOMETRIES = {
  flat_vertical: {
    id: 'flat_vertical',
    name: 'Pared Plana Vertical',
    type: 'linear',
    description: 'Compuerta vertical clásica. Presión triangular p(y) = ρ·g·(h - y). Centro de presiones a 2/3 de profundidad.',
  },
  flat_inclined: {
    id: 'flat_inclined',
    name: 'Pared Plana Inclinada (θ)',
    type: 'inclined',
    description: 'Superficie plana con ángulo de inclinación θ respecto a la horizontal. F_R normal a la compuerta.',
  },
  circular_cylindrical: {
    id: 'circular_cylindrical',
    name: 'Compuerta Radial Cilíndrica',
    type: 'curved',
    description: 'Arco cilíndrico de radio R. Las fuerzas normales pasan siempre por el centro de curvatura.',
  },
  parabolic: {
    id: 'parabolic',
    name: 'Pared Parabólica (y = a·x²)',
    type: 'curved',
    description: 'Perfil parabólico cuadrático. Integra peso del volumen superior e hidrostática horizontal.',
  },
  cubic: {
    id: 'cubic',
    name: 'Pared Cúbica (y = a·x³)',
    type: 'curved',
    description: 'Curvatura no lineal de alto gradiente tangencial. Requiere cuadratura numérica.',
  },
  elliptical: {
    id: 'elliptical',
    name: 'Perfil Elíptico Cuadrantal',
    type: 'curved',
    description: 'Compuerta elíptica con semiejes (a, b). Tensión de membrana y distribución asimétrica.',
  },
}
export const GATE_SHAPES = {
  gate_rectangle: {
    id: 'gate_rectangle',
    name: 'Compuerta Plana Rectangular / Cuadrada',
    description: 'Compuerta estándar b × a. Inercia I_c = (b·a³)/12.',
  },
  gate_circle: {
    id: 'gate_circle',
    name: 'Compuerta Circular',
    description: 'Compuerta cilíndrica/disco de diámetro D. Inercia I_c = (π·D⁴)/64.',
  },
  gate_triangle_down: {
    id: 'gate_triangle_down',
    name: 'Compuerta Triangular (Vértice abajo)',
    description: 'Base b superior, vértice hacia el fondo. CG a 2/3 de la cima, I_c = (b·a³)/36.',
  },
  gate_triangle_up: {
    id: 'gate_triangle_up',
    name: 'Compuerta Triangular (Vértice arriba)',
    description: 'Vértice superior, base b inferior. CG a 1/3 de la base, I_c = (b·a³)/36.',
  },
  gate_ellipse: {
    id: 'gate_ellipse',
    name: 'Compuerta Elíptica',
    description: 'Semiejes a (vertical) y b (horizontal). Inercia I_c = (π·b·a³)/4.',
  },
}


export function solveHydrostatics({
  geometryId = 'flat_vertical',
  rho = 1000,
  h = 2.0,
  gateHeight = 2.5,
  gateWidth = 1.0,
  thetaDeg = 60,
  radius = 2.0,
  shapeParam = 0.5,
  pivotY = 0.0,
  nSegments = 200,
}) {
  const g = GRAVITY
  const gamma = rho * g
  const submergedHeight = Math.min(Math.max(0, h), gateHeight)

  let FH = 0
  let FV = 0
  let FR = 0
  let FR_angle_rad = 0
  let FR_angle_deg = 0

  let xcp = 0
  let ycp = 0
  let xcg = 0
  let ycg = 0

  let momentPivot = 0
  let pMax = gamma * submergedHeight
  let submergedArea = 0

  const samples = []

  if (geometryId === 'flat_vertical') {
    submergedArea = gateWidth * submergedHeight
    ycg = submergedHeight / 2
    xcg = 0

    FH = gamma * (submergedHeight / 2) * submergedArea
    FV = 0
    FR = FH
    FR_angle_rad = 0
    FR_angle_deg = 0

    ycp = submergedHeight / 3
    xcp = 0
    momentPivot = FH * (ycp - pivotY)

    const dy = submergedHeight / nSegments
    for (let i = 0; i <= nSegments; i++) {
      const y = i * dy
      const depth = submergedHeight - y
      const p = gamma * depth
      const dF = p * gateWidth * dy
      samples.push({
        x: 0,
        y,
        depth,
        pressure: p,
        nx: 1,
        ny: 0,
        dF,
        dFx: dF,
        dFy: 0,
      })
    }
  } else if (geometryId === 'flat_inclined') {
    const thetaRad = (thetaDeg * Math.PI) / 180
    const sinTheta = Math.sin(thetaRad)
    const cosTheta = Math.cos(thetaRad)

    const L_sub = submergedHeight / Math.max(0.01, sinTheta)
    submergedArea = gateWidth * L_sub

    const hc = submergedHeight / 2
    ycg = hc
    xcg = (submergedHeight / (2 * sinTheta)) * cosTheta

    FR = gamma * hc * submergedArea
    FH = FR * sinTheta
    FV = -FR * cosTheta
    FR_angle_rad = Math.atan2(Math.abs(FV), FH)
    FR_angle_deg = (FR_angle_rad * 180) / Math.PI

    const l_from_base = L_sub / 3
    ycp = l_from_base * sinTheta
    xcp = l_from_base * cosTheta

    momentPivot = FH * (ycp - pivotY) - Math.abs(FV) * xcp

    const dL = L_sub / nSegments
    for (let i = 0; i <= nSegments; i++) {
      const l = i * dL
      const y = l * sinTheta
      const x = l * cosTheta
      const depth = submergedHeight - y
      const p = gamma * depth
      const dF = p * gateWidth * dL
      samples.push({
        x,
        y,
        depth,
        pressure: p,
        nx: sinTheta,
        ny: -cosTheta,
        dF,
        dFx: dF * sinTheta,
        dFy: -dF * cosTheta,
      })
    }
  } else {
    const dy = submergedHeight / nSegments
    let sumFH = 0
    let sumMomY = 0
    let sumFV = 0
    let sumMomX = 0
    let sumArea = 0
    let sumYcg = 0
    let sumXcg = 0

    const getXFromY = (y) => {
      if (geometryId === 'circular_cylindrical') {
        const R = Math.max(radius, submergedHeight)
        const diff = Math.max(0, R * R - (R - y) * (R - y))
        return Math.sqrt(diff)
      } else if (geometryId === 'parabolic') {
        const a = Math.max(0.05, shapeParam)
        return Math.sqrt(Math.max(0, y / a))
      } else if (geometryId === 'cubic') {
        const a = Math.max(0.05, shapeParam)
        return Math.cbrt(Math.max(0, y / a))
      } else if (geometryId === 'elliptical') {
        const b = Math.max(gateHeight, 1.0)
        const a = Math.max(radius, 1.0)
        const term = Math.max(0, 1 - Math.pow(1 - y / b, 2))
        return a * Math.sqrt(term)
      }
      return 0
    }

    for (let i = 0; i <= nSegments; i++) {
      const y = i * dy
      const depth = Math.max(0, submergedHeight - y)
      const p = gamma * depth
      const x = getXFromY(y)

      const yNext = Math.min(submergedHeight, y + 0.001)
      const yPrev = Math.max(0, y - 0.001)
      const dx_dy = (getXFromY(yNext) - getXFromY(yPrev)) / (yNext - yPrev || 0.001)
      const ds = Math.sqrt(1 + dx_dy * dx_dy) * dy

      const lenN = Math.hypot(1, -dx_dy) || 1
      const nx = 1 / lenN
      const ny = -dx_dy / lenN

      const dF = p * gateWidth * ds
      const dFx = p * gateWidth * dy
      const dx = Math.abs(dx_dy) * dy
      const dFy = gamma * depth * gateWidth * dx

      sumFH += dFx
      sumMomY += y * dFx
      sumFV += dFy
      sumMomX += x * dFy

      sumArea += ds * gateWidth
      sumXcg += x * ds
      sumYcg += y * ds

      samples.push({
        x,
        y,
        depth,
        pressure: p,
        nx,
        ny,
        dF,
        dFx,
        dFy,
        dx_dy,
      })
    }

    FH = sumFH
    ycp = sumFH > 0 ? sumMomY / sumFH : submergedHeight / 3
    FV = -sumFV
    xcp = sumFV > 0 ? sumMomX / sumFV : 0

    FR = Math.hypot(FH, Math.abs(FV))
    FR_angle_rad = Math.atan2(Math.abs(FV), FH)
    FR_angle_deg = (FR_angle_rad * 180) / Math.PI

    submergedArea = sumArea
    xcg = sumArea > 0 ? (sumXcg * gateWidth) / sumArea : 0
    ycg = sumArea > 0 ? (sumYcg * gateWidth) / sumArea : submergedHeight / 2
    momentPivot = FH * (ycp - pivotY) - Math.abs(FV) * xcp
  }

  const overturningRisk = Math.abs(momentPivot) > 50000 ? 'Alto' : 'Estable'

  return {
    rho,
    gamma,
    h,
    gateHeight,
    gateWidth,
    submergedHeight,
    submergedArea,
    pMax,
    FH,
    FV,
    FR,
    FR_angle_rad,
    FR_angle_deg,
    xcp,
    ycp,
    xcg,
    ycg,
    momentPivot,
    overturningRisk,
    samples,
  }
}

export function getGateCrossSectionWidth(shape, a, b, rollDeg, deltaV) {
  const phi = (((rollDeg || 0) % 360) * Math.PI) / 180
  if (shape === 'gate_circle') {
    const R = a / 2
    if (Math.abs(deltaV) >= R) return 0
    return 2 * Math.sqrt(Math.max(0, R * R - deltaV * deltaV))
  }
  if (shape === 'gate_ellipse') {
    const bY = a / 2
    const bX = b / 2
    const H_half = Math.sqrt(Math.pow(bX * Math.sin(phi), 2) + Math.pow(bY * Math.cos(phi), 2))
    if (Math.abs(deltaV) >= H_half) return 0
    return 2 * ((bX * bY) / H_half) * Math.sqrt(Math.max(0, 1 - Math.pow(deltaV / H_half, 2)))
  }

  let verts = []
  if (shape === 'gate_rectangle') {
    verts = [{ u: -b / 2, v: -a / 2 }, { u: b / 2, v: -a / 2 }, { u: b / 2, v: a / 2 }, { u: -b / 2, v: a / 2 }]
  } else if (shape === 'gate_triangle_up') {
    verts = [{ u: -b / 2, v: -a / 3 }, { u: b / 2, v: -a / 3 }, { u: 0, v: (2 / 3) * a }]
  } else if (shape === 'gate_triangle_down') {
    verts = [{ u: 0, v: -(2 / 3) * a }, { u: b / 2, v: a / 3 }, { u: -b / 2, v: a / 3 }]
  } else {
    verts = [{ u: -b / 2, v: -a / 2 }, { u: b / 2, v: -a / 2 }, { u: b / 2, v: a / 2 }, { u: -b / 2, v: a / 2 }]
  }

  const cosP = Math.cos(phi)
  const sinP = Math.sin(phi)
  const rotVerts = verts.map((p) => ({
    u: p.u * cosP - p.v * sinP,
    v: p.u * sinP + p.v * cosP,
  }))

  const xs = []
  const n = rotVerts.length
  for (let i = 0; i < n; i++) {
    const p1 = rotVerts[i]
    const p2 = rotVerts[(i + 1) % n]
    if ((p1.v <= deltaV && p2.v > deltaV) || (p2.v <= deltaV && p1.v > deltaV)) {
      const t = (deltaV - p1.v) / (p2.v - p1.v || 0.000001)
      xs.push(p1.u + t * (p2.u - p1.u))
    }
  }
  if (xs.length < 2) return 0
  return Math.max(...xs) - Math.min(...xs)
}

export function getGateRotatedExtent(shape, a, b, rollDeg) {
  const phi = (((rollDeg || 0) % 360) * Math.PI) / 180
  if (shape === 'gate_circle') {
    const R = a / 2
    return { vMin: -R, vMax: R }
  }
  if (shape === 'gate_ellipse') {
    const bY = a / 2
    const bX = b / 2
    const H_half = Math.sqrt(Math.pow(bX * Math.sin(phi), 2) + Math.pow(bY * Math.cos(phi), 2))
    return { vMin: -H_half, vMax: H_half }
  }
  let verts = []
  if (shape === 'gate_rectangle') {
    verts = [{ u: -b / 2, v: -a / 2 }, { u: b / 2, v: -a / 2 }, { u: b / 2, v: a / 2 }, { u: -b / 2, v: a / 2 }]
  } else if (shape === 'gate_triangle_up') {
    verts = [{ u: -b / 2, v: -a / 3 }, { u: b / 2, v: -a / 3 }, { u: 0, v: (2 / 3) * a }]
  } else if (shape === 'gate_triangle_down') {
    verts = [{ u: 0, v: -(2 / 3) * a }, { u: b / 2, v: a / 3 }, { u: -b / 2, v: a / 3 }]
  } else {
    verts = [{ u: -b / 2, v: -a / 2 }, { u: b / 2, v: -a / 2 }, { u: b / 2, v: a / 2 }, { u: -b / 2, v: a / 2 }]
  }
  const cosP = Math.cos(phi)
  const sinP = Math.sin(phi)
  const rotVerts = verts.map((p) => ({
    u: p.u * cosP - p.v * sinP,
    v: p.u * sinP + p.v * cosP,
  }))
  return {
    vMin: Math.min(...rotVerts.map((p) => p.v)),
    vMax: Math.max(...rotVerts.map((p) => p.v)),
  }
}

export function solveSubmergedGate({
  gateShape = 'gate_rectangle',
  rho = 1000,
  h = 3.0,
  gateDepthY = 1.0,
  gateDimA = 1.2,
  gateDimB = 1.0,
  thetaDeg = 90,
  gateRollDeg = 0,
}) {
  const g = GRAVITY
  const gamma = rho * g
  const thetaRad = (thetaDeg * Math.PI) / 180
  const sinTheta = Math.max(0.01, Math.sin(thetaRad))
  const cosTheta = Math.cos(thetaRad)

  let localYcg = gateDimA / 2
  if (gateShape === 'gate_triangle_down') localYcg = (2 / 3) * gateDimA
  if (gateShape === 'gate_triangle_up') localYcg = (1 / 3) * gateDimA

  const { vMin, vMax } = getGateRotatedExtent(gateShape, gateDimA, gateDimB, gateRollDeg)
  const etaMin = localYcg + vMin
  const etaMax = localYcg + vMax
  const etaSpan = Math.max(0.01, etaMax - etaMin)

  // La compuerta está cerrada y fija en su apoyo base (gateDepthY)
  const yBottomWorld = gateDepthY + etaMin * sinTheta
  const yTopWorld = gateDepthY + etaMax * sinTheta
  const isFullySubmerged = h >= yTopWorld
  const isDry = h <= yBottomWorld

  const nStrips = 120
  let sumArea = 0
  let sumEta_local = 0
  let sumForce = 0
  let sumMomLocal = 0
  const samples = []
  const dEta = etaSpan / nStrips

  for (let i = 0; i < nStrips; i++) {
    const eta = etaMin + (i + 0.5) * dEta
    const deltaV = eta - localYcg
    const width = getGateCrossSectionWidth(gateShape, gateDimA, gateDimB, gateRollDeg, deltaV)
    if (width <= 0) continue

    const xGlobal = eta * cosTheta
    const yGlobal = gateDepthY + eta * sinTheta
    const depth = Math.max(0, h - yGlobal)

    if (depth > 0) {
      const dA = width * dEta
      const p = gamma * depth
      const dF = p * dA

      sumArea += dA
      sumEta_local += eta * dA
      sumForce += dF
      sumMomLocal += eta * dF

      if (i % 6 === 0 || i === nStrips - 1) {
        samples.push({
          x: xGlobal,
          y: yGlobal,
          depth,
          pressure: p,
          nx: sinTheta,
          ny: -cosTheta,
          dF,
          width,
        })
      }
    }
  }

  const submergedArea = isDry ? 0 : sumArea
  const FR = isDry ? 0 : sumForce
  const FH = FR * sinTheta
  const FV = -FR * cosTheta
  const FR_angle_deg = (Math.atan2(Math.abs(FV), FH) * 180) / Math.PI

  const localEta_cg_sub = submergedArea > 0 ? sumEta_local / submergedArea : localYcg
  const localEta_cp_sub = FR > 0 ? sumMomLocal / FR : localEta_cg_sub

  const xcg = localEta_cg_sub * cosTheta
  const ycg = gateDepthY + localEta_cg_sub * sinTheta
  const xcp = localEta_cp_sub * cosTheta
  const ycp = gateDepthY + localEta_cp_sub * sinTheta

  // Momento de empuje respecto a la base de la compuerta (y = gateDepthY)
  const momentBase = FR * localEta_cp_sub

  const pMax = gamma * Math.max(0, h - yBottomWorld)

  return {
    rho,
    gamma,
    h,
    gateDepthY,
    gateDimA,
    gateDimB,
    gateRollDeg,
    localYcg,
    etaMin,
    etaMax,
    yBottomWorld,
    yTopWorld,
    gateHeight: gateDimA,
    gateWidth: gateDimB,
    submergedHeight: Math.max(0, Math.min(yTopWorld, h) - yBottomWorld),
    submergedArea,
    pMax,
    FH,
    FV,
    FR,
    FR_angle_rad: (FR_angle_deg * Math.PI) / 180,
    FR_angle_deg,
    xcp,
    ycp,
    xcg,
    ycg,
    momentBase,
    momentPivot: momentBase,
    overturningRisk: Math.abs(momentBase) > 40000 ? 'Alto' : 'Estable',
    samples,
    isFullySubmerged,
    isDry,
    gateShape,
    thetaDeg,
  }
}

