/**
 * 3D Heat Equation solver — Fourier's formulation, two cases.
 *
 *   ρc ∂u/∂t = ∇·(k ∇u) + Q̇        ->    ∂u/∂t = K ∇²u + q/(ρc V)
 *
 * CASE A — 'solid':   homogeneous insulating cube, heater sphere/cube at center.
 * CASE B — 'furnace': hollow cube, wall thickness D, empty cavity, heater at center.
 *
 * Boundary condition (both cases): OUTER SURFACE FIXED AT Twall (Dirichlet).
 *   u = Twall  on ∂Ω        <-- this makes the problem WELL-POSED so a true
 *                               steady state exists and is reached in ~5τ.
 *
 * Steady state:  q_in = q_through_wall.  Reported as an energy balance.
 *
 * Materials are per-cell (mask) so the furnace shell / cavity can have
 * different conductivities.
 */

// ---- Config ----------------------------------------------------------------
let mode = 'solid'      // 'solid' | 'furnace'
let N = 32
let L = 1.0             // m, outer edge
let K = 4.0e-7          // m²/s  thermal diffusivity of the SOLID (insulator)
let kCond = 0.8         // W/(m·K) conductivity of the SOLID
let rhoC = kCond / K    // J/(m³K) derived so K = k/(ρc) stays consistent
let qPower = 300        // W  total heater power
let srcRadius = 0.15    // heater radius as fraction of L
let Twall = 60          // °C  fixed OUTER wall temperature (Dirichlet)
let T0 = 60             // °C  initial temperature of the domain
let wallD = 0.15        // furnace: wall thickness as fraction of L
let kCavity = 0.15      // furnace: effective cavity conductivity (air+radiation)
let speed = 50

// ---- State -----------------------------------------------------------------
let u = null
let uNext = null
let mask = null         // 0 = outer boundary, 1 = solid/shell, 2 = cavity, 3 = heater
let kField = null       // per-cell conductivity
let aField = null       // per-cell diffusivity
let srcCells = []
let time = 0
let running = false
let steady = false
let residual = 0
let qWall = 0           // W flowing out through the wall

const MASK_BOUND = 0, MASK_SOLID = 1, MASK_CAVITY = 2, MASK_HEATER = 3

function idx(i, j, k) { return i + N * (j + N * k) }

function buildGeometry() {
  mask = new Uint8Array(N * N * N)
  kField = new Float32Array(N * N * N)
  aField = new Float32Array(N * N * N)
  srcCells = []

  const c = (N - 1) / 2
  const rHeat = Math.max(1.0, srcRadius * (N - 1))
  const dCells = wallD * (N - 1)        // shell thickness in cells
  const rhoCcav = kCavity / Math.max(1e-9, K) // keep cavity diffusivity sane

  for (let k = 0; k < N; k++) {
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const id = idx(i, j, k)
        const onBoundary = i === 0 || j === 0 || k === 0 || i === N - 1 || j === N - 1 || k === N - 1
        if (onBoundary) { mask[id] = MASK_BOUND; kField[id] = kCond; aField[id] = K; continue }

        const dHeat = Math.hypot(i - c, j - c, k - c)
        if (dHeat <= rHeat) {
          mask[id] = MASK_HEATER
          kField[id] = kCond
          aField[id] = K
          srcCells.push(id)
          continue
        }

        if (mode === 'furnace') {
          // Chebyshev distance from the outer surface determines shell vs cavity
          const distFromSurface = Math.min(i, j, k, N - 1 - i, N - 1 - j, N - 1 - k)
          if (distFromSurface < dCells) {
            mask[id] = MASK_SOLID
            kField[id] = kCond
            aField[id] = K
          } else {
            mask[id] = MASK_CAVITY
            kField[id] = kCavity
            aField[id] = kCavity / rhoC   // cavity diffusivity from its own k
          }
        } else {
          mask[id] = MASK_SOLID
          kField[id] = kCond
          aField[id] = K
        }
      }
    }
  }

  if (!srcCells.length) {
    const ci = Math.floor(N / 2)
    srcCells.push(idx(ci, ci, ci))
    mask[idx(ci, ci, ci)] = MASK_HEATER
  }
}

function reset() {
  buildGeometry()
  u = new Float32Array(N * N * N).fill(T0)
  uNext = new Float32Array(N * N * N).fill(T0)
  // Outer boundary always at Twall
  for (let n = 0; n < u.length; n++) if (mask[n] === MASK_BOUND) u[n] = uNext[n] = Twall
  time = 0
  steady = false
  residual = 0
  qWall = 0
}

