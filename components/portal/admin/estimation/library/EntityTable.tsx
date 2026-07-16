import React, { useState } from 'react';
import { Pencil, Save, X, Lock } from 'lucide-react';
import type { EntityConfig, FieldDef, LibRow } from './libraryFields';
import { describeVisibleIf, type QMap } from './visibleIf';
import type { PatchResult } from './useLibraryMutations';

interface Props {
  config: EntityConfig;
  rows: LibRow[];
  qmap: QMap;
  saving: boolean;
  onSave: (key: Record<string, unknown>, patch: Record<string, unknown>) => Promise<PatchResult>;
  onSaved: () => void;
}

type Opt = { value: unknown; label: string };

function parseOpts(raw: unknown): Opt[] {
  if (typeof raw !== 'string') return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Koercja wartości pola z inputu (string) na typ do PATCH. Liczba pusta + nullable → null. */
function coerce(field: FieldDef, raw: string): unknown {
  if (field.kind === 'number') {
    if (raw.trim() === '') return field.nullable ? null : NaN;
    return Number(raw);
  }
  return raw;
}

const inputCls =
  'w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent';

const EntityTable: React.FC<Props> = ({ config, rows, qmap, saving, onSave, onSaved }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [opts, setOpts] = useState<Opt[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const editableFields = config.fields.filter((f) => f.kind !== 'visibleif');

  const startEdit = (row: LibRow) => {
    const id = config.rowId(row);
    const d: Record<string, string> = {};
    for (const f of editableFields) {
      if (f.kind === 'options') continue;
      const v = row[f.key];
      d[f.key] = v === null || v === undefined ? '' : String(v);
    }
    setDraft(d);
    setOpts(parseOpts(row.options_json));
    setErrors([]);
    setEditingId(id);
  };

  const cancel = () => {
    setEditingId(null);
    setErrors([]);
  };

  const save = async (row: LibRow) => {
    const patch: Record<string, unknown> = {};
    for (const f of editableFields) {
      if (f.kind === 'options') {
        const nextJson = JSON.stringify(opts);
        if (nextJson !== (row.options_json ?? '')) patch.options_json = nextJson;
        continue;
      }
      const coerced = coerce(f, draft[f.key] ?? '');
      const original = row[f.key] ?? null;
      const normalizedOriginal = original === null ? null : original;
      // porównanie po koercji — wysyłamy tylko realnie zmienione pola
      const changed =
        f.kind === 'number'
          ? Number(normalizedOriginal) !== coerced &&
            !(normalizedOriginal === null && coerced === null)
          : String(normalizedOriginal ?? '') !== String(coerced ?? '');
      if (changed) patch[f.key] = coerced;
    }
    if (Object.keys(patch).length === 0) {
      cancel();
      return;
    }
    const res = await onSave(config.keyOf(row), patch);
    if (res.ok) {
      setEditingId(null);
      setErrors([]);
      onSaved();
    } else {
      setErrors(res.errors ?? ['Nie udało się zapisać.']);
    }
  };

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const id = config.rowId(row);
        const isEditing = editingId === id;
        return (
          <div key={id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0"
                  title="Kod/klucz to kontrakt danych — nieedytowalny"
                >
                  <Lock size={11} /> {id}
                </span>
                {!isEditing && (
                  <span className="text-sm font-semibold text-dark truncate">
                    {String(row.name ?? row.text ?? row.value ?? '')}
                  </span>
                )}
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  className="text-xs text-gray-500 hover:text-dark flex items-center gap-1 shrink-0"
                >
                  <Pencil size={13} /> Edytuj
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => save(row)}
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

            {isEditing && (
              <div className="mt-3 space-y-3">
                {config.fields.map((f) => (
                  <FieldRow
                    key={f.key}
                    field={f}
                    row={row}
                    draft={draft}
                    setDraft={setDraft}
                    opts={opts}
                    setOpts={setOpts}
                    qmap={qmap}
                  />
                ))}
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
      {rows.length === 0 && <p className="text-sm text-gray-400">Brak pozycji.</p>}
    </div>
  );
};

interface FieldRowProps {
  field: FieldDef;
  row: LibRow;
  draft: Record<string, string>;
  setDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  opts: Opt[];
  setOpts: React.Dispatch<React.SetStateAction<Opt[]>>;
  qmap: QMap;
}

const FieldRow: React.FC<FieldRowProps> = ({
  field,
  row,
  draft,
  setDraft,
  opts,
  setOpts,
  qmap,
}) => {
  const set = (v: string) => setDraft((d) => ({ ...d, [field.key]: v }));
  const val = draft[field.key] ?? '';

  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-600">{field.label}</span>
      {field.hint && <span className="block text-[11px] text-gray-400">{field.hint}</span>}

      {field.kind === 'text' && (
        <input className={inputCls} value={val} onChange={(e) => set(e.target.value)} />
      )}
      {field.kind === 'number' && (
        <input
          type="number"
          className={inputCls}
          value={val}
          onChange={(e) => set(e.target.value)}
        />
      )}
      {field.kind === 'textarea' && (
        <textarea className={inputCls} rows={2} value={val} onChange={(e) => set(e.target.value)} />
      )}
      {field.kind === 'select' && (
        <select className={inputCls} value={val} onChange={(e) => set(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
      {field.kind === 'visibleif' && (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1">
          {describeVisibleIf((row.visible_if_json as string | null | undefined) ?? null, qmap)}
        </p>
      )}
      {field.kind === 'options' && (
        <div className="space-y-1 mt-1">
          {opts.length === 0 && <span className="text-xs text-gray-400">Brak opcji.</span>}
          {opts.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="text-[11px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0"
                title="value opcji jest nieedytowalne (kontrakt danych)"
              >
                {String(o.value)}
              </span>
              <input
                className={inputCls}
                value={o.label}
                onChange={(e) =>
                  setOpts((prev) =>
                    prev.map((p, j) => (j === i ? { ...p, label: e.target.value } : p)),
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </label>
  );
};

export default EntityTable;
