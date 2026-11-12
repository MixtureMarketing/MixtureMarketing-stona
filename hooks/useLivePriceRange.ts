// Widełki na żywo (MIX-1385, Z5 z MIX-1377): po 400 ms ciszy od ostatniej zmiany odpowiedzi pyta
// serwer o podgląd, pamięta wynik dla tych samych odpowiedzi (0 nowych zapytań przy powrocie do
// wcześniejszego zestawu) i nie zapamiętuje błędów. Wyłączony przełącznik = zero zapytań.
import { useEffect, useRef, useState } from 'react';
import { isPreviewUnavailable, requestPricePreview } from '../services/pricePreviewService';
import type { PriceRange } from '../services/calculatorService';
import { LIVE_PRICE_DEBOUNCE_MS, answersHash } from '../components/features/calculator/livePrice';

export type LivePriceStatus = 'idle' | 'loading' | 'ok' | 'rateLimited' | 'error';

export interface LivePriceState {
  status: LivePriceStatus;
  /**
   * Ostatnie znane widełki (zostają widoczne w trakcie liczenia nowych). MIX-1466: po błędzie,
   * przekroczeniu czasu albo 429 = null, bo stara cena nie pasuje już do nowych odpowiedzi.
   */
  priceRange: PriceRange | null;
}

interface Options {
  enabled: boolean;
  /** Odpowiedzi już ograniczone do kodów publicznych (pickAnswers). */
  answers: Record<string, unknown>;
  /** Token Turnstile dla pierwszego zapytania (potem serwer wydaje token podglądu). */
  getCaptchaToken: () => Promise<string>;
}

const IDLE: LivePriceState = { status: 'idle', priceRange: null };

export function useLivePriceRange({ enabled, answers, getCaptchaToken }: Options): LivePriceState {
  const [state, setState] = useState<LivePriceState>(IDLE);
  const memo = useRef(new Map<string, PriceRange>());
  const previewToken = useRef<string | undefined>(undefined);
  // MIX-1466: endpoint podglądu nie istnieje na tym wdrożeniu (404/405/501): do przeładowania
  // strony już nie pytamy (ani serwera, ani Turnstile), pasek pokazuje komunikat zastępczy.
  const unavailable = useRef(false);
  const captchaRef = useRef(getCaptchaToken);
  const answersRef = useRef(answers);
  useEffect(() => {
    captchaRef.current = getCaptchaToken;
    answersRef.current = answers;
  });

  const hash = answersHash(answers);
  const hasAnswers = hash !== '[]';

  useEffect(() => {
    if (!enabled || !hasAnswers) return;
    const cached = memo.current.get(hash);
    if (cached) {
      setState({ status: 'ok', priceRange: cached });
      return;
    }
    if (unavailable.current) {
      setState({ status: 'error', priceRange: null });
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState((s) => ({ status: 'loading', priceRange: s.priceRange }));
      const send = async (withCaptcha: boolean) => {
        const payload = withCaptcha
          ? { answers: answersRef.current, captcha_token: await captchaRef.current() }
          : { answers: answersRef.current, preview_token: previewToken.current };
        return requestPricePreview(payload, controller.signal);
      };
      try {
        let res = await send(!previewToken.current);
        // Token podglądu wygasł albo został odrzucony: jeden powrót do Turnstile.
        if (!res.ok && (res.status === 401 || res.status === 403) && previewToken.current) {
          previewToken.current = undefined;
          res = await send(true);
        }
        if (cancelled) return;
        if (res.ok) {
          if (res.previewToken) previewToken.current = res.previewToken;
          memo.current.set(hash, res.priceRange);
          setState({ status: 'ok', priceRange: res.priceRange });
        } else {
          if (isPreviewUnavailable(res.status)) unavailable.current = true;
          const status = res.status === 429 ? 'rateLimited' : 'error';
          setState({ status, priceRange: null });
        }
      } catch {
        if (!cancelled) setState({ status: 'error', priceRange: null });
      }
    }, LIVE_PRICE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, hash, hasAnswers]);

  return enabled && hasAnswers ? state : IDLE;
}
