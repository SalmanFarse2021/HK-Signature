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
      } catch {}
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
              <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-prose">
                Have a question about your order or need styling help? We’re here for you.
              </p>
            )}

            {!cms?.content && (
              <div className="mt-6 space-y-2 text-sm text-gray-700">
                <p><span className="font-medium text-gray-900">Email:</span> support@example.com</p>
                <p><span className="font-medium text-gray-900">Phone:</span> +1 (555) 000‑0000</p>
                <p><span className="font-medium text-gray-900">Hours:</span> Mon–Fri, 9am–6pm</p>
              </div>
            )}

            <img src={assets.contact_img} alt="Contact" className="mt-8 w-full h-auto rounded-2xl border border-gray-200" />
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
