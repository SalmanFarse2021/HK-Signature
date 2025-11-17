import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useShip } from '../context/ShipContext.jsx';
import CartTotal from '../components/CartTotal.jsx';

const Cart = () => {
  const { items, removeFromCart, updateQty, updateSize } = useCart();
  const { selectedKeys, toggleSelect, setAllSelected } = useShip();

  const entries = useMemo(() => Object.entries(items), [items]);

  if (entries.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-700">Your cart is empty.</p>
        <Link to="/collection" className="mt-3 inline-flex text-sm font-medium text-gray-700 hover:text-gray-900">Continue shopping →</Link>
      </main>
    );
  }

  const allKeys = entries.map(([k]) => k);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));

  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_360px] gap-8">
        <section>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Shopping Cart</h1>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={allSelected} onChange={(e) => setAllSelected(allKeys, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black/30" />
              Select all
            </label>
          </div>

          <ul className="mt-6 divide-y divide-gray-200">
            {entries.map(([key, entry]) => {
              const p = entry.product;
              const selected = selectedKeys.has(key);
              return (
                <li key={key} className="py-4 flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelect(key)}
                    className="mt-2 h-4 w-4 rounded border-gray-300 text-black focus:ring-black/30"
                  />
                  <img src={p.image?.[0]} alt="" className="h-24 w-20 rounded object-cover border border-gray-200" />
                  <div className="flex-1">
                    <Link to={`/products/${p._id}`} className="text-sm font-medium text-gray-900 hover:underline">
                      {p.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                      <span>${p.price}</span>
                      {entry.size && <span>• Size: {entry.size}</span>}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      {/* Size selector if available */}
                      {p.sizes && p.sizes.length > 0 && (
                        <select
                          value={entry.size || ''}
                          onChange={(e) => updateSize(key, e.target.value)}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                        >
                          {p.sizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}

                      {/* Quantity */}
                      <div className="inline-flex items-center rounded-md border border-gray-300">
                        <button type="button" className="px-2 py-1 text-gray-700" onClick={() => updateQty(key, Math.max(1, (entry.qty || 1) - 1))} aria-label="Decrease">−</button>
                        <input
                          type="number"
                          min={1}
                          value={entry.qty || 1}
                          onChange={(e) => updateQty(key, Math.max(1, parseInt(e.target.value || '1', 10)))}
                          className="w-12 text-center py-1 text-sm focus:outline-none"
                        />
                        <button type="button" className="px-2 py-1 text-gray-700" onClick={() => updateQty(key, (entry.qty || 1) + 1)} aria-label="Increase">＋</button>
                      </div>

                      <button type="button" onClick={() => removeFromCart(key)} className="text-sm text-red-600 hover:text-red-700">Remove</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <CartTotal />
      </div>
    </main>
  );
};

export default Cart;
