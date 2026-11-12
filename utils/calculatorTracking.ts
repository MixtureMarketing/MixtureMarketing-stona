// MIX-1384 (Z3 z MIX-1377): zdarzenia GA4 kalkulatora /wycena/ (poza calculator_submit z MIX-1300,
// ktore wysyla hooks/usePublicCalculator).
//
// Mechanizm zgody jest ten sam co dla calculator_submit: wszystko idzie przez `trackEvent`
// (Cloudflare Zaraz -> GA4). Zaraz wysyla zdarzenie dopiero po zgodzie na cel „analityka”
// (CookieBanner -> applyConsent -> zaraz.consent.set). Tu nie ma drugiej drogi (gtag, dataLayer).
// Nazwy: slownik firmy (wzorzec 02-zgody-i-zdarzenia) obejmuje 10 nazw P4; calculator_* to
// zdarzenia projektu Mixture (wpis do karty projektu, prosba o dopisanie do slownika: MIX-1384).
//
// Dane osobowe: kazde zdarzenie ma allowliste parametrow (nazwa -> typ). Nieznany parametr jest
// odrzucany, tekst z '@' albo z >= 7 cyfr pod rzad (e-mail, telefon) jest odrzucany, nieznane
// zdarzenie nie jest wysylane (fail-closed).
//
// Miejsca wywolan, ktore jeszcze nie istnieja w UI (funkcja i test sa gotowe):
//   calculator_preview        -> Z5 (pasek widelek na zywo, po odpowiedzi public-preview z Z4)
//   calculator_share          -> Z7 (kopiuj / udostepnij link ?k=)
//   calculator_booking_open   -> Z9 (klik „Wyslij i umow rozmowe”, przed pokazaniem ramki)
import { trackEvent } from './analytics';

type ParamSpec =
  { kind: 'int'; min: number; max: number } | { kind: 'enum'; values: readonly string[] };

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

const SOURCES = ['wycena'] as const;

export const CALCULATOR_EVENTS = {
  calculator_step: {
    step_number: { kind: 'int', min: 1, max: 30 },
    step_count: { kind: 'int', min: 1, max: 30 },
    step_group: { kind: 'enum', values: CALCULATOR_STEP_GROUPS },
    direction: { kind: 'enum', values: ['next', 'back', 'error'] },
  },
  calculator_preview: {
    source: { kind: 'enum', values: SOURCES },
    answered_count: { kind: 'int', min: 0, max: 60 },
  },
  calculator_share: {
    source: { kind: 'enum', values: SOURCES },
    method: { kind: 'enum', values: ['copy', 'native'] },
  },
  calculator_booking_open: {
    source: { kind: 'enum', values: SOURCES },
    variant: { kind: 'enum', values: ['a', 'b'] },
  },
} as const satisfies Record<string, Record<string, ParamSpec>>;

export type CalculatorEventName = keyof typeof CALCULATOR_EVENTS;

const PII = /@|\d{7,}|\d[\d\s().-]{8,}\d/;

/** Zwraca tylko dozwolone parametry o poprawnym typie; reszta znika (allowlista). */
export const sanitizeCalculatorParams = (
  event: string,
  params: Record<string, unknown> = {},
): Record<string, string | number> | null => {
  if (!Object.prototype.hasOwnProperty.call(CALCULATOR_EVENTS, event)) return null;
  const spec = CALCULATOR_EVENTS[event as CalculatorEventName] as Record<string, ParamSpec>;
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!Object.prototype.hasOwnProperty.call(spec, key)) continue;
    const s = spec[key];
    if (s.kind === 'int') {
      const inRange = Number.isInteger(value) && (value as number) >= s.min;
      if (typeof value === 'number' && inRange && value <= s.max) out[key] = value;
    } else if (typeof value === 'string' && !PII.test(value) && s.values.includes(value)) {
      out[key] = value;
    }
  }
  return out;
};

const send = (event: CalculatorEventName, params: Record<string, unknown>): void => {
  const clean = sanitizeCalculatorParams(event, params);
  if (clean) trackEvent(event, clean);
};

const knownGroup = (group: string): string =>
  (CALCULATOR_STEP_GROUPS as readonly string[]).includes(group) ? group : 'other';

/** Przejscie na inny krok formularza (nie wywolywac przy pierwszym renderze). */
export const trackCalculatorStep = (p: {
  stepNumber: number;
  stepCount: number;
  group: string;
  direction: 'next' | 'back' | 'error';
}): void =>
  send('calculator_step', {
    step_number: p.stepNumber,
    step_count: p.stepCount,
    step_group: knownGroup(p.group),
    direction: p.direction,
  });

/** Widelki na zywo pokazane po zmianie odpowiedzi (wywolanie: Z5). */
export const trackCalculatorPreview = (p: { answeredCount: number }): void =>
  send('calculator_preview', { source: 'wycena', answered_count: p.answeredCount });

/** Kopiuj / udostepnij link do konfiguracji (wywolanie: Z7). */
export const trackCalculatorShare = (p: { method: 'copy' | 'native' }): void =>
  send('calculator_share', { source: 'wycena', method: p.method });

/** Klik „Wyslij i umow rozmowe” (wywolanie: Z9). */
export const trackCalculatorBookingOpen = (p: { variant: 'a' | 'b' }): void =>
  send('calculator_booking_open', { source: 'wycena', variant: p.variant });
