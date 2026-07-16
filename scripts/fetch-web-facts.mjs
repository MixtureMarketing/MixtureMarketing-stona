/**
 * Pipeline UCZCIWYCH faktów o stronie (kierunek „warsztat + wyspy kropek",
 * decyzja właściciela 2026-07-16). Zbiera wyłącznie dane mierzone, nigdy
 * deklarowane — pod przyszłą sekcję „ta strona jest naszym portfolio":
 *
 * 1. size-limit (npx size-limit --json) — realny, wymuszany w CI budżet
 *    wagi index JS/CSS po kompresji. Zawsze dostępny po buildzie.
 * 2. PageSpeed Insights API — wynik Lighthouse z datą pomiaru oraz dane
 *    polowe CrUX (28 dni realnych użytkowników), jeśli Google je ma.
 *    Wymaga klucza w env PSI_API_KEY (darmowy: Google Cloud Console →
 *    PageSpeed Insights API; bez klucza pula anonimowa wyczerpuje się
 *    w godziny). Bez klucza sekcja PSI jest pomijana z adnotacją.
 *
 * Wyjście: data/content/web-facts.json — sekcja czyta TYLKO ten plik;
 * zero pomiarów per-user na ekranie (u klienta na słabym łączu strona
 * wystawiłaby sobie jedynkę — werdykt ewaluatora kierunku).
 *
 * Użycie: node scripts/fetch-web-facts.mjs [--url https://mixturemarketing.pl/]
 */
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const urlArg = process.argv.indexOf('--url');
const URL_ = urlArg > -1 ? process.argv[urlArg + 1] : 'https://mixturemarketing.pl/';
const KEY = process.env.PSI_API_KEY;

const facts = {
  generatedAt: new Date().toISOString(),
  url: URL_,
  budget: null,
  lighthouse: null,
  crux: null,
  notes: [],
};

// 1. Budżet wagi — size-limit czyta dist/ (wymaga wcześniejszego builda).
try {
  const raw = execSync('npx size-limit --json', { encoding: 'utf8', stdio: 'pipe' });
  const rows = JSON.parse(raw);
  const js = rows.find((r) => r.name.includes('index-') && r.name.endsWith('.js'));
  const css = rows.find((r) => r.name.endsWith('.css'));
  facts.budget = {
    jsKB: js ? Math.round(js.size / 102.4) / 10 : null,
    jsLimitKB: js ? js.sizeLimit / 1000 : null,
    cssKB: css ? Math.round(css.size / 102.4) / 10 : null,
    cssLimitKB: css ? css.sizeLimit / 1000 : null,
    passed: rows.every((r) => r.passed),
    method: 'size-limit (rozmiar po kompresji), wymuszany przy każdym buildzie',
  };
} catch {
  facts.notes.push('size-limit: brak dist/ — uruchom npm run build przed pomiarem');
}

// 2. PSI: Lighthouse (lab, z datą) + CrUX (pole, 28 dni) — tylko z kluczem.
if (KEY) {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    URL_,
  )}&strategy=mobile&category=performance&key=${KEY}`;
  try {
    const d = await (await fetch(api)).json();
    if (d.error) throw new Error(d.error.message);
    const lh = d.lighthouseResult;
    if (lh?.categories?.performance) {
      facts.lighthouse = {
        score: Math.round(lh.categories.performance.score * 100),
        lcp: lh.audits?.['largest-contentful-paint']?.displayValue ?? null,
        cls: lh.audits?.['cumulative-layout-shift']?.displayValue ?? null,
        tbt: lh.audits?.['total-blocking-time']?.displayValue ?? null,
        fetchTime: lh.fetchTime,
        version: lh.lighthouseVersion,
        method: 'Lighthouse mobile przez PageSpeed Insights API',
      };
    }
    const le = d.loadingExperience;
    if (le?.metrics && !le.origin_fallback) {
      facts.crux = {
        overall: le.overall_category,
        metrics: Object.fromEntries(
          Object.entries(le.metrics).map(([k, v]) => [k, { p75: v.percentile, cat: v.category }]),
        ),
        method: 'CrUX — realni użytkownicy Chrome, okno 28 dni',
      };
    } else {
      facts.notes.push(
        'CrUX: brak danych polowych dla tego URL-a (za mały ruch) — pokazujemy tylko Lighthouse z datą',
      );
    }
  } catch (e) {
    facts.notes.push(`PSI: błąd pobrania — ${e.message}`);
  }
} else {
  facts.notes.push('PSI pominięte: brak PSI_API_KEY (darmowy klucz: Google Cloud Console)');
}

writeFileSync('data/content/web-facts.json', JSON.stringify(facts, null, 2) + '\n');
console.log(JSON.stringify(facts, null, 2));
