import { useEffect, useRef } from 'react';

export default function PoliticsChallenge1() {
  const iframeRef = useRef(null);

  useEffect(() => {
    document.title = 'Tribunal Constitucional | ¿La Violencia terminó o cambió de rostro? — UTP Reto 1';
    return () => {
      document.title = '0xRaphael Portfolio';
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0A0D14] flex flex-col overflow-hidden">
      <iframe
        ref={iframeRef}
        src="/college/politics/challenge1/index.html"
        title="Tribunal Constitucional: ¿La Violencia terminó o cambió de rostro?"
        className="w-full h-full border-none flex-1"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}
