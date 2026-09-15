/**
 * Derivation — Jet Impact on Vanes (Impacto de Chorro en Álabe)
 */

export function getDerivation({ Djet, Vjet, Ftheo, beta, rho, Q, Kfactor, vaneLabel }) {
  const Ajet = Math.PI * Djet * Djet / 4
  return [
    { type: 'heading', title: '🚿 Jet Impact on Vanes — Momentum Equation' },
    {
      title: '0 · Parameters',
      content: 'Current simulation values:',
    },
    {
      type: 'list',
      items: [
        `Nozzle diameter: $D = ${(Djet*1000).toFixed(1)}\\;\\mathrm{mm}$`,
        `Jet area: $A = ${(Ajet*1e6).toFixed(1)}\\;\\mathrm{mm^2}$`,
        `Flow rate: $Q = ${(Q*60000).toFixed(2)}\\;\\mathrm{L/min}$`,
        `Jet velocity: $V = ${Vjet.toFixed(3)}\\;\\mathrm{m/s}$`,
        `Vane: **${vaneLabel}** ($\\beta = ${(beta*180/Math.PI).toFixed(0)}°$)`,
        `$\\rho = ${rho}\\;\\mathrm{kg/m^3}$`,
      ],
    },
    {
      title: '1 · Linear momentum equation',
      content: 'Newton\'s second law for a control volume (steady flow):',
      equation: '\\sum \\mathbf{F} = \\dot{m}\\left(\\mathbf{V}_{\\text{out}} - \\mathbf{V}_{\\text{in}}\\right)',
      after: 'where $\\dot{m} = \\rho Q$ is the mass flow rate.',
    },
    {
      title: '2 · General vane deflection',
      content: 'For a jet deflected by angle $\\beta$ from original direction:',
      equation: 'F = \\rho Q V\\left(1 - \\cos\\beta\\right)',
      after: `Current: $F = ${rho}\\times${(Q*1e6).toFixed(1)}\\times10^{-6}\\times${Vjet.toFixed(2)}\\times(1-\\cos${(beta*180/Math.PI).toFixed(0)}°) = ${Ftheo.toFixed(4)}\\;\\mathrm{N}$`,
    },
    {
      title: '3 · Special cases',
      content: '**Flat plate** ($\\beta = 90°$): jet exits radially → $\\cos 90° = 0$',
      equation: 'F_{\\text{flat}} = \\rho Q V',
      after: '**Hemispherical cup** ($\\beta = 180°$): jet reverses → $\\cos 180° = -1$',
      equation2: 'F_{\\text{hemi}} = 2\\rho Q V',
      after2: '**Conical vane** ($\\beta = \\theta$):',
      equation3: 'F_{\\text{cone}} = \\rho Q V(1 - \\cos\\theta)',
    },
    {
      title: '4 · Momentum flux derivation',
      content: 'Starting from Reynolds Transport Theorem for linear momentum:',
      equation: '\\sum\\mathbf{F} = \\frac{\\partial}{\\partial t}\\int_{CV}\\rho\\mathbf{V}\\,dV + \\int_{CS}\\rho\\mathbf{V}(\\mathbf{V}\\cdot\\hat{n})\\,dA',
      after: 'For steady flow, the first term vanishes. The surface integral evaluates to:',
      equation2: 'F_y = \\rho A V^2(\\cos\\beta - 1) \\quad \\Rightarrow \\quad |F_y| = \\rho Q V(1-\\cos\\beta)',
    },
    {
      title: '5 · Experimental setup',
      content: 'The apparatus uses a weight balance to measure the force:',
    },
    {
      type: 'list',
      items: [
        'Vertical jet impinges on the vane mounted on a beam',
        'Weights are added to restore balance → $F_{\\text{meas}} = mg$',
        'Compare $F_{\\text{meas}}$ vs $F_{\\text{theo}} = \\rho QV(1-\\cos\\beta)$',
        'Error sources: jet spreading, friction, turbulence, splash-back',
      ],
    },
    {
      title: '6 · Efficiency',
      content: 'The fraction of jet kinetic energy converted to force on the vane:',
      equation: '\\eta = \\frac{F \\cdot V_{\\text{vane}}}{\\frac{1}{2}\\rho Q V^2}',
      after: 'For a stationary vane $V_{\\text{vane}} = 0$, so $\\eta = 0$. Maximum efficiency occurs at $V_{\\text{vane}} = V/2$ (Pelton turbine theory).',
    },
  ]
}
