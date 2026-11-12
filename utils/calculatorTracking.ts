// MIX-1384 (Z3 z MIX-1377): zdarzenia GA4 kalkulatora /wycena/ (poza calculator_submit z MIX-1300,
// ktore wysyla hooks/usePublicCalculator).
//
// Mechanizm zgody jest ten sam co dla calculator_submit: wszystko idzie przez `trackEvent`
// (Cloudflare Zaraz -> GA4). Zaraz wysyla zdarzenie dopiero po zgodzie na cel „analityka”
// (CookieBanner -> applyConsent -> zaraz.consent.set). Tu nie ma drugiej drogi (gtag, dataLayer).
// Nazwy: slownik firmy (wzorzec 02-zgody-i-zdarzenia) obejmuje 10 nazw P4; calculator_* to
// zdarzenia projektu Mixture (wpis do karty projektu, prosba o dopisanie do slownika: MIX-1384).
//
// Dane osobowe (MIX-1457): allowlista jest jedna dla calej strony, utils/ga4Events.ts (GA4_EVENTS);
// trackEvent sam ja stosuje (sendGa4). Nieznany parametr odpada, wartosc spoza allowlisty albo
// wygladajaca na e-mail / telefon idzie jako "(odrzucone)", nieznane zdarzenie nie jest wysylane.
//
// Miejsca wywolan, ktore jeszcze nie istnieja w UI (funkcja i test sa gotowe):
//   calculator_preview        -> Z5 (pasek widelek na zywo, po odpowiedzi public-preview z Z4)
//   calculator_share          -> Z7 (kopiuj / udostepnij link ?k=)
//   calculator_booking_open   -> Z9 (klik „Wyslij i umow rozmowe”, przed pokazaniem ramki)
import { trackEvent } from './analytics';
import { CALCULATOR_EVENTS, CALCULATOR_STEP_GROUPS } from './ga4Events';

export { CALCULATOR_EVENTS, CALCULATOR_STEP_GROUPS };

export type CalculatorEventName = keyof typeof CALCULATOR_EVENTS;

const send = (event: CalculatorEventName, params: Record<string, unknown>): void =>
  trackEvent(event, params);

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
