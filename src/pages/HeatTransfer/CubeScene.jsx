import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

/* ============================================================
   GPU RAYMARCHED VOLUME RENDERER (GLSL 3.00 ES)
   Temperature field -> Data3DTexture -> raymarched in fragment
   shader with jet colormap + power-law contrast stretch.
   ============================================================ */

const vertexShader = /* glsl */`
uniform mat4 uModelInverse;
out vec3 vOrigin;
out vec3 vDirection;

void main() {
  vOrigin = (uModelInverse * vec4(cameraPosition, 1.0)).xyz;
  vDirection = position - vOrigin;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */`
precision highp float;
precision highp sampler3D;

uniform sampler3D uVolume;
uniform float uSteps;
uniform float uGamma;
uniform float uOpacity;
uniform float uThreshold;
uniform float uClipX;
uniform float uContours;
uniform float uBands;
uniform float uMip;        // 1 = maximum intensity projection

in vec3 vOrigin;
in vec3 vDirection;

layout(location = 0) out vec4 fragColor;

vec3 jet(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c;
  if (t < 0.125)       c = mix(vec3(0.0,0.0,0.56), vec3(0.0,0.0,1.0), t/0.125);
  else if (t < 0.375)  c = mix(vec3(0.0,0.0,1.0),  vec3(0.0,1.0,1.0), (t-0.125)/0.25);
  else if (t < 0.5)    c = mix(vec3(0.0,1.0,1.0),  vec3(0.0,1.0,0.0), (t-0.375)/0.125);
  else if (t < 0.625)  c = mix(vec3(0.0,1.0,0.0),  vec3(1.0,1.0,0.0), (t-0.5)/0.125);
  else if (t < 0.8)    c = mix(vec3(1.0,1.0,0.0),  vec3(1.0,0.5,0.0), (t-0.625)/0.175);
  else if (t < 0.92)   c = mix(vec3(1.0,0.5,0.0),  vec3(1.0,0.0,0.0), (t-0.8)/0.12);
  else                 c = mix(vec3(1.0,0.0,0.0),  vec3(1.0,1.0,1.0), (t-0.92)/0.08);
  return c;
}

vec2 hitBox(vec3 orig, vec3 dir) {
  vec3 box_min = vec3(-0.5);
  vec3 box_max = vec3(0.5);
  vec3 inv_dir = 1.0 / dir;
  vec3 tmin_tmp = (box_min - orig) * inv_dir;
  vec3 tmax_tmp = (box_max - orig) * inv_dir;
  vec3 tmn = min(tmin_tmp, tmax_tmp);
  vec3 tmx = max(tmin_tmp, tmax_tmp);
  float t0 = max(tmn.x, max(tmn.y, tmn.z));
  float t1 = min(tmx.x, min(tmx.y, tmx.z));
  return vec2(t0, t1);
}

