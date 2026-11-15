import React, { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import RainbowParticles from '../RainbowParticles.jsx'
import IsoRings from '../IsoRings.jsx'
import { getInterpolatedRadius } from './solver.js'

const SC = 4.0
const RAD_SC = 9.5

function VenturiTube({ tapResults, Ltotal, cutawayMode = true, onSelectPosition }) {
  const { fullGeom, backHalfGeom, outerBackHalfGeom, topCutFaceGeom, botCutFaceGeom, cutEdgeTopGeom, cutEdgeBotGeom } = useMemo(() => {
    const ptsInner = []
    const ptsOuter = []
    const n = 110
    const wallThick = 0.0085
    const topPositions = []
    const botPositions = []
    const topEdgePts = []
    const botEdgePts = []

    for (let i = 0; i <= n; i++) {
      const t = i / n
      const rIn = Math.max(0.02, getInterpolatedRadius(t, tapResults) * RAD_SC)
      const rOut = rIn + wallThick
      const y = (t - 0.5) * Ltotal * SC
      ptsInner.push(new THREE.Vector2(rIn, y))
      ptsOuter.push(new THREE.Vector2(rOut, y))
      topEdgePts.push(new THREE.Vector3(y, rIn, 0.001))
      botEdgePts.push(new THREE.Vector3(y, -rIn, 0.001))

      if (i < n) {
        const tNext = (i + 1) / n
        const rInNext = Math.max(0.02, getInterpolatedRadius(tNext, tapResults) * RAD_SC)
        const rOutNext = rInNext + wallThick
        const yNext = (tNext - 0.5) * Ltotal * SC
        topPositions.push(y, rIn, 0, yNext, rInNext, 0, yNext, rOutNext, 0, y, rIn, 0, yNext, rOutNext, 0, y, rOut, 0)
        botPositions.push(y, -rOut, 0, yNext, -rOutNext, 0, yNext, -rInNext, 0, y, -rOut, 0, yNext, -rInNext, 0, y, -rIn, 0)
      }
    }

    const full = new THREE.LatheGeometry(ptsInner, 56)
    const backInner = new THREE.LatheGeometry(ptsInner, 40, Math.PI / 2, Math.PI)
    const backOuter = new THREE.LatheGeometry(ptsOuter, 40, Math.PI / 2, Math.PI)
    const topFace = new THREE.BufferGeometry()
    topFace.setAttribute('position', new THREE.Float32BufferAttribute(topPositions, 3))
    topFace.computeVertexNormals()
    const botFace = new THREE.BufferGeometry()
    botFace.setAttribute('position', new THREE.Float32BufferAttribute(botPositions, 3))
    botFace.computeVertexNormals()

    return {
      fullGeom: full,
      backHalfGeom: backInner,
      outerBackHalfGeom: backOuter,
      topCutFaceGeom: topFace,
      botCutFaceGeom: botFace,
      cutEdgeTopGeom: new THREE.BufferGeometry().setFromPoints(topEdgePts),
      cutEdgeBotGeom: new THREE.BufferGeometry().setFromPoints(botEdgePts),
    }
  }, [tapResults, Ltotal])

  const handleTubeClick = useCallback((e) => {
    if (!onSelectPosition) return
    e.stopPropagation()
    const xNorm = Math.max(0.02, Math.min(0.98, e.point.x / (Ltotal * SC) + 0.5))
    onSelectPosition(xNorm)
  }, [onSelectPosition, Ltotal])

  if (!cutawayMode) {
    return (
      <mesh geometry={fullGeom} rotation={[0, 0, -Math.PI / 2]} onClick={handleTubeClick}>
        <meshPhysicalMaterial color="#80deea" transparent opacity={0.28} roughness={0.08} metalness={0.15} transmission={0.65} ior={1.333} side={THREE.DoubleSide} />
      </mesh>
    )
  }

  return (
    <group>
      <mesh geometry={backHalfGeom} rotation={[0, 0, -Math.PI / 2]} onClick={handleTubeClick}>
        <meshPhysicalMaterial color="#4dd0e1" transparent opacity={0.34} roughness={0.1} metalness={0.18} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={outerBackHalfGeom} rotation={[0, 0, -Math.PI / 2]}>
        <meshPhysicalMaterial color="#26c6da" transparent opacity={0.18} roughness={0.15} metalness={0.2} side={THREE.BackSide} />
      </mesh>
      <mesh geometry={topCutFaceGeom} onClick={handleTubeClick}>
        <meshStandardMaterial color="#00e5ff" emissive="#00838f" emissiveIntensity={0.55} transparent opacity={0.78} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={botCutFaceGeom} onClick={handleTubeClick}>
        <meshStandardMaterial color="#00e5ff" emissive="#00838f" emissiveIntensity={0.55} transparent opacity={0.78} side={THREE.DoubleSide} />
      </mesh>
      <line geometry={cutEdgeTopGeom}>
        <lineBasicMaterial color="#84ffff" linewidth={2} />
      </line>
      <line geometry={cutEdgeBotGeom}>
        <lineBasicMaterial color="#84ffff" linewidth={2} />
      </line>
    </group>
  )
}

function SectionRings({ tapResults, Ltotal, cutawayMode = true, onSelectPosition }) {
  if (!tapResults) return null
  return tapResults.map((tap, i) => {
    const xPos = (tap.xNorm - 0.5) * Ltotal * SC
    const r = (tap.D / 2) * RAD_SC
    const isThroat = i === 1
    const isPitot = tap.isPitotLocation
    const ringColor = isThroat ? '#ff1744' : (isPitot ? '#00e676' : '#ff9800')

    return (
      <group key={tap.id || i} position={[xPos, 0, 0]}>
        <mesh
          rotation={cutawayMode ? [0, Math.PI / 2, Math.PI / 2] : [0, Math.PI / 2, 0]}
          onClick={(e) => {
            if (onSelectPosition) {
              e.stopPropagation()
              onSelectPosition(tap.xNorm, tap.name)
            }
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { document.body.style.cursor = 'auto' }}
        >
          <torusGeometry args={[r, 0.011, 14, 48, cutawayMode ? Math.PI : Math.PI * 2]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringColor}
            emissiveIntensity={isPitot ? 0.85 : 0.55}
            transparent
            opacity={0.92}
          />
        </mesh>
        <Billboard position={[0, -(r + 0.075), 0]}>
          <Text fontSize={0.062} color={ringColor} fontWeight={700} anchorY="top">
            {tap.name || ('S' + i)}
          </Text>
          <Text fontSize={0.038} color="#e0e7ff" anchorY="top" position={[0, -0.068, 0]}>
            {tap.A_mm2.toFixed(1) + ' mm²'}
          </Text>
          <Text fontSize={0.034} color="#82cfff" anchorY="top" position={[0, -0.108, 0]}>
            {'∅' + tap.D_mm.toFixed(1) + ' mm'}
          </Text>
        </Billboard>
      </group>
    )
  })
}

function PitotStreamlines3D({ tipX, stemX, pipeR, probeBodyR, show = true }) {
  const { centralLine, deflectedLines } = useMemo(() => {
    const startX = tipX - 0.16
    const endX = stemX + 0.07

    const cPts = [
      new THREE.Vector3(startX, 0, 0),
      new THREE.Vector3(tipX - 0.05, 0, 0),
      new THREE.Vector3(tipX - 0.006, 0, 0),
    ]
    const central = new THREE.BufferGeometry().setFromPoints(cPts)

    const offsets = [-0.62, -0.34, 0.34, 0.62]
    const defLines = offsets.map((frac) => {
      const sign = frac >= 0 ? 1 : -1
      const yFar = frac * pipeR * 0.82
      const minClearance = probeBodyR * 1.65 + Math.abs(frac) * (pipeR - probeBodyR * 1.5) * 0.58
      const yDeflect = sign * Math.min(pipeR * 0.88, Math.max(Math.abs(yFar) * 1.18, minClearance))

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startX, yFar, 0),
        new THREE.Vector3(tipX - 0.055, yFar * 1.03, 0),
        new THREE.Vector3(tipX - 0.008, yDeflect * 0.86, 0),
        new THREE.Vector3(tipX + 0.045, yDeflect, 0),
        new THREE.Vector3(stemX - 0.015, yDeflect, 0),
        new THREE.Vector3(endX, yDeflect * 0.94, 0),
      ])
      return new THREE.BufferGeometry().setFromPoints(curve.getPoints(42))
    })

    return { centralLine: central, deflectedLines: defLines }
  }, [tipX, stemX, pipeR, probeBodyR])

  if (!show) return null

  return (
    <group>
      {/* Línea central de impacto que se frena en el punto de estancamiento (V -> 0) */}
      <line geometry={centralLine}>
        <lineBasicMaterial color="#ff9100" linewidth={2} />
      </line>
      {/* Líneas de corriente que se abren alrededor de la punta encogida */}
      {deflectedLines.map((geom, idx) => (
        <line key={idx} geometry={geom}>
          <lineBasicMaterial color={idx === 1 || idx === 2 ? '#00e5ff' : '#38bdf8'} transparent opacity={0.85} />
        </line>
      ))}
    </group>
  )
}

