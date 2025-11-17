import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import ProductCard from './ProductCard.jsx';

const LatestCollection = () => {
  const { products } = useProducts();
  const latest = useMemo(() => {
    return [...products]
      .filter(Boolean)
      .sort((a, b) => (b.date || 0) - (a.date || 0))
      .slice(0, 8);
  }, [products]);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Latest Collection</h2>
            <p className="text-sm text-gray-600 mt-1">Fresh arrivals picked just for you</p>
          </div>
          <Link to="/collection?sort=new" className="hidden sm:inline-flex text-sm font-medium text-gray-700 hover:text-gray-900">View all</Link>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {latest.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link to="/collection?sort=new" className="inline-flex text-sm font-medium text-gray-700 hover:text-gray-900">View all</Link>
        </div>
      </div>
    </section>
  );
};

export default LatestCollection;
