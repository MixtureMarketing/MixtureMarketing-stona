// MIX-1457: JEDNA allowlista wszystkich zdarzen GA4, ktore wysyla strona (Zaraz -> GA4).
//
// `sanitizeGa4Event` jest czysta funkcja; stosuje ja tylko `sendGa4` (utils/ga4Send.ts), tuz
// przed zaraz.track / dataLayer. Zasady (allowlista, fail-closed):
//   1. Nazwa zdarzenia spoza GA4_EVENTS -> zdarzenie NIE jest wysylane.
//   2. Czytamy tylko parametry z allowlisty zdarzenia (wlasne pola obiektu); inne klucze odpadaja
//      bez czytania wartosci. Wartosc undefined / null = parametru brak.
//   3. Parametr z allowlisty, ktorego wartosc nie pasuje do rodzaju (typ, zakres, lista, wzorzec),
//      wyglada na e-mail / telefon (utils/ga4Personal.ts) albo jest nieczytelna (kodowanie,
//      dlugosc, getter rzuca) -> wartosc "(odrzucone)". Zdarzenie idzie dalej, odpada tylko ten
//      parametr; powod (bez wartosci) wraca w `refused` do licznika odmow.
//   4. Ten sam detektor czysci page_location / page_referrer / page_title (`cleanPageContext`).
//
// Nazwy: slownik zdarzen firmy (P4) dla click_phone / click_email i zdarzen calculator_* /
// audit_request; pozostale to zdarzenia projektu sprzed slownika (lejek abonamentu, formularz
// kontaktowy, web-vitals), wpisane tu z dzisiejszymi parametrami.

import { GA4_EVENTS, type LinkLocation, type ParamSpec } from './ga4Allowlist';
import { scanText } from './ga4Personal';

export {
  CALCULATOR_EVENTS,
  CALCULATOR_STEP_GROUPS,
  GA4_EVENTS,
  LINK_LOCATIONS,
  type LinkLocation,
  type ParamSpec,
} from './ga4Allowlist';
export { looksPersonal, scanText } from './ga4Personal';

/** Wartosc wysylana zamiast odrzuconego parametru. */
export const REFUSED = '(odrzucone)';

export type Ga4Params = Record<string, string | number | boolean>;
/** Powod odmowy parametru (bez wartosci). */
export type RefusalWhy = 'personal' | 'unreadable' | 'format';
export type Refusal = { param: string; why: RefusalWhy };
export type Ga4Check =
  { ok: true; params: Ga4Params; refused: Refusal[] } | { ok: false; reason: string };

const hasOwn = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

/** Czy wartosc pasuje do rodzaju parametru (tekst: wzorzec ORAZ detektor bez trafienia). */
const fits = (s: ParamSpec, v: unknown): boolean => {
  switch (s.kind) {
    case 'int':
      return typeof v === 'number' && Number.isInteger(v) && v >= s.min && v <= s.max;
    case 'bool':
      return typeof v === 'boolean';
    case 'enum':
      return typeof v === 'string' && s.values.includes(v);
    case 'fixed':
      return typeof v === 'string' && s.re.test(v);
    case 'text':
      return typeof v === 'string' && s.re.test(v) && scanText(v) === null;
    default:
      return false;
  }
};

/** null = wartosc przyjeta; inaczej powod odmowy (tekst: najpierw detektor, potem format). */
export const checkValue = (s: ParamSpec, v: unknown): RefusalWhy | null => {
  if (fits(s, v)) return null;
  return typeof v === 'string' ? (scanText(v) ?? 'format') : 'format';
};

/**
 * Jedyna brama zdarzen GA4. Zwraca parametry z allowlisty (odrzucone jako "(odrzucone)") albo
 * odmowe calego zdarzenia, gdy nazwa jest nieznana (powod bez wartosci parametrow).
 */
export const sanitizeGa4Event = (event: unknown, params?: unknown): Ga4Check => {
  if (typeof event !== 'string' || !hasOwn(GA4_EVENTS, event)) {
    // Nazwe pokazujemy tylko, gdy jest technicznym snake_case (bez cyfr: nie powtarza telefonu).
    const shown = typeof event === 'string' && /^[a-z_]{1,40}$/.test(event) ? event : '?';
    return { ok: false, reason: `odmowa: nieznane zdarzenie "${shown}"` };
  }
  const out: Ga4Params = {};
  const refused: Refusal[] = [];
  if (params === undefined || params === null) return { ok: true, params: out, refused };
  if (typeof params !== 'object' || Array.isArray(params)) {
    return { ok: true, params: out, refused: [{ param: '(parametry)', why: 'format' }] };
  }
  const spec = GA4_EVENTS[event];
  for (const key of Object.keys(spec)) {
    let value: unknown;
    try {
      if (!hasOwn(params, key)) continue;
      value = (params as Record<string, unknown>)[key];
    } catch {
      out[key] = REFUSED;
      refused.push({ param: key, why: 'unreadable' });
      continue;
    }
    if (value === undefined || value === null) continue;
    const why = checkValue(spec[key], value);
    if (why) {
      out[key] = REFUSED;
      refused.push({ param: key, why });
    } else {
      out[key] = value as string | number | boolean;
    }
  }
  return { ok: true, params: out, refused };
};

/** P4 link_location: najblizszy przodek `header` / `footer`, w innym razie `section`. */
export const linkLocationOf = (el: Element): LinkLocation => {
  const box = el.closest('header, footer');
  if (!box) return 'section';
  return box.tagName.toLowerCase() === 'footer' ? 'footer' : 'header';
};

/** `href` linku; w SVG takze starszy `xlink:href`. */
const hrefOf = (anchor: Element): string | null =>
  anchor.getAttribute('href') ?? anchor.getAttributeNS('http://www.w3.org/1999/xlink', 'href');

/** Najblizszy przodek `<a>` / `<area>` z adresem (HTML `href` albo SVG `xlink:href`). */
export const contactLinkOf = (target: Element): Element | null => {
  let el = target.closest('a, area');
  while (el && hrefOf(el) === null) el = el.parentElement?.closest('a, area') ?? null;
  return el;
};

/** Schemat linku (`tel:`, `mailto:`) tak, jak go widzi przegladarka (WHATWG URL). */
export const linkScheme = (anchor: Element): string | null => {
  const href = hrefOf(anchor);
  if (href === null) return null;
  try {
    return new URL(href, document.baseURI).protocol;
  } catch {
    return null;
  }
};
