import React, { useMemo } from 'react'
import * as THREE from 'three'
import { jetRGB } from './colormap.js'

/**
 * Iso-velocity contour rings at cross-sections along a pipe.
 *
 * Props
 * ─────
 * positions   — [{x, pipeR}] world-x positions + local pipe radius (scene units)
 * levels      — number of concentric iso-lines (3–20)
 * isLaminar   — true → parabolic, false → 1/7 power law
 * rotation    — [rx,ry,rz] for ring orientation (default YZ plane for X-pipe)
 */
export default function IsoRings({ positions = [], levels = 8, isLaminar = true, rotation }) {
  const rot = rotation || [0, Math.PI / 2, 0]

  const rings = useMemo(() => {
    const out = []
    for (const pos of positions) {
      const { x, pipeR } = pos
      for (let l = 1; l <= levels; l++) {
        const rFrac = l / (levels + 1)          // 0→1 from centre to wall
        const r = rFrac * pipeR
        // velocity at this radius (normalised 0–1)
        const vNorm = isLaminar
          ? 1 - rFrac * rFrac                   // parabolic
          : Math.pow(Math.max(0, 1 - rFrac), 1 / 7)  // 1/7 power law
        const [cr, cg, cb] = jetRGB(vNorm)
        const color = new THREE.Color(cr, cg, cb)
        out.push({ x, r, color, vNorm })
      }
    }
    return out
  }, [positions, levels, isLaminar])

  return (
    <group>
      {rings.map((ring, i) => (
        <mesh key={i} position={[ring.x, 0, 0]} rotation={rot}>
          <torusGeometry args={[ring.r, 0.005, 8, 32]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={0.7 + ring.vNorm * 0.3}
          />
        </mesh>
      ))}
    </group>
  )
}
