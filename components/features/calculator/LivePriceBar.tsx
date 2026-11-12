// Pasek widełek na żywo (MIX-1385, Z5). Telefon i tablet (< 1024 px): przyklejony u dołu, na całą szerokość; komputer:
// z prawej strony ekranu (przycisk ciasteczek jest z lewej). Na telefonie podnosi przycisk
// ciasteczek nad pasek: znacznik `data-live-price-bar` i wysokość paska w zmiennej
// `--live-price-bar-h` na body (reguła w index.css, poza warstwami, bo reguła StickyMobileBar
// w `@layer base` przegrywa z klasą `bottom-4` z warstwy utilities). Pasek niczego nie klika,
// więc nie ma własnych celów dotyku.
import React, { useEffect, useRef } from 'react';
import { previewMessage } from './livePrice';
import type { LivePriceState } from '../../../hooks/useLivePriceRange';

const pln = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n));

const LivePriceBar: React.FC<{ state: LivePriceState }> = ({ state }) => {
  const { status, priceRange } = state;
  const visible = status !== 'idle';
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!visible || !bar) return;
    const body = document.body;
    const sync = () => body.style.setProperty('--live-price-bar-h', `${bar.offsetHeight}px`);
    body.dataset.livePriceBar = 'true';
    sync();
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync);
    ro?.observe(bar);
    return () => {
      ro?.disconnect();
      delete body.dataset.livePriceBar;
      body.style.removeProperty('--live-price-bar-h');
    };
  }, [visible]);

  if (!visible) return null;

  const problem = status === 'rateLimited' || status === 'error';

  return (
    <>
      {/* Zapas pod ostatnią treścią, żeby pasek na telefonie nie zasłaniał przycisków. */}
      <div className="lg:hidden h-20" aria-hidden="true" />
      <div
        ref={barRef}
        data-testid="live-price-bar"
        role="status"
        aria-live="polite"
        aria-busy={status === 'loading'}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-deep-dark/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] text-white shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md lg:inset-x-auto lg:bottom-auto lg:right-6 lg:top-28 lg:w-64 lg:rounded-2xl lg:border lg:p-5"
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
    </>
  );
};

export default LivePriceBar;
