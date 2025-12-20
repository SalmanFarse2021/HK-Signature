import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders, updateOrderStatus, exportOrders } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Icon } from '../components/icons.jsx';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => { load(); }, [page, status]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ToastContainer position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track your customer orders.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => { try { const res = await exportOrders(); const blob = new Blob([res.data], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click(); URL.revokeObjectURL(url); } catch { } /* eslint-disable-line no-empty */ }}
            className="bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow text-gray-700 font-medium transition-all duration-200 rounded-xl px-4 py-2.5 flex items-center gap-2"
          >
            <Icon name="download" className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card-premium p-1.5 flex flex-col md:flex-row items-center gap-2 bg-white/50 backdrop-blur-sm border-gray-200/50">
        <div className="flex-1 w-full relative group">
          <Icon name="search" className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search by Order #, email, or name..."
            className="w-full pl-9 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-sm placeholder:text-gray-400"
          />
          <button onClick={load} className="absolute right-2 top-2 p-1 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
            <Icon name="search" className="w-4 h-4" />
          </button>
        </div>
        <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar px-2">
          <button
            onClick={() => setStatus('')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${status === '' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            All
          </button>
          {STATUS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${status === s ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card-premium overflow-hidden border-0 shadow-xl shadow-black/5 bg-white">
        {loading ? (
          <div className="p-8"><Skeleton rows={6} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead className="bg-gray-50/40">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total & Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode='wait'>
                  {items.length === 0 ? (
                    <tr><td className="px-6 py-12 text-center text-gray-500" colSpan="5">No orders found.</td></tr>
                  ) : (
                    items.map((o, i) => (
                      <motion.tr
                        key={o._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-3 overflow-hidden hover:space-x-1 transition-all">
                              {o.items?.slice(0, 3).map((it, idx) => (
                                <img
                                  key={idx}
                                  src={it.image || ''}
                                  alt={it.name}
                                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover bg-gray-100 shadow-sm"
                                  onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Product'; }}
                                />
                              ))}
                              {(o.items?.length || 0) > 3 && (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white text-[10px] font-bold text-gray-500">
                                  +{o.items.length - 3}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">#{o.orderNumber}</div>
                              <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{o.customerEmail || 'Guest User'}</div>
                          <div className="text-xs text-gray-500">View History</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">৳ {(o.total || 0).toFixed(2)}</div>
                          <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                          ${o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}
                        `}>
                            {o.paymentStatus === 'paid' ? <Icon name="check" className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            {o.paymentStatus || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative inline-block group/select">
                            <select
                              value={o.status}
                              onChange={(e) => onStatusChange(o._id, e.target.value)}
                              className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black/10 transition-all shadow-sm ${o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                o.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                  o.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                    'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                              {STATUS.map((s) => (<option key={s} value={s}>{s}</option>))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/orders/${o._id}`} className="btn-ghost py-1.5 px-3 text-xs text-gray-600 hover:text-black">
                            Details
                          </Link>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1">
        <div className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{items.length}</span> of <span className="font-bold text-gray-900">{total}</span> orders
        </div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-outline px-4 py-2 text-xs font-medium disabled:opacity-50">Previous</button>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-outline px-4 py-2 text-xs font-medium disabled:opacity-50">Next</button>
        </div>
      </div>
    </motion.div>
  );
}
