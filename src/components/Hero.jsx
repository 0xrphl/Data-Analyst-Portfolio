import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { ComputersCanvas, StarsCanvas } from "./canvas";
import { useLanguage } from '../context/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  useEffect(() => {
    // Trigger animation or any other actions after the component has mounted
  }, []);

  return (
    <section className={`relative w-full h-screen mx-auto`}>
      <StarsCanvas />
      <div
        className={`absolute inset-0 top-[120px]  max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
      >
        <div className='flex flex-col justify-center items-center mt-5'>
          <div className='w-4 h-4 rounded-full bg-[#50368a]' />
          <div className='w-1 sm:h-80 h-40 violet-gradient' />
        </div>
        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>
            {t('greeting')} <span className='text-[#5e41a3]'>Raphael</span>
          </h1>
          <p className={`${styles.heroSubText} mt-0 text-white-100`}>
            {t('heroDescription')}
          </p>
        </div>
      </div>
      <ComputersCanvas />
      <div className='absolute xs:bottom-16 bottom-14 w-full flex justify-center items-center'>
        <a href='#about'>
          <div className='w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2'>
            <motion.div
              animate={{
                y: [0, 24, 0],
              }}
              transition={{
                duration: 0.2, // Adjusted duration
                repeat: 3, // Adjusted repeat count
              }}
              className='w-3 h-3 rounded-full bg-secondary mb-1'
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
