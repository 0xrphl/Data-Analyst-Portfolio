import React, { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Linkedinlogo, emaillogo, recomendation } from "../assets";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import { testimonials } from "../constants";
import { useLanguage } from '../context/LanguageContext';

const FeedbackCard = ({
  index,
  testimonial,
  name,
  designation,
  company,
  image,
  url,
  doc,
  email,
}) => (
  <motion.div
    variants={fadeIn("", "spring", index * 0.5, 0.75)}
    className='feedback-card p-5 sm:p-10 rounded-3xl w-full xs:w-[320px]'
  >
    {/* Card noise overlay */}
    <svg
      viewBox="0 0 100% 100%"
      xmlns="http://www.w3.org/2000/svg"
      className="fb-card-noise"
      preserveAspectRatio="xMidYMid meet"
    >
      <filter id={`cardNoise-${index}`}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="6"
          stitchTiles="stitch"
        />
      </filter>
      <rect
        width="100%"
        height="100%"
        filter={`url(#cardNoise-${index})`}
      />
    </svg>

    {/* Card orbs background */}
    <div className="fb-card-orbs">
      <span className="fb-card-orb"></span>
      <span className="fb-card-orb"></span>
      <span className="fb-card-orb"></span>
      <span className="fb-card-orb"></span>
    </div>

    {/* Corner buttons - absolute positioned */}
    <div className='absolute top-4 right-4 flex gap-2 z-10'>
      {url && (
        <button
          className='bg-tertiary p-1.5 sm:p-2 rounded-xl outline-none text-white font-bold flex items-center opacity-85 hover:opacity-100 transition-opacity'
          onClick={() => window.open(url, "_blank")}
        >
          <img
            src={Linkedinlogo}
            alt="LinkedIn"
            className="w-6 h-6 sm:w-7 sm:h-7"
          />
        </button>
      )}
      {email && (
        <button
          className='bg-tertiary p-1.5 sm:p-2 rounded-xl outline-none text-white font-bold flex items-center opacity-85 hover:opacity-100 transition-opacity'
          onClick={() => {
            window.open(`mailto:${email}`, "_blank");
          }}
        >
          <img
            src={emaillogo}
            alt="Email"
            className="w-6 h-6 sm:w-7 sm:h-7"
          />
        </button>
      )}
      {doc && (
        <button
          className='bg-tertiary p-1.5 sm:p-2 rounded-xl outline-none text-white font-bold flex items-center opacity-85 hover:opacity-100 transition-opacity'
          onClick={() => {
            window.open(doc, "_blank");
          }}
        >
          <img
            src={recomendation}
            alt="View Document"
            className="w-6 h-6 sm:w-7 sm:h-7"
          />
        </button>
      )}
    </div>

    {/* Card content */}
    <div className="fb-card-content">
      <div className='flex items-center'>
        <p className='text-white font-black text-[36px] sm:text-[48px] mb-0 leading-none'>"</p>
      </div>
      <div className='mt-1'>
        <p className='text-white tracking-wider text-[16px] sm:text-[18px]'>{testimonial}</p>
        <div className='mt-7 flex justify-between items-center gap-1'>
          <div className='flex-1 flex flex-col'>
            <p className='text-white font-medium text-[16px]'>
              <span className='blue-text-gradient'>@</span> {name}
            </p>
            <p className='mt-1 text-secondary text-[12px]'>
              {designation} of {company}
            </p>
          </div>

          <img
            src={image}
            alt={`feedback_by-${name}`}
            className='w-10 h-10 rounded-full object-cover'
          />
        </div>
      </div>
    </div>
  </motion.div>
);

// Helper: detect touch-only / mobile device (matches CSS media query)
const getIsMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches
    || window.matchMedia('(max-width: 768px)').matches;
};

const Feedbacks = () => {
  const { currentLanguage, t } = useLanguage();
  const interBubbleRef = useRef(null);
  const animationRef = useRef(null);
  const cursorRef = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 });
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = React.useState(getIsMobileDevice);

  // Keep isMobile in sync on resize / orientation change
  useEffect(() => {
    const mql = window.matchMedia('(hover: none) and (pointer: coarse), (max-width: 768px)');
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const move = useCallback(() => {
    const { curX, curY, tgX, tgY } = cursorRef.current;
    cursorRef.current.curX += (tgX - curX) / 20;
    cursorRef.current.curY += (tgY - curY) / 20;

    if (interBubbleRef.current) {
      interBubbleRef.current.style.transform = `translate(${Math.round(cursorRef.current.curX)}px, ${Math.round(cursorRef.current.curY)}px)`;
    }

    animationRef.current = requestAnimationFrame(move);
  }, []);

  // Only run the rAF mouse-tracking loop on desktop (no mouse on mobile)
  useEffect(() => {
    if (isMobile) return; // skip entirely on touch devices

    const handleMouseMove = (event) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        cursorRef.current.tgX = event.clientX - rect.left;
        cursorRef.current.tgY = event.clientY - rect.top;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationRef.current = requestAnimationFrame(move);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [move, isMobile]);

  return (
    <div
      ref={containerRef}
      className="mt-12 feedback-gradient-bg rounded-[20px]"
    >
      {/* SVG Filters */}
      <svg xmlns="http://www.w3.org/2000/svg" className="fb-svg-blur">
        <defs>
          <filter id="fbGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
          <filter id="fbCardGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -10" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Noise background texture */}
      <svg
        viewBox="0 0 100vw 100vw"
        xmlns="http://www.w3.org/2000/svg"
        className="fb-noise-bg"
        preserveAspectRatio="xMidYMid meet"
      >
        <filter id="fbNoiseFilterBg">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.6"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#fbNoiseFilterBg)"
        />
      </svg>

      {/* Animated gradient blobs */}
      <div className="fb-gradients-container">
        <div className="fb-g1"></div>
        <div className="fb-g2"></div>
        <div className="fb-g3"></div>
        <div className="fb-g4"></div>
        <div className="fb-g5"></div>
        <div className="fb-interactive" ref={interBubbleRef}></div>
      </div>

      {/* Content layer */}
      <div className="fb-content">
        {/* Header section */}
        <div className={`feedback-header rounded-2xl ${styles.padding} min-h-[300px]`}>
          <motion.div variants={textVariant()}>
            <p className={styles.sectionSubText}>{t('whatOthersSay')}</p>
            <h2 className={styles.sectionHeadText}>{t('testimonials')}</h2>
          </motion.div>
        </div>

        {/* Testimonial cards */}
        <div className={`feedback-cards-area -mt-20 pb-14 ${styles.paddingX} flex flex-wrap gap-7`}>
          {testimonials[currentLanguage].map((testimonial, index) => (
            <FeedbackCard
              key={testimonial.name}
              index={index}
              {...testimonial}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionWrapper(Feedbacks, "");
