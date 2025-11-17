import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { products as staticProducts } from '../assets/assets.js';
import { listProducts } from '../api/client.js';

const ProductsContext = createContext(null);

function mapApiProduct(p) {
  // Map backend product shape to frontend's expected shape
  const start = p.discountStart ? new Date(p.discountStart).getTime() : undefined;
  const end = p.discountEnd ? new Date(p.discountEnd).getTime() : undefined;
  const now = Date.now();
  const discounted = p.salePrice != null && (!start || now >= start) && (!end || now <= end);
  return {
    _id: p._id,
    name: p.name,
    description: p.description || '',
    price: discounted ? p.salePrice : p.price,
    image: Array.isArray(p.images) ? p.images.map((i) => i?.url).filter(Boolean) : [],
    category: p.category || '',
    subCategory: p.subCategory || '',
    sizes: p.sizes || [],
    date: new Date(p.createdAt || Date.now()).getTime(),
    bestseller: !!p.bestseller,
  };
}

export function ProductsProvider({ children }) {
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listProducts({ limit: 200 });
        const arr = (data?.products || []).map(mapApiProduct);
        if (alive) setApiProducts(arr);
      } catch (err) {
        if (alive) setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const merged = useMemo(() => {
    // Put API products first so new content shows up
    // Deduplicate by _id when overlapping
    const byId = new Map();
    for (const p of apiProducts) byId.set(p._id, p);
    for (const p of staticProducts) if (!byId.has(p._id)) byId.set(p._id, p);
    return Array.from(byId.values());
  }, [apiProducts]);

  const value = useMemo(() => ({ products: merged, loading, error, refresh: async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProducts({ limit: 200 });
      const arr = (data?.products || []).map(mapApiProduct);
      setApiProducts(arr);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  } }), [merged, loading, error]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