function maxDiffusivity() {
  let m = K
  if (mode === 'furnace') m = Math.max(m, kCavity / rhoC)
  return m
}

function step() {
  const dx = L / (N - 1)
  const aMax = maxDiffusivity()
  const dt = 0.85 * (dx * dx) / (6 * aMax)

  const cellVol = dx * dx * dx
  const srcVol = cellVol * srcCells.length
  const sourceDeltaT = (qPower * dt) / (rhoC * srcVol)

  let maxDelta = 0

  // Harmonic-mean conductivity at faces (correct for heterogeneous media)
  for (let k = 1; k < N - 1; k++) {
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        const id = idx(i, j, k)
        const kc = kField[id]
        const uc = u[id]
        let flux = 0
        const nb = [
          idx(i + 1, j, k), idx(i - 1, j, k),
          idx(i, j + 1, k), idx(i, j - 1, k),
          idx(i, j, k + 1), idx(i, j, k - 1),
        ]
        for (let m = 0; m < 6; m++) {
          const nid = nb[m]
          const kn = kField[nid]
          const kFace = (2 * kc * kn) / (kc + kn)   // harmonic mean
          flux += kFace * (u[nid] - uc)
        }
        // ρc du/dt = flux/dx²   (per unit volume)
        const next = uc + (dt / (rhoC * dx * dx)) * flux
        uNext[id] = next
        const d = Math.abs(next - uc)
        if (d > maxDelta) maxDelta = d
      }
    }
  }

  // Volumetric heater
  for (let s = 0; s < srcCells.length; s++) uNext[srcCells[s]] += sourceDeltaT

  // Dirichlet outer boundary
  for (let n = 0; n < uNext.length; n++) if (mask[n] === MASK_BOUND) uNext[n] = Twall

  // Heat leaving through the outer surface: q = k A (T_inner - T_wall)/dx
  let qs = 0
  const A = dx * dx
  for (let j = 1; j < N - 1; j++) for (let k = 1; k < N - 1; k++) {
    qs += kField[idx(1, j, k)] * A * (u[idx(1, j, k)] - Twall) / dx
    qs += kField[idx(N - 2, j, k)] * A * (u[idx(N - 2, j, k)] - Twall) / dx
  }
  for (let i = 1; i < N - 1; i++) for (let k = 1; k < N - 1; k++) {
    qs += kField[idx(i, 1, k)] * A * (u[idx(i, 1, k)] - Twall) / dx
    qs += kField[idx(i, N - 2, k)] * A * (u[idx(i, N - 2, k)] - Twall) / dx
  }
  for (let i = 1; i < N - 1; i++) for (let j = 1; j < N - 1; j++) {
    qs += kField[idx(i, j, 1)] * A * (u[idx(i, j, 1)] - Twall) / dx
    qs += kField[idx(i, j, N - 2)] * A * (u[idx(i, j, N - 2)] - Twall) / dx
  }
  qWall = qs

  const tmp = u; u = uNext; uNext = tmp
  time += dt

  residual = maxDelta / dt
  // Steady when the field stops changing AND energy balances
  const balanced = qPower === 0 ? true : Math.abs(qWall - qPower) / qPower < 0.02
  steady = residual < 1e-5 && balanced && time > 0
  return maxDelta
}

function stats() {
  let maxT = -Infinity, minT = Infinity, sum = 0, cnt = 0
  let cavSum = 0, cavCnt = 0
  let innerWall = 0, innerCnt = 0
  for (let n = 0; n < u.length; n++) {
    const v = u[n]
    if (v > maxT) maxT = v
    if (v < minT) minT = v
    sum += v; cnt++
    if (mask[n] === MASK_CAVITY) { cavSum += v; cavCnt++ }
  }
  // Inner-surface temperature (cell just inside the outer boundary)
  const c = Math.floor(N / 2)
  innerWall = (
    u[idx(1, c, c)] + u[idx(N - 2, c, c)] +
    u[idx(c, 1, c)] + u[idx(c, N - 2, c)] +
    u[idx(c, c, 1)] + u[idx(c, c, N - 2)]
  ) / 6
  return {
    maxT, minT,
    avgT: sum / cnt,
    cavityT: cavCnt ? cavSum / cavCnt : null,
    innerWallT: innerWall,
  }
}

/**
 * Analytic-ish calibration: run a fast steady solve (Gauss-Seidel style
 * over-relaxation on the current geometry) with q = 1 W, measure the
 * resulting core rise, then scale q so the core reaches targetCore.
 * Because the problem is linear in q, this is exact.
 */
