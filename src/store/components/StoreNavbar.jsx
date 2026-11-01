import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';

const StoreNavbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const { products } = useProducts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  const totalCount = products.length;

  const counts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    products.forEach((p) => {
      if (p.category_id && c[p.category_id] !== undefined) c[p.category_id]++;
      if (Array.isArray(p.category_ids)) {
        p.category_ids.forEach((id) => {
          if (id !== p.category_id && c[id] !== undefined) c[id]++;
        });
      }
    });
    return c;
  }, [products]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/store" className="flex items-center gap-2 group">
            <img
              src="/store/assets/agora-logo.png"
              alt="3D Agora Lab"
              className="h-9 w-9 rounded-lg object-cover group-hover:scale-110 transition-transform"
            />
            <span className="text-white font-semibold text-lg hidden sm:block">
              Agora<span className="text-violet-400">Lab</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/store" className="text-gray-300 hover:text-white text-sm transition-colors">Inicio</Link>
            <Link to="/store/products" className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors flex items-center gap-1">
              <span>Catálogo</span>
              {totalCount > 0 && (
                <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.2 rounded-full border border-violet-500/30">{totalCount}</span>
              )}
            </Link>
            <Link to="/store/category/lamparas" className="text-gray-300 hover:text-white text-sm transition-colors">Lámparas</Link>
            <Link to="/store/category/organizadores" className="text-gray-300 hover:text-white text-sm transition-colors">Organizadores</Link>
            <Link to="/store/category/llaveros" className="text-gray-300 hover:text-white text-sm transition-colors">Llaveros</Link>
            <Link to="/store/category/gaming-geek" className="text-gray-300 hover:text-white text-sm transition-colors">Gaming</Link>
            <Link to="/store/about" className="text-gray-300 hover:text-white text-sm transition-colors">
              Contacto
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold hover:bg-violet-500 transition-colors"
                >
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-black/95 border border-white/10 rounded-xl py-2 shadow-2xl"
                    >
                      <p className="px-4 py-1 text-xs text-gray-400 truncate">{user.email}</p>
                      <Link to="/store/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                        Mis Pedidos
                      </Link>
                      {isAdmin && (
                        <Link to="/store/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-violet-400 hover:text-violet-300 hover:bg-white/5">
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5">
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate('/store/login')}
                className="px-4 py-1.5 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
              >
                Entrar
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 py-3 space-y-2 overflow-hidden bg-black/95"
            >
              <Link
                to="/store"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Inicio
              </Link>
              <Link
                to="/store/products"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg flex items-center justify-between"
              >
                <span>Catálogo Completo</span>
                {totalCount > 0 && (
                  <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">{totalCount}</span>
                )}
              </Link>
              <Link
                to="/store/category/lamparas"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                💡 Lámparas {counts[1] ? `(${counts[1]})` : ''}
              </Link>
              <Link
                to="/store/category/organizadores"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                🗂️ Organizadores {counts[2] ? `(${counts[2]})` : ''}
              </Link>
              <Link
                to="/store/category/llaveros"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                🔑 Llaveros {counts[3] ? `(${counts[3]})` : ''}
              </Link>
              <Link
                to="/store/category/clickers"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                ✨ Clickers & Fidgets {counts[4] ? `(${counts[4]})` : ''}
              </Link>
              <Link
                to="/store/category/gaming-geek"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                🎮 Gaming & Geek {counts[6] ? `(${counts[6]})` : ''}
              </Link>
              <Link
                to="/store/category/abrelatas"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                🥫 Abrelatas {counts[5] ? `(${counts[5]})` : ''}
              </Link>
              <Link
                to="/store/category/belleza"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                💄 Belleza & Estilo {counts[7] ? `(${counts[7]})` : ''}
              </Link>
              <Link
                to="/store/category/pedidos-escala-custom"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                🚛 Custom & Escala {counts[8] ? `(${counts[8]})` : ''}
              </Link>
              <Link
                to="/store/category/bebes"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                👶 Bebés & Niños {counts[9] ? `(${counts[9]})` : ''}
              </Link>
              <Link
                to="/store/about"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Contacto & Ubicación
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default StoreNavbar;
