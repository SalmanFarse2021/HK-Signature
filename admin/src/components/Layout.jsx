import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 to-slate-100 text-gray-900 flex">
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Mobile header */}
      <div className="flex-1 min-w-0">
        <Header onMenu={() => setMobileOpen(true)} />

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-lg p-3">
              <button className="mb-3 px-2 py-1 border rounded" onClick={() => setMobileOpen(false)}>Close</button>
              {/* Reuse sidebar links by rendering Sidebar inside a container */}
              <div className="h-[calc(100dvh-80px)] overflow-auto">
                {/* lightweight mobile nav */}
                <nav className="space-y-1 text-sm">
                  <a href="/" className="block px-3 py-2 rounded hover:bg-gray-100">Dashboard</a>
                  <a href="/products" className="block px-3 py-2 rounded hover:bg-gray-100">Products</a>
                  <a href="/orders" className="block px-3 py-2 rounded hover:bg-gray-100">Orders</a>
                </nav>
              </div>
            </div>
          </div>
        )}

        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

