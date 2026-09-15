import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCOP } from '../constants';
import ProductImages from '../components/ProductImages';
import ProductInfo from '../components/ProductInfo';

const StoreProduct = () => {
  const { slug } = useParams();
  const { product, loading } = useProduct(slug);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedImg, setSelectedImg] = useState(0);
  const [adding, setAdding] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
      <p className="text-gray-400 text-lg mb-4">Producto no encontrado</p>
      <Link to="/store" className="text-violet-400">Volver</Link>
    </div>
  );

  const images = product.images || [];
  const handleAdd = async () => {
    if (!user) { window.location.href = '/store/login'; return; }
    setAdding(true);
    await addToCart(product.id);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/store" className="hover:text-white">Inicio</Link><span>/</span>
          <Link to={`/store/category/${product.category?.slug||'accesorios'}`} className="hover:text-white">{product.category?.name}</Link>
          <span>/</span><span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ProductImages images={images} video={product.video_url} selectedImg={selectedImg}
            setSelectedImg={setSelectedImg} showVideo={showVideo} setShowVideo={setShowVideo} name={product.name} />
          <ProductInfo product={product} adding={adding} onAdd={handleAdd} />
        </div>
      </div>
    </div>
  );
};

export default StoreProduct;
