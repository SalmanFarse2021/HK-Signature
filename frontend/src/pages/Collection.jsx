import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

const CATEGORIES = ['Men', 'Women', 'Kids', 'Couple', 'Handcrafts'];

const sortProducts = (list, sort) => {
  switch (sort) {
    case 'new':
      return [...list].sort((a, b) => (b.date || 0) - (a.date || 0));
    case 'price_low':
      return [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price_high':
      return [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    default:
      return list;
  }
};

const Collection = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = params.get('category') || 'All';
  const currentSub = params.get('sub') || 'All';
  const bestseller = params.get('bestseller') === 'true';
  const sort = params.get('sort') || 'default';
  const q = (params.get('q') || '').trim().toLowerCase();

  const { products } = useProducts();
  const subCategories = useMemo(() => {
    const set = new Set(products.map((p) => p.subCategory).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (currentCategory !== 'All') {
      list = list.filter((p) => p.category === currentCategory);
    }
    if (currentSub !== 'All') {
      list = list.filter((p) => p.subCategory === currentSub);
    }
    if (bestseller) {
      list = list.filter((p) => p.bestseller);
    }
    if (q) {
      const terms = (q.match(/[a-z0-9]+/gi) || []).map((t) => t.toLowerCase());
      list = list.filter((p) => {
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
    }
    return sortProducts(list, sort);
  }, [products, currentCategory, currentSub, bestseller, sort, q]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === null || value === '' || value === 'All') next.delete(key);
    else next.set(key, value);
    navigate({ search: next.toString() }, { replace: false });
  };

  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Collection</h1>
            <p className="mt-1 text-sm text-gray-600">Browse all products and refine with filters.</p>
            {q && (
              <p className="mt-1 text-xs text-gray-500">Search: “{params.get('q')}”</p>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs text-gray-600">Sort</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/30"
            >
              <option value="default">Default</option>
              <option value="new">New arrivals</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setParam('category', 'All')}
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs sm:text-sm ${
                currentCategory === 'All'
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setParam('category', c)}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs sm:text-sm ${
                  currentCategory === c
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Subcategory + Bestseller */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="sub" className="text-xs text-gray-600">Type</label>
              <select
                id="sub"
                value={currentSub}
                onChange={(e) => setParam('sub', e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/30"
              >
                {subCategories.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={bestseller}
                onChange={(e) => setParam('bestseller', e.target.checked ? 'true' : undefined)}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black/30"
              />
              Top Selling
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-600">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Collection;
