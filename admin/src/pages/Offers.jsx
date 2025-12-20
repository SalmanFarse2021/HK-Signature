import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { listCoupons, saveCouponApi, deleteCouponApi } from '../api/client.js';
import Promotions from './Promotions.jsx';

const empty = { code: '', type: 'percent', value: 10, startAt: '', endAt: '', minSubtotal: 0, maxUses: '', perCustomerLimit: '', active: true };

function OffersTab() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);


  async function load() {
    try { const res = await listCoupons(); setItems(res?.coupons || []); } catch { toast.error('Failed to load'); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    try {
      const payload = { ...form };
      if (!payload.code) return toast.error('Code required');
      payload.value = Number(payload.value || 0);
      payload.minSubtotal = Number(payload.minSubtotal || 0);
      payload.maxUses = payload.maxUses ? Number(payload.maxUses) : undefined;
      payload.perCustomerLimit = payload.perCustomerLimit ? Number(payload.perCustomerLimit) : undefined;
      await saveCouponApi(payload);
      toast.success('Saved');
      setForm(empty);
      load();
    } catch { toast.error('Save failed'); }
  }

  async function remove(id) { try { await deleteCouponApi(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); } }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      <div>
        <h1 className="text-2xl font-semibold">Offers</h1>
        <p className="text-sm text-gray-600">Create percentage or flat offers with validity windows</p>
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="text-sm font-semibold">New / Edit Offer</h2>
        <div className="grid md:grid-cols-6 gap-2">
          <input className="input" placeholder="CODE" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
          <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="percent">Percent %</option>
            <option value="flat">Flat</option>
          </select>
          <input className="input" type="number" placeholder="Value" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
          <input className="input" type="number" placeholder="Min Subtotal" value={form.minSubtotal} onChange={(e) => setForm((f) => ({ ...f, minSubtotal: e.target.value }))} />
          <input className="input" type="date" value={form.startAt} onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))} />
          <input className="input" type="date" value={form.endAt} onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))} />
          <input className="input" type="number" placeholder="Max uses" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} />
          <input className="input" type="number" placeholder="Per customer" value={form.perCustomerLimit} onChange={(e) => setForm((f) => ({ ...f, perCustomerLimit: e.target.value }))} />
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /> Active</label>
        </div>
        <div>
          <button
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 text-white font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 rounded-xl px-6 py-2.5"
            onClick={save}
          >
            {form._id ? 'Update' : 'Create'} Offer
          </button>
          {form._id && <button className="btn-outline ml-2 px-6 py-2.5 rounded-xl border-gray-200 hover:bg-gray-50" onClick={() => setForm(empty)}>Cancel Edit</button>}
        </div>
      </div>

      <div className="card overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="p-2">Code</th><th className="p-2">Type</th><th className="p-2">Value</th><th className="p-2">Window</th><th className="p-2">Min</th><th className="p-2">Uses</th><th className="p-2">Active</th><th className="p-2 text-right">Actions</th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-2 font-medium">{c.code}</td>
                <td className="p-2">{c.type}</td>
                <td className="p-2">{c.value}</td>
                <td className="p-2">{c.startAt ? new Date(c.startAt).toLocaleDateString() : '—'} → {c.endAt ? new Date(c.endAt).toLocaleDateString() : '—'}</td>
                <td className="p-2">৳{c.minSubtotal || 0}</td>
                <td className="p-2">{c.usedCount || 0}{c.maxUses ? `/` + c.maxUses : ''}</td>
                <td className="p-2">{c.active ? 'Yes' : 'No'}</td>
                <td className="p-2 text-right space-x-2">
                  <button className="btn-outline" onClick={() => setForm({ ...empty, ...c, startAt: c.startAt ? String(c.startAt).slice(0, 10) : '', endAt: c.endAt ? String(c.endAt).slice(0, 10) : '' })}>Edit</button>
                  <button className="btn-outline" onClick={() => remove(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Offers() {
  const [tab, setTab] = useState('offers');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setTab('offers')}
          className={`pb-3 text-sm font-medium transition-colors ${tab === 'offers'
            ? 'border-b-2 border-black text-black'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Offers
        </button>
        <button
          onClick={() => setTab('promotions')}
          className={`pb-3 text-sm font-medium transition-colors ${tab === 'promotions'
            ? 'border-b-2 border-black text-black'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Promotions
        </button>
      </div>

      {tab === 'offers' ? <OffersTab /> : <Promotions />}
    </div>
  );
}
