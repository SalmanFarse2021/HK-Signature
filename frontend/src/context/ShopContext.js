import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { products } from '../assets/assets.js';

const ShipContext = createContext(null);

export const ShipProvider = ({ children }) => {
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
      // Match if at least one full word from the query exists in product text
      return terms.some((t) => wordSet.has(t));
    });
  }, [query]);

  const value = useMemo(
    () => ({
      isSearchOpen,
      openSearch,
      closeSearch,
      toggleSearch,
      query,
      setQuery,
      results,
    }),
    [isSearchOpen, query, results]
  );

  return React.createElement(ShipContext.Provider, { value }, children);
};

export const useShip = () => {
  const ctx = useContext(ShipContext);
  if (!ctx) throw new Error('useShip must be used within ShipProvider');
  return ctx;
};
