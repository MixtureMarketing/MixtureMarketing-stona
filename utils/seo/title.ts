/**
 * Składanie tytułów stron (<title>, og:title, twitter:title).
 *
 * Czyste funkcje — bez importów Reacta, żeby trafiały do chunka Seo bez kosztu.
 */

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Dokleja markę jako sufiks ` | <brand>` — idempotentnie.
 *
 * Jeśli tytuł już KOŃCZY SIĘ nazwą marki (np. „Portfolio | Mixture Marketing”,
 * „Kalkulator … — Mixture Marketing”, „… Case Study Mixture Marketing”),
 * zostaje bez zmian. Wcześniej Seo.tsx dopisywał sufiks bezwarunkowo, co dawało
 * „… | Mixture Marketing | Mixture Marketing”.
 */
export const withBrandSuffix = (title: string, brand: string): string => {
  const t = (title || '').trim();
  const b = (brand || '').trim();
  if (!b) return t;
  if (!t) return b;
  if (new RegExp(`${escapeRegExp(b)}$`, 'i').test(t)) return t;
  return `${t} | ${b}`;
};

/**
 * Łączy dwie linie nagłówka hero (line1/line2) w jeden tytuł strony.
 *
 * Domyślny separator to „: ” (np. „Backend: bez Tajemnic”), ALE gdy line1:
 *  - kończy się interpunkcją (`:` `.` `,` `?` `!` `;`), albo
 *  - zawiera już dwukropek (np. „DevOps: Fundament”),
 * łączymy spacją — inaczej powstawały sklejone/zdublowane separatory
 * („Core Web Vitals 2025:: …”, „Język Chmury.: …”, „klienta,: nawet”,
 * „DevOps: Fundament: Nowoczesnego Biznesu”).
 * Kolejne części (np. `suffix`) są doklejane spacją.
 */
export const joinTitleLines = (line1: string, line2: string, ...rest: string[]): string => {
  const a = (line1 || '').trim();
  const b = (line2 || '').trim();
  let head: string;
  if (!a) head = b;
  else if (!b) head = a;
  else if (/[:.,?!;]$/.test(a) || a.includes(':')) head = `${a} ${b}`;
  else head = `${a}: ${b}`;

  return [head, ...rest.map((r) => (r || '').trim())].filter(Boolean).join(' ');
};

/**
 * „dla ${grupa}” bez „dla dla” / „dla Dla branży …”, gdy wartość z CMS
 * (np. Sanity `industry.forWho`) sama zaczyna się od przyimka „dla”.
 */
export const withDla = (audience: string): string => {
  const a = (audience || '').trim().replace(/^dla\s+/i, '');
  return a ? `dla ${a}` : '';
};
