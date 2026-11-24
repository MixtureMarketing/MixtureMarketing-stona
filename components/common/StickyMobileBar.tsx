/**
 * Sticky mobile CTA bar — pokazuje sie po wyjsciu sentinel `aboveRef` z viewportu,
 * znika gdy `belowRef` jest widoczny. Toggle body[data-sticky-mobile-bar]
 * dla CookieFloatingButton (telefon: przycisk schowany, gdy pasek widoczny — MIX-2079).
 *
 * Uzywany na: Home, /agencja-interaktywna-rzeszow/, /web-development/rzeszow/,
 * /agencja-seo-rzeszow/ (Sprint C2). Glass backdrop, safe-area-inset-bottom.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { fixedBottomGap } from '@/utils/fixedBottomGap';

interface StickyMobileBarProps {
  /** Sentinel po ktorym bar sie pojawia (np. hero). Wymagany. */
  aboveRef: React.RefObject<HTMLElement | null>;
  /** Sentinel ktorego widocznosc ukrywa bar (np. footer / kontakt). Opcjonalny. */
  belowRef?: React.RefObject<HTMLElement | null>;
  /** Glowny ciemny tekst na lewo (np. "Bezplatna wycena") */
  label: string;
  /** Mniejszy szary tekst pod labelem (np. "Wycena widelkowa w 24h") */
  sublabel?: string;
  /** Telefon w formacie +48... (bez spacji) */
  telephone: string;
  /** Telefon display (np. "+48 794 443 551") — dla aria-label */
  telephoneDisplay?: string;
  /** Click primary CTA */
  onPrimary: () => void;
  /** Tekst primary CTA */
  primaryLabel: string;
  /** Tailwind gradient class dla primary (default emerald) */
  primaryGradient?: string;
}

const StickyMobileBar: React.FC<StickyMobileBarProps> = ({
  aboveRef,
  belowRef,
  label,
  sublabel,
  telephone,
  telephoneDisplay,
  onPrimary,
  primaryLabel,
  primaryGradient = 'from-secondary to-primary',
}) => {
  const [aboveOut, setAboveOut] = useState(false);
  const [belowIn, setBelowIn] = useState(false);

  useEffect(() => {
    if (!aboveRef.current) return;
    const obs = new IntersectionObserver(([entry]) => setAboveOut(!entry.isIntersecting), {
      threshold: 0,
      rootMargin: '-40px 0px 0px 0px',
    });
    obs.observe(aboveRef.current);
    return () => obs.disconnect();
  }, [aboveRef]);

  useEffect(() => {
    if (!belowRef?.current) return;
    const obs = new IntersectionObserver(([entry]) => setBelowIn(entry.isIntersecting), {
      threshold: 0.15,
    });
    obs.observe(belowRef.current);
    return () => obs.disconnect();
  }, [belowRef]);

  const showBar = aboveOut && !belowIn;

  // MIX-2079: Safari iOS potrafi liczyć warstwę `fixed` od starej (krótszej) wysokości widoku —
  // pasek stał wtedy w połowie ekranu. Sonda `fixed bottom-0` mierzy, gdzie przeglądarka stawia
  // dół warstwy; gdy wisi nad dołem visualViewport, pasek zjeżdża o tę lukę (fixedBottomGap).
  const probeRef = useRef<HTMLDivElement>(null);
  const [gap, setGap] = useState(0);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!showBar || !vv) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const probe = probeRef.current;
      // md:hidden (desktop) = sonda bez pudełka → bez korekty.
      if (!probe || probe.getClientRects().length === 0) {
        setGap(0);
        return;
      }
      setGap(
        fixedBottomGap({
          layerBottom: probe.getBoundingClientRect().top,
          viewportHeight: vv.height,
          viewportOffsetTop: vv.offsetTop,
          scale: vv.scale,
        }),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    vv.addEventListener('resize', schedule);
    vv.addEventListener('scroll', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      vv.removeEventListener('resize', schedule);
      vv.removeEventListener('scroll', schedule);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [showBar]);

  useEffect(() => {
    if (showBar) {
      document.body.dataset.stickyMobileBar = 'true';
    } else {
      delete document.body.dataset.stickyMobileBar;
    }
    return () => {
      delete document.body.dataset.stickyMobileBar;
    };
  }, [showBar]);

  return (
    <>
      {/* Spacer pod ostatnia sekcja zeby content nie byl zaslaniany przez bar */}
      <div className="md:hidden h-20" aria-hidden="true" />
      <div
        ref={probeRef}
        data-sticky-bar-probe=""
        aria-hidden="true"
        className="md:hidden fixed bottom-0 left-0 h-0 w-0 pointer-events-none"
      />
      <div
        data-sticky-mobile-bar=""
        aria-hidden={!showBar}
        // inert: ukryty bar nie może łapać fokusa (axe: aria-hidden-focus)
        inert={!showBar}
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] transition-transform duration-300 ${
          showBar ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={showBar && gap > 0 ? { bottom: -gap } : undefined}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 text-xs leading-tight min-w-0">
            <p className="font-bold text-dark truncate">{label}</p>
            {sublabel && <p className="text-gray-500 truncate">{sublabel}</p>}
          </div>
          <a
            href={`tel:${telephone}`}
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border-2 border-gray-200 text-gray-700 hover:border-secondary hover:text-secondary transition-colors shrink-0"
            aria-label={`Zadzwoń: ${telephoneDisplay || telephone}`}
          >
            <Phone size={18} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={onPrimary}
            className={`inline-flex items-center gap-1.5 px-4 h-11 bg-gradient-to-br ${primaryGradient} text-white font-bold rounded-full shadow-md text-sm shrink-0`}
          >
            {primaryLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
};

export default StickyMobileBar;