function Piezometers({ tapResults, Ltotal, maxPH = 0.38, fluidColor = '#0288d1', meniscusColor = '#4fc3f7' }) {
  if (!tapResults) return null
  const tubeH = 1.35

  return tapResults.map((tap, i) => {
    const xPos = (tap.xNorm - 0.5) * Ltotal * SC
    const pipeR = (tap.D / 2) * RAD_SC
    const ph = Math.max(0.005, tap.pressureHead)
    const waterH = Math.min(tubeH * 0.98, Math.max(0.04, (ph / maxPH) * tubeH))

    return (
      <group key={tap.id || i} position={[xPos, pipeR, 0]}>
        <mesh position={[0, tubeH / 2, 0]}>
          <cylinderGeometry args={[0.016, 0.016, tubeH, 14]} />
          <meshPhysicalMaterial color="#b3e5fc" transparent opacity={0.25} roughness={0.05} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, waterH / 2, 0]}>
          <cylinderGeometry args={[0.0135, 0.0135, waterH, 14]} />
          <meshPhysicalMaterial color={fluidColor} emissive={fluidColor} emissiveIntensity={0.32} transparent opacity={0.82} />
        </mesh>
        <mesh position={[0, waterH, 0]}>
          <cylinderGeometry args={[0.0138, 0.0138, 0.004, 14]} />
          <meshStandardMaterial color={meniscusColor} emissive={meniscusColor} emissiveIntensity={0.85} />
        </mesh>
        {/* Etiqueta centrada directamente sobre el menisco del fluido */}
        <Billboard position={[0, waterH + 0.045, 0]}>
          <Text fontSize={0.034} color={meniscusColor} anchorX="center" anchorY="bottom" fontWeight={700}>
            {tap.pressureHead_mm.toFixed(1) + ' mm'}
          </Text>
        </Billboard>
      </group>
    )
  })
}

