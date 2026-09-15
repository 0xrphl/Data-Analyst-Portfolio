/**
 * Derivation — Minor Losses in Pipe Fittings (Pérdida en Accesorios)
 */

export function getDerivation({ D, V, Re, Vh, totalK, totalHL, totalDP }) {
  return [
    { type: 'heading', title: '⚙️ Minor Losses — Fittings & Accessories' },
    {
      title: '0 · Parameters',
      content: 'Current values:',
    },
    {
      type: 'list',
      items: [
        `$D = ${(D * 1000).toFixed(1)}\\;\\mathrm{mm}$, $V = ${V.toFixed(3)}\\;\\mathrm{m/s}$`,
        `$Re = ${Re.toFixed(0)}$`,
        `Velocity head: $V^2/(2g) = ${Vh.toFixed(4)}\\;\\mathrm{m}$`,
        `$\\Sigma K = ${totalK.toFixed(2)}$, $\\Sigma h_L = ${totalHL.toFixed(4)}\\;\\mathrm{m}$`,
      ],
    },
    {
      title: '1 · Minor loss equation',
      content: 'Head loss through a fitting or accessory:',
      equation: 'h_L = K \\cdot \\frac{V^2}{2g}',
      after: 'where $K$ is the loss coefficient (dimensionless), determined experimentally.',
    },
    {
      title: '2 · Total minor losses',
      content: 'For a system with multiple fittings in series:',
      equation: 'h_{L,\\text{total}} = \\left(\\sum_i K_i\\right) \\frac{V^2}{2g}',
    },
    {
      title: '3 · Sudden expansion (Borda-Carnot)',
      content: 'Derived from momentum and continuity:',
      equation: 'K_{\\text{exp}} = \\left(1 - \\frac{A_1}{A_2}\\right)^2 = \\left(1 - \\frac{D_1^2}{D_2^2}\\right)^2',
      after: 'This is the only minor loss with an exact analytical solution.',
    },
    {
      title: '4 · Sudden contraction',
      content: 'Semi-empirical (based on vena contracta):',
      equation: 'K_{\\text{con}} \\approx 0.5\\left(1 - \\frac{A_2}{A_1}\\right) = 0.5\\left(1 - \\frac{D_2^2}{D_1^2}\\right)',
    },
    {
      title: '5 · Equivalent length method',
      content: 'Each fitting can be expressed as an equivalent pipe length:',
      equation: 'L_{\\text{eq}} = \\frac{K \\cdot D}{f}',
      after: 'so that $h_L = f(L_{\\text{eq}}/D)(V^2/2g)$ matches $K V^2/(2g)$.',
    },
    {
      title: '6 · Energy equation with minor losses',
      content: 'Full pipe system between points 1 and 2:',
      equation: '\\frac{P_1}{\\rho g}+\\frac{V_1^2}{2g}+z_1 = \\frac{P_2}{\\rho g}+\\frac{V_2^2}{2g}+z_2 + f\\frac{L}{D}\\frac{V^2}{2g} + \\sum K_i\\frac{V^2}{2g}',
      after: 'Major losses (friction) + minor losses (fittings).',
    },
    {
      title: '7 · K values — typical ranges',
    },
    {
      type: 'list',
      items: [
        'Gate valve (full): $K \\approx 0.19$',
        'Globe valve (full): $K \\approx 10$',
        '90° standard elbow: $K \\approx 0.9$',
        'Tee (branch): $K \\approx 1.8$',
        'Sharp entrance: $K = 0.5$, Exit: $K = 1.0$',
      ],
    },
    {
      title: '8 · Pressure drop',
      content: 'Convert head loss to pressure:',
      equation: '\\Delta P = \\rho g h_L = \\rho g K \\frac{V^2}{2g} = \\frac{1}{2}\\rho K V^2',
      after: `Total: $\\Delta P = ${totalDP.toFixed(1)}\\;\\mathrm{Pa}$`,
    },
  ]
}
