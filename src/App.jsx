import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

// Lazy load components that aren't immediately visible
const About = lazy(() => import('./components/About'));
const Experience = lazy(() => import('./components/Experience'));
const Tech = lazy(() => import('./components/Tech'));
const Works = lazy(() => import('./components/Works'));
const Feedbacks = lazy(() => import('./components/Feedbacks'));
const Contact = lazy(() => import('./components/Contact'));
const StarsCanvas = lazy(() => import('./components/canvas/Stars'));
const SolarMiningCluster = lazy(() => import('./pages/SolarMiningCluster'));
const HeatTransferSim = lazy(() => import('./pages/HeatTransfer/HeatTransferSim'));
const HydraulicsLabApp = lazy(() => import('./pages/HydraulicsLab/HydraulicsLabApp'));
const IoTVehicleTelemetry = lazy(() => import('./pages/IoTVehicleTelemetry'));
const StoreApp = lazy(() => import('./store/StoreApp'));

// Import immediately needed components normally
import { Hero, Navbar } from './components';

const MainSite = () => (
  <div className="relative z-0 bg-primary">
    <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
      <Navbar />
      <Hero />
    </div>
    <Suspense fallback={<div>Loading...</div>}>
      <About />
      <Experience />
      <Tech />
      <Works />
      <Feedbacks />
      <div className="relative z-0">
        <Contact />
        <StarsCanvas />
      </div>
    </Suspense>
  </div>
);

// Domain detector: 3dagoralab.com → redirect to /store
const DomainRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const host = window.location.hostname;
    const isStoreDomain = host === '3dagoralab.com' || host === 'www.3dagoralab.com';
    if (isStoreDomain && !location.pathname.startsWith('/store')) {
      navigate('/store' + location.pathname, { replace: true });
    }
  }, [navigate, location]);

  return null;
};

const App = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <DomainRedirect />
        <Routes>
          {/* ── Portfolio routes (UNTOUCHED) ── */}
          <Route path="/" element={<MainSite />} />
          <Route
            path="/solar-mining-cluster"
            element={
              <Suspense fallback={<div className="min-h-screen bg-primary flex items-center justify-center text-white">Loading dashboard...</div>}>
                <SolarMiningCluster />
              </Suspense>
            }
          />
          <Route
            path="/college/heat-transfer"
            element={
              <Suspense fallback={<div className="min-h-screen bg-primary flex items-center justify-center text-white">Loading simulation...</div>}>
                <HeatTransferSim />
              </Suspense>
            }
          />
          <Route
            path="/college/iot-vehicle-telemetry"
            element={
              <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading IoT dashboard...</div>}>
                <IoTVehicleTelemetry />
              </Suspense>
            }
          />
          <Route
            path="/college/hydraulics-lab/cycle1"
            element={
              <Suspense fallback={<div className="min-h-screen bg-primary flex items-center justify-center text-white">Loading hydraulics lab...</div>}>
                <HydraulicsLabApp />
              </Suspense>
            }
          />

          {/* ── 3D Agora Lab Store ── */}
          <Route
            path="/store/*"
            element={
              <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}>
                <StoreApp />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App

