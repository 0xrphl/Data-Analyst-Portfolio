import { useEffect, useRef } from 'react';

export default function PoliticsChallenge2() {
  const iframeRef = useRef(null);

  useEffect(() => {
    document.title = 'Radiografía Constitucional | Sentencia T-375 de 2025 — UTP Reto 2';
    return () => {
      document.title = '0xRaphael Portfolio';
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0A0D14] flex flex-col overflow-hidden">
      <iframe
        ref={iframeRef}
        src="/college/politics/challenge2/index.html"
        title="Radiografía Constitucional: Sentencia T-375 de 2025"
        className="w-full h-full border-none flex-1"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}
