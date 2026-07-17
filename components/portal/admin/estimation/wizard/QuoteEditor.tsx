import React, { useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { Answers } from '@/lib/estimation/types';
import { useQuoteState } from '../useQuoteState';
import { QuoteProvider } from '../QuoteContext';
import type { EstimationLibrary } from '../useEstimationLibrary';
import WizardSteps from './WizardSteps';
import LivePreviewPanel from './LivePreviewPanel';
import ValidationScreen from './ValidationScreen';
import ResultScreen from './ResultScreen';

// Edytor draftu (po kroku Platforma): wizard + podgląd na żywo → walidacja → finalize → wynik (f1c).
// Trzyma stan przez useQuoteState i rozdaje przez QuoteProvider.
interface Props {
  quoteId: number;
  archetype: string;
  initialAnswers: Answers;
  library: EstimationLibrary;
  sessionToken: string | null;
  onChangePlatform: () => void;
}

const QuoteEditor: React.FC<Props> = ({
  quoteId,
  archetype,
  initialAnswers,
  library,
  sessionToken,
  onChangePlatform,
}) => {
  const state = useQuoteState({ quoteId, archetype, library, sessionToken, initialAnswers });
  const [phase, setPhase] = useState<'wizard' | 'validation' | 'result'>('wizard');
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const archetypeName = library.archetypes.find((a) => a.code === archetype)?.name ?? archetype;

  // Finalize: najpierw FLUSH wiszących odpowiedzi, potem serwerowe przeliczenie + snapshot.
  const finalize = useCallback(async () => {
    setFinalizing(true);
    setFinalizeError(null);
    try {
      await state.flush();
      const res = await fetch('/api/admin/estimation/quote-finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ id: quoteId, overrides: state.overrides }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string; errors?: string[] };
        throw new Error(err.error ?? err.errors?.join('; ') ?? `HTTP ${res.status}`);
      }
      setPhase('result');
    } catch (e) {
      setFinalizeError(e instanceof Error ? e.message : 'Nie udało się sfinalizować wyceny');
    } finally {
      setFinalizing(false);
    }
  }, [quoteId, sessionToken, state]);

  return (
    <QuoteProvider state={state} library={library}>
      {/* Archetyp = nagłówek read-only (wybrany w kroku Platforma); zmiana wraca do kroku Platforma. */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <p className="text-sm">
          <span className="text-gray-500">Platforma:</span>{' '}
          <span className="font-black text-dark">{archetypeName}</span>
        </p>
        {phase !== 'result' && (
          <button
            type="button"
            onClick={onChangePlatform}
            className="text-sm font-bold text-gray-600 flex items-center gap-1 hover:text-dark"
          >
            <RefreshCw size={14} /> Zmień platformę
          </button>
        )}
      </div>

      {phase === 'result' ? (
        <ResultScreen quoteId={quoteId} sessionToken={sessionToken} />
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div>
            {phase === 'wizard' ? (
              <WizardSteps onDone={() => setPhase('validation')} />
            ) : (
              <ValidationScreen
                onBack={() => setPhase('wizard')}
                onFinalize={finalize}
                finalizing={finalizing}
                finalizeError={finalizeError}
              />
            )}
          </div>
          <LivePreviewPanel />
        </div>
      )}
    </QuoteProvider>
  );
};

export default QuoteEditor;
