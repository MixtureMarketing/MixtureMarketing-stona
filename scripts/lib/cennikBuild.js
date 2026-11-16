// MIX-1855: kroki budowy zalezne od przelacznika VITE_MM_CENNIK (strona /cennik/).
// Funkcje czyste (tekst -> tekst), bez dostepu do plikow: testy w tests/seo/cennikBuild.test.ts.
// Wolane przez scripts/apply-cennik-build.mjs po `vite build`, tylko gdy przelacznik == '1'.
// Wylaczony = dist bez zmian co do bajta (skrypt nawet nie czyta plikow).

export const CENNIK_BASE_URL = 'https://mixturemarketing.pl';

/** Reguly public/_redirects, ktore znikaja z dist, gdy /cennik/ jest prawdziwa strona. */
export const CENNIK_REDIRECT_FROMS = ['/cennik', '/cennik/'];

/** Linia llms.txt po wpisie „Oferty i cennik orientacyjny”: bez kwot (llms.txt ich nie powiela). */
export const CENNIK_LLMS_ANCHOR = `- [Oferty i cennik orientacyjny](${CENNIK_BASE_URL}/offers/)`;
export const CENNIK_LLMS_LINE = `- [Cennik usług](${CENNIK_BASE_URL}/cennik/): widełki cen stron WWW, kampanii, SEO i designu oraz odpowiedzi na pytania o koszty; kwoty tylko na stronie`;

/**
 * Zdejmuje z tekstu `_redirects` obie reguly `/cennik` i `/cennik/` (z dowolnym celem), reszta
 * pliku (komentarze, kolejnosc, catch-all) bez zmian. Fail-closed: brak dokladnie dwoch takich
 * regul = blad (plik zmieniony recznie albo skrypt uruchomiony drugi raz na tym samym pliku).
 */
export function stripCennikRedirects(text) {
  const lines = text.split('\n');
  const kept = lines.filter((line) => {
    const t = line.trim();
    if (t === '' || t.startsWith('#')) return true;
    return !CENNIK_REDIRECT_FROMS.includes(t.split(/\s+/)[0]);
  });
  const removed = lines.length - kept.length;
  if (removed !== CENNIK_REDIRECT_FROMS.length) {
    throw new Error(
      `_redirects: oczekiwano ${CENNIK_REDIRECT_FROMS.length} regul /cennik, zdjeto ${removed}`,
    );
  }
  return kept.join('\n');
}

/**
 * Dopisuje do llms.txt linie /cennik/ tuz po wpisie „Oferty i cennik orientacyjny”. Idempotentna
 * (linia juz jest = tekst bez zmian). Fail-closed: brak kotwicy = blad, nigdy cichy brak wpisu.
 */
export function addCennikToLlms(text) {
  const lines = text.split('\n');
  if (lines.includes(CENNIK_LLMS_LINE)) return text;
  const i = lines.indexOf(CENNIK_LLMS_ANCHOR);
  if (i < 0) {
    throw new Error('llms.txt: brak wpisu „Oferty i cennik orientacyjny” (kotwica /cennik/)');
  }
  lines.splice(i + 1, 0, CENNIK_LLMS_LINE);
  return lines.join('\n');
}
