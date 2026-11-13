import { startTransition, type ReactNode } from 'react';
import type { Root } from 'react-dom/client';

/**
 * Pierwszy render aplikacji (MIX-1565, TBT).
 *
 * Start z prerenderowanego HTML: `createRoot` buduje DOM całej strony od zera (wszystkie
 * sekcje, także te pod linią zgięcia, patrz LazyHydrate/bootState). Zwykły `root.render`
 * robi to w JEDNYM zadaniu głównego wątku (pas Default nie jest dzielony), co na telefonie
 * daje setki ms blokady (TBT). W `startTransition` React dzieli render na kawałki ~5 ms
 * i oddaje wątek przeglądarce między nimi. Do commitu widać ten sam statyczny HTML co
 * dotąd (React nie rusza #root przed commitem), więc wygląd się nie zmienia.
 *
 * Prerender (Puppeteer) i dev (pusty #root) zostają przy zwykłym renderze: zrzut ma
 * powstać tak samo jak dotąd.
 */
export function renderBoot(root: Root, node: ReactNode, fromPrerender: boolean): void {
  if (fromPrerender) {
    startTransition(() => root.render(node));
    return;
  }
  root.render(node);
}
