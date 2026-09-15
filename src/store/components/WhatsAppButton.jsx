import React from 'react';

const WHATSAPP_NUMBER = '573117170688';
const WHATSAPP_MESSAGE = '¡Hola! Me interesa un producto de 3D AgoraLab 🛒';

const WhatsAppButton = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contáctanos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
    >
      <img
        src="/store/assets/whatsapp.svg"
        alt="WhatsApp"
        className="w-8 h-8 drop-shadow-sm"
      />
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        ¡Escríbenos! 💬
      </span>
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    </a>
  );
};

export default WhatsAppButton;
