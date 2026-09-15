import React from 'react';
import StoreHero from '../components/StoreHero';
import CategorySection from '../components/CategorySection';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../hooks/useProducts';

const StoreLanding = () => {
  const { products, loading } = useProducts();

  // Pick featured: first 8 products
  const featured = products.slice(0, 8);

  return (
    <div>
      <StoreHero />
      <CategorySection />
      <ProductGrid products={featured} loading={loading} title="Productos Destacados" />

      {/* Value propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '🖨️', title: 'Impresión 3D Artesanal', desc: 'Cada pieza impresa con precisión y atención al detalle' },
            { icon: '🚚', title: 'Envíos a Colombia', desc: 'Entrega segura a todo el territorio nacional' },
            { icon: '🎨', title: 'Diseños Únicos', desc: 'Productos exclusivos que no encontrarás en otra parte' },
          ].map((item, i) => (
            <div key={i} className="text-center p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="text-white font-semibold mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StoreLanding;
