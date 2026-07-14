import React, { useEffect, useState } from 'react';
import { FileText, Plus } from 'lucide-react';

// Lazy chunk (moduł wycen) — nie wchodzi do głównego bundla (size-limit).
// F0: tylko lista (pusta na starcie). Kreator „Nowa wycena" i szczegóły w F1.

interface QuoteRow {
  id: number;
  name: string;
  client_name: string | null;
  archetype_code: string;
  status: string;
  confidence: number | null;
  created_at: string;
}

interface QuotesListProps {
  sessionToken: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Szkic',
  review: 'W przeglądzie',
  sent: 'Wysłana',
  won: 'Wygrana',
  lost: 'Przegrana',
  closed: 'Zamknięta',
};

const QuotesList: React.FC<QuotesListProps> = ({ sessionToken }) => {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!sessionToken) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/estimation/quotes', {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { quotes?: QuoteRow[] };
        if (!cancelled) setQuotes(data.quotes ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Błąd ładowania');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionToken]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-dark flex items-center gap-2">
          <FileText size={20} /> Wyceny
        </h2>
        {/* Kreator dostępny od F1 */}
        <button
          type="button"
          disabled
          title="Kreator wyceny dostępny w kolejnej fazie"
          className="px-4 py-2 rounded-lg font-bold bg-gray-200 text-gray-400 cursor-not-allowed flex items-center gap-2"
        >
          <Plus size={18} /> Nowa wycena
        </button>
      </div>

      {loading && <p className="text-gray-500">Ładowanie…</p>}
      {error && <p className="text-red-600">Nie udało się załadować wycen: {error}</p>}

      {!loading && !error && quotes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold">Brak wycen</p>
          <p className="text-sm">Tworzenie wycen pojawi się w kolejnej fazie modułu.</p>
        </div>
      )}

      {!loading && !error && quotes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-gray-400 border-b">
                <th className="py-2 pr-4">Nazwa</th>
                <th className="py-2 pr-4">Klient</th>
                <th className="py-2 pr-4">Archetyp</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Confidence</th>
                <th className="py-2">Utworzono</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-b last:border-0 text-sm">
                  <td className="py-2 pr-4 font-bold text-dark">{q.name}</td>
                  <td className="py-2 pr-4">{q.client_name ?? '—'}</td>
                  <td className="py-2 pr-4">{q.archetype_code}</td>
                  <td className="py-2 pr-4">{STATUS_LABEL[q.status] ?? q.status}</td>
                  <td className="py-2 pr-4">{q.confidence != null ? `${q.confidence}%` : '—'}</td>
                  <td className="py-2 text-gray-500">{q.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuotesList;
