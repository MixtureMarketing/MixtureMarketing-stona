import React, { useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import type { EstimationLibrary } from '../useEstimationLibrary';
import type { PatchResult } from './useLibraryMutations';

// CREATE modułu/integracji (f2c-2a): kod nadawany przy tworzeniu (snake_case, unikalny — serwer),
// po zapisie immutable. Cele/archetypy modułu przez CHECKBOXY (data-driven z biblioteki), nie JSON.

interface Props {
  entity: 'module' | 'integration';
  library: EstimationLibrary;
  saving: boolean;
  onCreate: (
    entity: 'module' | 'integration',
    code: string,
    row: Record<string, unknown>,
  ) => Promise<PatchResult>;
  onCreated: () => void;
  onCancel: () => void;
}

const inputCls =
  'border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-accent';
const RISK = ['low', 'medium', 'high'];
const INT_CATEGORY = ['payments', 'shipping', 'erp', 'marketplace', 'feeds', 'marketing', 'other'];

const CreateItemForm: React.FC<Props> = ({
  entity,
  library,
  saving,
  onCreate,
  onCreated,
  onCancel,
}) => {
  const [code, setCode] = useState('');
  const [f, setF] = useState<Record<string, string>>({ risk: 'low' });
  const [goals, setGoals] = useState<string[]>([]);
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Cele projektu z opcji pytania project_goal (data-driven, inwariant 2).
  const goalOptions = useMemo(() => {
    const q = library.questions.find((x) => x.code === 'project_goal');
    try {
      const opts = q?.options_json ? JSON.parse(q.options_json) : [];
      return Array.isArray(opts) ? (opts as { value: string; label: string }[]) : [];
    } catch {
      return [];
    }
  }, [library.questions]);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const numOrNull = (v: string | undefined) => (v == null || v === '' ? null : Number(v));

  const submit = async () => {
    const row: Record<string, unknown> =
      entity === 'module'
        ? {
            name: f.name ?? '',
            description: f.description,
            includes: f.includes,
            excludes: f.excludes,
            hours_min: numOrNull(f.hours_min),
            hours_max: numOrNull(f.hours_max),
            risk: f.risk,
            goals_json: goals.length ? JSON.stringify(goals) : null,
            archetypes_json: archetypes.length ? JSON.stringify(archetypes) : null,
          }
        : {
            name: f.name ?? '',
            category: f.category,
            hours_platform_min: numOrNull(f.hours_platform_min),
            hours_platform_max: numOrNull(f.hours_platform_max),
            hours_custom_min: numOrNull(f.hours_custom_min),
            hours_custom_max: numOrNull(f.hours_custom_max),
            risk: f.risk,
            requirements: f.requirements,
          };
    const res = await onCreate(entity, code, row);
    if (res.ok) onCreated();
    else setErrors(res.errors ?? ['Nie udało się utworzyć.']);
  };

  // Funkcja zwracająca JSX (NIE komponent) — komponent w renderze remontowałby input i gubił focus.
  const numField = (k: string, label: string) => (
    <label className="block">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <input
        type="number"
        className={inputCls}
        value={f[k] ?? ''}
        onChange={(e) => set(k, e.target.value)}
      />
    </label>
  );

  return (
    <div className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50">
      <h3 className="text-sm font-black text-dark">
        Nowy {entity === 'module' ? 'moduł' : 'integracja'}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-600">Kod (snake_case, niezmienny)</span>
          <input
            className={inputCls}
            placeholder="np. gift_cards"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-600">Nazwa</span>
          <input
            className={inputCls}
            value={f.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
          />
        </label>
      </div>

      {entity === 'module' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {numField('hours_min', 'Godziny min')}
            {numField('hours_max', 'Godziny maks')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Ryzyko</span>
              <select
                className={inputCls}
                value={f.risk}
                onChange={(e) => set('risk', e.target.value)}
              >
                {RISK.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-600">Cele (puste = wszystkie)</span>
            <div className="flex flex-wrap gap-3 mt-1">
              {goalOptions.map((g) => (
                <label key={g.value} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={goals.includes(g.value)}
                    onChange={() => toggle(goals, setGoals, g.value)}
                  />
                  {g.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-600">
              Archetypy (puste = wszystkie)
            </span>
            <div className="flex flex-wrap gap-3 mt-1">
              {library.archetypes.map((a) => (
                <label key={a.code} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={archetypes.includes(a.code)}
                    onChange={() => toggle(archetypes, setArchetypes, a.code)}
                  />
                  {a.code}
                </label>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Kategoria</span>
            <select
              className={inputCls}
              value={f.category ?? ''}
              onChange={(e) => set('category', e.target.value)}
            >
              <option value="">— wybierz —</option>
              {INT_CATEGORY.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {numField('hours_platform_min', 'Platform min (puste = brak taryfy)')}
            {numField('hours_platform_max', 'Platform maks')}
            {numField('hours_custom_min', 'Custom min')}
            {numField('hours_custom_max', 'Custom maks')}
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Ryzyko</span>
            <select
              className={inputCls}
              value={f.risk}
              onChange={(e) => set('risk', e.target.value)}
            >
              {RISK.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {errors.length > 0 && (
        <ul className="text-xs text-red-600 list-disc pl-5 space-y-0.5">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={submit}
          className="text-xs font-bold bg-dark text-white px-3 py-1.5 rounded flex items-center gap-1 disabled:opacity-50"
        >
          <Save size={13} /> Utwórz
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-dark flex items-center gap-1"
        >
          <X size={13} /> Anuluj
        </button>
      </div>
    </div>
  );
};

export default CreateItemForm;
