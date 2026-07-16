import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileText, FileCode, Send, Copy } from 'lucide-react';
import { buildOffer, buildDecisionCard, type QuoteSnapshot } from '@/lib/estimation/documents';
import { STATUS_LABEL, STATUS_STYLE, MOZLIWE_PRZEJSCIA, dataStatusu } from '../status';
import CloseProjectForm, { type CloseRow } from './CloseProjectForm';
import ResultDecisions from './ResultDecisions';

// Ekran wyniku (f1c #5/#6): czyta SNAPSHOT z D1 (read-back po finalize), nie stan lokalny.
// Wersja do odczytania klientowi na spotkaniu: widełki ofertowe + pełne + Confidence + decyzje.
// f2a: stąd generujemy oba dokumenty — też WYŁĄCZNIE ze snapshotu (nigdy z live biblioteki).

const pln = (n: number) => `${Math.round(n).toLocaleString('pl-PL')} zł`;

/** Statusy, w których dokumenty mają sens (po finalize). Draft nie ma snapshotu. */
const DOCS_STATUSES = ['review', 'sent', 'won', 'lost', 'closed'];

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface SnapshotAspect {
  aspect_code: string;
  aspect_name: string;
  category: string;
  suggested_level: number;
  chosen_level: number;
  hours_min: number;
  hours_max: number;
  override_reason: string | null;
  rule_reasons_json: string | null;
}
interface SnapshotItem {
  item_type: string;
  ref_code: string | null;
  name: string;
  hours_min: number | null;
  hours_max: number | null;
  amount_pln: number | null;
}
interface Totals {
  offer: { min: number; max: number };
  price: { min: number; max: number };
  afterBuffer: { hoursMin: number; hoursMax: number };
  costs: number;
}
interface QuoteMeta {
  id: number;
  status: string;
  confidence: number | null;
  pdf_r2_key: string | null;
  card_r2_key: string | null;
  sent_at: string | null;
  won_at: string | null;
  lost_at: string | null;
  closed_at: string | null;
  lost_reason: string | null;
}
interface ReadBack {
  quote: QuoteMeta;
  snapshot: {
    aspects: SnapshotAspect[];
    items: SnapshotItem[];
    totals: Totals | null;
    confidenceBreakdown: { reason: string; delta: number }[] | null;
    /** f3a: godziny rzeczywiste (est_actual_hours), mapa aspect_code → {hours, note}. */
    actualHours: Record<string, { hours: number; note: string | null }>;
  };
}

interface Props {
  quoteId: number;
  sessionToken: string | null;
  /** f2b: duplikat jest nowym draftem — otwieramy go w wizardzie od razu. */
  onDuplicated?: (newId: number) => void;
}