function PitotProbeAssembly({
  tapResults,
  pitotIdx,
  pitotData,
  Ltotal,
  maxPH = 0.38,
  fluidColor = '#0091ea',
  meniscusColor = '#40c4ff',
  showStreamlines = true,
  onPitotHover,
  onPitotLeave,
  onPitotClick,
}) {
  const [hovered, setHovered] = useState(false)
  const stagGlowRef = useRef()
  const stagRingRef = useRef()

  const tap = pitotData || (tapResults && tapResults[pitotIdx])
  const xNorm = tap ? tap.xNorm : 0.56
  const xPos = (xNorm - 0.5) * Ltotal * SC
  const pipeR = tap ? (tap.D / 2) * RAD_SC : 0.055

  const tubeH = 1.35
  const stagH = tap ? Math.min(tubeH * 0.98, Math.max(0.04, (tap.stagnationHead / maxPH) * tubeH)) : 0.5
  const staticH = tap ? Math.min(tubeH * 0.98, Math.max(0.04, (tap.pressureHead / maxPH) * tubeH)) : 0.35
  const deltaHScene = Math.max(0.02, stagH - staticH)

  const probeBodyR = Math.min(0.0095, pipeR * 0.24)
  const tipR = probeBodyR * 0.42
  const stemR = probeBodyR * 0.92
  const probeLen = Math.min(0.19, Math.max(0.11, Ltotal * SC * 0.095))
  const taperLen = probeLen * 0.38
  const bodyLen = probeLen - taperLen
  const stemExtra = 0.14
  const manifoldY = pipeR + stemExtra
  const tubeR = 0.015
  const tubeSpacing = 0.078

  const taperedNozzleGeom = useMemo(() => {
    const pts = []
    const steps = 24
    for (let i = 0; i <= steps; i++) {
      const f = i / steps
      const ease = f * f * (3 - 2 * f)
      const r = tipR + (probeBodyR - tipR) * ease
      const y = (f - 0.5) * taperLen
      pts.push(new THREE.Vector2(r, y))
    }
    return new THREE.LatheGeometry(pts, 28)
  }, [tipR, probeBodyR, taperLen])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (stagGlowRef.current) {
      const pulse = 1 + 0.14 * Math.sin(t * 5.2)
      stagGlowRef.current.scale.set(pulse, pulse, pulse)
    }
    if (stagRingRef.current) {
      const s = 1 + 0.22 * ((t * 1.6) % 1)
      stagRingRef.current.scale.set(s, s, s)
    }
  })

  const emitHover = useCallback((e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
    if (onPitotHover && tap) {
      const cx = e?.nativeEvent?.clientX ?? e?.clientX ?? 0
      const cy = e?.nativeEvent?.clientY ?? e?.clientY ?? 0
      onPitotHover(tap, { x: cx, y: cy })
    }
  }, [onPitotHover, tap])

  const emitOut = useCallback((e) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
    if (onPitotLeave) onPitotLeave()
  }, [onPitotLeave])

  const emitClick = useCallback((e) => {
    e.stopPropagation()
    if (onPitotClick && tap) {
      const cx = e?.nativeEvent?.clientX ?? e?.clientX ?? 0
      const cy = e?.nativeEvent?.clientY ?? e?.clientY ?? 0
      onPitotClick(tap, { x: cx, y: cy })
    }
  }, [onPitotClick, tap])

  if (!tap) return null

  return (
    <group position={[xPos, 0, 0]}>
      <PitotStreamlines3D tipX={-probeLen} stemX={0} pipeR={pipeR} probeBodyR={probeBodyR} show={showStreamlines} />
      <group position={[0, 0, 0]}>
        <mesh position={[0, manifoldY / 2, 0]} onPointerOver={emitHover} onPointerMove={emitHover} onPointerOut={emitOut} onClick={emitClick}>
          <cylinderGeometry args={[stemR, stemR, manifoldY, 18]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.18} />
        </mesh>
        <mesh position={[0, pipeR + 0.008, 0]}>
          <cylinderGeometry args={[stemR * 2.1, stemR * 2.3, 0.022, 6]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.18} />
        </mesh>
        <mesh position={[0, pipeR, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[stemR * 1.65, 0.003, 10, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[probeBodyR * 1.18, 18, 18]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.18} />
        </mesh>
        <mesh position={[-bodyLen / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} onPointerOver={emitHover} onPointerMove={emitHover} onPointerOut={emitOut} onClick={emitClick}>
          <cylinderGeometry args={[probeBodyR, probeBodyR, bodyLen, 20]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.18} />
        </mesh>
        {[-bodyLen * 0.45, -bodyLen * 0.72].map((ox, k) => (
          <mesh key={k} position={[ox, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[probeBodyR * 1.02, 0.0014, 8, 24]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00b0ff" emissiveIntensity={0.8} />
          </mesh>
        ))}
        <mesh
          geometry={taperedNozzleGeom}
          position={[-bodyLen - taperLen / 2, 0, 0]}
          rotation={[0, 0, -Math.PI / 2]}
          onPointerOver={emitHover}
          onPointerMove={emitHover}
          onPointerOut={emitOut}
          onClick={emitClick}
        >
          <meshStandardMaterial
            color={hovered ? '#ffe082' : '#eab308'}
            emissive={hovered ? '#ff9100' : '#b45309'}
            emissiveIntensity={hovered ? 0.65 : 0.25}
            metalness={0.92}
            roughness={0.12}
          />
        </mesh>
        <mesh position={[-probeLen, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[tipR * 0.92, tipR * 0.22, 12, 28]} />
          <meshStandardMaterial color="#ffd54f" emissive="#ff9100" emissiveIntensity={0.6} metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[-probeLen - 0.0006, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[tipR * 0.76, 20]} />
          <meshBasicMaterial color="#05070f" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-probeLen / 2, 0, probeBodyR * 0.35]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[tipR * 0.38, tipR * 0.38, probeLen, 10]} />
          <meshStandardMaterial color="#ff6d00" emissive="#ff6d00" emissiveIntensity={0.85} />
        </mesh>
        <mesh position={[0, manifoldY / 2, stemR * 0.35]}>
          <cylinderGeometry args={[tipR * 0.38, tipR * 0.38, manifoldY, 10]} />
          <meshStandardMaterial color="#ff6d00" emissive="#ff6d00" emissiveIntensity={0.85} />
        </mesh>
        <group position={[-probeLen - 0.005, 0, 0]}>
          <mesh ref={stagGlowRef}>
            <sphereGeometry args={[tipR * 2.4, 20, 20]} />
            <meshStandardMaterial
              color="#ff9100"
              emissive="#ff6d00"
              emissiveIntensity={hovered ? 1.4 : 0.95}
              transparent
              opacity={hovered ? 0.68 : 0.46}
            />
          </mesh>
          <mesh ref={stagRingRef} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[tipR * 2.1, 0.0016, 10, 28]} />
            <meshBasicMaterial color="#ffd180" transparent opacity={0.75} />
          </mesh>
          <mesh onPointerOver={emitHover} onPointerMove={emitHover} onPointerOut={emitOut} onClick={emitClick}>
            <sphereGeometry args={[Math.max(0.032, pipeR * 0.55), 16, 16]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        </group>
        <Billboard position={[-probeLen - 0.015, Math.min(pipeR * 0.68, probeBodyR * 4.2), 0.02]}>
          <Text fontSize={hovered ? 0.029 : 0.024} color={hovered ? '#ffffff' : '#ffd180'} fontWeight={800} anchorX="center" anchorY="bottom">
            {hovered ? '🔍 Punta Pitot (Clic = Fijar Tooltip)' : 'P₀ Estancamiento'}
          </Text>
        </Billboard>
      </group>
      {/* Puente colector que conecta el vástago del Pitot con la columna de estancamiento */}
      <mesh position={[-tubeSpacing / 4, manifoldY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[stemR * 0.95, stemR * 0.95, tubeSpacing / 2 + 0.01, 14]} />
        <meshStandardMaterial color="#d4af37" metalness={0.88} roughness={0.2} />
      </mesh>
      <mesh position={[tubeSpacing / 2, (pipeR + manifoldY) / 2, 0]}>
        <cylinderGeometry args={[stemR * 0.78, stemR * 0.78, manifoldY - pipeR, 14]} />
        <meshPhysicalMaterial color="#4fc3f7" transparent opacity={0.55} />
      </mesh>
      <group position={[0, pipeR + stemExtra, 0]}>
        {/* Columna de Estancamiento (Naranja) */}
        <group position={[-tubeSpacing / 2, 0, 0]}>
          <mesh position={[0, tubeH / 2, 0]}>
            <cylinderGeometry args={[tubeR, tubeR, tubeH, 14]} />
            <meshPhysicalMaterial color="#ffe0b2" transparent opacity={0.25} roughness={0.05} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, stagH / 2, 0]}>
            <cylinderGeometry args={[tubeR * 0.88, tubeR * 0.88, stagH, 14]} />
            <meshPhysicalMaterial color="#ff6d00" emissive="#e65100" emissiveIntensity={0.4} transparent opacity={0.82} />
          </mesh>
          <mesh position={[0, stagH, 0]}>
            <cylinderGeometry args={[tubeR * 0.9, tubeR * 0.9, 0.004, 14]} />
            <meshStandardMaterial color="#ffa726" emissive="#ff9100" emissiveIntensity={0.9} />
          </mesh>
          {/* Título anclado a la derecha hacia afuera para evitar solapamiento con la columna estática */}
          <Billboard position={[-0.025, tubeH + 0.055, 0]}>
            <Text fontSize={0.034} color="#ff9100" fontWeight={700} anchorX="right" anchorY="bottom">
              {'hTotal** (Pitot) = ' + tap.stagnationHead_mm.toFixed(1) + ' mm'}
            </Text>
            <Text fontSize={0.027} color="#ffcc80" anchorX="right" anchorY="top" position={[0, -0.012, 0]}>
              (Estancamiento)
            </Text>
          </Billboard>
        </group>

        {/* Columna de Presión Estática (Color del Fluido) */}
        <group position={[tubeSpacing / 2, 0, 0]}>
          <mesh position={[0, tubeH / 2, 0]}>
            <cylinderGeometry args={[tubeR, tubeR, tubeH, 14]} />
            <meshPhysicalMaterial color="#b3e5fc" transparent opacity={0.25} roughness={0.05} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, staticH / 2, 0]}>
            <cylinderGeometry args={[tubeR * 0.88, tubeR * 0.88, staticH, 14]} />
            <meshPhysicalMaterial color={fluidColor} emissive={fluidColor} emissiveIntensity={0.32} transparent opacity={0.82} />
          </mesh>
          <mesh position={[0, staticH, 0]}>
            <cylinderGeometry args={[tubeR * 0.9, tubeR * 0.9, 0.004, 14]} />
            <meshStandardMaterial color={meniscusColor} emissive={meniscusColor} emissiveIntensity={0.85} />
          </mesh>
          {/* Título anclado a la izquierda hacia afuera para evitar solapamiento con la columna de estancamiento */}
          <Billboard position={[0.025, tubeH + 0.055, 0]}>
            <Text fontSize={0.034} color={meniscusColor} fontWeight={700} anchorX="left" anchorY="bottom">
              {'h estático = ' + tap.pressureHead_mm.toFixed(1) + ' mm'}
            </Text>
            <Text fontSize={0.027} color="#80d8ff" anchorX="left" anchorY="top" position={[0, -0.012, 0]}>
              {'(Pared ' + (tap.name || 'S3') + ' · ∅' + (tap.D_mm || 0).toFixed(1) + ' mm)'}
            </Text>
          </Billboard>
        </group>

        {/* Propuesta pedagógica en 3D: incógnitas Δh din y V para que el estudiante calcule */}
        <group position={[tubeSpacing / 2 + 0.045, staticH + deltaHScene / 2, 0]}>
          <Billboard position={[0, 0, 0]}>
            <Text fontSize={0.032} color="#00e676" fontWeight={800} anchorX="left" anchorY="bottom">
              {'Δh din = ? mm  |  V Pitot = ? m/s'}
            </Text>
            <Text fontSize={0.025} color="#b9f6ca" anchorX="left" anchorY="top" position={[0, -0.008, 0]}>
              {'(Calcular con hTotal** y h estático)'}
            </Text>
          </Billboard>
        </group>
      </group>
    </group>
  )
}

