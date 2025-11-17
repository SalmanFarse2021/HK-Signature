import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets.js';
import CustomDesign from './CustomDesign.jsx';

const heroImages = [assets.hero_img, assets.about_img, assets.contact_img];
const heroAlts = [
  'Featured apparel showcase',
  'Lifestyle look — about our brand',
  'Customer care and experience',
];

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-gradient-to-b from-zinc-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[32px] bg-gray-100 md:rotate-0 rotate-1" />
            <div className="relative h-[320px] sm:h-[380px] md:h-[440px] lg:h-[480px] overflow-hidden rounded-[32px] shadow-xl">
              {heroImages.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={heroAlts[i]}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ))}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-lg backdrop-blur">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 w-6 rounded-full transition ${i === index ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-1.5 text-sm font-bold text-gray-900">
                ✨
                <span>Design and Order Your Own</span>
              </span>
              <p className="mt-3 text-sm sm:text-base text-gray-600">
                Bring your idea to life—describe the palette, fabric, or vibe and our AI atelier sketches it in seconds.
              </p>
            </div>
            <div className="rounded-[32px] border border-white/60 bg-white/90 p-6 sm:p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,.4)] backdrop-blur">
              <CustomDesign />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
