import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShip } from '../context/ShipContext.jsx';

const SearchOverlay = () => {
  const { isSearchOpen, closeSearch, query, setQuery, results } = useShip();
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeSearch();
    };
    if (isSearchOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/collection?q=${encodeURIComponent(q)}`);
      closeSearch();
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" onClick={closeSearch} />
      <div className="absolute inset-x-0 top-16 mx-auto max-w-2xl px-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <form onSubmit={onSubmit} className="p-3">
            <label htmlFor="site-search" className="sr-only">Search</label>
            <input
              id="site-search"
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30"
            />
          </form>
          {query && (
            <div className="max-h-80 overflow-auto divide-y divide-gray-100">
              {results.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-600">No results.</div>
              ) : (
                <>
                  {results.map((p) => (
                    <Link
                      key={p._id}
                      to={`/products/${p._id}`}
                      onClick={closeSearch}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                    >
                      <img src={p.image?.[0]} alt="" className="h-10 w-8 object-cover rounded" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-600">${p.price}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/collection?q=${encodeURIComponent(query.trim())}`);
                        closeSearch();
                      }}
                      className="w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      View all results
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
