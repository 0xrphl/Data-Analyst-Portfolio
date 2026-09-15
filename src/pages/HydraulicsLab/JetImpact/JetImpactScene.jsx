import React, { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import RainbowParticles from '../RainbowParticles.jsx'

/* Cone geometry constants */
const CONE_H = 0.22

/** Compute cone base radius from deflection angle β */
function coneBaseR(beta) {
  // Use half the deflection angle, clamped to avoid tan(≥π/2)
  return Math.min(0.2, CONE_H * Math.abs(Math.tan(Math.min(beta * 0.5, Math.PI * 0.4))))
}

/**
 * Physically correct vane geometries.
 *  - Flat plate: disc facing downward (jet hits bottom face)
 *  - Hemisphere: cup opening downward so jet enters and reverses
 *  - Cone: solid cone with apex pointing DOWN into jet
 */
function Vane({ vaneType, beta, position = [0, 1.2, 0] }) {
  const isH = vaneType.includes('Hemi')
  const isF = vaneType.includes('Flat')
  const isCone = !isF && !isH
  const coneR = coneBaseR(beta)

  return (
    <group position={position}>
      {/* Flat plate — horizontal disc */}
      {isF && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.012, 32]} />
          <meshStandardMaterial color="#78909c" metalness={0.7} roughness={0.3} />
        </mesh>
      )}
      {/* Hemisphere — cup opening DOWNWARD (concave side faces jet) */}
      {isH && (
        <mesh rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#78909c" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Cone — apex pointing DOWN into the jet */}
      {isCone && (
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[coneR, CONE_H, 32]} />
          <meshStandardMaterial color="#78909c" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Support rod */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.5, 8]} />
        <meshStandardMaterial color="#546e7a" metalness={0.5} />
      </mesh>
    </group>
  )
}

function ForceArrow({ F, position = [0.3, 1.2, 0] }) {
  const len = Math.min(Math.max(F * 20, 0.1), 1.5)
  return (
    <group position={position}>
      <mesh position={[0, len / 2, 0]}><cylinderGeometry args={[0.008, 0.008, len, 8]} /><meshBasicMaterial color="#f44336" /></mesh>
      <mesh position={[0, len, 0]}><coneGeometry args={[0.025, 0.06, 8]} /><meshBasicMaterial color="#f44336" /></mesh>
      <Text position={[0.08, len / 2, 0]} fontSize={0.05} color="#f44336" anchorX="left">F={F.toFixed(3)}N</Text>
    </group>
  )
}

