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
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';

const Shell = ({ children }) => <Layout>{children}</Layout>;

import { useEffect, useState } from 'react';
import { listProducts as apiListProducts, getDashboard } from './api/client.js';

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-2 text-lg">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="card p-6 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Products</div>
          <div className="text-4xl font-bold text-gray-900">{loading ? '...' : (count ?? '—')}</div>
        </div>
        <div className="card p-6 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Sales</div>
          <div className="text-4xl font-bold text-gray-900">${metrics?.salesSummary?.totalSales?.toFixed?.(0) || '—'}</div>
        </div>
        <div className="card p-6 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Today's Revenue</div>
          <div className="text-4xl font-bold text-gray-900">${metrics?.salesSummary?.todaySales?.toFixed?.(0) || '—'}</div>
        </div>
        <div className="card p-6 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Avg. Order</div>
          <div className="text-4xl font-bold text-gray-900">${metrics?.salesSummary?.averageOrderValue?.toFixed?.(0) || '—'}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Orders Overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Orders Status</h2>
            <Link to="/orders" className="text-sm font-medium text-black hover:underline">View Details</Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Total Orders</span>
              <span className="font-bold text-xl">{metrics?.salesSummary?.orderCount ?? '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* Top Products */}
        <div className="card p-6">
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
        </div>

        {/* Customer Insights */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Customer Insights</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{metrics?.customerInsights?.totalCustomers ?? '—'}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Customers</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">+{metrics?.customerInsights?.newCustomers ?? '0'}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">New (30d)</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Returning Customers</span>
              <span className="font-bold">{metrics?.customerInsights?.returningCustomers ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Revenue</span>
              <span className="font-bold text-green-600">${metrics?.salesSummary?.monthlyRevenue?.toFixed?.(0) || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Low Stock */}
        <div className="card p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Low Stock Alerts
          </h2>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {(metrics?.lowStock || []).map((p) => (
                <li key={p.id} className="py-3 flex items-center gap-4">
                  {p.image ? <img src={p.image} className="h-10 w-10 rounded-lg object-cover border border-gray-200" /> : <div className="h-10 w-10 rounded-lg bg-gray-100" />}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-rose-600 font-medium">{p.stock} remaining</div>
                  </div>
                </li>
              ))}
              {(!metrics?.lowStock || metrics.lowStock.length === 0) && <li className="py-4 text-gray-500 text-sm">All products are well stocked.</li>}
            </ul>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="card p-0 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="btn btn-outline py-1.5 px-3 text-xs">View All Orders</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
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
                    <td className="px-6 py-4 font-medium text-gray-900">${(o.total || 0).toFixed(2)}</td>
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
        </div>
      </div>
    </div>
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
