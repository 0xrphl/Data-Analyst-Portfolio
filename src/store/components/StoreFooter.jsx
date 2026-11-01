import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';

const StoreFooter = () => {
  const { products } = useProducts();
  const totalCount = products.length;

  return (
    <footer className="bg-black/90 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs">
                3D
              </div>
              <span className="text-white font-semibold">Agora<span className="text-violet-400">Lab</span></span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Productos artesanales impresos en 3D. Lámparas, llaveros, organizadores y accesorios únicos hechos en Colombia.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Catálogo & Categorías</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/store/products" className="block text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors col-span-2">
                🛍️ Catálogo Completo {totalCount > 0 ? `(${totalCount})` : ''}
              </Link>
              <Link to="/store/category/lamparas" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">💡 Lámparas</Link>
              <Link to="/store/category/organizadores" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">🗂️ Organizadores</Link>
              <Link to="/store/category/llaveros" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">🔑 Llaveros</Link>
              <Link to="/store/category/gaming-geek" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">🎮 Gaming & Geek</Link>
              <Link to="/store/category/clickers" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">✨ Clickers</Link>
              <Link to="/store/category/abrelatas" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">🥫 Abrelatas</Link>
              <Link to="/store/category/belleza" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">💄 Belleza</Link>
              <Link to="/store/category/pedidos-escala-custom" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">🚛 Custom & Escala</Link>
              <Link to="/store/category/bebes" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors col-span-2">👶 Bebés & Niños</Link>
              <Link to="/store/about" className="block text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors col-span-2 mt-1">Acerca de & Contacto →</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contacto</h4>
            <p className="text-gray-500 text-sm">Colombia 🇨🇴</p>
            <p className="text-gray-500 text-sm mt-1">Envíos a todo el país</p>
            <p className="text-violet-400 text-sm mt-2">3dagoralab.com</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} 3D AgoraLab. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
