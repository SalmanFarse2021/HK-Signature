import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../api/client.js';
import { Link } from 'react-router-dom';

export default function HomeBanners() {
  const [banners, setBanners] = useState([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(new URL('/api/cms/banners', BASE_URL));
        if (!res.ok) throw new Error('fail');
        const data = await res.json();
        setBanners(data.banners || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const id = setInterval(() => setI((x) => (x + 1) % banners.length), 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (!banners.length) return null;
  const b = banners[i];
  const firstUrl = b.images?.[0]?.url;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            {b.title && <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">{b.title}</h2>}
            {b.subtitle && <p className="mt-2 text-gray-700 text-sm sm:text-base">{b.subtitle}</p>}
            {b.ctaUrl && (
              <Link to={b.ctaUrl} className="inline-flex mt-4 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900">{b.ctaLabel || 'Shop now'}</Link>
            )}
          </div>
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-gray-100" />
            {firstUrl && <img src={firstUrl} alt={b.title || ''} className="relative w-full h-[300px] sm:h-[380px] md:h-[440px] rounded-3xl object-cover shadow-sm" />}
          </div>
        </div>
        {banners.length > 1 && (
          <div className="mt-2 flex items-center gap-2 justify-center">
            {banners.map((_, idx) => (
              <button key={idx} className={`h-1.5 w-1.5 rounded-full ${idx===i?'bg-gray-900':'bg-gray-400 hover:bg-gray-600'}`} onClick={()=> setI(idx)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

