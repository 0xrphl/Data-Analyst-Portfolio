import React, { useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import RainbowParticles from '../RainbowParticles.jsx'

/**
 * Geometría de los 3 álabes del Experimento N° 6:
 * - 90°: Plato plano circular horizontal
 * - 102°: Cazoleta curva con deflexión a 102°
 * - 180°: Cazoleta semiesférica (inversión a 180°)
 */
function VaneMesh({ vaneKey }) {
  if (vaneKey === 'vane_180') {
    // Cazoleta semiesférica: apertura orientada HACIA ABAJO hacia el chorro (inversión 180°)
    return (
      <group>
        <mesh rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.13, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#b0bec5" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        {/* Borde reforzado de la abertura inferior */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.008, 16, 32]} />
          <meshStandardMaterial color="#78909c" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Acople superior con la barra */}
        <mesh position={[0, 0.135, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.016, 16]} />
          <meshStandardMaterial color="#37474f" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    )
  }

  if (vaneKey === 'vane_102') {
    // Álabe curvo de 102°: copa esférica cóncava orientada HACIA ABAJO hacia el chorro
    const thetaMax = (51 * Math.PI) / 180
    const rimY = 0.14 * Math.cos(thetaMax)
    const rimR = 0.14 * Math.sin(thetaMax)
    return (
      <group>
        <mesh rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.14, 32, 16, 0, Math.PI * 2, 0, thetaMax]} />
          <meshStandardMaterial color="#90a4ae" metalness={0.8} roughness={0.28} side={THREE.DoubleSide} />
        </mesh>
        {/* Borde perimetral de salida inferior */}
        <mesh position={[0, rimY, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[rimR, 0.007, 16, 32]} />
          <meshStandardMaterial color="#607d8b" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Acople superior con la barra */}
        <mesh position={[0, 0.145, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.016, 16]} />
          <meshStandardMaterial color="#37474f" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    )
  }

  // Álabe Plano (90°): plato circular HORIZONTAL perpendicular al chorro vertical
  return (
    <group>
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.012, 36]} />
        <meshStandardMaterial color="#cfd8dc" metalness={0.82} roughness={0.22} />
      </mesh>
      {/* Tornillo central superior de acople a la barra vertical */}
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.014, 16]} />
        <meshStandardMaterial color="#37474f" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  )
}

function WeightsStack({ weightItems = [] }) {
  let currentY = 0.005
  return (
    <group position={[0, 0.01, 0]}>
      {weightItems.map((w, idx) => {
        const r = 0.045 + (w.val / 100) * 0.035
        const h = 0.009 + (w.val / 100) * 0.008
        const yPos = currentY + h / 2
        currentY += h + 0.002
        return (
          <group key={idx} position={[0, yPos, 0]}>
            <mesh>
              <cylinderGeometry args={[r, r, h, 28]} />
              <meshStandardMaterial
                color={w.val >= 50 ? '#ffd54f' : w.val >= 20 ? '#ffe082' : '#cfd8dc'}
                metalness={0.88}
                roughness={0.25}
              />
            </mesh>
            <mesh position={[r * 0.5, 0, 0]}>
              <boxGeometry args={[r, h * 1.05, 0.008]} />
              <meshStandardMaterial color="#263238" metalness={0.7} roughness={0.3} />
            </mesh>
            <Text position={[0, 0, r + 0.008]} fontSize={0.018} color="#fff" anchorX="center" anchorY="middle">
              {w.val + 'g'}
            </Text>
          </group>
        )
      })}
    </group>
  )
}


