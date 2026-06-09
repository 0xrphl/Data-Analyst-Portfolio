import React, { useEffect, useState} from 'react';
import { Link } from 'react-router-dom';

import { styles } from '../styles';
import { navLinks } from '../constants';
import { logo, menu, close} from '../assets';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
const [active, setActive] = useState("");
const [toggle, setToggle] = useState(false);
const { currentLanguage, toggleLanguage, t } = useLanguage();

  return (
    
    <nav className={`${styles.paddingX} w-full flex items-center py-5 fixed top-0 z-20 bg-primary`}>
    <div className="w-full flex justify-between items-center max-w-7xl mx-auto">
      <Link 
      to="/" 
      className="flex items-center gap-2" 
      onClick={() => { setActive("");
      window.scrollTo(0,0);}}>
        <img src={logo} alt="logo" className="w-12 h-12 object-contain"/>
        <p className="text-white text-[18px] font-bold cursor-pointer flex">
          Raphael &nbsp;
          <span className="hidden md:block">|| {t('role')}</span>
          <span className="md:hidden">|| {t('roleShort')}</span>
        </p>
      </Link>

      {/* Show language toggle only on desktop */}
      <div className="hidden lg:block">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 text-white bg-tertiary rounded-xl mx-4"
        >
          {currentLanguage === 'en' ? 'ES | Español' : 'EN | English'}
        </button>
      </div>

      <ul className="list-none hidden lg:flex flex-row gap-6">
        {navLinks[currentLanguage].map((link) => (
          <li
          key={link.id}
          className={`${
            active === link.title 
            ? "text-white" 
            : "text-secondary"
          } hover:text-white text-[18px] font-medium cursor-pointer`}
          onClick={() => setActive(link.title)}
          >
            <a href={`#${link.id}`}>{link.title}</a>
          </li>
        ))}
      </ul>
      <div className="lg:hidden flex flex-1 justify-end items-center">
          <img
            src={toggle ? close : menu}
            alt='menu'
            className="w-[28px] h-[28px] object-contain cursor-pointer"
            onClick={() => setToggle(!toggle)}
          />
          <div className={`${!toggle ? 'hidden' 
          : 'flex' } p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}>
              <div className="flex flex-col gap-4">
                {/* Language toggle button in mobile menu */}
                <button
                  onClick={() => {
                    toggleLanguage();
                    setToggle(false);
                  }}
                  className="px-4 py-2 text-white bg-tertiary rounded-xl text-[16px] font-medium"
                >
                  {currentLanguage === 'en' ? 'ES | Español' : 'EN | English'}
                </button>

                <ul className="list-none flex justify-end items-start flex-col gap-4">
                  {navLinks[currentLanguage].map((link) => (
                    <li
                    key={link.id}
                    className={`${
                      active === link.title 
                      ? "text-white" 
                      : "text-secondary"
                    } font-poppins font-medium cursor-pointer text-[16px]`}
                    onClick={() =>{
                      setToggle(!toggle);
                       setActive(link.title);
                      }}
                    >
                      <a href={`#${link.id}`}>{link.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
          </div>
      </div>
    </div>
    </nav>
  )
}
export default Navbar