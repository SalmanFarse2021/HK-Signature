import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail, updateOrderStatus, downloadInvoice, downloadLabel, updateRefund, updateReturn } from '../api/client.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const STATUS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: '', trackingNumber: '', carrier: '', paymentStatus: '', notify: false });
  const [refund, setRefund] = useState({ status: 'requested', amount: '' });
  const [retReq, setRetReq] = useState({ requested: false, reason: '' });
  const [previewImage, setPreviewImage] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await getOrderDetail(id);
      const o = res?.order;
      setOrder(o);
      setForm({ status: o?.status || 'pending', trackingNumber: o?.trackingNumber || '', carrier: o?.carrier || '', paymentStatus: o?.paymentStatus || 'pending', notify: false });
      setRefund({ status: o?.refundStatus || 'none', amount: o?.refundAmount || '' });
      setRetReq({ requested: !!o?.returnRequested, reason: o?.returnReason || '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateOrderStatus(id, form);
      toast.success('Updated');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
        <button onClick={() => navigate('/orders')} className="px-3 py-2 border rounded">Back</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Items</h2>
          <ul className="mt-2 divide-y">
            {order.items.map((it, idx) => (
              <li key={idx} className="py-2 flex items-center gap-3">
                {it.image ? (
                  <img
                    src={(() => {
                      const src = Array.isArray(it.image) ? it.image[0] : it.image;
                      if (!src) return '';
                      if (src.startsWith('http') || src.startsWith('data:')) return src;
                      const base = import.meta.env.VITE_API_BASE_URL || '';
                      return base.replace(/\/$/, '') + src;
                    })()}
                    alt={it.name}
                    className="h-16 w-14 cursor-pointer rounded border object-cover bg-gray-50 hover:opacity-90"
                    onClick={() => {
                      const src = Array.isArray(it.image) ? it.image[0] : it.image;
                      const base = import.meta.env.VITE_API_BASE_URL || '';
                      const full = (src && !src.startsWith('http') && !src.startsWith('data:')) ? (base.replace(/\/$/, '') + src) : src;
                      setPreviewImage(full);
                    }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                  />
                ) : null}
                <div className="h-16 w-14 bg-gray-100 rounded border flex items-center justify-center text-gray-400" style={{ display: it.image ? 'none' : 'flex' }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-gray-600">Qty {it.qty}{it.size ? ` • Size ${it.size}` : ''}</div>
                </div>
                <div className="text-sm">৳ {(it.price * it.qty).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/80 backdrop-blur border rounded-xl p-4 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold">Summary</h2>
          <div className="text-sm">Total: <span className="font-medium">৳ {(order.total || 0).toFixed(2)}</span></div>
          <div className="text-sm">Payment: <span className="capitalize">{order.paymentStatus}</span> via <span className="uppercase">{order.paymentMethod}</span></div>
          <div className="text-sm">Customer: {order.customerEmail || 'Guest'}</div>
          <div className="text-sm">Placed: {new Date(order.createdAt).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Shipping</h2>
          <div className="mt-2 text-sm">
            <div>{order.shippingAddress?.name}</div>
            <div>{order.shippingAddress?.line1}</div>
            {order.shippingAddress?.line2 ? <div>{order.shippingAddress.line2}</div> : null}
            <div>{order.shippingAddress?.city} {order.shippingAddress?.state} {order.shippingAddress?.zip}</div>
            <div>{order.shippingAddress?.country}</div>
            <div>{order.shippingAddress?.phone}</div>
          </div>
        </div>
        <form onSubmit={onSave} className="bg-white/80 backdrop-blur border rounded-xl p-4 space-y-3 md:col-span-2 shadow-sm">
          <h2 className="text-lg font-semibold">Tracking</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block text-sm">Status
              <select className="mt-1 w-full border rounded px-3 py-2" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block text-sm">Payment status
              <select className="mt-1 w-full border rounded px-3 py-2" value={form.paymentStatus} onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))}>
                {['pending', 'advance_paid', 'paid', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block text-sm">Tracking number
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.trackingNumber} onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))} />
            </label>
            <label className="block text-sm">Carrier
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.carrier} onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))} />
            </label>
            <label className="block text-sm">Estimated delivery (from)
              <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={order.estimatedDeliveryFrom ? String(order.estimatedDeliveryFrom).slice(0, 10) : ''} onChange={(e) => setForm((f) => ({ ...f, estimatedDeliveryFrom: e.target.value }))} />
            </label>
            <label className="block text-sm">Estimated delivery (to)
              <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={order.estimatedDeliveryTo ? String(order.estimatedDeliveryTo).slice(0, 10) : ''} onChange={(e) => setForm((f) => ({ ...f, estimatedDeliveryTo: e.target.value }))} />
            </label>
            <label className="inline-flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" checked={form.notify} onChange={(e) => setForm((f) => ({ ...f, notify: e.target.checked }))} /> Notify customer by email
            </label>
          </div>
          <div className="pt-2">
            <button disabled={saving} className="bg-black text-white rounded px-4 py-2">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Status history</h2>
        <ul className="mt-2 text-sm">
          {order.statusHistory?.map((h, idx) => (
            <li key={idx} className="py-1 flex items-center justify-between border-b last:border-0">
              <span className="capitalize">{h.status}</span>
              <span className="text-gray-600">{new Date(h.at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Invoice & Label</h3>
          <div className="mt-2 flex gap-2">
            <button onClick={async () => { try { const res = await downloadInvoice(id); const blob = new Blob([res.data], { type: 'application/pdf' }); const url = URL.createObjectURL(blob); window.open(url, '_blank'); } catch { toast.error('Failed to download'); } }} className="px-3 py-2 border rounded">Invoice PDF</button>
            <button onClick={async () => { try { const res = await downloadLabel(id); const blob = new Blob([res.data], { type: 'application/pdf' }); const url = URL.createObjectURL(blob); window.open(url, '_blank'); } catch { toast.error('Failed to download'); } }} className="px-3 py-2 border rounded">Shipping Label</button>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Refund / Return</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="block">Refund status
              <select className="mt-1 w-full border rounded px-3 py-2" value={refund.status} onChange={(e) => setRefund((r) => ({ ...r, status: e.target.value }))}>
                {['none', 'requested', 'approved', 'rejected', 'processed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">Amount
              <input className="mt-1 w-full border rounded px-3 py-2" type="number" step="0.01" value={refund.amount} onChange={(e) => setRefund((r) => ({ ...r, amount: e.target.value }))} />
            </label>
            <button type="button" className="px-3 py-2 bg-black text-white rounded col-span-2" onClick={async () => { try { await updateRefund(id, refund); toast.success('Refund updated'); load(); } catch { toast.error('Failed'); } }}>Save Refund</button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label className="inline-flex items-center gap-2 col-span-2"><input type="checkbox" checked={retReq.requested} onChange={(e) => setRetReq((r) => ({ ...r, requested: e.target.checked }))} /> Return requested</label>
            <label className="col-span-2">Reason
              <input className="mt-1 w-full border rounded px-3 py-2" value={retReq.reason} onChange={(e) => setRetReq((r) => ({ ...r, reason: e.target.value }))} />
            </label>
            <button type="button" className="px-3 py-2 bg-black text-white rounded col-span-2" onClick={async () => { try { await updateReturn(id, retReq); toast.success('Return updated'); load(); } catch { toast.error('Failed'); } }}>Save Return</button>
          </div>
        </div>
      </div>


      {/* Image Preview Modal */}
      {
        previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewImage(null)}>
            <div className="relative max-h-full max-w-full overflow-hidden rounded-lg bg-white shadow-2xl">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <img src={previewImage} alt="Preview" className="max-h-[90vh] max-w-[90vw] object-contain" />
            </div>
          </div>
        )
      }
    </div >
  );
}
