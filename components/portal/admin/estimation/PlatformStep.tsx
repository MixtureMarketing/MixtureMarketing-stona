import React, { useMemo, useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { evaluateRules, matchCondition } from '@/lib/estimation/engine';
import type { Answers, AnswerValue, Condition } from '@/lib/estimation/types';
import type { EstimationLibrary, LibQuestion } from './useEstimationLibrary';
import { toEngineRules, rulesWithAction, platformQuestionCodes } from './engineAdapter';

export interface PlatformResult {
  archetypeCode: string;
  recommended: string | null;
  reason: string | null;
  answers: Answers;
}

interface Props {
  library: EstimationLibrary;
  busy?: boolean;
  onConfirm: (r: PlatformResult) => void;
}

const UNKNOWN = { unknown: true } as const;

function parseOptions(q: LibQuestion): { value: string; label: string }[] {
  if (!q.options_json) return [];
  try {
    return JSON.parse(q.options_json);
  } catch {
    return [];
  }
}

const PlatformStep: React.FC<Props> = ({ library, busy, onConfirm }) => {
  const [answers, setAnswers] = useState<Answers>({});
  const [chosen, setChosen] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const engineRules = useMemo(() => toEngineRules(library.rules), [library.rules]);
  const knownAspectCodes = useMemo(() => library.aspects.map((a) => a.code), [library.aspects]);

  // Pytania neutralne wyprowadzone z reguł recommend_archetype (data-driven).
  const questions = useMemo(() => {
    const codes = platformQuestionCodes(engineRules);
    return library.questions
      .filter((q) => codes.has(q.code))
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [engineRules, library.questions]);

  // Widoczność warunkowa (C.8) — data-driven z est_questions.visible_if_json (ten sam mechanizm
  // co reguły; f1b użyje go w całym wizardzie). Brak warunku = zawsze widoczne.
  const visibleQuestions = useMemo(
    () =>
      questions.filter((q) => {
        if (!q.visible_if_json) return true;
        try {
          return matchCondition(JSON.parse(q.visible_if_json) as Condition, answers);
        } catch {
          return true;
        }
      }),
    [questions, answers],
  );

  const recommendations = useMemo(() => {
    const recRules = rulesWithAction(engineRules, 'recommend_archetype');
    return evaluateRules({ answers, archetypeDefaults: [], rules: recRules, knownAspectCodes })
      .recommendedArchetypes;
  }, [engineRules, answers, knownAspectCodes]);

  const topRecommended = recommendations[0]?.code ?? null;

  // Ostrzeżenia archetype_warning (druga linia) po wyborze archetypu.
  const warnings = useMemo(() => {
    if (!chosen) return [];
    const warnRules = rulesWithAction(engineRules, 'archetype_warning');
    return evaluateRules({
      answers: { ...answers, archetype: chosen },
      archetypeDefaults: [],
      rules: warnRules,
      knownAspectCodes,
    }).warnings;
  }, [engineRules, answers, chosen, knownAspectCodes]);

  const setAnswer = (code: string, value: AnswerValue | typeof UNKNOWN) =>
    setAnswers((prev) => ({ ...prev, [code]: value }));

  // Rekomendacja = ścieżka domyślna; skrót (wybór wbrew radzie lub bez rekomendacji) kosztuje powód.
  const noRecommendation = recommendations.length === 0;
  const mismatch = !!chosen && !!topRecommended && chosen !== topRecommended;
  const manualBypass = !!chosen && noRecommendation; // wybór ręczny z pominięciem doradcy
  const requireReason = mismatch || manualBypass;
  const canConfirm = !!chosen && (!requireReason || reason.trim().length > 0);

  const confirm = () => {
    if (!chosen || !canConfirm) return;
    onConfirm({
      archetypeCode: chosen,
      recommended: topRecommended,
      reason: requireReason ? reason.trim() : null,
      answers,
    });
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-black text-dark mb-3">1. Pytania wstępne (dobór platformy)</h3>
        <div className="space-y-4">
          {visibleQuestions.map((q) => (
            <QuestionField
              key={q.code}
              q={q}
              value={answers[q.code]}
              onChange={(v) => setAnswer(q.code, v)}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-black text-dark mb-3">2. Rekomendacja platformy</h3>
        {recommendations.length === 0 ? (
          answers.project_goal ? (
            <p className="text-sm text-amber-700">
              Brak jednoznacznej rekomendacji dla tych odpowiedzi — wybierz ręcznie i podaj
              uzasadnienie.
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              Odpowiedz na pytania powyżej, aby zobaczyć rekomendację.
            </p>
          )
        ) : (
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li
                key={rec.code}
                className={`p-3 rounded-lg border ${i === 0 ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
              >
                <span className="font-bold">
                  {i === 0 && '★ '}
                  {library.archetypes.find((a) => a.code === rec.code)?.name ?? rec.code}
                </span>
                {rec.reason && <span className="text-sm text-gray-600"> — {rec.reason}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-black text-dark mb-3">3. Wybór archetypu</h3>
        {noRecommendation && (
          <p className="text-xs text-amber-700 mb-2">
            Rekomendacja to ścieżka domyślna. Wybór teraz = ręczny, z pominięciem doradcy — wymaga
            uzasadnienia.
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {library.archetypes.map((a) => (
            <button
              key={a.code}
              type="button"
              onClick={() => setChosen(a.code)}
              className={`p-2 rounded-lg text-sm font-bold border flex items-center gap-1 ${
                chosen === a.code ? 'bg-dark text-white border-dark' : 'bg-white border-slate-200'
              }`}
            >
              {chosen === a.code && <Check size={14} />}
              {a.name}
            </button>
          ))}
        </div>

        {requireReason && (
          <div className="mt-3">
            <label className="block text-sm font-bold text-amber-700 mb-1">
              {mismatch
                ? 'Wybór inny niż rekomendacja — podaj powód (wymagany):'
                : 'Wybór ręczny z pominięciem doradcy — podaj powód (wymagany):'}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="np. klient ma już zespół PHP / istniejąca licencja"
              className="w-full px-3 py-2 rounded-lg border border-amber-300"
            />
          </div>
        )}

        {warnings.length > 0 && (
          <ul className="mt-3 space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-1">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {w}
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        disabled={!canConfirm || busy}
        onClick={confirm}
        className={`px-5 py-2 rounded-lg font-bold ${
          canConfirm && !busy
            ? 'bg-dark text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {busy ? 'Tworzę wycenę…' : 'Utwórz wycenę i przejdź dalej'}
      </button>
    </div>
  );
};

// ── Pole pojedynczego pytania ────────────────────────────────────────────────
interface FieldProps {
  q: LibQuestion;
  value: Answers[string] | undefined;
  onChange: (v: AnswerValue | typeof UNKNOWN) => void;
}
const QuestionField: React.FC<FieldProps> = ({ q, value, onChange }) => {
  const options = parseOptions(q);
  const isUnknown = typeof value === 'object' && value !== null && 'unknown' in value;
  const arr = Array.isArray(value) ? (value as string[]) : [];

  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <div className="flex justify-between items-start gap-2 mb-2">
        <label className="font-bold text-sm text-dark">{q.text}</label>
        {q.allow_unknown === 1 && (
          <button
            type="button"
            onClick={() => onChange(UNKNOWN)}
            className={`text-xs px-2 py-0.5 rounded ${isUnknown ? 'bg-amber-500 text-white' : 'bg-slate-200 text-gray-600'}`}
          >
            nie wiem
          </button>
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

export default PlatformStep;
