import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets.js';
import { BASE_URL } from '../api/client.js';

const About = () => {
  const [cms, setCms] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(new URL('/api/cms/page/about', BASE_URL));
        if (res.ok) {
          const data = await res.json();
          setCms(data.page || null);
        }
      } catch { }
    })();
  }, []);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">{cms?.title || 'About HK Signature'}</h1>
            {cms?.content ? (
              <div className="mt-3 prose prose-sm sm:prose-base max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: cms.content }} />
            ) : (
              <>
                <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-prose">
                  We craft everyday essentials with a focus on quality materials, modern fits, and fair pricing.
                </p>
                <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-prose">
                  From fabric selection to finishing touches, we obsess over the small details so you don’t have to.
                </p>
              </>
            )}
          </div>
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-gray-100" />
            <img src={assets.about_img} alt="About HK Signature" className="relative w-full h-auto rounded-3xl shadow-sm" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">What we value</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
              <img src={assets.quality_icon} alt="Quality" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Quality first</p>
              <p className="text-xs text-gray-600">Fabrics and finishes built for comfort and longevity.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
              <img src={assets.exchange_icon} alt="Simple" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Simple, fair</p>
              <p className="text-xs text-gray-600">Clear pricing with easy exchanges for peace of mind.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
              <img src={assets.support_img} alt="Support" className="h-6 w-6 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Human support</p>
              <p className="text-xs text-gray-600">Friendly help whenever you need it.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
