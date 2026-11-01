import React, { useMemo, useState, useEffect } from 'react'
import HydrostaticsScene from './HydrostaticsScene.jsx'
import DerivationPanel from '../DerivationPanel.jsx'
import HydrostaticsCharts from './HydrostaticsCharts.jsx'
import { getHydrostaticsDerivation } from './derivation.js'
import {
  solveHydrostatics,
  solveSubmergedGate,
  FLUID_PRESETS,
  WALL_GEOMETRIES,
  GATE_SHAPES,
} from './solver.js'


const SIDEBAR_WIDTH = 'clamp(520px, 40vw, 720px)'

export default function HydrostaticsSim() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('controls')
  const [hudCollapsed, setHudCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [geometryId, setGeometryId] = useState('flat_vertical')
  const [fluidKey, setFluidKey] = useState('water_20')
  const [rhoCustom, setRhoCustom] = useState(1000)
  const [h, setH] = useState(2.0)
  const [gateHeight, setGateHeight] = useState(2.5)
  const [gateWidth, setGateWidth] = useState(1.2)
  const [thetaDeg, setThetaDeg] = useState(60)
  const [radius, setRadius] = useState(2.2)
  const [shapeParam, setShapeParam] = useState(0.5)
  const [simMode, setSimMode] = useState('wall') // 'wall' o 'gate'
  const [gateShape, setGateShape] = useState('gate_rectangle')
  const [gateDepthY, setGateDepthY] = useState(0.8)
  const [gateDimA, setGateDimA] = useState(1.4)
  const [gateDimB, setGateDimB] = useState(1.0)
  const [gateThetaDeg, setGateThetaDeg] = useState(90)
  const [gateRollDeg, setGateRollDeg] = useState(0)


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 880)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentFluid = FLUID_PRESETS[fluidKey]
  const currentRho = fluidKey === 'custom' ? rhoCustom : currentFluid.rho

  const hydroSolution = useMemo(() => {
    if (simMode === 'gate') {
      return solveSubmergedGate({
        gateShape,
        rho: currentRho,
        h,
        gateDepthY,
        gateDimA,
        gateDimB,
        thetaDeg: gateThetaDeg,
        gateRollDeg,
      })
    }
    return solveHydrostatics({
      geometryId,
      rho: currentRho,
      h,
      gateHeight,
      gateWidth,
      thetaDeg,
      radius,
      shapeParam,
      pivotY: 0.0,
      nSegments: 150,
    })
  }, [
    simMode,
    gateShape,
    gateDepthY,
    gateDimA,
    gateDimB,
    gateThetaDeg,
    gateRollDeg,
    geometryId,
    currentRho,
    h,
    gateHeight,
    gateWidth,
    thetaDeg,
    radius,
    shapeParam,
  ])

  const derivationData = useMemo(() => {
    return getHydrostaticsDerivation({
      geometryId: simMode === 'gate' ? gateShape : geometryId,
      rho: hydroSolution.rho,
      gamma: hydroSolution.gamma,
      h: hydroSolution.h,
      submergedHeight: hydroSolution.submergedHeight,
      submergedArea: hydroSolution.submergedArea,
      FH: hydroSolution.FH,
      FV: hydroSolution.FV,
      FR: hydroSolution.FR,
      FR_angle_deg: hydroSolution.FR_angle_deg,
      xcp: hydroSolution.xcp,
      ycp: hydroSolution.ycp,
      xcg: hydroSolution.xcg,
      ycg: hydroSolution.ycg,
      momentPivot: hydroSolution.momentPivot,
      gateWidth: hydroSolution.gateWidth,
      gateRollDeg: simMode === 'gate' ? gateRollDeg : 0,
      thetaDeg: simMode === 'gate' ? gateThetaDeg : thetaDeg,
    })
  }, [simMode, gateShape, geometryId, hydroSolution, gateRollDeg, gateThetaDeg, thetaDeg])

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 130,
            background: 'rgba(13, 16, 32, 0.94)',
            border: '1px solid #2a3152',
            color: '#82cfff',
            borderRadius: 7,
            padding: '7px 13px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Panel de Controles y Resultados
        </button>
      )}

      <div style={{ flex: 1, position: 'relative', height: '100%', minWidth: 0 }}>
        <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 30, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              background: 'rgba(11, 13, 26, 0.95)',
              border: '1px solid #2a3152',
              borderRadius: 10,
              padding: hudCollapsed ? '6px 12px' : '10px 14px',
              fontSize: 11.5,
              lineHeight: 1.5,
              width: hudCollapsed ? 'auto' : 'clamp(280px, 23vw, 320px)',
              color: '#d0d5e8',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#82cfff', fontSize: 12.5 }}>
                Telemetria Hidrostatica (PhD)
              </span>
              <button
                onClick={() => setHudCollapsed(!hudCollapsed)}
                style={{ background: 'none', border: 'none', color: '#9aa2c0', cursor: 'pointer', fontSize: 11 }}
              >
                {hudCollapsed ? '[+]' : '[-]'}
              </button>
            </div>

            {!hudCollapsed && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa2c0' }}>Geometria:</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{WALL_GEOMETRIES[geometryId]?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa2c0' }}>Densidad (rho):</span>
                  <span style={{ color: '#82cfff', fontFamily: 'monospace' }}>{currentRho.toFixed(1)} kg/m3</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa2c0' }}>Presion Fondo (p_max):</span>
                  <span style={{ color: '#82cfff', fontFamily: 'monospace' }}>{(hydroSolution.pMax / 1000).toFixed(2)} kPa</span>
                </div>
                <div style={{ borderTop: '1px solid #1e2338', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>Empuje Horizontal (F_H):</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
                    {(hydroSolution.FH / 1000).toFixed(2)} kN
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#c084fc', fontWeight: 600 }}>Empuje Vertical (F_V):</span>
                  <span style={{ color: '#c084fc', fontFamily: 'monospace', fontWeight: 700 }}>
                    {(Math.abs(hydroSolution.FV) / 1000).toFixed(2)} kN
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>Fuerza Resultante (F_R):</span>
                  <span style={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: 800, fontSize: 13 }}>
                    {(hydroSolution.FR / 1000).toFixed(2)} kN
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa2c0' }}>Angulo de Accion:</span>
                  <span style={{ color: '#82cfff', fontFamily: 'monospace' }}>{hydroSolution.FR_angle_deg.toFixed(1)} deg</span>
                </div>
                <div style={{ borderTop: '1px solid #1e2338', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#10b981' }}>Centro Gravedad (CG):</span>
                  <span style={{ color: '#10b981', fontFamily: 'monospace' }}>
                    ({hydroSolution.xcg.toFixed(2)}, {hydroSolution.ycg.toFixed(2)}) m
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>Centro Presiones (CP):</span>
                  <span style={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: 700 }}>
                    ({hydroSolution.xcp.toFixed(2)}, {hydroSolution.ycp.toFixed(2)}) m
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>Momento en Base (M_0):</span>
                  <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>
                    {(hydroSolution.momentPivot / 1000).toFixed(2)} kN.m
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <HydrostaticsScene
          mode={simMode}
          geometryId={geometryId}
          gateShape={gateShape}
          gateDepthY={gateDepthY}
          gateDimA={gateDimA}
          gateDimB={gateDimB}
          gateRollDeg={gateRollDeg}
          rho={currentRho}
          h={h}
          gateHeight={gateHeight}
          gateWidth={simMode === 'gate' ? gateDimB : gateWidth}
          thetaDeg={simMode === 'gate' ? gateThetaDeg : thetaDeg}
          radius={radius}
          shapeParam={shapeParam}
          submergedHeight={hydroSolution.submergedHeight}
          FH={hydroSolution.FH}
          FV={hydroSolution.FV}
          FR={hydroSolution.FR}
          xcp={hydroSolution.xcp}
          ycp={hydroSolution.ycp}
          xcg={hydroSolution.xcg}
          ycg={hydroSolution.ycg}
          samples={hydroSolution.samples}
          fluidColor={currentFluid.color}
        />
      </div>
      <div style={{
        width: sidebarOpen ? (isMobile ? '100vw' : SIDEBAR_WIDTH) : '0px',
        maxWidth: isMobile ? '100vw' : '760px',
        borderLeft: sidebarOpen ? '1px solid #1e2338' : 'none',
        background: '#0b0d1a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        zIndex: isMobile ? 120 : 20,
        position: isMobile ? 'fixed' : 'relative',
        right: 0,
        top: 0,
        bottom: 0,
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #1e2338', background: '#0d1020', padding: '4px 6px', gap: 6 }}>
          <button
            onClick={() => setActiveTab('controls')}
            style={{
              flex: 1,
              padding: '8px 10px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'controls' ? '#1a237e' : 'transparent',
              color: activeTab === 'controls' ? '#82cfff' : '#9aa2c0',
            }}
          >
            Parametros & Pared
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            style={{
              flex: 1,
              padding: '8px 10px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'charts' ? '#1a237e' : 'transparent',
              color: activeTab === 'charts' ? '#82cfff' : '#9aa2c0',
            }}
          >
            Graficas & Presion
          </button>
          <button
            onClick={() => setActiveTab('derivation')}
            style={{
              flex: 1,
              padding: '8px 10px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'derivation' ? '#1a237e' : 'transparent',
              color: activeTab === 'derivation' ? '#82cfff' : '#9aa2c0',
            }}
          >
            Deduccion Teorica
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: '1px solid #2a3152',
              background: 'rgba(255,255,255,0.05)',
              color: '#82cfff',
              cursor: 'pointer',
            }}
          >
            X
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'controls' && (
            <div>

              {/* Selector de Modo: Presa Curva vs Compuerta Sumergida */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1e30', background: 'rgba(10, 14, 28, 0.6)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9aa2c0', marginBottom: 8, textTransform: 'uppercase' }}>
                  Modo de Simulacion
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    onClick={() => setSimMode('wall')}
                    style={{
                      background: simMode === 'wall' ? '#2563eb' : '#141829',
                      border: `1px solid ${simMode === 'wall' ? '#60a5fa' : '#232942'}`,
                      color: simMode === 'wall' ? '#fff' : '#94a3b8',
                      borderRadius: 6,
                      padding: '8px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Presa / Curvas
                  </button>
                  <button
                    onClick={() => setSimMode('gate')}
                    style={{
                      background: simMode === 'gate' ? '#2563eb' : '#141829',
                      border: `1px solid ${simMode === 'gate' ? '#60a5fa' : '#232942'}`,
                      color: simMode === 'gate' ? '#fff' : '#94a3b8',
                      borderRadius: 6,
                      padding: '8px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Compuerta Sumergida
                  </button>
                </div>
              </div>

              {simMode === 'gate' && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1e30', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#82cfff' }}>
                    1. Forma de Compuerta Sumergida
                  </div>
                  <select
                    value={gateShape}
                    onChange={(e) => setGateShape(e.target.value)}
                    style={{
                      background: '#0d1020',
                      color: '#fff',
                      border: '1px solid #2a3152',
                      borderRadius: 6,
                      padding: '8px 10px',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {Object.values(GATE_SHAPES).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: 11, color: '#9aa2c0', lineHeight: 1.4 }}>
                    {GATE_SHAPES[gateShape]?.description}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Cota Base (y_base):</span>
                        <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{gateDepthY.toFixed(2)} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="2.5"
                        step="0.05"
                        value={gateDepthY}
                        onChange={(e) => setGateDepthY(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#4589ff' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Altura / Diametro (a):</span>
                        <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{gateDimA.toFixed(2)} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={gateDimA}
                        onChange={(e) => setGateDimA(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#4589ff' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Ancho / Eje Horiz (b):</span>
                        <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{gateDimB.toFixed(2)} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={gateDimB}
                        onChange={(e) => setGateDimB(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#4589ff' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Inclinacion hacia atras (Theta):</span>
                        <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{gateThetaDeg} deg</span>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="90"
                        step="1"
                        value={gateThetaDeg}
                        onChange={(e) => setGateThetaDeg(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#4589ff' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Rotacion en plano normal (Roll):</span>
                        <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{gateRollDeg} deg</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={gateRollDeg}
                        onChange={(e) => setGateRollDeg(parseInt(e.target.value, 10))}
                        style={{ width: '100%', accentColor: '#4589ff' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Nivel de Agua / Columna (h):</span>
                        <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{h.toFixed(2)} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="8.0"
                        step="0.05"
                        value={h}
                        onChange={(e) => setH(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#4589ff' }}
                      />
                    </div>

                  </div>
                </div>
              )}

              {simMode === 'wall' && (
                <div>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1e30', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#82cfff' }}>
                  1. Geometria de la Pared / Compuerta
                </div>
                <select
                  value={geometryId}
                  onChange={(e) => setGeometryId(e.target.value)}
                  style={{
                    background: '#0d1020',
                    color: '#fff',
                    border: '1px solid #2a3152',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {Object.values(WALL_GEOMETRIES).map((geom) => (
                    <option key={geom.id} value={geom.id}>
                      {geom.name}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 11, color: '#9aa2c0', lineHeight: 1.4 }}>
                  {WALL_GEOMETRIES[geometryId]?.description}
                </div>
              </div>
            {geometryId === 'flat_inclined' && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1e30' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Angulo (theta):</span>
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{thetaDeg} deg</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    step="1"
                    value={thetaDeg}
                    onChange={(e) => setThetaDeg(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#4589ff' }}
                  />
                </div>
              )}
              {(geometryId === 'circular_cylindrical' || geometryId === 'elliptical') && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1e30' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Radio (R):</span>
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{radius.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.1"
                    value={radius}
                    onChange={(e) => setRadius(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#4589ff' }}
                  />
                </div>
              )}
              {(geometryId === 'parabolic' || geometryId === 'cubic') && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1e30' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Coeficiente Forma (a):</span>
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{shapeParam.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.05"
                    value={shapeParam}
                    onChange={(e) => setShapeParam(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#4589ff' }}
                  />
                </div>
              )}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1e30', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#82cfff' }}>
                  2. Fluido y Densidad
                </div>
                <select
                  value={fluidKey}
                  onChange={(e) => setFluidKey(e.target.value)}
                  style={{
                    background: '#0d1020',
                    color: '#fff',
                    border: '1px solid #2a3152',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {Object.entries(FLUID_PRESETS).map(([key, f]) => (
                    <option key={key} value={key}>
                      {f.name} (rho = {f.rho} kg/m3)
                    </option>
                  ))}
                </select>
                {fluidKey === 'custom' && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Densidad Personalizada:</span>
                      <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{rhoCustom} kg/m3</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="14000"
                      step="50"
                      value={rhoCustom}
                      onChange={(e) => setRhoCustom(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#4589ff' }}
                    />
                  </div>
                )}
              </div>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1e30', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#82cfff' }}>
                  3. Nivel de Agua & Compuerta
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Altura Lamina (h):</span>
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{h.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="6.0"
                    step="0.05"
                    value={h}
                    onChange={(e) => setH(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#4589ff' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Altura Compuerta (L):</span>
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{gateHeight.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="6.0"
                    step="0.1"
                    value={gateHeight}
                    onChange={(e) => setGateHeight(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#4589ff' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: '#9aa2c0', fontWeight: 600 }}>Ancho (w):</span>
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#82cfff' }}>{gateWidth.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={gateWidth}
                    onChange={(e) => setGateWidth(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#4589ff' }}
                  />
                </div>
                </div>

              </div>
              )}

              <div style={{ padding: 16 }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #1e293b', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>Resumen Analitico de Empujes</div>
                  <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>
                    Fuerza Resultante F_R: <b>{(hydroSolution.FR / 1000).toFixed(2)} kN</b><br />
                    Componente Horizontal F_H: <b>{(hydroSolution.FH / 1000).toFixed(2)} kN</b><br />
                    Componente Vertical F_V: <b>{(Math.abs(hydroSolution.FV) / 1000).toFixed(2)} kN</b><br />
                    Centro de Presiones: <b>x_cp = {hydroSolution.xcp.toFixed(3)} m, y_cp = {hydroSolution.ycp.toFixed(3)} m</b><br />
                    Centro de Gravedad: <b>x_cg = {hydroSolution.xcg.toFixed(3)} m, y_cg = {hydroSolution.ycg.toFixed(3)} m</b><br />
                    {simMode === 'gate' && (
                      <>
                        Giro Planar (Roll): <b>{gateRollDeg}&deg;</b> | Inclinación: <b>{gateThetaDeg}&deg;</b><br />
                      </>
                    )}
                    Momento en base: <b>{(hydroSolution.momentBase / 1000).toFixed(2)} kN.m</b><br />
                    Estado estabilidad: <b style={{ color: hydroSolution.overturningRisk === 'Alto' ? '#ef4444' : '#10b981' }}>{hydroSolution.overturningRisk}</b>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'charts' && (
            <div style={{ padding: 16 }}>
              <HydrostaticsCharts
                samples={hydroSolution.samples}
                FH={hydroSolution.FH}
                FV={hydroSolution.FV}
                FR={hydroSolution.FR}
                pMax={hydroSolution.pMax}
                h={hydroSolution.h}
              />
            </div>
          )}
          {activeTab === 'derivation' && (
            <div style={{ padding: 14 }}>
              <DerivationPanel sections={derivationData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
