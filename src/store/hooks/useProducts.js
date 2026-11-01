import { useState, useEffect, useCallback } from 'react';
import { supabaseAgora } from '../../lib/supabaseAgora';

let cachedProducts = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

export const useProducts = (categorySlug = null) => {
  const [products, setProducts] = useState(cachedProducts || []);
  const [loading, setLoading] = useState(!cachedProducts);

  const fetchProducts = useCallback(async (force = false) => {
    const isCacheValid = cachedProducts && (Date.now() - cacheTime < CACHE_TTL);

    if (!force && isCacheValid && !categorySlug) {
      setProducts(cachedProducts);
      setLoading(false);
      return;
    }

    if (!cachedProducts) setLoading(true);

    let query = supabaseAgora
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (categorySlug) {
      const { data: cat } = await supabaseAgora
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      if (cat) {
        query = query.or(`category_id.eq.${cat.id},category_ids.cs.{${cat.id}}`);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      if (!categorySlug) {
        cachedProducts = data || [];
        cacheTime = Date.now();
      }
      setProducts(data || []);
    }
    setLoading(false);
  }, [categorySlug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, refetch: () => fetchProducts(true) };
};

export const useProduct = (slug) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabaseAgora
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .single();
      setProduct(data);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  return { product, loading };
};

