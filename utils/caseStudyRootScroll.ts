// Przewinięcie korzenia przy nieprzyjętym (drugim) cofnięciu w trakcie przejścia wstecz (MIX-1719, MIX-1729);
// wydzielone z utils/caseStudyBackSkip.ts.
import { SCROLL_TOLERANCE_PX } from './caseStudyBackOptions';

/**
 * MIX-1719: cofnięcie naszego przewinięcia listy przy spóźnionym drugim cofnięciu (człowiek: 100–250 ms, po
 * potwierdzeniu okna MIX-1711): korzeń wraca na pozycję sprzed przewinięcia, jak przy drugim cofnięciu w oknie
 * (wtedy nic nie przewijamy). Allowlista: korzeń nadal stoi na naszej pozycji (±4 px; ruch użytkownika,
 * przeglądarki albo innego kodu = nic) i pozycja sprzed jest liczbą ≥ 0 różną od naszej.
 */
export function undoListScroll(win: Window, before: number, y: number): void {
  if (!(before >= 0)) return;
  if (Math.abs(win.scrollY - y) > SCROLL_TOLERANCE_PX) return;
  if (Math.abs(before - y) <= SCROLL_TOLERANCE_PX) return;
  win.scrollTo({ top: before, left: win.scrollX, behavior: 'instant' });
}

/** Zdarzenie `navigate` (Navigation API): tylko pola, które czytamy; każde może nie istnieć. */
interface NavigateLike {
  readonly navigationType?: unknown;
  readonly canIntercept?: unknown;
  readonly hashChange?: unknown;
  readonly defaultPrevented?: unknown;
  readonly intercept?: unknown;
}

const NOTHING = () => undefined;

/**
 * MIX-1729: dopóki trwa nasze przejście wstecz, przejście po historii (drugie cofnięcie) nie dostaje
 * przywrócenia pozycji przez przeglądarkę. Ślad MIX-1719 (m1719d, m1719c r3): przeglądarka przywraca "/"
 * dopiero po wznowieniu malowania (po pominiętym przejściu), czyli PO przewinięciu na górę przez ScrollToTop,
 * więc "/" staje w połowie animacji albo na starej pozycji; przy wyłączonym przełączniku ScrollToTop jest
 * ostatni i "/" kończy na górze. Bez przywrócenia przeglądarki pozycję ustawia tylko strona (undoListScroll,
 * ScrollToTop), jak przy wyłączonym. Allowlista: `traverse`, `canIntercept === true`, `hashChange === false`,
 * zdarzenie nieodrzucone, `intercept` jest funkcją; wszystko inne (brak Navigation API, inny typ, błąd)
 * = nic, przeglądarka działa jak dotąd. Zwraca zdjęcie nasłuchu (wielokrotne wywołanie = nic); nigdy nie rzuca.
 */
export function suppressTraverseRestore(win: Window | null): () => void {
  try {
    const nav = (win as unknown as { navigation?: EventTarget | null } | null)?.navigation;
    if (!nav || typeof nav.addEventListener !== 'function') return NOTHING;
    const onNavigate = (e: Event) => {
      try {
        const n = e as unknown as NavigateLike;
        if (n.navigationType !== 'traverse' || n.canIntercept !== true) return;
        if (n.hashChange !== false || n.defaultPrevented !== false) return;
        if (typeof n.intercept !== 'function') return;
        n.intercept.call(e, { scroll: 'manual', focusReset: 'manual' });
      } catch {
        /* przeglądarka odmawia: zostaje jej przywrócenie */
      }
    };
    nav.addEventListener('navigate', onNavigate);
    let on = true;
    return () => {
      if (!on) return;
      on = false;
      try {
        nav.removeEventListener('navigate', onNavigate);
      } catch {
        /* nic do zdjęcia */
      }
    };
  } catch {
    return NOTHING;
  }
}
