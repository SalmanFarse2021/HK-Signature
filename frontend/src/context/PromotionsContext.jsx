import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchPromotions } from '../api/client.js';

const PromotionsContext = createContext(null);

export default function PromotionsProvider({ children }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPromotions();
        if (alive) setPromotions(res?.promotions || []);
      } catch (err) {
        if (alive) setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const value = useMemo(() => ({ promotions, loading, error }), [promotions, loading, error]);
  return <PromotionsContext.Provider value={value}>{children}</PromotionsContext.Provider>;
}

export function usePromotions() {
  const ctx = useContext(PromotionsContext);
  if (!ctx) throw new Error('usePromotions must be used within PromotionsProvider');
  return ctx;
}

