import { useEffect, useState } from 'react';
import { listPagesApi, savePageApi } from '../api/client.js';

const presets = [
  { key: 'about', title: 'About Us' },
  { key: 'contact', title: 'Contact Us' },
  { key: 'faq', title: 'FAQ' },
];

export default function Pages() {
  const [items, setItems] = useState([]);
  const [activeKey, setActiveKey] = useState('about');
  const [form, setForm] = useState({ _id: '', key: 'about', title: 'About Us', content: '', published: true });

  const load = async () => {
    const res = await listPagesApi();
    setItems(res.pages || []);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const existing = items.find((p) => p.key === activeKey);
    const preset = presets.find((p) => p.key === activeKey);
    if (existing) setForm({ _id: existing._id, key: existing.key, title: existing.title, content: existing.content || '', published: existing.published });
    else if (preset) setForm({ _id: '', key: preset.key, title: preset.title, content: '', published: true });
  }, [activeKey, items]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    const res = await savePageApi(payload);
    await load();
    if (res?.page?._id) setForm((f) => ({ ...f, _id: res.page._id }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
        <p className="text-gray-600 mt-1">Edit About, Contact and FAQ</p>
      </div>
      <div className="flex items-center gap-3">
        {presets.map((p) => (
          <button key={p.key} className={`tab ${activeKey === p.key ? 'tab-active' : ''}`} onClick={() => setActiveKey(p.key)}>{p.title}</button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="published" type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            <label htmlFor="published">Published</label>
          </div>
          <div className="md:col-span-2">
            <label className="label">Content (HTML/Markdown)</label>
            <textarea rows={10} className="textarea" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
        </div>
        <div>
          <button className="btn-primary">Save Page</button>
        </div>
      </form>
    </div>
  );
}

