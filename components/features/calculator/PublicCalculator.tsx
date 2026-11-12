// Orkiestrator publicznego kalkulatora — spina hook (stan/fetch/submit) z widgetem Turnstile
// (invisible-execute, reużyty z fixa lead-capture) i renderem stanów: loading / błąd ładowania /
// formularz / wynik. Zero logiki liczenia po stronie UI (silnik żyje na serwerze).
import React, { useRef } from 'react';
import { usePublicCalculator } from '../../../hooks/usePublicCalculator';
import { useLivePriceRange } from '../../../hooks/useLivePriceRange';
import TurnstileWidget from '../contact/TurnstileWidget';
import type { TurnstileWidgetHandle } from '../../../utils/turnstile';
import { SITE_CONFIG } from '../../../config/site';
import CalculatorForm from './CalculatorForm';
import LivePriceBar from './LivePriceBar';
import { pickAnswers } from './formLogic';
import { isLivePriceBarEnabled } from './livePrice';
import CalculatorResult from './CalculatorResult';
import { CalculatorLoading, CalculatorLoadError } from './CalculatorStates';

const PublicCalculator: React.FC = () => {
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const c = usePublicCalculator(turnstileRef);
  // Turnstile (api.js ~85 kB) dopiero przy pierwszej interakcji z kalkulatorem, nie przy
  // wejściu na stronę; submit i tak poczeka na skrypt (getToken w trybie defer).
  const prepareCaptcha = () => turnstileRef.current?.prepare?.();

  // Pasek widełek na żywo (MIX-1385): za przełącznikiem, domyślnie wyłączony; tylko w trakcie
  // wypełniania (na ekranie wyniku widełki pokazuje CalculatorResult).
  const liveEnabled = isLivePriceBarEnabled() && (c.phase === 'ready' || c.phase === 'submitting');
  const live = useLivePriceRange({
    enabled: liveEnabled,
    answers: pickAnswers(c.questions, c.answers),
    getCaptchaToken: () => {
      const handle = turnstileRef.current;
      if (!handle) return Promise.reject(new Error('TURNSTILE_NOT_READY'));
      return handle.getToken();
    },
  });

  return (
    <div
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10 shadow-xl"
      onFocusCapture={prepareCaptcha}
      onPointerDownCapture={prepareCaptcha}
    >
      <TurnstileWidget ref={turnstileRef} siteKey={SITE_CONFIG.contact.turnstileSiteKey} defer />

      {c.phase === 'loading' && <CalculatorLoading />}

      {c.phase === 'loadError' && <CalculatorLoadError onRetry={() => window.location.reload()} />}

      {c.phase === 'done' && c.result && (
        <CalculatorResult priceRange={c.result.priceRange} onReset={c.reset} />
      )}

      {(c.phase === 'ready' || c.phase === 'submitting') && (
        <CalculatorForm
          visible={c.visible}
          answers={c.answers}
          setAnswer={c.setAnswer}
          errors={c.errors}
          email={c.email}
          setEmail={c.setEmail}
          websiteVerify={c.websiteVerify}
          setWebsiteVerify={c.setWebsiteVerify}
          submitError={c.submitError}
          submitting={c.phase === 'submitting'}
          onSubmit={c.submit}
        />
      )}

      {liveEnabled && <LivePriceBar state={live} />}
    </div>
  );
};

export default PublicCalculator;
