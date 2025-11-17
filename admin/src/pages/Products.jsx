import { useEffect, useMemo, useState } from 'react';
import { addProduct, deleteProduct, listProducts, updateProduct, exportProducts, importProducts } from '../api/client.js';
import Skeleton from '../components/Skeleton.jsx';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddProductForm({ onCreated }) {
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
    <form onSubmit={onSubmit} className="bg-white p-4 rounded border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
        <input className="input" placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => updateField('price', e.target.value)} required />
        <input className="input" placeholder="Stock" type="number" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} />
        <input className="input md:col-span-3" placeholder="Description" value={form.description} onChange={(e) => updateField('description', e.target.value)} />
        <select className="input" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
          <option>Men</option>
          <option>Women</option>
          <option>Kids</option>
          <option>Couple</option>
          <option>Handcrafts</option>
        </select>
        <input className="input" placeholder="Subcategory (e.g. Topwear)" value={form.subCategory} onChange={(e) => updateField('subCategory', e.target.value)} />
        <input className="input" placeholder="Brand" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Sizes</div>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((s) => (
            <label key={s} className={`inline-flex items-center gap-2 border rounded px-3 py-1 ${form.sizes.has(s) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}>
              <input type="checkbox" className="hidden" checked={form.sizes.has(s)} onChange={() => toggleSize(s)} />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="input" placeholder="Sale Price (optional)" type="number" step="0.01" value={form.salePrice} onChange={(e)=>updateField('salePrice', e.target.value)} />
        <input className="input" placeholder="Discount Start (YYYY-MM-DD)" type="date" value={form.discountStart} onChange={(e)=>updateField('discountStart', e.target.value)} />
        <input className="input" placeholder="Discount End (YYYY-MM-DD)" type="date" value={form.discountEnd} onChange={(e)=>updateField('discountEnd', e.target.value)} />
        <input className="input md:col-span-3" placeholder="Tags (comma separated)" value={form.tags} onChange={(e)=>updateField('tags', e.target.value)} />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Images (up to 4)</div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {previews.map((src, idx) => (
            <label key={idx} className="block border rounded bg-gray-50 overflow-hidden h-24">
              {src ? (
                <img src={src} alt={`preview-${idx}`} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-[10px] text-gray-500">Image {idx + 1}</div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(idx, e.target.files?.[0])} />
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Variants (size, color, style, SKU, stock, price)</div>
        <div className="overflow-auto">
          <table className="min-w-full text-xs border">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-2">Size</th>
                <th className="p-2">Color</th>
                <th className="p-2">Style</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Price</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-1"><input value={v.size||''} onChange={(e)=> setVariants((arr)=>{const n=[...arr]; n[idx]={...n[idx], size:e.target.value}; return n;})} className="border rounded px-2 py-1 w-24" /></td>
                  <td className="p-1"><input value={v.color||''} onChange={(e)=> setVariants((arr)=>{const n=[...arr]; n[idx]={...n[idx], color:e.target.value}; return n;})} className="border rounded px-2 py-1 w-24" /></td>
                  <td className="p-1"><input value={v.style||''} onChange={(e)=> setVariants((arr)=>{const n=[...arr]; n[idx]={...n[idx], style:e.target.value}; return n;})} className="border rounded px-2 py-1 w-28" /></td>
                  <td className="p-1"><input value={v.sku||''} onChange={(e)=> setVariants((arr)=>{const n=[...arr]; n[idx]={...n[idx], sku:e.target.value}; return n;})} className="border rounded px-2 py-1 w-32" /></td>
                  <td className="p-1"><input type="number" value={v.stock||0} onChange={(e)=> setVariants((arr)=>{const n=[...arr]; n[idx]={...n[idx], stock:Number(e.target.value)}; return n;})} className="border rounded px-2 py-1 w-20" /></td>
                  <td className="p-1"><input type="number" step="0.01" value={v.price||''} onChange={(e)=> setVariants((arr)=>{const n=[...arr]; n[idx]={...n[idx], price:e.target.value}; return n;})} className="border rounded px-2 py-1 w-24" /></td>
                  <td className="p-1 text-right"><button type="button" onClick={()=> setVariants((arr)=> arr.filter((_,i)=> i!==idx))} className="px-2 py-1 border rounded">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={()=> setVariants((arr)=> [...arr, { size:'', color:'', style:'', sku:'', stock:0, price:'' }])} className="mt-2 btn-outline">Add Variant</button>
      </div>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={form.bestseller} onChange={(e) => updateField('bestseller', e.target.checked)} />
        <span className="text-sm">Mark as Top Selling</span>
      </label>

      <div>
        <button disabled={submitting} className="btn-primary">{submitting ? 'Saving…' : 'Add Product'}</button>
      </div>
    </form>
  );
}

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => load()} className="btn-outline">Refresh</button>
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
            className="btn-outline"
          >Export CSV</button>
          <label className="btn-outline cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={async (e)=>{ const f=e.target.files?.[0]; if(!f) return; try{ const res=await importProducts(f); toast.success(`Imported: ${res.created} created, ${res.updated} updated`); load(); }catch(err){ toast.error(err?.response?.data?.message||'Import failed'); } e.target.value=''; }} />
          </label>
        </div>
      </div>

      <AddProductForm onCreated={() => load()} />

      <div className="bg-white/80 backdrop-blur border rounded-xl overflow-auto shadow-sm">
        {loading ? (
          <div className="p-4"><Skeleton rows={6} /></div>
        ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left sticky top-0 z-10">
            <tr>
              <th className="p-2">Image</th>
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Sizes</th>
              <th className="p-2">Category</th>
              <th className="p-2">Brand</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="p-3" colSpan="7">No products</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50/50">
                  <td className="p-2">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="h-10 w-10 object-cover rounded" />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded" />
                    )}
                  </td>
                  <td className="p-2 max-w-[240px] truncate" title={p.name}>{p.name}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-24 border rounded px-2 py-1"
                      defaultValue={p.price}
                      onBlur={(e) => onQuickUpdate(p._id, { price: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-20 border rounded px-2 py-1"
                      defaultValue={p.stock}
                      onBlur={(e) => onQuickUpdate(p._id, { stock: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2 text-xs text-gray-600">{Array.isArray(p.sizes) && p.sizes.length ? p.sizes.join(', ') : '-'}</td>
                  <td className="p-2">{p.category || '-'}</td>
                  <td className="p-2">{p.brand || '-'}</td>
                  <td className="p-2 text-right space-x-2">
                    <Link to={`/products/${p._id}`} className="px-2 py-1 border rounded">Edit</Link>
                    <button onClick={() => onDelete(p._id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <span>Page {page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
