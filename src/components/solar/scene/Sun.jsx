import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";

const SunRayParticle = ({ start, end, speed, delay }) => {
  const ref = useRef();
  const mid = [(start[0]+end[0])/2, (start[1]+end[1])/2 + 0.8, (start[2]+end[2])/2];
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start), new THREE.Vector3(...mid), new THREE.Vector3(...end)
  ), [start, mid, end]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.copy(curve.getPoint((clock.getElapsedTime() * speed + delay) % 1));
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2.5} transparent opacity={0.8} />
    </mesh>
  );
};

const Sun = ({ solarPct }) => {
  const meshRef = useRef();
  const haloRef = useRef();
  const sunPos = [5, 5.5, -4];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) meshRef.current.scale.setScalar(0.5 + solarPct * 0.4);
    if (haloRef.current) {
      haloRef.current.scale.setScalar((0.8 + solarPct * 0.5) * (1 + Math.sin(t * 1.5) * 0.06));
      haloRef.current.material.opacity = 0.1 + solarPct * 0.2;
    }
  });

  const color = useMemo(() => new THREE.Color("#666").lerp(new THREE.Color("#FFD700"), solarPct), [solarPct]);
  const rayTargets = [[-1, 1.7, 0.5], [0, 1.7, 0.5], [1, 1.7, 0.5]];

  return (
    <group>
      <group position={sunPos}>
        <mesh ref={haloRef}><sphereGeometry args={[1.2, 24, 24]} /><meshBasicMaterial color="#FFD700" transparent opacity={0.15} /></mesh>
        <mesh ref={meshRef}><sphereGeometry args={[0.5, 24, 24]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} /></mesh>
      </group>
      {solarPct > 0.05 && rayTargets.map((target, i) => (
        <React.Fragment key={i}>
          <QuadraticBezierLine start={sunPos} mid={[(sunPos[0]+target[0])/2, (sunPos[1]+target[1])/2 + 0.8, (sunPos[2]+target[2])/2]} end={target} color="#FFD700" lineWidth={1.2} transparent opacity={solarPct * 0.4} />
          <SunRayParticle start={sunPos} end={target} speed={0.3 + i * 0.05} delay={i * 0.33} />
        </React.Fragment>
      ))}
    </group>
  );
};

export default Sun;
