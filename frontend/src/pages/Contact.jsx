import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets.js';
import { BASE_URL } from '../api/client.js';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sent

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = { id: id(), name: name.trim(), email: email.trim(), message: message.trim(), createdAt: Date.now() };
    try {
      const key = 'contact:messages';
      const arr = (() => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; } })();
      arr.unshift(payload);
      localStorage.setItem(key, JSON.stringify(arr));
      setStatus('sent');
      setName(''); setEmail(''); setMessage('');
    } catch {
      // noop
    }
  };

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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">{cms?.title || 'Contact us'}</h1>
            {cms?.content ? (
              <div className="mt-2 prose prose-sm sm:prose-base max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: cms.content }} />
            ) : (
              <div className="space-y-8 text-gray-600">
                <div>
                  <p className="text-lg leading-relaxed">
                    Have a question or need assistance? We’re here to help.
                  </p>
                  <p className="mt-4">
                    Our support team is always ready to assist you with:
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside ml-1">
                    <li>Order inquiries</li>
                    <li>Product information</li>
                    <li>Shipping & delivery questions</li>
                    <li>Returns & exchanges</li>
                    <li>General support</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-3">You can reach us through the following:</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📧</span>
                      <p><span className="font-medium text-gray-900">Email:</span> support@hksignature.com</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📞</span>
                      <p><span className="font-medium text-gray-900">Phone:</span> +880 123 456 789</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📍</span>
                      <p><span className="font-medium text-gray-900">Address:</span> Dhaka, Bangladesh</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🕒</span>
                      <p><span className="font-medium text-gray-900">Support Hours:</span> 9 AM – 9 PM (BD Time)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Send us a message</h2>
              {status === 'sent' && (
                <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  Thanks! Your message has been sent.
                </div>
              )}
              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
                </div>
                <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900">Send</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;

const id = () => String(Date.now()) + Math.random().toString(16).slice(2);
