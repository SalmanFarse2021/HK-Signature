import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../assets/assets.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import RelatedProduct from '../components/RelatedProduct.jsx';

const toRatingMeta = (id = '') => {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  const rating = Math.round((3.8 + ((sum % 13) / 10)) * 10) / 10; // 3.8 – 5.0
  const reviews = 24 + (sum % 276); // 24 – 299
  return { rating: Math.min(rating, 5), reviews };
};

const Stars = ({ value }) => {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  const total = 5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => {
        if (i < full) {
          return <img key={i} src={assets.star_icon} alt="★" className="h-4 w-4" />;
        }
        if (i === full && hasHalf) {
          return (
            <div key={i} className="relative h-4 w-4">
              <img src={assets.star_icon} alt="★" className="absolute inset-0 h-4 w-4" style={{ clipPath: 'inset(0 50% 0 0)' }} />
              <img src={assets.star_dull_icon} alt="☆" className="absolute inset-0 h-4 w-4" />
            </div>
          );
        }
        return <img key={i} src={assets.star_dull_icon} alt="☆" className="h-4 w-4" />;
      })}
    </div>
  );
};

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { products } = useProducts();
  const product = useMemo(() => products.find((p) => p._id === productId), [productId, products]);

  const srcImages = product?.image || [];
  const images = useMemo(() => {
    if (srcImages.length >= 4) return srcImages.slice(0, 4);
    if (srcImages.length === 0) return [];
    const out = [];
    while (out.length < 4) out.push(srcImages[out.length % srcImages.length]);
    return out;
  }, [srcImages]);
  const [imgIndex, setImgIndex] = useState(0);
  const sizes = product?.sizes || [];
  const [size, setSize] = useState(sizes[0] || null);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-700">Product not found.</p>
      </main>
    );
  }

  const meta = toRatingMeta(product._id);
  const storageKey = `reviews:v1:${product._id}`;
  const [reviews, setReviews] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(reviews)); } catch { }
  }, [reviews, storageKey]);

  const communityAvg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10
    : null;
  const displayRating = communityAvg || meta.rating;

  const onAdd = () => {
    addToCart(product, Math.max(1, qty | 0), { size: size || undefined });
  };


  const more = useMemo(() => products.filter((p) => p._id !== product._id).slice(0, 4), [product._id, products]);

  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="flex gap-3">
              {/* Thumbnails on left */}
              <div className="flex w-16 sm:w-20 flex-col gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImgIndex(i)}
                    onMouseEnter={() => setImgIndex(i)}
                    className={`aspect-[4/5] overflow-hidden rounded-lg border ${i === imgIndex ? 'border-gray-900' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    aria-current={i === imgIndex}
                  >
                    <img src={src} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              {/* Main image */}
              <div className="flex-1">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
                  <img src={images[imgIndex] || images[0]} alt={product.name} className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <Stars value={displayRating} />
              <span className="text-xs text-gray-600">{displayRating} • {communityAvg ? reviews.length : meta.reviews} reviews</span>
            </div>

            <p className="mt-4 text-2xl font-semibold text-gray-900">৳ {product.price}</p>

            <div className="mt-4 flex items-center gap-2">
              {product.category && (
                <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-1 text-xs text-gray-700">
                  {product.category}
                </span>
              )}
              {product.subCategory && (
                <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-1 text-xs text-gray-700">
                  {product.subCategory}
                </span>
              )}
              {product.bestseller && (
                <span className="inline-flex items-center rounded-full bg-black px-2.5 py-1 text-xs text-white">
                  Top Selling
                </span>
              )}
            </div>

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-900">Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm border ${size === s ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-100'
                        }`}
                      aria-pressed={size === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-900">Quantity</p>
              <div className="mt-2 inline-flex items-center rounded-md border border-gray-300">
                <button type="button" className="px-3 py-2 text-gray-700" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  className="w-12 text-center py-2 text-sm focus:outline-none"
                />
                <button type="button" className="px-3 py-2 text-gray-700" onClick={() => setQty((q) => q + 1)} aria-label="Increase">＋</button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = `Hi, I'm interested in this product:\n\n*${product.name}*\nPrice: ৳ ${product.price}\nSize: ${size || 'N/A'}\nQty: ${qty}\n\nLink: ${window.location.href}`;
                  const url = `https://api.whatsapp.com/send?phone=16823726476&text=${encodeURIComponent(text)}`;
                  window.open(url, '_blank');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#20bd5a] transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                WhatsApp
              </button>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-gray-900">Product Details</h2>
              <p className="mt-2 text-sm text-gray-700 max-w-prose">{product.description}</p>
              <ul className="mt-3 text-xs text-gray-600 list-disc pl-4 space-y-1">
                <li>30‑day easy exchange</li>
                <li>Secure checkout</li>
                <li>Fast shipping</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-14 grid md:grid-cols-2 gap-10">
          {/* Write a review */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Write a review</h3>
            <ReviewForm onAdd={(r) => setReviews((prev) => [r, ...prev])} />
          </div>
          {/* List reviews */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer reviews</h3>
            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">No reviews yet. Be the first to review this item.</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {reviews.map((r, idx) => (
                  <li key={r.id || idx} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Stars value={r.rating} />
                        <span className="text-xs text-gray-600">{Number(r.rating).toFixed(1)}</span>
                      </div>
                      <span className="text-[11px] text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.name && <p className="mt-2 text-sm font-medium text-gray-900">{r.name}</p>}
                    {r.text && <p className="mt-1 text-sm text-gray-700">{r.text}</p>}
                    {r.photo && (
                      <img src={r.photo} alt="Customer upload" className="mt-3 h-28 w-28 rounded object-cover border border-gray-200" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Related products */}
        <RelatedProduct current={product} />
      </div>
    </main >
  );
};

export default Product;

// Review form component
const ReviewForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(null); // data URL

  const onFile = async (file) => {
    if (!file) { setPhoto(null); return; }
    if (!file.type.startsWith('image/')) return;
    try {
      const dataUrl = await fileToDataURL(file);
      setPhoto(dataUrl);
    } catch { }
  };

  const submit = (e) => {
    e.preventDefault();
    const r = {
      id: cryptoRandomId(),
      name: name.trim(),
      rating: Math.max(1, Math.min(5, Number(rating) || 1)),
      text: text.trim(),
      createdAt: Date.now(),
      photo: photo || null,
    };
    onAdd?.(r);
    setName(''); setRating(5); setText(''); setPhoto(null);
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-900">Rating</label>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900">Name (optional)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900">Review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts (optional)"
          rows={4}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900">Add a photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files && e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-50"
        />
        {photo && (
          <div className="mt-2 flex items-center gap-2">
            <img src={photo} alt="Selected review" className="h-16 w-16 rounded object-cover border border-gray-200" />
            <button type="button" onClick={() => setPhoto(null)} className="text-xs text-gray-600 hover:text-gray-900">Remove</button>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
      >
        Submit review
      </button>
    </form>
  );
};

const StarInput = ({ value = 5, onChange }) => {
  return (
    <div className="mt-1 flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const v = i + 1;
        const active = v <= value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange?.(v)}
            className="p-0.5"
            aria-label={`${v} star${v > 1 ? 's' : ''}`}
          >
            <img src={active ? assets.star_icon : assets.star_dull_icon} alt={active ? '★' : '☆'} className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
};

const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const cryptoRandomId = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(4);
    crypto.getRandomValues(buf);
    return Array.from(buf).map((n) => n.toString(16)).join('');
  }
  return String(Date.now()) + Math.random().toString(16).slice(2);
};
