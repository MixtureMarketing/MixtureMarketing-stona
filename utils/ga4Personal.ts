// MIX-1457: jeden detektor e-maila i numeru telefonu dla wartosci GA4 (parametry zdarzen,
// tokeny identyfikatorow, page_location / page_referrer / page_title). Fail-closed: wartosc,
// ktorej nie da sie bezpiecznie przejrzec (bledne kodowanie %, zbyt dlugi tekst), tez jest
// odmowa ('unreadable').
//
// Normalizacja (zawsze w tej kolejnosci): NFKC, usuniecie znakow formatu (\p{Cf}: ZWSP, ZWJ,
// BOM...), dekodowanie %XX (do 3 razy), dekodowanie encji HTML &#NN; / &#xHH;, znowu NFKC i \p{Cf},
// male litery.
//
// Telefon: kazdy znak \p{N} (cyfra dowolnego pisma, cyfry w kolkach, indeksy...) liczy sie jako
// cyfra; kazdy znak spoza [a-z0-9] jest separatorem, takze kilka pod rzad (600--100--200,
// 600 _ 100). Grupy cyfr rozdzielone samymi separatorami, razem co najmniej 9 cyfr = telefon
// (numer krajowy ma 9 cyfr). Litera [a-z] przerywa grupe.
//
// E-mail: `@` (takze pelnej szerokosci po NFKC), `(at)` / `[at]` / `{at}` / `<at>` / `(malpa)`
// oraz slowo `at` / `malpa` miedzy separatorami, po ktorym idzie domena (`x.pl`, `x dot pl`,
// `x kropka pl`).

/** Powod odmowy dla wartosci: dane osobowe albo wartosc nieczytelna. */
export type Finding = 'personal' | 'unreadable' | null;

/** Najdluzszy tekst, ktory przegladamy; dluzszy = odmowa. */
export const MAX_TEXT = 2048;
/** Tyle cyfr w jednej grupie (cyfry + separatory) to juz numer telefonu. */
export const PHONE_DIGITS = 9;
const MAX_DECODE_ROUNDS = 3;
const FORMAT_CHARS = /\p{Cf}/gu;
const PERCENT_ESCAPE = /%[0-9a-f]{2}/i;
const HTML_NUM_ENTITY = /&#(?:x([0-9a-f]{1,6})|([0-9]{1,7}));?/gi;
/** Kazdy znak liczbowy dowolnego pisma (Nd, Nl, No). */
const ANY_DIGIT = /\p{N}/gu;
/** Separator: dowolny znak spoza [a-z0-9]; kilka pod rzad liczy sie jak jeden. */
const SEPARATOR_RUN = /[^a-z0-9]+/g;
/** Grupy cyfr rozdzielone pojedynczym separatorem (po sprowadzeniu separatorow do spacji). */
const DIGIT_GROUPS = /[0-9]+(?: [0-9]+)*/g;
const AT_SIGN = /@/;
const AT_BRACKETED = /[([{<«‹]\s*(?:at|ma[lł]pa)\s*[)\]}>»›]/u;
/** Etykieta domeny: litery/cyfry, mysliniki tylko w srodku (bez niejednoznacznosci przy cofaniu). */
const AT_WORD =
  /(?:^|[^a-z0-9])(?:at|ma[lł]pa)[^a-z0-9]+[a-z0-9]+(?:-[a-z0-9]+)*(?:\s*\.\s*|[^a-z0-9]+(?:dot|kropka)[^a-z0-9]+)[a-z]{2,}/u;

const clean = (s: string): string => s.normalize('NFKC').replace(FORMAT_CHARS, '');

/** Dekoduje %XX (takze wielokrotnie zakodowane); null = bledne kodowanie albo za gleboko. */
const decodePercent = (s: string): string | null => {
  let cur = s;
  for (let i = 0; i < MAX_DECODE_ROUNDS && cur.includes('%'); i++) {
    let next: string;
    try {
      next = decodeURIComponent(cur);
    } catch {
      return null;
    }
    if (next === cur) return cur;
    cur = next;
  }
  return PERCENT_ESCAPE.test(cur) ? null : cur;
};

const decodeEntities = (s: string): string =>
  s.replace(HTML_NUM_ENTITY, (m, hex: string | undefined, dec: string | undefined) => {
    const cp = hex !== undefined ? parseInt(hex, 16) : parseInt(dec ?? '', 10);
    return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
  });

/** Tekst po normalizacji; null = nieczytelny (za dlugi albo bledne kodowanie %). */
export const normalizeText = (raw: string): string | null => {
  if (raw.length > MAX_TEXT) return null;
  const decoded = decodePercent(clean(raw));
  if (decoded === null) return null;
  return clean(decodeEntities(decoded)).toLowerCase();
};

/** Czy w znormalizowanym tekscie jest numer telefonu (9+ cyfr w grupach). */
export const hasPhone = (normalized: string): boolean => {
  const view = normalized.replace(ANY_DIGIT, '0').replace(SEPARATOR_RUN, ' ');
  for (const m of view.matchAll(DIGIT_GROUPS)) {
    if (m[0].replace(/ /g, '').length >= PHONE_DIGITS) return true;
  }
  return false;
};

/** Czy w znormalizowanym tekscie jest adres e-mail (takze zapis zastepczy). */
export const hasEmail = (normalized: string): boolean =>
  AT_SIGN.test(normalized) || AT_BRACKETED.test(normalized) || AT_WORD.test(normalized);

/** Jedyny detektor: 'personal' (e-mail / telefon), 'unreadable' albo null (czysto). */
export const scanText = (raw: string): Finding => {
  const s = normalizeText(raw);
  if (s === null) return 'unreadable';
  return hasEmail(s) || hasPhone(s) ? 'personal' : null;
};

/** true = tekst wyglada na e-mail / telefon albo nie da sie go bezpiecznie przejrzec. */
export const looksPersonal = (raw: string): boolean => scanText(raw) !== null;
