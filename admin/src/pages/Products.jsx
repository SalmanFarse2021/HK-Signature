import { useEffect, useMemo, useState } from 'react';
import { addProduct, deleteProduct, listProducts, updateProduct, exportProducts, importProducts } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Icon } from '../components/icons.jsx';

function AddProductForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Men',
    subCategory: '',
    brand: '',
    stock: '',
    bestseller: false,
    salePrice: '',
    discountStart: '',
    discountEnd: '',
    tags: '',
    sizes: new Set(),
  });
  const [images, setImages] = useState([null, null, null, null]);
  const [previews, setPreviews] = useState([null, null, null, null]);
  const [variants, setVariants] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleSize(size) {
    setForm((f) => {
      const next = new Set(f.sizes);
      if (next.has(size)) next.delete(size); else next.add(size);
      return { ...f, sizes: next };
    });
  }

  function onPick(idx, file) {
    setImages((arr) => {
      const next = [...arr];
      next[idx] = file || null;
      return next;
    });
    setPreviews((arr) => {
      const next = [...arr];
      next[idx] = file ? URL.createObjectURL(file) : null;
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    const { sizes, ...rest } = form;
    Object.entries(rest).forEach(([k, v]) => {
      if (k === 'bestseller') fd.append(k, v ? 'true' : 'false');
      else if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
    });
    Array.from(sizes).forEach((s) => fd.append('sizes', s));
    if (variants.length) fd.append('variants', JSON.stringify(variants));
    images.filter(Boolean).forEach((f) => fd.append('images', f));
    setSubmitting(true);
    try {
      const res = await addProduct(fd);
      toast.success('Product created');
      setForm({ name: '', price: '', description: '', category: 'Men', subCategory: '', brand: '', stock: '', salePrice: '', discountStart: '', discountEnd: '', tags: '', bestseller: false, sizes: new Set() });
      setImages([null, null, null, null]);
      setPreviews([null, null, null, null]);
      setVariants([]);
      onCreated?.(res?.product);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  }

  const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Add New Product</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-black">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="label">Product Name</label>
              <input className="input" placeholder="e.g. Classic Cotton T-Shirt" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">৳</span>
                  <input className="input pl-7" placeholder="0.00" type="number" step="0.01" value={form.price} onChange={(e) => updateField('price', e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="label">Stock</label>
                <input className="input" placeholder="0" type="number" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="label">Description</label>
              <textarea className="textarea" placeholder="Product description..." value={form.description} onChange={(e) => updateField('description', e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                  <option>Men</option>
                  <option>Women</option>
                  <option>Kids</option>
                  <option>Couple</option>
                  <option>Handcrafts</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label">Subcategory</label>
                <input className="input" placeholder="e.g. Topwear" value={form.subCategory} onChange={(e) => updateField('subCategory', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="label">Brand</label>
              <input className="input" placeholder="Brand name" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
            </div>
            <div>
              <label className="label">Sizes</label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((s) => (
                  <label key={s} className={`cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-lg border text-sm font-medium transition-all ${form.sizes.has(s) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    <input type="checkbox" className="hidden" checked={form.sizes.has(s)} onChange={() => toggleSize(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <label className="label mb-3">Product Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((src, idx) => (
              <label key={idx} className="group relative block aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-black/20 bg-gray-50 overflow-hidden cursor-pointer transition-colors">
                {src ? (
                  <>
                    <img src={src} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">Change</div>
                  </>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-600">
                    <Icon name="upload" className="h-6 w-6 mb-2" />
                    <span className="text-xs">Upload</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(idx, e.target.files?.[0])} />
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
          <button disabled={submitting} className="btn-primary min-w-[120px]">
            {submitting ? 'Saving...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const limit = 20;

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  async function load() {
    setLoading(true);
    try {
      const res = await listProducts({ page, limit });
      setItems(res?.products || []);
      setTotal(res?.pagination?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function onQuickUpdate(id, updates) {
    try {
      await updateProduct(id, updates);
      toast.success('Updated');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500 text-sm">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          {!showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="btn-primary gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Product
            </button>
          )}
          <div className="h-8 w-px bg-gray-200 mx-1"></div>
          <button onClick={() => load()} className="btn-outline p-2" title="Refresh">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button
            onClick={async () => {
              try {
                const res = await exportProducts();
                const blob = new Blob([res.data], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'products.csv'; a.click(); URL.revokeObjectURL(url);
              } catch (err) { toast.error('Export failed'); }
            }}
            className="btn-outline p-2"
            title="Export CSV"
          >
            <Icon name="download" className="w-4 h-4" />
          </button>
          <label className="btn-outline p-2 cursor-pointer" title="Import CSV">
            <Icon name="upload" className="w-4 h-4" />
            <input type="file" accept=".csv" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const res = await importProducts(f); toast.success(`Imported: ${res.created} created, ${res.updated} updated`); load(); } catch (err) { toast.error(err?.response?.data?.message || 'Import failed'); } e.target.value = ''; }} />
          </label>
        </div>
      </div>

      {showAddForm && (
        <AddProductForm
          onCreated={() => {
            load();
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6"><Skeleton rows={6} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.length === 0 ? (
                  <tr><td className="px-6 py-12 text-center text-gray-500" colSpan="6">No products found. Add one to get started.</td></tr>
                ) : (
                  items.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-300">
                                <Icon name="products" className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[200px]" title={p.name}>{p.name}</div>
                            <div className="text-xs text-gray-500">{Array.isArray(p.sizes) && p.sizes.length ? p.sizes.join(', ') : 'No sizes'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative max-w-[100px]">
                          <span className="absolute left-2 top-1.5 text-gray-400 text-xs">৳</span>
                          <input
                            type="number"
                            className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-black rounded px-2 py-1 pl-5 text-sm transition-colors outline-none"
                            defaultValue={p.price}
                            onBlur={(e) => onQuickUpdate(p._id, { price: Number(e.target.value) })}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          className={`w-20 bg-transparent border border-transparent hover:border-gray-200 focus:border-black rounded px-2 py-1 text-sm transition-colors outline-none ${p.stock < 10 ? 'text-rose-600 font-medium' : 'text-gray-600'}`}
                          defaultValue={p.stock}
                          onBlur={(e) => onQuickUpdate(p._id, { stock: Number(e.target.value) })}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {p.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.brand || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/products/${p._id}`} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <button onClick={() => onDelete(p._id)} className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{items.length}</span> of <span className="font-medium">{total}</span> products
        </div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50">Previous</button>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
