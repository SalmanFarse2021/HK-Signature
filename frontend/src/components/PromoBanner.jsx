import React, { useMemo } from 'react';
import { usePromotions } from '../context/PromotionsContext.jsx';

function Badge({ children, color = 'emerald' }) {
  const map = {
    emerald: 'border-emerald-200 text-emerald-700 bg-emerald-50',
    rose: 'border-rose-200 text-rose-700 bg-rose-50',
    indigo: 'border-indigo-200 text-indigo-700 bg-indigo-50',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${map[color] || map.emerald}`}>{children}</span>
  );
}

export default function PromoBanner() {
  const { promotions = [] } = usePromotions();
  const active = useMemo(() => promotions.slice(0, 4), [promotions]);
  if (!active.length) return null;
  return (
    <section className="bg-gradient-to-r from-amber-50 via-rose-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Promotions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {active.map((p) => (
            <div key={p._id} className="rounded-xl border bg-white/80 backdrop-blur p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium truncate">{p.name}</div>
                {p.flashSale ? <Badge color="rose">Flash Sale</Badge> : p.seasonalTag ? <Badge color="indigo">{p.seasonalTag}</Badge> : null}
              </div>
              <div className="mt-1 text-sm text-gray-700">
                {p.type === 'percent' && (<span>{p.value}% off</span>)}
                {p.type === 'flat' && (<span>${p.value} off</span>)}
                {p.type === 'bogo' && (<span>Buy 1 Get 1</span>)}
                {p.type === 'free_shipping_over' && (<span>Free shipping over ${p.threshold}</span>)}
              </div>
              {(p.startAt || p.endAt) && (
                <div className="mt-1 text-xs text-gray-500">
                  {p.startAt ? new Date(p.startAt).toLocaleDateString() : '—'} → {p.endAt ? new Date(p.endAt).toLocaleDateString() : '—'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
