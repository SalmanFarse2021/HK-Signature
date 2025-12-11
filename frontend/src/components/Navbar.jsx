import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets.js';
import { useCart } from '../context/CartContext.jsx';
import { useShip } from '../context/ShipContext.jsx';
import SparklesLogo from './SparklesLogo.jsx';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/collection', label: 'Collection' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return !!localStorage.getItem('auth:user');
    } catch {
      return false;
    }
  });
  const { cartCount } = useCart();
  const { openSearch } = useShip();

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const syncAuthState = useCallback(() => {
    try {
      setIsLoggedIn(!!localStorage.getItem('auth:user'));
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    syncAuthState();
  }, [location.pathname, location.search, syncAuthState]);

  useEffect(() => {
    const onStorage = (e) => {
      if (!e || e.key === 'auth:user' || e.key === 'auth:token') syncAuthState();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', syncAuthState);
    window.addEventListener('visibilitychange', syncAuthState);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', syncAuthState);
      window.removeEventListener('visibilitychange', syncAuthState);
    };
  }, [syncAuthState]);

  const handleLogout = () => {
    try { localStorage.removeItem('auth:user'); } catch { }
    try { localStorage.removeItem('auth:token'); } catch { }
    setIsLoggedIn(false);
    closeMobile();
    navigate('/login');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/90 backdrop-blur-md border-gray-200 shadow-sm' : 'bg-white border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">

          {/* Brand - Left */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMobile}>
              <SparklesLogo />
            </Link>
          </div>

          {/* Desktop Nav - Center */}
          <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link?.end}
                className={({ isActive }) =>
                  `text-xs uppercase tracking-widest transition-colors ${isActive ? 'text-black font-bold' : 'text-gray-500 font-medium hover:text-black'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions - Right */}
          <div className="flex-shrink-0 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={openSearch}
              className="p-2 text-gray-600 hover:text-black transition-colors"
              aria-label="Search"
            >
              <img src={assets.search_icon} alt="Search" className="h-5 w-5" />
            </button>

            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-black transition-colors" aria-label="Cart" onClick={closeMobile}>
              <img src={assets.cart_icon} alt="Cart" className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center rounded-full bg-black text-white text-[9px] font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to={isLoggedIn ? "/profile" : "/login"}
              className="hidden md:block p-2 text-gray-600 hover:text-black transition-colors"
              aria-label="Profile"
            >
              <img src={assets.profile_icon} alt="Profile" className="h-5 w-5" />
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-black"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <img
                src={mobileOpen ? assets.cross_icon : assets.menu_icon}
                alt={mobileOpen ? 'Close' : 'Menu'}
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeMobile} />
          <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-2xl flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <SparklesLogo />
              <button onClick={closeMobile} className="p-2">
                <img src={assets.cross_icon} alt="Close" className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link?.end}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `block text-lg font-serif ${isActive ? 'text-black italic' : 'text-gray-600'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="h-px bg-gray-100 my-4" />

              <Link to="/cart" onClick={closeMobile} className="flex items-center gap-3 text-gray-600">
                <img src={assets.cart_icon} alt="Cart" className="h-5 w-5" />
                <span>Cart ({cartCount})</span>
              </Link>

              {isLoggedIn ? (
                <>
                  <Link to="/profile" onClick={closeMobile} className="flex items-center gap-3 text-gray-600">
                    <img src={assets.profile_icon} alt="Profile" className="h-5 w-5" />
                    <span>My Profile</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 w-full text-left">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={closeMobile} className="flex items-center gap-3 text-gray-600">
                  <img src={assets.profile_icon} alt="Login" className="h-5 w-5" />
                  <span>Login / Register</span>
                </Link>
              )}
            </nav>

            <div className="p-6 bg-gray-50 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest">HK Signature</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
