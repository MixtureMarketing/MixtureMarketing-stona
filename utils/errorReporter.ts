/**
 * Minimalny raporter błędów frontu (darmowy, bez zewnętrznego SaaS).
 *
 * `vite.config.ts` wycina `console.*` w produkcji, więc błędy przeglądarki
 * dotąd ginęły bez śladu. Raporter wysyła je przez `navigator.sendBeacon` do
 * `/api/client-error` (functions/api/client-error.ts → Workers Logs).
 *
 * Zasady: max 5 zgłoszeń na sesję karty (sessionStorage) + dedupe, bez danych
 * osobowych (URL bez query/hash, e-maile i ciągi cyfr maskowane), nigdy nie
 * rzuca, działa tylko w buildzie produkcyjnym i nigdy w prerenderze (Puppeteer).
 */
import { safeGetItem, safeSetItem } from './safeStorage';

export const CLIENT_ERROR_ENDPOINT = '/api/client-error';
export const MAX_REPORTS_PER_SESSION = 5;
const SESSION_KEY = 'mm_err_reports';
const MAX_MESSAGE = 500;
const MAX_STACK = 2048;

const seen = new Set<string>();

/** Maskuje e-maile i dłuższe ciągi cyfr (telefony, NIP-y, tokeny liczbowe). */
export function scrubPii(text: string): string {
  return text
    .replace(/[^\s@"'<>()]+@[^\s@"'<>()]+\.[a-z]{2,}/gi, '[email]')
    .replace(/\+?\d[\d\s-]{7,}\d/g, '[digits]');
}

function sessionCount(): number {
  return parseInt(safeGetItem(SESSION_KEY, 'session') || '0', 10) || 0;
}

export interface ClientErrorReport {
  kind: string;
  message: string;
  stack?: string;
  url: string;
  ua: string;
  release?: string;
}

function describeNonError(err: unknown): string {
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err) ?? String(err);
  } catch {
    return String(err);
  }
}

export function buildReport(kind: string, err: unknown): ClientErrorReport {
  const e = err instanceof Error ? err : new Error(describeNonError(err));
  const release = import.meta.env.VITE_RELEASE as string | undefined;
  return {
    kind: kind.slice(0, 40),
    message: scrubPii(`${e.name}: ${e.message}`).slice(0, MAX_MESSAGE),
    stack: e.stack ? scrubPii(e.stack).slice(0, MAX_STACK) : undefined,
    url: `${window.location.origin}${window.location.pathname}`, // bez query/hash
    ua: navigator.userAgent.slice(0, 256),
    ...(release ? { release: release.slice(0, 64) } : {}),
  };
}

/** Zgłasza błąd (fire-and-forget). Zwraca true, gdy zgłoszenie wyszło. */
export function reportError(kind: string, err: unknown): boolean {
  try {
    if (typeof window === 'undefined' || window.isPrerendering) return false;
    // Tylko build produkcyjny (prod i preview *.pages.dev) — nie dev serwer ani testy jednostkowe.
    if (import.meta.env.MODE !== 'production') return false;
    const report = buildReport(kind, err);
    const key = `${report.kind}|${report.message}`;
    if (seen.has(key)) return false;
    const count = sessionCount();
    if (count >= MAX_REPORTS_PER_SESSION) return false;
    seen.add(key);
    safeSetItem(SESSION_KEY, String(count + 1), 'session');

    const body = JSON.stringify(report);
    const blob = new Blob([body], { type: 'application/json' });
    if (
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon(CLIENT_ERROR_ENDPOINT, blob)
    ) {
      return true;
    }
    void fetch(CLIENT_ERROR_ENDPOINT, {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
    return true;
  } catch {
    return false; // raporter nigdy nie może sam wywołać błędu
  }
}

let installed = false;

/** window 'error' + 'unhandledrejection' → reportError. Idempotentne. */
export function installGlobalErrorHandlers(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (ev: ErrorEvent) => {
    // Błędy ładowania zasobów (img/script) nie mają ev.error i nie są wyjątkami JS.
    if (!ev.error && !ev.message) return;
    reportError('window.error', ev.error ?? ev.message);
  });
  window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
    reportError('unhandledrejection', ev.reason);
  });
}

/** Tylko do testów. */
export function __resetErrorReporterForTests(): void {
  seen.clear();
}
