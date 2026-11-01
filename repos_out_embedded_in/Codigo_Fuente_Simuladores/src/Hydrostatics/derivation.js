/**
 * derivation.js
 * Memoria analítica y deducción teórica: Hidrostática de Superficies Sumergidas (PhD-Level).
 * UTP - Facultad de Mecánica Aplicada.
 */

export function getHydrostaticsDerivation({
  geometryId,
  rho = 1000,
  gamma = 9806.65,
  h = 2.0,
  submergedHeight = 2.0,
  submergedArea = 2.0,
  FH = 0,
  FV = 0,
  FR = 0,
  FR_angle_deg = 0,
  xcp = 0,
  ycp = 0,
  xcg = 0,
  ycg = 0,
  momentPivot = 0,
  gateWidth = 1.0,
  gateRollDeg = 0,
  thetaDeg = 90,
}) {
  const g = 9.80665

  return [
    {
      type: 'heading',
      title: '🌊 HIDROSTÁTICA AVANZADA: DEDUCCIÓN ANALÍTICA Y EMPUJES',
    },
    {
      title: '0 · Parámetros de Operación en Tiempo Real',
      content: 'Propiedades del fluido y magnitudes geométricas instantáneas en el dominio 3D:',
    },
    {
      type: 'list',
      items: [
        `Densidad: $\\rho = ${rho.toFixed(1)}\\;\\text{kg/m}^3$ | Gravedad: $g = ${g.toFixed(5)}\\;\\text{m/s}^2$`,
        `Peso específico: $\\gamma = \\rho g = ${gamma.toFixed(2)}\\;\\text{N/m}^3$ (${(gamma / 1000).toFixed(3)}\\;\\text{kN/m}^3)`,
        `Carga de agua: $h = ${h.toFixed(3)}\\;\\text{m}$ | Altura sumergida: $h_{\\text{sub}} = ${submergedHeight.toFixed(3)}\\;\\text{m}$`,
        `Área mojada calculada: $A = ${submergedArea.toFixed(3)}\\;\\text{m}^2$`,
        `Inclinación hacia atrás: $\\theta = ${thetaDeg}^\\circ$ | Giro planar normal: $\\phi = ${gateRollDeg}^\\circ$`,
        `Fuerza Resultante: $F_R = ${(FR / 1000).toFixed(2)}\\;\\text{kN}$ ($F_H = ${(FH / 1000).toFixed(2)}\\;\\text{kN}$, $F_V = ${(FV / 1000).toFixed(2)}\\;\\text{kN}$)`,
        `Ángulo resultante: $\\alpha = ${FR_angle_deg.toFixed(2)}^\\circ$`,
        `Centro de Gravedad: $CG = (${xcg.toFixed(3)}, ${ycg.toFixed(3)})\\;\\text{m}$`,
        `Centro de Presiones: $CP = (${xcp.toFixed(3)}, ${ycp.toFixed(3)})\\;\\text{m}$`,
        `Momento en base: $M = ${(momentPivot / 1000).toFixed(2)}\\;\\text{kN}\\cdot\\text{m}$`,
      ],
    },
    {
      title: '1 · Fundamentos Hidrostáticos y Navier-Stokes',
      content: 'A partir de Navier-Stokes para fluido incompresible en reposo $(\\mathbf{V} = \\mathbf{0})$:',
      equation: '\\nabla p = \\rho \\mathbf{g} \\implies \\frac{\\partial p}{\\partial x} = 0, \\quad \\frac{\\partial p}{\\partial y} = -\\rho g, \\quad \\frac{\\partial p}{\\partial z} = 0',
      after: 'Integrando verticalmente con condición de superficie libre $p(y = h) = 0$:',
      equation2: 'p(y) = \\int_y^h \\rho g \\, dy\' = \\rho g (h - y) = \\gamma \\cdot z(y)',
      after2: `Presión manométrica máxima en el fondo: $p_{\\max} = ${(gamma * submergedHeight / 1000).toFixed(2)}\\;\\text{kPa}$.`,
    },
    {
      title: '2 · Fuerza Hidrostática sobre Superficies Planas e Inclinadas',
      content: 'La fuerza resultante elemental $d\\mathbf{F}$ actúa normal a la superficie hacia el interior del sólido:',
      equation: 'd\\mathbf{F} = -p \\hat{\\mathbf{n}} \\, dA \\implies F_R = \\int_A p \\, dA = \\gamma \\int_A y\' \\sin\\theta \\, dA = \\gamma \\bar{h}_c A',
      after: `Con profundidad centroidal $\\bar{h}_c = ${Math.max(0, h - ycg).toFixed(3)}\\;\\text{m}$ y área mojada $A = ${submergedArea.toFixed(3)}\\;\\text{m}^2$, resulta $F_R = ${(FR / 1000).toFixed(2)}\\;\\text{kN}$.`,
    },
    {
      title: '3 · Centro de Presiones y Teorema de Ejes Paralelos (Steiner)',
      content: 'El punto de aplicación (CP) se obtiene igualando momentos estáticos:',
      equation: 'y_{cp} = y_c + \\frac{I_{xx,c}}{y_c A}, \\qquad x_{cp} = x_c + \\frac{I_{xy,c}}{y_c A}',
      after: 'Debido al gradiente lineal de presiones, el CP se ubica invariablemente por debajo del centro geométrico $CG$.',
    },
    {
      title: '4 · Geometrías de Compuertas y Momentos de Inercia',
      content: 'Momentos centroidales fundamentales para compuertas sumergidas o parcialmente sumergidas:',
      equation: '\\begin{aligned} \\text{Rectangular: } & I_{xx,c} = \\frac{b a^3}{12}, & A = b a \\\\[4pt] \\text{Triangular: } & I_{xx,c} = \\frac{b a^3}{36}, & A = \\frac{b a}{2} \\\\[4pt] \\text{Circular: } & I_{xx,c} = \\frac{\\pi D^4}{64}, & A = \\frac{\\pi D^2}{4} \\\\[4pt] \\text{Elíptica: } & I_{xx,c} = \\frac{\\pi a b^3}{4}, & A = \\pi a b \\end{aligned}',
      after: 'Para compuertas parcialmente sumergidas, la integración se evalúa sobre la porción mojada activa.',
    },
    {
      title: '5 · Teorema de Proyección para Superficies Curvas Generales',
      content: 'Para superficies continuas curvilíneas $y = f(x)$, la fuerza se descompone en componentes:',
      equation: 'F_H = \\gamma \\bar{h}_{c,x} A_x, \\qquad F_V = \\gamma V_{\\text{fluido superior}} = \\gamma \\int_0^{x_{\\max}} (h - y(x)) w \\, dx',
      after: `Componente horizontal: $F_H = ${(FH / 1000).toFixed(2)}\\;\\text{kN}$ (proyección vertical). Componente vertical: $F_V = ${(FV / 1000).toFixed(2)}\\;\\text{kN}$ (peso de la columna líquida). Fuerza resultante: $F_R = ${(FR / 1000).toFixed(2)}\\;\\text{kN}$.`,
    },
    {
      title: '6 · Equilibrio de Momentos y Acción sobre Pivote',
      content: 'Momento neto con respecto al eje de giro o gozne de la compuerta:',
      equation: 'M_{\\text{pivote}} = F_H (y_{cp} - y_{\\text{pivote}}) - |F_V| (x_{cp} - x_{\\text{pivote}})',
      after: `Momento en el pivote: $M_{\\text{pivote}} = ${(momentPivot / 1000).toFixed(2)}\\;\\text{kN}\\cdot\\text{m}$.`,
    },
  ]
}

