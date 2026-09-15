import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabaseAgora } from '../../lib/supabaseAgora';
import { formatCOP } from '../constants';

const StoreCheckout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user) { navigate('/store/login'); return null; }
  if (items.length === 0) { navigate('/store'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // 1. Create order
      const { data: order, error: orderErr } = await supabaseAgora
        .from('orders')
        .insert({
          user_id: user.id,
          total_cop: totalPrice,
          payment_provider: 'mercadopago',
          shipping_name: form.name,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_phone: form.phone,
          notes: form.notes,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product?.price_cop || 0,
        product_name: item.product?.name || '',
      }));

      const { error: itemsErr } = await supabaseAgora.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      // 3. TODO: Integrate Mercado Pago via Supabase Edge Function
      // const res = await fetch('SUPABASE_EDGE_URL/create-mp-preference', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ order_id: order.id, items: orderItems }),
      // });
      // const { init_point } = await res.json();
      // window.location.href = init_point;

      // For now, mark as pending and show success
      await clearCart();
      navigate('/store/profile');
    } catch (err) {
      setError(err.message || 'Error al procesar el pedido');
    }
    setSubmitting(false);
  };

  const onChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-8"
        >Checkout</motion.h1>

        {/* Order summary */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Resumen del Pedido</h3>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-gray-300 text-sm">{item.product?.name} x{item.quantity}</span>
              <span className="text-white text-sm font-medium">{formatCOP((item.product?.price_cop||0)*item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 mt-2 border-t border-white/10">
            <span className="text-white font-bold">Total</span>
            <span className="text-violet-400 font-bold text-xl">{formatCOP(totalPrice)}</span>
          </div>
        </div>

        {/* Shipping form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-white font-semibold">Datos de Envío</h3>
          {['name','address','city','phone'].map((f) => (
            <input key={f} type={f==='phone'?'tel':'text'}
              placeholder={{name:'Nombre completo',address:'Dirección',city:'Ciudad',phone:'Teléfono'}[f]}
              value={form[f]} onChange={onChange(f)} required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
            />
          ))}
          <textarea placeholder="Notas (opcional)" value={form.notes} onChange={onChange('notes')} rows={2}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg"
          >
            {submitting ? 'Procesando...' : `Pagar ${formatCOP(totalPrice)}`}
          </button>

          <p className="text-gray-500 text-xs text-center">
            🔒 Pago seguro con Mercado Pago (próximamente se redirigirá automáticamente)
          </p>
        </form>
      </div>
    </div>
  );
};

export default StoreCheckout;
