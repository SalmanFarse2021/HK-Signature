import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders, updateOrderStatus, exportOrders } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
      processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      shipped: 'bg-blue-50 text-blue-700 border-blue-200',
      delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return `inline-flex items-center px-2 py-0.5 rounded border text-xs capitalize ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`;
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-gray-600">Track and update order statuses</p>
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order/email" className="border rounded px-3 py-2 text-sm" />
          <button onClick={() => { setPage(1); load(); }} className="px-3 py-2 border rounded">Search</button>
          <button onClick={async()=>{ try{ const res=await exportOrders(); const blob=new Blob([res.data],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='orders.csv'; a.click(); URL.revokeObjectURL(url);}catch{}}} className="px-3 py-2 border rounded">Export CSV</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-sm text-gray-600">Filter:</label>
        <button onClick={() => setStatus('')} className={`px-3 py-1.5 rounded border ${status===''?'bg-black text-white border-black':'bg-white'}`}>All</button>
        {STATUS.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded border capitalize ${status===s?'bg-black text-white border-black':'bg-white'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur border rounded-xl overflow-auto shadow-sm">
        {loading ? (
          <div className="p-4"><Skeleton rows={6} /></div>
        ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left sticky top-0 z-10">
            <tr>
              <th className="p-2">Order</th>
              <th className="p-2">Date</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Total</th>
              <th className="p-2">Payment</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="p-3" colSpan="7">No orders</td></tr>
            ) : (
              items.map((o) => (
                <tr key={o._id} className="border-t hover:bg-gray-50/50">
                  <td className="p-2 font-medium">{o.orderNumber}</td>
                  <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="p-2">{o.customerEmail || 'Guest'}</td>
                  <td className="p-2">${(o.total || 0).toFixed(2)}</td>
                  <td className="p-2 capitalize">{o.paymentStatus || 'pending'}</td>
                  <td className="p-2">
                    <select value={o.status} onChange={(e) => onStatusChange(o._id, e.target.value)} className={badge(o.status)}>
                      {STATUS.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </td>
                  <td className="p-2 text-right">
                    <Link to={`/orders/${o._id}`} className="px-2 py-1 border rounded">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <span>Page {page} / {Math.max(1, Math.ceil(total/limit))}</span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
