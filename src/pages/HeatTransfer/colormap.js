/**
 * FEM-style "jet" colormap: deep blue → cyan → green → yellow → orange → red
 * (like ANSYS/COMSOL temperature contours)
 */
const JET_STOPS = [
  [0.0, [0, 0, 143]],      // dark blue
  [0.11, [0, 0, 255]],     // blue
  [0.34, [0, 255, 255]],   // cyan
  [0.5, [0, 255, 0]],      // green
  [0.65, [255, 255, 0]],   // yellow
  [0.8, [255, 128, 0]],    // orange
  [0.9, [255, 0, 0]],      // red
  [1.0, [128, 0, 0]],      // dark red
]

export function tempToColor(t, tMin, tMax) {
  const x = Math.max(0, Math.min(1, (t - tMin) / Math.max(1e-9, tMax - tMin)))
  for (let i = 0; i < JET_STOPS.length - 1; i++) {
    const [x0, c0] = JET_STOPS[i]
    const [x1, c1] = JET_STOPS[i + 1]
    if (x >= x0 && x <= x1) {
      const f = (x - x0) / (x1 - x0)
      return [
        (c0[0] + f * (c1[0] - c0[0])) / 255,
        (c0[1] + f * (c1[1] - c0[1])) / 255,
        (c0[2] + f * (c1[2] - c0[2])) / 255,
      ]
    }
  }
  return [0.5, 0, 0]
}

export function gradientCSS() {
  return 'linear-gradient(to top, rgb(0,0,143), rgb(0,0,255), rgb(0,255,255), rgb(0,255,0), rgb(255,255,0), rgb(255,128,0), rgb(255,0,0), rgb(128,0,0))'
}
