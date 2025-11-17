import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../api/client.js';

export default function Faq() {
  const [page, setPage] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(new URL('/api/cms/page/faq', BASE_URL));
        if (!res.ok) return;
        const data = await res.json();
        setPage(data.page);
      } catch {}
    })();
  }, []);

  return (
    <main className="bg-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">{page?.title || 'FAQ'}</h1>
        <div className="prose max-w-none mt-4 text-gray-800" dangerouslySetInnerHTML={{ __html: page?.content || '<p>Coming soon.</p>' }} />
      </section>
    </main>
  );
}

