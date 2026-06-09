import React, { Suspense, useRef, useEffect, useState } from "react";
import { Float, Preload, useTexture } from "@react-three/drei";
import CanvasLoader from "../Loader";
import IcosahedronComponent from "./Icosahedron";

const BallCanvas = ({ icon, index, rows, cols, totalItems, title, category, categoryColor, onPointerOver, onPointerOut, onTouchStart }) => {
  const [decal] = useTexture([icon]);
  const ballRef = useRef();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 550);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Calculate how many items are in this row for proper centering
  const currentRow = Math.floor(index / cols);
  const isLastRow = currentRow === rows - 1;
  const itemsInThisRow = isLastRow ? totalItems - currentRow * cols : cols;
  
  const x = ((index % cols) * 2.3 - (itemsInThisRow * 2.3) / 2 + 2.3 / 2);
  const y = (currentRow * 2.3 - (rows * 2.3) / 2 + 2.3 / 2);

  const floatConfig = {
    speed: isMobile ? 0.8 : 1.6,
    rotationIntensity: isMobile ? 0.1 : 0.5,
    floatIntensity: isMobile ? 0.6 : 1
  };

  const handleTouchStart = (event) => {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    if (isTouchWithinArea(touchX, touchY)) {
      onTouchStart(title, event);
    }
  };

  return (
    <>
      <Suspense fallback={<CanvasLoader />}>
        <Float {...floatConfig}>
          <IcosahedronComponent
            ref={ballRef}
            decal={decal}
            position={[x, -y, 0]}
            categoryColor={categoryColor}
            onPointerOver={() => onPointerOver({ title, position: { x: 1 + x, y: -y } })}
            onPointerOut={onPointerOut}
            onTouchStart={handleTouchStart}
            isMobile={isMobile}
          />
        </Float>
      </Suspense>
      <Preload all />
    </>
  );
};

export default BallCanvas;
