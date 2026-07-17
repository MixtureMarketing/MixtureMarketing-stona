import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { useQuote } from '../QuoteContext';
import { categoryName } from './categoryLabels';

const pln = (n: number) => `${Math.round(n).toLocaleString('pl-PL')} zł`;
const BAND_COLOR: Record<string, string> = {
  green: 'text-green-600',
  yellow: 'text-amber-600',
  red: 'text-red-600',
};
const BAND_LABEL: Record<string, string> = {
  green: 'możesz podać widełki',
  yellow: 'widełki z zastrzeżeniami',
  red: 'za dużo niewiadomych — rozważ Discovery',
};
// D23: poniżej progu kompletności etykieta „szacunek wstępny" niezależnie od koloru score.
const BELOW_COMPLETENESS_LABEL = 'szacunek wstępny — odpowiedz na więcej pytań';

// Panel boczny „na spotkanie": widełki + Confidence + top-3 „co obniżyło pewność".
// Wartości WYŁĄCZNIE z silnika (computation) — zero liczenia tutaj.
const LivePreviewPanel: React.FC = () => {
  const { state } = useQuote();
  const { totals, confidence, warnings, items } = state.computation;
  const [showCategories, setShowCategories] = useState(false);
  // Koszty (D14) są POZA godzinami/mnożnikami/buforem — własna sekcja, nie wchodzą w widełki.
  const costItems = items.filter((i) => i.type === 'cost');

  const topReasons = [...confidence.breakdown]
    .sort((a, b) => a.delta - b.delta) // delta ujemna → najmocniejsze najpierw
    .slice(0, 3);

  return (
    <aside className="bg-white rounded-lg p-5 shadow-sm sticky top-4 space-y-4">
      <h3 className="font-black text-dark">Podgląd wyceny (na żywo)</h3>

      <div>
        <p className="text-xs text-gray-500 uppercase">Widełki ofertowe</p>
        <p className="text-2xl font-black text-dark">
          {pln(totals.offer.min)} – {pln(totals.offer.max)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          pełne (wewnętrzne): {pln(totals.price.min)} – {pln(totals.price.max)} ·{' '}
          {Math.round(totals.afterBuffer.hoursMin)}–{Math.round(totals.afterBuffer.hoursMax)} h
        </p>
      </div>

      {costItems.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase">Koszty dodatkowe (poza godzinami)</p>
          <ul className="text-xs space-y-1 mt-1">
            {costItems.map((c, i) => {
              const cost = c as Extract<typeof c, { type: 'cost' }>;
              return (
                <li key={i} className="flex justify-between gap-2 border-b border-slate-100 pb-1">
                  <span>
                    <span className="font-bold">{cost.name}</span>
                    {cost.qty != null && cost.unitPrice != null && (
                      <span className="text-gray-500">
                        {' '}
                        — {cost.qty} {cost.unit} × {cost.unitPrice.toLocaleString('pl-PL')} zł
                      </span>
                    )}
                    {cost.note && <span className="block text-gray-400">{cost.note}</span>}
                  </span>
                  <span className="font-bold whitespace-nowrap">{pln(cost.amountPln ?? 0)}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-xs font-black text-dark mt-1">Razem koszty: {pln(totals.costs)}</p>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs font-bold text-amber-700 uppercase mb-1">Uwagi do platformy</p>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-800 flex items-start gap-1">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500 uppercase">Confidence</p>
        <p
          className={`text-xl font-black ${confidence.belowCompleteness ? 'text-amber-600' : BAND_COLOR[confidence.band]}`}
        >
          {confidence.score}%{' '}
          <span className="text-sm font-normal">
            —{' '}
            {confidence.belowCompleteness ? BELOW_COMPLETENESS_LABEL : BAND_LABEL[confidence.band]}
          </span>
        </p>
        {topReasons.length > 0 && (
          <div className="mt-1">
            <p className="text-xs text-gray-500">Co obniżyło pewność:</p>
            <ul className="text-xs text-gray-600 list-disc list-inside">
              {topReasons.map((r, i) => (
                <li key={i}>
                  {r.reason} ({r.delta})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowCategories((s) => !s)}
          className="text-xs font-bold text-gray-600 flex items-center gap-1"
        >
          {showCategories ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Rozbicie godzin per kategoria
        </button>
        {showCategories && (
          <table className="w-full text-xs mt-2">
            <tbody>
              {Object.entries(totals.byCategory).map(([cat, t]) => (
                <tr key={cat} className="border-b last:border-0">
                  <td className="py-1 font-bold">{categoryName(cat)}</td>
                  <td className="py-1 text-right text-gray-500">
                    {Math.round(t.hoursMin)}–{Math.round(t.hoursMax)} h
                  </td>
                  <td className="py-1 text-right">
                    {pln(t.priceMin)}–{pln(t.priceMax)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </aside>
  );
};

export default LivePreviewPanel;
