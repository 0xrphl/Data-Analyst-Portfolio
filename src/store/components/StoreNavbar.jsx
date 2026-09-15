import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const StoreNavbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
          <div className="hidden md:flex items-center gap-6">
            <Link to="/store" className="text-gray-300 hover:text-white text-sm transition-colors">Inicio</Link>
            <Link to="/store/category/hogar" className="text-gray-300 hover:text-white text-sm transition-colors">Hogar</Link>
            <Link to="/store/category/belleza" className="text-gray-300 hover:text-white text-sm transition-colors">Belleza</Link>
            <Link to="/store/category/accesorios" className="text-gray-300 hover:text-white text-sm transition-colors">Accesorios</Link>
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
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StoreNavbar;
