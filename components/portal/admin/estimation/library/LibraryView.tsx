import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useEstimationLibrary } from '../useEstimationLibrary';
import { useLibraryMutations } from './useLibraryMutations';
import { ENTITY_CONFIGS } from './libraryFields';
import EntityTable from './EntityTable';
import type { QMap } from './visibleIf';

interface Props {
  sessionToken: string | null;
  onBack: () => void;
}

/** Edytor biblioteki wiedzy (f2c-1). Zmiany działają wyłącznie WPRZÓD — snapshoty wycen
 *  są nietykalne (inwariant 3). Kody/klucze i value opcji są nieedytowalne (kontrakt danych). */
const LibraryView: React.FC<Props> = ({ sessionToken, onBack }) => {
  const { library, loading, error, reload } = useEstimationLibrary(sessionToken);
  const { patchRow, saving } = useLibraryMutations(sessionToken);
  const [active, setActive] = useState(ENTITY_CONFIGS[0].entity);

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

  const cfg = ENTITY_CONFIGS.find((c) => c.entity === active)!;

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
        {ENTITY_CONFIGS.map((c) => (
          <button
            key={c.entity}
            type="button"
            onClick={() => setActive(c.entity)}
            className={`px-3 py-2 text-sm font-bold -mb-px border-b-2 transition-colors ${
              active === c.entity
                ? 'border-accent text-dark'
                : 'border-transparent text-gray-400 hover:text-dark'
            }`}
          >
            {c.tab}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Ładowanie biblioteki…</p>}
      {error && <p className="text-sm text-red-600">Błąd: {error}</p>}
      {library && (
        <EntityTable
          key={cfg.entity}
          config={cfg}
          rows={cfg.rowsFrom(library)}
          qmap={qmap}
          saving={saving}
          onSave={(key, patch) => patchRow(cfg.entity, key, patch)}
          onSaved={reload}
        />
      )}
    </div>
  );
};

export default LibraryView;
