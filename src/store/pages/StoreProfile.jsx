import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabaseAgora } from '../../lib/supabaseAgora';
import { formatCOP } from '../constants';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-500/10' },
  paid: { label: 'Pagado', color: 'text-green-400 bg-green-500/10' },
  shipped: { label: 'Enviado', color: 'text-blue-400 bg-blue-500/10' },
  delivered: { label: 'Entregado', color: 'text-emerald-400 bg-emerald-500/10' },
  cancelled: { label: 'Cancelado', color: 'text-red-400 bg-red-500/10' },
};

const StoreProfile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/store/login'); return; }
    const fetch = async () => {
      const { data } = await supabaseAgora
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetch();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white text-xl font-bold">
              {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile?.full_name || 'Mi Perfil'}</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Orders */}
          <h2 className="text-xl font-bold text-white mb-6">Mis Pedidos</h2>

          {loading ? (
            <div className="space-y-4">
              {[1,2].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
              <p className="text-gray-400 mb-2">No tienes pedidos aún</p>
              <button onClick={() => navigate('/store')} className="text-violet-400 hover:text-violet-300 text-sm">
                Explorar tienda
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                return (
                  <div key={order.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-500 text-xs font-mono">{order.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">{order.order_items?.length || 0} producto(s)</p>
                        <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                      </div>
                      <p className="text-violet-400 font-bold">{formatCOP(order.total_cop)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StoreProfile;
