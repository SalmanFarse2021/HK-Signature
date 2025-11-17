import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { assets } from '../assets/assets.js';
import { useCart } from '../context/CartContext.jsx';
import { useShip } from '../context/ShipContext.jsx';
import BrandMark from './BrandMark.jsx';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/collection', label: 'Collection' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();
  const { openSearch } = useShip();

  const linkClasses = ({ isActive }) =>
    `${isActive ? 'text-gray-900' : 'text-gray-600'} hover:text-gray-900 transition-colors text-sm font-medium`;

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex flex-1 items-center">
            <Link to="/" className="flex items-center" onClick={closeMobile}>
              <BrandMark className="h-10" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link?.end} className={linkClasses}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex flex-1 items-center justify-end gap-3">
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex p-2 rounded-md hover:bg-gray-100"
              aria-label="Search"
            >
              <img src={assets.search_icon} alt="Search" className="h-5 w-5" />
            </button>
            <Link to="/cart" className="relative inline-flex p-2 rounded-md hover:bg-gray-100" aria-label="Cart" onClick={closeMobile}>
              <img src={assets.cart_icon} alt="Cart" className="h-5 w-5" />
              {/* Badge placeholder; wire to cart count later */}
              <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[1rem] px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">
                {cartCount}
              </span>
            </Link>
            <Link
              to="/login"
              className="inline-flex p-2 rounded-md hover:bg-gray-100"
              aria-label="Account"
            >
              <img src={assets.profile_icon} alt="Account" className="h-5 w-5" />
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              className="md:hidden inline-flex p-2 rounded-md hover:bg-gray-100"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <img
                src={mobileOpen ? assets.cross_icon : assets.menu_icon}
                alt={mobileOpen ? 'Close' : 'Menu'}
                className="h-5 w-5"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/40" onClick={closeMobile} aria-hidden="true" />
          <div className="fixed inset-y-0 right-0 z-50 w-4/5 max-w-xs rounded-l-3xl border-l border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <BrandMark className="h-8" />
              <button
                type="button"
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Close menu"
                onClick={closeMobile}
              >
                <img src={assets.cross_icon} alt="Close" className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link?.end}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="h-px bg-gray-200 my-4" />
              <Link
                to="/cart"
                onClick={closeMobile}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <img src={assets.cart_icon} alt="Cart" className="h-4 w-4" />
                Cart
              </Link>
              <Link
                to="/login"
                onClick={closeMobile}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <img src={assets.profile_icon} alt="Login" className="h-4 w-4" />
                Login
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
