/**
 * Niewidoczny widget Cloudflare Turnstile — zastępuje `@marsidev/react-turnstile` (usunięty).
 * Renderuje JAWNIE przez reużywalny `utils/turnstile` (bez onload-callbacku — patrz nota tam),
 * co eliminuje wyścig psujący inicjalizację w SPA/Zaraz (incydent lead-capture 2026-07-16).
 * Ten sam wzorzec użyje publiczny kalkulator (f4b).
 *
 * Handle imperatywne: `getToken()` (na submit) + `reset()`. Prerender (Puppeteer) pomijany.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  renderInvisibleTurnstile,
  getTurnstileToken,
  removeTurnstile,
  type TurnstileWidgetHandle,
} from '../../../utils/turnstile';

interface TurnstileWidgetProps {
  siteKey: string;
}

const HIDDEN_STYLE: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  right: 0,
  zIndex: -1,
};

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  ({ siteKey }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
      // Prerender (isPrerendering) i brak DOM: nie ładujemy skryptu — brak interakcji, tylko szum.
      if (typeof window === 'undefined' || window.isPrerendering) return;
      const container = containerRef.current;
      if (!container) return;

      let cancelled = false;
      renderInvisibleTurnstile(container, siteKey)
        .then((id) => {
          if (cancelled) removeTurnstile(id);
          else widgetIdRef.current = id;
        })
        .catch(() => {
          /* loader zawiódł — getToken() rzuci TURNSTILE_NOT_READY, formularz pokaże błąd */
        });

      return () => {
        cancelled = true;
        if (widgetIdRef.current) {
          removeTurnstile(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [siteKey]);

    useImperativeHandle(
      ref,
      () => ({
        getToken: () => {
          const id = widgetIdRef.current;
          if (!id) return Promise.reject(new Error('TURNSTILE_NOT_READY'));
          return getTurnstileToken(id);
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
      [],
    );

    return <div ref={containerRef} style={HIDDEN_STYLE} aria-hidden="true" />;
  },
);
TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
