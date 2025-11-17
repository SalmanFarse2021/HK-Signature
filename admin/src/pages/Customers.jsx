import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCustomers, updateCustomerProfile } from '../api/client.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SEGMENTS = ['regular','vip','inactive','blacklisted'];

export default function Customers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [segment, setSegment] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  async function load() {
    setLoading(true);
    try {
      const res = await listCustomers({ page, limit, q, segment });
      setItems(res?.customers || []);
      setTotal(res?.pagination?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, segment]);

  const pages = useMemo(() => Math.max(1, Math.ceil(total/limit)), [total]);

  async function onUpdate(id, payload) {
    try {
      await updateCustomerProfile(id, payload);
      toast.success('Updated');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-gray-600">Manage user accounts and insights</p>
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search name/email" className="input" />
          <button onClick={()=> { setPage(1); load(); }} className="btn-outline">Search</button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={()=> setSegment('')} className={`btn-outline ${segment===''? 'bg-black text-white border-black' : ''}`}>All</button>
        {SEGMENTS.map((s)=> (
          <button key={s} onClick={()=> setSegment(s)} className={`btn-outline capitalize ${segment===s? 'bg-black text-white border-black' : ''}`}>{s}</button>
        ))}
      </div>

      <div className="card overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Segment</th>
              <th className="p-2">Orders</th>
              <th className="p-2">Total Spent</th>
              <th className="p-2">Last Order</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan="7">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3" colSpan="7">No customers</td></tr>
            ) : (
              items.map((u)=> (
                <tr key={u._id} className="border-t hover:bg-gray-50/50">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 capitalize">
                    <select value={u.segment || 'regular'} onChange={(e)=> onUpdate(u._id, { segment: e.target.value })} className="border rounded px-2 py-1">
                      {SEGMENTS.map((s)=> <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-2">{u.orderCount || 0}</td>
                  <td className="p-2">${(u.totalSpent || 0).toFixed(2)}</td>
                  <td className="p-2">{u.lastOrderAt ? new Date(u.lastOrderAt).toLocaleDateString() : '—'}</td>
                  <td className="p-2 text-right space-x-2">
                    <Link to={`/customers/${u._id}`} className="btn-outline">View</Link>
                    <button onClick={()=> onUpdate(u._id, { isSuspended: !u.isSuspended })} className="btn-outline">{u.isSuspended ? 'Unsuspend' : 'Suspend'}</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <button disabled={page<=1} onClick={()=> setPage((p)=> Math.max(1, p-1))} className="btn-outline disabled:opacity-50">Prev</button>
        <span>Page {page} / {pages}</span>
        <button disabled={page>=pages} onClick={()=> setPage((p)=> p+1)} className="btn-outline disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}

