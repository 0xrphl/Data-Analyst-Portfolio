import { useEffect, useRef } from 'react';

export default function HeatTransferParker() {
  const iframeRef = useRef(null);

  useEffect(() => {
    document.title = 'Parker Solar Probe — SOTA Engineering & Thermodynamic Dashboard | 0xRaphael';
    return () => {
      document.title = '0xRaphael Portfolio';
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-[#030712] overflow-hidden">
      <iframe
        ref={iframeRef}
        src="/college/heat-transfer-traslation-paper-3d-dashboard/index.html"
        title="Parker Solar Probe - SOTA Engineering & Thermodynamic Dashboard"
        className="w-full h-full border-none bg-[#030712]"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      />
    </div>
  );
}
