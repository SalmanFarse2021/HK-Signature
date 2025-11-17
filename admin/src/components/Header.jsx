import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Icon } from './icons.jsx';

export default function Header({ onMenu }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sm:hidden bg-white/80 backdrop-blur border-b">
      <div className="px-4 py-3 flex items-center justify-between">
        <button onClick={onMenu} className="p-2 rounded border">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
        </button>
        <div className="font-semibold">Admin</div>
        <div className="flex items-center gap-2 relative">
          <button onClick={toggle} className="p-2 rounded border btn-ghost"><Icon name={theme==='dark' ? 'sun' : 'moon'} /></button>
          <button onClick={() => setOpen((v) => !v)} className="px-2 py-1 text-sm border rounded flex items-center gap-2">
            <span className="hidden xs:inline">{user?.email || 'Account'}</span>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 rounded border bg-white shadow z-10 text-sm">
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50"><Icon name="logout" />Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
