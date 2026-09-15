import React from 'react';
import { motion } from 'framer-motion';
import { formatCOP } from '../constants';

const ProductInfo = ({ product, adding, onAdd }) => (
  <div>
    <span className="inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs rounded-full mb-4">
      {product.category?.name}
    </span>
    <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
    {product.sale_title && <p className="text-gray-400 text-sm mb-4">{product.sale_title}</p>}
    <p className="text-violet-400 font-bold text-3xl mb-6">{formatCOP(product.price_cop)}</p>

    {product.description && (
      <div className="mb-8">
        <h3 className="text-white font-semibold text-sm mb-2">Descripción</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
      </div>
    )}

    {product.tags?.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-8">
        {product.tags.map((tag, i) => (
          <span key={i} className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-md">#{tag}</span>
        ))}
      </div>
    )}

    <motion.button
      onClick={onAdd}
      whileTap={{ scale: 0.95 }}
      disabled={adding || product.stock <= 0}
      className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
        adding ? 'bg-green-600' : product.stock <= 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/25'
      }`}
    >
      {adding ? '✓ Agregado' : product.stock <= 0 ? 'Agotado' : 'Agregar al Carrito'}
    </motion.button>

    <p className="text-gray-500 text-xs text-center mt-3">
      {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'} · Impresión 3D artesanal 🖨️
    </p>

    {product.design_source && (
      <div className="mt-6 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
        <p className="text-gray-500 text-xs">Diseño: <span className="text-gray-400">{product.design_source}</span></p>
      </div>
    )}
  </div>
);

export default ProductInfo;
