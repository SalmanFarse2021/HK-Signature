import { NavLink } from 'react-router-dom';
import { Icon } from './icons.jsx';

const nav = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/products', label: 'Products', icon: 'products' },
  { to: '/orders', label: 'Orders', icon: 'orders' },
  { to: '/offers', label: 'Offers', icon: 'orders' }, // Reusing icon for now
  { section: 'CMS' },
  { to: '/cms/banners', label: 'Banners', icon: 'products' }, // Reusing icon
  { to: '/cms/posts', label: 'Posts', icon: 'products' }, // Reusing icon
  { to: '/cms/pages', label: 'Pages', icon: 'products' }, // Reusing icon
];

export default function Sidebar() {
  return (
    <aside className="hidden sm:flex sm:w-72 flex-col border-r border-gray-100 bg-white h-screen sticky top-0 z-30">
      <div className="h-20 px-6 flex items-center border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-lg">
            H
          </div>
          <div className="font-bold text-lg tracking-tight">HK Signature</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {nav.map((n, i) => {
          if (n.section) {
            return (
              <div key={i} className="px-3 pt-5 pb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{n.section}</p>
              </div>
            );
          }
          return (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-black text-white shadow-md shadow-black/10'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon name={n.icon} className={`h-5 w-5 transition-colors ${({ isActive }) => isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span>{n.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
            <p className="text-xs text-gray-500 truncate">admin@hk.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
