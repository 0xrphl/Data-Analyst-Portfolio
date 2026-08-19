/**
 * Full analytical derivations for both simulation cases.
 * Every constant expanded — nothing assumed.
 *
 * CASE A — solid insulating cube with an internal heater
 * CASE B — hollow furnace: shell of thickness D, empty cavity, centered heater
 *
 * Boundary condition in BOTH cases: outer surface held at T_wall (Dirichlet),
 * which makes the problem well-posed so a true steady state exists.
 */

export function getDerivation({ mode, L, kCond, Kdiff, q, Twall, srcRadius, wallD, kCavity }) {
  const tau = (L * L / (3 * Math.PI * Math.PI * Kdiff))
  const rhoC = kCond / Kdiff
  const a = srcRadius * L                 // heater radius, m
  const D = wallD * L                     // wall thickness, m
  const Li = L - 2 * D                    // inner cavity edge, m
  const Ke = Kdiff.toExponential(2)
  const rhoCe = rhoC.toExponential(2)
  // Simple 1-D plane-wall estimate of ΔT across the shell: q = k·A·ΔT/D
  const Aout = 6 * L * L
  const Ain = 6 * Math.max(0.01, Li) * Math.max(0.01, Li)
  const Amean = Math.sqrt(Aout * Ain)
  const dT1D = (q * D) / (kCond * Amean)

  const common = [
    { type: 'heading', title: mode === 'furnace' ? '🔥 Case B — Furnace (hollow cube)' : '🧱 Case A — Solid insulating cube' },

    {
      title: '0 · Physical constants',
      content: `All symbols used below, with the values currently set in the simulation:`,
    },
    {
      type: 'list',
      items: [
        `Thermal conductivity of the solid: $k = ${kCond}\\;\\mathrm{W/(m\\cdot K)}$`,
        `Thermal diffusivity: $K = k/(\\rho c) = ${Ke}\\;\\mathrm{m^2/s}$ — Fourier's constant`,
        `Volumetric heat capacity: $\\rho c = k/K = ${rhoCe}\\;\\mathrm{J/(m^3\\cdot K)}$`,
        `Outer edge length: $L = ${L}\\;\\mathrm{m}$`,
        `Heater power: $q = ${q.toFixed(0)}\\;\\mathrm{W}$, radius $a = ${a.toFixed(3)}\\;\\mathrm{m}$`,
        `Volumetric generation inside the heater: $\\dot{Q} = \\dfrac{q}{\\frac{4}{3}\\pi a^3}\\;\\mathrm{W/m^3}$`,
        `Outer surface temperature: $T_{\\mathrm{wall}} = ${Twall}\\,^\\circ\\mathrm{C}$ (Dirichlet)`,
        ...(mode === 'furnace' ? [
          `Wall thickness: $D = ${D.toFixed(3)}\\;\\mathrm{m}$`,
          `Inner cavity edge: $L_i = L - 2D = ${Li.toFixed(3)}\\;\\mathrm{m}$`,
          `Effective cavity conductivity: $k_{\\mathrm{cav}} = ${kCavity}\\;\\mathrm{W/(m\\cdot K)}$ (air + radiation lumped)`,
        ] : []),
      ],
    },

    {
      title: '1 · Governing equation',
      content: `Fourier's law of conduction:`,
      equation: `\\mathbf{q}_{\\mathrm{flux}} = -k\\,\\nabla u`,
      after: `Energy conservation on a control volume, with volumetric generation $\\dot{Q}$:`,
      equation2: `\\rho c\\,\\frac{\\partial u}{\\partial t} = -\\nabla\\cdot\\mathbf{q}_{\\mathrm{flux}} + \\dot{Q} = \\nabla\\cdot(k\\nabla u) + \\dot{Q}`,
      after2: `For piecewise-constant $k$ this becomes the heat equation:`,
      equation3: `\\frac{\\partial u}{\\partial t} = K\\left(\\frac{\\partial^2 u}{\\partial x^2}+\\frac{\\partial^2 u}{\\partial y^2}+\\frac{\\partial^2 u}{\\partial z^2}\\right) + \\frac{\\dot{Q}}{\\rho c}`,
    },

    {
      title: '2 · Boundary & initial conditions',
      content: `The outer surface of the cube $\\partial\\Omega$ is held at a fixed temperature:`,
      equation: `u(\\mathbf{x},t) = T_{\\mathrm{wall}} = ${Twall}\\,^\\circ\\mathrm{C}, \\qquad \\mathbf{x}\\in\\partial\\Omega`,
      after: `This Dirichlet condition is what makes the problem **well-posed**: heat generated inside always has a path out, so the energy balance $q_{\\mathrm{in}} = q_{\\mathrm{out}}$ can be satisfied and a unique steady state exists. (With a purely convective boundary into a *closed* air pocket the air temperature rises without bound and no steady state is ever reached.)`,
      equation2: `u(\\mathbf{x},0) = T_{\\mathrm{wall}} \\quad \\text{(uniform initial condition)}`,
    },
  ]

  const caseA = [
    {
      title: '3 · Shift to homogeneous BCs',
      content: `Let $v = u - T_{\\mathrm{wall}}$, so $v = 0$ on the boundary:`,
      equation: `\\frac{\\partial v}{\\partial t} = K\\nabla^2 v + \\frac{\\dot{Q}}{\\rho c}, \\qquad v|_{\\partial\\Omega}=0`,
    },
    {
      title: '4 · Eigenfunctions of the cube',
      content: `With Dirichlet BCs on $[0,L]^3$ the eigenfunctions of $-\\nabla^2$ are:`,
      equation: `\\phi_{nmp} = \\sin\\frac{n\\pi x}{L}\\sin\\frac{m\\pi y}{L}\\sin\\frac{p\\pi z}{L}, \\qquad \\lambda_{nmp}=\\frac{\\pi^2}{L^2}\\left(n^2+m^2+p^2\\right)`,
      after: `They are orthogonal:`,
      equation2: `\\int_\\Omega \\phi_{nmp}\\phi_{n'm'p'}\\,d\\mathbf{x} = \\frac{L^3}{8}\\,\\delta_{nn'}\\delta_{mm'}\\delta_{pp'}`,
    },
    {
      title: '5 · Steady state (Poisson problem)',
      content: `Setting $\\partial v/\\partial t = 0$ gives Poisson's equation:`,
      equation: `-k\\nabla^2 v_{ss} = \\dot{Q}(\\mathbf{x})`,
      after: `Expanding the generation field in the eigenbasis, $\\dot{Q} = \\sum \\hat{Q}_{nmp}\\phi_{nmp}$ with`,
      equation2: `\\hat{Q}_{nmp} = \\frac{8}{L^3}\\int_\\Omega \\dot{Q}(\\mathbf{x})\\,\\phi_{nmp}\\,d\\mathbf{x}`,
      after2: `and matching coefficients term by term:`,
      equation3: `v_{ss}(\\mathbf{x}) = \\sum_{n,m,p=1}^{\\infty}\\frac{\\hat{Q}_{nmp}}{k\\,\\lambda_{nmp}}\\;\\sin\\frac{n\\pi x}{L}\\sin\\frac{m\\pi y}{L}\\sin\\frac{p\\pi z}{L}`,
    },
    {
      title: '6 · Transient decay',
      content: `Write $v = v_{ss} + w$. The remainder $w$ obeys the homogeneous heat equation with $w(\\mathbf{x},0) = -v_{ss}$. Separation of variables $w = X(x)Y(y)Z(z)T(t)$ gives $T' = -K\\lambda_{nmp}T$, hence:`,
      equation: `w(\\mathbf{x},t) = -\\sum_{n,m,p}\\frac{\\hat{Q}_{nmp}}{k\\lambda_{nmp}}\\;e^{-K\\lambda_{nmp}t}\\;\\phi_{nmp}(\\mathbf{x})`,
    },
    {
      type: 'mainEq',
      equation: `\\boxed{\\,u(\\mathbf{x},t) = T_{\\mathrm{wall}} + \\sum_{n,m,p}\\frac{\\hat{Q}_{nmp}}{k\\,\\lambda_{nmp}}\\left(1-e^{-K\\lambda_{nmp}t}\\right)\\sin\\frac{n\\pi x}{L}\\sin\\frac{m\\pi y}{L}\\sin\\frac{p\\pi z}{L}\\,}`,
      after: `Every mode relaxes exponentially, so $u \\to T_{\\mathrm{wall}} + v_{ss}$ as $t\\to\\infty$ — a genuine steady state.`,
    },
    {
      title: '7 · Time constants',
      content: `The slowest mode $(1,1,1)$ sets the settling time:`,
      equation: `\\tau_{111} = \\frac{1}{K\\lambda_{111}} = \\frac{L^2}{3\\pi^2 K} = \\frac{(${L})^2}{3\\pi^2\\times ${Ke}} = ${tau.toFixed(0)}\\;\\mathrm{s}`,
      after: `Steady state is effectively reached at $t\\approx 5\\tau_{111} \\approx ${(5 * tau).toFixed(0)}\\;\\mathrm{s} \\approx ${(5 * tau / 3600).toFixed(2)}\\;\\mathrm{h}$. Insulators have small $K$, so this is slow — increase the *speed* slider to fast-forward.`,
    },
    {
      title: '8 · Calibrating q for a target core temperature',
      content: `The steady problem is **linear in $q$**. Solve once with $q = 1\\,\\mathrm{W}$ to get the peak rise $\\theta_1 = \\max(v_{ss})$, then the power needed for a target core temperature is exactly:`,
      equation: `q^\\ast = \\frac{T_{\\mathrm{core}}^{\\mathrm{target}} - T_{\\mathrm{wall}}}{\\theta_1}`,
      after: `The **🎯 Solve q for target** button performs exactly this: an SOR solve of the discrete Poisson system on the current geometry, then a single scaling. Current setting: core $\\to$ target with $T_{\\mathrm{wall}} = ${Twall}\\,^\\circ$C.`,
    },
    {
      title: '9 · Energy balance check',
      content: `At steady state all generated power must leave through the surface:`,
      equation: `q = \\oint_{\\partial\\Omega} -k\\,\\nabla u\\cdot \\mathbf{n}\\;dA`,
      after: `The HUD reports this as **balance %**. When it reads 100% the simulation has truly converged.`,
    },
  ]

  const caseB = [
    {
      title: '3 · Geometry of the furnace',
      content: `The domain is a hollow cube: a shell of thickness $D = ${D.toFixed(3)}$ m surrounding a cavity of inner edge $L_i = L-2D = ${Li.toFixed(3)}$ m. A heater cube of radius $a = ${a.toFixed(3)}$ m floats at the center of the cavity.`,
      equation: `\\Omega = \\underbrace{\\Omega_{\\mathrm{shell}}}_{k}\\;\\cup\\;\\underbrace{\\Omega_{\\mathrm{cav}}}_{k_{\\mathrm{cav}}}\\;\\cup\\;\\underbrace{\\Omega_{\\mathrm{heater}}}_{\\dot{Q}\\ne 0}`,
      after: `The cavity is not vacuum: natural convection plus radiation are lumped into an **effective conductivity** $k_{\\mathrm{cav}} = ${kCavity}\\;\\mathrm{W/(m\\cdot K)}$, a standard engineering simplification (Nusselt-based effective conductivity).`,
    },
    {
      title: '4 · Piecewise-constant conductivity',
      content: `Because $k$ jumps between regions we must keep it inside the divergence:`,
      equation: `\\rho c\\,\\frac{\\partial u}{\\partial t} = \\nabla\\cdot\\!\\left(k(\\mathbf{x})\\,\\nabla u\\right) + \\dot{Q}(\\mathbf{x})`,
      after: `At every material interface two conditions hold — continuity of temperature and of normal heat flux:`,
      equation2: `u\\big|_{-} = u\\big|_{+}, \\qquad k_-\\frac{\\partial u}{\\partial n}\\bigg|_{-} = k_+\\frac{\\partial u}{\\partial n}\\bigg|_{+}`,
      after2: `The solver enforces this automatically by using the **harmonic mean** conductivity on each cell face:`,
      equation3: `k_{\\mathrm{face}} = \\frac{2k_i k_j}{k_i + k_j}`,
    },
    {
      title: '5 · Steady state — thermal resistance network',
      content: `At steady state the heater power flows in series through the cavity and then the shell:`,
      equation: `q = \\frac{T_{\\mathrm{heater}} - T_{\\mathrm{wall}}}{R_{\\mathrm{cav}} + R_{\\mathrm{shell}}}`,
      after: `For the shell, the 1-D plane-wall resistance with the geometric-mean area $A_m=\\sqrt{A_iA_o}$ is:`,
      equation2: `R_{\\mathrm{shell}} = \\frac{D}{k\\,A_m}, \\qquad A_o = 6L^2 = ${Aout.toFixed(2)}\\,\\mathrm{m^2}, \\quad A_i = 6L_i^2 = ${Ain.toFixed(2)}\\,\\mathrm{m^2}`,
      after2: `giving the temperature drop across the wall:`,
      equation3: `\\Delta T_{\\mathrm{wall}} = \\frac{qD}{k A_m} = \\frac{${q.toFixed(0)}\\times ${D.toFixed(3)}}{${kCond}\\times ${Amean.toFixed(2)}} \\approx ${dT1D.toFixed(1)}\\;\\mathrm{K}`,
    },
    {
      title: '6 · Shape factor (exact 3-D correction)',
      content: `The 1-D estimate ignores corner effects. The exact conduction shape factor for a cubical shell (Hahne & Grigull) is:`,
      equation: `S = \\frac{A_i}{D} + 0.54\\sum_{\\mathrm{edges}} \\ell_{\\mathrm{edge}} + 1.2\\,D\\,(\\text{8 corners})`,
      after: `so that $q = kS\\,\\Delta T$. Edges and corners provide extra parallel paths, making the real $\\Delta T$ smaller than the plane-wall estimate. The simulation captures this exactly because it solves the full 3-D field.`,
    },
    {
      title: '7 · Full transient solution',
      content: `Inside each homogeneous region the field still expands in eigenfunctions, but the eigenvalue problem is now piecewise:`,
      equation: `-\\nabla\\cdot(k\\nabla\\psi_n) = \\rho c\\,\\mu_n\\,\\psi_n, \\qquad \\psi_n|_{\\partial\\Omega} = 0`,
      after: `with the interface conditions above. The solution has the same structure as Case A:`,
      equation2: `u(\\mathbf{x},t) = T_{\\mathrm{wall}} + \\sum_n \\frac{\\langle \\dot{Q},\\psi_n\\rangle}{\\rho c\\,\\mu_n\\,\\|\\psi_n\\|^2}\\left(1-e^{-\\mu_n t}\\right)\\psi_n(\\mathbf{x})`,
      after2: `but the $\\psi_n$ are no longer plain sines — they bend at the cavity/shell interface. This is exactly why we solve numerically with the harmonic-mean finite-volume scheme.`,
    },
    {
      title: '8 · What to watch in the simulation',
      content: `Because $k_{\\mathrm{cav}} \\ll k_{\\mathrm{shell}}$ typically, most of the temperature drop happens across the cavity, and the cavity becomes nearly isothermal (a well-stirred furnace interior). The HUD shows:`,
    },
    {
      type: 'list',
      items: [
        `**T core** — the heater surface temperature`,
        `**T cavity** — the mean furnace interior temperature (should be nearly uniform)`,
        `**T inner surf** — the inside face of the refractory wall`,
        `**T outer wall** — fixed at $${Twall}\\,^\\circ$C`,
        `**balance** — $q_{\\mathrm{through\\;wall}}/q_{\\mathrm{in}}$; reaches 100% at steady state`,
      ],
    },
    {
      title: '9 · Time constants',
      content: `Two time scales now compete — the shell and the cavity:`,
      equation: `\\tau_{\\mathrm{shell}} \\sim \\frac{D^2}{K} = \\frac{(${D.toFixed(3)})^2}{${Ke}} \\approx ${(D * D / Kdiff).toFixed(0)}\\;\\mathrm{s}, \\qquad \\tau_{\\mathrm{cav}} \\sim \\frac{L_i^2\\,\\rho c}{k_{\\mathrm{cav}}}`,
      after: `The slower of the two governs how long the furnace takes to reach operating temperature.`,
    },
  ]

  const numerics = [
    {
      title: '10 · Numerical scheme',
      content: `Finite-volume FTCS with harmonic-mean face conductivities on an $N^3$ grid, $\\Delta x = L/(N-1)$:`,
      equation: `u_P^{n+1} = u_P^{n} + \\frac{\\Delta t}{\\rho c\\,\\Delta x^2}\\sum_{F\\in\\mathrm{faces}} k_F\\left(u_F^{n}-u_P^{n}\\right) + \\frac{\\dot{Q}_P\\Delta t}{\\rho c}`,
      after: `Explicit stability requires:`,
      equation2: `\\Delta t \\le 0.85\\,\\frac{\\Delta x^2}{6\\,K_{\\max}}`,
      after2: `where $K_{\\max}$ is the largest diffusivity present (shell or cavity). The solver enforces this automatically, so the scheme is unconditionally well-behaved as you move the sliders.`,
    },
  ]

  return [...common, ...(mode === 'furnace' ? caseB : caseA), ...numerics]
}
