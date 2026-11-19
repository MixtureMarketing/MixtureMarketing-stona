/**
 * Mapa realizacja → film (MIX-1831/MIX-1873/MIX-1896). Klucz = slug realizacji z Sanity.
 * Realizacja bez wpisu działa jak dotąd (samo zdjęcie), np. Impackt Edu.
 *
 * Każdy wpis to komplet trzech wariantów poziomych 16:9 (decyzja Jakuba, MIX-1831, wariant A):
 * - `preview`: kafelek listy, 960×540, ≤ 500 kB;
 * - `desktop`: strona realizacji na komputerze, 1280×720, ≤ 1,5 MB;
 * - `mobile`: strona realizacji na telefonie, 720×406, ≤ 0,5 MB.
 * Każdy wariant: WebM (VP9) + MP4 (H.264), bez dźwięku. Pliki `public/portfolio/video/<base>-{960,1280,720}.{webm,mp4}`
 * nagrywa `scripts/record-portfolio-video.mjs`; nowy film = jedna linia `'<slug>': landscape('<base>')`.
 * Filmów pionowych (ramka telefonu) nie ma: usunięte w MIX-1896.
 * Limity, wymiary i komplet plików pilnuje `tests/data/portfolioVideos.test.ts`; instrukcja:
 * `docs/runbooks/portfolio-filmy.md`.
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

/** Wpis mapy: komplet wariantów poziomych (kafelek listy i hero strony realizacji), wszystkie wymagane. */
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

/** Komplet poziomy `<base>-{960,1280,720}.{webm,mp4}`: 960×540, 1280×720, 720×406. */
export const landscape = (base: string): PortfolioVideo => ({
  preview: variant(base, 960, 540),
  desktop: variant(base, 1280, 720),
  mobile: variant(base, 720, 406), // 405 nie da się zakodować (yuv420p: wysokość parzysta)
});

export const PORTFOLIO_VIDEOS: Readonly<Record<string, PortfolioVideo>> = {
  // Try Dive: nagranie publicznej strony realizacji (przewijanie hero i sekcji).
  'try-dive-szkola-nurkowania': landscape('try-dive'),
  // Glampspace: film dostarczony (tryb SRC skryptu).
  glamspace: landscape('glamspace'),
};

/** Film realizacji (lista i hero) albo `null` (brak wpisu, pusty slug, klucze z prototypu obiektu). */
export function portfolioVideoFor(slug: string | undefined | null): PortfolioVideo | null {
  if (!slug || !Object.prototype.hasOwnProperty.call(PORTFOLIO_VIDEOS, slug)) return null;
  return PORTFOLIO_VIDEOS[slug];
}
