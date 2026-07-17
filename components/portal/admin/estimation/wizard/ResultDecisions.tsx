import React from 'react';
import { categoryName } from './categoryLabels';

// Prezentacja (wydzielona z ResultScreen dla limitu linii): decyzje techniczne + pozycje dodatkowe.
// Czysty render ze snapshotu — zero logiki, zero fetchy.

const pln = (n: number) => `${Math.round(n).toLocaleString('pl-PL')} zł`;

const parseReasons = (json: string | null): string[] => {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

interface Decision {
  aspect_code: string;
  aspect_name: string;
  category: string;
  chosen_level: number;
  hours_min: number;
  hours_max: number;
  override_reason: string | null;
  rule_reasons_json: string | null;
}
interface Item {
  item_type: string;
  name: string;
  hours_min: number | null;
  hours_max: number | null;
  amount_pln: number | null;
}

const ResultDecisions: React.FC<{ decisions: Decision[]; items: Item[] }> = ({
  decisions,
  items,
}) => (
  <>
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

    {items.length > 0 && (
      <div>
        <h4 className="font-bold text-sm text-gray-500 mb-2">Pozycje dodatkowe</h4>
        <ul className="text-sm space-y-1">
          {items.map((it, i) => (
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
  </>
);

export default ResultDecisions;
