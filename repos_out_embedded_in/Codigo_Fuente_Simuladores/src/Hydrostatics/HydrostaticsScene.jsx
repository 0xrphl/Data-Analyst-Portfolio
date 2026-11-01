import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Line, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { getGateRotatedExtent } from './solver.js'

export default function HydrostaticsScene({
  mode = 'wall',
  geometryId,
  gateShape = 'gate_rectangle',
  gateDepthY = 1.0,
  gateDimA = 1.2,
  gateDimB = 1.0,
  gateRollDeg = 0,
  rho,
  h,
  gateHeight,
  gateWidth,
  thetaDeg,
  radius,
  shapeParam,
  submergedHeight,
  FH,
  FV,
  FR,
  xcp,
  ycp,
  xcg,
  ycg,
  samples = [],
  fluidColor = '#29b6f6',
  isFullySubmerged = false,
}) {
  const tankLength = 4.0

  const getWallX = (y) => {
    if (geometryId === 'flat_vertical') return 0
    if (geometryId === 'flat_inclined') {
      const rad = (thetaDeg * Math.PI) / 180
      return (y / Math.sin(rad)) * Math.cos(rad)
    }
    if (geometryId === 'circular_cylindrical') {
      const R = Math.max(radius, gateHeight)
      const diff = Math.max(0, R * R - (R - y) * (R - y))
      return Math.sqrt(diff)
    }
    if (geometryId === 'parabolic') {
      const a = Math.max(0.05, shapeParam)
      return Math.sqrt(Math.max(0, y / a))
    }
    if (geometryId === 'cubic') {
      const a = Math.max(0.05, shapeParam)
      return Math.cbrt(Math.max(0, y / a))
    }
    if (geometryId === 'elliptical') {
      const b = Math.max(gateHeight, 1.0)
      const a = Math.max(radius, 1.0)
      const term = Math.max(0, 1 - Math.pow(1 - y / b, 2))
      return a * Math.sqrt(term)
    }
    return 0
  }


  const wallMeshGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const vertices = []
    const indices = []
    const nSteps = 50
    const wHalf = gateWidth / 2

    for (let i = 0; i <= nSteps; i++) {
      const y = (i / nSteps) * gateHeight
      const x = getWallX(y)
      vertices.push(x, y, -wHalf)
      vertices.push(x, y, wHalf)
    }

    for (let i = 0; i < nSteps; i++) {
      const v0 = i * 2
      const v1 = i * 2 + 1
      const v2 = (i + 1) * 2
      const v3 = (i + 1) * 2 + 1
      indices.push(v0, v1, v2)
      indices.push(v1, v3, v2)
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geom.setIndex(indices)
    geom.computeVertexNormals()
    return geom
  }, [geometryId, gateHeight, gateWidth, thetaDeg, radius, shapeParam])

  // Geometría del agua que se adapta con exactitud al perfil curvo
  const fluidVolumeGeometry = useMemo(() => {
    if (submergedHeight <= 0.001) return null

    const shape = new THREE.Shape()
    const nSteps = 50

    shape.moveTo(-tankLength, 0)
    shape.lineTo(getWallX(0), 0)

    for (let i = 1; i <= nSteps; i++) {
      const curY = (i / nSteps) * submergedHeight
      const curX = getWallX(curY)
      shape.lineTo(curX, curY)
    }

    shape.lineTo(-tankLength, submergedHeight)
    shape.closePath()

    const extrudeSettings = {
      steps: 1,
      depth: gateWidth,
      bevelEnabled: false,
    }

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geom.translate(0, 0, -gateWidth / 2)
    return geom
  }, [geometryId, submergedHeight, gateHeight, gateWidth, thetaDeg, radius, shapeParam])

  // Geometría 3D de la compuerta aislada (centrada en su centroide para rotación pura en su plano 2D)
  const isolatedGateGeometry = useMemo(() => {
    if (mode !== 'gate') return null
    const a = gateDimA
    const b = gateDimB
    const shape = new THREE.Shape()

    if (gateShape === 'gate_rectangle') {
      shape.moveTo(-b / 2, -a / 2)
      shape.lineTo(b / 2, -a / 2)
      shape.lineTo(b / 2, a / 2)
      shape.lineTo(-b / 2, a / 2)
      shape.closePath()
    } else if (gateShape === 'gate_circle') {
      const R = a / 2
      shape.absarc(0, 0, R, 0, Math.PI * 2, false)
    } else if (gateShape === 'gate_ellipse') {
      const rY = a / 2
      const rX = b / 2
      shape.absellipse(0, 0, rX, rY, 0, Math.PI * 2, false)
    } else if (gateShape === 'gate_triangle_down') {
      shape.moveTo(0, -(2 / 3) * a)
      shape.lineTo(b / 2, (1 / 3) * a)
      shape.lineTo(-b / 2, (1 / 3) * a)
      shape.closePath()
    } else if (gateShape === 'gate_triangle_up') {
      shape.moveTo(-b / 2, -(1 / 3) * a)
      shape.lineTo(b / 2, -(1 / 3) * a)
      shape.lineTo(0, (2 / 3) * a)
      shape.closePath()
    }

    const extrudeSettings = { steps: 1, depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015 }
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geom.translate(0, 0, -0.025)
    return geom
  }, [mode, gateShape, gateDimA, gateDimB])

  // Geometría del agua en Modo Gate: se adapta dinámicamente a la inclinación y cota de la compuerta apoyada en base
  const gateFluidGeometry = useMemo(() => {
    if (mode !== 'gate' || h <= 0.001) return null

    const shape = new THREE.Shape()
    const rad = (thetaDeg * Math.PI) / 180
    const sinT = Math.max(0.01, Math.sin(rad))
    const cosT = Math.cos(rad)

    let localYcg = gateDimA / 2
    if (gateShape === 'gate_triangle_down') localYcg = (2 / 3) * gateDimA
    if (gateShape === 'gate_triangle_up') localYcg = (1 / 3) * gateDimA

    const { vMin, vMax } = getGateRotatedExtent(gateShape, gateDimA, gateDimB, gateRollDeg)
    const etaMin = localYcg + vMin
    const etaMax = localYcg + vMax

    const xBottom = etaMin * cosT
    const yBottom = gateDepthY + etaMin * sinT
    const xTop = etaMax * cosT
    const yTop = gateDepthY + etaMax * sinT

    shape.moveTo(-tankLength, 0)
    shape.lineTo(Math.min(0, xBottom), 0)

    if (yBottom > 0) {
      shape.lineTo(xBottom, Math.min(yBottom, h))
    }

    if (h > yBottom) {
      const ySubTop = Math.min(h, yTop)
      const t = (ySubTop - yBottom) / (yTop - yBottom || 0.001)
      const xSubTop = xBottom + t * (xTop - xBottom)
      shape.lineTo(xSubTop, ySubTop)

      if (h > yTop) {
        shape.lineTo(xTop, h)
      }
    }

    shape.lineTo(-tankLength, h)
    shape.closePath()

    const depth = Math.max(gateDimB * 1.5, 2.0)
    const extrudeSettings = { steps: 1, depth, bevelEnabled: false }
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geom.translate(0, 0, -depth / 2)
    return geom
  }, [mode, h, thetaDeg, gateDepthY, gateDimA, gateDimB, gateRollDeg, gateShape])


  // Prisma de presiones 3D volumétrico translúcido (Wall o Gate)
  const pressurePrism3D = useMemo(() => {
    const pScale = 0.45
    if (mode === 'wall') {
      if (submergedHeight <= 0.01) return null
      const nY = 24
      const wHalf = gateWidth / 2
      const wallPts = []
      const backPts = []

      for (let i = 0; i <= nY; i++) {
        const y = (i / nY) * submergedHeight
        const depth = submergedHeight - y
        const len = depth * pScale
        const x = getWallX(y)
        const dy = 0.002
        const dx = getWallX(Math.min(submergedHeight, y + dy)) - getWallX(Math.max(0, y - dy))
        const hyp = Math.hypot(1, -dx / (2 * dy)) || 1
        const nx = 1 / hyp
        const ny = (-dx / (2 * dy)) / hyp
        wallPts.push({ x, y })
        backPts.push({ x: x - nx * len, y: y - ny * len })
      }

      const shape = new THREE.Shape()
      shape.moveTo(wallPts[0].x, wallPts[0].y)
      for (let i = 1; i <= nY; i++) shape.lineTo(wallPts[i].x, wallPts[i].y)
      for (let i = nY; i >= 0; i--) shape.lineTo(backPts[i].x, backPts[i].y)
      shape.closePath()

      const geom = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: gateWidth, bevelEnabled: false })
      geom.translate(0, 0, -wHalf)
      const edges = new THREE.EdgesGeometry(geom, 22)
      return { geom, edges }
    } else {
      const a = gateDimA
      const b = gateDimB
      const phi = ((gateRollDeg || 0) * Math.PI) / 180
      const cosP = Math.cos(phi)
      const sinP = Math.sin(phi)
      const rad = (thetaDeg * Math.PI) / 180
      const sinT = Math.max(0.01, Math.sin(rad))
      const cosT = Math.cos(rad)

      let localYcg = a / 2
      if (gateShape === 'gate_triangle_down') localYcg = (2 / 3) * a
      if (gateShape === 'gate_triangle_up') localYcg = (1 / 3) * a

      let rawPts = []
      if (gateShape === 'gate_rectangle') {
        rawPts = [{ u: -b / 2, v: -a / 2 }, { u: b / 2, v: -a / 2 }, { u: b / 2, v: a / 2 }, { u: -b / 2, v: a / 2 }]
      } else if (gateShape === 'gate_circle') {
        const n = 36
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2
          rawPts.push({ u: (a / 2) * Math.cos(ang), v: (a / 2) * Math.sin(ang) })
        }
      } else if (gateShape === 'gate_ellipse') {
        const n = 36
        const rX = b / 2, rY = a / 2
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2
          rawPts.push({ u: rX * Math.cos(ang), v: rY * Math.sin(ang) })
        }
      } else if (gateShape === 'gate_triangle_down') {
        rawPts = [{ u: 0, v: -(2 / 3) * a }, { u: b / 2, v: (1 / 3) * a }, { u: -b / 2, v: (1 / 3) * a }]
      } else if (gateShape === 'gate_triangle_up') {
        rawPts = [{ u: -b / 2, v: -(1 / 3) * a }, { u: b / 2, v: -(1 / 3) * a }, { u: 0, v: (2 / 3) * a }]
      }

      const rotPts = rawPts.map((p) => ({
        x: p.u * cosP - p.v * sinP,
        y: p.u * sinP + p.v * cosP,
      }))

      const vMaxSub = (h - gateDepthY) / sinT - localYcg
      const clipped = []
      const n = rotPts.length
      for (let i = 0; i < n; i++) {
        const cur = rotPts[i]
        const prev = rotPts[(i + n - 1) % n]
        const curIn = cur.y <= vMaxSub
        const prevIn = prev.y <= vMaxSub

        if (prevIn && curIn) {
          clipped.push(cur)
        } else if (prevIn && !curIn) {
          const t = (vMaxSub - prev.y) / (cur.y - prev.y || 0.0001)
          clipped.push({ x: prev.x + t * (cur.x - prev.x), y: vMaxSub })
        } else if (!prevIn && curIn) {
          const t = (vMaxSub - prev.y) / (cur.y - prev.y || 0.0001)
          clipped.push({ x: prev.x + t * (cur.x - prev.x), y: vMaxSub })
          clipped.push(cur)
        }
      }

      if (clipped.length < 3) return null

      const pts = clipped.map((p) => new THREE.Vector2(p.x, p.y))
      const numPts = pts.length
      const vertices = []
      const indices = []

      for (let i = 0; i < numPts; i++) {
        const pt = pts[i]
        const eta = localYcg + pt.y
        const x = eta * cosT
        const y = gateDepthY + eta * sinT
        const z = pt.x
        vertices.push(x, y, z)
      }

      for (let i = 0; i < numPts; i++) {
        const pt = pts[i]
        const eta = localYcg + pt.y
        const x = eta * cosT
        const y = gateDepthY + eta * sinT
        const z = pt.x
        const depth = Math.max(0, h - y)
        const len = depth * pScale
        vertices.push(x - sinT * len, y - (-cosT) * len, z)
      }

      for (let i = 0; i < numPts; i++) {
        const next = (i + 1) % numPts
        indices.push(i, numPts + i, next)
        indices.push(next, numPts + i, numPts + next)
      }

      const triangles = THREE.ShapeUtils.triangulateShape(pts, [])
      for (let i = 0; i < triangles.length; i++) {
        const [t0, t1, t2] = triangles[i]
        indices.push(t0, t1, t2)
        indices.push(numPts + t0, numPts + t2, numPts + t1)
      }

      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geom.setIndex(indices)
      geom.computeVertexNormals()
      const edges = new THREE.EdgesGeometry(geom, 22)
      return { geom, edges }
    }
  }, [mode, geometryId, submergedHeight, gateWidth, gateShape, gateDimA, gateDimB, gateRollDeg, gateDepthY, thetaDeg, h])

  // Vectores distribuidos 3D del prisma de presiones sobre la superficie mojada
  const pressureArrows = useMemo(() => {
    const arrows = []
    const pScale = 0.45

    if (mode === 'wall') {
      if (submergedHeight <= 0.01) return []
      const nY = 8
      const nZ = 5
      const wHalf = gateWidth / 2
      for (let iy = 0; iy <= nY; iy++) {
        const y = (iy / nY) * submergedHeight
        const depth = Math.max(0, submergedHeight - y)
        if (depth <= 0.02) continue
        const len = depth * pScale
        const x = getWallX(y)
        const dy = 0.002
        const dx = getWallX(Math.min(submergedHeight, y + dy)) - getWallX(Math.max(0, y - dy))
        const hyp = Math.hypot(1, -dx / (2 * dy)) || 1
        const nx = 1 / hyp
        const ny = (-dx / (2 * dy)) / hyp
        for (let iz = 0; iz <= nZ; iz++) {
          const z = -wHalf * 0.85 + (iz / nZ) * (gateWidth * 0.85)
          arrows.push({ origin: [x, y, z], dir: [nx, ny, 0], length: len })
        }
      }
    } else {
      const a = gateDimA
      const b = gateDimB
      const rad = (thetaDeg * Math.PI) / 180
      const sinT = Math.max(0.01, Math.sin(rad))
      const cosT = Math.cos(rad)
      const nx = sinT
      const ny = -cosT

      const nEta = 7
      const nU = 5
      for (let iEta = 0; iEta <= nEta; iEta++) {
        const eta = (iEta / nEta) * a
        const y = gateDepthY + eta * sinT
        const depth = Math.max(0, h - y)
        if (depth <= 0.02) continue
        const len = depth * pScale
        const x = eta * cosT
        for (let iu = 0; iu <= nU; iu++) {
          const z = (-b / 2) * 0.8 + (iu / nU) * (b * 0.8)
          arrows.push({ origin: [x, y, z], dir: [nx, ny, 0], length: len })
        }
      }
    }
    return arrows
  }, [mode, geometryId, submergedHeight, gateWidth, gateShape, gateDimA, gateDimB, gateRollDeg, gateDepthY, thetaDeg, h])

  return (
    <Canvas
      camera={{ position: [3.8, 2.6, 4.2], fov: 46 }}
      style={{ width: '100%', height: '100%', background: '#030511' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 4, -4]} intensity={0.4} />
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 + 0.05} />
      <gridHelper args={[10, 20, '#1e293b', '#0f172a']} position={[0, -0.001, 0]} />
      {/* Renderizado de Pared (Modo Wall) */}
      {mode === 'wall' && (
        <mesh geometry={wallMeshGeometry}>
          <meshStandardMaterial
            color="#94a3b8"
            roughness={0.3}
            metalness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Renderizado de Compuerta Aislada (Modo Gate - Apoyada fija en Base) */}
      {mode === 'gate' && isolatedGateGeometry && (() => {
        let localYcg = gateDimA / 2
        if (gateShape === 'gate_triangle_down') localYcg = (2 / 3) * gateDimA
        if (gateShape === 'gate_triangle_up') localYcg = (1 / 3) * gateDimA

        const { vMin } = getGateRotatedExtent(gateShape, gateDimA, gateDimB, gateRollDeg)
        const etaMin = localYcg + vMin
        const rad = (thetaDeg * Math.PI) / 180
        const sinT = Math.max(0.01, Math.sin(rad))
        const cosT = Math.cos(rad)
        const xBottom = etaMin * cosT
        const yBottom = gateDepthY + etaMin * sinT

        return (
          <group>
            {/* Cimiento / muro de apoyo bajo el pie de la compuerta */}
            {yBottom > 0.01 && (
              <mesh position={[xBottom - 0.04, yBottom / 2, 0]}>
                <boxGeometry args={[0.08, yBottom, Math.max(gateDimB * 1.25, 1.2)]} />
                <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.6} />
              </mesh>
            )}

            {/* Grupo de Base en cota fija (0, gateDepthY, 0) */}
            <group position={[0, gateDepthY, 0]}>
              {/* Inclinación longitudinal hacia atrás en el plano XY */}
              <group rotation={[0, 0, -((90 - thetaDeg) * Math.PI) / 180]}>
                {/* Marco de anclaje base a lo largo de Z */}
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, Math.max(gateDimB * 1.3, 1.2), 16]} />
                  <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Orientación de la cara normal al tanque (+X) con ancho en Z */}
                <group rotation={[0, Math.PI / 2, 0]}>
                  {/* Desplazamiento al centroide de la forma */}
                  <group position={[0, localYcg, 0]}>
                    {/* Rotación en el plano 2D sobre el eje normal local Z */}
                    <group rotation={[0, 0, (gateRollDeg * Math.PI) / 180]}>
                      <mesh geometry={isolatedGateGeometry}>
                        <meshStandardMaterial
                          color="#3b82f6"
                          roughness={0.25}
                          metalness={0.7}
                          side={THREE.DoubleSide}
                        />
                      </mesh>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        )
      })()}

      {/* Fluido en Modo Wall: bloque adaptativo que sigue la curvatura */}
      {mode === 'wall' && fluidVolumeGeometry && (
        <group>
          <mesh geometry={fluidVolumeGeometry}>
            <meshStandardMaterial
              color={fluidColor}
              transparent
              opacity={0.38}
              roughness={0.08}
              metalness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Billboard position={[-tankLength / 2, submergedHeight + 0.14, gateWidth / 2 + 0.1]} renderOrder={1000}>
            <Text
              fontSize={0.14}
              color="#38bdf8"
              anchorX="center"
              depthTest={false}
              material-depthTest={false}
              renderOrder={1000}
              outlineWidth={0.015}
              outlineColor="#020617"
            >
              Superficie Libre ({h.toFixed(2)} m)
            </Text>
          </Billboard>
        </group>
      )}

      {/* Fluido en Modo Gate: bloque de agua adaptado al ángulo de la compuerta */}
      {mode === 'gate' && gateFluidGeometry && (
        <group>
          <mesh geometry={gateFluidGeometry}>
            <meshStandardMaterial
              color={fluidColor}
              transparent
              opacity={0.34}
              roughness={0.08}
              metalness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Billboard position={[-tankLength / 2, h + 0.14, (gateDimB * 1.5) / 2 + 0.1]} renderOrder={1000}>
            <Text
              fontSize={0.14}
              color="#38bdf8"
              anchorX="center"
              depthTest={false}
              material-depthTest={false}
              renderOrder={1000}
              outlineWidth={0.015}
              outlineColor="#020617"
            >
              Superficie Libre ({h.toFixed(2)} m)
            </Text>
          </Billboard>
        </group>
      )}

      {/* Prisma de Presiones 3D Volumétrico Translúcido con Aristas */}
      {pressurePrism3D && (
        <group renderOrder={600}>
          {/* Volumen sólido translúcido del prisma */}
          <mesh geometry={pressurePrism3D.geom}>
            <meshStandardMaterial
              color="#f59e0b"
              transparent
              opacity={0.32}
              roughness={0.2}
              metalness={0.15}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* Aristas estructurales del prisma (wireframe nítido) */}
          <lineSegments geometry={pressurePrism3D.edges}>
            <lineBasicMaterial color="#fbbf24" linewidth={1.8} transparent opacity={0.85} />
          </lineSegments>
        </group>
      )}

      {/* Flechas del prisma de presiones distribuidas en la superficie 3D */}
      {pressureArrows.map((arrow, idx) => (
        <group key={idx} position={arrow.origin}>
          <Line
            points={[
              [-arrow.dir[0] * arrow.length, -arrow.dir[1] * arrow.length, 0],
              [0, 0, 0],
            ]}
            color="#f59e0b"
            lineWidth={2.0}
            depthTest={false}
            renderOrder={920}
          />
          <mesh position={[0, 0, 0]} renderOrder={920}>
            <sphereGeometry args={[0.02, 12, 12]} />
            <meshBasicMaterial color="#f59e0b" depthTest={false} />
          </mesh>
        </group>
      ))}

      {/* Marcador CG (Centro de Gravedad) */}
      <group position={[xcg, ycg, 0]}>
        <mesh renderOrder={950}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.8}
            depthTest={false}
          />
        </mesh>
        <Billboard position={[0.15, 0.12, 0]} renderOrder={1000}>
          <Text
            fontSize={0.13}
            color="#10b981"
            anchorX="left"
            fontWeight="bold"
            depthTest={false}
            material-depthTest={false}
            renderOrder={1000}
            outlineWidth={0.016}
            outlineColor="#020617"
          >
            CG ({xcg.toFixed(2)}, {ycg.toFixed(2)})
          </Text>
        </Billboard>
      </group>

      {/* Marcador CP (Centro de Presiones) y Vector Fuerza Resultante */}
      <group position={[xcp, ycp, 0]}>
        <mesh renderOrder={950}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.8}
            depthTest={false}
          />
        </mesh>
        <Billboard position={[0.15, -0.12, 0]} renderOrder={1000}>
          <Text
            fontSize={0.13}
            color="#ef4444"
            anchorX="left"
            fontWeight="bold"
            depthTest={false}
            material-depthTest={false}
            renderOrder={1000}
            outlineWidth={0.016}
            outlineColor="#020617"
          >
            CP ({xcp.toFixed(2)}, {ycp.toFixed(2)})
          </Text>
        </Billboard>
        {FR > 0 && (
          <group>
            <Line
              points={[
                [0, 0, 0],
                [Math.min(1.6, (FH / FR) * 1.3), -Math.min(1.6, (Math.abs(FV) / FR) * 1.3), 0],
              ]}
              color="#ef4444"
              lineWidth={3.5}
              depthTest={false}
              renderOrder={950}
            />
            {/* Componente Horizontal F_H */}
            <Line
              points={[[0, 0, 0], [Math.min(1.6, (FH / FR) * 1.3), 0, 0]]}
              color="#38bdf8"
              lineWidth={1.8}
              dashed
              depthTest={false}
              renderOrder={950}
            />
            {/* Componente Vertical F_V */}
            <Line
              points={[
                [Math.min(1.6, (FH / FR) * 1.3), 0, 0],
                [Math.min(1.6, (FH / FR) * 1.3), -Math.min(1.6, (Math.abs(FV) / FR) * 1.3), 0],
              ]}
              color="#a855f7"
              lineWidth={1.8}
              dashed
              depthTest={false}
              renderOrder={950}
            />
            <Billboard
              position={[
                Math.min(1.6, (FH / FR) * 1.3) + 0.12,
                -Math.min(1.6, (Math.abs(FV) / FR) * 1.3) / 2,
                0,
              ]}
              renderOrder={1000}
            >
              <Text
                fontSize={0.14}
                color="#ef4444"
                anchorX="left"
                fontWeight="bold"
                depthTest={false}
                material-depthTest={false}
                renderOrder={1000}
                outlineWidth={0.016}
                outlineColor="#020617"
              >
                F_R = {(FR / 1000).toFixed(2)} kN
              </Text>
            </Billboard>
          </group>
        )}
      </group>
    </Canvas>
  )
}

