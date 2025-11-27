import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, updateProduct } from '../api/client.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', salePrice: '', discountStart: '', discountEnd: '', stock: '', description: '', category: '', subCategory: '', brand: '', isActive: true, bestseller: false, tags: '', sizes: new Set() });
  const [files, setFiles] = useState([]);
  const [variants, setVariants] = useState([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [removeSet, setRemoveSet] = useState(() => new Set());

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await getProduct(id);
        const p = res?.product;
        setProduct(p);
        setForm({
          name: p?.name || '',
          price: p?.price ?? '',
          salePrice: p?.salePrice ?? '',
          discountStart: p?.discountStart ? p.discountStart.slice(0, 10) : '',
          discountEnd: p?.discountEnd ? p.discountEnd.slice(0, 10) : '',
          stock: p?.stock ?? '',
          description: p?.description || '',
          category: p?.category || '',
          subCategory: p?.subCategory || '',
          brand: p?.brand || '',
          isActive: p?.isActive ?? true,
          bestseller: !!p?.bestseller,
          sizes: new Set(Array.isArray(p?.sizes) ? p.sizes : []),
          tags: Array.isArray(p?.tags) ? p.tags.join(', ') : (p?.tags || ''),
        });
        setVariants(Array.isArray(p?.variants) ? p.variants : []);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const images = useMemo(() => product?.images || [], [product]);

  function toggleRemove(pid) {
    setRemoveSet((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = {
        name: form.name,
        description: form.description,
        category: form.category,
        subCategory: form.subCategory,
        brand: form.brand,
        price: Number(form.price),
        salePrice: form.salePrice !== '' ? Number(form.salePrice) : undefined,
        stock: Number(form.stock),
        isActive: !!form.isActive,
        bestseller: !!form.bestseller,
        sizes: Array.from(form.sizes),
        discountStart: form.discountStart || undefined,
        discountEnd: form.discountEnd || undefined,
        tags: form.tags,
      };

      const removeIds = Array.from(removeSet);

      if (files.length > 0 || replaceImages || removeIds.length > 0) {
        const fd = new FormData();
        Object.entries(updates).forEach(([k, v]) => {
          if (k === 'sizes' && Array.isArray(v)) v.forEach((s) => fd.append('sizes', s));
          else fd.append(k, v);
        });
        if (variants.length) fd.append('variants', JSON.stringify(variants));
        if (replaceImages) fd.append('replaceImages', 'true');
        removeIds.forEach((pid) => fd.append('removePublicIds', pid));
        files.forEach((f) => fd.append('images', f));
        await updateProduct(id, fd, true);
      } else {
        if (variants.length) {
          await updateProduct(id, { ...updates, variants });
        } else {
          await updateProduct(id, updates);
        }
      }

      toast.success('Product updated');
      setTimeout(() => navigate('/products'), 500);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!product) return <div className="p-6">Product not found</div>;

  return (
    <div className="p-6 space-y-6">
      <ToastContainer position="top-right" />
      <h1 className="text-2xl font-semibold">Edit Product</h1>

      <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border rounded">
        <div className="space-y-3">
          <label className="block">
            <span className="label">Name</span>
            <input className="input mt-1" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
          </label>
          <label className="block">
            <span className="label">Description</span>
            <textarea className="input mt-1 h-32" value={form.description} onChange={(e) => updateField('description', e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Price</span>
              <input type="number" step="0.01" className="input mt-1" value={form.price} onChange={(e) => updateField('price', e.target.value)} required />
            </label>
            <label className="block">
              <span className="label">Stock</span>
              <input type="number" className="input mt-1" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="block text-sm">Sale price
              <input type="number" step="0.01" className="input mt-1" value={form.salePrice} onChange={(e) => updateField('salePrice', e.target.value)} />
            </label>
            <label className="block text-sm">Discount start
              <input type="date" className="input mt-1" value={form.discountStart} onChange={(e) => updateField('discountStart', e.target.value)} />
            </label>
            <label className="block text-sm">Discount end
              <input type="date" className="input mt-1" value={form.discountEnd} onChange={(e) => updateField('discountEnd', e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Category</span>
              <select className="input mt-1" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                <option>Men</option>
                <option>Women</option>
                <option>Kids</option>
                <option>Couple</option>
                <option>Handcrafts</option>
              </select>
            </label>
            <label className="block">
              <span className="label">Brand</span>
              <input className="input mt-1" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="label">Subcategory</span>
            <input className="input mt-1" value={form.subCategory} onChange={(e) => updateField('subCategory', e.target.value)} />
          </label>
          <div>
            <div className="text-sm">Sizes</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                <label key={s} className={`inline-flex items-center gap-2 border rounded px-3 py-1 ${form.sizes.has(s) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}>
                  <input type="checkbox" className="hidden" checked={form.sizes.has(s)} onChange={() => updateField('sizes', ((prev) => prev))} onClick={() => setForm((f) => { const n = new Set(f.sizes); if (n.has(s)) n.delete(s); else n.add(s); return { ...f, sizes: n }; })} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="label">Tags (comma separated)</span>
            <input className="input mt-1" value={form.tags} onChange={(e) => updateField('tags', e.target.value)} />
          </label>
          <label className="inline-flex items-center gap-2 mt-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)} />
            <span>Active</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.bestseller} onChange={(e) => updateField('bestseller', e.target.checked)} />
            <span>Top Selling</span>
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-2">Existing Images</div>
            <div className="flex flex-wrap gap-3">
              {images.length === 0 && <div className="text-sm text-gray-500">No images</div>}
              {images.map((img) => (
                <label key={img.public_id || img.url} className="relative inline-block">
                  <img src={img.url} alt="" className={`h-20 w-20 object-cover rounded border ${removeSet.has(img.public_id) ? 'opacity-50' : ''}`} />
                  <input type="checkbox" className="absolute top-1 right-1 h-4 w-4" checked={removeSet.has(img.public_id)} onChange={() => toggleRemove(img.public_id)} />
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Add New Images</div>
            <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            <label className="block mt-2 text-sm">
              <input type="checkbox" className="mr-2" checked={replaceImages} onChange={(e) => setReplaceImages(e.target.checked)} />
              Replace existing images
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Variants</div>
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
                      <td className="p-1"><input value={v.size || ''} onChange={(e) => setVariants((arr) => { const n = [...arr]; n[idx] = { ...n[idx], size: e.target.value }; return n; })} className="border rounded px-2 py-1 w-24" /></td>
                      <td className="p-1"><input value={v.color || ''} onChange={(e) => setVariants((arr) => { const n = [...arr]; n[idx] = { ...n[idx], color: e.target.value }; return n; })} className="border rounded px-2 py-1 w-24" /></td>
                      <td className="p-1"><input value={v.style || ''} onChange={(e) => setVariants((arr) => { const n = [...arr]; n[idx] = { ...n[idx], style: e.target.value }; return n; })} className="border rounded px-2 py-1 w-28" /></td>
                      <td className="p-1"><input value={v.sku || ''} onChange={(e) => setVariants((arr) => { const n = [...arr]; n[idx] = { ...n[idx], sku: e.target.value }; return n; })} className="border rounded px-2 py-1 w-32" /></td>
                      <td className="p-1"><input type="number" value={v.stock || 0} onChange={(e) => setVariants((arr) => { const n = [...arr]; n[idx] = { ...n[idx], stock: Number(e.target.value) }; return n; })} className="border rounded px-2 py-1 w-20" /></td>
                      <td className="p-1"><input type="number" step="0.01" value={v.price || ''} onChange={(e) => setVariants((arr) => { const n = [...arr]; n[idx] = { ...n[idx], price: e.target.value }; return n; })} className="border rounded px-2 py-1 w-24" /></td>
                      <td className="p-1 text-right"><button type="button" onClick={() => setVariants((arr) => arr.filter((_, i) => i !== idx))} className="px-2 py-1 border rounded">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => setVariants((arr) => [...arr, { size: '', color: '', style: '', sku: '', stock: 0, price: '' }])} className="mt-2 px-3 py-1.5 border rounded">Add Variant</button>
          </div>

          <div className="pt-2">
            <button disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Changes'}</button>
            <button type="button" onClick={() => navigate('/products')} className="ml-2 btn-outline">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
