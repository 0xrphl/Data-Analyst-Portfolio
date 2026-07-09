import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";

const EnergyFlowParticle = ({ start, mid, end, speed = 0.35, color = "#FFD700", delay = 0 }) => {
  const ref = useRef();
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start), new THREE.Vector3(...mid), new THREE.Vector3(...end)
  ), [start, mid, end]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.copy(curve.getPoint((clock.getElapsedTime() * speed + delay) % 1));
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  );
};

export const WireWithFlow = ({ start, end, active, color }) => {
  const mid = [(start[0]+end[0])/2, Math.max(start[1],end[1])+0.35, (start[2]+end[2])/2];
  return (
    <>
      <QuadraticBezierLine start={start} mid={mid} end={end} color={active ? color : "#444"} lineWidth={1.8} transparent opacity={active ? 0.85 : 0.25} />
      {active && <>
        <EnergyFlowParticle start={start} mid={mid} end={end} color={color} delay={0} />
        <EnergyFlowParticle start={start} mid={mid} end={end} color={color} delay={0.5} />
      </>}
    </>
  );
};

export default WireWithFlow;
