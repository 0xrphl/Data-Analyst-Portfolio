import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/* ═══════════════════════════════════════════════════════
   Big Fluffy Black Cat — sitting near the front porch
   ═══════════════════════════════════════════════════════ */
export const BigBlackCat = () => {
  const tailRef = useRef();
  const earLRef = useRef();
  const earRRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 1.2) * 0.4;
      tailRef.current.rotation.x = Math.sin(t * 0.8) * 0.1;
    }
    if (earLRef.current) earLRef.current.rotation.z = -0.3 + Math.sin(t * 3 + 1) * 0.05;
    if (earRRef.current) earRRef.current.rotation.z = 0.3 + Math.sin(t * 3.5) * 0.05;
  });

  return (
    <group position={[-0.8, 0, 1.9]} rotation={[0, 0.3, 0]}>
      {/* Body — big and fluffy */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
      </mesh>
      {/* Fluffy chest */}
      <mesh position={[0, 0.25, 0.12]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color="#222" roughness={1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.48, 0.1]} castShadow>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Ears */}
      <mesh ref={earLRef} position={[-0.08, 0.62, 0.1]}>
        <coneGeometry args={[0.05, 0.1, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh ref={earRRef} position={[0.08, 0.62, 0.1]}>
        <coneGeometry args={[0.05, 0.1, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Inner ears */}
      <mesh position={[-0.08, 0.61, 0.12]}>
        <coneGeometry args={[0.025, 0.06, 4]} />
        <meshStandardMaterial color="#3a2a2a" roughness={0.8} />
      </mesh>
      <mesh position={[0.08, 0.61, 0.12]}>
        <coneGeometry args={[0.025, 0.06, 4]} />
        <meshStandardMaterial color="#3a2a2a" roughness={0.8} />
      </mesh>
      {/* Eyes — glowing green */}
      <mesh position={[-0.05, 0.5, 0.24]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#00ff66" emissive="#00ff44" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.05, 0.5, 0.24]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#00ff66" emissive="#00ff44" emissiveIntensity={0.8} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.46, 0.26]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#ff8899" roughness={0.5} />
      </mesh>
      {/* Tail — short curved tail flush against back of body */}
      <group ref={tailRef} position={[0, 0.22, -0.28]} rotation={[-1.2, 0, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.035, 0.22, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
        </mesh>
      </group>
      {/* Front paws */}
      <mesh position={[-0.1, 0.03, 0.18]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.03, 0.18]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </group>
  );
};

/* ═══════════════════════════════════════════════════════
   Calico Cat — small & slim, playing in the woods
   ═══════════════════════════════════════════════════════ */
export const CalicoCat = () => {
  const groupRef = useRef();
  const tailRef = useRef();
  const pawRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Bouncy playful movement
    if (groupRef.current) {
      groupRef.current.position.y = Math.abs(Math.sin(t * 2.5)) * 0.08;
      groupRef.current.rotation.y = 1.5 + Math.sin(t * 0.6) * 0.3;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 3) * 0.5;
      tailRef.current.rotation.x = Math.cos(t * 2) * 0.2;
    }
    if (pawRef.current) {
      pawRef.current.position.y = 0.18 + Math.abs(Math.sin(t * 4)) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[-3.8, 0, -2]}>
      {/* Slim body — white base */}
      <mesh position={[0, 0.15, 0]} castShadow scale={[0.7, 0.6, 1.1]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      {/* Orange patch on back */}
      <mesh position={[0.04, 0.19, -0.02]} scale={[0.5, 0.4, 0.6]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color="#d4742a" roughness={0.9} />
      </mesh>
      {/* Black patch on side */}
      <mesh position={[-0.05, 0.17, 0.04]} scale={[0.4, 0.35, 0.5]}>
        <sphereGeometry args={[0.11, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Head — small */}
      <mesh position={[0, 0.26, 0.12]} castShadow>
        <sphereGeometry args={[0.085, 10, 8]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.85} />
      </mesh>
      {/* Orange ear patch */}
      <mesh position={[0.04, 0.34, 0.12]}>
        <coneGeometry args={[0.03, 0.06, 4]} />
        <meshStandardMaterial color="#d4742a" roughness={0.9} />
      </mesh>
      {/* Black ear */}
      <mesh position={[-0.04, 0.34, 0.12]}>
        <coneGeometry args={[0.03, 0.06, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Eyes — bright green */}
      <mesh position={[-0.025, 0.28, 0.19]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="#44cc44" emissive="#33bb33" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.025, 0.28, 0.19]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="#44cc44" emissive="#33bb33" emissiveIntensity={0.6} />
      </mesh>
      {/* Pink nose */}
      <mesh position={[0, 0.255, 0.2]}>
        <sphereGeometry args={[0.008, 4, 4]} />
        <meshStandardMaterial color="#ffaaaa" roughness={0.5} />
      </mesh>
      {/* Raised paw — playing */}
      <mesh ref={pawRef} position={[0.04, 0.18, 0.12]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      {/* Other paws */}
      <mesh position={[-0.04, 0.02, 0.08]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      <mesh position={[-0.04, 0.02, -0.08]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0.04, 0.02, -0.08]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#d4742a" roughness={0.9} />
      </mesh>
      {/* Tail — calico, raised & animated */}
      <group ref={tailRef} position={[0, 0.18, -0.14]} rotation={[-0.8, 0, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <capsuleGeometry args={[0.018, 0.16, 4, 8]} />
          <meshStandardMaterial color="#d4742a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

/* ═══════════════════════════════════════════════════════
   Female Galgo (Greyhound) — gold color, black nose,
   playing with the calico cat in the woods
   ═══════════════════════════════════════════════════════ */
export const GalgoDog = () => {
  const groupRef = useRef();
  const tailRef = useRef();
  const headRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Play-bow bouncing
    if (groupRef.current) {
      groupRef.current.position.y = Math.abs(Math.sin(t * 2.5 + 1)) * 0.06;
      groupRef.current.rotation.y = -1.8 + Math.sin(t * 0.6 + 0.5) * 0.25;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 5) * 0.4;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 2) * 0.1 - 0.15; // head bobbing, looking down at cat
    }
  });

  return (
    <group ref={groupRef} position={[-4.3, 0, -1.5]}>
      {/* Slim elegant body — gold */}
      <mesh position={[0, 0.32, 0]} castShadow scale={[0.55, 0.5, 1.2]}>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial color="#c9a240" roughness={0.8} />
      </mesh>
      {/* Deep chest — galgo signature */}
      <mesh position={[0, 0.3, 0.1]} scale={[0.5, 0.6, 0.6]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#d4aa48" roughness={0.85} />
      </mesh>
      {/* Narrow waist */}
      <mesh position={[0, 0.28, -0.12]} scale={[0.4, 0.4, 0.5]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#c9a240" roughness={0.85} />
      </mesh>
      {/* Head — elegant, narrow */}
      <group ref={headRef} position={[0, 0.45, 0.22]}>
        <mesh scale={[0.7, 0.8, 1]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial color="#c9a240" roughness={0.8} />
        </mesh>
        {/* Long snout */}
        <mesh position={[0, -0.02, 0.1]} scale={[0.6, 0.5, 1.2]}>
          <boxGeometry args={[0.07, 0.06, 0.1]} />
          <meshStandardMaterial color="#d4aa48" roughness={0.8} />
        </mesh>
        {/* Black nose */}
        <mesh position={[0, -0.01, 0.17]}>
          <sphereGeometry args={[0.02, 8, 6]} />
          <meshStandardMaterial color="#111" roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Eyes — warm brown */}
        <mesh position={[-0.035, 0.02, 0.08]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#4a2810" roughness={0.3} />
        </mesh>
        <mesh position={[0.035, 0.02, 0.08]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#4a2810" roughness={0.3} />
        </mesh>
        {/* Tall thin ears — rose/folded back */}
        <mesh position={[-0.05, 0.08, -0.02]} rotation={[0.3, 0, -0.3]}>
          <coneGeometry args={[0.025, 0.08, 4]} />
          <meshStandardMaterial color="#b8922e" roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.08, -0.02]} rotation={[0.3, 0, 0.3]}>
          <coneGeometry args={[0.025, 0.08, 4]} />
          <meshStandardMaterial color="#b8922e" roughness={0.9} />
        </mesh>
      </group>
      {/* Long slim legs — front */}
      <mesh position={[-0.06, 0.14, 0.12]}>
        <capsuleGeometry args={[0.02, 0.2, 4, 8]} />
        <meshStandardMaterial color="#c9a240" roughness={0.85} />
      </mesh>
      <mesh position={[0.06, 0.14, 0.12]}>
        <capsuleGeometry args={[0.02, 0.2, 4, 8]} />
        <meshStandardMaterial color="#c9a240" roughness={0.85} />
      </mesh>
      {/* Long slim legs — back */}
      <mesh position={[-0.06, 0.14, -0.14]}>
        <capsuleGeometry args={[0.02, 0.2, 4, 8]} />
        <meshStandardMaterial color="#c9a240" roughness={0.85} />
      </mesh>
      <mesh position={[0.06, 0.14, -0.14]}>
        <capsuleGeometry args={[0.02, 0.2, 4, 8]} />
        <meshStandardMaterial color="#c9a240" roughness={0.85} />
      </mesh>
      {/* Paws */}
      {[[-0.06, 0.12], [0.06, 0.12], [-0.06, -0.14], [0.06, -0.14]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#d4aa48" roughness={0.9} />
        </mesh>
      ))}
      {/* Thin whip tail — galgo signature */}
      <group ref={tailRef} position={[0, 0.3, -0.22]} rotation={[-0.6, 0, 0]}>
        <mesh position={[0, 0.14, 0]}>
          <capsuleGeometry args={[0.015, 0.24, 4, 8]} />
          <meshStandardMaterial color="#c9a240" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
};

/* ═══════════════════════════════════════════════════════
   Small Fat Black Cat — lounging near the miners
   ═══════════════════════════════════════════════════════ */
export const SmallFatCat = () => {
  const bodyRef = useRef();
  const tailRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 1.5) * 0.03;
      bodyRef.current.scale.x = 1 + Math.sin(t * 1.5) * 0.02;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 0.7) * 0.3;
    }
  });

  return (
    <group position={[3.8, 0, 0]} rotation={[0, -1.2, 0]}>
      {/* Fat round body — lying down */}
      <mesh ref={bodyRef} position={[0, 0.13, 0]} castShadow>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#111" roughness={0.95} />
      </mesh>
      {/* Even fatter belly */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
      {/* Head — small compared to body */}
      <mesh position={[0, 0.2, 0.15]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* Tiny ears */}
      <mesh position={[-0.05, 0.3, 0.15]}>
        <coneGeometry args={[0.03, 0.06, 4]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh position={[0.05, 0.3, 0.15]}>
        <coneGeometry args={[0.03, 0.06, 4]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* Eyes — amber/yellow */}
      <mesh position={[-0.03, 0.22, 0.24]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.03, 0.22, 0.24]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.6} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.19, 0.25]}>
        <sphereGeometry args={[0.01, 4, 4]} />
        <meshStandardMaterial color="#ff8899" roughness={0.5} />
      </mesh>
      {/* Tail — resting flush behind body */}
      <group ref={tailRef} position={[0, 0.13, -0.16]} rotation={[-1.0, 0, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <capsuleGeometry args={[0.022, 0.14, 4, 8]} />
          <meshStandardMaterial color="#111" roughness={0.95} />
        </mesh>
      </group>
      {/* Tucked paws */}
      <mesh position={[-0.08, 0.03, 0.1]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh position={[0.08, 0.03, 0.1]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
    </group>
  );
};

/* ═══════════════════════════════════════════════════════
   Fat Golden Retriever — lying on the grass
   ═══════════════════════════════════════════════════════ */
export const GoldenRetriever = () => {
  const bodyRef = useRef();
  const tailRef = useRef();
  const tongueRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 1.2) * 0.04;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 4) * 0.35;
    }
    if (tongueRef.current) {
      tongueRef.current.scale.y = 1 + Math.sin(t * 3) * 0.15;
    }
  });

  return (
    <group position={[-2.5, 0, 2.2]} rotation={[0, 0.8, 0]}>
      {/* Fat body — rounded */}
      <mesh ref={bodyRef} position={[0, 0.22, 0]} castShadow scale={[1, 0.7, 1.3]}>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color="#c8952e" roughness={0.85} />
      </mesh>
      {/* Round belly */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.28, 10, 8]} />
        <meshStandardMaterial color="#d4a23a" roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.35, 0.35]} castShadow>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color="#c8952e" roughness={0.8} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.32, 0.5]}>
        <boxGeometry args={[0.12, 0.1, 0.12]} />
        <meshStandardMaterial color="#d4a23a" roughness={0.85} />
      </mesh>
      {/* Nose — black */}
      <mesh position={[0, 0.34, 0.57]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Tongue — pink, hanging out */}
      <mesh ref={tongueRef} position={[0, 0.27, 0.54]}>
        <boxGeometry args={[0.06, 0.08, 0.04]} />
        <meshStandardMaterial color="#ff7788" roughness={0.6} />
      </mesh>
      {/* Eyes — big brown */}
      <mesh position={[-0.06, 0.38, 0.48]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#3a2010" roughness={0.3} />
      </mesh>
      <mesh position={[0.06, 0.38, 0.48]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#3a2010" roughness={0.3} />
      </mesh>
      {/* Eye highlights */}
      <mesh position={[-0.055, 0.39, 0.5]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.065, 0.39, 0.5]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
      </mesh>
      {/* Floppy ears */}
      <mesh position={[-0.16, 0.32, 0.3]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.18, 0.1]} />
        <meshStandardMaterial color="#b0811e" roughness={0.9} />
      </mesh>
      <mesh position={[0.16, 0.32, 0.3]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.08, 0.18, 0.1]} />
        <meshStandardMaterial color="#b0811e" roughness={0.9} />
      </mesh>
      {/* Tail — flush behind body, wagging */}
      <group ref={tailRef} position={[0, 0.2, -0.3]} rotation={[-1.0, 0, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <capsuleGeometry args={[0.04, 0.18, 4, 8]} />
          <meshStandardMaterial color="#d4a23a" roughness={0.9} />
        </mesh>
      </group>
      {/* Front paws — stretched out */}
      <mesh position={[-0.12, 0.04, 0.3]}>
        <boxGeometry args={[0.08, 0.06, 0.15]} />
        <meshStandardMaterial color="#c8952e" roughness={0.9} />
      </mesh>
      <mesh position={[0.12, 0.04, 0.3]}>
        <boxGeometry args={[0.08, 0.06, 0.15]} />
        <meshStandardMaterial color="#c8952e" roughness={0.9} />
      </mesh>
      {/* Back paws */}
      <mesh position={[-0.15, 0.04, -0.2]}>
        <boxGeometry args={[0.1, 0.06, 0.12]} />
        <meshStandardMaterial color="#c8952e" roughness={0.9} />
      </mesh>
      <mesh position={[0.15, 0.04, -0.2]}>
        <boxGeometry args={[0.1, 0.06, 0.12]} />
        <meshStandardMaterial color="#c8952e" roughness={0.9} />
      </mesh>
    </group>
  );
};
