import React, { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import RainbowParticles from '../RainbowParticles.jsx'

function FittingMarker({ position, fitting, onHoverStart, onHoverEnd }) {
  const [hovered, setHovered] = useState(false)
  const { name, K, color, hL } = fitting

  const handleOver = useCallback((e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
    if (onHoverStart) onHoverStart(fitting, e)
  }, [fitting, onHoverStart])

  const handleOut = useCallback((e) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
    if (onHoverEnd) onHoverEnd()
  }, [onHoverEnd])

  const handleMove = useCallback((e) => {
    if (onHoverStart) onHoverStart(fitting, e)
  }, [fitting, onHoverStart])

  const emissive = hovered ? 1.0 : 0.3
  const ringScale = hovered ? 1.25 : 1.0

  return (
    <group position={position}>
      {/* Interactive hit area — invisible but larger for easy hover */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onPointerMove={handleMove}
      >
        <torusGeometry args={[0.16, 0.04, 8, 24]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      {/* Visible ring — perpendicular to pipe (pipe along X → ring in YZ plane) */}
      <mesh rotation={[0, Math.PI / 2, 0]} scale={[ringScale, ringScale, ringScale]}>
        <torusGeometry args={[0.14, 0.02, 12, 32]} />
        <meshStandardMaterial
          color={color} emissive={color} emissiveIntensity={emissive}
          transparent opacity={hovered ? 1.0 : 0.85}
        />
      </mesh>
      {/* Glow zone */}
      <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.1, 16, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.25 : 0.12} side={THREE.DoubleSide} />
      </mesh>
      {/* Labels */}
      <Billboard position={[0, 0.24, 0]}>
        <Text fontSize={hovered ? 0.055 : 0.04} color={color} anchorY="bottom" fontWeight={hovered ? 700 : 400}>
          {name}
        </Text>
      </Billboard>
      <Billboard position={[0, 0.18, 0]}>
        <Text fontSize={0.035} color="#82cfff" anchorY="bottom">
          K={K.toFixed(2)} · hL={hL.toFixed(4)}m
        </Text>
      </Billboard>
    </group>
  )
}

function PressureGradient({ fittings, pipeLen, pipeR }) {
  if (!fittings || fittings.length === 0) return null
  const totalHL = fittings.reduce((s, f) => s + f.hL, 0)
  const maxH = 0.6
  const points = []
  let cumHL = 0
  const startX = -pipeLen / 2
  points.push(new THREE.Vector3(startX, pipeR + maxH + 0.05, 0))

  const spacing = pipeLen / (fittings.length + 1)
  for (let i = 0; i < fittings.length; i++) {
    const x = startX + (i + 1) * spacing
    const hBefore = pipeR + maxH * (1 - cumHL / Math.max(totalHL, 0.001)) + 0.05
    cumHL += fittings[i].hL
    const hAfter = pipeR + maxH * (1 - cumHL / Math.max(totalHL, 0.001)) + 0.05
    points.push(new THREE.Vector3(x - 0.05, hBefore, 0))
    points.push(new THREE.Vector3(x + 0.05, hAfter, 0))
  }
  points.push(new THREE.Vector3(pipeLen / 2, pipeR + maxH * (1 - cumHL / Math.max(totalHL, 0.001)) + 0.05, 0))

  const geom = new THREE.BufferGeometry().setFromPoints(points)
  return (
    <group>
      <line geometry={geom}><lineBasicMaterial color="#f44336" /></line>
      <Text position={[pipeLen / 2 + 0.15, points[points.length - 1].y, 0]} fontSize={0.04} color="#f44336" anchorX="left">HGL</Text>
    </group>
  )
}

export default function MinorLossesScene({ results, onFittingHover, onFittingLeave, colorMode = 'Velocity', particleCount = 400 }) {
  const { V = 1, fittings = [], totalHL = 0 } = results || {}
  const pipeLen = 5
  const pipeR = 0.12
  const spacing = pipeLen / (Math.max(fittings.length, 1) + 1)

  // Rainbow particles
  const initFn = useCallback(() => {
    const arr = []
    for (let i = 0; i < particleCount; i++) {
      arr.push({ angle: Math.random() * Math.PI * 2, rFrac: Math.sqrt(Math.random()) * 0.9, x: (Math.random() - 0.5) * pipeLen })
    }
    return arr
  }, [particleCount, pipeLen])

  const advanceFn = useCallback((data, dt, i) => {
    const p = data[i]
    const vS = Math.min(V * 0.4, 3) * (0.6 + p.rFrac * 0.4)
    p.x += vS * dt
    if (p.x > pipeLen / 2) { p.x -= pipeLen; p.angle = Math.random() * Math.PI * 2 }
  }, [V, pipeLen])

  const getStateFn = useCallback((p) => {
    const r = p.rFrac * pipeR
    const xNorm = (p.x + pipeLen / 2) / pipeLen
    let value = 0.6 + p.rFrac * 0.4 // velocity (faster near center)
    if (colorMode === 'Pressure') value = 1 - xNorm // drops along pipe
    if (colorMode === 'Energy Loss') {
      // cumulative loss grows along pipe
      value = xNorm
    }
    return { x: p.x, y: Math.cos(p.angle) * r, z: Math.sin(p.angle) * r, size: 0.009, value }
  }, [pipeR, pipeLen, colorMode])

  const handleHoverStart = useCallback((fitting, e) => {
    if (onFittingHover) {
      // Get screen mouse position from the Three.js pointer event
      const clientX = e?.nativeEvent?.clientX ?? e?.clientX ?? 0
      const clientY = e?.nativeEvent?.clientY ?? e?.clientY ?? 0
      onFittingHover(fitting, { x: clientX, y: clientY })
    }
  }, [onFittingHover])

  const handleHoverEnd = useCallback(() => {
    if (onFittingLeave) onFittingLeave()
  }, [onFittingLeave])

  return (
    <Canvas camera={{ position: [3, 2, 3], fov: 50 }} style={{ background: '#03040d' }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      {/* Main pipe */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[pipeR, pipeR, pipeLen, 32, 1, true]} />
        <meshPhysicalMaterial color="#607d8b" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * pipeLen / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[pipeR, 0.006, 8, 32]} />
          <meshStandardMaterial color="#546e7a" metalness={0.6} />
        </mesh>
      ))}
      <RainbowParticles count={particleCount} initFn={initFn} advanceFn={advanceFn} getState={getStateFn} />

      {/* Fitting markers — interactive */}
      {fittings.map((f, i) => (
        <FittingMarker
          key={f.name + i}
          position={[-pipeLen / 2 + (i + 1) * spacing, 0, 0]}
          fitting={f}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
        />
      ))}

      <PressureGradient fittings={fittings} pipeLen={pipeLen} pipeR={pipeR} />

      {/* Flow arrow */}
      <mesh position={[pipeLen / 2 + 0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.12, 8]} />
        <meshBasicMaterial color="#4fc3f7" />
      </mesh>
      <gridHelper args={[6, 20, '#1a237e', '#0d1040']} position={[0, -pipeR - 0.25, 0]} />
      <OrbitControls enableDamping dampingFactor={0.08} />
    </Canvas>
  )
}
