// Pojedyncze pytanie kalkulatora — render sterowany `answer_type` z API (data-driven).
// Ton: ciemne premium (DESIGN.md). Bez logiki biznesowej — tylko wartość + onChange.
import React from 'react';
import type { PublicQuestion } from '../../../services/calculatorService';

interface QuestionFieldProps {
  question: PublicQuestion;
  value: unknown;
  onChange: (code: string, value: unknown) => void;
  error?: string;
}

const OPTION_BTN =
  'px-4 py-2.5 rounded-xl border text-sm font-medium transition text-left focus:outline-none focus:ring-2 focus:ring-primary/60';
const OPTION_ON = 'border-primary bg-primary/15 text-white';
const OPTION_OFF = 'border-white/15 bg-white/[0.03] text-gray-200 hover:border-white/30';
const INPUT =
  'w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/60';

const QuestionField: React.FC<QuestionFieldProps> = ({ question, value, onChange, error }) => {
  const { code, text, help_text, answer_type, options } = question;

  const body = () => {
    switch (answer_type) {
      case 'bool':
        return (
          <div className="flex gap-3" role="group" aria-label={text}>
            {[
              { v: true, l: 'Tak' },
              { v: false, l: 'Nie' },
            ].map((o) => (
              <button
                key={o.l}
                type="button"
                aria-pressed={value === o.v}
                onClick={() => onChange(code, o.v)}
                className={`${OPTION_BTN} ${value === o.v ? OPTION_ON : OPTION_OFF}`}
              >
                {o.l}
              </button>
            ))}
          </div>
        );

      case 'select':
        return (
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={text}>
            {(options ?? []).map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={value === o.value}
                onClick={() => onChange(code, o.value)}
                className={`${OPTION_BTN} ${value === o.value ? OPTION_ON : OPTION_OFF}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        );

      case 'multiselect': {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        const toggle = (val: string) =>
          onChange(code, arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
        return (
          <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={text}>
            {(options ?? []).map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={arr.includes(o.value)}
                onClick={() => toggle(o.value)}
                className={`${OPTION_BTN} ${arr.includes(o.value) ? OPTION_ON : OPTION_OFF}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        );
      }

      case 'number':
        return (
          <input
            type="number"
            inputMode="numeric"
            className={INPUT}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => onChange(code, e.target.value === '' ? '' : Number(e.target.value))}
            aria-label={text}
          />
        );

      default: // text
        return (
          <input
            type="text"
            className={INPUT}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => onChange(code, e.target.value)}
            aria-label={text}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-base font-semibold text-white">{text}</label>
      {help_text && <p className="text-sm text-gray-400">{help_text}</p>}
      {body()}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default QuestionField;
