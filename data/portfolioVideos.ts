/**
 * Mapa realizacja → film (MIX-1831/MIX-1873). Klucz = slug realizacji z Sanity.
 * Realizacja bez wpisu działa jak dotąd (samo zdjęcie).
 *
 * Warianty (decyzja Jakuba, MIX-1831, wariant A):
 * - `preview`: kafelek listy, zawsze poziomy 16:9, ≤ 500 kB, 960 px;
 * - `desktop`: strona realizacji na komputerze, ≤ 1,5 MB, 1280 px;
 * - `mobile`: strona realizacji na telefonie, ≤ 0,5 MB, 720 px.
 * Każdy wariant: WebM (VP9) + MP4 (H.264), bez dźwięku. Pliki w `public/portfolio/video/`,
 * nagrywa je `scripts/record-portfolio-video.mjs` (limity pilnuje `tests/data/portfolioVideos.test.ts`).
 */

export interface PortfolioVideoVariant {
  /** Ścieżka WebM (VP9), od korzenia strony. */
  webm: string;
  /** Ścieżka MP4 (H.264), od korzenia strony. */
  mp4: string;
  /** Wymiary pliku (metadane) — z nich proporcje ramki, bez przycięcia i bez przeskoku układu. */
  width: number;
  height: number;
}

export interface PortfolioVideo {
  preview: PortfolioVideoVariant;
  desktop: PortfolioVideoVariant;
  mobile: PortfolioVideoVariant;
}

/** Limity wagi plików wariantów w bajtach (kryterium MIX-1873). */
export const VIDEO_BYTE_LIMITS = {
  preview: 500 * 1024,
  desktop: 1.5 * 1024 * 1024,
  mobile: 512 * 1024,
} as const;

const variant = (base: string, width: number, height: number): PortfolioVideoVariant => ({
  webm: `/portfolio/video/${base}-${width}.webm`,
  mp4: `/portfolio/video/${base}-${width}.mp4`,
  width,
  height,
});

export const PORTFOLIO_VIDEOS: Readonly<Record<string, PortfolioVideo>> = {
  // Try Dive: nagranie publicznej strony realizacji (przewijanie hero i sekcji), poziomo.
  'try-dive-szkola-nurkowania': {
    preview: variant('try-dive', 960, 540),
    desktop: variant('try-dive', 1280, 720),
    mobile: variant('try-dive', 720, 406), // 405 nie da się zakodować (yuv420p: wysokość parzysta)
  },
};

/** Film realizacji albo `null` (brak wpisu, pusty slug, klucze z prototypu obiektu). */
export function portfolioVideoFor(slug: string | undefined | null): PortfolioVideo | null {
  if (!slug || !Object.prototype.hasOwnProperty.call(PORTFOLIO_VIDEOS, slug)) return null;
  return PORTFOLIO_VIDEOS[slug];
}
