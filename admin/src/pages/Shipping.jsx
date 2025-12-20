import { useEffect, useState } from 'react';
import { getShipping, saveShipping, quoteShipping } from '../api/client.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MethodRow({ m, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-7 gap-2 items-center">
      <input className="input" placeholder="code" value={m.code} onChange={(e) => onChange({ ...m, code: e.target.value })} />
      <input className="input" placeholder="label" value={m.label} onChange={(e) => onChange({ ...m, label: e.target.value })} />
      <input className="input" type="number" placeholder="base" value={m.baseRate} onChange={(e) => onChange({ ...m, baseRate: Number(e.target.value) })} />
      <input className="input" type="number" placeholder="perKg" value={m.perKg} onChange={(e) => onChange({ ...m, perKg: Number(e.target.value) })} />
      <input className="input" type="number" placeholder="freeOver" value={m.freeOver} onChange={(e) => onChange({ ...m, freeOver: Number(e.target.value) })} />
      <input className="input" type="number" placeholder="minDays" value={m.estimatedMinDays} onChange={(e) => onChange({ ...m, estimatedMinDays: Number(e.target.value) })} />
      <input className="input" type="number" placeholder="maxDays" value={m.estimatedMaxDays} onChange={(e) => onChange({ ...m, estimatedMaxDays: Number(e.target.value) })} />
      <button className="btn-outline col-span-7 sm:col-span-1" onClick={onRemove}>Remove</button>
    </div>
  );
}

export default function Shipping() {
  const [settings, setSettings] = useState({ carriers: [], zones: [] });
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [qform, setQform] = useState({ country: '', state: '', method: 'standard', weight: '1', subtotal: '0' });

  async function load() {
    setLoading(true);
    try {
      const res = await getShipping();
      setSettings(res?.settings || { carriers: [], zones: [] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load settings');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function onSave() {
    try {
      await saveShipping(settings);
      toast.success('Shipping settings saved');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    }
  }

  async function onQuote() {
    try { const res = await quoteShipping(qform); setQuote(res); } catch { toast.error('Quote failed'); }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      <div>
        <h1 className="text-2xl font-semibold">Shipping & Delivery</h1>
        <p className="text-sm text-gray-600">Manage zones, carriers, rates and estimates</p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Carriers</h2>
          <button className="btn-outline" onClick={() => setSettings((s) => ({ ...s, carriers: [...s.carriers, { name: '', code: '', trackingUrl: '' }] }))}>Add Carrier</button>
        </div>
        <div className="mt-2 space-y-2">
          {settings.carriers.map((c, idx) => (
            <div key={idx} className="grid md:grid-cols-4 gap-2 items-center">
              <input className="input" placeholder="Name" value={c.name} onChange={(e) => setSettings((s) => { const arr = [...s.carriers]; arr[idx] = { ...arr[idx], name: e.target.value }; return { ...s, carriers: arr }; })} />
              <input className="input" placeholder="Code" value={c.code} onChange={(e) => setSettings((s) => { const arr = [...s.carriers]; arr[idx] = { ...arr[idx], code: e.target.value }; return { ...s, carriers: arr }; })} />
              <input className="input md:col-span-2" placeholder="Tracking URL (use {tracking})" value={c.trackingUrl} onChange={(e) => setSettings((s) => { const arr = [...s.carriers]; arr[idx] = { ...arr[idx], trackingUrl: e.target.value }; return { ...s, carriers: arr }; })} />
              <button className="btn-outline" onClick={() => setSettings((s) => ({ ...s, carriers: s.carriers.filter((_, i) => i !== idx) }))}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Zones</h2>
          <button className="btn-outline" onClick={() => setSettings((s) => ({ ...s, zones: [...s.zones, { name: '', countries: [], regions: [], methods: [] }] }))}>Add Zone</button>
        </div>
        <div className="mt-2 space-y-4">
          {settings.zones.map((z, zi) => (
            <div key={zi} className="border rounded p-3 space-y-2">
              <div className="grid md:grid-cols-3 gap-2 items-center">
                <input className="input" placeholder="Zone name" value={z.name} onChange={(e) => setSettings((s) => { const arr = [...s.zones]; arr[zi] = { ...arr[zi], name: e.target.value }; return { ...s, zones: arr }; })} />
                <input className="input" placeholder="Countries (ISO, comma or * for all)" value={(z.countries || []).join(', ')} onChange={(e) => setSettings((s) => { const arr = [...s.zones]; arr[zi] = { ...arr[zi], countries: e.target.value.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) }; return { ...s, zones: arr }; })} />
                <input className="input" placeholder="Regions (optional)" value={(z.regions || []).join(', ')} onChange={(e) => setSettings((s) => { const arr = [...s.zones]; arr[zi] = { ...arr[zi], regions: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }; return { ...s, zones: arr }; })} />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Methods</h3>
                <button className="btn-outline" onClick={() => setSettings((s) => { const arr = [...s.zones]; arr[zi] = { ...arr[zi], methods: [...(arr[zi].methods || []), { code: 'standard', label: 'Standard', baseRate: 0, perKg: 0, freeOver: 0, estimatedMinDays: 3, estimatedMaxDays: 7 }] }; return { ...s, zones: arr }; })}>Add Method</button>
              </div>
              <div className="space-y-2">
                {(z.methods || []).map((m, mi) => (
                  <MethodRow key={mi} m={m} onChange={(nm) => setSettings((s) => { const zones = [...s.zones]; const ms = [...(zones[zi].methods || [])]; ms[mi] = nm; zones[zi] = { ...zones[zi], methods: ms }; return { ...s, zones }; })} onRemove={() => setSettings((s) => { const zones = [...s.zones]; zones[zi] = { ...zones[zi], methods: (zones[zi].methods || []).filter((_, i) => i !== mi) }; return { ...s, zones }; })} />
                ))}
              </div>
              <div className="text-right">
                <button className="btn-outline" onClick={() => setSettings((s) => ({ ...s, zones: s.zones.filter((_, i) => i !== zi) }))}>Remove Zone</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-semibold">Quote Test</h2>
        <div className="mt-2 grid md:grid-cols-5 gap-2">
          <input className="input" placeholder="Country (ISO)" value={qform.country} onChange={(e) => setQform((f) => ({ ...f, country: e.target.value }))} />
          <input className="input" placeholder="State/Region" value={qform.state} onChange={(e) => setQform((f) => ({ ...f, state: e.target.value }))} />
          <input className="input" placeholder="Method" value={qform.method} onChange={(e) => setQform((f) => ({ ...f, method: e.target.value }))} />
          <input className="input" type="number" step="0.01" placeholder="Weight (kg)" value={qform.weight} onChange={(e) => setQform((f) => ({ ...f, weight: e.target.value }))} />
          <input className="input" type="number" step="0.01" placeholder="Subtotal" value={qform.subtotal} onChange={(e) => setQform((f) => ({ ...f, subtotal: e.target.value }))} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button className="btn-outline" onClick={onQuote}>Get Quote</button>
          {quote && <div className="text-sm text-gray-700">Rate: <span className="font-semibold">${quote.price.toFixed(2)}</span> • ETA: {quote.eta.minDays}-{quote.eta.maxDays} days (Zone: {quote.zone})</div>}
        </div>
      </div>

      <div>
        <button className="btn-primary" onClick={onSave}>Save Settings</button>
      </div>
    </div>
  );
}

