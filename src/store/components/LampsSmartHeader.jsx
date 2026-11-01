import React from 'react';
import { motion } from 'framer-motion';

const LampsSmartHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-6 relative w-full rounded-3xl overflow-hidden border border-violet-500/25 bg-black shadow-2xl shadow-violet-950/20"
    >
      {/* Base Banner Image */}
      <img
        src="/store/assets/header-lamparas-configs.webp"
        alt="Configuraciones de Lámparas 3D: Bombillo RGB Smart WiFi Bluetooth Alexa Cortana y Tira LED con Control Remoto"
        className="w-full h-auto block object-cover min-h-[320px] sm:min-h-0"
        loading="eager"
      />

      {/* Black Gradient Overlay on the UPPER side of the image */}
      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/95 via-black/80 to-transparent pt-3 sm:pt-5 pb-12 sm:pb-20 px-3 sm:px-6">
        {/* Top Header / Title with Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-violet-600/90 text-white text-[10px] sm:text-[11px] font-bold rounded-full uppercase tracking-wider shadow-lg shadow-violet-600/30 backdrop-blur-md">
              Tecnología Smart RGB Incluida
            </span>
            <span className="text-gray-200 text-xs sm:text-sm font-semibold hidden md:inline">
              Iluminación Inteligente & Control Personalizado
            </span>
          </div>
          <span className="text-gray-400 text-[10px] sm:text-xs hidden sm:block">
            Smart Life • Tuya • Alexa • Google • Cortana
          </span>
        </div>

        {/* Feature Cards inside the upper overlay */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-left">
          <div className="p-2 sm:p-3 bg-black/60 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl flex items-start gap-2 sm:gap-2.5 shadow-lg hover:border-violet-500/50 transition-colors">
            <span className="text-lg sm:text-2xl flex-shrink-0">💡</span>
            <div>
              <h4 className="text-white text-[11px] sm:text-xs font-bold leading-tight">Bombillo Inteligente RGB</h4>
              <p className="text-gray-300 text-[9px] sm:text-[11px] mt-0.5 leading-snug">RGB + Luz Cálida/Fría (CCT) con millones de tonos.</p>
            </div>
          </div>

          <div className="p-2 sm:p-3 bg-black/60 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl flex items-start gap-2 sm:gap-2.5 shadow-lg hover:border-violet-500/50 transition-colors">
            <span className="text-lg sm:text-2xl flex-shrink-0">📶</span>
            <div>
              <h4 className="text-white text-[11px] sm:text-xs font-bold leading-tight">WiFi + Bluetooth</h4>
              <p className="text-gray-300 text-[9px] sm:text-[11px] mt-0.5 leading-snug">Conexión 2.4GHz y emparejamiento Bluetooth rápido.</p>
            </div>
          </div>

          <div className="p-2 sm:p-3 bg-black/60 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl flex items-start gap-2 sm:gap-2.5 shadow-lg hover:border-violet-500/50 transition-colors">
            <span className="text-lg sm:text-2xl flex-shrink-0">🗣️</span>
            <div>
              <h4 className="text-white text-[11px] sm:text-xs font-bold leading-tight">Alexa, Google & Cortana</h4>
              <p className="text-gray-300 text-[9px] sm:text-[11px] mt-0.5 leading-snug">Control por voz con tus asistentes favoritos.</p>
            </div>
          </div>

          <div className="p-2 sm:p-3 bg-black/60 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl flex items-start gap-2 sm:gap-2.5 shadow-lg hover:border-violet-500/50 transition-colors">
            <span className="text-lg sm:text-2xl flex-shrink-0">🎮</span>
            <div>
              <h4 className="text-white text-[11px] sm:text-xs font-bold leading-tight">Control Remoto + Tira LED</h4>
              <p className="text-gray-300 text-[9px] sm:text-[11px] mt-0.5 leading-snug">Control remoto IR 24 botones y opción de tira LED RGB.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LampsSmartHeader;
