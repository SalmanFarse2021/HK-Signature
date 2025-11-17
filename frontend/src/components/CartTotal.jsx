import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useShip } from '../context/ShipContext.jsx';

const CartTotal = () => {
  const { items } = useCart();
  const { selectedKeys, shippingMethod, setShippingMethod } = useShip();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(null); // {code, discount}

  const { list, subtotal } = useMemo(() => {
    const keys = Object.keys(items);
    const useKeys = selectedKeys && selectedKeys.size > 0 ? keys.filter((k) => selectedKeys.has(k)) : [];
    const list = useKeys.map((k) => ({ key: k, ...items[k] })).filter(Boolean);
    const subtotal = list.reduce((s, it) => s + (it.product?.price || 0) * (it.qty || 1), 0);
    return { list, subtotal };
  }, [items, selectedKeys]);

  const ship = shippingMethod === 'express' ? 5 : 0;
  const discount = couponApplied ? Math.round(subtotal * couponApplied.discount) : 0;
  const total = Math.max(0, subtotal - discount) + ship;

  const applyCoupon = (e) => {
    e.preventDefault();
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    if (code === 'SAVE10') setCouponApplied({ code, discount: 0.1 });
    else if (code === 'FREESHIP') setCouponApplied({ code, discount: 0 });
    else setCouponApplied(null);
  };

  const proceed = () => {
    const payload = {
      items: list.map(({ key, product, qty, size }) => ({ key, id: product._id, name: product.name, price: product.price, qty, size, image: product.image?.[0] })),
      shippingMethod,
      coupon: couponApplied,
      subtotal,
      ship,
      discount,
      total,
      createdAt: Date.now(),
    };
    try { localStorage.setItem('checkout:current', JSON.stringify(payload)); } catch {}
    navigate('/place-orders');
  };

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd className="font-medium text-gray-900">${subtotal.toFixed(2)}</dd></div>
        {couponApplied && (
          <div className="flex justify-between"><dt className="text-gray-600">Discount ({couponApplied.code})</dt><dd className="font-medium text-emerald-600">- ${discount.toFixed(2)}</dd></div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Shipping</dt>
          <dd>
            <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black/30">
              <option value="standard">Standard (Free)</option>
              <option value="express">Express ($5)</option>
            </select>
          </dd>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2 text-base">
          <dt className="font-semibold text-gray-900">Total</dt><dd className="font-semibold text-gray-900">${total.toFixed(2)}</dd>
        </div>
      </dl>

      <form onSubmit={applyCoupon} className="mt-4 flex gap-2">
        <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
        <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900" type="submit">Apply</button>
      </form>

      <button disabled={list.length === 0} onClick={proceed} className="mt-4 w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed">
        Proceed to Payment
      </button>
    </aside>
  );
};

export default CartTotal;
