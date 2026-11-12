// Pasek widełek na żywo (MIX-1385, Z5). Telefon: przyklejony u dołu, na całą szerokość; komputer:
// z prawej strony ekranu (przycisk ciasteczek jest z lewej). Na telefonie podnosi przycisk
// ciasteczek tym samym znacznikiem co StickyMobileBar (index.css: body[data-sticky-mobile-bar]),
// więc nic się nie nakłada. Pasek niczego nie klika, więc nie ma celów dotyku do powiększania.
import React, { useEffect } from 'react';
import { previewMessage } from './livePrice';
import type { LivePriceState } from '../../../hooks/useLivePriceRange';

const pln = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n));

const LivePriceBar: React.FC<{ state: LivePriceState }> = ({ state }) => {
  const { status, priceRange } = state;
  const visible = status !== 'idle';

  useEffect(() => {
    if (!visible) return;
    document.body.dataset.stickyMobileBar = 'true';
    return () => {
      delete document.body.dataset.stickyMobileBar;
    };
  }, [visible]);

  if (!visible) return null;

  const problem = status === 'rateLimited' || status === 'error';

  return (
    <>
      {/* Zapas pod ostatnią treścią, żeby pasek na telefonie nie zasłaniał przycisków. */}
      <div className="md:hidden h-20" aria-hidden="true" />
      <div
        data-testid="live-price-bar"
        role="status"
        aria-live="polite"
        aria-busy={status === 'loading'}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-deep-dark/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] text-white shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md md:inset-x-auto md:bottom-auto md:right-6 md:top-28 md:w-64 md:rounded-2xl md:border md:p-5"
      >
        <p className="text-xs uppercase tracking-wider text-primary/80">Twój projekt</p>
        {priceRange && (
          <p
            className={`text-xl font-extrabold md:text-2xl transition-opacity ${
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
