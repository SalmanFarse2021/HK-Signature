import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe, updateMe, uploadAvatar, listMyOrdersApi, changePasswordApi } from '../api/client.js';
import { assets } from '../assets/assets.js';

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('auth:user')); } catch { return null; } });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'orders', 'security'

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
        const mine = await listMyOrdersApi({ limit: 10 });
        setOrders(mine?.orders || []);
      } catch (_) {
        // ignore
      } finally { setLoading(false); }
    })();
  }, []);

  const handleLogout = () => {
    try { localStorage.removeItem('auth:user'); } catch { }
    try { localStorage.removeItem('auth:token'); } catch { }
    navigate('/login');
  };

  const handleAvatarChange = async (e) => {
    if (!e.target.files?.[0]) return;
    const res = await uploadAvatar(e.target.files[0]);
    if (res?.user) {
      localStorage.setItem('auth:user', JSON.stringify(res.user));
      setUser(res.user);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: e.currentTarget.name.value,
        phone: e.currentTarget.phone.value,
        address: {
          line1: e.currentTarget.line1.value,
          line2: e.currentTarget.line2.value,
          city: e.currentTarget.city.value,
          state: e.currentTarget.state.value,
          postalCode: e.currentTarget.postalCode.value,
          country: e.currentTarget.country.value,
        }
      };
      const res = await updateMe(payload);
      if (res?.user) {
        localStorage.setItem('auth:user', JSON.stringify(res.user));
        setUser(res.user);
        alert('Profile updated successfully');
      }
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwd.next || pwd.next !== pwd.confirm) {
      alert('Passwords do not match');
      return;
    }
    try {
      await changePasswordApi({ currentPassword: pwd.current, newPassword: pwd.next });
      alert('Password updated');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      alert('Failed to update password');
    }
  };

  if (!user) return null;

  const tabs = [
    { id: 'account', label: 'Account Details', icon: assets.profile_icon },
    { id: 'orders', label: 'Order History', icon: assets.cart_icon }, // Using cart icon as placeholder for order icon
    { id: 'security', label: 'Security', icon: assets.cross_icon }, // Using cross icon as placeholder for lock/security
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-[80vh]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* User Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block">
              <img
                src={user?.avatar?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`}
                alt="avatar"
                className="h-24 w-24 rounded-full border-4 border-white shadow-md object-cover mx-auto"
              />
              <label className="absolute bottom-0 right-0 bg-black text-white p-1.5 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-sm" title="Change photo">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
              </label>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">{user.name || 'User'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {/* Navigation */}
          <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors text-left border-l-4 ${activeTab === tab.id
                    ? 'border-black text-black bg-gray-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {/* Icon placeholder - using simple SVGs if assets not available, or just text */}
                <span className="capitalize">{tab.label}</span>
              </button>
            ))}
            <div className="h-px bg-gray-100 mx-6 my-2"></div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left border-l-4 border-transparent"
            >
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[500px]">

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Account Details</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your personal information and delivery address.</p>
                </div>
                <hr className="border-gray-100" />
                <form className="grid grid-cols-1 gap-6" onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input name="name" defaultValue={user.name} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input name="phone" defaultValue={user.phone} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input value={user.email} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-gray-900">Shipping Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                        <input name="line1" defaultValue={user.address?.line1} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                        <input name="line2" defaultValue={user.address?.line2} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input name="city" defaultValue={user.address?.city} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                        <input name="state" defaultValue={user.address?.state} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input name="postalCode" defaultValue={user.address?.postalCode} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input name="country" defaultValue={user.address?.country} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button disabled={saving} className="rounded-lg bg-black px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-lg shadow-black/20">
                      {saving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Order History</h3>
                    <p className="text-sm text-gray-500 mt-1">View and track your recent orders.</p>
                  </div>
                  <Link to="/orders" className="text-sm font-medium text-black hover:underline">View All</Link>
                </div>
                <hr className="border-gray-100" />

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <img src={assets.cart_icon} alt="" className="w-8 h-8 opacity-40" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="text-gray-500 mt-1">Looks like you haven't placed any orders yet.</p>
                    <Link to="/collection" className="mt-4 inline-block rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o._id || o.id} className="group rounded-xl border border-gray-200 p-5 hover:border-black/30 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-900">Order #{(o._id || '').toString().slice(-6).toUpperCase()}</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    o.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'}`}>
                                {(o.status || 'pending').replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{new Date(o.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">${(o.amount || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{o.items?.length || 0} items</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {(o.items || []).slice(0, 6).map((it, idx) => (
                            <Link key={it.key || it.id || idx} to={`/products/${it.id || it.productId || ''}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group-hover:border-gray-300 transition-colors">
                              <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                            </Link>
                          ))}
                          {(o.items?.length || 0) > 6 && (
                            <div className="aspect-square rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                              +{o.items.length - 6}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Login & Security</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your password and secure your account.</p>
                </div>
                <hr className="border-gray-100" />

                <form className="max-w-md space-y-6" onSubmit={handlePasswordChange}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-colors outline-none" placeholder="••••••••" />
                  </div>

                  <div className="pt-2">
                    <button className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
};

export default MyProfile;
