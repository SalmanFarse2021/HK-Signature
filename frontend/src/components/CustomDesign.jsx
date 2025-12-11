import React, { useMemo, useState } from 'react';
import { apiUrl } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      price: 2500,
      image: [img],
      category,
      subCategory,
      sizes: SIZES,
    };
    addToCart(product, 1, { size });
    toast.success('Custom design added to cart!');
    navigate('/cart');
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">


      {!img ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-1">
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
      ) : (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 animate-in fade-in slide-in-from-top-4 duration-500 relative">
          <button
            onClick={() => setImg(null)}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 transition-colors shadow-sm z-10"
            title="Cancel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h4 className="text-sm font-semibold text-gray-900 mb-3">Your Design</h4>
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
            <img src={img} alt="Generated design" className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{category} • {subCategory}</span>
              <span>Size {size}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onGenerate}
                className="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Regenerate
              </button>
              <button
                onClick={onAddToCart}
                className="flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 shadow-sm"
              >
                Add to Cart — ৳ 2500
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
