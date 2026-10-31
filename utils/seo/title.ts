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

/**
 * Grupa docelowa branży do tytułu/schemy („dla …”).
 *
 * Pole Sanity `industry.forWho` bywa krótką frazą („dla Psychologów i Terapeutów”)
 * albo opisową listą zakończoną kropką („Kliniki estetyczne, stomatolodzy, …”).
 * Lista w <title> dawała „… dla Kliniki estetyczne, stomatolodzy, …. | Mixture
 * Marketing” — wtedy używamy nazwy branży: „dla branży Medycyna i Stomatologia”.
 */
export const industryAudience = (forWho: string | undefined, name: string): string => {
  const f = (forWho || '').trim();
  if (/^dla\s/i.test(f) && !/[,.]/.test(f.replace(/\.$/, ''))) return withDla(f.replace(/\.$/, ''));
  const n = (name || '').trim();
  return n ? `dla branży ${n}` : withDla(f);
};

/**
 * Maksymalna długość <title> (znaki). Powyżej Google ucina tytuł w wynikach
 * (MIX-489 S6/M11: 57 z 82 stron miało 61–101 znaków).
 */
export const TITLE_MAX = 60;

// Separatory segmentów tytułu, od „najgrubszych”: koniec zdania, myślnik/pionowa kreska/kropka
// środkowa jako rozdzielacz, na końcu dwukropek.
const SEGMENT_BREAK = /(?:[.?!]\s+)|(?:\s+[–—|•-]\s+)|(?::\s+)/g;
const MIN_SEGMENT = 12;

/**
 * Najdłuższy PREFIX tytułu zakończony na granicy segmentu (koniec zdania, myślnik,
 * dwukropek), który mieści się w `limit`. Zwraca sam tytuł, gdy już się mieści;
 * `null`, gdy żaden prefiks (domyślnie >= 12 znaków, `minLen`) się nie mieści. Znak końca zdania
 * zostaje w wyniku, separator myślnikowy/dwukropek — nie.
 */
export const cutAtSegment = (
  title: string,
  limit: number,
  minLen = MIN_SEGMENT,
): string | null => {
  const t = (title || '').trim();
  if (t.length <= limit) return t;
  let best: string | null = null;
  for (const m of t.matchAll(SEGMENT_BREAK)) {
    const sep = m[0];
    const at = m.index ?? 0;
    // „.”, „?”, „!” zostają w prefiksie; reszta separatorów odpada.
    const keep = /^[.?!]/.test(sep) ? at + 1 : at;
    const prefix = t.slice(0, keep).trim();
    if (prefix.length >= minLen && prefix.length <= limit) best = prefix;
  }
  return best;
};

const truncateAtWord = (t: string, limit: number): string => {
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit - 1);
  const sp = cut.lastIndexOf(' ');
  const base = sp > MIN_SEGMENT ? cut.slice(0, sp) : cut;
  return `${base.replace(/[\s,;:–—|•-]+$/, '')}…`;
};

/**
 * Składa <title> o długości <= `max`. Przyjmuje jeden tytuł albo listę wariantów od
 * najpełniejszego do najkrótszego. Kolejność prób:
 *  1. wariant z sufiksem marki (` | Mixture Marketing`), po kolei;
 *  2. wariant bez sufiksu marki, po kolei (fraza kluczowa ważniejsza od marki);
 *  3. pierwszy wariant ucięty na granicy segmentu (z marką, jeśli zostaje >= 25 znaków,
 *     inaczej bez marki);
 *  4. ucięcie na granicy słowa z „…” (ostateczność, np. tytuł z CMS bez separatorów).
 * Wynik zawsze mieści się w `max`.
 */
export const fitTitle = (title: string | string[], brand: string, max = TITLE_MAX): string => {
  const variants = (Array.isArray(title) ? title : [title])
    .map((t) => (t || '').trim())
    .filter(Boolean);
  const b = (brand || '').trim();
  if (variants.length === 0) return b.slice(0, max);

  for (const v of variants) {
    const full = withBrandSuffix(v, b);
    if (full.length <= max) return full;
  }
  for (const v of variants) if (v.length <= max) return v;

  const first = variants[0];
  const suffixLen = ` | ${b}`.length;
  const withBrand = b ? cutAtSegment(first, max - suffixLen) : null;
  if (withBrand && withBrand.length >= 25) return `${withBrand} | ${b}`;
  const bare = cutAtSegment(first, max);
  if (bare) return bare;
  return truncateAtWord(first, max);
};

/**
 * Tytuł studium przypadku: „<projekt> - Case Study Mixture Marketing”. Nazwy projektów
 * z Sanity bywają długie („Driftmark Marine – E-commerce z Konfiguratorem Łodzi i
 * Rebranding”). Kolejność prób (pierwsza ≤ `max`): pełna nazwa z końcówką, pełna nazwa
 * z samą marką, sama pełna nazwa (opis projektu ważniejszy od „Case Study”), człon przed
 * myślnikiem z końcówką („Driftmark Marine - Case Study Mixture Marketing”), na koniec
 * ucięcie na granicy słowa.
 */
export const caseStudyTitle = (projectTitle: string, brand: string, max = TITLE_MAX): string => {
  const p = (projectTitle || '').replace(/\s+/g, ' ').trim();
  const tail = ` - Case Study ${brand}`;
  const head = cutAtSegment(p, max - tail.length, 2);
  const variants = [
    `${p}${tail}`,
    `${p} | ${brand}`,
    p,
    head ? `${head}${tail}` : '',
  ].filter(Boolean);
  return variants.find((v) => v.length <= max) ?? truncateAtWord(p, max);
};
