import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Answers } from '@/lib/estimation/types';
import { useEstimationLibrary } from './useEstimationLibrary';
import PlatformStep, { type PlatformResult } from './PlatformStep';
import QuoteEditor from './wizard/QuoteEditor';

interface Props {
  sessionToken: string | null;
  onCreated: (quoteId: number) => void;
  onCancel: () => void;
  /**
   * f2b: otwarcie ISTNIEJĄCEGO draftu (klik w wiersz listy albo świeży duplikat).
   * Bez tego wizard umiał tylko tworzyć: `created` powstawało wyłącznie po POST,
   * więc szkic zapisany wczoraj nie miał jak wrócić na ekran.
   */
  resumeQuoteId?: number;
}

interface Created {
  id: number;
  archetype: string;
  answers: Answers;
}

// f1a: krok „Platforma" → utworzenie draftu. f1b: pełny wizard + podgląd + walidacja (QuoteEditor).
const QuoteWizard: React.FC<Props> = ({ sessionToken, onCreated, onCancel, resumeQuoteId }) => {
  const { library, loading, error } = useEstimationLibrary(sessionToken);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [editingPlatform, setEditingPlatform] = useState(false);
  const [wczytuje, setWczytuje] = useState(!!resumeQuoteId);

  // Wznowienie istniejącego draftu: odtwarzamy dokładnie to, co wizard trzymał w stanie
  // po utworzeniu (id + archetyp + odpowiedzi), więc dalej działa ta sama ścieżka.
  useEffect(() => {
    if (!resumeQuoteId || !sessionToken) return;
    let cancelled = false;
    (async () => {
      setWczytuje(true);
      try {
        const res = await fetch(`/api/admin/estimation/quote?id=${resumeQuoteId}`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          quote: { id: number; name: string; client_name: string | null; archetype_code: string };
          answers: Answers;
        };
        if (cancelled) return;
        setName(data.quote.name);
        setClientName(data.quote.client_name ?? '');
        setCreated({
          id: data.quote.id,
          archetype: data.quote.archetype_code,
          answers: data.answers ?? {},
        });
      } catch (e) {
        if (!cancelled)
          setSaveError(e instanceof Error ? e.message : 'Nie udało się wczytać wyceny');
      } finally {
        if (!cancelled) setWczytuje(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeQuoteId, sessionToken]);

  const handleConfirm = async (r: PlatformResult) => {
    if (!name.trim()) {
      setSaveError('Podaj nazwę wyceny przed utworzeniem.');
      return;
    }
    setBusy(true);
    setSaveError(null);
    try {
      if (created) {
        // „Zmień platformę": draft już istnieje — aktualizujemy archetyp (PUT), bez sierocego draftu.
        const res = await fetch('/api/admin/estimation/quotes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
          body: JSON.stringify({
            id: created.id,
            archetype_code: r.archetypeCode,
            archetype_recommended: r.recommended,
            archetype_reason: r.reason,
            answers: r.answers,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setCreated({ id: created.id, archetype: r.archetypeCode, answers: r.answers });
        setEditingPlatform(false);
        return;
      }
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
      setSaveError(e instanceof Error ? e.message : 'Nie udało się zapisać wyceny');
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
      {wczytuje && <p className="text-gray-500">Wczytuję wycenę…</p>}
      {error && <p className="text-red-600">Błąd biblioteki: {error}</p>}

      {created && !editingPlatform && library && (
        <QuoteEditor
          quoteId={created.id}
          archetype={created.archetype}
          initialAnswers={created.answers}
          library={library}
          sessionToken={sessionToken}
          onChangePlatform={() => setEditingPlatform(true)}
        />
      )}

      {/* `!wczytuje`: przy wznawianiu draftu `created` jest jeszcze puste — bez tego
          na ułamek sekundy mignąłby krok „Platforma", jakby to była nowa wycena. */}
      {!loading && !error && !wczytuje && library && (!created || editingPlatform) && (
        <div className="space-y-6">
          {editingPlatform && (
            <p className="text-sm text-amber-700">
              Zmieniasz platformę wyceny #{created?.id}. Odpowiedz ponownie na pytania wstępne —
              zapiszemy nowy archetyp do istniejącego draftu.
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-dark mb-1">Nazwa wyceny *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Sklep meblowy — etap 1"
                disabled={!!created}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-1">Klient</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="opcjonalnie"
                disabled={!!created}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 disabled:bg-slate-100"
              />
            </div>
          </div>

          <PlatformStep library={library} busy={busy} onConfirm={handleConfirm} />

          {editingPlatform && (
            <button
              type="button"
              onClick={() => setEditingPlatform(false)}
              className="text-sm text-gray-500 hover:text-dark"
            >
              Anuluj zmianę platformy
            </button>
          )}

          {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
        </div>
      )}
    </div>
  );
};

export default QuoteWizard;