function calibrateQ(targetCore) {
  const dx = L / (N - 1)
  const cellVol = dx * dx * dx
  const srcVol = cellVol * srcCells.length

  // Solve steady with unit power using SOR
  const v = new Float32Array(N * N * N).fill(0)   // v = T - Twall
  const srcSet = new Set(srcCells)
  const gen = 1.0 / srcVol                        // W/m³ for 1 W total
  const omega = 1.7
  for (let iter = 0; iter < 3000; iter++) {
    let maxCh = 0
    for (let k = 1; k < N - 1; k++)
      for (let j = 1; j < N - 1; j++)
        for (let i = 1; i < N - 1; i++) {
          const id = idx(i, j, k)
          const kc = kField[id]
          let num = 0, den = 0
          const nb = [
            idx(i + 1, j, k), idx(i - 1, j, k),
            idx(i, j + 1, k), idx(i, j - 1, k),
            idx(i, j, k + 1), idx(i, j, k - 1),
          ]
          for (let m = 0; m < 6; m++) {
            const nid = nb[m]
            const kf = (2 * kc * kField[nid]) / (kc + kField[nid])
            num += kf * (mask[nid] === MASK_BOUND ? 0 : v[nid])
            den += kf
          }
          const src = srcSet.has(id) ? gen * dx * dx : 0
          const newV = (num + src) / den
          const ch = Math.abs(newV - v[id])
          if (ch > maxCh) maxCh = ch
          v[id] = v[id] + omega * (newV - v[id])
        }
    if (maxCh < 1e-9) break
  }
  let peak = 0
  for (let n = 0; n < v.length; n++) if (v[n] > peak) peak = v[n]
  if (peak <= 0) return qPower
  return (targetCore - Twall) / peak    // watts needed
}

// ---- Loop ------------------------------------------------------------------
let frameTimer = null

function postFrame() {
  const s = stats()
  const copy = new Float32Array(u)
  self.postMessage({
    type: 'frame', field: copy.buffer, N, time, mode,
    maxT: s.maxT, minT: s.minT, avgT: s.avgT,
    cavityT: s.cavityT, innerWallT: s.innerWallT,
    Twall, qWall, qIn: qPower, residual, steady,
  }, [copy.buffer])
}

function loop() {
  if (!running) return
  const steps = Math.max(1, Math.round(speed))
  for (let s = 0; s < steps && running; s++) step()
  postFrame()
  frameTimer = setTimeout(loop, 33)
}

self.onmessage = (e) => {
  const m = e.data
  switch (m.type) {
    case 'config': {
      const needReset =
        (m.mode !== undefined && m.mode !== mode) ||
        (m.N !== undefined && m.N !== N) ||
        (m.L !== undefined && m.L !== L) ||
        (m.T0 !== undefined && m.T0 !== T0) ||
        (m.Twall !== undefined && m.Twall !== Twall) ||
        (m.wallD !== undefined && m.wallD !== wallD) ||
        (m.srcRadius !== undefined && m.srcRadius !== srcRadius) ||
        (m.kCavity !== undefined && m.kCavity !== kCavity) ||
        (m.K !== undefined && m.K !== K) ||
        (m.kCond !== undefined && m.kCond !== kCond)

      if (m.mode !== undefined) mode = m.mode
      if (m.N !== undefined) N = m.N
      if (m.L !== undefined) L = m.L
      if (m.K !== undefined) K = m.K
      if (m.kCond !== undefined) kCond = m.kCond
      if (m.q !== undefined) qPower = m.q
      if (m.srcRadius !== undefined) srcRadius = m.srcRadius
      if (m.Twall !== undefined) { Twall = m.Twall; T0 = m.Twall }
      if (m.wallD !== undefined) wallD = m.wallD
      if (m.kCavity !== undefined) kCavity = m.kCavity
      if (m.speed !== undefined) speed = m.speed
      rhoC = kCond / Math.max(1e-12, K)

      if (needReset || !u) reset()
      break
    }
    case 'calibrate': {
      if (!u) reset()
      const target = m.target ?? 400
      const qNeeded = calibrateQ(target)
      qPower = Math.max(0, qNeeded)
      self.postMessage({ type: 'calibrated', q: qPower, target })
      reset()
      running = true
      loop()
      break
    }
    case 'play':
      if (!u) reset()
      running = true
      loop()
      break
    case 'pause':
      running = false
      if (frameTimer) clearTimeout(frameTimer)
      break
    case 'reset':
      running = false
      if (frameTimer) clearTimeout(frameTimer)
      reset()
      postFrame()
      break
  }
}
