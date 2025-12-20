import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon } from './icons.jsx';

export default function Header({ onMenu }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 px-6 h-[72px] flex items-center justify-between gap-6 bg-indigo-50/80 backdrop-blur-xl border-b border-indigo-100/50 shadow-sm">
      <div className="flex items-center gap-4 md:hidden">
        <button onClick={onMenu} className="p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm text-gray-600 hover:text-indigo-600 transition-colors">
          <Icon name="dashboard" className="h-5 w-5" />
        </button>
        <span className="font-bold text-xl tracking-tight text-gray-900">HK Signature</span>
      </div>

      <div className="hidden md:flex flex-1 max-w-lg items-center gap-3 px-5 py-2.5 bg-gray-100/50 border border-gray-200/50 rounded-full focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-200 transition-all duration-300">
        <Icon name="search" className="h-5 w-5 text-indigo-500/80" />
        <input
          className="bg-transparent border-none p-0 text-sm font-medium focus:ring-0 w-full placeholder:text-gray-400 text-gray-700"
          placeholder="Search for orders, products, or customers..."
        />
        <div className="flex gap-1">
          <kbd className="hidden lg:inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 font-sans text-[10px] font-bold text-gray-400">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all duration-300 relative group">
          <Icon name="sun" className="hidden" /> {/* Placeholder for notifs */}
          <svg className="w-6 h-6 transform group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white shadow-sm ring-2 ring-indigo-500/20"></span>
        </button>

        <div className="h-8 w-px bg-gray-200/80 mx-1 hidden sm:block"></div>

        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pl-2 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">Admin</p>
              <p className="text-[10px] text-gray-400 font-medium">Super Admin</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-900/20 ring-2 ring-white group-hover:ring-indigo-100 transition-all">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-3 border-b border-gray-50 mb-2">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-indigo-500 font-medium mt-0.5">Administrator</p>
              </div>
              <button className="w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3 font-medium mb-1">
                <Icon name="settings" className="w-4 h-4" /> Settings
              </button>
              <button onClick={logout} className="w-full text-left px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-3 font-medium">
                <Icon name="logout" className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
