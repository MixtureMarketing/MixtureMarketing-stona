import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { categoryName } from './categoryLabels';

// Ekran wyniku (f1c #5/#6): czyta SNAPSHOT z D1 (read-back po finalize), nie stan lokalny.
// Wersja do odczytania klientowi na spotkaniu: widełki ofertowe + pełne + Confidence + decyzje.

const pln = (n: number) => `${Math.round(n).toLocaleString('pl-PL')} zł`;

interface SnapshotAspect {
  aspect_code: string;
  aspect_name: string;
  category: string;
  suggested_level: number;
  chosen_level: number;
  hours_min: number;
  hours_max: number;
  override_reason: string | null;
  rule_reasons_json: string | null;
}
interface SnapshotItem {
  item_type: string;
  name: string;
  hours_min: number | null;
  hours_max: number | null;
  amount_pln: number | null;
}
interface Totals {
  offer: { min: number; max: number };
  price: { min: number; max: number };
  afterBuffer: { hoursMin: number; hoursMax: number };
  costs: number;
}
interface ReadBack {
  quote: { status: string; confidence: number | null };
  snapshot: {
    aspects: SnapshotAspect[];
    items: SnapshotItem[];
    totals: Totals | null;
    confidenceBreakdown: { reason: string; delta: number }[] | null;
  };
}

const parseReasons = (json: string | null): string[] => {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const ResultScreen: React.FC<{ quoteId: number; sessionToken: string | null }> = ({
  quoteId,
  sessionToken,
}) => {
  const [data, setData] = useState<ReadBack | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/estimation/quote?id=${quoteId}`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ReadBack;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Błąd odczytu wyceny');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quoteId, sessionToken]);

  if (error) return <p className="text-red-600">Błąd: {error}</p>;
  if (!data) return <p className="text-gray-500">Wczytuję wynik…</p>;

  const { snapshot, quote } = data;
  const t = snapshot.totals;
  // Decyzje techniczne: obszary z godzinami > 0, z uzasadnieniami (Karta decyzji, wersja skrócona).
  const decisions = snapshot.aspects.filter((a) => a.hours_max > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="text-green-600" size={22} />
        <h3 className="font-black text-dark text-lg">Wycena sfinalizowana</h3>
        <span className="text-xs uppercase text-gray-400">status: {quote.status}</span>
      </div>

      {t && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-gray-500 uppercase">Widełki ofertowe (dla klienta)</p>
            <p className="text-2xl font-black text-dark">
              {pln(t.offer.min)} – {pln(t.offer.max)}
            </p>
            {t.costs > 0 && (
              <p className="text-xs text-gray-500 mt-1">+ koszty dodatkowe: {pln(t.costs)}</p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-white border border-slate-200">
            <p className="text-xs text-gray-500 uppercase">Pełne (wewnętrzne)</p>
            <p className="text-lg font-bold text-dark">
              {pln(t.price.min)} – {pln(t.price.max)}
            </p>
            <p className="text-xs text-gray-500">
              {Math.round(t.afterBuffer.hoursMin)}–{Math.round(t.afterBuffer.hoursMax)} h
            </p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500 uppercase">Confidence</p>
        <p className="text-xl font-black text-dark">{quote.confidence ?? '—'}%</p>
        {snapshot.confidenceBreakdown && snapshot.confidenceBreakdown.length > 0 && (
          <ul className="text-xs text-gray-600 list-disc list-inside mt-1">
            {snapshot.confidenceBreakdown.map((b, i) => (
              <li key={i}>
                {b.reason} ({b.delta})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="font-bold text-sm text-gray-500 mb-2">Decyzje techniczne (do omówienia)</h4>
        <div className="space-y-1">
          {decisions.map((a) => {
            const reasons = parseReasons(a.rule_reasons_json);
            return (
              <div key={a.aspect_code} className="p-2 rounded-lg border border-slate-200 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">{categoryName(a.category)}</span>
                  <span className="font-bold flex-1">{a.aspect_name}</span>
                  <span className="text-xs text-gray-500">poziom {a.chosen_level}</span>
                  <span className="text-xs text-gray-500 w-20 text-right">
                    {Math.round(a.hours_min)}–{Math.round(a.hours_max)} h
                  </span>
                </div>
                {reasons.length > 0 && (
                  <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                    {reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
                {a.override_reason && (
                  <p className="text-xs text-amber-700 mt-1">Korekta: {a.override_reason}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {snapshot.items.length > 0 && (
        <div>
          <h4 className="font-bold text-sm text-gray-500 mb-2">Pozycje dodatkowe</h4>
          <ul className="text-sm space-y-1">
            {snapshot.items.map((it, i) => (
              <li key={i} className="flex justify-between border-b border-slate-100 py-1">
                <span>{it.name}</span>
                <span className="text-gray-500">
                  {it.item_type === 'cost'
                    ? pln(it.amount_pln ?? 0)
                    : `${Math.round(it.hours_min ?? 0)}–${Math.round(it.hours_max ?? 0)} h`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultScreen;
