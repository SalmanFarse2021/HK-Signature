import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const imgs = product.image || [];
  const first = imgs[0];
  const second = imgs[1];
  // Avoid hover swap flash by waiting until the second image is loaded
  const [secondLoaded, setSecondLoaded] = useState(!(second && second !== first));

  const onAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  // 3D tilt effect
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)' });

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5; // -0.5 .. 0.5
    const py = y / rect.height - 0.5;
    const max = 10; // max tilt degrees
    const rx = (-py * max).toFixed(2);
    const ry = (px * max).toFixed(2);
    setTilt({ transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)` });
  };

  const onLeave = () => {
    setTilt({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)' });
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="transform-gpu transition-transform duration-150 ease-out will-change-transform"
        style={tilt}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200">
          <img
            src={first}
            alt={product.name}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300${secondLoaded ? ' group-hover:opacity-0' : ''}`}
            loading="lazy"
            decoding="async"
          />
          <img
            src={second || first}
            alt={product.name}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 opacity-0${secondLoaded ? ' group-hover:opacity-100' : ''}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setSecondLoaded(true)}
          />
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
          <p className="text-sm text-gray-600">৳ {product.price}</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
