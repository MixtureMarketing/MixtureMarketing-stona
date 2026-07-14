import React, { useState } from 'react';
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
}

const QuoteEditor: React.FC<Props> = ({
  quoteId,
  archetype,
  initialAnswers,
  library,
  sessionToken,
}) => {
  const state = useQuoteState({ quoteId, archetype, library, sessionToken, initialAnswers });
  const [phase, setPhase] = useState<'wizard' | 'validation'>('wizard');

  return (
    <QuoteProvider state={state} library={library}>
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
