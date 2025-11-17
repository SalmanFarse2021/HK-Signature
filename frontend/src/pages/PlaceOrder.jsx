import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShip } from '../context/ShipContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { createOrder } from '../api/client.js';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { selectedKeys, shippingMethod, address, setAddressField, paymentMethod, setPaymentMethod } = useShip();

  const checkout = useMemo(() => {
    try {
      const raw = localStorage.getItem('checkout:current');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const list = useMemo(() => {
    if (checkout?.items?.length) return checkout.items;
    const keys = Object.keys(items);
    const useKeys = selectedKeys && selectedKeys.size > 0 ? keys.filter((k) => selectedKeys.has(k)) : [];
    return useKeys.map((k) => ({ key: k, ...items[k], id: items[k].product._id, name: items[k].product.name, price: items[k].product.price, image: items[k].product.image?.[0] }));
  }, [checkout, items, selectedKeys]);

  const subtotal = list.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
  const ship = (checkout?.shippingMethod || shippingMethod) === 'express' ? 5 : 0;
  const total = subtotal + ship - (checkout?.discount || 0);
  const method = checkout?.paymentMethod || paymentMethod;
  const payNow = method === 'cod' ? Math.min(50, total) : total;
  const remaining = Math.max(0, total - payNow);

  const pay = async () => {
    if (method === 'stripe') {
      alert(`Stripe payment stub for $${payNow.toFixed(2)}.`);
    } else if (method === 'bkash') {
      alert(`bKash payment stub for $${payNow.toFixed(2)}.`);
    } else {
      alert(`Cash on Delivery selected. Please pay $${payNow.toFixed(2)} now as advance. Remaining $${remaining.toFixed(2)} after delivery.`);
    }

    // Persist order to backend
    try {
      const user = (() => { try { return JSON.parse(localStorage.getItem('auth:user')); } catch { return null; } })();
      const payload = {
        userId: user?._id,
        customerEmail: user?.email,
        items: list.map((it) => ({ id: it.id, name: it.name, price: it.price, qty: it.qty, size: it.size, image: it.image })),
        address,
        shippingMethod: checkout?.shippingMethod || shippingMethod,
        paymentMethod: method,
        subtotal,
        ship,
        total,
        paidNow: payNow,
        remaining,
        status: 'pending',
        paymentStatus: method === 'cod' ? 'advance_paid' : 'paid',
      };
      await createOrder(payload);
    } catch (err) {
      // non-fatal for demo
    }

    navigate('/orders');
  };

  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-8">
        <section>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Checkout</h1>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900">Full name</label>
              <input value={address.name} onChange={(e) => setAddressField('name', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Address line 1</label>
              <input value={address.line1} onChange={(e) => setAddressField('line1', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Address line 2 (optional)</label>
              <input value={address.line2} onChange={(e) => setAddressField('line2', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900">City</label>
                <input value={address.city} onChange={(e) => setAddressField('city', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">State</label>
                <input value={address.state} onChange={(e) => setAddressField('state', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900">ZIP/Postal code</label>
                <input value={address.zip} onChange={(e) => setAddressField('zip', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Country</label>
                <input value={address.country} onChange={(e) => setAddressField('country', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Phone</label>
              <input value={address.phone} onChange={(e) => setAddressField('phone', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm self-start">
          <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {list.map((it) => (
              <li key={it.key} className="py-3 flex items-center gap-3">
                <img src={it.image} alt="" className="h-14 w-12 rounded object-cover border border-gray-200" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{it.name}</p>
                  <p className="text-xs text-gray-600">{it.size ? `Size: ${it.size} • ` : ''}Qty: {it.qty}</p>
                </div>
                <div className="text-sm text-gray-900">${(it.price * it.qty).toFixed(2)}</div>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd className="font-medium text-gray-900">${subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Shipping</dt><dd className="font-medium text-gray-900">${ship.toFixed(2)}</dd></div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base">
              <dt className="font-semibold text-gray-900">Total</dt><dd className="font-semibold text-gray-900">${total.toFixed(2)}</dd>
            </div>
          </dl>
          {/* Payment method */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">Payment method</p>
            <div className="mt-2 space-y-2 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input type="radio" name="pm" value="stripe" checked={method === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
                Stripe (card)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="pm" value="bkash" checked={method === 'bkash'} onChange={() => setPaymentMethod('bkash')} />
                bKash (mobile)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="pm" value="cod" checked={method === 'cod'} onChange={() => setPaymentMethod('cod')} />
                Cash on Delivery
              </label>
            </div>
            {method === 'cod' ? (
              <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-700 border border-amber-200">
                Pay $50 advance now to confirm your order. Remaining ${remaining.toFixed(2)} on delivery.
              </div>
            ) : null}
          </div>

          <button onClick={pay} className="mt-4 w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900">
            {method === 'cod' ? `Pay $${payNow.toFixed(2)} advance` : `Pay $${payNow.toFixed(2)} now`}
          </button>
        </aside>
      </div>
    </main>
  );
};

export default PlaceOrder;

// simple id
const cryptoId = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(4);
    crypto.getRandomValues(buf);
    return Array.from(buf).map((n) => n.toString(16)).join('');
  }
  return String(Date.now()) + Math.random().toString(16).slice(2);
};