void main() {
  vec3 rayDir = normalize(vDirection);
  vec2 bounds = hitBox(vOrigin, rayDir);
  if (bounds.x > bounds.y) discard;
  bounds.x = max(bounds.x, 0.0);

  float dt = (bounds.y - bounds.x) / uSteps;
  vec3 rayStep = rayDir * dt;
  vec3 p = vOrigin + bounds.x * rayDir;

  vec4 accum = vec4(0.0);
  float maxHeat = 0.0;

  for (int i = 0; i < 400; i++) {
    if (float(i) >= uSteps) break;

    if (p.x <= uClipX) {
      vec3 uvw = p + vec3(0.5);
      float raw = texture(uVolume, uvw).r;
      float heat = pow(clamp(raw, 0.0, 1.0), uGamma);

      if (uContours > 0.5) {
        heat = floor(heat * uBands) / uBands;
      }

      if (uMip > 0.5) {
        // Maximum Intensity Projection: keep the hottest sample along the ray
        maxHeat = max(maxHeat, heat);
      } else if (heat > uThreshold) {
        vec3 col = jet(heat);
        // Steep alpha curve (heat^3) so cold shells stay transparent
        // and rays reach the hot core before saturating.
        float a = heat * heat * heat;
        float alpha = clamp(a * uOpacity * 40.0 / uSteps, 0.0, 1.0);
        accum.rgb += (1.0 - accum.a) * col * alpha;
        accum.a += (1.0 - accum.a) * alpha;
        if (accum.a >= 0.98) break;
      }
    }
    p += rayStep;
  }

  if (uMip > 0.5) {
    if (maxHeat <= uThreshold) discard;
    fragColor = vec4(jet(maxHeat), clamp(maxHeat * uOpacity, 0.0, 1.0));
    return;
  }

  if (accum.a < 0.003) discard;
  fragColor = accum;
}
`

function VolumeBox({ field, N, tMin, tMax, gamma, opacity, threshold, clipX, contours, bands, mip }) {
  const meshRef = useRef()
  const matRef = useRef()

  const texture = useMemo(() => {
    const data = new Uint8Array(N * N * N)
    const tex = new THREE.Data3DTexture(data, N, N, N)
    tex.format = THREE.RedFormat
    tex.type = THREE.UnsignedByteType
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.wrapS = tex.wrapT = tex.wrapR = THREE.ClampToEdgeWrapping
    tex.unpackAlignment = 1
    tex.needsUpdate = true
    return tex
  }, [N])

  useEffect(() => {
    if (!field) return
    const data = texture.image.data
    const range = Math.max(1e-6, tMax - tMin)
    const n = Math.min(field.length, data.length)
    for (let i = 0; i < n; i++) {
      const v = (field[i] - tMin) / range
      data[i] = v <= 0 ? 0 : v >= 1 ? 255 : (v * 255) | 0
    }
    texture.needsUpdate = true
  }, [field, tMin, tMax, texture])

  const uniforms = useMemo(() => ({
    uVolume: { value: texture },
    uSteps: { value: 200 },
    uGamma: { value: gamma },
    uOpacity: { value: opacity },
    uThreshold: { value: threshold },
    uClipX: { value: clipX },
    uContours: { value: contours ? 1 : 0 },
    uBands: { value: bands },
    uMip: { value: mip ? 1 : 0 },
    uModelInverse: { value: new THREE.Matrix4() },
  }), [texture])

  useEffect(() => {
    if (!matRef.current) return
    const u = matRef.current.uniforms
    u.uGamma.value = gamma
    u.uOpacity.value = opacity
    u.uThreshold.value = threshold
    u.uClipX.value = clipX
    u.uContours.value = contours ? 1 : 0
    u.uBands.value = bands
    u.uMip.value = mip ? 1 : 0
    u.uVolume.value = texture
  }, [gamma, opacity, threshold, clipX, contours, bands, mip, texture])

  // Keep the inverse model matrix updated for the raymarcher
  useFrame(() => {
    if (meshRef.current && matRef.current) {
      matRef.current.uniforms.uModelInverse.value
        .copy(meshRef.current.matrixWorld).invert()
    }
  })

  return (
    <mesh ref={meshRef} scale={[2, 2, 2]}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        glslVersion={THREE.GLSL3}
      />
    </mesh>
  )
}

function QPoint({ size }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.25)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size * 0.01, 12, 12]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  )
}

export default function CubeScene({
  field, N, tMin, tMax,
  gamma = 0.25, opacity = 1.2, threshold = 0.02,
  clipX = 0.5, contours = false, bands = 12, mip = false,
}) {
  const size = 2
  return (
    <Canvas camera={{ position: [2.6, 1.9, 2.6], fov: 50 }} style={{ background: '#03040d' }}>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(size, size, size)]} />
        <lineBasicMaterial color="#4a5580" />
      </lineSegments>

      {field && (
        <VolumeBox
          field={field} N={N} tMin={tMin} tMax={tMax}
          gamma={gamma} opacity={opacity} threshold={threshold}
          clipX={clipX} contours={contours} bands={bands} mip={mip}
        />
      )}

      <QPoint size={size} />

      <Text position={[size * 0.6, -size * 0.55, -size * 0.55]} fontSize={0.1} color="#6677aa">x</Text>
      <Text position={[-size * 0.55, size * 0.6, -size * 0.55]} fontSize={0.1} color="#6677aa">y</Text>
      <Text position={[-size * 0.55, -size * 0.55, size * 0.6]} fontSize={0.1} color="#6677aa">z</Text>

      <OrbitControls enableDamping dampingFactor={0.08} />
    </Canvas>
  )
}