function GradeLines({ tapResults, pitotData, Ltotal, maxH = 0.38 }) {
  if (!tapResults || tapResults.length < 2) return null
  const tubeH = 1.35

  const eglPts = tapResults.map(t => {
    const x = (t.xNorm - 0.5) * Ltotal * SC
    const pipeR = (t.D / 2) * RAD_SC
    const totalHScene = Math.min(tubeH * 0.98, Math.max(0.04, (t.totalHead / maxH) * tubeH))
    return new THREE.Vector3(x, pipeR + totalHScene, 0)
  })
  const hglPts = tapResults.map(t => {
    const x = (t.xNorm - 0.5) * Ltotal * SC
    const pipeR = (t.D / 2) * RAD_SC
    const waterH = Math.min(tubeH * 0.98, Math.max(0.04, (Math.max(0.005, t.pressureHead) / maxH) * tubeH))
    return new THREE.Vector3(x, pipeR + waterH, 0)
  })

  const eglGeom = useMemo(() => new THREE.BufferGeometry().setFromPoints(eglPts), [eglPts])
  const hglGeom = useMemo(() => new THREE.BufferGeometry().setFromPoints(hglPts), [hglPts])

  const lastEGL = eglPts[eglPts.length - 1]
  const lastHGL = hglPts[hglPts.length - 1]

  const pitotTap = pitotData || tapResults.find(t => t.isPitotLocation) || tapResults[3]
  const pitotPipeR = pitotTap ? (pitotTap.D / 2) * RAD_SC : 0
  const pitotStagHScene = pitotTap ? Math.min(tubeH * 0.98, Math.max(0.04, (pitotTap.stagnationHead / maxH) * tubeH)) : 0
  const pitotMarkerPos = pitotTap
    ? new THREE.Vector3((pitotTap.xNorm - 0.5) * Ltotal * SC, pitotPipeR + pitotStagHScene, 0)
    : null

  // Separación vertical mínima para garantizar que EGL y HGL no se solapen
  const eglLabelY = Math.max(lastEGL.y + 0.05, lastHGL.y + 0.07)
  const hglLabelY = Math.min(lastHGL.y - 0.04, lastEGL.y - 0.04)

  return (
    <group>
      <line geometry={eglGeom}>
        <lineBasicMaterial color="#00e676" linewidth={3} />
      </line>
      <line geometry={hglGeom}>
        <lineBasicMaterial color="#ff3d00" linewidth={3} />
      </line>

      <Billboard position={[lastEGL.x + 0.14, eglLabelY, 0]}>
        <Text fontSize={0.040} color="#00e676" fontWeight={700} anchorX="left" anchorY="bottom">
          EGL (hTotal*)
        </Text>
      </Billboard>
      <Billboard position={[lastHGL.x + 0.14, hglLabelY, 0]}>
        <Text fontSize={0.040} color="#ff3d00" fontWeight={700} anchorX="left" anchorY="top">
          HGL (h estático)
        </Text>
      </Billboard>

      {pitotMarkerPos && (
        <group position={[pitotMarkerPos.x, pitotMarkerPos.y, 0]}>
          <mesh>
            <sphereGeometry args={[0.014, 16, 16]} />
            <meshStandardMaterial color="#ff9100" emissive="#ff6d00" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  )
}

function FlowArrow({ Ltotal }) {
  const x = (Ltotal * SC) / 2 + 0.18
  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.055, 0.15, 14]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>
      <Billboard position={[0.15, 0, 0]}>
        <Text fontSize={0.060} color="#00e5ff" fontWeight={700}>
          Flujo ->
        </Text>
      </Billboard>
    </group>
  )
}