const ResultScreen: React.FC<Props> = ({ quoteId, sessionToken, onDuplicated }) => {
  const [data, setData] = useState<ReadBack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [odswiez, setOdswiez] = useState(0);
  const [powodPrzegranej, setPowodPrzegranej] = useState('');
  const [pytamOPowod, setPytamOPowod] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/estimation/quote?id=${quoteId}`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ReadBack;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Błąd odczytu wyceny');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quoteId, sessionToken, odswiez]);

  if (error) return <p className="text-red-600">Błąd: {error}</p>;
  if (!data) return <p className="text-gray-500">Wczytuję wynik…</p>;

  const { snapshot, quote } = data;
  const t = snapshot.totals;
  // Decyzje techniczne: obszary z godzinami > 0, z uzasadnieniami (Karta decyzji, wersja skrócona).
  const decisions = snapshot.aspects.filter((a) => a.hours_max > 0);

  // f3a: wiersze formularza zamknięcia — obszary + pozycje (moduł/integracja) z godzinami > 0.
  // Kod itemu = `${item_type}:${ref_code}` (klucz est_actual_hours, jak w docs/03 kalibracji).
  const closeRows: CloseRow[] = [
    ...decisions.map((a) => ({
      code: a.aspect_code,
      name: a.aspect_name,
      predMin: a.hours_min,
      predMax: a.hours_max,
    })),
    ...snapshot.items
      .filter((i) => i.item_type !== 'cost' && (i.hours_max ?? 0) > 0 && i.ref_code)
      .map((i) => ({
        code: `${i.item_type}:${i.ref_code}`,
        name: i.name,
        predMin: i.hours_min ?? 0,
        predMax: i.hours_max ?? 0,
      })),
  ];
  const pokazZamkniecie = quote.status === 'won' || quote.status === 'closed';

  // f2a: dokumenty budowane ze snapshotu (ten sam obiekt, który wyświetlamy) — nigdy z live.
  const snap = { quote, ...snapshot } as unknown as QuoteSnapshot;
  const docsReady = DOCS_STATUSES.includes(quote.status);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setDocError(null);
    try {
      await fn();
    } catch (e) {
      setDocError(e instanceof Error ? e.message : 'Nie udało się wygenerować dokumentu');
    } finally {
      setBusy(null);
    }
  };
  const onOffer = () =>
    run('offer', async () => {
      const { generateOfferPdf } = await import('../pdf/offerPdf');
      download(await generateOfferPdf(buildOffer(snap)), `oferta-${snap.quote.id}.pdf`);
    });
  const onCardPdf = () =>
    run('card', async () => {
      const { generateDecisionCardPdf } = await import('../pdf/decisionCardDoc');
      download(
        await generateDecisionCardPdf(buildDecisionCard(snap)),
        `karta-decyzji-${snap.quote.id}.pdf`,
      );
    });
  const onCardMd = () =>
    run('md', async () => {
      const { decisionCardMarkdown } = await import('../pdf/decisionCardDoc');
      const md = decisionCardMarkdown(buildDecisionCard(snap));
      download(new Blob([md], { type: 'text/markdown' }), `karta-decyzji-${snap.quote.id}.md`);
    });

  const auth = { Authorization: `Bearer ${sessionToken}` };
  const bladZOdpowiedzi = async (res: Response) =>
    ((await res.json().catch(() => ({}))) as { error?: string }).error ?? `HTTP ${res.status}`;

  /**
   * Generuje OBA dokumenty i wysyła je do R2. Wołane PRZED zmianą statusu, bo `sent`
   * bez dokumentów w repozytorium odbije się o guard D30 (409) — i słusznie.
   */
  const zapiszDokumenty = async () => {
    const [{ generateOfferPdf }, { generateDecisionCardPdf }] = await Promise.all([
      import('../pdf/offerPdf'),
      import('../pdf/decisionCardDoc'),
    ]);
    const fd = new FormData();
    fd.append('id', String(quoteId));
    fd.append('oferta', await generateOfferPdf(buildOffer(snap)), 'oferta.pdf');
    fd.append('karta', await generateDecisionCardPdf(buildDecisionCard(snap)), 'karta-decyzji.pdf');
    const res = await fetch('/api/admin/estimation/quote-documents', {
      method: 'POST',
      headers: auth,
      body: fd,
    });
    if (!res.ok) throw new Error(await bladZOdpowiedzi(res));
  };

  const zmienStatus = async (status: string, lost_reason?: string) => {
    const res = await fetch('/api/admin/estimation/quote-status', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: quoteId, status, lost_reason }),
    });
    if (!res.ok) throw new Error(await bladZOdpowiedzi(res));
    setOdswiez((k) => k + 1);
  };

  const onWyslij = () =>
    run('send', async () => {
      await zapiszDokumenty();
      await zmienStatus('sent');
    });
  const onWygrana = () => run('won', () => zmienStatus('won'));
  const onZamknij = () => run('close', () => zmienStatus('closed')); // f3a: won → closed
  const onPrzegrana = () =>
    run('lost', async () => {
      await zmienStatus('lost', powodPrzegranej);
      setPytamOPowod(false);
      setPowodPrzegranej('');
    });
  const onDuplikuj = () =>
    run('dup', async () => {
      const res = await fetch('/api/admin/estimation/quote-duplicate', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quoteId }),
      });
      if (!res.ok) throw new Error(await bladZOdpowiedzi(res));
      const d = (await res.json()) as { id: number };
      onDuplicated?.(d.id);
    });

  const btn = (label: string, key: string, onClick: () => void, primary = false) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!docsReady || busy !== null}
      className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
        !docsReady || busy !== null
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : primary
            ? 'bg-dark text-white'
            : 'bg-white border border-slate-300 text-dark'
      }`}
    >
      {key === 'md' ? <FileCode size={16} /> : <FileText size={16} />}
      {busy === key ? 'Generuję…' : label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="text-green-600" size={22} />
        <h3 className="font-black text-dark text-lg">Wycena sfinalizowana</h3>
        <span className="text-xs uppercase text-gray-400">status: {quote.status}</span>
      </div>

      {/* f2a: dokumenty ze snapshotu. Oferta = dla klienta (bez godzin/Confidence),
          Karta decyzji = wewnętrzna (PDF jako załącznik, MD jako brief wykonawczy). */}
      <div className="flex flex-wrap gap-2 items-center">
        {btn('Pobierz ofertę PDF', 'offer', onOffer, true)}
        {btn('Karta decyzji (PDF)', 'card', onCardPdf)}
        {btn('Karta decyzji (MD)', 'md', onCardMd)}
        {!docsReady && (
          <span className="text-xs text-gray-500">dokumenty dostępne po finalize</span>
        )}
      </div>
      {docError && <p className="text-sm text-red-600">{docError}</p>}

      {/* ── Cykl życia (f2b) ──
          Rysujemy tylko przejścia legalne w bieżącym statusie. To wygoda, NIE zabezpieczenie:
          legalności pilnuje quote-status (D30), a UI ma jedynie nie kusić przyciskiem,
          który i tak dostanie 409. */}
      <div className="p-4 rounded-lg border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLE[quote.status] ?? ''}`}
          >
            {STATUS_LABEL[quote.status] ?? quote.status}
          </span>
          {dataStatusu(quote) && (
            <span className="text-xs text-gray-500">od {dataStatusu(quote)}</span>
          )}
          {quote.status === 'lost' && quote.lost_reason && (
            <span className="text-xs text-rose-700">powód: {quote.lost_reason}</span>
          )}
          <span className="flex-1" />
          <button
            type="button"
            onClick={onDuplikuj}
            disabled={busy !== null}
            title="Nowy szkic z tymi samymi odpowiedziami — wysłana wersja zostaje nietknięta"
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 text-dark flex items-center gap-1 disabled:opacity-50"
          >
            <Copy size={14} /> {busy === 'dup' ? 'Duplikuję…' : 'Duplikuj (rewizja)'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {MOZLIWE_PRZEJSCIA[quote.status]?.includes('sent') && (
            <button
              type="button"
              onClick={onWyslij}
              disabled={busy !== null}
              className="px-4 py-2 rounded-lg font-bold text-sm bg-dark text-white flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              {busy === 'send' ? 'Zapisuję dokumenty…' : 'Zapisz dokumenty i oznacz jako wysłaną'}
            </button>
          )}
          {MOZLIWE_PRZEJSCIA[quote.status]?.includes('won') && (
            <button
              type="button"
              onClick={onWygrana}
              disabled={busy !== null}
              className="px-4 py-2 rounded-lg font-bold text-sm bg-emerald-600 text-white disabled:opacity-50"
            >
              {busy === 'won' ? 'Zapisuję…' : 'Wygrana'}
            </button>
          )}
          {MOZLIWE_PRZEJSCIA[quote.status]?.includes('closed') && (
            <button
              type="button"
              onClick={onZamknij}
              disabled={busy !== null}
              className="px-4 py-2 rounded-lg font-bold text-sm bg-slate-700 text-white disabled:opacity-50"
            >
              {busy === 'close' ? 'Zamykam…' : 'Zamknij projekt'}
            </button>
          )}
          {MOZLIWE_PRZEJSCIA[quote.status]?.includes('lost') && !pytamOPowod && (
            <button
              type="button"
              onClick={() => setPytamOPowod(true)}
              disabled={busy !== null}
              className="px-4 py-2 rounded-lg font-bold text-sm border border-rose-300 text-rose-700 disabled:opacity-50"
            >
              Przegrana
            </button>
          )}
          {quote.status === 'review' && (
            <span className="text-xs text-gray-500">
              Wysyłka zapisze ofertę i Kartę w repozytorium — bez nich status „wysłana" byłby
              nieprawdą.
            </span>
          )}
        </div>

        {pytamOPowod && (
          // Powód przegranej jest wymagany przez API (docs/02) — to dane kalibracji F3,
          // a nie pole do odklikania. Pytamy tu, zamiast dostać 400 po fakcie.
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={powodPrzegranej}
              onChange={(e) => setPowodPrzegranej(e.target.value)}
              placeholder="Dlaczego przegraliśmy? (np. cena, termin, wybrali konkurencję)"
              className="flex-1 min-w-64 px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
            <button
              type="button"
              onClick={onPrzegrana}
              disabled={busy !== null || !powodPrzegranej.trim()}
              className="px-4 py-2 rounded-lg font-bold text-sm bg-rose-600 text-white disabled:opacity-50"
            >
              {busy === 'lost' ? 'Zapisuję…' : 'Zapisz przegraną'}
            </button>
            <button
              type="button"
              onClick={() => setPytamOPowod(false)}
              className="text-sm text-gray-500 hover:text-dark"
            >
              Anuluj
            </button>
          </div>
        )}
      </div>

      {/* f3a: formularz zamknięcia — godziny rzeczywiste do est_actual_hours (won i closed). */}
      {pokazZamkniecie && (
        <CloseProjectForm
          quoteId={quoteId}
          sessionToken={sessionToken}
          rows={closeRows}
          actualHours={snapshot.actualHours ?? {}}
          onSaved={() => setOdswiez((k) => k + 1)}
        />
      )}

      {t && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-gray-500 uppercase">Widełki ofertowe (dla klienta)</p>
            <p className="text-2xl font-black text-dark">
              {pln(t.offer.min)} – {pln(t.offer.max)}
            </p>
            {t.costs > 0 && (
              <p className="text-xs text-gray-500 mt-1">+ koszty dodatkowe: {pln(t.costs)}</p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-white border border-slate-200">
            <p className="text-xs text-gray-500 uppercase">Pełne (wewnętrzne)</p>
            <p className="text-lg font-bold text-dark">
              {pln(t.price.min)} – {pln(t.price.max)}
            </p>
            <p className="text-xs text-gray-500">
              {Math.round(t.afterBuffer.hoursMin)}–{Math.round(t.afterBuffer.hoursMax)} h
            </p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500 uppercase">Confidence</p>
        <p className="text-xl font-black text-dark">{quote.confidence ?? '—'}%</p>
        {snapshot.confidenceBreakdown && snapshot.confidenceBreakdown.length > 0 && (
          <ul className="text-xs text-gray-600 list-disc list-inside mt-1">
            {snapshot.confidenceBreakdown.map((b, i) => (
              <li key={i}>
                {b.reason} ({b.delta})
              </li>
            ))}
          </ul>
        )}
      </div>

      <ResultDecisions decisions={decisions} items={snapshot.items} />
    </div>
  );
};

export default ResultScreen;
