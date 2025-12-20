import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex font-sans">
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F8F9FA]">
        <Header onMenu={() => setMobileOpen(true)} />

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="font-bold text-lg">HK Signature</div>
                <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(false)}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <nav className="space-y-1">
                  <a href="/" className="block px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700">Dashboard</a>
                  <a href="/products" className="block px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700">Products</a>
                  <a href="/orders" className="block px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700">Orders</a>
                </nav>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

