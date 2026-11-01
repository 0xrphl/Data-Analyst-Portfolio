import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STORE_CATEGORIES } from '../constants';
import { useProducts } from '../hooks/useProducts';

const CategorySection = () => {
  const { products } = useProducts();
  const totalCount = products.length;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Explora por Categoría</h2>
          <p className="text-gray-400 text-sm mt-1">Diseños exclusivos impresos con filamentos de alta resistencia</p>
        </div>
        <Link
          to="/store/products"
          className="text-sm font-semibold text-violet-400 hover:text-violet-300 hidden sm:flex items-center gap-1.5"
        >
          <span>Ver catálogo completo {totalCount > 0 ? `(${totalCount})` : ''}</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STORE_CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/store/category/${cat.slug}`}
              className="group block p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-300 text-center h-full flex flex-col items-center justify-center"
            >
              <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-violet-300 transition-colors">{cat.name}</h3>
              <p className="text-gray-500 text-xs line-clamp-2">{cat.description}</p>
            </Link>
          </motion.div>
        ))}

        {/* 8th Card: Ver Todos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
        >
          <Link
            to="/store/products"
            className="group block p-6 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 border border-violet-500/30 rounded-2xl hover:border-violet-400 hover:scale-[1.02] transition-all duration-300 text-center h-full flex flex-col items-center justify-center"
          >
            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">🛍️</span>
            <h3 className="text-white font-bold text-sm mb-1 text-violet-200">Ver Catálogo</h3>
            <p className="text-violet-300/80 text-xs">{totalCount > 0 ? `Todos los ${totalCount} productos` : 'Todos los productos'}</p>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySection;
