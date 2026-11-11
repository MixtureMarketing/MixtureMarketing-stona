// Składanie sitemap.xml + walidacja lastmod (MIX-781, M11). Czyste funkcje — testy:
// tests/seo/sitemapLastmod.test.ts. Używa ich scripts/generate-sitemap.js.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Data w formacie YYYY-MM-DD (W3C Date subset wymagany przez <lastmod>). Brak/niepoprawna
 * data = null, NIGDY „dzisiaj”: data builda to fałszywy sygnał świeżości.
 */
export function formatLastmod(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

/**
 * Walidacja wpisów mapy: każdy ma mieć <lastmod> w formacie YYYY-MM-DD, nie z przyszłości.
 * @param {{ url: string, lastmod?: string | null }[]} entries
 * @param {Date} [now]
 * @returns {string[]} lista problemów (pusta = OK)
 */
export function lastmodProblems(entries, now = new Date()) {
  const today = now.toISOString().split('T')[0];
  const problems = [];
  for (const e of entries) {
    if (!e.lastmod) problems.push(`${e.url}: brak lastmod`);
    else if (!DATE_RE.test(e.lastmod)) problems.push(`${e.url}: zły format lastmod "${e.lastmod}"`);
    else if (e.lastmod > today) problems.push(`${e.url}: lastmod z przyszłości (${e.lastmod})`);
  }
  return problems;
}

/** Wyjątek (fail-loud) zamiast sitemapy z lukami. */
export function assertLastmod(entries, now = new Date()) {
  const problems = lastmodProblems(entries, now);
  if (problems.length > 0) {
    throw new Error(
      `sitemap: ${problems.length} adresów bez poprawnego lastmod:\n  ${problems.join('\n  ')}`,
    );
  }
}

// XML escape dla URL i title (Sanity moze zwracac apostrofy, &, itp.).
export const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Z rozszerzenia obrazkowego zostaje tylko <image:loc>: Google wycofał <image:caption>,
 * <image:title> i <image:geo_location> (audyt, P10), więc nawet gdy wpis je niesie, nie trafią do XML.
 * @param {{ url: string, lastmod?: string | null, image?: { loc?: string } | null }[]} entries
 */
export function buildSitemapXml(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map((entry) => {
    let inner = `    <loc>${xmlEscape(entry.url)}</loc>`;
    if (entry.lastmod) inner += `\n    <lastmod>${entry.lastmod}</lastmod>`;
    if (entry.image && entry.image.loc) {
      inner += `\n    <image:image>\n      <image:loc>${xmlEscape(entry.image.loc)}</image:loc>`;
      inner += `\n    </image:image>`;
    }
    return `  <url>\n${inner}\n  </url>`;
  })
  .join('\n')}
</urlset>
`;
}

/** Adresy z mapy (<loc>) i ich <lastmod> (null, gdy brak) z gotowego XML-a. */
export function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    url: m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '',
    lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
  }));
}

/** Wycofane przez Google pola rozszerzenia obrazkowego (audyt, P10). */
export const RETIRED_IMAGE_FIELDS = Object.freeze([
  'image:caption',
  'image:title',
  'image:geo_location',
]);

/** Liczba wystąpień wycofanych pól w XML-u mapy (0 = czysto). */
export function retiredImageFieldCount(xml) {
  return RETIRED_IMAGE_FIELDS.reduce(
    (n, tag) => n + (xml.match(new RegExp(`<${tag}>`, 'g')) || []).length,
    0,
  );
}

/** Liczby do raportu: adresy, adresy z lastmod, wycofane pola, pola image:loc. */
export function sitemapStats(xml) {
  const urls = parseSitemap(xml);
  return {
    urls: urls.length,
    withLastmod: urls.filter((u) => u.lastmod).length,
    retiredImageFields: retiredImageFieldCount(xml),
    imageLocs: (xml.match(/<image:loc>/g) || []).length,
  };
}
