import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets.js';
import BrandMark from './BrandMark.jsx';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center">
              <BrandMark className="h-12" />
            </Link>
            <p className="mt-3 text-sm text-gray-600 max-w-xs">
              Quality essentials for everyday living. Modern fits, fair prices, and friendly support.
            </p>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500">Secure payments with</p>
              <div className="mt-2 flex items-center gap-4">
                <img src={assets.razorpay_logo} alt="Razorpay" className="h-6 w-auto" />
                <img src={assets.stripe_logo} alt="Stripe" className="h-6 w-auto" />
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link></li>
              <li><Link to="/collection" className="text-gray-600 hover:text-gray-900">Collection</Link></li>
              <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Support</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/orders" className="text-gray-600 hover:text-gray-900">Orders</Link></li>
              <li><Link to="/cart" className="text-gray-600 hover:text-gray-900">Cart</Link></li>
              <li><Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link></li>
              <li><Link to="/profile" className="text-gray-600 hover:text-gray-900">My Profile</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Email: support@example.com</li>
              <li>Phone: +1 (555) 000‑0000</li>
              <li>Hours: Mon–Fri, 9am–6pm</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {year} HK Signature. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">Made with care.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
