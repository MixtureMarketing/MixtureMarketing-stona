import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Plus, ArrowLeft } from 'lucide-react';
import QuotesList from './QuotesList';
import QuoteWizard from './QuoteWizard';
import ResultScreen from './wizard/ResultScreen';

// Wejście zakładki „Wyceny": lista + „Nowa wycena" + kreator + widok wyceny (f2b).
interface Props {
  sessionToken: string | null;
}

type Widok =
  | { ekran: 'list' }
  | { ekran: 'wizard'; id?: number } // id = wznowienie istniejącego draftu
  | { ekran: 'result'; id: number };

/** Statusy, w których wycena ma snapshot — otwieramy ją na ekranie wyniku, nie w wizardzie. */
const PO_FINALIZE = new Set(['review', 'sent', 'won', 'lost', 'closed']);

/**
 * Deep link `?tab=wyceny&quote=ID` (SKILL.md). Zakładka nie jest osobną trasą routera,
 * więc stan trzymamy w query — dzięki temu link do wyceny da się wkleić i odświeżyć.
 */
const czytajIdZUrl = (): number | null => {
  if (typeof window === 'undefined') return null;
  const v = Number(new URLSearchParams(window.location.search).get('quote'));
  return Number.isInteger(v) && v > 0 ? v : null;
};

const zapiszIdWUrl = (id: number | null) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (id) url.searchParams.set('quote', String(id));
  else url.searchParams.delete('quote');
  window.history.replaceState({}, '', url);
};

const EstimationTab: React.FC<Props> = ({ sessionToken }) => {
  const [widok, setWidok] = useState<Widok>({ ekran: 'list' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [bladOtwarcia, setBladOtwarcia] = useState<string | null>(null);

  /**
   * Otwarcie wyceny: o ekranie decyduje STATUS, nie kliknięcie. Draft wraca do wizarda
   * (jest co dokończyć), wycena po finalize idzie na ekran wyniku z dokumentami — wizard
   * pokazałby edycję czegoś, czego i tak nie wolno ruszyć (quote-finalize, 409).
   */
  const otworz = useCallback(
    async (id: number) => {
      setBladOtwarcia(null);
      try {
        const res = await fetch(`/api/admin/estimation/quote?id=${id}`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { quote } = (await res.json()) as { quote: { status: string } };
        setWidok(PO_FINALIZE.has(quote.status) ? { ekran: 'result', id } : { ekran: 'wizard', id });
        zapiszIdWUrl(id);
      } catch (e) {
        setBladOtwarcia(e instanceof Error ? e.message : 'Nie udało się otworzyć wyceny');
      }
    },
    [sessionToken],
  );

  // Wejście z linku: `?quote=ID` otwiera wycenę od razu po wczytaniu zakładki.
  useEffect(() => {
    const id = czytajIdZUrl();
    if (id && sessionToken) void otworz(id);
    // Świadomie tylko przy montowaniu: później stanem steruje UI, nie URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  const doListy = () => {
    setWidok({ ekran: 'list' });
    zapiszIdWUrl(null);
    setRefreshKey((k) => k + 1); // status/dokumenty mogły się zmienić
  };

  if (widok.ekran === 'wizard') {
    return (
      <QuoteWizard
        key={widok.id ?? 'nowa'} // wznowienie innej wyceny = świeży stan wizarda
        sessionToken={sessionToken}
        resumeQuoteId={widok.id}
        onCreated={() => setRefreshKey((k) => k + 1)}
        onCancel={doListy}
      />
    );
  }

  if (widok.ekran === 'result') {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <button
          type="button"
          onClick={doListy}
          className="text-sm text-gray-500 flex items-center gap-1 mb-4 hover:text-dark"
        >
          <ArrowLeft size={16} /> Wróć do listy
        </button>
        <ResultScreen
          key={widok.id}
          quoteId={widok.id}
          sessionToken={sessionToken}
          onDuplicated={(newId) => {
            // Duplikat to świeży draft — otwieramy go w wizardzie, bo jest do dokończenia.
            setRefreshKey((k) => k + 1);
            setWidok({ ekran: 'wizard', id: newId });
            zapiszIdWUrl(newId);
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-dark flex items-center gap-2">
          <FileText size={20} /> Wyceny
        </h2>
        <button
          type="button"
          onClick={() => {
            setWidok({ ekran: 'wizard' });
            zapiszIdWUrl(null);
          }}
          className="px-4 py-2 rounded-lg font-bold bg-dark text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nowa wycena
        </button>
      </div>
      {bladOtwarcia && <p className="text-red-600 text-sm mb-3">{bladOtwarcia}</p>}
      <QuotesList sessionToken={sessionToken} refreshKey={refreshKey} onOpen={otworz} />
    </div>
  );
};

export default EstimationTab;
