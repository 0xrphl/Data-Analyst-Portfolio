import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STORE_CATEGORIES } from '../constants';

const CategorySection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-white text-center mb-10"
      >
        Categorías
      </motion.h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STORE_CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/store/category/${cat.slug}`}
              className="group block p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 text-center"
            >
              <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="text-white font-semibold mb-1">{cat.name}</h3>
              <p className="text-gray-500 text-xs">{cat.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
