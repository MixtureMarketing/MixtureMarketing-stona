import React, { useMemo, useState } from 'react';
import { Pencil, Save, X, Lock } from 'lucide-react';
import type { AnswerValue, Condition, RuleAction } from '@/lib/estimation/types';
import type { EstimationLibrary } from '../useEstimationLibrary';
import type { RawRuleRow, RuleModel } from './ruleAdapter';
import { toRuleModels, ruleToPatch } from './ruleAdapter';
import type { PatchResult } from './useLibraryMutations';

// Edytor reguł (f2c-2a): edycja WARTOŚCI w istniejącym drzewie (progi val w liściach) + parametry
// akcji (poziom, kody z list biblioteki) + name/priority/is_active/reason_template. Operatory i
// kody pytań/obszarów read-only; restrukturyzacja drzewa i tworzenie reguł → F3. JSON = podgląd.
// Aktualizacje NIEMUTUJĄCE (immutable) — draft to stan, nowa wartość = nowe drzewo/akcje.
// Zapis przez adapter (ruleToPatch); serwer waliduje spójność (sieroty → 400).

interface Props {
  rows: RawRuleRow[];
  library: EstimationLibrary;
  saving: boolean;
  onSave: (key: { id: number }, patch: Record<string, unknown>) => Promise<PatchResult>;
  onSaved: () => void;
}

type Leaf = { q: string; op: string; val?: unknown };

/** Liście w kolejności trawersu (do renderu). */
function collectLeaves(node: Condition, acc: Leaf[] = []): Leaf[] {
  if ('all' in node) node.all.forEach((c) => collectLeaves(c, acc));
  else if ('any' in node) node.any.forEach((c) => collectLeaves(c, acc));
  else acc.push(node);
  return acc;
}

/** IMMUTABLE: buduje nowe drzewo, zmieniając val liścia o indeksie targetIdx (kolejność trawersu). */
function setLeafValAt(
  node: Condition,
  targetIdx: number,
  newVal: unknown,
  ctr = { i: 0 },
): Condition {
  if ('all' in node) return { all: node.all.map((c) => setLeafValAt(c, targetIdx, newVal, ctr)) };
  if ('any' in node) return { any: node.any.map((c) => setLeafValAt(c, targetIdx, newVal, ctr)) };
  const idx = ctr.i++;
  return idx === targetIdx ? { ...node, val: newVal as AnswerValue } : node;
}

const inputCls =
  'border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent';

