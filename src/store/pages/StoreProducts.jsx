import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../hooks/useProducts';

const StoreProducts = () => {
  const navigate = useNavigate();
  const { products, loading } = useProducts();

  return (
    <div className="pt-20 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/store" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white font-medium">Catálogo Completo</span>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <span className="text-4xl">🛍️</span>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Catálogo de Productos</h1>
            <p className="text-gray-400 text-sm mt-1">
              Explora nuestra colección completa de creaciones 3D de alta precisión con envíos a toda Colombia.
            </p>
          </div>
        </motion.div>
      </div>

      <ProductGrid
        products={products}
        loading={loading}
        showFilter={true}
        currentCategorySlug="all"
        onCategorySelect={(catSlug) => {
          if (catSlug !== 'all') {
            navigate(`/store/category/${catSlug}`);
          }
        }}
      />
    </div>
  );
};

export default StoreProducts;
