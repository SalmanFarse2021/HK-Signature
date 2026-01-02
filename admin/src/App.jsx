import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin.jsx';
import Products from './pages/Products.jsx';
import EditProduct from './pages/EditProduct.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Offers from './pages/Offers.jsx';
import Banners from './pages/Banners.jsx';
import Posts from './pages/Posts.jsx';
import Pages from './pages/Pages.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

const Shell = ({ children }) => <Layout>{children}</Layout>;

import { useEffect, useState } from 'react';
import { listProducts as apiListProducts, getDashboard } from './api/client.js';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

function Dashboard() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [res, dash] = await Promise.all([
          apiListProducts({ limit: 1 }),
          getDashboard(),
        ]);
        setCount(res?.pagination?.total ?? 0);
        setMetrics(dash);
      } catch {
        setCount(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const data = [
    { name: 'Mon', sales: 4000, revenue: 2400 },
    { name: 'Tue', sales: 3000, revenue: 1398 },
    { name: 'Wed', sales: 2000, revenue: 9800 },
    { name: 'Thu', sales: 2780, revenue: 3908 },
    { name: 'Fri', sales: 1890, revenue: 4800 },
    { name: 'Sat', sales: 2390, revenue: 3800 },
    { name: 'Sun', sales: 3490, revenue: 4300 },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-2 text-lg">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div variants={item} className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-indigo-100/50 text-indigo-600 ring-1 ring-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                12%
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">{loading ? '...' : (count ?? '—')}</div>
              <div className="text-sm font-semibold text-gray-500">Total Products</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-emerald-100/50 text-emerald-600 ring-1 ring-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">৳{metrics?.salesSummary?.totalSales?.toLocaleString('en-BD') || '—'}</div>
              <div className="text-sm font-semibold text-gray-500">Total Sales</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-violet-50/50 border border-violet-100 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-violet-100/50 text-violet-600 ring-1 ring-violet-50 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">৳{metrics?.salesSummary?.todaySales?.toLocaleString('en-BD') || '—'}</div>
              <div className="text-sm font-semibold text-gray-500">Today's Revenue</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-amber-100/50 text-amber-600 ring-1 ring-amber-50 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">৳{metrics?.salesSummary?.averageOrderValue?.toLocaleString('en-BD') || '—'}</div>
              <div className="text-sm font-semibold text-gray-500">Avg. Order Value</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Analytics</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#ddd', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Orders Status</h2>
          <div className="space-y-4">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Pending', value: metrics?.ordersOverview?.pending ?? 0, fill: '#d97706' },
                  { name: 'Processing', value: metrics?.ordersOverview?.processing ?? 0, fill: '#2563eb' },
                  { name: 'Shipped', value: metrics?.ordersOverview?.shipped ?? 0, fill: '#4f46e5' },
                  { name: 'Delivered', value: metrics?.ordersOverview?.delivered ?? 0, fill: '#059669' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" hide />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="text-xs text-gray-500 uppercase mb-1">Pending</div>
                <div className="font-bold text-lg text-amber-600">{metrics?.ordersOverview?.pending ?? 0}</div>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="text-xs text-gray-500 uppercase mb-1">Processing</div>
                <div className="font-bold text-lg text-blue-600">{metrics?.ordersOverview?.processing ?? 0}</div>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="text-xs text-gray-500 uppercase mb-1">Shipped</div>
                <div className="font-bold text-lg text-indigo-600">{metrics?.ordersOverview?.shipped ?? 0}</div>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="text-xs text-gray-500 uppercase mb-1">Delivered</div>
                <div className="font-bold text-lg text-emerald-600">{metrics?.ordersOverview?.delivered ?? 0}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Top Products */}
        <motion.div variants={item} className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Performing Products</h2>
          <ul className="space-y-4">
            {(metrics?.topProducts || []).map((p, i) => (
              <li key={p.id || p.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="truncate text-sm font-medium text-gray-700 group-hover:text-black transition-colors">{p.name}</span>
                </div>
                <span className="text-sm font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{p.qty} sold</span>
              </li>
            ))}
            {(!metrics?.topProducts || metrics.topProducts.length === 0) && <li className="text-gray-500 text-sm italic">No data available yet.</li>}
          </ul>
        </motion.div>

        {/* Recent Orders Table */}
        <motion.div variants={item} className="card p-0 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="btn btn-outline py-1.5 px-3 text-xs">View All Orders</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(metrics?.recentOrders || []).map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{o.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{o.customerEmail || 'Guest'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">৳{(o.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}
                      `}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!metrics?.recentOrders || metrics.recentOrders.length === 0) && (
                  <tr><td className="px-6 py-8 text-center text-gray-500" colSpan="5">No recent orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Shell>
                <Dashboard />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Shell>
                <Products />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Shell>
                <Orders />
              </Shell>
            </ProtectedRoute>
          }
        />


        <Route
          path="/offers"
          element={
            <ProtectedRoute>
              <Shell>
                <Offers />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cms/banners"
          element={
            <ProtectedRoute>
              <Shell>
                <Banners />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/posts"
          element={
            <ProtectedRoute>
              <Shell>
                <Posts />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/pages"
          element={
            <ProtectedRoute>
              <Shell>
                <Pages />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <Shell>
                <OrderDetail />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <Shell>
                <EditProduct />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
