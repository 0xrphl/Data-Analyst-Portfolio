/**
 * Full analytical derivation — Pipe Friction Losses
 * Darcy-Weisbach · Colebrook-White · Moody · Hagen-Poiseuille
 */

export function getDerivation({ D, L, eps, V, Re, f, hf, dp, rho, mu, regime, relRough }) {
  return [
    { type: 'heading', title: '🔧 Pipe Friction — Major Losses' },
    {
      title: '0 · Physical parameters',
      content: 'Current simulation values:',
    },
    {
      type: 'list',
      items: [
        `Pipe diameter: $D = ${D.toFixed(4)}\\;\\mathrm{m}$`,
        `Pipe length: $L = ${L.toFixed(2)}\\;\\mathrm{m}$`,
        `Roughness: $\\varepsilon = ${eps.toExponential(2)}\\;\\mathrm{m}$, $\\varepsilon/D = ${relRough.toExponential(3)}$`,
        `$\\rho = ${rho.toFixed(1)}\\;\\mathrm{kg/m^3}$, $\\mu = ${mu.toExponential(3)}\\;\\mathrm{Pa\\cdot s}$`,
        `$V = ${V.toFixed(4)}\\;\\mathrm{m/s}$, $Re = ${Re.toFixed(0)}$ — **${regime}**`,
      ],
    },
    {
      title: '1 · Reynolds number',
      content: 'Ratio of inertial to viscous forces:',
      equation: 'Re = \\frac{\\rho V D}{\\mu} = \\frac{V D}{\\nu}',
      after: '$Re < 2300$ → Laminar, $2300 < Re < 4000$ → Transitional, $Re > 4000$ → Turbulent.',
    },
    {
      title: '2 · Darcy-Weisbach equation',
      content: 'Head loss due to friction:',
      equation: 'h_f = f \\cdot \\frac{L}{D} \\cdot \\frac{V^2}{2g}',
      after: 'Pressure drop: $\\Delta P = \\rho g h_f$.',
      equation2: '\\Delta P = f \\cdot \\frac{L}{D} \\cdot \\frac{\\rho V^2}{2}',
      after2: `Current: $h_f = ${hf.toFixed(4)}\\;\\mathrm{m}$, $\\Delta P = ${dp.toFixed(1)}\\;\\mathrm{Pa}$`,
    },
    {
      title: '3 · Laminar — Hagen-Poiseuille',
      content: 'For $Re < 2300$, exact analytical solution:',
      equation: 'f_{\\mathrm{lam}} = \\frac{64}{Re}',
      after: 'Pressure drop form:',
      equation2: '\\Delta P = \\frac{128 \\mu L Q}{\\pi D^4}',
    },
    {
      title: '4 · Turbulent — Colebrook-White',
      content: 'Implicit equation for turbulent friction factor:',
      equation: '\\frac{1}{\\sqrt{f}} = -2\\log_{10}\\!\\left(\\frac{\\varepsilon/D}{3.7} + \\frac{2.51}{Re\\sqrt{f}}\\right)',
    },
    {
      title: '5 · Swamee-Jain approximation',
      content: 'Explicit, ±1% accuracy:',
      equation: 'f = \\frac{0.25}{\\left[\\log_{10}\\!\\left(\\frac{\\varepsilon/D}{3.7} + \\frac{5.74}{Re^{0.9}}\\right)\\right]^2}',
      after: `Current: $f = ${f.toFixed(6)}$`,
    },
    {
      title: '6 · Wall shear stress',
      equation: '\\tau_w = \\frac{f}{8}\\rho V^2 = \\frac{\\Delta P \\cdot D}{4L}',
    },
    {
      title: '7 · Energy equation',
      content: 'Steady-state between sections 1 and 2:',
      equation: '\\frac{P_1}{\\rho g} + \\frac{V_1^2}{2g} + z_1 = \\frac{P_2}{\\rho g} + \\frac{V_2^2}{2g} + z_2 + h_f',
      after: 'For horizontal constant-diameter pipe: $h_f = \\Delta P / (\\rho g)$.',
    },
    {
      title: '8 · Pumping power',
      equation: 'P_{\\mathrm{pump}} = \\Delta P \\cdot Q = \\rho g h_f Q',
    },
    {
      title: '9 · Dimensional analysis',
      content: 'Buckingham Π theorem gives:',
      equation: '\\frac{h_f}{(L/D)(V^2/2g)} = \\phi\\!\\left(Re,\\,\\varepsilon/D\\right) = f',
    },
  ]
}
