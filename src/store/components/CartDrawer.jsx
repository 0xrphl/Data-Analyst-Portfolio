import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCOP } from '../constants';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md bg-black/95 border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-white font-bold text-lg">
                Carrito <span className="text-violet-400">({items.length})</span>
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Tu carrito está vacío</p>
                  <button onClick={() => setIsOpen(false)} className="text-violet-400 hover:text-violet-300 text-sm">
                    Seguir comprando
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3"
                  >
                    <img
                      src={item.product?.images?.[0]}
                      alt={item.product?.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">{item.product?.name}</h4>
                      <p className="text-violet-400 font-bold text-sm mt-1">{formatCOP(item.product?.price_cop || 0)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-white/10 text-white text-xs flex items-center justify-center hover:bg-white/20"
                        >−</button>
                        <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-white/10 text-white text-xs flex items-center justify-center hover:bg-white/20"
                        >+</button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-red-400 hover:text-red-300 text-xs"
                        >Quitar</button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white font-bold text-xl">{formatCOP(totalPrice)}</span>
                </div>
                <Link
                  to="/store/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-center transition-colors"
                >
                  Ir al Pago
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
