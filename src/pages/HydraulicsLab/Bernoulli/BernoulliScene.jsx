import React, { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import RainbowParticles from '../RainbowParticles.jsx'
import IsoRings from '../IsoRings.jsx'
import { getInterpolatedRadius } from './solver.js'

const SC = 4.0
const RAD_SC = 9.5

function VenturiTube({ tapResults, Ltotal }) {
  const geom = useMemo(() => {
    const pts = []
    const n = 120
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const r = getInterpolatedRadius(t, tapResults) * RAD_SC
      const y = (t - 0.5) * Ltotal * SC
      pts.push(new THREE.Vector2(Math.max(0.02, r), y))
    }
    return new THREE.LatheGeometry(pts, 56)
  }, [tapResults, Ltotal])

  return (
    <mesh geometry={geom} rotation={[0, 0, -Math.PI / 2]}>
      <meshPhysicalMaterial
        color="#80deea"
        transparent
        opacity={0.28}
        roughness={0.08}
        metalness={0.15}
        transmission={0.65}
        ior={1.333}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function SectionRings({ tapResults, Ltotal }) {
  if (!tapResults) return null
  return tapResults.map((tap, i) => {
    const xPos = (tap.xNorm - 0.5) * Ltotal * SC
    const r = (tap.D / 2) * RAD_SC
    const isThroat = i === 1
    const isPitot = tap.isPitotLocation
    const ringColor = isThroat ? '#ff1744' : (isPitot ? '#00e676' : '#ff9800')

    return (
      <group key={tap.id || i} position={[xPos, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[r, 0.012, 14, 48]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringColor}
            emissiveIntensity={0.6}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Etiquetas de sección situadas limpiamente debajo del tubo para evitar interferir con piezómetros */}
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

function Piezometers({ tapResults, Ltotal }) {
  if (!tapResults) return null
  const maxPH = 0.260
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
          <meshPhysicalMaterial color="#0288d1" emissive="#01579b" emissiveIntensity={0.3} transparent opacity={0.78} />
        </mesh>
        <mesh position={[0, waterH, 0]}>
          <cylinderGeometry args={[0.0138, 0.0138, 0.004, 14]} />
          <meshStandardMaterial color="#4fc3f7" emissive="#29b6f6" emissiveIntensity={0.8} />
        </mesh>
        {/* Etiqueta centrada directamente sobre el menisco de agua */}
        <Billboard position={[0, waterH + 0.045, 0]}>
          <Text fontSize={0.034} color="#82cfff" anchorX="center" anchorY="bottom" fontWeight={600}>
            {tap.pressureHead_mm.toFixed(1) + ' mm'}
          </Text>
        </Billboard>
      </group>
    )
  })
}

function PitotProbeAssembly({ tapResults, pitotIdx, Ltotal }) {
  if (!tapResults || pitotIdx < 0 || pitotIdx >= tapResults.length) return null
  const tap = tapResults[pitotIdx]
  const xPos = (tap.xNorm - 0.5) * Ltotal * SC
  const pipeR = (tap.D / 2) * RAD_SC

  const maxPH = 0.260
  const tubeH = 1.35
  const stagH = Math.min(tubeH * 0.98, Math.max(0.04, (tap.stagnationHead / maxPH) * tubeH))
  const staticH = Math.min(tubeH * 0.98, Math.max(0.04, (tap.pressureHead / maxPH) * tubeH))
  const deltaHScene = Math.max(0.02, stagH - staticH)

  const stemR = 0.008
  const probeR = 0.0065
  const probeLen = 0.18
  const stemHeight = pipeR + 0.14
  const tubeR = 0.015
  const tubeSpacing = 0.075

  return (
    <group position={[xPos, 0, 0.04]}>
      <group position={[0, 0, 0]}>
        <mesh position={[0, (pipeR + stemHeight) / 2, 0]}>
          <cylinderGeometry args={[stemR, stemR, pipeR + stemHeight, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[stemR * 1.5, 12, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[-probeLen / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[probeR, probeR, probeLen, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[-probeLen, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[probeR * 1.3, 0.025, 12]} />
          <meshStandardMaterial color="#ffb300" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      <group position={[0, pipeR + stemHeight, 0]}>
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
              {'hTotal** = ' + tap.stagnationHead_mm.toFixed(1) + ' mm'}
            </Text>
            <Text fontSize={0.027} color="#ffcc80" anchorX="right" anchorY="top" position={[0, -0.012, 0]}>
              (Estancamiento)
            </Text>
          </Billboard>
        </group>

        {/* Columna de Presión Estática (Azul) */}
        <group position={[tubeSpacing / 2, 0, 0]}>
          <mesh position={[0, tubeH / 2, 0]}>
            <cylinderGeometry args={[tubeR, tubeR, tubeH, 14]} />
            <meshPhysicalMaterial color="#b3e5fc" transparent opacity={0.25} roughness={0.05} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, staticH / 2, 0]}>
            <cylinderGeometry args={[tubeR * 0.88, tubeR * 0.88, staticH, 14]} />
            <meshPhysicalMaterial color="#0091ea" emissive="#01579b" emissiveIntensity={0.3} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, staticH, 0]}>
            <cylinderGeometry args={[tubeR * 0.9, tubeR * 0.9, 0.004, 14]} />
            <meshStandardMaterial color="#40c4ff" emissive="#00b0ff" emissiveIntensity={0.8} />
          </mesh>
          {/* Título anclado a la izquierda hacia afuera para evitar solapamiento con la columna de estancamiento */}
          <Billboard position={[0.025, tubeH + 0.055, 0]}>
            <Text fontSize={0.034} color="#40c4ff" fontWeight={700} anchorX="left" anchorY="bottom">
              {'h estático = ' + tap.pressureHead_mm.toFixed(1) + ' mm'}
            </Text>
            <Text fontSize={0.027} color="#80d8ff" anchorX="left" anchorY="top" position={[0, -0.012, 0]}>
              (Pared {tap.name || 'S3'})
            </Text>
          </Billboard>
        </group>

        {/* Diferencial Δh din y velocidad en la sonda */}
        <group position={[tubeSpacing / 2 + 0.045, staticH + deltaHScene / 2, 0]}>
          <Billboard position={[0, 0, 0]}>
            <Text fontSize={0.035} color="#00e676" fontWeight={800} anchorX="left" anchorY="bottom">
              {'Δh din = ' + tap.pitotDeltaH_mm.toFixed(1) + ' mm'}
            </Text>
            <Text fontSize={0.028} color="#b9f6ca" anchorX="left" anchorY="top" position={[0, -0.008, 0]}>
              {'V Pitot = ' + tap.Vpitot.toFixed(3) + ' m/s'}
            </Text>
          </Billboard>
        </group>
      </group>
    </group>
  )
}

function GradeLines({ tapResults, Ltotal }) {
  if (!tapResults || tapResults.length < 2) return null
  const maxH = 0.260
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

  const pitotTap = tapResults.find(t => t.isPitotLocation) || tapResults[3]
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
}) {
  const camDist = Math.max(1.8, Ltotal * SC * 0.95)

  const { Vmax, Pmin, Pmax } = useMemo(() => {
    if (!tapResults || tapResults.length === 0) return { Vmax: 1.7, Pmin: 0, Pmax: 0.25 }
    const vs = tapResults.map(t => t.V)
    const ps = tapResults.map(t => t.pressureHead)
    return {
      Vmax: Math.max(...vs, 0.1),
      Pmin: Math.min(...ps),
      Pmax: Math.max(...ps, 0.1),
    }
  }, [tapResults])

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
    const speed = Math.min(V * profileFactor * 0.16, 3.2)
    p.tNorm += speed * dt
    if (p.tNorm > 1) {
      p.tNorm -= 1
      p.angle = Math.random() * Math.PI * 2
    }
  }, [interpAt])

  const getStateFn = useCallback((p) => {
    const { V, P } = interpAt(p.tNorm)
    const rPipe = getInterpolatedRadius(p.tNorm, tapResults) * RAD_SC
    const r = p.rFrac * rPipe

    let value = V / Vmax
    if (colorMode === 'Presión' || colorMode === 'Pressure' || colorMode === 'Presion') {
      value = (P - Pmin) / Math.max(Pmax - Pmin, 1e-9)
    } else if (colorMode === 'Carga Dinámica' || colorMode === 'Acceleration' || colorMode === 'Carga Dinamica') {
      const hv = (V * V) / (2 * 9.81)
      const maxHv = (Vmax * Vmax) / (2 * 9.81)
      value = hv / Math.max(maxHv, 1e-9)
    }

    return {
      x: (p.tNorm - 0.5) * Ltotal * SC,
      y: Math.cos(p.angle) * r,
      z: Math.sin(p.angle) * r,
      size: 0.015 + (V / Vmax) * 0.020,
      value,
    }
  }, [interpAt, tapResults, Ltotal, Vmax, Pmin, Pmax, colorMode])

  const isoPositions = useMemo(() => {
    if (!tapResults) return []
    return tapResults.map(t => ({
      x: (t.xNorm - 0.5) * Ltotal * SC,
      pipeR: (t.D / 2) * RAD_SC,
    }))
  }, [tapResults, Ltotal])

  return (
    <Canvas camera={{ position: [0, camDist * 0.52, camDist], fov: 46 }} style={{ background: '#03040d' }}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 9, 6]} intensity={0.9} />
      <pointLight position={[-3, 4, 3]} intensity={0.5} color="#80deea" />
      <pointLight position={[3, 2, -2]} intensity={0.3} color="#ff9800" />

      <VenturiTube tapResults={tapResults} Ltotal={Ltotal} />
      <RainbowParticles count={particleCount} initFn={initFn} advanceFn={advanceFn} getState={getStateFn} />
      {showIso && <IsoRings positions={isoPositions} levels={isoLevels} isLaminar={false} />}
      <SectionRings tapResults={tapResults} Ltotal={Ltotal} />
      <Piezometers tapResults={tapResults} Ltotal={Ltotal} />
      <GradeLines tapResults={tapResults} Ltotal={Ltotal} />
      <PitotProbeAssembly tapResults={tapResults} pitotIdx={pitotTapIdx} Ltotal={Ltotal} />
      <FlowArrow Ltotal={Ltotal} />

      <gridHelper args={[Ltotal * SC * 1.6, 28, '#1e293b', '#0f172a']} position={[0, -0.42, 0]} />
      <OrbitControls enableDamping dampingFactor={0.08} target={[0, 0.35, 0]} />
    </Canvas>
  )
}
