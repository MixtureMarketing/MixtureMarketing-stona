// MIX-1457: rejestr (allowlista) wszystkich zdarzen GA4 strony: nazwa -> (parametr -> rodzaj).
// Jedyny uzytkownik: sanitizeGa4Event w utils/ga4Events.ts (zasady fail-closed opisane tam).

export type ParamSpec =
  | { kind: 'int'; min: number; max: number }
  | { kind: 'bool' }
  | { kind: 'enum'; values: readonly string[] }
  /** Tekst: pasuje w calosci do `re` (allowlista znakow) ORAZ przechodzi detektor e-maila/telefonu. */
  | { kind: 'text'; re: RegExp }
  /**
   * Identyfikator o sztywnym formacie (UUID, id web-vitals): tylko pelne dopasowanie `re`.
   * Detektor telefonu nie dziala na nim, bo format sam ma dlugie ciagi cyfr (czas, hex).
   */
  | { kind: 'fixed'; re: RegExp };

/** Najwieksza liczba dopuszczona w parametrach liczbowych: 6 cyfr, wiec numer telefonu
 *  (9 cyfr) nie przejdzie jako liczba. */
export const MAX_NUM = 999_999;

const int = (min: number, max: number): ParamSpec => ({ kind: 'int', min, max });
const oneOf = (values: readonly string[]): ParamSpec => ({ kind: 'enum', values });
const bool: ParamSpec = { kind: 'bool' };

/** Sciezka strony (window.location.pathname): bez zapytania, bez spacji i bez `@`. */
const PATH: ParamSpec = { kind: 'text', re: /^\/[A-Za-z0-9/_.~%-]{0,200}$/ };
/**
 * Wartosci utm_* i `package`: tylko ASCII [A-Za-z0-9_.-] (bez spacji, polskich liter, `@`, `+`).
 * Inna wartosc = "(odrzucone)". Liczbowe id kampanii (np. Google Ads 10-11 cyfr) odpadaja przez
 * detektor telefonu: dlugosc 9-15 cyfr pokrywa sie z numerami (PL 9 cyfr, E.164 do 15), wiec
 * z samej wartosci nie da sie ich odroznic. Zdarzenie idzie dalej, odpada tylko parametr.
 */
const TOKEN: ParamSpec = { kind: 'text', re: /^[A-Za-z0-9_.-]{1,100}$/ };
/** Kod bledu: same wielkie litery, cyfry i podkreslenie. */
const CODE: ParamSpec = { kind: 'text', re: /^[A-Z][A-Z0-9_]{0,40}$/ };

/** UUID (crypto.randomUUID): lead (functions/api/contact-submit.ts) i klient Hub. */
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Id metryki web-vitals 6.2.3 (src/lib/generateUniqueID.ts:23):
 * `v6-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}` = 13 cyfr, `-`, 13 cyfr.
 */
export const VITALS_ID_RE = /^v\d{1,2}-\d{13}-\d{13}$/;
/** Id sesji Stripe Checkout ({CHECKOUT_SESSION_ID} w success_path): `cs_test_` / `cs_live_`. */
export const STRIPE_SESSION_RE = /^cs_(?:test|live)_[A-Za-z0-9]{1,250}$/;

/**
 * client_id z Hub (PreonboardModal.tsx: odpowiedz `/preonboard`, pole typu `string` bez
 * walidacji, format poza repo): przyjmujemy tylko UUID. Kazdy inny zapis = "(odrzucone)".
 */
const CLIENT_ID: ParamSpec = { kind: 'fixed', re: UUID_RE };

export const CALCULATOR_STEP_GROUPS = [
  'projekt',
  'platforma',
  'uzytkownicy',
  'integracje',
  'marketing',
  'realizacja',
  'contact',
  'other',
] as const;

const CALC_SOURCES = ['wycena'] as const;
const CONTACT_TYPES = ['general', 'web', 'marketing', 'design', 'audit', 'consultation'] as const;
const TIERS = ['starter', 'standard', 'premium', 'professional'] as const;
/** P4: miejsce linku tel: / mailto: na stronie. */
export const LINK_LOCATIONS = ['header', 'footer', 'section'] as const;
export type LinkLocation = (typeof LINK_LOCATIONS)[number];

