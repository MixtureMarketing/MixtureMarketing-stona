import { isPortfolioVideoEnabled } from '@/config/flags';
import { portfolioVideoFor, type PortfolioVideoVariant } from '@/data/portfolioVideos';
import type { SanityCaseStudy } from '@/types';
import { canHover, isPrerenderOrServer, prefersReducedMotion } from '@/utils/portfolioVideo';

/**
 * MIX-1873/MIX-1896: jeden warunek „karta listy gra film”: przełącznik `VITE_MM_PORTFOLIO_VIDEO` włączony,
 * realizacja ma zdjęcie (plakat filmu) i wpis w mapie `data/portfolioVideos.ts`. Zwraca wariant kafelka
 * (960 px) albo `null`. Z niego korzysta film kafelka i decyzja o nakładce najechania (karta z filmem
 * nie ma nakładki).
 */
export function cardVideoFor(
  project: Pick<SanityCaseStudy, 'slug' | 'mainImage'>,
): PortfolioVideoVariant | null {
  if (!isPortfolioVideoEnabled() || !project.mainImage) return null;
  return portfolioVideoFor(project.slug)?.preview ?? null;
}

/**
 * MIX-1896 r2: czy to urządzenie w ogóle zagra film kafelka (mysz/gładzik, bez reduced-motion, poza
 * prerenderem). Ten sam warunek montuje `<video>` w `PortfolioCardVideo` i zdejmuje nakładkę w
 * `PortfolioGrid`: gdy film nie zagra, karta ma nakładkę jak karta bez filmu.
 */
export function canPlayCardVideo(): boolean {
  return !isPrerenderOrServer() && canHover() && !prefersReducedMotion();
}
