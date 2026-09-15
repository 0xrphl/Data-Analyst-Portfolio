import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import StoreNavbar from './components/StoreNavbar';
import CartDrawer from './components/CartDrawer';
import StoreFooter from './components/StoreFooter';
import WhatsAppButton from './components/WhatsAppButton';

const StoreLanding = lazy(() => import('./pages/StoreLanding'));
const StoreCategory = lazy(() => import('./pages/StoreCategory'));
const StoreProduct = lazy(() => import('./pages/StoreProduct'));
const StoreCheckout = lazy(() => import('./pages/StoreCheckout'));
const StoreProfile = lazy(() => import('./pages/StoreProfile'));
const AuthModal = lazy(() => import('./components/AuthModal'));

const Loading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const StoreApp = () => {
  useEffect(() => {
    // Save originals
    const prevTitle = document.title;
    const link = document.querySelector("link[rel~='icon']");
    const prevFavicon = link?.href;

    // Set store branding
    document.title = '3D Agora Lab — Impresión 3D';
    if (link) link.href = '/store/assets/agora-logo.png';

    return () => {
      document.title = prevTitle;
      if (link && prevFavicon) link.href = prevFavicon;
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-black">
          <StoreNavbar />
          <CartDrawer />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route index element={<StoreLanding />} />
              <Route path="category/:slug" element={<StoreCategory />} />
              <Route path="product/:slug" element={<StoreProduct />} />
              <Route path="checkout" element={<StoreCheckout />} />
              <Route path="profile" element={<StoreProfile />} />
              <Route path="login" element={<AuthModal />} />
            </Routes>
          </Suspense>
          <StoreFooter />
          <WhatsAppButton />
        </div>
      </CartProvider>
    </AuthProvider>
  );
};

export default StoreApp;
