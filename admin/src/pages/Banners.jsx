import { useEffect, useMemo, useState } from 'react';
import { deleteBannerApi, listBanners, saveBannerApi } from '../api/client.js';

export default function Banners() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', ctaLabel: '', ctaUrl: '', position: 0, active: true });
  const [files, setFiles] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listBanners();
      setItems(res.banners || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    [...files].forEach((f) => fd.append('images', f));
    await saveBannerApi(fd);
    setForm({ title: '', subtitle: '', ctaLabel: '', ctaUrl: '', position: 0, active: true });
    setFiles([]);
    await load();
  };

  const del = async (id) => {
    if (!confirm('Delete banner?')) return;
    await deleteBannerApi(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Homepage Banners</h1>
        <p className="text-gray-600 mt-1">Manage hero banners and sliders</p>
      </div>

      <form onSubmit={onSubmit} className="card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">Title</label>
            <input value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input value={form.subtitle} onChange={(e)=>setForm({ ...form, subtitle: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">CTA Label</label>
            <input value={form.ctaLabel} onChange={(e)=>setForm({ ...form, ctaLabel: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">CTA URL</label>
            <input value={form.ctaUrl} onChange={(e)=>setForm({ ...form, ctaUrl: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Position</label>
            <input type="number" value={form.position} onChange={(e)=>setForm({ ...form, position: Number(e.target.value||0) })} className="input" />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="active" type="checkbox" checked={!!form.active} onChange={(e)=>setForm({ ...form, active: e.target.checked })} />
            <label htmlFor="active">Active</label>
          </div>
          <div className="md:col-span-2">
            <label className="label">Images</label>
            <input type="file" multiple accept="image/*" onChange={(e)=> setFiles(e.target.files)} />
          </div>
        </div>
        <div>
          <button className="btn-primary">Save Banner</button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div>Loading…</div> : items.map((b) => (
          <div key={b._id} className="card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{b.title || '(no title)'}</div>
                <div className="text-xs text-gray-600">pos {b.position} • {b.active ? 'active' : 'inactive'}</div>
              </div>
              <button className="btn-danger" onClick={()=> del(b._id)}>Delete</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(b.images||[]).map((img) => (
                <img key={img.url} src={img.url} alt="banner" className="aspect-[4/3] object-cover rounded border" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

