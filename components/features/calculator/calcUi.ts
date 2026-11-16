// MIX-1867: nowy wygląd kalkulatora /wycena/ za przełącznikiem `VITE_MM_CALC_NEW_UI` (Preview 1,
// produkcja pusta, ten sam parser co pasek ceny: tylko `1` włącza, MIX-1846). Wyłączony = stary
// wygląd bez zmian. Tu WYŁĄCZNIE wygląd (klasy) i teksty stanów; logika liczenia i kontrakty API
// zostają w hookach i formLogic.
import { isLivePriceBarEnabled } from './livePrice';

/** Włączony tylko dla `1`; brak, puste, `true` i cokolwiek innego = stary wygląd. */
export function isCalcNewUiEnabled(raw: unknown = import.meta.env.VITE_MM_CALC_NEW_UI): boolean {
  return isLivePriceBarEnabled(raw);
}

/** Komunikat, gdy Turnstile nie oddał tokenu (zabezpieczenie nie wystartowało). */
export const CAPTCHA_START_ERROR = 'Nie udało się uruchomić zabezpieczenia, odśwież stronę.';

/** Zestaw klas jednego wyglądu. Stary = dokładnie klasy sprzed MIX-1867. */
export interface CalcUi {
  newUi: boolean;
  optionBtn: string;
  optionOn: string;
  optionOff: string;
  input: string;
  label: string;
  help: string;
  error: string;
  btnPrimary: string;
  btnBack: string;
  btnSecondary: string;
  alert: string;
}

// min-h-11 = 44 px: cel dotyku WCAG 2.5.5 / próg firmy (MIX-1412; samo py-2.5 + text-sm = 42 px).
const OLD: CalcUi = {
  newUi: false,
  optionBtn:
    'min-h-11 px-4 py-2.5 rounded-xl border text-sm font-medium transition text-left focus:outline-none focus:ring-2 focus:ring-primary/60',
  optionOn: 'border-primary bg-primary/15 text-white',
  optionOff: 'border-white/15 bg-white/[0.03] text-gray-200 hover:border-white/30',
  input:
    'w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/60',
  label: 'block text-base font-semibold text-white',
  help: 'text-sm text-gray-400',
  error: 'text-sm text-red-400',
  btnPrimary:
    'px-6 py-2.5 rounded-xl bg-primary text-dark font-semibold hover:brightness-110 disabled:opacity-60 transition',
  btnBack:
    'px-5 py-2.5 rounded-xl border border-white/15 text-gray-300 disabled:opacity-40 hover:border-white/30 transition',
  btnSecondary:
    'px-6 py-3 rounded-xl border border-white/20 text-gray-200 hover:border-white/40 transition',
  alert: 'rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300',
};

// Nowy wygląd wg DESIGN.md: przyciski akcji = pigułka indygo (gradient tła, biały tekst, waga 800),
// wyjście = goły tekst; pola i opcje ≥ 48 px (min-h-12), tekst 1rem (bez powiększania na iOS);
// tekst na granacie ≥ text-white/75 (AA-on-Navy); fokus = globalny :focus-visible z index.css.
const NEW: CalcUi = {
  newUi: true,
  optionBtn:
    'group flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-base transition-colors duration-200',
  optionOn: 'border-primary bg-primary/15 text-white',
  optionOff: 'border-white/15 bg-white/[0.04] text-white/90 hover:border-white/40',
  input:
    'min-h-12 w-full rounded-2xl border border-white/20 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/55 transition-colors hover:border-white/40 aria-[invalid=true]:border-red-400',
  label: 'block text-lg font-extrabold leading-snug text-white',
  help: 'text-sm leading-relaxed text-white/75',
  error: 'text-sm font-medium text-red-300',
  btnPrimary:
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary to-[#5A58AD] px-8 py-3 text-base font-extrabold text-white shadow-lg transition-all duration-300 motion-safe:hover:-translate-y-0.5 hover:shadow-[0_8px_25px_-5px_rgba(97,182,222,0.6)] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0',
  btnBack:
    'inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-base text-white/75 transition-colors hover:text-white hover:underline disabled:invisible',
  btnSecondary:
    'inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-8 py-3 text-base text-white/90 transition-colors hover:border-white/60 hover:text-white',
  alert: 'rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200',
};

export const calcUi = (newUi: boolean): CalcUi => (newUi ? NEW : OLD);

/**
 * Nowy wygląd: szare teksty podglądu konfiguracji, linku i paska ceny (gray-300/400/500 są w
 * index.css przyciemnione pod jasne tło) dostają na granacie kontrast AA (text-white/75 i jaśniej).
 * Klasa na kontenerze kalkulatora, więc działa tylko przy włączonym przełączniku.
 */
export const NEW_UI_CONTRAST =
  '[&_.text-gray-400]:text-white/75 [&_.text-gray-500]:text-white/75 [&_.text-gray-300]:text-white/90';

/**
 * MIX-1894 (uwaga Jakuba „za dużo zagłębień bloczków”): karta kroku nowego wyglądu to JEDYNA ramka
 * wokół odpowiedzi; pytania, e-mail i wynik nie mają już własnych ramek ani tła.
 * Telefon (< 640 px): karta bez ramki i zaokrągleń, tło na całą szerokość ekranu (-mx-4 znosi
 * px-4 Containera), odstęp wewnętrzny 16 px, więc opcje mają 390 − 2·16 = 358 px (91,8 %).
 * Tło zostaje pełne (#0d1529), żeby kontrast tekstu był liczalny (axe bez „incomplete”).
 * Pasek ceny ma -mx-6 pod p-6 karty; na telefonie dostaje -mx-4 pod nowy odstęp.
 * Ta sama klasa w prerenderze (WycenaCalculator): szkielet i kalkulator mają tę samą szerokość (CLS).
 */
export const NEW_UI_SHELL =
  '-mx-4 bg-[#0d1529] p-4 sm:mx-0 sm:rounded-3xl sm:border sm:border-white/10 sm:p-6 sm:shadow-sm md:p-10 max-sm:[&_[data-testid=live-price-bar]]:-mx-4';
