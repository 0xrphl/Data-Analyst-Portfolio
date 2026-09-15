/**
 * Jet impact on vanes — momentum equation solver.
 * All SI units.
 */

const g = 9.81

export const VANE_TYPES = {
  'Flat plate (90°)':       { beta: Math.PI / 2, label: 'Flat', Ktheo: 1.0 },
  'Hemispherical (180°)':   { beta: Math.PI,     label: 'Hemisphere', Ktheo: 2.0 },
  'Conical 120°':           { beta: 2 * Math.PI / 3, label: 'Cone 120°', Ktheo: null },
  'Conical 60°':            { beta: Math.PI / 3,     label: 'Cone 60°', Ktheo: null },
  'Conical 45°':            { beta: Math.PI / 4,     label: 'Cone 45°', Ktheo: null },
}

/**
 * Solve jet impact force.
 *   F = ρQV(1 - cosβ)   where β is the deflection angle
 *   Flat plate:  β = 90°  → F = ρQV
 *   Hemisphere:  β = 180° → F = 2ρQV
 *   Cone:        β = θ    → F = ρQV(1 - cosθ)
 */
export function solveJetImpact({ Q, Djet, vaneType, rho = 998 }) {
  const vane = VANE_TYPES[vaneType] || VANE_TYPES['Flat plate (90°)']
  const Ajet = Math.PI * Djet * Djet / 4
  const Vjet = Q / Ajet
  const beta = vane.beta
  const Ftheo = rho * Q * Vjet * (1 - Math.cos(beta))
  const massFlow = rho * Q
  const momentum = massFlow * Vjet
  const kineticPower = 0.5 * rho * Q * Vjet * Vjet
  const jetHeight = Vjet * Vjet / (2 * g) // max height of free jet

  return {
    Q, Djet, Ajet, Vjet, beta, vaneType,
    vaneLabel: vane.label,
    Ftheo, massFlow, momentum, kineticPower,
    jetHeight, rho,
    Kfactor: 1 - Math.cos(beta),
  }
}
