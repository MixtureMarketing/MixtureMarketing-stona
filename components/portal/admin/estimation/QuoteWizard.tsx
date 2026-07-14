import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Answers } from '@/lib/estimation/types';
import { useEstimationLibrary } from './useEstimationLibrary';
import PlatformStep, { type PlatformResult } from './PlatformStep';
import QuoteEditor from './wizard/QuoteEditor';

interface Props {
  sessionToken: string | null;
  onCreated: (quoteId: number) => void;
  onCancel: () => void;
}

interface Created {
  id: number;
  archetype: string;
  answers: Answers;
}

// f1a: krok „Platforma" → utworzenie draftu. f1b: pełny wizard + podgląd + walidacja (QuoteEditor).
const QuoteWizard: React.FC<Props> = ({ sessionToken, onCreated, onCancel }) => {
  const { library, loading, error } = useEstimationLibrary(sessionToken);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);

  const handleConfirm = async (r: PlatformResult) => {
    if (!name.trim()) {
      setSaveError('Podaj nazwę wyceny przed utworzeniem.');
      return;
    }
    setBusy(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/admin/estimation/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({
          name: name.trim(),
          client_name: clientName.trim() || null,
          archetype_code: r.archetypeCode,
          archetype_recommended: r.recommended,
          archetype_reason: r.reason,
          answers: r.answers,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { id: number };
      setCreated({ id: data.id, archetype: r.archetypeCode, answers: r.answers });
      onCreated(data.id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Nie udało się utworzyć wyceny');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-500 flex items-center gap-1 mb-4 hover:text-dark"
      >
        <ArrowLeft size={16} /> Wróć do listy
      </button>

      <h2 className="text-xl font-black text-dark mb-4">
        {created ? `Wycena #${created.id} — ${name}` : 'Nowa wycena'}
      </h2>

      {loading && <p className="text-gray-500">Ładowanie biblioteki…</p>}
      {error && <p className="text-red-600">Błąd biblioteki: {error}</p>}

      {created && library && (
        <QuoteEditor
          quoteId={created.id}
          archetype={created.archetype}
          initialAnswers={created.answers}
          library={library}
          sessionToken={sessionToken}
        />
      )}

      {!loading && !error && library && !created && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-dark mb-1">Nazwa wyceny *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Sklep meblowy — etap 1"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-1">Klient</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="opcjonalnie"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <PlatformStep library={library} busy={busy} onConfirm={handleConfirm} />

          {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
        </div>
      )}
    </div>
  );
};

export default QuoteWizard;
