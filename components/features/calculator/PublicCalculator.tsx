// Orkiestrator publicznego kalkulatora — spina hook (stan/fetch/submit) z widgetem Turnstile
// (invisible-execute, reużyty z fixa lead-capture) i renderem stanów: loading / błąd ładowania /
// formularz / wynik. Zero logiki liczenia po stronie UI (silnik żyje na serwerze).
import React, { useEffect, useRef } from 'react';
import { usePublicCalculator } from '../../../hooks/usePublicCalculator';
import { useLivePriceRange } from '../../../hooks/useLivePriceRange';
import TurnstileWidget from '../contact/TurnstileWidget';
import type { TurnstileWidgetHandle } from '../../../utils/turnstile';
import { SITE_CONFIG } from '../../../config/site';
import { PUBLIC_QUOTE_TURNSTILE_ACTION } from '../../../lib/estimation/turnstileAction';
import CalculatorForm from './CalculatorForm';
import LivePriceBar from './LivePriceBar';
import { pickAnswers } from './formLogic';
import ConfigPreview from './ConfigPreview';
import {
  isBookingEmbedEnabled,
  isConfigLinkEnabled,
  isConfigPreviewEnabled,
  isLeadConfigEnabled,
  isLivePriceBarEnabled,
} from './livePrice';
import ConfigLinkButtons from './ConfigLinkButtons';
import { buildConfigLinkUrl, encodeConfigLink, readConfigLink } from './configLink';
import CalculatorResult from './CalculatorResult';
import BookingEmbed from './BookingEmbed';
import { CalculatorLoading, CalculatorLoadError } from './CalculatorStates';

const PublicCalculator: React.FC = () => {
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const c = usePublicCalculator(turnstileRef);
  // Turnstile (api.js ~85 kB) dopiero przy pierwszej interakcji z kalkulatorem, nie przy
  // wejściu na stronę; submit i tak poczeka na skrypt (getToken w trybie defer).
  const prepareCaptcha = () => turnstileRef.current?.prepare?.();

  // Pasek widełek na żywo (MIX-1385): za przełącznikiem, domyślnie wyłączony; tylko w trakcie
  // wypełniania (na ekranie wyniku widełki pokazuje CalculatorResult).
  const filling = c.phase === 'ready' || c.phase === 'submitting';
  const liveEnabled = isLivePriceBarEnabled() && filling;
  // Podgląd konfiguracji (MIX-1790): osobny przełącznik; lista „Twój zakres" przychodzi w tej
  // samej odpowiedzi podglądu, więc zapytania idą, gdy włączony jest którykolwiek z dwóch.
  const configEnabled = isConfigPreviewEnabled() && filling;
  const live = useLivePriceRange({
    enabled: liveEnabled || configEnabled,
    answers: pickAnswers(c.questions, c.answers),
    // Token po kolei z wysyłką; w trakcie wysyłki odmowa (wyścig Turnstile, MIX-1412).
    getCaptchaToken: c.getPreviewToken,
  });

  // Link do konfiguracji (MIX-1791): za przełącznikiem VITE_MM_CONFIG_LINK. Wyłączony = parametr
  // `k` nie jest czytany i nie ma przycisków. Odczyt raz, po załadowaniu pytań; odpowiedzi idą
  // przez setAnswer, więc pasek ceny i podgląd zachowują się jak po ręcznych odpowiedziach.
  const linkOn = isConfigLinkEnabled();
  const linkRead = useRef(false);
  const { phase, questions, setAnswer } = c;
  useEffect(() => {
    if (!linkOn || linkRead.current || phase !== 'ready') return;
    linkRead.current = true;
    const r = readConfigLink(window.location.search, questions);
    if (!r.ok) return;
    for (const [code, value] of Object.entries(r.answers)) setAnswer(code, value);
  }, [linkOn, phase, questions, setAnswer]);
  const linkK = linkOn && filling ? encodeConfigLink(c.questions, c.answers) : null;

  return (
    <div
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10 shadow-xl"
      onFocusCapture={prepareCaptcha}
      onPointerDownCapture={prepareCaptcha}
    >
      <TurnstileWidget
        ref={turnstileRef}
        siteKey={SITE_CONFIG.contact.turnstileSiteKey}
        action={PUBLIC_QUOTE_TURNSTILE_ACTION}
        defer
      />

      {c.phase === 'loading' && <CalculatorLoading />}

      {c.phase === 'loadError' && <CalculatorLoadError onRetry={() => window.location.reload()} />}

      {c.phase === 'done' && c.result && (
        <CalculatorResult
          priceRange={c.result.priceRange}
          onReset={c.reset}
          // MIX-1814 (Z9): ramka harmonogramu dopiero na ekranie wyniku (po zapisie leada).
          booking={isBookingEmbedEnabled() ? <BookingEmbed /> : null}
        />
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
          leadConfig={isLeadConfigEnabled()}
          phone={c.phone}
          setPhone={c.setPhone}
          liveBar={liveEnabled ? <LivePriceBar state={live} /> : null}
          configPreview={
            configEnabled ? (
              <ConfigPreview goal={c.answers.project_goal} scope={live.scope} />
            ) : null
          }
          configLink={
            linkK ? (
              <ConfigLinkButtons link={buildConfigLinkUrl(window.location.href, linkK)} />
            ) : null
          }
        />
      )}
    </div>
  );
};

export default PublicCalculator;
