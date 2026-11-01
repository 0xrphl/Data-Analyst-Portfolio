/**
 * Hydraulics-lab colormaps
 * ─────────────────────────────────────────────────────────────
 * "jet" for pressure fields (blue→cyan→green→yellow→red)
 * "cool" for velocity  (blue→cyan→white)
 * Mirrors the FEM-style colormap from the heat-transfer sim.
 */

const JET_STOPS = [
  [0.0,  [0,   0,   143]],
  [0.11, [0,   0,   255]],
  [0.34, [0,   255, 255]],
  [0.50, [0,   255, 0  ]],
  [0.65, [255, 255, 0  ]],
  [0.80, [255, 128, 0  ]],
  [0.90, [255, 0,   0  ]],
  [1.0,  [128, 0,   0  ]],
]

const VELOCITY_STOPS = [
  [0.0,  [10,  30,  100]],
  [0.25, [30,  80,  220]],
  [0.50, [0,   180, 255]],
  [0.75, [60,  255, 200]],
  [1.0,  [255, 255, 255]],
]

function interpolateStops(stops, x) {
  const t = Math.max(0, Math.min(1, x))
  for (let i = 0; i < stops.length - 1; i++) {
    const [x0, c0] = stops[i]
    const [x1, c1] = stops[i + 1]
    if (t >= x0 && t <= x1) {
      const f = (t - x0) / (x1 - x0)
      return [
        (c0[0] + f * (c1[0] - c0[0])) / 255,
        (c0[1] + f * (c1[1] - c0[1])) / 255,
        (c0[2] + f * (c1[2] - c0[2])) / 255,
      ]
    }
  }
  return [0.5, 0, 0]
}

export function pressureColor(val, vMin, vMax) {
  const x = (val - vMin) / Math.max(1e-9, vMax - vMin)
  return interpolateStops(JET_STOPS, x)
}

export function velocityColor(val, vMin, vMax) {
  const x = (val - vMin) / Math.max(1e-9, vMax - vMin)
  return interpolateStops(VELOCITY_STOPS, x)
}

/**
 * Jet colormap returning 0–1 RGB for instance buffers.
 * @param {number} t — normalised value in [0, 1]
 * @returns {[number, number, number]} — [r, g, b] in 0–1
 */
export function jetRGB(t) {
  return interpolateStops(JET_STOPS, t)
}

export function pressureGradientCSS() {
  return 'linear-gradient(to top, rgb(0,0,143), rgb(0,0,255), rgb(0,255,255), rgb(0,255,0), rgb(255,255,0), rgb(255,128,0), rgb(255,0,0), rgb(128,0,0))'
}

export function velocityGradientCSS() {
  return 'linear-gradient(to top, rgb(10,30,100), rgb(30,80,220), rgb(0,180,255), rgb(60,255,200), rgb(255,255,255))'
}
