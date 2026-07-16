import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';
import { useEstimationLibrary } from '../useEstimationLibrary';
import { useLibraryMutations } from './useLibraryMutations';
import { useEditorRules } from './useEditorRules';
import { ENTITY_CONFIGS } from './libraryFields';
import EntityTable from './EntityTable';
import RulesEditor from './RulesEditor';
import CreateItemForm from './CreateItemForm';
import type { QMap } from './visibleIf';

interface Props {
  sessionToken: string | null;
  onBack: () => void;
}

type Tab = string; // kod encji z ENTITY_CONFIGS albo 'rule'

/** Edytor biblioteki wiedzy (f2c). Zmiany działają wyłącznie WPRZÓD — snapshoty wycen nietykalne
 *  (inwariant 3). Kody/klucze/value opcji nieedytowalne; reguły-sieroty odrzuca serwer (400). */
const LibraryView: React.FC<Props> = ({ sessionToken, onBack }) => {
  const { library, loading, error, reload } = useEstimationLibrary(sessionToken);
  const editorRules = useEditorRules(sessionToken);
  const { patchRow, createItem, saving } = useLibraryMutations(sessionToken);
  const [active, setActive] = useState<Tab>(ENTITY_CONFIGS[0].entity);
  const [creating, setCreating] = useState<'module' | 'integration' | null>(null);

  const qmap: QMap = useMemo(() => {
    const m: QMap = {};
    for (const q of library?.questions ?? []) {
      let options: { value: unknown; label: string }[] | undefined;
      try {
        const parsed = q.options_json ? JSON.parse(q.options_json) : null;
        if (Array.isArray(parsed)) options = parsed;
      } catch {
        options = undefined;
      }
      m[q.code] = { text: q.text, options };
    }
    return m;
  }, [library]);

  const cfg = ENTITY_CONFIGS.find((c) => c.entity === active);
  const tabs = [
    ...ENTITY_CONFIGS.map((c) => ({ key: c.entity, label: c.tab })),
    { key: 'rule', label: 'Reguły' },
  ];
  const canCreate = active === 'module' || active === 'integration';

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-500 flex items-center gap-1 mb-4 hover:text-dark"
      >
        <ArrowLeft size={16} /> Wróć do wycen
      </button>

      <h2 className="text-xl font-black text-dark flex items-center gap-2 mb-1">
        <BookOpen size={20} /> Biblioteka wiedzy
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Zmiany działają na PRZYSZŁE wyceny. Wysłane wyceny mają zamrożony snapshot i nie zmienią
        się. Kody i identyfikatory to kontrakt danych — nieedytowalne.
      </p>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setActive(t.key);
              setCreating(null);
            }}
            className={`px-3 py-2 text-sm font-bold -mb-px border-b-2 transition-colors ${
              active === t.key
                ? 'border-accent text-dark'
                : 'border-transparent text-gray-400 hover:text-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Ładowanie biblioteki…</p>}
      {error && <p className="text-sm text-red-600">Błąd: {error}</p>}

      {/* Reguły */}
      {active === 'rule' && library && (
        <>
          {editorRules.loading && <p className="text-sm text-gray-400">Ładowanie reguł…</p>}
          {editorRules.error && <p className="text-sm text-red-600">Błąd: {editorRules.error}</p>}
          <RulesEditor
            rows={editorRules.rules}
            library={library}
            saving={saving}
            onSave={(key, patch) => patchRow('rule', key, patch)}
            onSaved={editorRules.reload}
          />
        </>
      )}

      {/* Encje proste (f2c-1) + CREATE (f2c-2a) */}
      {cfg && library && (
        <>
          {canCreate && (
            <div className="mb-3">
              {creating ? (
                <CreateItemForm
                  entity={creating}
                  library={library}
                  saving={saving}
                  onCreate={createItem}
                  onCreated={() => {
                    setCreating(null);
                    reload();
                  }}
                  onCancel={() => setCreating(null)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setCreating(active as 'module' | 'integration')}
                  className="text-xs font-bold border border-gray-300 text-dark px-3 py-1.5 rounded flex items-center gap-1 hover:bg-gray-50"
                >
                  <Plus size={14} /> Nowy {active === 'module' ? 'moduł' : 'integracja'}
                </button>
              )}
            </div>
          )}
          <EntityTable
            key={cfg.entity}
            config={cfg}
            rows={cfg.rowsFrom(library)}
            qmap={qmap}
            saving={saving}
            onSave={(key, patch) => patchRow(cfg.entity, key, patch)}
            onSaved={reload}
          />
        </>
      )}
    </div>
  );
};

export default LibraryView;
