import React from "react";
import {Tilt} from "react-tilt";
import { motion } from "framer-motion";
import { useLanguage } from '../context/LanguageContext';

import { styles } from "../styles";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const ServiceCard = ({ index, title, icon }) => (
  <Tilt className='xs:w-[250px] w-full'>
    <motion.div
      variants={fadeIn("right", "spring", index * 0.5, 0.75)}
      className='w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card'
    >
      <div
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className='feedback-card rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col'
      >
        {/* Noise overlay */}
        <svg
          viewBox="0 0 100% 100%"
          xmlns="http://www.w3.org/2000/svg"
          className="fb-card-noise"
          preserveAspectRatio="xMidYMid meet"
        >
          <filter id={`aboutCardNoise-${index}`}>
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
            filter={`url(#aboutCardNoise-${index})`}
          />
        </svg>

        {/* Animated orbs */}
        <div className="fb-card-orbs">
          <span className="fb-card-orb"></span>
          <span className="fb-card-orb"></span>
          <span className="fb-card-orb"></span>
          <span className="fb-card-orb"></span>
        </div>

        {/* Card content */}
        <div className="fb-card-content flex justify-evenly items-center flex-col min-h-[240px]">
          {icon && (
            <img
              src={icon}
              alt={title || 'service-icon'}
              className='w-16 h-16 object-contain'
            />
          )}

          <h3 className='text-white text-[20px] font-bold text-center'>
            {title || ''}
          </h3>
        </div>
      </div>
    </motion.div>
  </Tilt>
);

const About = () => {
  const { currentLanguage, t } = useLanguage();
  
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>{t('introduction')}</p>
        <h2 className={styles.sectionHeadText}>{t('overview')}</h2>
      </motion.div>
      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className='mt-4 text-secondary text-[17px] max-w-5xl leading-[30px]'
      >
        {t('aboutDescription')}
      </motion.p>
      <div className='mt-20 flex flex-wrap gap-10'>
        {services[currentLanguage]?.map((service, index) => (
          <ServiceCard 
            key={`service-${index}`}
            index={index} 
            {...service} 
          />
        )) || []}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");