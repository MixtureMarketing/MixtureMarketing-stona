import React, { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { STATUS_LABEL, STATUS_STYLE, dataStatusu } from './status';

// Czysta lista wycen (nagłówek + „Nowa wycena" są w EstimationTab).
interface QuoteRow {
  id: number;
  name: string;
  client_name: string | null;
  archetype_code: string;
  status: string;
  confidence: number | null;
  pdf_r2_key: string | null;
  card_r2_key: string | null;
  sent_at: string | null;
  won_at: string | null;
  lost_at: string | null;
  created_at: string;
}

interface Props {
  sessionToken: string | null;
  refreshKey?: number;
  onOpen?: (id: number) => void;
}

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

  /**
   * Pobranie idzie przez fetch + blob, NIE przez <a href>: endpoint jest za middlewarem
   * admina (Bearer), a link z przeglądarki nagłówka nie wyśle — dostałby 401.
   * Wzorzec jak PortalDashboard.handleDownload.
   */
  const pobierz = async (e: React.MouseEvent, id: number, doc: 'offer' | 'card') => {
    e.stopPropagation(); // klik w pobieranie nie otwiera wyceny
    if (!sessionToken) return;
    try {
      const res = await fetch(`/api/admin/estimation/quote-file?id=${id}&doc=${doc}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `wycena-${id}-${doc === 'offer' ? 'oferta' : 'karta-decyzji'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Nie udało się pobrać dokumentu.');
    }
  };

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
            <th className="py-2 pr-4">Dokumenty</th>
            <th className="py-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => {
            const data = dataStatusu(q);
            return (
              <tr
                key={q.id}
                onClick={() => onOpen?.(q.id)}
                className={`border-b last:border-0 text-sm ${onOpen ? 'cursor-pointer hover:bg-slate-50' : ''}`}
              >
                <td className="py-2 pr-4 font-bold text-dark">{q.name}</td>
                <td className="py-2 pr-4">{q.client_name ?? '—'}</td>
                <td className="py-2 pr-4">{q.archetype_code}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLE[q.status] ?? 'bg-slate-100 text-slate-600'}`}
                  >
                    {STATUS_LABEL[q.status] ?? q.status}
                  </span>
                </td>
                <td className="py-2 pr-4">{q.confidence != null ? `${q.confidence}%` : '—'}</td>
                <td className="py-2 pr-4">
                  {q.pdf_r2_key || q.card_r2_key ? (
                    <span className="flex gap-1">
                      {q.pdf_r2_key && (
                        <button
                          type="button"
                          onClick={(e) => pobierz(e, q.id, 'offer')}
                          title="Pobierz ofertę (PDF)"
                          className="p-1 rounded hover:bg-slate-200 text-gray-600 flex items-center gap-1 text-xs"
                        >
                          <Download size={13} /> oferta
                        </button>
                      )}
                      {q.card_r2_key && (
                        <button
                          type="button"
                          onClick={(e) => pobierz(e, q.id, 'card')}
                          title="Pobierz Kartę decyzji (dokument wewnętrzny)"
                          className="p-1 rounded hover:bg-slate-200 text-gray-600 flex items-center gap-1 text-xs"
                        >
                          <Download size={13} /> karta
                        </button>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                {/* Data przejścia, gdy status ją ma; inaczej data utworzenia. Przy ofercie
                    wysłanej miesiąc temu „utworzono" nie jest tym, czego się szuka. */}
                <td className="py-2 text-gray-500">
                  {data ?? q.created_at?.slice(0, 10)}
                  {data && <span className="text-gray-300 text-xs ml-1">zmiana</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QuotesList;
