import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useEstimationLibrary } from './useEstimationLibrary';
import PlatformStep, { type PlatformResult } from './PlatformStep';

interface Props {
  sessionToken: string | null;
  onCreated: (quoteId: number) => void;
  onCancel: () => void;
}

// f1a: kreator obejmuje krok „Platforma" (D21). Reszta wizarda (pytania szczegółowe,
// podgląd na żywo, walidacja, finalize) wchodzi w f1b/f1c.
const QuoteWizard: React.FC<Props> = ({ sessionToken, onCreated, onCancel }) => {
  const { library, loading, error } = useEstimationLibrary(sessionToken);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
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
      setCreatedId(data.id);
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

      <h2 className="text-xl font-black text-dark mb-4">Nowa wycena</h2>

      {loading && <p className="text-gray-500">Ładowanie biblioteki…</p>}
      {error && <p className="text-red-600">Błąd biblioteki: {error}</p>}

      {createdId !== null && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-500 text-green-800">
          <p className="font-bold">Wycena utworzona (#{createdId}).</p>
          <p className="text-sm">
            Odpowiedzi wstępne zapisane. Dalsze kroki kreatora (pytania szczegółowe, wynik) pojawią
            się w kolejnej fazie modułu.
          </p>
        </div>
      )}

      {!loading && !error && library && createdId === null && (
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
