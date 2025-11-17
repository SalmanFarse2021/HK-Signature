import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin.jsx';
import Products from './pages/Products.jsx';
import EditProduct from './pages/EditProduct.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Customers from './pages/Customers.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import Shipping from './pages/Shipping.jsx';
import Coupons from './pages/Coupons.jsx';
import Promotions from './pages/Promotions.jsx';
import Banners from './pages/Banners.jsx';
import Posts from './pages/Posts.jsx';
import Pages from './pages/Pages.jsx';
import Gallery from './pages/Gallery.jsx';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-gray-600 mt-1">Quick snapshot of store performance</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-500">Products</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? '—' : (count ?? '—')}</div>
        </div>
        <div className="bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Sales</div>
          <div className="mt-2 text-3xl font-semibold">${metrics?.salesSummary?.totalSales?.toFixed?.(0) || '—'}</div>
        </div>
        <div className="bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-500">Today</div>
          <div className="mt-2 text-3xl font-semibold">${metrics?.salesSummary?.todaySales?.toFixed?.(0) || '—'}</div>
        </div>
        <div className="bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-500">Avg Order</div>
          <div className="mt-2 text-3xl font-semibold">${metrics?.salesSummary?.averageOrderValue?.toFixed?.(0) || '—'}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Orders Overview</h2>
            <Link to="/orders" className="text-xs text-gray-600 hover:text-gray-900">View all</Link>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-500">Total</dt><dd className="font-semibold">{metrics?.salesSummary?.orderCount ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Pending</dt><dd className="font-semibold">{metrics?.ordersOverview?.pending ?? 0}</dd></div>
            <div><dt className="text-gray-500">Processing</dt><dd className="font-semibold">{metrics?.ordersOverview?.processing ?? 0}</dd></div>
            <div><dt className="text-gray-500">Shipped</dt><dd className="font-semibold">{metrics?.ordersOverview?.shipped ?? 0}</dd></div>
            <div><dt className="text-gray-500">Delivered</dt><dd className="font-semibold">{metrics?.ordersOverview?.delivered ?? 0}</dd></div>
            <div><dt className="text-gray-500">Cancelled</dt><dd className="font-semibold">{metrics?.ordersOverview?.cancelled ?? 0}</dd></div>
          </dl>
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-semibold">Top Products</h2>
          <ul className="mt-2 divide-y text-sm">
            {(metrics?.topProducts || []).map((p) => (
              <li key={p.id || p.name} className="py-2 flex items-center justify-between">
                <span className="truncate mr-3">{p.name}</span>
                <span className="text-gray-600">×{p.qty}</span>
              </li>
            ))}
            {(!metrics?.topProducts || metrics.topProducts.length === 0) && <li className="py-2 text-gray-500">No data</li>}
          </ul>
          {metrics?.topCategories?.length ? (
            <div className="mt-3 text-xs text-gray-600">Top categories: {metrics.topCategories.map(c=>`${c.category||'—'} (${c.qty})`).join(', ')}</div>
          ) : null}
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-semibold">Customer Insights</h2>
          <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-500">Total</dt><dd className="font-semibold">{metrics?.customerInsights?.totalCustomers ?? '—'}</dd></div>
            <div><dt className="text-gray-500">New (30d)</dt><dd className="font-semibold">{metrics?.customerInsights?.newCustomers ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Returning</dt><dd className="font-semibold">{metrics?.customerInsights?.returningCustomers ?? '—'}</dd></div>
            <div><dt className="text-gray-500">This month</dt><dd className="font-semibold">${metrics?.salesSummary?.monthlyRevenue?.toFixed?.(0) || '—'}</dd></div>
          </dl>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-1">
          <h2 className="text-sm font-semibold">Low Stock Alerts</h2>
          <ul className="mt-2 divide-y text-sm">
            {(metrics?.lowStock || []).map((p) => (
              <li key={p.id} className="py-2 flex items-center gap-3">
                {p.image ? <img src={p.image} className="h-8 w-8 rounded object-cover border" /> : <div className="h-8 w-8 rounded bg-gray-200" />}
                <div className="flex-1 truncate">{p.name}</div>
                <div className="text-gray-600">{p.stock}</div>
              </li>
            ))}
            {(!metrics?.lowStock || metrics.lowStock.length === 0) && <li className="py-2 text-gray-500">No low stock</li>}
          </ul>
        </div>

        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Orders</h2>
            <Link to="/orders" className="text-xs text-gray-600 hover:text-gray-900">View all</Link>
          </div>
          <div className="mt-2 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr><th className="py-1 pr-3">Order</th><th className="py-1 pr-3">Customer</th><th className="py-1 pr-3">Total</th><th className="py-1 pr-3">Payment</th><th className="py-1">Date</th></tr>
              </thead>
              <tbody>
                {(metrics?.recentOrders || []).map((o) => (
                  <tr key={o._id} className="border-t">
                    <td className="py-2 pr-3 font-medium">{o.orderNumber}</td>
                    <td className="py-2 pr-3">{o.customerEmail || 'Guest'}</td>
                    <td className="py-2 pr-3">${(o.total || 0).toFixed(2)}</td>
                    <td className="py-2 pr-3 capitalize">{o.paymentStatus}</td>
                    <td className="py-2">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {(!metrics?.recentOrders || metrics.recentOrders.length === 0) && (
                  <tr><td className="py-2 text-gray-500" colSpan="5">No orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <Link to="/products" className="inline-flex items-center gap-2 btn-primary">Manage Products</Link>
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
          path="/customers"
          element={
            <ProtectedRoute>
              <Shell>
                <Customers />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <Shell>
                <CustomerDetail />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipping"
          element={
            <ProtectedRoute>
              <Shell>
                <Shipping />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupons"
          element={
            <ProtectedRoute>
              <Shell>
                <Coupons />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/promotions"
          element={
            <ProtectedRoute>
              <Shell>
                <Promotions />
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
          path="/cms/gallery"
          element={
            <ProtectedRoute>
              <Shell>
                <Gallery />
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
