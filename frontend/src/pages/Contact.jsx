import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets.js';
import { BASE_URL } from '../api/client.js';
import NewsletterBox from '../components/NewsletterBox.jsx';

const Contact = () => {
  const [cms, setCms] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(new URL('/api/cms/page/contact', BASE_URL));
        if (res.ok) {
          const data = await res.json();
          setCms(data.page || null);
        }
      } catch { }
    })();
  }, []);

  return (
    <main className="bg-white">
      {/* Hero / Header */}
      <section className="bg-gray-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">{cms?.title || 'Contact Us'}</h1>
        <p className="text-gray-400 max-w-xl mx-auto font-light text-lg">
          We'd love to hear from you. Our team is always here to help.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16">

          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 uppercase tracking-wide text-xs mb-1">Visit Us</h3>
                    <p className="text-gray-600 font-light">Kamarpara, Godagari, Rajshahi, Bangladesh</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 uppercase tracking-wide text-xs mb-1">Email Us</h3>
                    <p className="text-gray-600 font-light">salmanfarse2021@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 uppercase tracking-wide text-xs mb-1">Call Us</h3>
                    <p className="text-gray-600 font-light">+8801890989789</p>
                    <p className="text-gray-600 font-light">+16823726476</p>
                    <p className="text-xs text-gray-400 mt-1">Mon - Fri, 9am - 9pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Follow Us</h2>
              <div className="flex gap-4">
                {[
                  { name: 'Instagram', link: 'https://instagram.com', icon: 'M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22H7.75A5.75 5.75 0 0 1 2 16.25V7.75A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25V7.75A4.25 4.25 0 0 0 16.25 3.5H7.75ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z' },
                  { name: 'Facebook', link: 'https://facebook.com', icon: 'M12 2C6.48 2 2 6.48 2 12c0 5.0 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7C18.34 21.15 22 17 22 12c0-5.52-4.48-10-10-10Z' },
                  { name: 'WhatsApp', link: 'https://wa.me/880123456789', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z' }
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="font-serif text-xl text-gray-900 mb-4">Frequently Asked Questions</h3>
              <p className="text-gray-600 font-light mb-4 text-sm leading-relaxed">
                Find quick answers to common questions about shipping, returns, and sizing in our Help Center.
              </p>
              <button className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
                Visit Help Center
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
            <h2 className="text-2xl font-serif text-gray-900 mb-2">Send a Message</h2>
            <p className="text-gray-500 text-sm mb-8">Fill out the form below and we'll get back to you shortly.</p>

            <form action="https://formsubmit.co/salmanfarse2021@gmail.com" method="POST" className="space-y-6">
              <input type="hidden" name="_subject" value="New Contact Message from HK Signature" />
              <input type="hidden" name="_captcha" value="false" />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all resize-none"
                  placeholder="How can we help you?"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-black px-6 py-4 text-sm font-bold text-white uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/20"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </section>

      <NewsletterBox />
    </main>
  );
};

export default Contact;

const id = () => String(Date.now()) + Math.random().toString(16).slice(2);
