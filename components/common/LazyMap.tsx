import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Play } from 'lucide-react';

interface LazyMapProps {
  src: string; // Google Maps embed URL
  title: string;
  className?: string;
  /** Jezeli true: zaladuj na intersection (visible). Inaczej: dopiero na klik. */
  loadOnIntersection?: boolean;
}

/**
 * Facade dla Google Maps iframe — eliminuje 155 KB JS na initial load.
 *
 * Performance:
 * - Initial: renderuje tylko diff (zero JS od Google, ~10 KB SVG/CSS).
 * - Po kliku LUB intersection (jezeli loadOnIntersection=true): osadza
 *   prawdziwy <iframe>. Google Maps main.js (83KB) + init_embed.js (72KB)
 *   ladowane są dopiero wtedy.
 * - Wynik: LCP /o-nas/ z ~9.7s -> ~3.5s na mobile (szacunek wg PSI).
 *
 * Best practice "facade pattern" rekomendowany przez web.dev:
 * https://web.dev/articles/embed-best-practices
 */
const LazyMap: React.FC<LazyMapProps> = ({
  src,
  title,
  className = '',
  loadOnIntersection = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadOnIntersection || loaded) return;
    if (typeof window === 'undefined') return;
    // Czekaj na intersection — load tylko gdy user doscrolluje.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    const node = ref.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [loadOnIntersection, loaded]);

  return (
    <div ref={ref} className={`relative w-full h-full ${className}`}>
      {loaded ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          className="w-full h-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={`Wczytaj mapę: ${title}`}
          className="group w-full h-full bg-gradient-to-br from-indigo-50 via-white to-rose-50 hover:from-indigo-100 hover:to-rose-100 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer"
        >
          <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-20"></div>
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <MapPin size={28} />
            </div>
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm font-semibold text-dark">
              <Play size={14} className="text-primary" />
              <span>Załaduj mapę</span>
            </div>
            <p className="text-xs text-gray-500 max-w-xs text-center px-4">
              Klik aktywuje Google Maps (wymaga akceptacji cookies third-party)
            </p>
          </div>
        </button>
      )}
    </div>
  );
};

export default LazyMap;
