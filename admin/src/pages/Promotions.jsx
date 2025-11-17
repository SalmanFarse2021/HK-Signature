import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { listPromotionsApi, savePromotionApi, deletePromotionApi } from '../api/client.js';

const empty = { name: '', type: 'percent', value: 10, threshold: 0, startAt: '', endAt: '', active: true, flashSale: false, seasonalTag: '' };

export default function Promotions() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try { const res = await listPromotionsApi(); setItems(res?.promotions || []); } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  }
  useEffect(()=> { load(); }, []);

  async function save() {
    try {
      const payload = { ...form };
      if (!payload.name) return toast.error('Name required');
      payload.value = Number(payload.value||0);
      payload.threshold = Number(payload.threshold||0);
      await savePromotionApi(payload);
      toast.success('Saved');
      setForm(empty);
      load();
    } catch { toast.error('Save failed'); }
  }

  async function remove(id) { try { await deletePromotionApi(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); } }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      <div>
        <h1 className="text-2xl font-semibold">Promotions</h1>
        <p className="text-sm text-gray-600">Flash sales, seasonal offers, automatic discounts</p>
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="text-sm font-semibold">New / Edit Promotion</h2>
        <div className="grid md:grid-cols-6 gap-2">
          <input className="input" placeholder="Name" value={form.name} onChange={(e)=> setForm((f)=> ({...f, name: e.target.value}))} />
          <select className="input" value={form.type} onChange={(e)=> setForm((f)=> ({...f, type: e.target.value}))}>
            <option value="percent">Percent %</option>
            <option value="flat">Flat</option>
            <option value="bogo">Buy 1 Get 1</option>
            <option value="free_shipping_over">Free Shipping Over</option>
          </select>
          <input className="input" type="number" placeholder="Value / Threshold" value={form.value} onChange={(e)=> setForm((f)=> ({...f, value: e.target.value}))} />
          <input className="input" type="number" placeholder="Threshold (if needed)" value={form.threshold} onChange={(e)=> setForm((f)=> ({...f, threshold: e.target.value}))} />
          <input className="input" type="date" value={form.startAt} onChange={(e)=> setForm((f)=> ({...f, startAt: e.target.value}))} />
          <input className="input" type="date" value={form.endAt} onChange={(e)=> setForm((f)=> ({...f, endAt: e.target.value}))} />
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.active} onChange={(e)=> setForm((f)=> ({...f, active: e.target.checked}))} /> Active</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.flashSale} onChange={(e)=> setForm((f)=> ({...f, flashSale: e.target.checked}))} /> Flash Sale</label>
          <input className="input" placeholder="Seasonal Tag (e.g. BlackFriday)" value={form.seasonalTag} onChange={(e)=> setForm((f)=> ({...f, seasonalTag: e.target.value}))} />
        </div>
        <div>
          <button className="btn-primary" onClick={save}>{form._id ? 'Update' : 'Create'} Promotion</button>
          {form._id && <button className="btn-outline ml-2" onClick={()=> setForm(empty)}>Cancel Edit</button>}
        </div>
      </div>

      <div className="card overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="p-2">Name</th><th className="p-2">Type</th><th className="p-2">Value</th><th className="p-2">Window</th><th className="p-2">Active</th><th className="p-2">Tags</th><th className="p-2 text-right">Actions</th></tr></thead>
          <tbody>
            {items.map((p)=> (
              <tr key={p._id} className="border-t">
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2">{p.type}</td>
                <td className="p-2">{p.value}</td>
                <td className="p-2">{p.startAt? new Date(p.startAt).toLocaleDateString():'—'} → {p.endAt? new Date(p.endAt).toLocaleDateString():'—'}</td>
                <td className="p-2">{p.active? 'Yes':'No'}</td>
                <td className="p-2">{p.flashSale? 'Flash':''} {p.seasonalTag||''}</td>
                <td className="p-2 text-right space-x-2">
                  <button className="btn-outline" onClick={()=> setForm({ ...empty, ...p, startAt: p.startAt ? String(p.startAt).slice(0,10):'', endAt: p.endAt ? String(p.endAt).slice(0,10):'' })}>Edit</button>
                  <button className="btn-outline" onClick={()=> remove(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

