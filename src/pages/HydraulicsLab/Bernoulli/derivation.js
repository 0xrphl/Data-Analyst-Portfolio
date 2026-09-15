/**
 * derivation.js
 * Memoria analítica y deducción teórica: Teorema de Bernoulli y Medidor Venturi
 * Laboratorio de Hidráulica - Universidad Tecnológica de Pereira (UTP)
 */

export function getDerivation({
  taps,
  Q,
  rho,
  alpha,
  pitotTapIndex = 3,
  venturiData,
}) {
  const tap0 = taps?.[0] || { A: 4.9087e-4, D_mm: 25.0, V: 0.34, pressureHead_mm: 240, totalHead_mm: 246 }
  const tap1 = taps?.[1] || { A: 7.854e-5, D_mm: 10.0, V: 2.12, pressureHead_mm: 80, totalHead_mm: 235 }
  const tapP = taps?.[pitotTapIndex] || taps?.[3] || { A: 9.887e-5, D_mm: 11.22, V: 1.68, pressureHead_mm: 130, stagnationHead_mm: 240 }
  const tap6 = taps?.[6] || taps?.[taps.length - 1] || { pressureHead_mm: 190, totalHead_mm: 196 }

  const Q_Ls = (Q * 1000).toFixed(4)
  const Q_Lmin = (Q * 60000).toFixed(2)
  const netDiffLoss = (tap0.totalHead_mm || 0) - (tap6.totalHead_mm || 0)
  const netDiffLossPct = tap0.totalHead_mm > 0 ? (netDiffLoss / tap0.totalHead_mm) * 100 : 0

  return [
    { type: 'heading', title: '💧 Demostración del Teorema de Bernoulli (Tubo Venturi y Sonda Pitot)' },
    {
      title: '0 · Parámetros Experimentales del Banco Edibon FME-03',
      content: 'Valores hidrodinámicos y geométricos de ensayo:',
    },
    {
      type: 'list',
      items: [
        `Caudal de ensayo: $Q = ${Q_Ls}\\;\\mathrm{L/s} = ${Q_Lmin}\\;\\mathrm{L/min}$ ($Q = ${(Q).toExponential(4)}\\;\\mathrm{m^3/s}$)`,
        `Fluido: Agua a 20 °C con $\\rho = ${rho.toFixed(0)}\\;\\mathrm{kg/m^3}$ y viscosidad $\\mu = 1.002 \\times 10^{-3}\\;\\mathrm{Pa\\cdot s}$`,
        `Sección de entrada $S_0$: $A_0 = ${(tap0.A_mm2 || tap0.A * 1e6).toFixed(2)}\\;\\mathrm{mm^2}$ ($D_0 = ${tap0.D_mm.toFixed(2)}\\;\\mathrm{mm}$), $V_0 = ${tap0.V.toFixed(4)}\\;\\mathrm{m/s}$`,
        `Garganta de máxima contracción $S_1$: $A_1 = ${(tap1.A_mm2 || tap1.A * 1e6).toFixed(2)}\\;\\mathrm{mm^2}$ ($D_1 = ${tap1.D_mm.toFixed(2)}\\;\\mathrm{mm}$), $V_1 = ${tap1.V.toFixed(4)}\\;\\mathrm{m/s}$`,
        `Sección de medición con Sonda Pitot $S_{${pitotTapIndex}}$: $A = ${(tapP.A_mm2 || tapP.A * 1e6).toFixed(2)}\\;\\mathrm{mm^2}$, $V = ${tapP.V.toFixed(4)}\\;\\mathrm{m/s}$`,
        `Factor de corrección de energía cinética (Coriolis): $\\alpha = ${alpha.toFixed(2)}$`,
      ],
    },
    {
      title: '1 · Teorema de Bernoulli para Flujo Incompresible y Estacionario',
      content: 'A lo largo de una línea de corriente en flujo permanente, incompresible y no viscoso (ideal), la energía mecánica total por unidad de peso se conserva:',
      equation: '\\frac{P_1}{\\rho g} + \\alpha_1 \\frac{V_1^2}{2g} + z_1 = \\frac{P_2}{\\rho g} + \\alpha_2 \\frac{V_2^2}{2g} + z_2 = H_{\\text{Total}}',
      after: 'Para un conducto horizontal ($z_1 = z_2 = 0$), la altura total de carga $h_{\\text{Total}}^*$ se compone de la suma de la altura de presión estática y la cabeza de velocidad:',
      equation2: 'h_{\\text{Total}}^* = h + \\frac{V^2}{2g} = \\frac{P}{\\rho g} + \\frac{V^2}{2g}',
    },
    {
      title: '2 · Ecuación de Continuidad y Conservación de la Masa',
      content: 'Para un fluido incompresible con densidad constante en régimen estacionario, el caudal volumétrico $Q$ es idéntico a través de cualquier sección transversal:',
      equation: 'Q = A_0 V_0 = A_1 V_1 = A_i V_i = \\text{constante}',
      after: 'Por consiguiente, la velocidad media del flujo es inversamente proporcional al área de paso transversal:',
      equation2: 'V_i = \\frac{Q}{A_i} = \\frac{4 Q}{\\pi D_i^2}',
    },
    {
      title: '3 · Interconversión Dinámica de Presión y Velocidad',
      content: 'Al reducirse la sección transversal de $S_0$ a $S_1$ (cono convergente), el fluido acelera drásticamente, incrementando su energía cinética a expensas de una súbita caída de la presión estática:',
      equation: 'P_0 - P_1 = \\frac{1}{2} \\rho \\left( V_1^2 - V_0^2 \\right) = \\frac{\\rho Q^2}{2} \\left( \\frac{1}{A_1^2} - \\frac{1}{A_0^2} \\right)',
      after: 'En el cono divergente ($S_1 \\to S_6$), el área se expande y la velocidad disminuye, reconvirtiendo energía cinética en presión estática.',
    },
    {
      title: '4 · Línea de Energía Total (EGL) y Línea Piezométrica (HGL)',
      content: 'Las líneas de gradiente representan la distribución espacial de las distintas formas de energía:',
      equation: '\\text{EGL} = h_{\\text{Total}}^* = \\frac{P}{\\rho g} + \\frac{V^2}{2g} + z',
      equation2: '\\text{HGL} = h = \\frac{P}{\\rho g} + z = \\text{EGL} - \\frac{V^2}{2g}',
      after: 'La distancia vertical entre la EGL y la HGL corresponde exactamente a la cabeza cinética o carga dinámica $V^2 / (2g)$.',
    },
    {
      title: '5 · Ecuación 3.17 del Medidor Venturi y Coeficiente de Descarga (Cd)',
      content: 'Combinando la ecuación de Bernoulli ideal y la ecuación de continuidad entre la entrada $S_0$ y la sección $S_3$ se obtiene el caudal teórico ideal:',
      equation: 'Q_{\\text{teórico}} = A_0 \\sqrt{ \\frac{2g}{m^2 - 1} \\left( h_0 - h_3 \\right) } \\quad \\text{donde } m = \\frac{A_0}{A_3}',
      after: `Con la geometría del informe: $m = ${(venturiData?.m || 4.9648).toFixed(4)}$, $m^2 - 1 = ${(venturiData?.m2_minus_1 || 23.6493).toFixed(4)}$. El coeficiente de descarga real es:`,
      equation2: 'C_d = \\frac{Q_{\\text{real}}}{Q_{\\text{teórico}}} = ' + (venturiData?.Cd ? venturiData.Cd.toFixed(4) : '0.8318'),
    },
    {
      title: '6 · Sonda Pitot: Dos Cabezas de Presión y Velocidad Puntual',
      content: 'La sonda Pitot introduce una punta sensora en el filamento central de flujo que frena isentrópicamente el fluido hasta el reposo ($V=0$), registrando la presión total de estancamiento:',
      equation: 'P_{\\text{estancamiento}} = P_{\\text{estática}} + \\frac{1}{2} \\rho V_{\\text{local}}^2',
      after: 'En términos de columnas manométricas, la sonda permite registrar las dos cabezas fundamentales:',
      equation2: 'h_{\\text{Total}}^{**} = h_{\\text{estático}} + h_{\\text{din}} \\implies h_{\\text{din}} = h_{\\text{Total}}^{**} - h_{\\text{estático}}',
    },
    {
      title: '7 · Velocidad y Caudal Estimados mediante la Sonda Pitot',
      content: 'A partir de la cabeza dinámica diferencial $h_{\\text{din}}$, se determina la velocidad puntual en el eje del conducto:',
      equation: 'V_{\\text{Pitot}} = \\sqrt{2 g \\cdot h_{\\text{din}}} = \\sqrt{2 g \\left( h_{\\text{Total}}^{**} - h_{\\text{estático}} \\right)}',
      after: 'Si se extrapola la velocidad de eje a toda la sección transversal ($Q_{\\text{Pitot}} = A \\cdot V_{\\text{Pitot}}$), se sobreestima el caudal real debido a que en régimen turbulento la velocidad en el centro ($u_{\\max}$) es mayor que la velocidad media ($V_{\\text{prom}} / u_{\\max} \\approx 0.82 - 0.85$).',
      equation2: 'Q_{\\text{corregido}} = \\left( \\frac{V_{\\text{prom}}}{u_{\\max}} \\right) \\cdot Q_{\\text{Pitot}} \\approx Q',
    },
    {
      title: '8 · Pérdidas Irreversibles de Carga en el Cono Divergente (ΔhL)',
      content: 'En un fluido viscoso real, la desaceleración contra un gradiente adverso de presiones ($dp/dx > 0$) en el difusor engrosa la capa límite y genera micro-vórtices disipativos:',
      equation: `\\Delta h_L = h_{\\text{Total},0}^* - h_{\\text{Total},6}^* = ${(tap0.totalHead_mm || 0).toFixed(1)}\\;\\mathrm{mm} - ${(tap6.totalHead_mm || 0).toFixed(1)}\\;\\mathrm{mm} = ${netDiffLoss.toFixed(1)}\\;\\mathrm{mm}`,
      after: `Esta disipación irreversible (${netDiffLossPct.toFixed(1)}% de la carga inicial) impide que la presión estática de salida $h_6$ (${(tap6.pressureHead_mm || 0).toFixed(1)} mm) recupere plenamente el nivel de entrada $h_0$ (${(tap0.pressureHead_mm || 0).toFixed(1)} mm).`,
    },
  ]
}
