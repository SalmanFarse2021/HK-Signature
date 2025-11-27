import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders, updateOrderStatus, exportOrders } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Icon } from '../components/icons.jsx';

const STATUS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  async function load() {
    setLoading(true);
    try {
      const res = await listOrders({ page, limit, status: status || undefined, q: q || undefined });
      setItems(res?.orders || []);
      setTotal(res?.pagination?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, status]);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  async function onStatusChange(id, next) {
    try {
      await updateOrderStatus(id, { status: next });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    }
  }

  const badge = (s) => {
    const map = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
      confirmed: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10',
      processing: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
      shipped: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
      delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset capitalize ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`;
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-gray-500 text-sm">Track and update order statuses</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Icon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order # or email..."
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
          </div>
          <button onClick={() => { setPage(1); load(); }} className="btn-primary py-2 px-4">Search</button>
          <button
            onClick={async () => { try { const res = await exportOrders(); const blob = new Blob([res.data], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click(); URL.revokeObjectURL(url); } catch { } }}
            className="btn-outline p-2"
            title="Export CSV"
          >
            <Icon name="download" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-1 pb-1 min-w-max">
          <button
            onClick={() => setStatus('')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${status === '' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            All Orders
          </button>
          {STATUS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${status === s ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6"><Skeleton rows={6} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.length === 0 ? (
                  <tr><td className="px-6 py-12 text-center text-gray-500" colSpan="7">No orders found matching your criteria.</td></tr>
                ) : (
                  items.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">#{o.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2 overflow-hidden">
                          {o.items?.slice(0, 4).map((it, idx) => (
                            <img
                              key={idx}
                              src={(() => {
                                const src = Array.isArray(it.image) ? it.image[0] : it.image;
                                if (!src) return '';
                                if (src.startsWith('http') || src.startsWith('data:')) return src;
                                const base = import.meta.env.VITE_API_BASE_URL || '';
                                return base.replace(/\/$/, '') + src;
                              })()}
                              alt={it.name}
                              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-gray-100"
                              title={it.name}
                              onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOWNhMzFmIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNmEyIDAgMDAtMi0ySDZhMiAyIDAgMDAtMiAydjEyYTIgMiAwIDAwMiAyeiIgLz48L3N2Zz4='; }}
                            />
                          ))}
                          {(o.items?.length || 0) > 4 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white text-[10px] font-medium text-gray-500">
                              +{o.items.length - 4}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{o.customerEmail || 'Guest'}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">৳ {(o.total || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}
                      `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${o.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {o.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select
                            value={o.status}
                            onChange={(e) => onStatusChange(o._id, e.target.value)}
                            className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black/5 ${o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              o.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            {STATUS.map((s) => (<option key={s} value={s}>{s}</option>))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/orders/${o._id}`} className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-black transition-colors">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{items.length}</span> of <span className="font-medium">{total}</span> orders
        </div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50">Previous</button>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
