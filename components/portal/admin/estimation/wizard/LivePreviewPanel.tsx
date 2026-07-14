import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useQuote } from '../QuoteContext';

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

// Panel boczny „na spotkanie": widełki + Confidence + top-3 „co obniżyło pewność".
// Wartości WYŁĄCZNIE z silnika (computation) — zero liczenia tutaj.
const LivePreviewPanel: React.FC = () => {
  const { state } = useQuote();
  const { totals, confidence } = state.computation;
  const [showCategories, setShowCategories] = useState(false);

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
        {totals.costs > 0 && (
          <p className="text-xs text-gray-500">+ koszty dodatkowe: {pln(totals.costs)}</p>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase">Confidence</p>
        <p className={`text-xl font-black ${BAND_COLOR[confidence.band]}`}>
          {confidence.score}%{' '}
          <span className="text-sm font-normal">— {BAND_LABEL[confidence.band]}</span>
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
                  <td className="py-1 font-bold">{cat === 'items' ? 'moduły/integracje' : cat}</td>
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
