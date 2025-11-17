import { useEffect, useState } from 'react';
import { deletePostApi, listPostsApi, savePostApi } from '../api/client.js';

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export default function Posts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('blog');
  const [form, setForm] = useState({ type: 'blog', title: '', slug: '', excerpt: '', content: '', published: false });
  const [cover, setCover] = useState(null);
  const [gallery, setGallery] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listPostsApi();
      setItems(res.posts || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const clear = () => {
    setForm({ type, title: '', slug: '', excerpt: '', content: '', published: false });
    setCover(null);
    setGallery([]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries({ ...form, type }).forEach(([k, v]) => fd.append(k, v));
    if (cover) fd.append('cover', cover);
    [...gallery].forEach((f) => fd.append('gallery', f));
    await savePostApi(fd);
    clear();
    await load();
  };

  const del = async (id) => {
    if (!confirm('Delete post?')) return;
    await deletePostApi(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blog & Lookbook</h1>
        <p className="text-gray-600 mt-1">Manage posts and lookbooks</p>
      </div>

      <div className="flex items-center gap-3">
        <button className={`tab ${type === 'blog' ? 'tab-active' : ''}`} onClick={()=> setType('blog')}>Blog</button>
        <button className={`tab ${type === 'lookbook' ? 'tab-active' : ''}`} onClick={()=> setType('lookbook')}>Lookbook</button>
      </div>

      <form onSubmit={onSubmit} className="card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Title">
            <input className="input" value={form.title} onChange={(e)=> setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Slug (optional)">
            <input className="input" value={form.slug} onChange={(e)=> setForm({ ...form, slug: e.target.value })} />
          </Field>
          <Field label="Excerpt">
            <input className="input" value={form.excerpt} onChange={(e)=> setForm({ ...form, excerpt: e.target.value })} />
          </Field>
          <div className="flex items-center gap-2 mt-6">
            <input id="published" type="checkbox" checked={!!form.published} onChange={(e)=> setForm({ ...form, published: e.target.checked })} />
            <label htmlFor="published">Published</label>
          </div>
          <Field label="Cover Image">
            <input type="file" accept="image/*" onChange={(e)=> setCover(e.target.files?.[0] || null)} />
          </Field>
          <Field label="Gallery Images">
            <input type="file" accept="image/*" multiple onChange={(e)=> setGallery(e.target.files)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Content (HTML/Markdown)">
              <textarea rows={8} className="textarea" value={form.content} onChange={(e)=> setForm({ ...form, content: e.target.value })} />
            </Field>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-primary">Save Post</button>
          <button type="button" className="btn-outline" onClick={clear}>Clear</button>
        </div>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div>Loading…</div> : items
          .filter((p)=> p.type === type)
          .map((p) => (
          <div key={p._id} className="card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-gray-600">{p.published ? 'published' : 'draft'} • {p.slug}</div>
              </div>
              <button className="btn-danger" onClick={()=> del(p._id)}>Delete</button>
            </div>
            {p.coverImage?.url && (
              <img src={p.coverImage.url} alt="cover" className="aspect-[4/3] object-cover rounded border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

