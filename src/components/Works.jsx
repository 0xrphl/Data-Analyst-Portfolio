import React, { useEffect, useState, useCallback } from "react";
import { Tilt } from "react-tilt";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { github, huggingfaceIcon } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import { useLanguage } from '../context/LanguageContext';

// Carousel sub-component for cards with multiple images
const ImageCarousel = ({ images, name }) => {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  // Auto-advance every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 6000);
    return () => clearInterval(timer);
  }, [total]);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
  }, []);

  const prev = useCallback((e) => {
    e.stopPropagation();
    setCurrent((p) => (p - 1 + total) % total);
  }, [total]);

  const next = useCallback((e) => {
    e.stopPropagation();
    setCurrent((p) => (p + 1) % total);
  }, [total]);

  return (
    <div className="carousel-container relative w-full h-full overflow-hidden rounded-2xl">
      {/* Slides */}
      <div
        className="carousel-track flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, i) => (
          <img
            key={`${name}-slide-${i}`}
            src={img}
            alt={`${name} screenshot ${i + 1}`}
            className="carousel-slide w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Left arrow */}
      <button
        onClick={prev}
        className="carousel-arrow carousel-arrow-left"
        aria-label="Previous image"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        className="carousel-arrow carousel-arrow-right"
        aria-label="Next image"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="carousel-dots">
        {images.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={(e) => { e.stopPropagation(); goTo(i); }}
            className={`carousel-dot ${i === current ? 'carousel-dot-active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const ProjectCard = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
  huggingface_link,
  className,
  isMobileDevice,
}) => {
  const isCarousel = Array.isArray(image);

  return (
    <motion.div 
      variants={fadeIn("up", "spring", index * 0.5, 0.75)}
      className="w-full min-w-[250px] sm:w-[340px] lg:w-[320px] xl:w-[300px]"
    >
      <Tilt
        options={{
          max: isMobileDevice ? 0 : 45,
          scale: 1,
          speed: 450,
        }}
        className={`works-card p-3 sm:p-5 rounded-2xl h-full ${className || ''}`}
      >
        {/* Card background with orbs — skip orbs on mobile for performance */}
        <div className="works-card-bg">
          {!isMobileDevice && (
            <div className="works-card-bg-orbs">
              <span className="works-card-bg-orb"></span>
              <span className="works-card-bg-orb"></span>
              <span className="works-card-bg-orb"></span>
              <span className="works-card-bg-orb"></span>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="works-card-content">
          <div className='relative w-full h-[200px] sm:h-[230px]'>
            {isCarousel ? (
              <ImageCarousel images={image} name={name} />
            ) : (
              <img
                src={image}
                alt='project_image'
                className='w-full h-full object-cover rounded-2xl'
              />
            )}

            <div className='absolute inset-0 flex justify-end m-3 card-img_hover gap-2' style={{ pointerEvents: 'none' }}>
              {huggingface_link && (
                <div
                  onClick={() => window.open(huggingface_link, "_blank")}
                  className='w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center cursor-pointer'
                  style={{ pointerEvents: 'auto', background: 'linear-gradient(135deg, #FFD21E 0%, #FFB800 100%)' }}
                >
                  <img
                    src={huggingfaceIcon}
                    alt='huggingface dataset'
                    className='w-3/4 h-3/4 object-contain'
                  />
                </div>
              )}
              <div
                onClick={() => window.open(source_code_link, "_blank")}
                className='black-gradient w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center cursor-pointer'
                style={{ pointerEvents: 'auto' }}
              >
                <img
                  src={github}
                  alt='source code'
                  className='w-1/2 h-1/2 object-contain'
                />
              </div>
            </div>
          </div>

          <div className='mt-3 sm:mt-5'>
            <h3 className='text-white font-bold text-[20px] sm:text-[24px]'>{name}</h3>
            <p className='mt-2 text-secondary text-[12px] sm:text-[14px]'>{description}</p>
          </div>

          <div className='mt-4 flex flex-wrap gap-2'>
            {tags.map((tag) => (
              <p
                key={`${name}-${tag.name}`}
                className={`text-[12px] sm:text-[14px] ${tag.color}`}
              >
                #{tag.name}
              </p>
            ))}
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
};

// Helper: detect touch-only / mobile device (matches CSS media query)
const getIsMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches
    || window.matchMedia('(max-width: 768px)').matches;
};

const Works = () => {
  const { currentLanguage, t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(getIsMobileDevice);

  useEffect(() => {
    // Small-screen layout detection (original)
    const mediaQuery = window.matchMedia("(max-width: 390px)");
    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Mobile/touch device detection for performance
    const mql = window.matchMedia('(hover: none) and (pointer: coarse), (max-width: 768px)');
    setIsMobileDevice(mql.matches);
    const onDeviceChange = (e) => setIsMobileDevice(e.matches);
    mql.addEventListener('change', onDeviceChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
      mql.removeEventListener('change', onDeviceChange);
    };
  }, []);

  return (
    <div className="relative w-full mx-auto">
      {/* Goo Filter Effect for orbs — skip on mobile (extremely heavy SVG filter) */}
      {!isMobileDevice && (
        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
          <defs>
            <filter id="wkGoo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="150" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -10" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
      )}

      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-[14px] sm:text-[18px]`}>
          {t('myWork')}
        </p>
        <h2 className={`${styles.sectionHeadText} text-[30px] sm:text-[50px]`}>
          {t('projects')}
        </h2>
      </motion.div>

      <div className='w-full flex flex-col px-2 sm:px-4'>
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className='mt-3 text-secondary text-[14px] sm:text-[17px] max-w-3xl leading-[24px] sm:leading-[30px]'
        >
          {t('projectsDescription')}
        </motion.p>
      </div>

      <div className={`mt-10 sm:mt-20 flex flex-wrap gap-3 sm:gap-7 justify-center px-2 sm:px-4 max-w-[1800px] mx-auto ${isMobile ? 'scale-90' : ''}`}>
        {projects[currentLanguage].map((project, index) => (
          <ProjectCard 
            key={`project-${index}`} 
            index={index} 
            isMobileDevice={isMobileDevice}
            {...project} 
          />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Works, "projects");
