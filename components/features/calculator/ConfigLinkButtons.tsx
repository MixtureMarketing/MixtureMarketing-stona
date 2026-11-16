// MIX-1791 (Z7): przyciski „Skopiuj link" i „Udostępnij" pod przyciskami Wstecz/Dalej.
// „Udostępnij" tylko tam, gdzie przeglądarka ma systemowe udostępnianie (Web Share).
// GA4: jedno `calculator_share` na kliknięcie, tylko `method` (copy | native) i `source`;
// bez odpowiedzi, e-maila i linku (allowlista utils/ga4Allowlist.ts i tak by je odrzuciła).
import React, { useState } from 'react';
import { trackCalculatorShare } from '../../../utils/calculatorTracking';

// min-h-11 = 44 px: cel dotyku (próg firmy, WCAG 2.5.5), jak przyciski opcji (QuestionField).
const BTN =
  'min-h-11 min-w-11 px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.03] text-sm font-medium text-gray-200 hover:border-white/30 transition focus:outline-none focus:ring-2 focus:ring-primary/60';

type Status = 'idle' | 'copied' | 'manual';

const ConfigLinkButtons: React.FC<{ link: string }> = ({ link }) => {
  const [status, setStatus] = useState<Status>('idle');
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async () => {
    trackCalculatorShare({ method: 'copy' });
    try {
      await navigator.clipboard.writeText(link);
      setStatus('copied');
    } catch {
      // Brak schowka albo odmowa przeglądarki: pokazujemy link do ręcznego skopiowania.
      setStatus('manual');
    }
  };

  const share = async () => {
    trackCalculatorShare({ method: 'native' });
    try {
      await navigator.share({ title: 'Moja konfiguracja strony', url: link });
    } catch {
      // Anulowanie okna udostępniania to nie błąd; nic nie pokazujemy.
    }
  };

  return (
    <div data-testid="config-link" className="space-y-2">
      <p className="text-sm text-gray-400">
        Wyślij te odpowiedzi wspólnikowi: link otworzy formularz z tymi samymi wyborami.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={copy} className={BTN}>
          Skopiuj link
        </button>
        {canShare && (
          <button type="button" onClick={share} className={BTN}>
            Udostępnij
          </button>
        )}
      </div>
      <p aria-live="polite" className="text-sm text-gray-300">
        {status === 'copied' ? 'Link skopiowany.' : ''}
      </p>
      {status === 'manual' && (
        <div className="space-y-1">
          <label htmlFor="calc-config-link" className="block text-sm text-gray-300">
            Nie udało się skopiować automatycznie. Skopiuj link poniżej:
          </label>
          <input
            id="calc-config-link"
            type="text"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white"
          />
        </div>
      )}
    </div>
  );
};

export default ConfigLinkButtons;
