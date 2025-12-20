import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCustomerProfile, updateCustomerProfile, notifyCustomer, blacklistCustomer } from '../api/client.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SEGMENTS = ['regular', 'vip', 'inactive', 'blacklisted'];

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });

  async function load() {
    setLoading(true);
    try {
      const res = await getCustomerProfile(id);
      setCustomer(res?.customer);
      setStats(res?.stats);
      setOrders(res?.orders || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onUpdate(payload) {
    try { await updateCustomerProfile(id, payload); toast.success('Updated'); load(); } catch { toast.error('Update failed'); }
  }

  async function onNotify() {
    if (!emailForm.subject || !emailForm.message) return toast.error('Subject and message required');
    try { await notifyCustomer(id, emailForm); toast.success('Email sent'); setEmailForm({ subject: '', message: '' }); } catch { toast.error('Send failed'); }
  }

  async function onBlacklist() {
    try { await blacklistCustomer(id); toast.success('Blacklisted'); load(); } catch { toast.error('Failed'); }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!customer) return <div className="p-6">Customer not found</div>;

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{customer.name || customer.email}</h1>
        <button className="btn-outline" onClick={() => navigate('/customers')}>Back</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 space-y-2">
          <div className="text-sm">Email: <span className="font-medium">{customer.email}</span></div>
          <div className="text-sm">Segment:
            <select value={customer.segment || 'regular'} onChange={(e) => onUpdate({ segment: e.target.value })} className="ml-2 border rounded px-2 py-1 capitalize">
              {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="text-sm">Suspended: <button onClick={() => onUpdate({ isSuspended: !customer.isSuspended })} className="btn-outline ml-2">{customer.isSuspended ? 'Unsuspend' : 'Suspend'}</button></div>
          <div className="text-sm">Active: <button onClick={() => onUpdate({ isActive: !customer.isActive })} className="btn-outline ml-2">{customer.isActive ? 'Deactivate' : 'Activate'}</button></div>
          <div className="text-sm">Notes:</div>
          <textarea className="input h-24" defaultValue={customer.notes || ''} onBlur={(e) => onUpdate({ notes: e.target.value })} />
          <div>
            <button onClick={onBlacklist} className="btn-outline">Blacklist</button>
          </div>
        </div>
        <div className="card p-4">
          <h2 className="text-sm font-semibold">Spending</h2>
          <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-500">Total</dt><dd className="font-semibold">৳{(stats?.totalSpent || 0).toFixed(2)}</dd></div>
            <div><dt className="text-gray-500">Orders</dt><dd className="font-semibold">{stats?.orderCount || 0}</dd></div>
            <div><dt className="text-gray-500">Last order</dt><dd className="font-semibold">{stats?.lastOrderAt ? new Date(stats.lastOrderAt).toLocaleString() : '—'}</dd></div>
          </dl>
        </div>
        <div className="card p-4">
          <h2 className="text-sm font-semibold">Contact Customer</h2>
          <div className="mt-2 space-y-2">
            <input className="input" placeholder="Subject" value={emailForm.subject} onChange={(e) => setEmailForm((f) => ({ ...f, subject: e.target.value }))} />
            <textarea className="input h-28" placeholder="Message" value={emailForm.message} onChange={(e) => setEmailForm((f) => ({ ...f, message: e.target.value }))} />
            <button className="btn-primary" onClick={onNotify}>Send Email</button>
          </div>
        </div>
      </div>

      <div className="card overflow-auto">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <Link className="text-xs text-gray-600 hover:text-gray-900" to={`/orders?q=${encodeURIComponent(customer.email)}`}>View in Orders</Link>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-2">Order</th><th className="p-2">Date</th><th className="p-2">Total</th><th className="p-2">Status</th><th className="p-2">Payment</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td className="p-3" colSpan="5">No orders</td></tr>
            ) : orders.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-2 font-medium">{o.orderNumber}</td>
                <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="p-2">৳{(o.total || 0).toFixed(2)}</td>
                <td className="p-2 capitalize">{o.status}</td>
                <td className="p-2 capitalize">{o.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

