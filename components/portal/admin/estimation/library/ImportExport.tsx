import React, { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import type { EntityDiff } from '@/lib/estimation/libraryPack';

// Eksport/import biblioteki (f2c-2b). Import to DWA kroki: dry-run (raport różnic + ostrzeżenia +
// błędy, ZERO zapisów) → „Zastosuj" tylko przy zerze błędów. Ostrzeżenia (gaszony kod) NIE blokują.

interface Props {
  sessionToken: string | null;
  onApplied: () => void;
}

type DiffReport = Record<string, EntityDiff>;

const ImportExport: React.FC<Props> = ({ sessionToken, onApplied }) => {
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [report, setReport] = useState<DiffReport | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const auth = { Authorization: `Bearer ${sessionToken}` };

  const doExport = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/estimation/library-export', { headers: auth });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biblioteka-wycen-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Błąd eksportu');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setData(null);
    setReport(null);
    setWarnings([]);
    setErrors([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onFile = async (file: File) => {
    setBusy(true);
    setMsg(null);
    reset();
    try {
      const parsed = JSON.parse(await file.text());
      setData(parsed);
      const res = await fetch('/api/admin/estimation/library-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ data: parsed, apply: false }),
      });
      const body = (await res.json()) as {
        report?: DiffReport;
        warnings?: string[];
        errors?: string[];
        error?: string;
      };
      if (!res.ok) {
        setErrors(body.errors ?? [body.error ?? `HTTP ${res.status}`]);
        return;
      }
      setReport(body.report ?? null);
      setWarnings(body.warnings ?? []);
      setErrors(body.errors ?? []);
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Błąd wczytania pliku']);
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/estimation/library-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ data, apply: true }),
      });
      const body = (await res.json()) as { applied?: boolean; errors?: string[]; error?: string };
      if (!res.ok || !body.applied) {
        setErrors(body.errors ?? [body.error ?? `HTTP ${res.status}`]);
        return;
      }
      setMsg('Import zastosowany.');
      reset();
      onApplied();
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Błąd importu']);
    } finally {
      setBusy(false);
    }
  };

  const nonEmpty = (d: EntityDiff) => d.added.length || d.changed.length || d.removed.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={doExport}
          className="text-sm font-bold border border-gray-300 text-dark px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
        >
          <Download size={16} /> Eksportuj bibliotekę
        </button>
        <label className="text-sm font-bold bg-dark text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer hover:opacity-90">
          <Upload size={16} /> Importuj (dry-run)
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </label>
      </div>
      {msg && <p className="text-sm text-green-700">{msg}</p>}

      {report && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-black text-dark">Raport importu (dry-run)</h3>

          <div className="text-xs space-y-1">
            {Object.entries(report)
              .filter(([, d]) => nonEmpty(d))
              .map(([entity, d]) => (
                <div key={entity} className="font-mono">
                  <span className="font-bold">{entity}</span>: +{d.added.length} dodane, ~
                  {d.changed.length} zmienione, −{d.removed.length} nieobecne (niekasowane)
                </div>
              ))}
            {Object.values(report).every((d) => !nonEmpty(d)) && (
              <p className="text-gray-500">Brak różnic — biblioteka zgodna z plikiem.</p>
            )}
          </div>

          {warnings.length > 0 && (
            <div className="text-xs text-amber-700 space-y-0.5">
              <p className="font-bold flex items-center gap-1">
                <AlertTriangle size={13} /> Ostrzeżenia (nie blokują):
              </p>
              <ul className="list-disc pl-5">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
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
              disabled={busy || errors.length > 0}
              onClick={apply}
              className="text-sm font-bold bg-dark text-white px-4 py-2 rounded disabled:opacity-40"
              title={errors.length > 0 ? 'Napraw błędy, aby zastosować' : ''}
            >
              Zastosuj import
            </button>
            <button type="button" onClick={reset} className="text-xs text-gray-500 hover:text-dark">
              Anuluj
            </button>
          </div>
        </div>
      )}

      {report === null && errors.length > 0 && (
        <ul className="text-xs text-red-600 list-disc pl-5 space-y-0.5">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ImportExport;
