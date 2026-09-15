import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabaseAgora } from '../../lib/supabaseAgora';
import { useAuth } from './AuthContext';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabaseAgora
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id);
    setItems(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, qty = 1) => {
    if (!user) return { error: 'not_authenticated' };
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await supabaseAgora
        .from('cart_items')
        .update({ quantity: existing.quantity + qty })
        .eq('id', existing.id);
    } else {
      await supabaseAgora
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity: qty });
    }
    await fetchCart();
    setIsOpen(true);
    return { error: null };
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) return removeItem(itemId);
    await supabaseAgora.from('cart_items').update({ quantity }).eq('id', itemId);
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await supabaseAgora.from('cart_items').delete().eq('id', itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabaseAgora.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.product?.price_cop || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, loading, isOpen, setIsOpen,
      addToCart, updateQuantity, removeItem, clearCart,
      totalItems, totalPrice, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
