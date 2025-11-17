import React, { useMemo, useState } from 'react';
import { apiUrl } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = {
  Men: ['Shirt', 'T-Shirt', 'Pants', 'Hoodie', 'Jacket'],
  Women: ['Saree', 'Dress', 'Top', 'Kurti', 'Lehenga'],
  Kids: ['T-Shirt', 'Shorts', 'Dress', 'Hoodie'],
  Couple: ['T-Shirt Set', 'Hoodies', 'Sweatshirts'],
  Handcrafts: ['Bags', 'Jewelry', 'Decor'],
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const PROMPT_EXAMPLE = 'e.g. earthy linen dress with minimal embroidery';

const AiSparkle = ({ className = '' }) => (
  <span
    className={`inline-flex text-lg font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm ${className}`}
    aria-hidden="true"
  >
    ✨
  </span>
);

export default function CustomDesign() {
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState(CATEGORIES['Men'][0]);
  const [size, setSize] = useState('M');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const subs = useMemo(() => CATEGORIES[category] || [], [category]);

  const onGenerate = async () => {
    setLoading(true);
    setError('');
    setImg(null);
    try {
      const res = await fetch(apiUrl('/api/custom/generate-image'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ prompt, category, subCategory }),
      });
      const data = await res.json();
      if (!res.ok || !data?.image?.url) throw new Error(data?.message || 'Generation failed');
      setImg(data.image.url);
      setShowModal(true);
    } catch (err) {
      setError(err.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const onAddToCart = () => {
    if (!img) return;
    const product = {
      _id: 'custom:' + Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: `${category} • ${subCategory} — Custom Design`,
      description: prompt,
      price: 49.0,
      image: [img],
      category,
      subCategory,
      sizes: SIZES,
    };
    addToCart(product, 1, { size });
    navigate('/cart');
  };

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <AiSparkle />
        <h3 className="text-lg font-semibold text-gray-900">Design your own</h3>
      </div>

      <div className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-gray-600">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubCategory(CATEGORIES[e.target.value][0]);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {Object.keys(CATEGORIES).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Subcategory</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {subs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-600">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder={PROMPT_EXAMPLE}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          onClick={onGenerate}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <AiSparkle />
          <span>{loading ? 'Generating…' : 'Generate image'}</span>
        </button>
      </div>

      {showModal && img && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 rounded-full border border-gray-200 p-1 text-gray-600 hover:bg-gray-100"
              aria-label="Close preview"
            >
              ×
            </button>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <img src={img} alt="Generated design" className="w-full rounded-lg object-cover" />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-gray-500">
                {category} · {subCategory} · Size {size}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <a
                  href={img}
                  download
                  className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Download
                </a>
                <button
                  onClick={onAddToCart}
                  className="rounded-md bg-black px-4 py-1.5 font-medium text-white hover:bg-gray-900"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setImg(null);
                  }}
                  className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
