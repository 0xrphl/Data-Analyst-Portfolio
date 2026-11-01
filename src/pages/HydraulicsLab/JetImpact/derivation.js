/**
 * Memoria de Cálculo y Marco Teórico — Experimento N° 6
 * IMPACTO DE UN CHORRO SOBRE ÁLABES (Ecs. 6.1 a 6.12)
 */

export function getDerivation(results) {
  const {
    vaneName = 'Álabe Plano (90°)',
    angleDeg = 90,
    kFactor = 1.0,
    D = 0.008,
    A = 5.0265e-5,
    s = 0.020,
    rho = 1000,
    Q_Lmin = 10,
    Q_m3s = 0.0001667,
    V0 = 3.316,
    V1 = 3.256,
    totalMass_g = 50,
    Fexp = 0.4905,
    Fteo = 0.5529,
    efficiency = 50.0,
    balancePercent = 88.7,
    isBalanced = false,
  } = results || {}

  const cosDeg = Math.cos((angleDeg * Math.PI) / 180).toFixed(4)

  return [
    { type: 'heading', title: '🚿 EXPERIMENTO N° 6: IMPACTO DE UN CHORRO SOBRE ÁLABES' },
    {
      title: '0 · Parámetros de Ensayo en Tiempo Real',
      content: 'Configuración técnica y variables de operación del banco hidráulico:',
    },
    {
      type: 'list',
      items: [
        `Álabe seleccionado: **${vaneName}** (Deflexión $\\alpha = ${angleDeg}^\\circ$)`,
        `Tobera fija: $D = ${(D * 1000).toFixed(1)}\\;\\text{mm}$ ($A = ${(A * 1e6).toFixed(2)}\\;\\text{mm}^2$)`,
        `Distancia tobera-superficie: $s = ${(s * 1000).toFixed(0)}\\;\\text{mm}$`,
        `Densidad: $\\rho = ${rho}\\;\\text{kg/m}^3$ | Gravedad: $g = 9.81\\;\\text{m/s}^2$`,
        `Caudal actual: $Q = ${Q_Lmin.toFixed(2)}\\;\\text{L/min} = ${(Q_m3s * 1e4).toFixed(4)}\\times 10^{-4}\\;\\text{m}^3/\\text{s}$`,
        `Velocidad de salida: $V_0 = Q/A = ${V0.toFixed(3)}\\;\\text{m/s}$`,
        `Velocidad de impacto: $V_1 = \\sqrt{V_0^2 - 2gs} = ${V1.toFixed(3)}\\;\\text{m/s}$`,
        `Masa contrapesos: $m = ${totalMass_g}\\;\\text{g}$ ($F_{\\text{exp}} = mg = ${Fexp.toFixed(4)}\\;\\text{N}$)`,
        `Fuerza teórica: $F_{\\text{TEO}} = ${Fteo.toFixed(4)}\\;\\text{N}$`,
        `Nivelación: **${balancePercent.toFixed(2)}\\%** ${isBalanced ? '✅ (Fuerza Nivelada)' : '❌ (Desequilibrado)'}`,
      ],
    },
    {
      title: '1 · Ecuación de Continuidad (Conservación de Masa)',
      content: 'Para flujo incompresible en régimen permanente con densidad constante:',
      equation: '\\rho_1 V_1 A_1 = \\rho_2 V_2 A_2 \\quad \\xrightarrow{\\rho = \\text{cte}} \\quad V_1 A_1 = V_2 A_2 = Q',
      after: 'El caudal volumétrico $Q$ se conserva a lo largo del sistema (Ecs. 6.1 y 6.2).',
    },
    {
      title: '2 · Ecuación de Impulso y Cantidad de Movimiento',
      content: 'Segunda Ley de Newton aplicada al volumen de control en flujo permanente (Ecs. 6.3 - 6.5):',
      equation: '\\sum \\mathbf{F} = \\int_{SC} \\mathbf{V}(\\rho \\mathbf{V} \\cdot d\\mathbf{A}) = \\dot{m}(\\mathbf{V}_2 - \\mathbf{V}_1)',
      after: 'Descomponiendo en la dirección axial del chorro (eje $y$ vertical incidente):',
      equation2: 'F_y = \\dot{m}\\left(V_{\\text{in}} - V_{\\text{out}, y}\\right) = \\rho Q\\left(V_1 - V_2 \\cos\\alpha\\right)',
    },
    {
      title: '3 · Conservación de Energía (Bernoulli) en el Álabe',
      content: 'Aplicando Bernoulli entre la entrada (1) y la salida (2) del álabe (Ec. 6.8 y 6.9):',
      equation: '\\frac{p_1}{\\gamma} + \\frac{V_1^2}{2g} + z_1 = \\frac{p_2}{\\gamma} + \\frac{V_2^2}{2g} + z_2',
      after: 'Con el chorro a presión atmosférica ($p_1 = p_2 = p_{\\text{atm}}$), fricción despreciable y desnivel mínimo $\\Delta z \\approx 0$, resulta $V_2 \\approx V_1 = V$.',
    },
    {
      title: '4 · Fuerza Teórica y Factor Trigonométrico (1 - cos α)',
      content: 'Sustituyendo $V_2 = V_1 = V = Q/A$ en la ecuación de momentum (Ecs. 6.10 y 6.11):',
      equation: 'F_{\\text{TEO}} = \\dot{m} V (1 - \\cos\\alpha) = (1 - \\cos\\alpha)\\,\\frac{\\rho Q^2}{A}',
      after: `Para el álabe ensayado ($\\alpha = ${angleDeg}^\\circ$): $\\cos(${angleDeg}^\\circ) = ${cosDeg}$, por lo tanto factor $(1 - \\cos ${angleDeg}^\\circ) = ${kFactor.toFixed(4)}$.`,
    },
    {
      title: '5 · Fórmulas Analíticas Oficiales de las Tablas 6.1, 6.2 y 6.3',
      content: 'Expresiones teóricas dadas en la guía del laboratorio:',
      equation: 'F_{\\text{TEO}} = \\begin{cases} \\mathbf{1.0}\\,\\frac{\\rho Q^2}{A} & \\text{Plano } (\\alpha = 90^\\circ, \\cos 90^\\circ = 0) \\\\[6pt] \\mathbf{1.2}\\,\\frac{\\rho Q^2}{A} & \\text{Curvo } (\\alpha = 102^\\circ, 1 - \\cos 102^\\circ \\approx 1.208) \\\\[6pt] \\mathbf{2.0}\\,\\frac{\\rho Q^2}{A} & \\text{Semiesférico } (\\alpha = 180^\\circ, \\cos 180^\\circ = -1) \\end{cases}',
      after: 'El álabe semiesférico de 180° invierte totalmente el flujo, duplicando la fuerza respecto al plano.',
    },
    {
      title: '6 · Medición por Contrapesos y Nivelación (99% - 100%)',
      content: 'El equipo equilibra la fuerza hidrodinámica del chorro ascendente con el peso de las masas calibradas:',
      equation: 'F_{\\text{exp}} = m_{\\text{total}} \\cdot g = F_{\\text{TEO}}',
      after: 'La fuerza se considera **NIVELADA** cuando el cociente entre ambas fuerzas alcanza entre **99% y 100%**, alineando la ranura de la plataforma con el índice fijo.',
    },
    {
      title: '7 · Eficiencia Hidráulica (η)',
      content: 'Calculada con base en la máxima fuerza teórica aprovechable (álabe de 180°):',
      equation: '\\eta = \\left( \\frac{F_{\\text{exp}}}{2\\,\\frac{\\rho Q^2}{A}} \\right) \\times 100\\%',
      after: `Valor actual: $\\eta = ${efficiency.toFixed(2)}\\%$. Máximos teóricos en equilibrio: $\\eta_{90^\\circ} = 50\\%$, $\\eta_{102^\\circ} \\approx 60\\%$, y $\\eta_{180^\\circ} = 100\\%$.`,
    },
  ]
}

