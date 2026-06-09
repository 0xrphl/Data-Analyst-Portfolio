import React, { useEffect, useState } from "react";
import { Tilt } from "react-tilt";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { github } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import { useLanguage } from '../context/LanguageContext';

const ProjectCard = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
  className,
}) => {
  return (
    <motion.div 
      variants={fadeIn("up", "spring", index * 0.5, 0.75)}
      className="w-full min-w-[250px] sm:w-[340px] lg:w-[320px] xl:w-[300px]"
    >
      <Tilt
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className={`bg-tertiary p-3 sm:p-5 rounded-2xl h-full ${className || ''}`}
      >
        <div className='relative w-full h-[200px] sm:h-[230px]'>
          <img
            src={image}
            alt='project_image'
            className='w-full h-full object-cover rounded-2xl'
          />

          <div className='absolute inset-0 flex justify-end m-3 card-img_hover'>
            <div
              onClick={() => window.open(source_code_link, "_blank")}
              className='black-gradient w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center cursor-pointer'
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
      </Tilt>
    </motion.div>
  );
};

const Works = () => {
  const { currentLanguage, t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Add a listener for changes to screen size
    const mediaQuery = window.matchMedia("(max-width: 390px)");
    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <div className="relative w-full mx-auto">
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
            {...project} 
          />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Works, "projects");
