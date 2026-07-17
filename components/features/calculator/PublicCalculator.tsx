// Orkiestrator publicznego kalkulatora — spina hook (stan/fetch/submit) z widgetem Turnstile
// (invisible-execute, reużyty z fixa lead-capture) i renderem stanów: loading / błąd ładowania /
// formularz / wynik. Zero logiki liczenia po stronie UI (silnik żyje na serwerze).
import React, { useRef } from 'react';
import { usePublicCalculator } from '../../../hooks/usePublicCalculator';
import TurnstileWidget from '../contact/TurnstileWidget';
import type { TurnstileWidgetHandle } from '../../../utils/turnstile';
import { SITE_CONFIG } from '../../../config/site';
import CalculatorForm from './CalculatorForm';
import CalculatorResult from './CalculatorResult';
import { CalculatorLoading, CalculatorLoadError } from './CalculatorStates';

const PublicCalculator: React.FC = () => {
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const c = usePublicCalculator(turnstileRef);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10 shadow-xl">
      <TurnstileWidget ref={turnstileRef} siteKey={SITE_CONFIG.contact.turnstileSiteKey} />

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
    </div>
  );
};

export default PublicCalculator;