export default function JetImpactScene({ results, colorMode = 'Velocity', particleCount = 400 }) {
  const { Vjet = 5, Djet = 0.01, Ftheo = 0.1, beta = Math.PI / 2, vaneType = 'Flat plate (90°)' } = results || {}
  const vY = 1.2
  const jetH = vY + 0.5

  // Jet particles (upward)
  const initJet = useCallback(() => {
    const arr = []
    for (let i = 0; i < particleCount; i++) {
      arr.push({ angle: Math.random() * Math.PI * 2, r: Math.sqrt(Math.random()) * Djet * 8, y: Math.random() * jetH, speed: 0.8 + Math.random() * 0.4 })
    }
    return arr
  }, [particleCount, Djet, jetH])

  const advanceJet = useCallback((data, dt, i) => {
    const p = data[i]
    p.y += p.speed * Math.min(Vjet * 0.2, 3) * dt
    if (p.y > jetH) { p.y = 0; p.angle = Math.random() * Math.PI * 2 }
  }, [Vjet, jetH])

  const getStateJet = useCallback((p) => {
    const hNorm = p.y / jetH
    let value = p.speed // velocity
    if (colorMode === 'Height') value = hNorm
    if (colorMode === 'Momentum') value = p.speed * p.speed
    value = Math.max(0, Math.min(1, value))
    return { x: Math.cos(p.angle) * p.r, y: p.y - 0.5, z: Math.sin(p.angle) * p.r, size: 0.012, value }
  }, [jetH, colorMode])

  // ---- Splash: two-phase (surface flow then free flight) ----
  // Phase 1 (t < tSurf): particle slides along vane from impact to rim
  // Phase 2 (t >= tSurf): exits at rim with correct angle + gravity
  const splashCount = Math.floor(particleCount * 0.5)
  const tSurf = 0.25

  const isHemi = vaneType.includes('Hemi')
  const isFlat = vaneType.includes('Flat')
  const hemiR = 0.15
  const flatR = 0.18
  const coneR = coneBaseR(beta)
  const coneHH = CONE_H / 2

  // Exit angle from horizontal at the rim
  const exitAngle = useMemo(() => Math.PI / 2 - beta, [beta])

  // Rim radius and vertical offset where water leaves the surface
  const rimRadius = useMemo(() => {
    if (isHemi) return hemiR
    if (isFlat) return flatR
    return coneR
  }, [isHemi, isFlat, coneR])

  const rimDy = useMemo(() => {
    if (isHemi) return -hemiR   // bottom of hemisphere cup
    if (isFlat) return 0        // plate surface
    return -coneHH              // cone base (apex up, base below)
  }, [isHemi, isFlat, coneHH])

  const initSplash = useCallback(() => {
    return Array.from({ length: splashCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      t: Math.random(),
      speed: 0.4 + Math.random() * 0.6,
    }))
  }, [splashCount])

  const advanceSplash = useCallback((data, dt, i) => {
    const p = data[i]
    p.t += p.speed * Math.min(Vjet * 0.15, 2) * dt
    if (p.t > 1) { p.t -= 1; p.angle = Math.random() * Math.PI * 2 }
  }, [Vjet])

  const getStateSplash = useCallback((p) => {
    let x, y, z

    if (p.t < tSurf) {
      // Phase 1: slide along vane surface
      const f = p.t / tSurf  // 0..1 progress along surface

      if (isHemi) {
        // Follow inside of hemisphere cup from top to rim
        const ang = f * Math.PI / 2
        const r = hemiR * Math.sin(ang)
        const dy = -hemiR * (1 - Math.cos(ang))
        x = Math.cos(p.angle) * r
        y = vY + dy
        z = Math.sin(p.angle) * r
      } else if (isFlat) {
        // Radial slide from center to edge of disc
        const r = f * flatR
        x = Math.cos(p.angle) * r
        y = vY
        z = Math.sin(p.angle) * r
      } else {
        // Slide down cone surface from apex to base
        const r = f * coneR
        const dy = -f * coneHH * 2  // apex at top to base at bottom
        x = Math.cos(p.angle) * r
        y = vY + coneHH + dy
        z = Math.sin(p.angle) * r
      }
    } else {
      // Phase 2: free flight from rim
      const fFree = (p.t - tSurf) / (1 - tSurf)
      const travel = fFree * 0.7

      const r = rimRadius + Math.cos(exitAngle) * travel
      const dy = rimDy + Math.sin(exitAngle) * travel
      const gravity = -0.5 * fFree * fFree * 1.4

      x = Math.cos(p.angle) * r
      y = vY + dy + gravity
      z = Math.sin(p.angle) * r
    }

    return { x, y, z, size: 0.008, value: 1 - p.t }
  }, [exitAngle, vY, rimRadius, rimDy, isHemi, isFlat, coneR, coneHH, tSurf])

  return (
    <Canvas camera={{ position: [2, 1.5, 2.5], fov: 50 }} style={{ background: '#03040d' }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-2, 3, 1]} intensity={0.3} color="#29b6f6" />
      <group position={[0, -0.5, 0]}>
        <mesh><cylinderGeometry args={[0.04, 0.02, 0.15, 16]} /><meshStandardMaterial color="#37474f" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.06, 0.06, 0.25, 16]} /><meshStandardMaterial color="#455a64" metalness={0.6} /></mesh>
      </group>
      <RainbowParticles count={particleCount} initFn={initJet} advanceFn={advanceJet} getState={getStateJet} />
      <RainbowParticles count={splashCount} initFn={initSplash} advanceFn={advanceSplash} getState={getStateSplash} />
      <Vane vaneType={vaneType} beta={beta} position={[0, vY, 0]} />
      <ForceArrow F={Ftheo} position={[0.25, vY, 0]} />
      <Text position={[0, -0.9, 0]} fontSize={0.06} color="#9aa2c0">V_jet={Vjet.toFixed(2)} m/s</Text>
      <gridHelper args={[4, 16, '#1a237e', '#0d1040']} position={[0, -0.8, 0]} />
      <OrbitControls enableDamping dampingFactor={0.08} />
    </Canvas>
  )
}
