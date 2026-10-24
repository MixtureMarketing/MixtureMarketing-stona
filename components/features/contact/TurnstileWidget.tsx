/**
 * Niewidoczny widget Cloudflare Turnstile — zastępuje `@marsidev/react-turnstile` (usunięty).
 * Renderuje JAWNIE przez reużywalny `utils/turnstile` (bez onload-callbacku — patrz nota tam),
 * co eliminuje wyścig psujący inicjalizację w SPA/Zaraz (incydent lead-capture 2026-07-16).
 * Ten sam wzorzec użyje publiczny kalkulator (f4b).
 *
 * Handle imperatywne: `getToken()` (na submit) + `reset()` + `prepare()`. Prerender (Puppeteer)
 * pomijany.
 *
 * `defer`: skrypt Turnstile (api.js, ~85 kB) NIE ładuje się przy montowaniu, tylko przy
 * `prepare()` (rodzic woła je przy pierwszej interakcji z formularzem: focus/pointerdown) albo
 * najpóźniej przy `getToken()` — który wtedy CZEKA na załadowanie i render widgetu.
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import {
  renderInvisibleTurnstile,
  getTurnstileToken,
  removeTurnstile,
  type TurnstileWidgetHandle,
} from '../../../utils/turnstile';

interface TurnstileWidgetProps {
  siteKey: string;
  /** Ładuj skrypt dopiero przy prepare()/getToken(), nie przy montowaniu. */
  defer?: boolean;
}

const HIDDEN_STYLE: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  right: 0,
  zIndex: -1,
};

// Górna granica czekania na skrypt + render w getToken() (loader ma własny 10 s na
// `window.turnstile`, ale `script.onload` bez limitu — formularz nie może wisieć).
const READY_TIMEOUT_MS = 15000;

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  ({ siteKey, defer = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const renderRef = useRef<Promise<string> | null>(null);
    // Generacja montowania: render, który dojedzie po odmontowaniu (lub po
    // podwójnym efekcie StrictMode), jest usuwany zamiast nadpisać aktualny widget.
    const genRef = useRef(0);

    // Idempotentnie: ładuje skrypt i renderuje widget (raz na montowanie).
    const ensureRendered = useCallback((): Promise<string> => {
      if (widgetIdRef.current) return Promise.resolve(widgetIdRef.current);
      if (renderRef.current) return renderRef.current;
      const container = containerRef.current;
      // Prerender (isPrerendering) i brak DOM: nie ładujemy skryptu — brak interakcji, tylko szum.
      if (typeof window === 'undefined' || window.isPrerendering || !container) {
        return Promise.reject(new Error('TURNSTILE_NOT_READY'));
      }
      const gen = genRef.current;
      renderRef.current = renderInvisibleTurnstile(container, siteKey).then(
        (id) => {
          if (gen !== genRef.current) {
            removeTurnstile(id);
            throw new Error('TURNSTILE_NOT_READY');
          }
          widgetIdRef.current = id;
          return id;
        },
        () => {
          if (gen === genRef.current) renderRef.current = null; // loader zawiódł — kolejna próba przy następnym wywołaniu
          throw new Error('TURNSTILE_NOT_READY');
        },
      );
      return renderRef.current;
    }, [siteKey]);

    useEffect(() => {
      if (!defer) ensureRendered().catch(() => undefined);
      return () => {
        genRef.current += 1;
        renderRef.current = null;
        if (widgetIdRef.current) {
          removeTurnstile(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [defer, ensureRendered]);

    useImperativeHandle(
      ref,
      () => ({
        getToken: async () => {
          let timer: ReturnType<typeof setTimeout> | undefined;
          const timeout = new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error('TURNSTILE_NOT_READY')), READY_TIMEOUT_MS);
          });
          try {
            const id = await Promise.race([ensureRendered(), timeout]);
            return await getTurnstileToken(id);
          } finally {
            clearTimeout(timer);
          }
        },
        prepare: () => {
          ensureRendered().catch(() => undefined);
        },
        reset: () => {
          const id = widgetIdRef.current;
          if (!id) return;
          try {
            window.turnstile?.reset(id);
          } catch {
            /* ignore */
          }
        },
      }),
      [ensureRendered],
    );

    return <div ref={containerRef} style={HIDDEN_STYLE} aria-hidden="true" />;
  },
);
TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
