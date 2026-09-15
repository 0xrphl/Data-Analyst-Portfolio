import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../hooks/useProducts';
import { STORE_CATEGORIES } from '../constants';

const StoreCategory = () => {
  const { slug } = useParams();
  const { products, loading } = useProducts(slug);
  const category = STORE_CATEGORIES.find((c) => c.slug === slug);

  return (
    <div className="pt-20 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/store" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white">{category?.name || slug}</span>
        </div>
      </div>

      {/* Category header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <span className="text-4xl">{category?.icon || '📦'}</span>
          <div>
            <h1 className="text-3xl font-bold text-white">{category?.name || slug}</h1>
            <p className="text-gray-400 text-sm mt-1">{category?.description}</p>
          </div>
        </motion.div>
      </div>

      <ProductGrid products={products} loading={loading} showFilter />
    </div>
  );
};

export default StoreCategory;
