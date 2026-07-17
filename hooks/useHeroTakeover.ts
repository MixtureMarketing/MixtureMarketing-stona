import { useEffect, useRef } from 'react';
import { addScrollTask } from './useSectionProgress';

/**
 * Scroll-takeover hero: arkusz najeżdżającej sekcji publikuje stopień pokrycia
 * jako CSS var `--cover` (0..1) na sekcji hero.
 *
 * Logika wyjęta z MixtureField, gdzie była sprzęgnięta z canvasem strony głównej.
 * Home nadal liczy --cover u siebie (silnik potrzebuje krawędzi arkusza do
 * rozpychania kropek); ten hook obsługuje hero BEZ canvasu — podstrony usługowe.
 *
 * Kontrakt stylów: treść hero używa `var(--cover, 0)` — domyślna 0 = stan
 * odsłonięty. Prerender / no-JS / reduced-motion (hook wtedy nic nie robi)
 * pokazują hero w pełni widoczny; przejęcie to progressive enhancement.
 *
 * Dostępność (WCAG 2.4.11 focus-not-obscured): przy pełnym zakryciu treść
 * oznaczona `[data-hero-covers]` dostaje `inert`, żeby Tab nie ustawił fokusa
 * na przycisku schowanym pod nieprzezroczystym arkuszem.
 *
 * @param enabled czy przejęcie ma działać. Hooka nie da się wywołać warunkowo,
 *                a StandardHero renderuje też rejestr jasny (14 podstron) — bez tej
 *                bramki każdy z nich odpalałby scroll-task bez arkusza do zmierzenia.
 * @param frontSelector selektor arkusza najeżdżającego (sekcja z własnym tłem)
 */
export function useHeroTakeover<T extends HTMLElement = HTMLElement>(
  enabled = true,
  frontSelector = '[data-takeover-front]',
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined' || window.isPrerendering) return;
    // matchMedia bywa nieobecne w jsdom (testy) — brak API traktujemy jak brak
    // preferencji ruchu, ale nie wywracamy renderu.
    if (typeof window.matchMedia === 'function') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    }
    const host = ref.current;
    if (!host) return;

    let wasCovered = false;
    let last = -1;

    const remove = addScrollTask(() => {
      const sheet = document.querySelector(frontSelector);
      if (!sheet) return;
      // READ: pozycja krawędzi arkusza względem viewportu.
      const top = sheet.getBoundingClientRect().top;
      const cover = Math.min(1, Math.max(0, (window.innerHeight - top) / window.innerHeight));
      if (Math.abs(cover - last) < 0.004) return;
      last = cover;
      // WRITE: zmienna + inert — wszystkie zapisy w fazie zapisu schedulera.
      return () => {
        host.style.setProperty('--cover', cover.toFixed(3));
        const covered = cover >= 0.98;
        if (covered !== wasCovered) {
          wasCovered = covered;
          host.querySelectorAll('[data-hero-covers]').forEach((el) => {
            el.toggleAttribute('inert', covered);
          });
        }
      };
    });

    return () => {
      remove();
      host.style.removeProperty('--cover');
      host.querySelectorAll('[data-hero-covers]').forEach((el) => el.removeAttribute('inert'));
    };
  }, [enabled, frontSelector]);

  return ref;
}
