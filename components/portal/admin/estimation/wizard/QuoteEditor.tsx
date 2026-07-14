import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { Answers } from '@/lib/estimation/types';
import { useQuoteState } from '../useQuoteState';
import { QuoteProvider } from '../QuoteContext';
import type { EstimationLibrary } from '../useEstimationLibrary';
import WizardSteps from './WizardSteps';
import LivePreviewPanel from './LivePreviewPanel';
import ValidationScreen from './ValidationScreen';

// Edytor draftu (po kroku Platforma): wizard + podgląd na żywo → walidacja techniczna.
// Trzyma stan przez useQuoteState i rozdaje przez QuoteProvider. Finalize = f1c.
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
  const [phase, setPhase] = useState<'wizard' | 'validation'>('wizard');
  const archetypeName = library.archetypes.find((a) => a.code === archetype)?.name ?? archetype;

  return (
    <QuoteProvider state={state} library={library}>
      {/* Archetyp = nagłówek read-only (wybrany w kroku Platforma); zmiana wraca do kroku Platforma. */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <p className="text-sm">
          <span className="text-gray-500">Platforma:</span>{' '}
          <span className="font-black text-dark">{archetypeName}</span>
        </p>
        <button
          type="button"
          onClick={onChangePlatform}
          className="text-sm font-bold text-gray-600 flex items-center gap-1 hover:text-dark"
        >
          <RefreshCw size={14} /> Zmień platformę
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          {phase === 'wizard' ? (
            <WizardSteps onDone={() => setPhase('validation')} />
          ) : (
            <ValidationScreen onBack={() => setPhase('wizard')} />
          )}
        </div>
        <LivePreviewPanel />
      </div>
    </QuoteProvider>
  );
};

export default QuoteEditor;
