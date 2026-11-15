// MIX-1759: cofnięcie, przy którym przeglądarka sama pokazała już przejście wstecz (Chrome Android: gest od
// lewej krawędzi; popstate z `hasUAVisualTransition === true`). Bez naszego przejścia (planBack: `restore`),
// a lista jest rysowana cała na czas przywrócenia pozycji: przy content-visibility:auto świeżo zamontowana
// lista ma zastępczą wysokość i przywrócenie lądowało na stopce (sonda m1759b: 4/10 przy 375).
import { RESTORE_MAX_MS, holdRecording, manualRestorationFor } from './caseStudyBack';
import { VT_ATTR } from './viewTransitions';

/** Wartość `html[data-vt]` na czas przywrócenia (components/common/caseStudyTransitions.css: `html[data-vt] .vt-lista`). */
export const VT_UA_VALUE = 'realizacja-po-przegladarce';
/** Jak długo lista jest rysowana cała: najdłuższe czekanie przywrócenia (startRestore) z zapasem. */
export const UA_HOLD_MS = RESTORE_MAX_MS + 500;

/** Przeglądarka pokazała już własne przejście: tylko jawne `true` (brak pola, inna wartość = nie). */
export function browserPlayedBack(e: Event): boolean {
  return (e as PopStateEvent).hasUAVisualTransition === true;
}

/**
 * Lista rysowana cała przez `ms`. Atrybut zajęty (nasze przejście w toku) = nic; zdejmujemy tylko własną
 * wartość (przejście, które w międzyczasie ustawiło swoją, zdejmuje ją samo).
 */
export function holdListRendered(win: Window, doc: Document, ms: number = UA_HOLD_MS): void {
  const root = doc.documentElement;
  if (root.hasAttribute(VT_ATTR)) return;
  root.setAttribute(VT_ATTR, VT_UA_VALUE);
  win.setTimeout(() => {
    if (root.getAttribute(VT_ATTR) === VT_UA_VALUE) root.removeAttribute(VT_ATTR);
  }, ms);
}

/** Przygotowanie przywrócenia pozycji listy (każdy plan poza `none`); `ua` = po przejściu przeglądarki. */
export function prepareBackRestore(win: Window, doc: Document, ua: boolean): void {
  // zdarzenia przewinięcia od samej przeglądarki nie mogą nadpisać zapisanej pozycji
  holdRecording();
  manualRestorationFor(win);
  if (ua) holdListRendered(win, doc);
}
