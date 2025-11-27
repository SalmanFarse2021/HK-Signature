import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart:v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart:v1', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (product, qty = 1, options = {}) => {
    if (!product || !product._id) return;
    const key = options.size ? `${product._id}::${options.size}` : product._id;
    setItems((prev) => {
      const current = prev[key] || { product, qty: 0, size: options.size };
      return { ...prev, [key]: { product, qty: (current.qty || 0) + qty, size: options.size } };
    });
  };

  const removeFromCart = (keyOrId) => {
    setItems((prev) => {
      const next = { ...prev };
      delete next[keyOrId];
      return next;
    });
  };

  const removeItems = (keys) => {
    setItems((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  };

  const clearCart = () => setItems({});

  const updateQty = (key, qty) => {
    setItems((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      const clamped = Math.max(1, qty | 0);
      next[key] = { ...next[key], qty: clamped };
      return next;
    });
  };

  const updateSize = (key, newSize) => {
    setItems((prev) => {
      const entry = prev[key];
      if (!entry) return prev;
      const product = entry.product;
      const qty = entry.qty || 1;
      const newKey = newSize ? `${product._id}::${newSize}` : product._id;
      const next = { ...prev };
      delete next[key];
      const current = next[newKey] || { product, qty: 0, size: newSize };
      next[newKey] = { product, qty: (current.qty || 0) + qty, size: newSize };
      return next;
    });
  };

  const cartCount = useMemo(() => Object.values(items).reduce((sum, it) => sum + (it.qty || 0), 0), [items]);

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, removeItems, clearCart, updateQty, updateSize, cartCount }),
    [items, cartCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
