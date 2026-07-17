import React, { useState } from 'react';
import { Save } from 'lucide-react';

// Formularz zamknięcia projektu (f3a): tabela obszarów/pozycji ze snapshotu (przewidywane widełki)
// + pole na REALNE godziny. Zapis do est_actual_hours (quote-close). Puste = „nie mierzyliśmy"
// (wiersz kasowany). Edytowalny dla won I closed. Cel: 5 minut.

export interface CloseRow {
  /** klucz do est_actual_hours: aspect_code LUB 'module:X'/'integration:Y'. */
  code: string;
  name: string;
  predMin: number;
  predMax: number;
}

interface Props {
  quoteId: number;
  sessionToken: string | null;
  rows: CloseRow[];
  actualHours: Record<string, { hours: number; note: string | null }>;
  onSaved: () => void;
}

const CloseProjectForm: React.FC<Props> = ({
  quoteId,
  sessionToken,
  rows,
  actualHours,
  onSaved,
}) => {
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    for (const r of rows) {
      const a = actualHours[r.code];
      d[r.code] = a ? String(a.hours) : '';
    }
    return d;
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const set = (code: string, v: string) => setDraft((d) => ({ ...d, [code]: v }));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    setErrors([]);
    try {
      const actuals = rows.map((r) => ({
        code: r.code,
        hours: draft[r.code]?.trim() === '' || draft[r.code] == null ? null : Number(draft[r.code]),
      }));
      const res = await fetch('/api/admin/estimation/quote-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ id: quoteId, actuals }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        saved?: number;
        cleared?: number;
        errors?: string[];
        error?: string;
      };
      if (!res.ok || !body.ok) {
        setErrors(body.errors ?? [body.error ?? `HTTP ${res.status}`]);
        return;
      }
      setMsg(
        `Zapisano godziny (${body.saved ?? 0}${body.cleared ? `, wyczyszczono ${body.cleared}` : ''}).`,
      );
      onSaved();
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Błąd zapisu godzin']);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-slate-200 space-y-3">
      <h4 className="font-bold text-sm text-dark">Godziny rzeczywiste (do kalibracji)</h4>
      <p className="text-xs text-gray-500">
        Wpisz realne godziny obok przewidywanych. Puste pole = „nie mierzyliśmy". Można edytować
        także po zamknięciu.
      </p>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.code} className="flex items-center gap-2 text-sm">
            <span className="flex-1 font-medium text-dark truncate">{r.name}</span>
            <span className="text-xs text-gray-400 w-24 text-right">
              {Math.round(r.predMin)}–{Math.round(r.predMax)} h
            </span>
            <input
              type="number"
              min={0}
              step="0.5"
              value={draft[r.code] ?? ''}
              onChange={(e) => set(r.code, e.target.value)}
              placeholder="realne"
              aria-label={`Realne godziny: ${r.name}`}
              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-gray-400">Brak pozycji do zmierzenia.</p>}
      </div>

      {errors.length > 0 && (
        <ul className="text-xs text-red-600 list-disc pl-5">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
      {msg && <p className="text-xs text-green-700">{msg}</p>}

      <button
        type="button"
        disabled={busy}
        onClick={save}
        className="text-sm font-bold bg-dark text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
      >
        <Save size={15} /> {busy ? 'Zapisuję…' : 'Zapisz godziny'}
      </button>
    </div>
  );
};

export default CloseProjectForm;
