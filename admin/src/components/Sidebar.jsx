import { NavLink } from 'react-router-dom';
import { Icon } from './icons.jsx';

const nav = [
  { to: '/', label: 'Overview', icon: 'dashboard' },
  { to: '/orders', label: 'Orders', icon: 'orders' },
  { to: '/products', label: 'Products', icon: 'products' },
  { to: '/offers', label: 'Offers', icon: 'upload' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-72 flex-col border-r border-gray-800 bg-zinc-900 text-gray-300 h-screen sticky top-0 z-30 shadow-xl">
      <div className="h-16 px-6 flex items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white text-zinc-900 flex items-center justify-center font-bold text-lg shadow-md hover:scale-105 transition-transform">
            H
          </div>
          <div className="font-bold text-lg tracking-tight text-white">HK Admin</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-white text-zinc-900 shadow-lg shadow-black/50 transform scale-[1.02]'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={n.icon} className={`h-5 w-5 transition-colors ${isActive ? 'text-zinc-900' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span>{n.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-zinc-900" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-zinc-900/50">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 transition-colors hover:bg-white/10 cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-zinc-800 group-hover:ring-zinc-700">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Admin</p>
            <p className="text-[10px] uppercase font-medium tracking-wide text-gray-500 truncate">Super Admin</p>
          </div>
          <Icon name="logout" className="w-4 h-4 text-gray-400 group-hover:text-rose-400 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