const RulesEditor: React.FC<Props> = ({ rows, library, saving, onSave, onSaved }) => {
  const models = useMemo(() => toRuleModels(rows), [rows]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<RuleModel | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const codeOpts = {
    module: library.modules.map((m) => m.code),
    integration: library.integrations.map((i) => i.code),
    multiplier: library.multipliers.map((m) => m.code),
    cost: library.costItemTypes.map((c) => c.code),
    archetype: library.archetypes.map((a) => a.code),
  };
  const levelsByAspect = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const l of library.levels) {
      if (!m.has(l.aspect_code)) m.set(l.aspect_code, []);
      m.get(l.aspect_code)!.push(l.level);
    }
    return m;
  }, [library.levels]);

  const start = (model: RuleModel) => {
    setDraft(JSON.parse(JSON.stringify(model)) as RuleModel); // głęboki klon do edycji
    setErrors([]);
    setEditingId(model.id);
  };
  const cancel = () => {
    setEditingId(null);
    setDraft(null);
    setErrors([]);
  };

  const patchDraft = (p: Partial<RuleModel>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const setLeaf = (idx: number, newVal: unknown) =>
    setDraft((d) => (d ? { ...d, condition: setLeafValAt(d.condition, idx, newVal) } : d));
  const setAction = (idx: number, p: Record<string, unknown>) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            actions: d.actions.map((a, i) => (i === idx ? ({ ...a, ...p } as RuleAction) : a)),
          }
        : d,
    );

  const save = async () => {
    if (!draft) return;
    const res = await onSave({ id: draft.id }, ruleToPatch(draft));
    if (res.ok) {
      cancel();
      onSaved();
    } else {
      setErrors(res.errors ?? ['Nie udało się zapisać.']);
    }
  };

  /** Koercja edytowanego val do typu oryginału (próg liczbowy zostaje liczbą). */
  const coerceVal = (orig: unknown, raw: string): unknown => {
    if (typeof orig === 'number') return Number(raw);
    if (typeof orig === 'boolean') return raw === 'true';
    if (Array.isArray(orig))
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return raw;
  };

  return (
    <div className="space-y-2">
      {models.map((model) => {
        const isEditing = editingId === model.id;
        const d = isEditing && draft ? draft : model;
        const leaves = collectLeaves(d.condition);
        return (
          <div key={model.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0 inline-flex items-center gap-1">
                  <Lock size={11} /> #{model.id}
                </span>
                <span className="text-sm font-semibold text-dark truncate">{model.name}</span>
                {!model.isActive && (
                  <span className="text-[11px] text-gray-400 shrink-0">(nieaktywna)</span>
                )}
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => start(model)}
                  className="text-xs text-gray-500 hover:text-dark flex items-center gap-1 shrink-0"
                >
                  <Pencil size={13} /> Edytuj
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={save}
                    className="text-xs font-bold bg-dark text-white px-3 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                  >
                    <Save size={13} /> Zapisz
                  </button>
                  <button
                    type="button"
                    onClick={cancel}
                    className="text-xs text-gray-500 hover:text-dark flex items-center gap-1"
                  >
                    <X size={13} /> Anuluj
                  </button>
                </div>
              )}
            </div>

            {isEditing && draft && (
              <div className="mt-3 space-y-3 text-sm">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600">Nazwa</span>
                  <input
                    className={`${inputCls} w-full`}
                    value={draft.name}
                    onChange={(e) => patchDraft({ name: e.target.value })}
                  />
                </label>
                <div className="flex gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-gray-600">Priorytet</span>
                    <input
                      type="number"
                      className={`${inputCls} w-24`}
                      value={draft.priority}
                      onChange={(e) => patchDraft({ priority: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex items-center gap-2 mt-5">
                    <input
                      type="checkbox"
                      checked={draft.isActive}
                      onChange={(e) => patchDraft({ isActive: e.target.checked })}
                    />
                    <span className="text-xs font-semibold text-gray-600">Aktywna</span>
                  </label>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-600">
                    Warunki (edytowalne wartości; operatory i pytania — kontrakt)
                  </span>
                  <div className="space-y-1 mt-1">
                    {leaves.map((leaf, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">
                          {leaf.q} {leaf.op}
                        </span>
                        {leaf.op === 'answered' ||
                        leaf.op === 'unknown' ||
                        leaf.op === 'not_applicable' ? (
                          <span className="text-xs text-gray-400">(bez wartości)</span>
                        ) : (
                          <input
                            className={`${inputCls} flex-1`}
                            value={
                              Array.isArray(leaf.val) ? leaf.val.join(', ') : String(leaf.val ?? '')
                            }
                            onChange={(e) => setLeaf(i, coerceVal(leaf.val, e.target.value))}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-600">Akcje</span>
                  <div className="space-y-1 mt-1">
                    {draft.actions.map((a, i) => (
                      <ActionRow
                        key={i}
                        action={a}
                        codeOpts={codeOpts}
                        levelsByAspect={levelsByAspect}
                        onPatch={(p) => setAction(i, p)}
                      />
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-gray-600">
                    Uzasadnienie (reason_template)
                  </span>
                  <textarea
                    className={`${inputCls} w-full`}
                    rows={2}
                    value={draft.reasonTemplate}
                    onChange={(e) => patchDraft({ reasonTemplate: e.target.value })}
                  />
                </label>

                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer">Podgląd JSON (read-only)</summary>
                  <pre className="mt-1 bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto">
                    {JSON.stringify(
                      { condition: draft.condition, actions: draft.actions },
                      null,
                      2,
                    )}
                  </pre>
                </details>

                {errors.length > 0 && (
                  <ul className="text-xs text-red-600 list-disc pl-5 space-y-0.5">
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
      {models.length === 0 && <p className="text-sm text-gray-400">Brak reguł.</p>}
    </div>
  );
};

interface ActionRowProps {
  action: RuleAction;
  codeOpts: {
    module: string[];
    integration: string[];
    multiplier: string[];
    cost: string[];
    archetype: string[];
  };
  levelsByAspect: Map<string, number[]>;
  onPatch: (p: Record<string, unknown>) => void;
}

const ActionRow: React.FC<ActionRowProps> = ({ action, codeOpts, levelsByAspect, onPatch }) => {
  const a = action as RuleAction & Record<string, unknown>;
  const dropdown = (opts: string[]) => (
    <select
      className={inputCls}
      value={String(a.code ?? '')}
      onChange={(e) => onPatch({ code: e.target.value })}
    >
      {opts.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-mono text-gray-500 shrink-0">{String(a.type)}</span>
      {a.type === 'min_level' && (
        <>
          <span className="text-xs text-gray-500">{String(a.aspect)}</span>
          <select
            className={inputCls}
            value={Number(a.level)}
            onChange={(e) => onPatch({ level: Number(e.target.value) })}
          >
            {(levelsByAspect.get(String(a.aspect)) ?? [0, 1, 2, 3, 4]).map((lv) => (
              <option key={lv} value={lv}>
                poziom {lv}
              </option>
            ))}
          </select>
        </>
      )}
      {a.type === 'multiplier' && dropdown(codeOpts.multiplier)}
      {a.type === 'suggest_module' && dropdown(codeOpts.module)}
      {a.type === 'suggest_integration' && dropdown(codeOpts.integration)}
      {a.type === 'cost_item' && dropdown(codeOpts.cost)}
      {a.type === 'recommend_archetype' && dropdown(codeOpts.archetype)}
      {a.type === 'archetype_warning' && (
        <input
          className={`${inputCls} flex-1`}
          value={String(a.message ?? '')}
          onChange={(e) => onPatch({ message: e.target.value })}
        />
      )}
    </div>
  );
};

export default RulesEditor;
