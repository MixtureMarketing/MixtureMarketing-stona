import { useEffect, useRef } from 'react';

/**
 * Wspólny scheduler scroll-efektów strony: JEDEN listener + jeden rAF dla
 * wszystkich subskrybentów, z rozdziałem faz READ → WRITE (zadanie w fazie
 * odczytu zwraca funkcję zapisu). Bez tego każdy efekt miał własny rAF i
 * przeplatał getBoundingClientRect z style.setProperty — wymuszając dodatkowe
 * przeliczenia stylów w obrębie jednej klatki (layout thrash między handlerami).
 */
type ScrollTask = () => (() => void) | void;

const tasks = new Set<ScrollTask>();
let rafId = 0;
let listening = false;

const frame = () => {
  rafId = 0;
  const writes: (() => void)[] = [];
  // Faza READ — wszystkie odczyty layoutu, zero zapisów.
  for (const task of tasks) {
    const write = task();
    if (write) writes.push(write);
  }
  // Faza WRITE — wszystkie zapisy stylów naraz.
  for (const write of writes) write();
};

const onScroll = () => {
  if (!rafId) rafId = requestAnimationFrame(frame);
};

/** Rejestruje zadanie scroll-frame; zwraca funkcję wyrejestrowującą. */
export function addScrollTask(task: ScrollTask): () => void {
  tasks.add(task);
  if (!listening) {
    listening = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  onScroll(); // stan początkowy
  return () => {
    tasks.delete(task);
    if (tasks.size === 0 && listening) {
      listening = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
}

/**
 * Puls strony (--page-p, 0..1 całego scrolla) publikowany na :root — warstwy
 * tła (ambient, siatki, poświaty) dryfują z KAŻDYM pikselem przewijania,
 * w obie strony (wątek „żywej całości", 2026-07-16). Jeden hook per strona
 * (Home, huby usług). Prerender/reduced-motion: brak zmiennej →
 * var(--page-p, 0) = statyka; sprzątanie usuwa zmienną przy zmianie trasy.
 */
export function usePagePulse() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.isPrerendering) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    let last = -1;
    const remove = addScrollTask(() => {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      return () => root.style.setProperty('--page-p', p.toFixed(3));
    });
    return () => {
      remove();
      root.style.removeProperty('--page-p');
    };
  }, []);
}

/**
 * Scrollem sterowany postęp wejścia sekcji (0..1) publikowany jako CSS var
 * `--p` na elemencie sekcji. Dwukierunkowy; liczony z pozycji, nie one-shot.
 *
 * Kontrakt stylów: transformy MUSZĄ używać `var(--p, 1)` — domyślna 1 = stan
 * spoczynkowy. Prerender / no-JS / prefers-reduced-motion (hook wtedy nic nie
 * robi) pokazują treść w pełni widoczną; ruch to progressive enhancement.
 *
 * @param span część wysokości viewportu, po której p osiąga 1 (0.75 = sekcja
 *             „dojeżdża" gdy jej top minie 75% wysokości okna).
 */
export function useSectionProgress<T extends HTMLElement = HTMLElement>(span = 0.75) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || window.isPrerendering) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;

    let last = -1;
    return addScrollTask(() => {
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - el.getBoundingClientRect().top) / (vh * span)));
      if (Math.abs(p - last) < 0.004) return;
      last = p;
      return () => el.style.setProperty('--p', p.toFixed(3));
    });
  }, [span]);

  return ref;
}