export default function JetImpactScene({ results, weightItems = [], particleCount = 450 }) {
  const {
    vaneKey = 'vane_90',
    V0 = 3.5,
    isBalanced = false,
    balancePercent = 90,
    displacementY = 0,
  } = results || {}

  const vY_base = 0.45
  const mobileY = vY_base + displacementY
  const nozzleTipY = 0.05
  const jetTravelH = vY_base - nozzleTipY

  const initJet = useCallback(() => {
    return Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      r: Math.sqrt(Math.random()) * 0.018,
      y: Math.random() * jetTravelH,
      speed: 0.8 + Math.random() * 0.4,
    }))
  }, [particleCount, jetTravelH])

  const advanceJet = useCallback((data, dt, i) => {
    const p = data[i]
    p.y += p.speed * Math.min(Math.max(V0 * 0.35, 0.5), 4) * dt
    if (p.y > jetTravelH) {
      p.y = 0
      p.angle = Math.random() * Math.PI * 2
    }
  }, [V0, jetTravelH])

  const getStateJet = useCallback((p) => {
    return {
      x: Math.cos(p.angle) * p.r,
      y: nozzleTipY + p.y,
      z: Math.sin(p.angle) * p.r,
      size: 0.012,
      value: Math.min(1, V0 / 8),
    }
  }, [nozzleTipY, V0])

  const splashCount = Math.floor(particleCount * 0.7)
  const initSplash = useCallback(() => {
    return Array.from({ length: splashCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      t: Math.random(),
      speed: 0.5 + Math.random() * 0.5,
    }))
  }, [splashCount])

  const advanceSplash = useCallback((data, dt, i) => {
    const p = data[i]
    p.t += p.speed * Math.min(Math.max(V0 * 0.25, 0.4), 3) * dt
    if (p.t > 1) {
      p.t = 0
      p.angle = Math.random() * Math.PI * 2
    }
  }, [V0])

  const getStateSplash = useCallback((p) => {
    const f = p.t
    let r = 0.02
    let dy = 0

    if (vaneKey === 'vane_90') {
      // Deflexión radial a 90°: impacto contra la cara inferior del disco horizontal
      r = 0.02 + f * 0.28
      dy = f < 0.25 ? 0 : -0.45 * Math.pow(f - 0.25, 2)
    } else if (vaneKey === 'vane_102') {
      // Deflexión a 102°: salida levemente inclinada hacia abajo
      r = 0.03 + f * 0.22
      dy = 0.06 - f * 0.22 - 0.45 * f * f
    } else {
      // Deflexión a 180°: chorro invertido saliendo de la cazoleta directamente hacia abajo
      r = 0.12 + Math.sin(p.angle * 4 + f) * 0.012 + f * 0.03
      dy = -f * 0.55 - 0.5 * f * f
    }

    return {
      x: Math.cos(p.angle) * r,
      y: mobileY + dy,
      z: Math.sin(p.angle) * r,
      size: 0.011,
      value: 1 - f * 0.7,
    }
  }, [vaneKey, mobileY])

  const levelLineColor = isBalanced ? '#00e676' : '#ff3b30'

  return (
    <Canvas camera={{ position: [0.95, 0.7, 1.35], fov: 48 }} style={{ background: '#03040d' }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={0.9} />
      <pointLight position={[-2, 3, -1]} intensity={0.4} color="#82cfff" />

      {/* ── 1. Estructura Fija del Equipo (Base y columnas soporte abiertas, sin cúpula) ── */}
      <group position={[0, -0.05, 0]}>
        <mesh>
          <cylinderGeometry args={[0.34, 0.36, 0.06, 36]} />
          <meshStandardMaterial color="#263238" metalness={0.7} roughness={0.3} />
        </mesh>
        {[-0.24, 0.24].map((x, i) => (
          <mesh key={i} position={[x, -0.05, 0]}>
            <cylinderGeometry args={[0.03, 0.035, 0.04, 16]} />
            <meshStandardMaterial color="#455a64" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Columnas laterales de soporte del laboratorio (reemplazan la cúpula para máxima visibilidad) */}
      {[-0.27, 0.27].map((x, i) => (
        <group key={i} position={[x, 0.44, 0]}>
          <mesh>
            <cylinderGeometry args={[0.007, 0.007, 0.98, 16]} />
            <meshStandardMaterial color="#546e7a" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Travesaño superior de guía para la barra móvil */}
      <group position={[0, 0.92, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.56, 0.012, 0.022]} />
          <meshStandardMaterial color="#263238" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Cojinete central guía */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.024, 16]} />
          <meshStandardMaterial color="#ffd54f" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Tobera fija de 8 mm con chorro hacia arriba */}
      <group position={[0, -0.02, 0]}>
        <mesh position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.016, 0.035, 0.07, 24]} />
          <meshStandardMaterial color="#37474f" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.071, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.004, 16]} />
          <meshBasicMaterial color="#0d47a1" />
        </mesh>
      </group>

      {/* ── 2. Indicador Fijo de Nivel (Calibre) ── */}
      <group position={[0.22, 0.94, 0]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.014, 0.18, 0.014]} />
          <meshStandardMaterial color="#37474f" metalness={0.8} />
        </mesh>
        <mesh position={[-0.04, 0, 0]}>
          <boxGeometry args={[0.07, 0.004, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Text position={[0.015, 0, 0]} fontSize={0.024} color="#ffffff" anchorX="left">
          Índice fijo
        </Text>
      </group>

      {/* ── 3. Conjunto Móvil: Álabe + Barra + Platillo ── */}
      <group position={[0, displacementY, 0]}>
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.65, 16]} />
          <meshStandardMaterial color="#cfd8dc" metalness={0.9} roughness={0.15} />
        </mesh>

        <group position={[0, vY_base, 0]}>
          <VaneMesh vaneKey={vaneKey} />
        </group>

        <group position={[0, 0.94, 0]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.012, 32]} />
            <meshStandardMaterial color="#455a64" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.111, 0.0025, 12, 32]} />
            <meshBasicMaterial color={levelLineColor} />
          </mesh>
          <WeightsStack weightItems={weightItems} />
        </group>
      </group>

      {/* ── 4. Línea Láser Horizontal de Nivelación (ROJA / VERDE) ── */}
      <group position={[0, 0.94, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.002, 0.002, 0.44, 16]} />
          <meshBasicMaterial color={levelLineColor} />
        </mesh>
        {isBalanced && (
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.44, 16]} />
            <meshBasicMaterial color="#00e676" transparent opacity={0.45} />
          </mesh>
        )}
        <Text
          position={[0, 0.07, 0]}
          fontSize={0.038}
          color={levelLineColor}
          anchorX="center"
          anchorY="bottom"
          fontWeight={800}
        >
          {isBalanced ? '✔ FUERZA NIVELADA' : 'DESEQUILIBRADO'}
        </Text>
      </group>

      {/* ── 5. Partículas de Agua ── */}
      <RainbowParticles count={particleCount} initFn={initJet} advanceFn={advanceJet} getState={getStateJet} />
      <RainbowParticles count={splashCount} initFn={initSplash} advanceFn={advanceSplash} getState={getStateSplash} />

      <Text position={[-0.28, 0.08, 0]} fontSize={0.026} color="#82cfff" anchorX="center">
        Tobera ∅ 8 mm
      </Text>
      <Text position={[-0.28, vY_base, 0]} fontSize={0.026} color="#ffd54f" anchorX="center">
        {results?.vaneName || ''}
      </Text>

      <gridHelper args={[2.5, 20, '#1a237e', '#0d1040']} position={[0, -0.09, 0]} />
      <OrbitControls enableDamping dampingFactor={0.08} minDistance={0.5} maxDistance={3.5} target={[0, 0.5, 0]} />
    </Canvas>
  )
}

