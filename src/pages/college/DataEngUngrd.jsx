import { useEffect, useRef } from 'react';

export default function DataEngUngrd() {
  const iframeRef = useRef(null);

  useEffect(() => {
    document.title = 'Emergencias UNGRD Colombia 2025 | Ingeniería de Datos — 0xRaphael';
    return () => {
      document.title = '0xRaphael Portfolio';
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0a0c10] overflow-hidden">
      <iframe
        ref={iframeRef}
        src="/college/data-eng-ungrd/index.html"
        title="UNGRD 3D Analytics Dashboard"
        className="w-full h-full border-none bg-[#0a0c10]"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