export default function BernoulliScene({
  tapResults,
  Ltotal = 0.45,
  colorMode = 'Velocidad',
  showIso = true,
  isoLevels = 6,
  particleCount = 600,
  pitotTapIdx = 3,
  pitotData = null,
  cutawayMode = true,
  showStreamlines = true,
  fluidColor = '#0288d1',
  meniscusColor = '#4fc3f7',
  onPitotHover,
  onPitotLeave,
  onPitotClick,
  onSelectPosition,
}) {
  const camDist = Math.max(1.8, Ltotal * SC * 0.95)

  const { Vmax, Pmin, Pmax, maxHeadScale, isLaminarFlow } = useMemo(() => {
    if (!tapResults || tapResults.length === 0) {
      return { Vmax: 1.7, Pmin: 0, Pmax: 0.25, maxHeadScale: 0.36, isLaminarFlow: false }
    }
    const vs = tapResults.map(t => t.V)
    const ps = tapResults.map(t => t.pressureHead)
    const maxTotal = Math.max(
      ...tapResults.map(t => Math.max(t.totalHead || 0, t.stagnationHead || 0, t.pressureHead || 0)),
      pitotData?.stagnationHead || 0
    )
    const throatRe = tapResults[1]?.Re ?? 3000
    return {
      Vmax: Math.max(...vs, 0.1),
      Pmin: Math.min(...ps),
      Pmax: Math.max(...ps, 0.1),
      maxHeadScale: Math.max(0.36, maxTotal * 1.08),
      isLaminarFlow: throatRe < 2300,
    }
  }, [tapResults, pitotData])

  const interpAt = useCallback((tNorm) => {
    if (!tapResults || tapResults.length === 0) return { V: 0.3, P: 0.24, D: 0.025 }
    const clampedT = Math.max(0, Math.min(1, tNorm))
    for (let j = 0; j < tapResults.length - 1; j++) {
      const t0 = tapResults[j].xNorm
      const t1 = tapResults[j + 1].xNorm
      if (clampedT >= t0 && clampedT <= t1) {
        const f = t1 > t0 ? (clampedT - t0) / (t1 - t0) : 0
        const s = f * f * (3 - 2 * f)
        return {
          V: tapResults[j].V + s * (tapResults[j + 1].V - tapResults[j].V),
          P: tapResults[j].pressureHead + s * (tapResults[j + 1].pressureHead - tapResults[j].pressureHead),
          D: tapResults[j].D + s * (tapResults[j + 1].D - tapResults[j].D),
        }
      }
    }
    return {
      V: tapResults[tapResults.length - 1].V,
      P: tapResults[tapResults.length - 1].pressureHead,
      D: tapResults[tapResults.length - 1].D,
    }
  }, [tapResults])

  const activePitot = pitotData || (tapResults && tapResults[pitotTapIdx])
  const pitotXNorm = activePitot ? activePitot.xNorm : 0.56
  const pitotWorldX = (pitotXNorm - 0.5) * Ltotal * SC
  const pitotProbeLen = Math.min(0.19, Math.max(0.11, Ltotal * SC * 0.095))
  const pitotTipX = pitotWorldX - pitotProbeLen

  const initFn = useCallback(() => {
    const arr = []
    for (let i = 0; i < particleCount; i++) {
      arr.push({
        tNorm: Math.random(),
        angle: Math.random() * Math.PI * 2,
        rFrac: Math.sqrt(Math.random()) * 0.88,
      })
    }
    return arr
  }, [particleCount])

  const advanceFn = useCallback((data, dt, i) => {
    const p = data[i]
    const { V } = interpAt(p.tNorm)
    const profileFactor = 1.25 * (1 - 0.35 * Math.pow(p.rFrac, 2))
    let speed = Math.min(V * profileFactor * 0.16, 3.2)
    const px = (p.tNorm - 0.5) * Ltotal * SC
    if (px > pitotTipX - 0.05 && px < pitotTipX + 0.01 && p.rFrac < 0.28) {
      speed *= 0.42
    }
    p.tNorm += speed * dt
    if (p.tNorm > 1) {
      p.tNorm -= 1
      p.angle = Math.random() * Math.PI * 2
    }
  }, [interpAt, Ltotal, pitotTipX])

  const getStateFn = useCallback((p) => {
    const { V, P } = interpAt(p.tNorm)
    const rPipe = getInterpolatedRadius(p.tNorm, tapResults) * RAD_SC
    const r = p.rFrac * rPipe
    const x = (p.tNorm - 0.5) * Ltotal * SC

    let y = Math.cos(p.angle) * r
    let z = Math.sin(p.angle) * r
    if (cutawayMode && z > 0) z = -z * 0.92

    if (x >= pitotTipX - 0.025 && x <= pitotWorldX + 0.015) {
      const probeRAtX = x < pitotTipX + pitotProbeLen * 0.38
        ? 0.0045 + ((x - pitotTipX) / Math.max(0.01, pitotProbeLen * 0.38)) * 0.0065
        : 0.011
      const minClearance = probeRAtX * 1.45
      const radialDist = Math.sqrt(y * y + z * z)
      if (radialDist < minClearance) {
        const pushScale = minClearance / Math.max(radialDist, 0.0008)
        y *= pushScale
        z *= pushScale
      }
    }

    let value = V / Vmax
    if (colorMode === 'Presión' || colorMode === 'Pressure' || colorMode === 'Presion') {
      value = (P - Pmin) / Math.max(Pmax - Pmin, 1e-9)
    } else if (colorMode === 'Carga Dinámica' || colorMode === 'Acceleration' || colorMode === 'Carga Dinamica') {
      const hv = (V * V) / (2 * 9.81)
      const maxHv = (Vmax * Vmax) / (2 * 9.81)
      value = hv / Math.max(maxHv, 1e-9)
    }

    return { x, y, z, size: 0.014 + (V / Vmax) * 0.018, value }
  }, [interpAt, tapResults, Ltotal, Vmax, Pmin, Pmax, colorMode, cutawayMode, pitotTipX, pitotWorldX, pitotProbeLen])

  const isoPositions = useMemo(() => {
    if (!tapResults) return []
    return tapResults.map(t => ({
      x: (t.xNorm - 0.5) * Ltotal * SC,
      pipeR: (t.D / 2) * RAD_SC,
    }))
  }, [tapResults, Ltotal])

  return (
    <Canvas camera={{ position: [0, camDist * 0.52, camDist], fov: 46 }} style={{ background: '#03040d' }}>
      <ambientLight intensity={0.68} />
      <directionalLight position={[5, 9, 6]} intensity={0.95} />
      <pointLight position={[-3, 4, 3]} intensity={0.55} color="#80deea" />
      <pointLight position={[3, 2, -2]} intensity={0.35} color="#ff9800" />

      <VenturiTube tapResults={tapResults} Ltotal={Ltotal} cutawayMode={cutawayMode} onSelectPosition={onSelectPosition} />
      <RainbowParticles count={particleCount} initFn={initFn} advanceFn={advanceFn} getState={getStateFn} />
      {showIso && <IsoRings positions={isoPositions} levels={isoLevels} isLaminar={isLaminarFlow} />}
      <SectionRings tapResults={tapResults} Ltotal={Ltotal} cutawayMode={cutawayMode} onSelectPosition={onSelectPosition} />
      <Piezometers
        tapResults={tapResults}
        Ltotal={Ltotal}
        maxPH={maxHeadScale}
        fluidColor={fluidColor}
        meniscusColor={meniscusColor}
      />
      <GradeLines tapResults={tapResults} pitotData={pitotData} Ltotal={Ltotal} maxH={maxHeadScale} />
      <PitotProbeAssembly
        tapResults={tapResults}
        pitotIdx={pitotTapIdx}
        pitotData={pitotData}
        Ltotal={Ltotal}
        maxPH={maxHeadScale}
        fluidColor={fluidColor}
        meniscusColor={meniscusColor}
        showStreamlines={showStreamlines}
        onPitotHover={onPitotHover}
        onPitotLeave={onPitotLeave}
        onPitotClick={onPitotClick}
      />
      <FlowArrow Ltotal={Ltotal} />

      <gridHelper args={[Ltotal * SC * 1.6, 28, '#1e293b', '#0f172a']} position={[0, -0.42, 0]} />
      <OrbitControls enableDamping dampingFactor={0.08} target={[0, 0.35, 0]} />
    </Canvas>
  )
}
