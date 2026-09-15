import { useState, useEffect, useCallback } from 'react';
import { supabaseAgora } from '../../lib/supabaseAgora';

export const useProducts = (categorySlug = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
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
      if (cat) query = query.eq('category_id', cat.id);
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching products:', error);
    setProducts(data || []);
    setLoading(false);
  }, [categorySlug]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
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
