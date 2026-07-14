import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import type { Category, ValidationOverrides, AspectComputation } from '@/lib/estimation/types';
import { useQuote } from '../QuoteContext';

const CATEGORY_LABEL: Record<Category, string> = {
  A: 'A · Prezentacja',
  B: 'B · Logika / dane',
  C: 'C · Bezpieczeństwo',
  D: 'D · Infrastruktura',
  E: 'E · Operacje',
  F: 'F · Marketing / analityka',
  G: 'G · Realizacja projektu',
};

const ValidationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, library } = useQuote();
  const { computation, overrides, setOverrides } = state;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const byCategory = useMemo(() => {
    const m = new Map<Category, AspectComputation[]>();
    for (const a of computation.aspects) {
      const arr = m.get(a.category) ?? [];
      arr.push(a);
      m.set(a.category, arr);
    }
    return m;
  }, [computation.aspects]);

  const setLevel = (code: string, level: number) =>
    setOverrides((p) => ({ ...p, chosenLevels: { ...p.chosenLevels, [code]: level } }));
  const setReason = (code: string, reason: string) =>
    setOverrides((p) => ({ ...p, levelReasons: { ...p.levelReasons, [code]: reason } }));
  const toggle = (
    key: keyof Pick<
      ValidationOverrides,
      'disabledModules' | 'disabledIntegrations' | 'disabledMultipliers'
    >,
    code: string,
  ) =>
    setOverrides((p) => {
      const on = p[key].includes(code);
      return { ...p, [key]: on ? p[key].filter((c) => c !== code) : [...p[key], code] };
    });

  const nameOf = (list: { code: string; name: string }[], code: string) =>
    list.find((x) => x.code === code)?.name ?? code;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-dark">Walidacja techniczna</h3>
        <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-dark">
          ← Wróć do formularza
        </button>
      </div>

      {[...byCategory.keys()].sort().map((cat) => (
        <section key={cat}>
          <h4 className="font-bold text-sm text-gray-500 mb-2">{CATEGORY_LABEL[cat]}</h4>
          <div className="space-y-1">
            {byCategory.get(cat)!.map((a) => {
              const changed = a.chosenLevel !== a.suggestedLevel;
              const reasonMissing = changed && !overrides.levelReasons[a.code]?.trim();
              return (
                <div key={a.code} className="p-2 rounded-lg border border-slate-200 text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold flex-1">{a.name}</span>
                    {a.reasons.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpanded((e) => ({ ...e, [a.code]: !e[a.code] }))}
                        className="text-xs text-gray-500 flex items-center"
                      >
                        {expanded[a.code] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        uzasadnienie
                      </button>
                    )}
                    <span className="text-xs text-gray-400">sug. {a.suggestedLevel}</span>
                    <select
                      value={a.chosenLevel}
                      onChange={(e) => setLevel(a.code, Number(e.target.value))}
                      className={`px-2 py-0.5 rounded border text-sm ${changed ? 'border-amber-400' : 'border-slate-200'}`}
                    >
                      {[0, 1, 2, 3, 4].map((l) => (
                        <option key={l} value={l}>
                          poz. {l}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500 w-20 text-right">
                      {a.hoursMin}–{a.hoursMax} h
                    </span>
                  </div>
                  {expanded[a.code] && a.reasons.length > 0 && (
                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                      {a.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                  {changed && (
                    <input
                      type="text"
                      value={overrides.levelReasons[a.code] ?? ''}
                      onChange={(e) => setReason(a.code, e.target.value)}
                      placeholder="Powód zmiany poziomu (wymagany)"
                      className={`mt-1 w-full px-2 py-1 rounded border text-xs ${reasonMissing ? 'border-red-400' : 'border-amber-300'}`}
                    />
                  )}
                  {reasonMissing && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertTriangle size={11} /> Zmiana poziomu wymaga powodu.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Sugestie: moduły / integracje / mnożniki — odznaczalne */}
      <Suggestions
        title="Moduły (sugerowane)"
        codes={computation.activeModules}
        disabled={overrides.disabledModules}
        name={(c) => nameOf(library.modules, c)}
        onToggle={(c) => toggle('disabledModules', c)}
      />
      <Suggestions
        title="Integracje"
        codes={computation.activeIntegrations}
        disabled={overrides.disabledIntegrations}
        name={(c) => nameOf(library.integrations, c)}
        onToggle={(c) => toggle('disabledIntegrations', c)}
      />
      <Suggestions
        title="Mnożniki ryzyka"
        codes={computation.activeMultipliers.map((m) => m.code)}
        disabled={overrides.disabledMultipliers}
        name={(c) => computation.activeMultipliers.find((m) => m.code === c)?.name ?? c}
        onToggle={(c) => toggle('disabledMultipliers', c)}
      />
    </div>
  );
};

const Suggestions: React.FC<{
  title: string;
  codes: string[];
  disabled: string[];
  name: (c: string) => string;
  onToggle: (c: string) => void;
}> = ({ title, codes, disabled, name, onToggle }) => {
  if (codes.length === 0) return null;
  return (
    <section>
      <h4 className="font-bold text-sm text-gray-500 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {codes.map((c) => {
          const off = disabled.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => onToggle(c)}
              className={`px-2 py-1 rounded text-sm border ${off ? 'bg-white border-slate-200 text-gray-400 line-through' : 'bg-dark text-white border-dark'}`}
            >
              {name(c)}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ValidationScreen;
