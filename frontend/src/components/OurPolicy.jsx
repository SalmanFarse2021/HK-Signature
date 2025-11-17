import React from 'react';
import { assets } from '../assets/assets.js';

const OurPolicy = () => {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Easy exchange */}
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
              <img src={assets.exchange_icon} alt="" className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Easy Exchange</p>
              <p className="text-xs text-gray-600">Quick and simple exchanges on eligible items.</p>
            </div>
          </div>

          {/* Quality assured */}
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
              <img src={assets.quality_icon} alt="" className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Quality Assured</p>
              <p className="text-xs text-gray-600">Carefully curated materials and fits.</p>
            </div>
          </div>

          {/* Friendly support */}
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
              <img src={assets.support_img} alt="" className="h-6 w-6 object-contain" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Friendly Support</p>
              <p className="text-xs text-gray-600">We’re here when you need us.</p>
            </div>
          </div>
        </div>

        {/* Payment methods removed as requested */}
      </div>
    </section>
  );
};

export default OurPolicy;
