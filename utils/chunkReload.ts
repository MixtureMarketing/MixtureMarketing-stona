import { safeGetItem, safeSetItem } from './safeStorage';

/**
 * Obsługa nieaktualnych chunków po deployu.
 *
 * Po wdrożeniu nowej wersji hashe plików w /assets/ się zmieniają, a stare
 * znikają z Cloudflare Pages. Użytkownik z otwartą starą wersją przy przejściu
 * na podstronę (lazy route) dostaje błąd importu chunka. Vite zgłasza to
 * zdarzeniem `vite:preloadError` (cancelable) — przeładowujemy wtedy stronę RAZ,
 * żeby pobrać aktualny index.html i nowe chunki.
 *
 * Ochrona przed pętlą: znacznik czasu w sessionStorage. Jeśli przeładowanie było
 * < RELOAD_GUARD_MS temu (czyli błąd dotyczy także nowej wersji), nie przeładowujemy
 * ponownie — błąd idzie dalej do ErrorBoundary. Gdy storage jest niedostępny,
 * również nie przeładowujemy (nie da się zagwarantować braku pętli).
 */

export const CHUNK_RELOAD_KEY = 'mm:chunk-reload-at';
export const RELOAD_GUARD_MS = 10_000;

interface InstallOptions {
  target?: Window;
  reload?: () => void;
  now?: () => number;
}

export const installChunkReloadHandler = ({
  target = window,
  reload = () => target.location.reload(),
  now = () => Date.now(),
}: InstallOptions = {}) => {
  let reloading = false;

  const handler = (event: Event) => {
    // Prerender (Puppeteer) ma się wywrócić głośno, a nie przeładowywać.
    if (target.isPrerendering) return;

    // Kilka chunków może paść naraz — reload już zlecony, tłumimy kolejne błędy.
    if (reloading) {
      event.preventDefault();
      return;
    }

    const ts = now();
    const last = Number(safeGetItem(CHUNK_RELOAD_KEY, 'session'));
    if (last && ts - last < RELOAD_GUARD_MS) return;

    if (!safeSetItem(CHUNK_RELOAD_KEY, String(ts), 'session')) return;

    reloading = true;
    event.preventDefault();
    reload();
  };

  target.addEventListener('vite:preloadError', handler);
  return () => target.removeEventListener('vite:preloadError', handler);
};
