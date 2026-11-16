import React, { useEffect, useRef, useState } from 'react';
import type { PortfolioLandscapeVideo } from '@/data/portfolioVideos';
import { afterLoadIdle, canPreloadVideo, isNarrowViewport } from '@/utils/portfolioVideo';
import { pickVideoSrc } from '@/components/features/portfolio/pickVideoSrc';

interface Props {
  video: PortfolioLandscapeVideo;
}

/**
 * Film w ramce zdjęcia hero strony realizacji (MIX-1831/MIX-1873).
 *
 * Zdjęcie zostaje elementem LCP: film leży nad nim (absolute, ta sama ramka 16:9, CLS 0),
 * niewidoczny do `playing`. Wczytywanie zaczyna się dopiero po `load` + idle, gdy ramka jest
 * w polu widzenia; start na `canplay`. Telefon (≤ 767 px) = wariant 720 px. `prefers-reduced-motion`,
 * `Save-Data` i wolne łącze = samo zdjęcie (bez `<video>` w DOM). Błąd = zostaje zdjęcie, bez komunikatu.
 */
const CaseStudyHeroVideo: React.FC<Props> = ({ video }) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Raz przy montowaniu (prerender = false, więc w HTML-u jest samo zdjęcie).
  const [allowed] = useState(canPreloadVideo);
  const [src, setSrc] = useState<string | null>(null);
  const [showing, setShowing] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!allowed || failed) return;
    const anchor = anchorRef.current;
    if (!anchor || typeof IntersectionObserver === 'undefined') return;
    let observer: IntersectionObserver | null = null;
    const cancelIdle = afterLoadIdle(() => {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer?.disconnect();
        const el = videoRef.current;
        if (!el) return;
        const variant = isNarrowViewport() ? video.mobile : video.desktop;
        setSrc(pickVideoSrc(el, variant));
      });
      // Ukryta kotwica nie przecina pola widzenia: obserwujemy ramkę zdjęcia (rodzica).
      observer.observe(anchor.parentElement ?? anchor);
    });
    return () => {
      cancelIdle();
      observer?.disconnect();
    };
  }, [allowed, failed, video]);

  useEffect(() => {
    if (src) videoRef.current?.load();
  }, [src]);

  if (!allowed || failed) return <span ref={anchorRef} hidden />;

  return (
    <>
      <span ref={anchorRef} hidden />
      <video
        ref={videoRef}
        data-case-study-video=""
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
    </>
  );
};

export default CaseStudyHeroVideo;
