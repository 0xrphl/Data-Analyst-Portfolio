import React, { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { SectionWrapper } from "../hoc";
import { technologies, TECH_CATEGORIES } from "../constants";
import BallCanvas from "./canvas/Ball";
import Tooltip from "./common/Tooltip";
import { styles } from "../styles";
import { useLanguage } from "../context/LanguageContext";

const LoadingFallback = () => (
  <Html center>
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  </Html>
);

const Tech = () => {
  const { t, currentLanguage } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobile1, setIsMobile1] = useState(false);
  const [isMobile2, setIsMobile2] = useState(false);
  const [hoveredTitle, setHoveredTitle] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [touchedTitle, setTouchedTitle] = useState(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const techRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 499px)");
    setIsMobile(mediaQuery.matches);
    const handleMediaQueryChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    const mediaQuery1 = window.matchMedia("(min-width: 500px) and (max-width: 900px)");
    setIsMobile1(mediaQuery1.matches);
    const handleMediaQueryChange1 = (event) => setIsMobile1(event.matches);
    mediaQuery1.addEventListener("change", handleMediaQueryChange1);

    const mediaQuery2 = window.matchMedia("(min-width: 901px) and (max-width: 1300px)");
    setIsMobile2(mediaQuery2.matches);
    const handleMediaQueryChange2 = (event) => setIsMobile2(event.matches);
    mediaQuery2.addEventListener("change", handleMediaQueryChange2);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
      mediaQuery1.removeEventListener("change", handleMediaQueryChange1);
      mediaQuery2.removeEventListener("change", handleMediaQueryChange2);
    };
  }, []);

  // Filter technologies based on active category
  const filteredTechnologies = useMemo(() => {
    if (activeCategory === "All") return technologies;
    return technologies.filter((tech) => tech.category === activeCategory);
  }, [activeCategory]);

  // Dynamic grid calculations based on filtered count and screen size
  const isFiltered = activeCategory !== "All";
  const cols = isFiltered
    ? 4
    : (isMobile ? 4 : isMobile1 ? 5 : isMobile2 ? 8 : 9);
  const rows = Math.ceil(filteredTechnologies.length / cols);

  // Dynamic canvas height - scale generously with the number of rows
  const rowHeight = isMobile ? 100 : isMobile1 ? 110 : (isFiltered ? 160 : 145);
  const canvasHeight = Math.max(rows * rowHeight + 50, 500);

  // Dynamic camera - center on grid, adjust FOV based on grid width and height
  const getCameraConfig = () => {
    const totalItems = filteredTechnologies.length;
    const maxItemsInRow = Math.min(totalItems, cols);

    // When filtered to a category: 4 cols, bigger balls, lower FOV
    if (isFiltered) {
      if (isMobile) {
        if (rows <= 1) return { position: [3, -5, 38], fov: 22 };
        if (rows <= 2) return { position: [3, -5, 38], fov: 28 };
        if (rows <= 3) return { position: [3, -5, 38], fov: 35 };
        return { position: [3, -5, 38], fov: Math.min(28 + rows * 4, 60) };
      }
    if (isMobile1) {
      if (rows <= 1) return { position: [4, 0, 38], fov: Math.max(6 + maxItemsInRow * 1.4, 10) };
      if (rows <= 2) return { position: [4, 0, 38], fov: 16 };
      if (rows <= 3) return { position: [4, 0, 38], fov: 20 };
      return { position: [4, 0, 38], fov: Math.min(18 + rows * 2.1, 41) };
    }
      if (isMobile2) {
        if (rows <= 1) return { position: [3, -5, 21], fov: 14 };
        if (rows <= 2) return { position: [3, -5, 21], fov: 18 };
        if (rows <= 3) return { position: [3, -5, 21], fov: 22 };
        return { position: [3, -5, 21], fov: Math.min(18 + rows * 3, 40) };
      }
      // Desktop filtered
      if (rows <= 1) return { position: [0, 0, 17], fov: 16 };
      if (rows <= 2) return { position: [0, 0, 17], fov: 22 };
      if (rows <= 3) return { position: [0, 0, 17], fov: 28 };
      if (rows <= 5) return { position: [0, 0, 20], fov: 32 };
      return { position: [0, 0, 20], fov: Math.min(26 + rows * 4, 60) };
    }

    // "All" category - original logic
    if (isMobile) {
      if (rows <= 1) return { position: [4.2, -5, 45], fov: Math.max(12 + maxItemsInRow * 3, 20) };
      if (rows <= 2) return { position: [4.2, -5, 45], fov: 30 };
      if (rows <= 3) return { position: [4.2, -5, 45], fov: 38 };
      return { position: [4.2, -5, 45], fov: Math.min(34 + rows * 4, 75) };
    }
    if (isMobile1) {
      if (rows <= 1) return { position: [4.5, -5, 43 ], fov: Math.max(10 + maxItemsInRow * 2.5, 16) };
      if (rows <= 2) return { position: [4.5, -5, 43], fov: 27 };
      if (rows <= 3) return { position: [4.5, -5, 43], fov: 33 };
      return { position: [4.5, -5, 43], fov: Math.min(29 + rows * 3.5, 65) };
    }
    if (isMobile2) {
      if (rows <= 1) return { position: [4, -3, 34], fov: Math.max(5 + maxItemsInRow * 2, 10) };
      if (rows <= 2) return { position: [4, -3, 34], fov: 18 };
      if (rows <= 3) return { position: [4, -3, 34], fov: 22 };
      return { position: [4, -3, 34], fov: Math.min(18 + rows * 3, 50) };
    }
    // Desktop
    if (rows <= 1) return { position: [2, 0, 17], fov: Math.max(8 + maxItemsInRow * 5, 20) };
    if (rows <= 2) return { position: [2, 0, 17], fov: 32 + Math.max(0, (maxItemsInRow - 5) * 2) };
    if (rows <= 3) return { position: [2, 0, 17], fov: 42 };
    return { position: [2, 0, 17], fov: Math.min(30 + rows * 5, 90) };
  };

  const cameraConfig = getCameraConfig();

  const handleMouseMove = (event) => {
    if (techRef.current) {
      const rect = techRef.current.getBoundingClientRect();
      const relativePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      setMousePosition(relativePosition);
    }
  };

  const handlePointerDown = (title, event) => {
    setTouchedTitle(title);

    if (techRef.current) {
      const rect = techRef.current.getBoundingClientRect();
      const relativePosition = {
        x: (event.touches[0].clientX - rect.left) / rect.width,
        y: (event.touches[0].clientY - rect.top) / rect.height,
      };
      setTouchPosition(relativePosition);
      setShowTooltip(true);

      const tooltipVisibilityDuration = 2000;
      setTimeout(() => {
        setTouchedTitle(null);
        setShowTooltip(false);
      }, tooltipVisibilityDuration);
    }
  };

  const canvasStyle = {
    position: 'relative',
    width: '100vw',
    height: `${canvasHeight}px`,
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
  };

  const getTranslatedTitle = (title) => {
    return t(`techNames.${title}`) || title;
  };

  const categoryKeys = Object.keys(TECH_CATEGORIES);

  return (
    <div ref={techRef} className="flex flex-col items-center w-full" onMouseMove={handleMouseMove}>
      <p className={`${styles.sectionHeadText} text-center`}>
        {t('technologiesWorkedWith')}
      </p>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6 px-4 max-w-5xl">
        {categoryKeys.map((catKey) => {
          const cat = TECH_CATEGORIES[catKey];
          const isActive = activeCategory === catKey;
          const count = catKey === "All" 
            ? technologies.length 
            : technologies.filter(t => t.category === catKey).length;

          // Brighter colors for the pill buttons (not the 3D objects)
          const pillColors = {
            "All": "#2A353C",
            "AI & ML": "#7B2FBE",
            "Data Science": "#2563EB",
            "Databases": "#059669",
            "Web Dev": "#0891B2",
            "Cloud & DevOps": "#EA580C",
            "BI & Spreadsheets": "#10B981",
            "Automation": "#CA8A04",
            "Engineering": "#DC2626",
            "Other": "#6B7280",
          };

          return (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`
                px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium
                transition-all duration-300 ease-in-out cursor-pointer
                border-2 whitespace-nowrap
                ${isActive 
                  ? 'text-white shadow-lg scale-105' 
                  : 'text-gray-300 border-gray-600 hover:border-gray-400 hover:text-white bg-transparent'
                }
              `}
              style={isActive ? { 
                backgroundColor: pillColors[catKey], 
                borderColor: pillColors[catKey],
                boxShadow: `0 0 15px ${pillColors[catKey]}40`
              } : {}}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

    <div style={{ ...canvasStyle, overflow: 'hidden' }} className="relative">
        <Canvas
          key={activeCategory}
          style={{ width: '100%', height: '100%' }}
          frameloop="always"
          dpr={[1, isMobile ? 1.5 : 2]}
          gl={{ 
            powerPreference: "high-performance",
            antialias: !isMobile,
            alpha: true,
            stencil: false,
            depth: true,
            precision: isMobile ? "mediump" : "highp"
          }}
          camera={{
            ...cameraConfig,
            rotation: [0, Math.PI / 30, 0]
          }}
          performance={{ min: 0.5 }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[2, 3, 5]} intensity={0.8} />
          <directionalLight position={[-2, -1, 3]} intensity={0.3} />
          {filteredTechnologies.map((technology, index) => (
            <Suspense 
              key={technology.name} 
              fallback={<LoadingFallback />}
            >
              <BallCanvas
                key={technology.name}
                icon={technology.icon}
                index={index}
                rows={rows}
                cols={cols}
                totalItems={filteredTechnologies.length}
                title={getTranslatedTitle(technology.name)}
                category={technology.category}
                categoryColor={TECH_CATEGORIES[technology.category]?.color || "#2A353C"}
                onPointerOver={() => setHoveredTitle(getTranslatedTitle(technology.name))}
                onPointerOut={() => setHoveredTitle(null)}
                onTouchStart={(title, event) => handlePointerDown(getTranslatedTitle(title), event)}
              />
            </Suspense>
          ))}
        </Canvas>
      </div>
      {showTooltip && touchedTitle && <Tooltip title={touchedTitle} position={touchPosition} />}
      {hoveredTitle && <Tooltip title={hoveredTitle} position={mousePosition} />}
    </div>
  );
};

export default SectionWrapper(Tech, "tech");
