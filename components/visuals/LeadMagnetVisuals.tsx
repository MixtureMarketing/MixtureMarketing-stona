import React from 'react';
import { ShieldAlert, TrendingUp } from 'lucide-react';
import { LEAD_MAGNET_CONTENT as CONTENT } from '../../data/content';

/**
 * Podgląd audytu — żywa ILUSTRACJA usługi, nie fabrykowane dane.
 *
 * Makieta strony (Twojej witryny) z przesuwającą się linią skanu = motyw
 * „analizujemy Twoją stronę". Pod spodem dwie uczciwe zajawki (ryzyka /
 * potencjał) BEZ zmyślonych metryk. Zgodne z PRODUCT.md: nie fabrykujemy danych.
 * Ruch respektuje prefers-reduced-motion (motion-safe → linia skanu znika).
 */
export const AuditVisual: React.FC = () => (
  <div className="relative">
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: 'radial-gradient(60% 60% at 50% 0%, rgba(97,182,222,0.20), transparent 65%)',
      }}
    />

    <div className="relative rounded-3xl border border-white/10 bg-[#0e1730] p-5 shadow-2xl md:p-6">
      {/* Chrome + status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-safe:animate-ping"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
          <span className="text-xxs font-black uppercase tracking-widest text-gray-300">
            {CONTENT.visual.label}
          </span>
        </div>
      </div>

      {/* Makieta strony w trakcie skanu */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4">
        {/* pasek adresu */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/20"></div>
          <div className="h-5 flex-1 rounded-md bg-white/[0.06]"></div>
        </div>
        {/* wireframe treści */}
        <div className="space-y-3" aria-hidden="true">
          <div className="h-14 rounded-lg bg-white/[0.07]"></div>
          <div className="h-2.5 w-3/4 rounded bg-white/15"></div>
          <div className="h-2.5 w-full rounded bg-white/[0.07]"></div>
          <div className="h-2.5 w-5/6 rounded bg-white/[0.07]"></div>
          <div className="flex gap-2 pt-1">
            <div className="h-8 w-24 rounded-md bg-primary/40"></div>
            <div className="h-8 w-16 rounded-md bg-white/10"></div>
          </div>
        </div>

        {/* Linia skanu */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 motion-safe:animate-audit-scan">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
          <div className="h-px w-full bg-primary/80 shadow-[0_0_14px_2px_rgba(97,182,222,0.7)]"></div>
        </div>
      </div>

      {/* Uczciwe zajawki — bez zmyślonych liczb */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <ShieldAlert className="shrink-0 text-red-400" size={20} />
          <div>
            <div className="mb-1 text-xs font-bold text-white">{CONTENT.visual.error.title}</div>
            <div className="text-xxs leading-snug text-gray-300">{CONTENT.visual.error.desc}</div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 p-4">
          <TrendingUp className="shrink-0 text-success" size={20} />
          <div>
            <div className="mb-1 text-xs font-bold text-white">{CONTENT.visual.growth.title}</div>
            <div className="text-xxs leading-snug text-gray-300">{CONTENT.visual.growth.desc}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