/** Zdarzenia kalkulatora /wycena/ (MIX-1384); czesc GA4_EVENTS. */
export const CALCULATOR_EVENTS = {
  calculator_step: {
    step_number: { kind: 'int', min: 1, max: 30 },
    step_count: { kind: 'int', min: 1, max: 30 },
    step_group: { kind: 'enum', values: CALCULATOR_STEP_GROUPS },
    direction: { kind: 'enum', values: ['next', 'back', 'error'] },
  },
  calculator_preview: {
    source: { kind: 'enum', values: CALC_SOURCES },
    answered_count: { kind: 'int', min: 0, max: 60 },
  },
  calculator_share: {
    source: { kind: 'enum', values: CALC_SOURCES },
    method: { kind: 'enum', values: ['copy', 'native'] },
  },
  calculator_booking_open: {
    source: { kind: 'enum', values: CALC_SOURCES },
    variant: { kind: 'enum', values: ['a', 'b'] },
  },
} as const satisfies Record<string, Record<string, ParamSpec>>;

const VITALS = ['lcp', 'inp', 'cls', 'fcp', 'ttfb'] as const;
const WEB_VITAL: Record<string, ParamSpec> = {
  metric_name: oneOf(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']),
  metric_value: int(-MAX_NUM, MAX_NUM),
  metric_delta: int(-MAX_NUM, MAX_NUM),
  metric_id: { kind: 'fixed', re: VITALS_ID_RE },
  page_path: PATH,
};

/** Wszystkie zdarzenia GA4 strony: nazwa -> (parametr -> rodzaj). */
export const GA4_EVENTS: Readonly<Record<string, Readonly<Record<string, ParamSpec>>>> =
  Object.freeze({
    ...CALCULATOR_EVENTS,
    calculator_submit: { source: PATH },
    audit_request: { source: PATH, score: int(0, 100) },
    // P4: tylko link_location; `department` pomijamy, bo strona nie ma dzialow.
    click_phone: { link_location: oneOf(LINK_LOCATIONS) },
    click_email: { link_location: oneOf(LINK_LOCATIONS) },
    consultation_click: { contact_type: oneOf(CONTACT_TYPES), source: PATH, package: TOKEN },
    form_submit: { contact_type: oneOf(CONTACT_TYPES), step: int(1, 10), has_existing_lead: bool },
    lead_start: { service: oneOf(CONTACT_TYPES), source: oneOf(['contact_form_step_1']) },
    contact_form_success: { lead_id: { kind: 'fixed', re: UUID_RE } },
    view_pricing: { source: PATH },
    open_modal: { tier: oneOf(TIERS), price_pln: int(0, MAX_NUM), source: oneOf(['deep_link']) },
    click_tier_button: {
      tier: oneOf(TIERS),
      price_pln: int(0, MAX_NUM),
      source: oneOf(['pricing_card', 'hero_cta', 'retry_after_cancel', 'professional_landing']),
    },
    purchase_canceled: { recovery_offered: bool },
    submit_preonboard_attempt: { tier: oneOf(TIERS) },
    preonboard_error: {
      tier: oneOf(TIERS),
      error_code: CODE,
      field: oneOf(['businessName', 'email', 'phone', 'nip', 'consent']),
      http_status: int(100, 599),
    },
    stripe_redirect: { tier: oneOf(TIERS), client_id: CLIENT_ID, price_pln: int(0, MAX_NUM) },
    purchase: {
      transaction_id: { kind: 'text', re: STRIPE_SESSION_RE },
      currency: oneOf(['PLN']),
      utm_source: TOKEN,
      utm_medium: TOKEN,
      utm_campaign: TOKEN,
    },
    // web_vital_lcp, _inp, _cls, _fcp, _ttfb (utils/webVitals.ts)
    ...Object.fromEntries(VITALS.map((n) => [`web_vital_${n}`, WEB_VITAL])),
    // Sygnal dla dataLayer po zmianie zgody (analytics.ts applyConsent), bez parametrow.
    cookie_consent_update: {},
  });
