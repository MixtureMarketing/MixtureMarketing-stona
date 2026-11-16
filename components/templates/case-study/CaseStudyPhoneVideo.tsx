import React, { useEffect, useId, useRef, useState } from 'react';
import { isPortfolioVideoEnabled } from '@/config/flags';
import { portraitVideoFor, type PortfolioVideoVariant } from '@/data/portfolioVideos';
import { afterLoadIdle, canPreloadVideo } from '@/utils/portfolioVideo';
import { pickVideoSrc } from '@/components/features/portfolio/pickVideoSrc';

export const PHONE_VIDEO_HEADING = 'Wersja na telefon';

/**
 * Film pionowy w ramce telefonu na stronie realizacji (MIX-1884).
 *
 * Sekcja pojawia się tylko przy `VITE_MM_PORTFOLIO_VIDEO=1` i wariancie `portrait` w mapie
 * (`data/portfolioVideos.ts`); realizacja bez niego wygląda jak dotąd. Film nie jest na liście ani w hero.
 */
const CaseStudyPhoneVideo: React.FC<{ slug: string | undefined }> = ({ slug }) => {
  const video = isPortfolioVideoEnabled() ? portraitVideoFor(slug) : null;
  return video ? <PhoneVideoSection video={video} /> : null;
};

/**
 * - Ramka telefonu (Tailwind: zaokrąglona obudowa) rezerwuje miejsce przez `aspect-ratio: width / height`
 *   z mapy, więc film nie przesuwa układu (CLS 0); tło ramki to statyczny szary ekran.
 * - `<video muted loop playsinline preload="none">` bez `src` do `load` + idle; potem
 *   IntersectionObserver na ramce; po wejściu w pole widzenia `src` (WebM, inaczej MP4), start na
 *   `canplay`, widoczny od `playing`. Ten sam plik 540 px na telefonie i komputerze.
 * - Prerender, `prefers-reduced-motion`, `Save-Data`, wolne łącze, brak IntersectionObserver albo błąd
 *   pliku: sekcja w ogóle się nie renderuje (bez pustej ramki i bez komunikatu).
 * - Film jest dekoracyjny (`aria-hidden`); nagłówek h2 sekcji opisuje, co widać.
 */
const PhoneVideoSection: React.FC<{ video: PortfolioVideoVariant }> = ({ video }) => {
  const headingId = useId();
  const screenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Raz przy montowaniu (prerender = false, więc w HTML-u sekcji nie ma).
  const [allowed] = useState(
    () => canPreloadVideo() && typeof IntersectionObserver !== 'undefined',
  );
  const [src, setSrc] = useState<string | null>(null);
  const [showing, setShowing] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!allowed || failed) return;
    const screen = screenRef.current;
    if (!screen) return;
    let observer: IntersectionObserver | null = null;
    const cancelIdle = afterLoadIdle(() => {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer?.disconnect();
        const el = videoRef.current;
        if (!el) return;
        setSrc(pickVideoSrc(el, video));
      });
      observer.observe(screen);
    });
    return () => {
      cancelIdle();
      observer?.disconnect();
    };
  }, [allowed, failed, video]);

  useEffect(() => {
    if (src) videoRef.current?.load();
  }, [src]);

  if (!allowed || failed) return null;

  return (
    <section
      aria-labelledby={headingId}
      data-case-study-phone=""
      className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20"
    >
      <h2
        id={headingId}
        className="text-center text-2xl md:text-3xl font-black text-dark mb-8 tracking-tight"
      >
        {PHONE_VIDEO_HEADING}
      </h2>
      {/* Obudowa telefonu: stała szerokość, wnętrze trzyma proporcje pliku. */}
      <div
        aria-hidden="true"
        className="relative mx-auto w-[min(70vw,260px)] rounded-[2.75rem] bg-dark p-3 shadow-2xl ring-1 ring-gray-300"
      >
        <span className="absolute top-5 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-dark" />
        <div
          ref={screenRef}
          data-case-study-phone-screen=""
          className="relative w-full overflow-hidden rounded-[2rem] bg-gray-100"
          style={{ aspectRatio: `${video.width} / ${video.height}` }}
        >
          <video
            ref={videoRef}
            data-case-study-phone-video=""
            muted
            loop
            playsInline
            preload={src ? 'auto' : 'none'}
            src={src ?? undefined}
            aria-hidden="true"
            tabIndex={-1}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${
              showing ? 'opacity-100' : 'opacity-0'
            }`}
            onCanPlay={(e) => {
              e.currentTarget.play()?.catch(() => {});
            }}
            onPlaying={() => setShowing(true)}
            onError={() => setFailed(true)}
          />
        </div>
      </div>
    </section>
  );
};

export default CaseStudyPhoneVideo;
