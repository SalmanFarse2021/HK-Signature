import React, { useMemo } from 'react';
import ProductCard from './ProductCard.jsx';
import { useProducts } from '../context/ProductsContext.jsx';

const tokenize = (s = '') => (s.toLowerCase().match(/[a-z0-9]+/gi) || []).filter(w => w.length > 2);

const RelatedProduct = ({ current }) => {
  const related = useMemo(() => {
    if (!current) return [];
    const nameTokens = new Set(tokenize(current.name));

  const { products } = useProducts();
  const scored = products
      .filter((p) => p._id !== current._id)
      .map((p) => {
        let score = 0;
        if (p.category && current.category && p.category === current.category) score += 3;
        if (p.subCategory && current.subCategory && p.subCategory === current.subCategory) score += 5;
        // name similarity (common tokens)
        const tokens = tokenize(p.name);
        let common = 0;
        for (const t of tokens) if (nameTokens.has(t)) common += 1;
        score += Math.min(3, common); // cap name similarity contribution

        // prefer newer items slightly
        const date = p.date || 0;
        return { p, score, date };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.date || 0) - (a.date || 0);
      })
      .map((x) => x.p);

    // Ensure we always show some results; if all scores are zero, fallback to same category or newest
    const top = scored.slice(0, 8);
    if (top.length >= 8) return top;
  const fill = products
      .filter((p) => p._id !== current._id && (!current.category || p.category === current.category))
      .slice(0, 8 - top.length);
    return [...top, ...fill].slice(0, 8);
  }, [current]);

  if (!related.length) return null;

  return (
    <div className="mt-14">
      <h3 className="text-lg font-semibold text-gray-900">Related products</h3>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {related.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProduct;
