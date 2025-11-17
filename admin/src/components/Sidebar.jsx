import { NavLink } from 'react-router-dom';
import { Icon } from './icons.jsx';

const nav = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/products', label: 'Products', icon: 'products' },
  { to: '/orders', label: 'Orders', icon: 'orders' },
  { to: '/customers', label: 'Customers', icon: 'users' },
  { to: '/shipping', label: 'Shipping', icon: 'orders' },
  { to: '/coupons', label: 'Coupons', icon: 'orders' },
  { to: '/promotions', label: 'Promos', icon: 'orders' },
  { to: '/cms/banners', label: 'Banners', icon: 'products' },
  { to: '/cms/posts', label: 'Posts', icon: 'products' },
  { to: '/cms/pages', label: 'Pages', icon: 'products' },
  { to: '/cms/gallery', label: 'Gallery', icon: 'products' },
];

export default function Sidebar() {
  return (
    <aside className="hidden sm:flex sm:w-64 flex-col border-r bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="h-14 px-4 flex items-center border-b">
        <div className="font-semibold tracking-tight">Store Admin</div>
      </div>
      <nav className="p-3 space-y-1 text-sm">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded transition ${isActive ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-800'}`}
          >
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-3 text-[11px] text-gray-500 border-t">© {new Date().getFullYear()} Your Brand</div>
    </aside>
  );
}
