import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe, updateMe, uploadAvatar, listMyOrdersApi, changePasswordApi } from '../api/client.js';

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('auth:user')); } catch { return null; } });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    if (!user) navigate('/login?redirect=/profile', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        const me = await getMe();
        if (me?.user) {
          localStorage.setItem('auth:user', JSON.stringify(me.user));
          setUser(me.user);
        }
        const mine = await listMyOrdersApi({ limit: 5 });
        setOrders(mine?.orders || []);
      } catch (_) {
        // ignore
      } finally { setLoading(false); }
    })();
  }, []);

  if (!user) return null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">My Profile</h1>
      <div className="mt-4 grid md:grid-cols-3 gap-6 items-start">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          <div className="mt-3 flex items-start gap-4">
            <div>
              <img src={user?.avatar?.url || 'https://api.dicebear.com/7.x/initials/svg?seed='+encodeURIComponent(user.name||user.email)} alt="avatar" className="h-16 w-16 rounded-full border object-cover" />
              <label className="mt-2 inline-flex cursor-pointer text-xs text-gray-700 underline">
                <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{ if (!e.target.files?.[0]) return; const res = await uploadAvatar(e.target.files[0]); if (res?.user) { localStorage.setItem('auth:user', JSON.stringify(res.user)); setUser(res.user); } }} />
                Change photo
              </label>
            </div>
            <form className="flex-1 grid grid-cols-1 gap-3" onSubmit={async (e)=> { e.preventDefault(); setSaving(true); try { const payload = { name: e.currentTarget.name.value, phone: e.currentTarget.phone.value, address: { line1: e.currentTarget.line1.value, line2: e.currentTarget.line2.value, city: e.currentTarget.city.value, state: e.currentTarget.state.value, postalCode: e.currentTarget.postalCode.value, country: e.currentTarget.country.value, } }; const res = await updateMe(payload); if (res?.user) { localStorage.setItem('auth:user', JSON.stringify(res.user)); setUser(res.user); } } finally { setSaving(false); } }}>
              <div>
                <label className="block text-xs text-gray-600">Name</label>
                <input name="name" defaultValue={user.name} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Email</label>
                <input value={user.email} disabled className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Phone</label>
                <input name="phone" defaultValue={user.phone} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600">Address line 1</label>
                  <input name="line1" defaultValue={user.address?.line1} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Address line 2</label>
                  <input name="line2" defaultValue={user.address?.line2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600">City</label>
                  <input name="city" defaultValue={user.address?.city} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">State</label>
                  <input name="state" defaultValue={user.address?.state} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600">ZIP/Postal code</label>
                  <input name="postalCode" defaultValue={user.address?.postalCode} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Country</label>
                  <input name="country" defaultValue={user.address?.country} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
                </div>
              </div>
              <div className="mt-2">
                <button disabled={saving} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        </section>

        <section className="md:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent orders</h2>
              <Link to="/orders" className="text-sm text-gray-700 hover:text-gray-900">See all</Link>
            </div>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">No orders yet.</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {orders.slice(0, 5).map((o) => (
                  <li key={o._id || o.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm text-gray-600">Order <span className="font-medium text-gray-900">#{(o._id||'').toString().slice(-6)}</span></div>
                      <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">Status: <span className="font-medium text-gray-900 capitalize">{(o.status||'pending').replace('_', ' ')}</span></div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(o.items||[]).slice(0, 4).map((it, idx) => (
                        <Link key={it.key || it.id || idx} to={`/products/${it.id || it.productId || ''}`} className="flex items-center gap-2 rounded border border-gray-200 p-2 hover:bg-gray-50">
                          <img src={it.image} alt="" className="h-12 w-10 rounded object-cover" />
                          <div>
                            <p className="text-xs font-medium text-gray-900 line-clamp-1">{it.name}</p>
                            <p className="text-[11px] text-gray-600">{it.size ? `Size: ${it.size} • ` : ''}Qty: {it.qty}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Security */}
        <section className="md:col-span-2">
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <form className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3" onSubmit={async(e)=>{ e.preventDefault(); if (!pwd.next || pwd.next!==pwd.confirm) { alert('Passwords do not match'); return; } try { await changePasswordApi({ currentPassword: pwd.current, newPassword: pwd.next }); alert('Password updated'); setPwd({ current: '', next: '', confirm: '' }); } catch (err) { alert('Failed to update password'); } }}>
              <div>
                <label className="block text-xs text-gray-600">Current password</label>
                <input type="password" value={pwd.current} onChange={(e)=> setPwd((p)=> ({...p, current: e.target.value}))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">New password</label>
                <input type="password" value={pwd.next} onChange={(e)=> setPwd((p)=> ({...p, next: e.target.value}))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Confirm new password</label>
                <input type="password" value={pwd.confirm} onChange={(e)=> setPwd((p)=> ({...p, confirm: e.target.value}))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-3">
                <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900">Update password</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default MyProfile;
