import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";
import { Linkedinlogo } from "../assets";
import { X } from "../assets";
import { github } from "../assets";
import { useLanguage } from '../context/LanguageContext';

const cardStyle = {
  background: 'rgba(0, 0, 0, 0.25)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '1rem',
  overflow: 'hidden',
};

const inputStyle = {
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const btnStyle = {
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const iconBtnStyle = {
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const Contact = () => {
  const { t } = useLanguage();
  const formRef = useRef();
  const cardRef = useRef();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // Pointer-tracking gradient effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handlePointerMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = e.clientX - left - width / 2;
      const y = e.clientY - top - height / 2;
      card.style.setProperty('--posX', x);
      card.style.setProperty('--posY', y);
    };

    card.addEventListener('pointermove', handlePointerMove);
    return () => card.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const fullMessage = `${form.message}\n\nEmail: ${form.email}`;

    emailjs
      .send(
        'service_pxnvv1y',
        'template_p7khd1j',
        {
          from_name: form.name,
          to_name: "Raphael Sanchez",
          from_email: form.email,
          to_email: "0xrphl@gmail.com",
          message: fullMessage,
        },
        'C-lqF5So-fON-s2VF'
      )
      .then(
        () => {
          setLoading(false);
          alert(t('thankYou'));

          setForm({
            name: "",
            email: "",
            message: "",
          });
        },
        (error) => {
          setLoading(false);
          console.error(error);

          alert(t('errorMessage'));
        }
      );
  };

  return (
    <div className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}>
      <motion.div
        ref={cardRef}
        variants={slideIn("left", "tween", 0.2, 1)}
        className='flex-[0.75] glass-card p-8 relative shadow-lg'
        style={cardStyle}
      >
       <div className='flex gap-2' style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
          <button
            className='py-2 px-2 rounded-xl outline-none text-white font-bold flex items-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(120,86,255,0.15)]'
            style={iconBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(120, 86, 255, 0.25)'; e.currentTarget.style.borderColor = 'rgba(120, 86, 255, 0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = iconBtnStyle.background; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            onClick={() => {
              window.open("https://www.linkedin.com/in/0xraphael/", "_blank");
            }}
          >
            <img
              src={Linkedinlogo}
              alt="Linkedin"
              style={{ width: '30px', height: '30px', marginRight: '0px' }}
            />
          </button>
          <button
            className='py-2 px-2 rounded-xl outline-none text-white font-bold flex items-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(120,86,255,0.15)]'
            style={iconBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(120, 86, 255, 0.25)'; e.currentTarget.style.borderColor = 'rgba(120, 86, 255, 0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = iconBtnStyle.background; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            onClick={() => {
              window.open("https://github.com/0xrphl", "_blank");
            }}
          >
            <img
              src={github}
              alt="GitHub"
              style={{ width: '30px', height: '30px', marginRight: '0px' }}
            />
          </button>
          <button
            className='py-2 px-2 rounded-xl outline-none text-white font-bold flex items-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(120,86,255,0.15)]'
            style={iconBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(120, 86, 255, 0.25)'; e.currentTarget.style.borderColor = 'rgba(120, 86, 255, 0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = iconBtnStyle.background; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            onClick={() => {
              window.open("https://twitter.com/0xrnull", "_blank");
            }}
          >
            <img
              src={X}
              alt="X"
              style={{ width: '30px', height: '30px', marginRight: '0px' }}
            />
          </button>
        </div>

        <p className={styles.sectionSubText}>{t('getInTouch')}</p>
        <h3 className={styles.sectionHeadText}>{t('contactMe')}</h3>

        <form ref={formRef} onSubmit={handleSubmit} className='mt-12 flex flex-col gap-8'>
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-4'>{t('yourName')}</span>
            <input
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              placeholder={t('typeName')}
              className='py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none font-medium transition-all duration-300'
              style={inputStyle}
              onFocus={(e) => { e.target.style.background = 'rgba(0, 0, 0, 0.55)'; e.target.style.borderColor = 'rgba(120, 86, 255, 0.5)'; e.target.style.boxShadow = '0 0 15px rgba(120, 86, 255, 0.1)'; }}
              onBlur={(e) => { e.target.style.background = inputStyle.background; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-4'>{t('emailAddress')}</span>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder={t('typeEmail')}
              className='py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none font-medium transition-all duration-300'
              style={inputStyle}
              onFocus={(e) => { e.target.style.background = 'rgba(0, 0, 0, 0.55)'; e.target.style.borderColor = 'rgba(120, 86, 255, 0.5)'; e.target.style.boxShadow = '0 0 15px rgba(120, 86, 255, 0.1)'; }}
              onBlur={(e) => { e.target.style.background = inputStyle.background; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-4'>{t('yourMessage')}</span>
            <textarea
              rows={7}
              name='message'
              value={form.message}
              onChange={handleChange}
              placeholder={t('typeMessage')}
              className='py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none font-medium transition-all duration-300'
              style={inputStyle}
              onFocus={(e) => { e.target.style.background = 'rgba(0, 0, 0, 0.55)'; e.target.style.borderColor = 'rgba(120, 86, 255, 0.5)'; e.target.style.boxShadow = '0 0 15px rgba(120, 86, 255, 0.1)'; }}
              onBlur={(e) => { e.target.style.background = inputStyle.background; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
          </label>

          <button
            type='submit'
            className='py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary transition-all duration-300'
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(120, 86, 255, 0.2)'; e.currentTarget.style.borderColor = 'rgba(120, 86, 255, 0.5)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(120, 86, 255, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = btnStyle.background; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {loading ? t('sending') : t('send')}
          </button>
        </form>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className='xl:flex-1 xl:h-auto md:h-[550px] h-[350px]'
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
