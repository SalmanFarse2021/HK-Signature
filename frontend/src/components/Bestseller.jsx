import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import ProductCard from './ProductCard.jsx';

const Bestseller = () => {
  const { products } = useProducts();
  const bestsellers = useMemo(
    () => products.filter((p) => p?.bestseller).slice(0, 8),
    [products]
  );

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Top Selling</h2>
            <p className="text-sm text-gray-600 mt-1">Our most-loved picks right now</p>
          </div>
          <Link to="/collection?bestseller=true" className="hidden sm:inline-flex text-sm font-medium text-gray-700 hover:text-gray-900">View all</Link>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellers.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link to="/collection?bestseller=true" className="inline-flex text-sm font-medium text-gray-700 hover:text-gray-900">View all</Link>
        </div>
      </div>
    </section>
  );
};

export default Bestseller;
