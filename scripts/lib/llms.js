// Porównanie adresów z public/llms.txt z mapą strony (MIX-1273, plan SEO A32).
// Czyste funkcje; CLI: scripts/check-llms.mjs, test: tests/seo/llmsTxt.test.ts.

export const BASE_URL = 'https://mixturemarketing.pl';

/** Adresy spoza sitemapy, które llms.txt wolno wskazywać (allowlista, nie wyjątek „na oko”). */
export const MACHINE_ALLOW = ['/sitemap.xml'];

/**
 * Strony kluczowe, które muszą być w llms.txt: dodane do sitemapy po 489c6b1 (hub branż,
 * dwie branże, kalkulator wyceny) oraz strony, które asystenci AI mają polecać (o nas,
 * lokalne SEO i agencja interaktywna, abonament). Ukryta strona usługi AI (MIX-1272)
 * NIE jest kluczowa: jest noindex i poza sitemapą.
 */
export const KEY_PATHS = [
  '/wycena/',
  '/branza/',
  '/branza/saas-startups/',
  '/branza/uslugi-b2b/',
  '/o-nas/',
  '/abonament/',
  '/agencja-seo-rzeszow/',
  '/agencja-interaktywna-rzeszow/',
];

/** Adresy z linków markdown `[tekst](url)` w llms.txt (unikalne, kolejność pojawienia). */
export function llmsUrls(text) {
  const out = [];
  for (const m of String(text ?? '').matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

/** Adresy `<loc>` z sitemap.xml. */
export function sitemapUrls(xml) {
  return [...String(xml ?? '').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/**
 * @param {string} llmsText
 * @param {string} sitemapXml
 * @param {{ keyPaths?: string[], hiddenPaths?: string[], machineAllow?: string[] }} [opts]
 *  hiddenPaths = ścieżki noindex/za flagą (prerenderOnlyRoutes): nie wolno ich wymieniać.
 * Fail-closed: pusta sitemapa albo pusty llms.txt = błąd w `problems`.
 */
export function llmsReport(llmsText, sitemapXml, opts = {}) {
  const keyPaths = opts.keyPaths ?? KEY_PATHS;
  const hiddenPaths = opts.hiddenPaths ?? [];
  const machine = new Set((opts.machineAllow ?? MACHINE_ALLOW).map((p) => BASE_URL + p));
  const llms = llmsUrls(llmsText);
  const sitemap = new Set(sitemapUrls(sitemapXml));
  const problems = [];
  if (llms.length === 0) problems.push('llms.txt: brak adresów');
  if (sitemap.size === 0) problems.push('sitemap.xml: brak adresów');
  const notInSitemap = llms.filter((u) => !sitemap.has(u) && !machine.has(u));
  const llmsSet = new Set(llms);
  const missingKey = keyPaths.map((p) => BASE_URL + p).filter((u) => !llmsSet.has(u));
  const keyNotInSitemap = keyPaths.map((p) => BASE_URL + p).filter((u) => !sitemap.has(u));
  const hidden = new Set(hiddenPaths.map((p) => BASE_URL + p));
  const hiddenListed = llms.filter((u) => hidden.has(u));
  return {
    llmsCount: llms.length,
    sitemapCount: sitemap.size,
    notInSitemap,
    missingKey,
    keyNotInSitemap,
    hiddenListed,
    problems,
    ok:
      problems.length === 0 &&
      notInSitemap.length === 0 &&
      missingKey.length === 0 &&
      keyNotInSitemap.length === 0 &&
      hiddenListed.length === 0,
  };
}
