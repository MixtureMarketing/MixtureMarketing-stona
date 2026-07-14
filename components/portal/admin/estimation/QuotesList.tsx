import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

// Czysta lista wycen (nagłówek + „Nowa wycena" są w EstimationTab).
interface QuoteRow {
  id: number;
  name: string;
  client_name: string | null;
  archetype_code: string;
  status: string;
  confidence: number | null;
  created_at: string;
}

interface Props {
  sessionToken: string | null;
  refreshKey?: number;
  onOpen?: (id: number) => void;
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Szkic',
  review: 'W przeglądzie',
  sent: 'Wysłana',
  won: 'Wygrana',
  lost: 'Przegrana',
  closed: 'Zamknięta',
};

const QuotesList: React.FC<Props> = ({ sessionToken, refreshKey, onOpen }) => {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionToken) return;
    let cancelled = false;
    (async () => {
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
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionToken, refreshKey]);

  if (loading) return <p className="text-gray-500">Ładowanie…</p>;
  if (error) return <p className="text-red-600">Nie udało się załadować wycen: {error}</p>;

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-bold">Brak wycen</p>
        <p className="text-sm">Kliknij „Nowa wycena", aby rozpocząć.</p>
      </div>
    );
  }

  return (
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
            <tr
              key={q.id}
              onClick={() => onOpen?.(q.id)}
              className={`border-b last:border-0 text-sm ${onOpen ? 'cursor-pointer hover:bg-slate-50' : ''}`}
            >
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
  );
};

export default QuotesList;
