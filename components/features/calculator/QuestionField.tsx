// Pojedyncze pytanie kalkulatora — render sterowany `answer_type` z API (data-driven).
// Ton: ciemne premium (DESIGN.md). Bez logiki biznesowej — tylko wartość + onChange.
// MIX-1867: `newUi` = karta pytania z czytelną hierarchią, opcje ≥ 48 px ze znacznikiem wyboru;
// bez `newUi` klasy i struktura jak przed MIX-1867.
import React from 'react';
import type { PublicQuestion } from '../../../services/calculatorService';
import { questionFieldId } from './formLogic';
import { calcUi } from './calcUi';

interface QuestionFieldProps {
  question: PublicQuestion;
  value: unknown;
  onChange: (code: string, value: unknown) => void;
  error?: string;
  /** MIX-1867: nowy wygląd (karta pytania, większe opcje); domyślnie stary. */
  newUi?: boolean;
}

/** Znacznik wyboru w opcji (nowy wygląd): kółko dla jednej odpowiedzi, kwadrat dla wielu. */
const Mark: React.FC<{ on: boolean; multi: boolean }> = ({ on, multi }) => (
  <span
    aria-hidden="true"
    data-mark={on ? 'on' : 'off'}
    className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors ${
      multi ? 'rounded-md' : 'rounded-full'
    } ${on ? 'border-primary bg-primary' : 'border-white/40 group-hover:border-white/70'}`}
  >
    {on && (
      <svg viewBox="0 0 12 12" className="h-3 w-3 text-deep-dark" fill="none">
        <path
          d="M2.5 6.2 5 8.5l4.5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </span>
);

const QuestionField: React.FC<QuestionFieldProps> = ({
  question,
  value,
  onChange,
  error,
  newUi = false,
}) => {
  const { code, text, help_text, answer_type, options } = question;
  const ui = calcUi(newUi);
  const fieldId = questionFieldId(code);
  const errId = `${fieldId}-err`;
  const helpId = `${fieldId}-help`;
  // Błąd jest powiązany z polem (czytnik ekranu odczyta go po fokusie). aria-invalid tylko na
  // rolach, które go wspierają (textbox, spinbutton, radiogroup) — nie na zwykłym `group`.
  // Nowy wygląd dokłada do opisu podpowiedź (help_text), gdy jest.
  const describedBy =
    [newUi && help_text ? helpId : null, error ? errId : null].filter(Boolean).join(' ') ||
    undefined;
  const invalid = error ? true : undefined;

  /** Treść opcji: w nowym wyglądzie znacznik wyboru + etykieta, w starym sama etykieta. */
  const optionBody = (on: boolean, label: string, multi: boolean) =>
    newUi ? (
      <>
        <Mark on={on} multi={multi} />
        <span className="min-w-0 flex-1">{label}</span>
      </>
    ) : (
      label
    );

  const body = () => {
    switch (answer_type) {
      case 'bool':
        return (
          <div
            id={fieldId}
            className={newUi ? 'grid gap-3 sm:max-w-sm sm:grid-cols-2' : 'flex gap-3'}
            role="group"
            aria-label={text}
            aria-describedby={describedBy}
          >
            {[
              { v: true, l: 'Tak' },
              { v: false, l: 'Nie' },
            ].map((o) => (
              <button
                key={o.l}
                type="button"
                aria-pressed={value === o.v}
                onClick={() => onChange(code, o.v)}
                className={`${ui.optionBtn} ${value === o.v ? ui.optionOn : ui.optionOff}`}
              >
                {optionBody(value === o.v, o.l, false)}
              </button>
            ))}
          </div>
        );

      case 'select':
        return (
          <div
            id={fieldId}
            className={newUi ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-2 sm:grid-cols-2'}
            role="radiogroup"
            aria-label={text}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          >
            {(options ?? []).map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={value === o.value}
                onClick={() => onChange(code, o.value)}
                className={`${ui.optionBtn} ${value === o.value ? ui.optionOn : ui.optionOff}`}
              >
                {optionBody(value === o.value, o.label, false)}
              </button>
            ))}
          </div>
        );

      case 'multiselect': {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        const toggle = (val: string) =>
          onChange(code, arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
        return (
          <div
            id={fieldId}
            className={newUi ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-2 sm:grid-cols-2'}
            role="group"
            aria-label={text}
            aria-describedby={describedBy}
          >
            {(options ?? []).map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={arr.includes(o.value)}
                onClick={() => toggle(o.value)}
                className={`${ui.optionBtn} ${arr.includes(o.value) ? ui.optionOn : ui.optionOff}`}
              >
                {optionBody(arr.includes(o.value), o.label, true)}
              </button>
            ))}
          </div>
        );
      }

      case 'number':
        return (
          <input
            id={fieldId}
            type="number"
            inputMode="numeric"
            className={ui.input}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => onChange(code, e.target.value === '' ? '' : Number(e.target.value))}
            aria-label={text}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        );

      default: // text
        return (
          <input
            id={fieldId}
            type="text"
            className={ui.input}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => onChange(code, e.target.value)}
            aria-label={text}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        );
    }
  };

  if (!newUi) {
    return (
      <div className="space-y-2">
        <label className={ui.label}>{text}</label>
        {help_text && <p className={ui.help}>{help_text}</p>}
        {body()}
        {error && (
          <p id={errId} className={ui.error}>
            {error}
          </p>
        )}
      </div>
    );
  }

  // Nowy wygląd: pytanie BEZ własnej ramki i tła (MIX-1894: jedyna ramka to karta kroku);
  // błąd = komunikat ze znakiem pod opcjami. Nazwę pola/grupy niesie aria-label (jak w starym
  // wyglądzie), tytuł pytania jest tekstem.
  return (
    <div
      data-testid="calc-question"
      data-invalid={error ? 'true' : undefined}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <p className={ui.label}>{text}</p>
        {help_text && (
          <p id={helpId} className={ui.help}>
            {help_text}
          </p>
        )}
      </div>
      {body()}
      {error && (
        <p id={errId} className={`flex items-center gap-2 ${ui.error}`}>
          <span
            aria-hidden="true"
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-400 text-[10px] font-extrabold text-deep-dark"
          >
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
};

export default QuestionField;
