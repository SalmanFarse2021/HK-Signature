import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets.js';
import { BASE_URL } from '../api/client.js';
import NewsletterBox from '../components/NewsletterBox.jsx';

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
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] bg-gray-900 overflow-hidden flex items-center justify-center">
        <img
          src={assets.about_img}
          alt="About HK Signature"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 tracking-tight">
            {cms?.title || 'The Art of Signature Style'}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light">
            Where tradition meets innovation. Redefining luxury for the modern individual.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-gray-900">Our Story</h2>
            <div className="w-16 h-[1px] bg-black"></div>
            {cms?.content ? (
              <div className="prose prose-lg text-gray-600 font-light" dangerouslySetInnerHTML={{ __html: cms.content }} />
            ) : (
              <div className="space-y-4 text-gray-600 font-light leading-relaxed">
                <p>
                  HK Signature was born from a desire to bridge the gap between timeless elegance and modern technology. We believe that fashion is not just about what you wear, but how it makes you feel.
                </p>
                <p>
                  Our journey began with a simple idea: to create bespoke pieces that tell a story. Using advanced AI design tools and traditional craftsmanship, we bring your unique vision to life with unparalleled precision and quality.
                </p>
                <p>
                  Every stitch, every fabric, and every detail is curated to ensure that your signature look is truly one-of-a-kind.
                </p>
              </div>
            )}
          </div>
          <div className="relative">
            <div className="aspect-[4/5] bg-gray-100 rounded-sm overflow-hidden">
              <img src={assets.contact_img} alt="Our Craft" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gray-50 p-8 hidden md:flex items-center justify-center text-center shadow-lg">
              <div>
                <span className="block text-4xl font-serif text-gray-900 mb-1">10k+</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Happy Clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We are committed to excellence in every aspect of our work, from design to delivery.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: assets.quality_icon,
                title: "Uncompromising Quality",
                desc: "We source only the finest materials to ensure your garments stand the test of time."
              },
              {
                icon: assets.exchange_icon,
                title: "Seamless Experience",
                desc: "From AI customization to doorstep delivery, we make luxury fashion effortless."
              },
              {
                icon: assets.support_img,
                title: "Dedicated Support",
                desc: "Our team of stylists and support staff are here to assist you at every step."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 text-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <img src={item.icon} alt={item.title} className="w-8 h-8 opacity-80" />
                </div>
                <h3 className="text-lg font-serif text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterBox />
    </main>
  );
};

export default About;
