// MIX-1457: page_location / page_referrer / page_title przez ten sam detektor co parametry zdarzen
// (utils/ga4Personal.ts). GA4 bierze te pola sam z przegladarki, z pelnym zapytaniem (utm_*).

import { REFUSED, type Ga4Params, type Refusal, type RefusalWhy } from './ga4Events';
import { scanText } from './ga4Personal';

/** Tekst strony (np. tytul): detektor -> "(odrzucone)". */
const cleanText = (raw: string): { value: string; why: RefusalWhy | null } => {
  const found = scanText(raw);
  return found ? { value: REFUSED, why: found } : { value: raw, why: null };
};

const cleanQueryPart = (part: string): { value: string; why: RefusalWhy | null } => {
  if (part === '') return { value: part, why: null };
  // W zapytaniu `+` to spacja (application/x-www-form-urlencoded).
  const found = scanText(part.replace(/\+/g, ' '));
  return found ? { value: REFUSED, why: found } : { value: part, why: null };
};

/**
 * Adres strony (page_location / page_referrer): sciezka, kazdy klucz i kazda wartosc zapytania
 * oraz fragment przez ten sam detektor; trafienie -> "(odrzucone)" w tym miejscu.
 * Adres, ktorego nie da sie odczytac -> caly "(odrzucone)".
 */
export const cleanUrl = (raw: string): { value: string; why: RefusalWhy | null } => {
  if (raw === '') return { value: raw, why: null };
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { value: REFUSED, why: 'unreadable' };
  }
  let why: RefusalWhy | null = null;
  const note = (w: RefusalWhy | null) => {
    if (w && why !== 'personal') why = w;
  };
  const path = scanText(u.pathname);
  note(path);
  const pathname = path ? `/${REFUSED}` : u.pathname;
  const pairs = u.search
    .slice(1)
    .split('&')
    .filter((p) => p !== '')
    .map((pair) => {
      const eq = pair.indexOf('=');
      const k = cleanQueryPart(eq < 0 ? pair : pair.slice(0, eq));
      const v = cleanQueryPart(eq < 0 ? '' : pair.slice(eq + 1));
      note(k.why);
      note(v.why);
      return eq < 0 ? k.value : `${k.value}=${v.value}`;
    });
  const hash = u.hash.length > 1 ? scanText(u.hash.slice(1)) : null;
  note(hash);
  const search = pairs.length ? `?${pairs.join('&')}` : '';
  const fragment = hash || u.hash.length <= 1 ? '' : u.hash;
  return { value: `${u.origin}${pathname}${search}${fragment}`, why };
};

export type PageContext = { location: string; referrer: string; title: string };

/**
 * page_location / page_referrer / page_title: GA4 bierze je sam z przegladarki (z pelnym
 * zapytaniem, takze utm_*). Gdy detektor cos w nich znajdzie, zwracamy oczyszczona wartosc do
 * nadpisania w zdarzeniu; czyste pole nie jest dopisywane (GA4 i tak wysle te sama wartosc).
 */
export const cleanPageContext = (page: PageContext): { params: Ga4Params; refused: Refusal[] } => {
  const params: Ga4Params = {};
  const refused: Refusal[] = [];
  const fields: [string, { value: string; why: RefusalWhy | null }][] = [
    ['page_location', cleanUrl(page.location)],
    ['page_referrer', cleanUrl(page.referrer)],
    ['page_title', cleanText(page.title)],
  ];
  for (const [name, r] of fields) {
    if (r.why === null) continue;
    params[name] = r.value;
    refused.push({ param: name, why: r.why });
  }
  return { params, refused };
};
