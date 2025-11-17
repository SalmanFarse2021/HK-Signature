import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { products } from '../assets/assets.js';

const ShipContext = createContext(null);

export const ShipProvider = ({ children }) => {
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchOpen((v) => !v), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const terms = (q.match(/[a-z0-9]+/gi) || []).map((t) => t.toLowerCase());
    if (terms.length === 0) return [];
    return products.filter((p) => {
      const words = [
        (p.name || ''),
        (p.description || ''),
        (p.category || ''),
        (p.subCategory || ''),
      ]
        .join(' ')
        .toLowerCase()
        .match(/[a-z0-9]+/gi) || [];
      const wordSet = new Set(words);
      return terms.some((t) => wordSet.has(t));
    });
  }, [query]);

  // Checkout selection and shipping state
  const [selectedKeys, setSelectedKeys] = useState(() => {
    try {
      const raw = localStorage.getItem('checkout:selectedKeys');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    try { localStorage.setItem('checkout:selectedKeys', JSON.stringify(Array.from(selectedKeys))); } catch {}
  }, [selectedKeys]);

  const toggleSelect = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const setAllSelected = (keys, value) => {
    setSelectedKeys(() => (value ? new Set(keys) : new Set()));
  };
  const clearSelection = () => setSelectedKeys(new Set());

  const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard' | 'express'
  const [paymentMethod, setPaymentMethod] = useState(() => {
    try {
      return localStorage.getItem('checkout:paymentMethod') || 'stripe';
    } catch { return 'stripe'; }
  }); // 'stripe' | 'bkash' | 'cod'
  const [address, setAddress] = useState(() => {
    try {
      const raw = localStorage.getItem('checkout:address');
      return raw ? JSON.parse(raw) : { name: '', line1: '', line2: '', city: '', state: '', zip: '', country: '', phone: '' };
    } catch { return { name: '', line1: '', line2: '', city: '', state: '', zip: '', country: '', phone: '' }; }
  });
  useEffect(() => {
    try { localStorage.setItem('checkout:address', JSON.stringify(address)); } catch {}
  }, [address]);

  const setAddressField = (k, v) => setAddress((prev) => ({ ...prev, [k]: v }));
  useEffect(() => {
    try { localStorage.setItem('checkout:paymentMethod', paymentMethod); } catch {}
  }, [paymentMethod]);

  const value = useMemo(() => ({
    // search
    isSearchOpen, openSearch, closeSearch, toggleSearch, query, setQuery, results,
    // checkout
    selectedKeys, toggleSelect, setAllSelected, clearSelection,
    shippingMethod, setShippingMethod,
    paymentMethod, setPaymentMethod,
    address, setAddress, setAddressField,
  }), [isSearchOpen, query, results, selectedKeys, shippingMethod, paymentMethod, address]);

  return (
    <ShipContext.Provider value={value}>{children}</ShipContext.Provider>
  );
};

export const useShip = () => {
  const ctx = useContext(ShipContext);
  if (!ctx) throw new Error('useShip must be used within ShipProvider');
  return ctx;
};
