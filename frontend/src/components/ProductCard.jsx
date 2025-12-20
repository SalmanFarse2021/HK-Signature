import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const imgs = product.image || [];
  const first = imgs[0];

  const [isAdded, setIsAdded] = useState(false);

  const onAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // 3D tilt effect
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)' });

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    // Subtle tilt
    const rx = (-py * 8).toFixed(2);
    const ry = (px * 8).toFixed(2);

    setTilt({
      transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`,
      transition: 'none'
    });
  };

  const onLeave = () => {
    setTilt({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
      transition: 'transform 0.5s ease-out'
    });
  };

  return (
    <Link to={`/products/${product._id}`} className="group relative block h-full">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={tilt}
        className="relative h-full transition-all duration-200 ease-out transform-gpu"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 rounded-xl shadow-md group-hover:shadow-2xl transition-shadow duration-300">
          <img
            src={first}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            loading="lazy"
          />
        </div>

        <div className="mt-4 space-y-2 text-center transform transition-transform duration-300 group-hover:translate-y-1">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors font-serif tracking-wide">{product.name}</h3>
          <p className="text-xs font-bold text-gray-500 tracking-wider">৳ {product.price}</p>

          <button
            onClick={onAdd}
            disabled={isAdded}
            className={`w-full mt-2 py-2 border text-xs font-bold uppercase tracking-widest transition-colors rounded-md ${isAdded
              ? 'bg-green-600 text-white border-green-600'
              : 'border-gray-200 hover:bg-black hover:text-white hover:border-black'
              }`}
          >
            {isAdded ? 'Added to cart!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
