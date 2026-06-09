import React, { forwardRef, useEffect, useState } from "react";
import { Decal } from "@react-three/drei";

const IcosahedronComponent = forwardRef(({ decal, position, categoryColor, onPointerOver, onPointerOut }, ref) => {
  const [args, setArgs] = useState([1, 1, 1]);

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = window.innerWidth;
      if (maxWidth <= 550) {
        setArgs([1.2, 1.2, 1.2]);
      } else {
        setArgs([1, 1, 1]);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use category color or default
  const meshColor = categoryColor || "#2A353C";

  // Reduce geometry segments for mobile
  const isMobile = window.innerWidth <= 768;
  const detail = isMobile ? 1 : 2;

  return (
    <mesh position={position} ref={ref} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <icosahedronGeometry args={[args[0], detail]} />
      <meshStandardMaterial 
        color={meshColor} 
        flatShading 
        metalness={0.2}
        roughness={0.7}
      />
      <Decal 
        position={[0, 0, args[0] * 0.8]}
        rotation={[2 * Math.PI, 0, 6.25]}
        scale={args[0] * 1.1}
        map={decal}
        flatShading
      />
    </mesh>
  );
});

export default IcosahedronComponent;
