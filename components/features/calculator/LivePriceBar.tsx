// Pasek widełek na żywo (MIX-1385, Z5). Telefon i tablet (< 1024 px): `sticky` u dołu ekranu,
// w treści formularza TUŻ NAD przyciskami Wstecz/Dalej (MIX-1412): sticky przesuwa się tylko w
// górę od swojego miejsca, więc nigdy nie zasłania tego, co jest pod nim (przycisków), a gdy
// przyciski są poza ekranem, trzyma się dołu ekranu. Komputer: z prawej strony ekranu (przycisk
// ciasteczek jest z lewej). Na telefonie przycisk ciasteczek idzie nad pasek tylko wtedy, gdy pasek
// albo przyciski pod nim wchodzą w pas przycisku ciasteczek u dołu ekranu: znacznik
// `data-live-price-bar` i odległość górnej krawędzi paska od dołu ekranu w `--live-price-bar-h` na
// body (reguła w index.css, poza warstwami, bo reguła StickyMobileBar w `@layer base` przegrywa z
// klasą `bottom-4` z warstwy utilities). Pasek niczego nie klika, więc nie ma celów dotyku.
import React, { useEffect, useRef } from 'react';
import { previewMessage } from './livePrice';
import type { LivePriceState } from '../../../hooks/useLivePriceRange';

const pln = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n));

/** Pas u dołu ekranu zajęty przez przycisk ciasteczek (bottom 1rem + 50 px + zapas), px. */
export const COOKIE_BAND_PX = 72;
const DESKTOP_MQ = '(min-width: 1024px)';

const LivePriceBar: React.FC<{ state: LivePriceState }> = ({ state }) => {
  const { status, priceRange } = state;
  const visible = status !== 'idle';
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!visible || !bar) return;
    const body = document.body;
    const clear = () => {
      delete body.dataset.livePriceBar;
      body.style.removeProperty('--live-price-bar-h');
    };
    let raf = 0;
    const sync = () => {
      raf = 0;
      if (window.matchMedia?.(DESKTOP_MQ).matches) return clear();
      const vh = window.innerHeight;
      const r = bar.getBoundingClientRect();
      // Przyciski Wstecz/Dalej są następnym elementem po pasku (CalculatorForm).
      const below = bar.nextElementSibling?.getBoundingClientRect();
      const bottom = Math.max(r.bottom, below?.bottom ?? r.bottom);
      if (r.height > 0 && r.top < vh && bottom > vh - COOKIE_BAND_PX) {
        body.dataset.livePriceBar = 'true';
        body.style.setProperty('--live-price-bar-h', `${Math.round(vh - r.top)}px`);
      } else {
        clear();
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    ro?.observe(bar);
    return () => {
      ro?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
      clear();
    };
  }, [visible]);

  if (!visible) return null;

  const problem = status === 'rateLimited' || status === 'error';

  return (
    <div
      ref={barRef}
      data-testid="live-price-bar"
      role="status"
      aria-live="polite"
      aria-busy={status === 'loading'}
      className="sticky bottom-0 z-40 -mx-6 md:-mx-10 border-t border-white/15 bg-deep-dark/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] text-white shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md lg:fixed lg:mx-0 lg:bottom-auto lg:right-6 lg:top-28 lg:w-64 lg:rounded-2xl lg:border lg:p-5"
    >
      <p className="text-xs uppercase tracking-wider text-primary/80">Twój projekt</p>
      {priceRange && (
        <p
          className={`text-xl font-extrabold lg:text-2xl transition-opacity ${
            status === 'loading' || problem ? 'opacity-60' : ''
          }`}
        >
          {pln(priceRange.min)}&nbsp;–&nbsp;{pln(priceRange.max)}&nbsp;zł
        </p>
      )}
      {!priceRange && status === 'loading' && <p className="text-base text-gray-300">Liczę…</p>}
      {problem && (
        <p className="mt-1 text-sm text-gray-300">
          {previewMessage(status === 'rateLimited' ? 429 : 500)}
        </p>
      )}
      {!problem && priceRange && (
        <p className="mt-1 text-xs text-gray-400">
          Orientacyjne widełki, zmieniają się z Twoimi odpowiedziami.
        </p>
      )}
    </div>
  );
};

export default LivePriceBar;
