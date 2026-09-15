import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatCOP } from '../constants';

const FALLBACK_IMG = '/store/assets/products/mossglow-lamp-1.jpg';

const ProductCard = ({ product, index = 0 }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const mainImage = product.images?.[0] || FALLBACK_IMG;
  const displayImage = imgError ? FALLBACK_IMG : mainImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/store/product/${product.slug}`}
        className="group block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-black/40">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              if (!imgError) {
                setImgError(true);
                setImgLoaded(false);
              }
            }}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick view badge */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="px-4 py-1.5 bg-white/90 text-black text-xs font-semibold rounded-full">
              Ver Detalles
            </span>
          </div>

          {/* Category badge */}
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] text-gray-300 rounded-md uppercase tracking-wider">
            {product.category?.name || product.sale_title}
          </span>

          {/* Video indicator */}
          {product.video_url && (
            <span className="absolute top-3 right-3 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-white font-medium text-sm leading-tight mb-1 line-clamp-2 group-hover:text-violet-300 transition-colors">
            {product.name}
          </h3>
          {product.sale_title && (
            <p className="text-gray-500 text-xs mb-2">{product.sale_title}</p>
          )}
          <p className="text-violet-400 font-bold text-lg">
            {formatCOP(product.price_cop)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
