import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatCOP } from '../constants';

const WHATSAPP_NUMBER = '573117170688';

const ProductInfo = ({ product, adding, onAdd }) => {
  const isCustom =
    product.category_id === 8 ||
    (Array.isArray(product.category_ids) && product.category_ids.includes(8)) ||
    product.tags?.some((t) => ['custom', 'cotizacion', 'personalizado', 'escala'].includes(t.toLowerCase())) ||
    product.slug?.includes('hacemos-tu-perrito') ||
    product.slug?.includes('schnauzer') ||
    product.slug?.includes('custom');

  const waQuoteMessage = `¡Hola 3D Agora Lab! Me interesa cotizar: ${product.name}. ¿Me pueden brindar información y cotización para mi pedido personalizado o en otro tamaño? 🐾`;
  const waQuoteUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waQuoteMessage)}`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium rounded-full">
          {product.category?.name || 'Producto Agora'}
        </span>
        {isCustom && (
          <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
            ✨ Cotización Personalizada
          </span>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{product.name}</h1>
      {product.sale_title && <p className="text-gray-400 text-sm mb-4">{product.sale_title}</p>}

      <div className="mb-6">
        {isCustom ? (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs uppercase tracking-wider text-gray-400">Precio base:</span>
              <p className="text-violet-400 font-bold text-3xl">
                {product.price_cop > 0 ? (
                  <>
                    <span className="text-sm font-normal text-gray-400 mr-1.5">Desde</span>
                    {formatCOP(product.price_cop)}
                  </>
                ) : (
                  'Cotización según medida'
                )}
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Fabricación en cualquier tamaño o escala. Escríbenos por WhatsApp para cotización exacta.
            </p>
          </div>
        ) : (
          <p className="text-violet-400 font-bold text-3xl">{formatCOP(product.price_cop)}</p>
        )}
      </div>

      {product.description && (
        <div className="mb-8">
          <h3 className="text-white font-semibold text-sm mb-2">Descripción</h3>
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {product.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {product.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-md">#{tag}</span>
          ))}
        </div>
      )}

      {/* Action Buttons for Custom Items */}
      {isCustom && (
        <div className="flex flex-col gap-3 mb-6">
          <a
            href={waQuoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-xl font-extrabold text-black bg-[#25D366] hover:bg-[#20ba59] shadow-lg shadow-green-500/25 flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.01] active:scale-98 text-base cursor-pointer group"
          >
            <img src="/store/assets/whatsapp.svg" alt="WhatsApp" className="w-6 h-6 drop-shadow group-hover:scale-110 transition-transform" />
            <span>Contáctanos para cotización</span>
          </a>
          <Link
            to="/store/about"
            className="w-full py-3 px-6 rounded-xl font-semibold text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:text-white flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <span>ℹ️ Conoce sobre nuestras cotizaciones técnicas</span>
          </Link>
        </div>
      )}

      <motion.button
        onClick={onAdd}
        whileTap={{ scale: 0.95 }}
        disabled={adding || product.stock <= 0}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          adding
            ? 'bg-green-600'
            : product.stock <= 0
            ? 'bg-gray-600 cursor-not-allowed'
            : isCustom
            ? 'bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-base'
            : 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/25 text-lg'
        }`}
      >
        {adding
          ? '✓ Agregado'
          : product.stock <= 0
          ? 'Agotado'
          : isCustom
          ? `Comprar modelo base (${formatCOP(product.price_cop)})`
          : 'Agregar al Carrito'}
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
};

export default ProductInfo;
