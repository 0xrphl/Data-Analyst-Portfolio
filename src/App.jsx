import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
const IoTVehicleTelemetry = lazy(() => import('./pages/IoTVehicleTelemetry'));

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

const App = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
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
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App

