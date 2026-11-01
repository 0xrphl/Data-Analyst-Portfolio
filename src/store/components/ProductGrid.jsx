import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import LampsSmartHeader from './LampsSmartHeader';
import { STORE_CATEGORIES } from '../constants';

const PRICE_PRESETS = [
  { id: 'all', label: 'Todos los precios', min: 0, max: Infinity },
  { id: 'under-10k', label: 'Hasta $10.000', min: 0, max: 10000 },
  { id: '10k-30k', label: '$10.000 a $30.000', min: 10000, max: 30000 },
  { id: '30k-60k', label: '$30.000 a $60.000', min: 30000, max: 60000 },
  { id: 'over-60k', label: 'Más de $60.000', min: 60000, max: Infinity },
];

const ProductGrid = ({
  products = [],
  loading = false,
  title,
  showFilter = true,
  currentCategorySlug = null,
  onCategorySelect = null,
}) => {
  const sectionRef = useRef(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(currentCategorySlug || 'all');
  const [pricePreset, setPricePreset] = useState('all');
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const [appliedCustomPrice, setAppliedCustomPrice] = useState(null);
  const [sortBy, setSortBy] = useState('featured');

  const scrollToGridTop = (smooth = true) => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - 80;
      if (window.scrollY > targetY + 20) {
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: smooth ? 'smooth' : 'instant',
        });
      }
    }
  };

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    scrollToGridTop(true);
    if (onCategorySelect) {
      onCategorySelect(slug);
    }
  };

  useEffect(() => {
    setSelectedCategory(currentCategorySlug || 'all');
  }, [currentCategorySlug]);

  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      STORE_CATEGORIES.forEach((cat) => {
        const isMatch =
          p.category?.slug === cat.slug ||
          (Array.isArray(p.category_ids) && p.category_ids.includes(cat.id)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase() === cat.slug || t.toLowerCase() === cat.name.toLowerCase()));
        if (isMatch) {
          counts[cat.slug] = (counts[cat.slug] || 0) + 1;
        }
      });
    });
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedCategory && selectedCategory !== 'all') {
      const targetCat = STORE_CATEGORIES.find((c) => c.slug === selectedCategory);
      const catId = targetCat?.id;
      list = list.filter((p) =>
        p.category?.slug === selectedCategory ||
        (catId && Array.isArray(p.category_ids) && p.category_ids.includes(catId)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase() === selectedCategory || t.toLowerCase() === targetCat?.name.toLowerCase()))
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sale_title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (appliedCustomPrice) {
      const min = appliedCustomPrice.min !== '' ? Number(appliedCustomPrice.min) : 0;
      const max = appliedCustomPrice.max !== '' ? Number(appliedCustomPrice.max) : Infinity;
      list = list.filter((p) => p.price_cop >= min && p.price_cop <= max);
    } else if (pricePreset !== 'all') {
      const preset = PRICE_PRESETS.find((p) => p.id === pricePreset);
      if (preset) list = list.filter((p) => p.price_cop >= preset.min && p.price_cop <= preset.max);
    }

    if (sortBy === 'price-asc') list.sort((a, b) => a.price_cop - b.price_cop);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price_cop - a.price_cop);
    else if (sortBy === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    else if (sortBy === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name, 'es'));
    else list.sort((a, b) => a.id - b.id);

    return list;
  }, [products, selectedCategory, search, pricePreset, appliedCustomPrice, sortBy]);

  const handleApplyPrice = (e) => {
    e.preventDefault();
    if (customMin !== '' || customMax !== '') {
      setAppliedCustomPrice({ min: customMin, max: customMax });
      setPricePreset('custom');
      scrollToGridTop(true);
    }
  };

  const handleClear = () => {
    setSearch('');
    setSelectedCategory(currentCategorySlug || 'all');
    setPricePreset('all');
    setCustomMin('');
    setCustomMax('');
    setAppliedCustomPrice(null);
    setSortBy('featured');
    scrollToGridTop(true);
    if (onCategorySelect) onCategorySelect('all');
  };

  const hasFilters = search.trim() !== '' || selectedCategory !== 'all' || pricePreset !== 'all' || appliedCustomPrice !== null || sortBy !== 'featured';

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {title && (
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-extrabold text-white mb-6">
          {title}
        </motion.h2>
      )}

        {showFilter && (
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, tags o descripción..."
                  className="w-full pl-10 pr-8 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-white">✕</button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 whitespace-nowrap">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-2 px-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="featured">Destacados</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                  <option value="name-asc">Nombre: A - Z</option>
                  <option value="name-desc">Nombre: Z - A</option>
                </select>
              </div>
            </div>

            {/* Stackable Matrix Grid for Categories — 2 cols (mobile: 5 rows), 3 cols (tablet/sm: 3-4 rows), 4 cols (md: 3 rows), 5 cols (desktop: 2 rows) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1 pb-1">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full px-3 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1.5 ${
                  selectedCategory === 'all'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 ring-1 ring-violet-400/50'
                    : 'bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] hover:text-white border border-white/5 hover:border-white/10'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="shrink-0">📦</span>
                  <span className="truncate">Todos</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-bold shrink-0">
                  {categoryCounts.all || 0}
                </span>
              </button>
              {STORE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                const count = categoryCounts[cat.slug] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`w-full px-3 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 ring-1 ring-violet-400/50'
                        : 'bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] hover:text-white border border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="shrink-0">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-bold shrink-0">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-gray-400 font-semibold mr-1">Precio:</span>
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPricePreset(p.id);
                      setAppliedCustomPrice(null);
                      setCustomMin('');
                      setCustomMax('');
                      scrollToGridTop(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      pricePreset === p.id && !appliedCustomPrice
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-semibold'
                        : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleApplyPrice} className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  placeholder="Min $"
                  className="w-20 px-2 py-1 bg-black/50 border border-white/10 rounded text-white text-xs"
                />
                <span className="text-gray-500">—</span>
                <input
                  type="number"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  placeholder="Max $"
                  className="w-20 px-2 py-1 bg-black/50 border border-white/10 rounded text-white text-xs"
                />
                <button type="submit" className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded font-semibold text-xs">
                  OK
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-gray-400">
                Mostrando <strong className="text-white">{filtered.length}</strong> de <strong className="text-white">{products.length}</strong> productos
              </span>
              {hasFilters && (
                <button onClick={handleClear} className="text-violet-400 hover:text-violet-300 font-semibold underline">
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

      {selectedCategory === 'lamparas' && !currentCategorySlug && (
        <LampsSmartHeader />
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/5">
              <div className="aspect-square bg-white/5 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-white/5 rounded animate-pulse" />
                <div className="h-6 bg-white/5 rounded w-20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.01] border border-white/[0.05] rounded-2xl p-6">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-white mb-1">No se encontraron productos</h3>
          <p className="text-gray-400 text-xs mb-4">Prueba ajustando los filtros de búsqueda o categoría.</p>
          <button onClick={handleClear} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl">
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
