// Reużywalny loader Cloudflare Turnstile z JAWNYM renderem (render=explicit, BEZ onload-callback).
// Powód (incydent prod 2026-07-16): `@marsidev/react-turnstile` wstrzykuje api.js z
// `onload=onloadTurnstileCallback`; w tym SPA (+ Zaraz auto-inject) callback przegrywa wyścig ze
// skryptem → widget NIE renderuje się → `#cf-turnstile` pusty → execute()/getResponse() timeoutuje
// → formularz kontaktowy nie tworzy leada. Tu kontrolujemy ładowanie sami: jeden idempotentny
// wstrzyk skryptu, poll na `window.turnstile`, i jawny `turnstile.render()`. Odporne na re-mount
// SPA i na Zaraz. Ten sam moduł używa formularz kontaktowy ORAZ publiczny kalkulator (f4b).

export interface TurnstileRenderOptions {
  sitekey: string;
  size?: 'invisible' | 'normal' | 'compact' | 'flexible';
  execution?: 'render' | 'execute';
  appearance?: 'always' | 'execute' | 'interaction-only';
  language?: string;
}

export interface TurnstileAPI {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
  execute: (widget: string | HTMLElement, options?: unknown) => void;
  reset: (widget?: string | HTMLElement) => void;
  getResponse: (widget?: string | HTMLElement) => string | undefined;
  remove: (widget: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileAPI;
    isPrerendering?: boolean;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SCRIPT_ID = 'cf-turnstile-script';
const READY_TIMEOUT_MS = 10000;

let scriptPromise: Promise<TurnstileAPI> | null = null;

/**
 * Wstrzykuje api.js DOKŁADNIE RAZ (idempotentnie) i resolve, gdy `window.turnstile` jest gotowe.
 * Brak parametru `onload` w URL — nie polegamy na globalnym callbacku (to jego wyścig psuł widget);
 * zamiast tego pollujemy `window.turnstile` po `script.onload`. Kolejne wywołania → ta sama obietnica.
 */
export function loadTurnstile(): Promise<TurnstileAPI> {
  if (typeof window === 'undefined' || typeof document === 'undefined')
    return Promise.reject(new Error('TURNSTILE_NO_DOM'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<TurnstileAPI>((resolve, reject) => {
    const waitReady = (deadline: number) => {
      if (window.turnstile) return resolve(window.turnstile);
      if (Date.now() > deadline) {
        scriptPromise = null; // pozwól spróbować ponownie później
        return reject(new Error('TURNSTILE_SCRIPT_TIMEOUT'));
      }
      setTimeout(() => waitReady(deadline), 50);
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      waitReady(Date.now() + READY_TIMEOUT_MS);
      return;
    }

    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => waitReady(Date.now() + READY_TIMEOUT_MS);
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error('TURNSTILE_SCRIPT_ERROR'));
    };
    document.head.appendChild(s);
  });

  return scriptPromise;
}

/** Renderuje NIEWIDOCZNY widget (invisible + execution 'execute') do kontenera; zwraca widgetId. */
export async function renderInvisibleTurnstile(
  container: HTMLElement,
  sitekey: string,
): Promise<string> {
  const ts = await loadTurnstile();
  return ts.render(container, {
    sitekey,
    size: 'invisible',
    execution: 'execute',
    appearance: 'interaction-only',
    language: 'pl',
  });
}

/**
 * reset + execute + poll `getResponse` po WIDGET-ID (nie po globalnym selektorze). Zwraca token
 * albo rzuca `TURNSTILE_TIMEOUT`. Reset czyści zużyty/wygasły token przed świeżym wyzwaniem.
 */
export async function getTurnstileToken(widgetId: string, timeoutMs = 20000): Promise<string> {
  const ts = window.turnstile;
  if (!ts) throw new Error('TURNSTILE_NOT_READY');
  try {
    ts.reset(widgetId);
  } catch {
    /* widget nie w pełni gotowy — ignorujemy, execute i tak spróbuje */
  }
  ts.execute(widgetId);

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const token = ts.getResponse(widgetId);
    if (token) return token;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('TURNSTILE_TIMEOUT');
}

/** Kontrakt imperatywny wrappera React (TurnstileWidget) — używany przez useContactForm i f4b. */
export interface TurnstileWidgetHandle {
  /** reset + execute + token (rzuca TURNSTILE_NOT_READY/TIMEOUT). */
  getToken: () => Promise<string>;
  reset: () => void;
}

/** Usuwa widget (cleanup przy unmount). Idempotentne — błędy ignorowane. */
export function removeTurnstile(widgetId: string): void {
  try {
    window.turnstile?.remove(widgetId);
  } catch {
    /* ignore */
  }
}

/** TESTY: reset stanu modułu (obietnica skryptu) między przypadkami. */
export function __resetTurnstileLoaderForTests(): void {
  scriptPromise = null;
}
