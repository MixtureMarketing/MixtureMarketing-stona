import React from 'react';
import type { Answers, AnswerValue } from '@/lib/estimation/types';
import type { LibQuestion } from '../useEstimationLibrary';

// Współdzielone pole pojedynczego pytania (krok Platforma + pełny wizard f1b).
// Formaty odpowiedzi: bool→boolean, number→string (koercja w silniku, akceptuje 300k/1m),
// select→string, multiselect→string[], text→string, „nie wiem"→{unknown:true}.

export const UNKNOWN = { unknown: true } as const;
/** D26: „nie dotyczy" — pełnoprawna odpowiedź (zero kary Confidence, żadna reguła nie matchuje). */
export const NOT_APPLICABLE = { not_applicable: true } as const;

export function parseOptions(q: LibQuestion): { value: string; label: string }[] {
  if (!q.options_json) return [];
  try {
    return JSON.parse(q.options_json);
  } catch {
    return [];
  }
}

interface Props {
  q: LibQuestion;
  value: Answers[string] | undefined;
  onChange: (v: AnswerValue | typeof UNKNOWN | typeof NOT_APPLICABLE) => void;
}

const QuestionField: React.FC<Props> = ({ q, value, onChange }) => {
  const options = parseOptions(q);
  const isObj = typeof value === 'object' && value !== null;
  const isUnknown = isObj && 'unknown' in value;
  const isNotApplicable = isObj && 'not_applicable' in value; // D26
  const arr = Array.isArray(value) ? (value as string[]) : [];

  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <div className="flex justify-between items-start gap-2 mb-2">
        <label className="font-bold text-sm text-dark">{q.text}</label>
        {q.allow_unknown === 1 && (
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onChange(UNKNOWN)}
              className={`text-xs px-2 py-0.5 rounded ${isUnknown ? 'bg-amber-500 text-white' : 'bg-slate-200 text-gray-600'}`}
            >
              nie wiem
            </button>
            {/* D26: „nie dotyczy" ≠ niewiadoma — nie obniża Confidence. */}
            <button
              type="button"
              onClick={() => onChange(NOT_APPLICABLE)}
              className={`text-xs px-2 py-0.5 rounded ${isNotApplicable ? 'bg-slate-600 text-white' : 'bg-slate-200 text-gray-600'}`}
            >
              nie dotyczy
            </button>
          </div>
        )}
      </div>
      {q.help_text && <p className="text-xs text-gray-500 mb-2">{q.help_text}</p>}

      {q.answer_type === 'bool' && (
        <div className="flex gap-2">
          {[
            { v: true, l: 'Tak' },
            { v: false, l: 'Nie' },
          ].map((o) => (
            <button
              key={o.l}
              type="button"
              onClick={() => onChange(o.v)}
              className={`px-3 py-1 rounded text-sm font-bold border ${value === o.v ? 'bg-dark text-white border-dark' : 'bg-white border-slate-200'}`}
            >
              {o.l}
            </button>
          ))}
        </div>
      )}

      {q.answer_type === 'number' && (
        // Input tekstowy (nie type=number): akceptuje zapis 300k / 1m — koercja po stronie silnika.
        <input
          type="text"
          inputMode="text"
          value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="np. 500, 300k, 1m"
          className="w-40 px-3 py-1 rounded border border-slate-200"
        />
      )}

      {q.answer_type === 'select' && (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-1 rounded border border-slate-200"
        >
          <option value="">— wybierz —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {q.answer_type === 'multiselect' && (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const on = arr.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
                className={`px-2 py-1 rounded text-sm border ${on ? 'bg-dark text-white border-dark' : 'bg-white border-slate-200'}`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}

      {q.answer_type === 'text' && (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-1 rounded border border-slate-200"
        />
      )}
    </div>
  );
};

export default QuestionField;
