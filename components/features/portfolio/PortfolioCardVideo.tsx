import React, { useEffect, useRef, useState } from 'react';
import type { PortfolioVideoVariant } from '@/data/portfolioVideos';
import {
  afterLoadIdle,
  canPreloadVideo,
} from '@/utils/portfolioVideo';
import { portfolioPreloadQueue } from '@/utils/preloadQueue';
import { pickVideoSrc } from './pickVideoSrc';
import { canPlayCardVideo } from './cardVideo';

/** Atrybut karty listy, na której nasłuchujemy najechania (cała karta, nie tylko zdjęcie). */
export const PORTFOLIO_CARD_ATTR = 'data-portfolio-card';

/** Po tylu ms doczytywanie zwalnia miejsce w kolejce, nawet bez `canplaythrough`. */
const PRELOAD_SLOT_TIMEOUT_MS = 15000;

interface Props {
  video: PortfolioVideoVariant;
  /** Zdjęcie karty (ten sam adres co `<img>`, już w pamięci przeglądarki). */
  poster?: string;
  /** MIX-1896 r2: błąd pliku, film znika; karta wraca do nakładki. */
  onFail?: () => void;
}

/**
 * Film na kafelku listy portfolio (MIX-1831/MIX-1873, wariant A + doczytywanie w tle).
 *
 * - Tylko mysz/gładzik (`(hover: hover) and (pointer: fine)`) bez `prefers-reduced-motion`;
 *   inaczej `<video>` nie ma w DOM i zostaje samo zdjęcie.
 * - Do zdarzenia `load` element nie ma `src` (0 bajtów filmu). Po `load` + idle, gdy kafelek jest
 *   w polu widzenia, doczytuje się w tle przez wspólną kolejkę (najwyżej 2 naraz); bez tego przy
 *   `Save-Data` i wolnym łączu.
 * - Najechanie: start od razu, gdy film gotowy; inaczej na `canplay`, o ile kursor nadal jest na
 *   kafelku. Zjechanie: pauza i powrót zdjęcia. Błąd = element znika, zdjęcie zostaje.
 */
const PortfolioCardVideo: React.FC<Props> = ({ video, poster, onFail }) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoveredRef = useRef(false);
  const releaseRef = useRef<(() => void) | null>(null);
  // Zdolność urządzenia raz przy montowaniu. Prerender = false (filmu nie ma w HTML); aplikacja
  // montuje się przez createRoot (bez hydratacji), więc różnica z HTML-em prerenderu nie szkodzi.
  const [capable] = useState(canPlayCardVideo);
  const [src, setSrc] = useState<string | null>(null);
  const [showing, setShowing] = useState(false);
  const [failed, setFailed] = useState(false);

  const arm = React.useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    setSrc((cur) => cur ?? pickVideoSrc(el, video));
  }, [video]);

  // Doczytywanie w tle: po load + idle, kafelek widoczny, kolejka najwyżej 2 naraz.
  useEffect(() => {
    if (!capable || failed || !canPreloadVideo()) return;
    const anchor = anchorRef.current;
    if (!anchor || typeof IntersectionObserver === 'undefined') return;
    let observer: IntersectionObserver | null = null;
    let dequeue: (() => void) | null = null;
    let slotTimer: ReturnType<typeof setTimeout> | null = null;
    const cancelIdle = afterLoadIdle(() => {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer?.disconnect();
        dequeue = portfolioPreloadQueue.enqueue((done) => {
          releaseRef.current = done;
          slotTimer = setTimeout(done, PRELOAD_SLOT_TIMEOUT_MS);
          arm();
        });
      });
      // Ukryta kotwica nie przecina pola widzenia: obserwujemy ramkę zdjęcia (rodzica).
      observer.observe(anchor.parentElement ?? anchor);
    });
    return () => {
      cancelIdle();
      observer?.disconnect();
      if (slotTimer) clearTimeout(slotTimer);
      dequeue?.();
      releaseRef.current = null;
    };
  }, [capable, failed, arm]);

  // Najechanie na całą kartę (mysz i pióro; dotyk pomijamy).
  useEffect(() => {
    if (!capable || failed) return;
    const card = anchorRef.current?.closest(`[${PORTFOLIO_CARD_ATTR}]`);
    if (!card) return;
    const onEnter = (e: Event) => {
      if ((e as PointerEvent).pointerType === 'touch') return;
      hoveredRef.current = true;
      const el = videoRef.current;
      if (!el) return;
      if (!el.getAttribute('src')) {
        arm();
        return; // start na `canplay`
      }
      if (el.readyState >= 3) el.play()?.catch(() => {});
    };
    const onLeave = () => {
      hoveredRef.current = false;
      videoRef.current?.pause();
      setShowing(false);
    };
    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointerleave', onLeave);
    return () => {
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointerleave', onLeave);
    };
  }, [capable, failed, arm]);

  // Nowe źródło: przeglądarka ma je wczytać (preload="auto" ustawiony razem ze src).
  useEffect(() => {
    if (src) videoRef.current?.load();
  }, [src]);

  if (!capable || failed) return <span ref={anchorRef} hidden />;

  const release = () => {
    releaseRef.current?.();
    releaseRef.current = null;
  };

  return (
    <>
      <span ref={anchorRef} hidden />
      <video
        ref={videoRef}
        data-portfolio-video=""
        muted
        loop
        playsInline
        preload={src ? 'auto' : 'none'}
        poster={poster}
        src={src ?? undefined}
        aria-hidden="true"
        tabIndex={-1}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
          showing ? 'opacity-100' : 'opacity-0'
        }`}
        onCanPlay={(e) => {
          if (hoveredRef.current) e.currentTarget.play()?.catch(() => {});
        }}
        onCanPlayThrough={release}
        onPlaying={() => {
          if (hoveredRef.current) setShowing(true);
          else videoRef.current?.pause();
        }}
        onError={() => {
          release();
          setFailed(true);
          onFail?.();
        }}
      />
    </>
  );
};

export default PortfolioCardVideo;
