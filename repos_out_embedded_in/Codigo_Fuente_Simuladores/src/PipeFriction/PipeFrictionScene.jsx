import React, { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import RainbowParticles from '../RainbowParticles.jsx'
import IsoRings from '../IsoRings.jsx'

function Manometer({ position, height = 0.8, waterH = 0.5, label }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, height, 12]} />
        <meshPhysicalMaterial color="#aaddff" transparent opacity={0.3} roughness={0.1} />
      </mesh>
      <mesh position={[0, waterH / 2, 0]}>
        <cylinderGeometry args={[0.01, 0.01, waterH, 12]} />
        <meshPhysicalMaterial color="#2196f3" transparent opacity={0.7} />
      </mesh>
      {label && <Text position={[0, height + 0.08, 0]} fontSize={0.05} color="#9aa2c0">{label}</Text>}
      <Text position={[0.04, waterH, 0]} fontSize={0.035} color="#82cfff" anchorX="left">
        {waterH.toFixed(3)}m
      </Text>
    </group>
  )
}

function VelocityProfile({ position, radius = 0.18, isLaminar = true }) {
  const points = useMemo(() => {
    const pts = []
    const n = 40
    for (let i = 0; i <= n; i++) {
      const r = (i / n) * radius
      const v = isLaminar ? (1 - (r / radius) ** 2) : Math.pow(Math.max(0, 1 - r / radius), 1 / 7)
      pts.push(new THREE.Vector3(v * 0.3, r, 0))
    }
    for (let i = n; i >= 0; i--) {
      const r = (i / n) * radius
      const v = isLaminar ? (1 - (r / radius) ** 2) : Math.pow(Math.max(0, 1 - r / radius), 1 / 7)
      pts.push(new THREE.Vector3(v * 0.3, -r, 0))
    }
    return pts
  }, [radius, isLaminar])
  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  return (
    <group position={position}>
      <line geometry={geom}><lineBasicMaterial color="#ff9800" /></line>
      <Text position={[0.22, radius + 0.06, 0]} fontSize={0.045} color="#ff9800">
        {isLaminar ? 'Parabolic' : '1/7 Power law'}
      </Text>
    </group>
  )
}

export default function PipeFrictionScene({ results, colorMode = 'Velocity', showIso = true, isoLevels = 8, particleCount = 500 }) {
  const { D = 0.025, L = 1.0, V = 1.0, Re = 5000, hf = 0.1, dp = 1000, eps = 0.045e-3, regime = 'Turbulent' } = results || {}
  const pipeLen = Math.min(L, 4)
  const pipeR = Math.max(D / 2, 0.03) * 2
  const isLaminar = Re < 2300
  const nTaps = 5
  const maxH = 0.8
  const taps = useMemo(() => {
    const arr = []
    for (let i = 0; i < nTaps; i++) {
      const xF = i / (nTaps - 1)
      const x = -pipeLen / 2 + xF * pipeLen
      const h = Math.max(0.02, (1 - xF) * maxH * (dp > 0 ? 1 : 0.1))
      arr.push({ x, h, label: `Tap ${i + 1}` })
    }
    return arr
  }, [pipeLen, dp, nTaps])

  // Rainbow particle callbacks
  const initFn = useCallback(() => {
    const arr = []
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const rFrac = Math.sqrt(Math.random()) * 0.92
      arr.push({ angle, rFrac, x: (Math.random() - 0.5) * pipeLen })
    }
    return arr
  }, [particleCount, pipeLen])

  const advanceFn = useCallback((data, dt, i) => {
    const p = data[i]
    const rN = p.rFrac * pipeR / pipeR // normalised 0–1
    const vProfile = isLaminar ? (1 - rN * rN) : Math.pow(Math.max(0, 1 - rN), 1 / 7)
    const vS = Math.min(V * 0.5, 3) * vProfile
    p.x += vS * dt
    if (p.x > pipeLen / 2) { p.x -= pipeLen; p.angle = Math.random() * Math.PI * 2 }
    // Turbulent jitter
    if (!isLaminar) {
      p.angle += (Math.random() - 0.5) * 0.05
    }
  }, [pipeLen, pipeR, V, isLaminar])

  const getState = useCallback((p) => {
    const rN = p.rFrac
    const vProfile = isLaminar ? (1 - rN * rN) : Math.pow(Math.max(0, 1 - rN), 1 / 7)
    const r = p.rFrac * pipeR
    const jy = isLaminar ? 0 : (Math.random() - 0.5) * 0.003
    const jz = isLaminar ? 0 : (Math.random() - 0.5) * 0.003
    let value = vProfile // default: velocity
    if (colorMode === 'Wall Shear') value = 1 - rN // high near wall
    if (colorMode === 'Viscous Layer') value = rN > 0.85 ? 0.2 : vProfile
    return {
      x: p.x,
      y: Math.cos(p.angle) * r + jy,
      z: Math.sin(p.angle) * r + jz,
      size: 0.007 + vProfile * 0.007,
      value,
    }
  }, [pipeR, isLaminar, colorMode])

  // Iso-ring positions
  const isoPositions = useMemo(() => {
    const arr = []
    const n = 5
    for (let i = 0; i < n; i++) {
      const xF = (i + 0.5) / n
      arr.push({ x: -pipeLen / 2 + xF * pipeLen, pipeR })
    }
    return arr
  }, [pipeLen, pipeR])

  const roughC = eps > 1e-3 ? '#8d6e3f' : eps > 1e-4 ? '#607d8b' : '#90a4ae'
  return (
    <Canvas camera={{ position: [2, 1.5, 3], fov: 50 }} style={{ background: '#03040d' }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-3, 2, -2]} intensity={0.3} color="#4fc3f7" />
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[pipeR, pipeR, pipeLen, 32, 1, true]} />
        <meshPhysicalMaterial color={roughC} transparent opacity={0.2} roughness={0.2} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * pipeLen / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[pipeR, 0.007, 8, 32]} />
          <meshStandardMaterial color="#546e7a" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <RainbowParticles count={particleCount} initFn={initFn} advanceFn={advanceFn} getState={getState} />
      {showIso && <IsoRings positions={isoPositions} levels={isoLevels} isLaminar={isLaminar} />}
      {taps.map((t, i) => <Manometer key={i} position={[t.x, pipeR + 0.01, 0]} height={maxH} waterH={t.h} label={t.label} />)}
      <VelocityProfile position={[0, 0, pipeR + 0.15]} radius={pipeR} isLaminar={isLaminar} />
      <mesh position={[pipeLen / 2 + 0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.12, 8]} />
        <meshBasicMaterial color="#4fc3f7" />
      </mesh>
      <Text position={[0, -pipeR - 0.15, 0]} fontSize={0.06} color="#9aa2c0">
        {'L=' + L.toFixed(2) + 'm  D=' + (D * 1000).toFixed(1) + 'mm'}
      </Text>
      <Text position={[0, pipeR + maxH + 0.15, 0]} fontSize={0.055} color="#ff9800">
        {'Re=' + Re.toFixed(0) + ' (' + regime + ')'}
      </Text>
      <gridHelper args={[6, 20, '#1a237e', '#0d1040']} position={[0, -pipeR - 0.3, 0]} />
      <OrbitControls enableDamping dampingFactor={0.08} />
    </Canvas>
  )
}
