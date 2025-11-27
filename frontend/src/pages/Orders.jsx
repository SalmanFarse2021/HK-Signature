import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth:user')); } catch { return null; }
  });

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  const userId = user?._id || user?.id || user?.email || 'guest';
  const [orders, setOrders] = useState(() => {
    try {
      const raw = localStorage.getItem(`orders:v1:${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const refresh = () => {
    try {
      const raw = localStorage.getItem(`orders:v1:${userId}`);
      setOrders(raw ? JSON.parse(raw) : []);
    } catch { setOrders([]); }
  };

  const payRemaining = (orderId) => {
    const next = orders.map((o) => {
      if (o.id !== orderId) return o;
      const updated = { ...o, remaining: 0, paidNow: o.total, status: 'paid' };
      return updated;
    });
    setOrders(next);
    try {
      localStorage.setItem(`orders:v1:${userId}`, JSON.stringify(next));
      const allRaw = localStorage.getItem('orders:v1');
      const all = allRaw ? JSON.parse(allRaw) : [];
      const idx = all.findIndex((o) => o.id === orderId);
      if (idx >= 0) { all[idx] = next.find((o) => o.id === orderId) || all[idx]; localStorage.setItem('orders:v1', JSON.stringify(all)); }
    } catch { }
    alert('Payment stub: remaining balance paid.');
  };

  if (!user) return null;

  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">My Orders</h1>
          <button onClick={refresh} className="text-sm text-gray-700 hover:text-gray-900">Refresh</button>
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 text-sm text-gray-700">
            No orders yet. <Link className="text-gray-900 hover:underline" to="/collection">Start shopping →</Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-gray-600">Order <span className="font-medium text-gray-900">#{o.id.slice(-6)}</span></div>
                  <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm text-gray-700">Status: <span className="font-medium text-gray-900 capitalize">{o.status.replace('_', ' ')}</span></div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {o.items.slice(0, 8).map((it) => (
                    <Link key={it.key} to={`/products/${it.id}`} className="flex items-center gap-2 rounded border border-gray-200 p-2 hover:bg-gray-50">
                      <img src={it.image} alt="" className="h-12 w-10 rounded object-cover" />
                      <div>
                        <p className="text-xs font-medium text-gray-900 line-clamp-1">{it.name}</p>
                        <p className="text-[11px] text-gray-600">{it.size ? `Size: ${it.size} • ` : ''}Qty: {it.qty}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="text-gray-700">Total: <span className="font-semibold text-gray-900">৳ {o.total.toFixed(2)}</span> • Paid: ৳ {o.paidNow.toFixed(2)} {o.remaining > 0 ? <>• Due: <span className="text-amber-700">৳ {o.remaining.toFixed(2)}</span></> : null}</div>
                  {o.paymentMethod === 'cod' && o.remaining > 0 ? (
                    <button onClick={() => payRemaining(o.id)} className="rounded-md bg-black px-3 py-1.5 text-white hover:bg-gray-900">Pay remaining</button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default Orders;
