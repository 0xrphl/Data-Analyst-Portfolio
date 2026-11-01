import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { jetRGB } from './colormap.js'

/**
 * Rainbow-colored instanced particle system.
 *
 * Props
 * ─────
 * count        — number of particles
 * getState(i)  — returns { x, y, z, size, value } for particle i
 *                value ∈ [0,1] drives rainbow color
 * advanceFn(data, dt, i) — mutate data[i] each frame, return nothing
 * initFn()    — returns initial data array [{...}, ...]
 *
 * The parent scene is responsible for the physics / position logic
 * via getState and advanceFn.  This component handles:
 *   • InstancedMesh + per-instance color via InstancedBufferAttribute
 *   • Jet-colormap rainbow on each particle every frame
 *   • Size scaling
 */
export default function RainbowParticles({ count = 500, initFn, advanceFn, getState }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Particle data lives in a ref so it survives re-renders
  const dataRef = useRef(null)
  if (!dataRef.current) dataRef.current = initFn()

  // Rebuild data when initFn identity changes (slider change)
  useEffect(() => { dataRef.current = initFn() }, [initFn])

  // Per-instance color buffer
  const colorAttr = useMemo(() => {
    const arr = new Float32Array(count * 3)
    // default white
    for (let i = 0; i < count * 3; i++) arr[i] = 1
    return new THREE.InstancedBufferAttribute(arr, 3)
  }, [count])

  // Attach color attribute to geometry once mesh is ready
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.setAttribute('color', colorAttr)
    }
  }, [colorAttr])

  useFrame((_, dt) => {
    const mesh = meshRef.current
    if (!mesh) return
    const data = dataRef.current
    if (!data || data.length === 0) return
    const colors = colorAttr.array
    const n = Math.min(count, data.length)

    for (let i = 0; i < n; i++) {
      // Advance physics
      advanceFn(data, dt, i)

      // Get visual state
      const s = getState(data[i], i)

      dummy.position.set(s.x, s.y, s.z)
      dummy.scale.setScalar(s.size || 0.015)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)

      // Rainbow color from normalised value
      const [r, g, b] = jetRGB(Math.max(0, Math.min(1, s.value)))
      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }

    mesh.instanceMatrix.needsUpdate = true
    colorAttr.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial vertexColors transparent opacity={0.9} />
    </instancedMesh>
  )
}
