// Płynne przejście karta realizacji → strona realizacji (MIX-1308, A1 + A2 z planu MIX-1310).
//
// Przełącznik działa jak `VITE_MM_*` w `components/pages/abonament/PreonboardModal.tsx:54`
// (zmienna wstrzykiwana przy budowie, Vite ją inline'uje): domyślnie WYŁĄCZONY, włącza go
// dopiero `VITE_MM_VIEW_TRANSITIONS=1` w środowisku budowy. Wyłączony = komponent
// `CaseStudyTransitions` się nie montuje, nic nie nasłuchuje i w DOM nie ma żadnej
// `view-transition-name` (zachowanie jak przed MIX-1308).
//
// Decyzja „przejście czy zwykła nawigacja” to allowlista (fail-closed): przejście rusza
// tylko, gdy KAŻDY warunek jest spełniony; nieznany, pusty albo błędny stan = zwykła
// nawigacja React Routera, bez preventDefault. Wstecz (popstate) nigdy nie startuje
// przejścia (plan P2 opcja 1).

/** Włączony tylko dla wartości `1` albo `true`; brak, puste i cokolwiek innego = wyłączony. */
export function isViewTransitionsEnabled(
  raw: unknown = import.meta.env.VITE_MM_VIEW_TRANSITIONS,
): boolean {
  return raw === '1' || raw === 'true';
}

/** Nazwy przejścia. Każda jest w DOM najwyżej raz i tylko na czas przejścia. */
export const VT_NAMES = {
  image: 'realizacja-zdjecie',
  title: 'realizacja-tytul',
} as const;

/** Elementy nieruchome (plan MIX-1310, sekcja 3): własna nazwa, bez animacji. */
export const VT_STILL: ReadonlyArray<{ selector: string; name: string }> = [
  { selector: 'nav[aria-label="Główna nawigacja"]', name: 'vt-naglowek' },
  { selector: '[role="region"][aria-label="Baner plików cookies"]', name: 'vt-baner-zgod' },
  { selector: '.cookie-floating-btn', name: 'vt-przycisk-zgod' },
];

/** Atrybut na <html> na czas przejścia (do stylów i do próby). */
export const VT_ATTR = 'data-vt';
export const VT_ATTR_VALUE = 'realizacja';

/** Ile czekamy na chunk i dane strony docelowej, zanim zrezygnujemy z przejścia (plan, sekcja 5). */
export const PRELOAD_MAX_MS = 300;
/** Ile czekamy w przejściu na wyrenderowanie nagłówka realizacji. */
export const TARGET_READY_MAX_MS = 500;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Ścieżka `/portfolio/<slug>/` z adresu linku albo `null`. Allowlista: ten sam origin,
 * dokładnie ten kształt ścieżki, bez zapytania i kotwicy (kotwice obsługuje ScrollToTop).
 */
export function caseStudyPath(href: string | null | undefined, origin: string): string | null {
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin || url.search || url.hash) return null;
  const m = /^\/portfolio\/([^/]+)\/$/.exec(url.pathname);
  if (!m || !SLUG_RE.test(m[1])) return null;
  return url.pathname;
}

interface ClickLike {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}

/** Zwykły klik lewym przyciskiem, bez klawiszy (nowa karta/okno zostają przeglądarce). */
export function isPlainPrimaryClick(e: ClickLike): boolean {
  return (
    e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented
  );
}

/** Link bez `target` (albo `_self`) i bez `download`. */
export function isSameTabAnchor(a: HTMLAnchorElement): boolean {
  const target = a.getAttribute('target');
  return (target === null || target === '' || target === '_self') && !a.hasAttribute('download');
}

/** Ruch dozwolony tylko przy jawnym `no-preference`; brak matchMedia albo błąd = bez ruchu. */
export function motionAllowed(win: Pick<Window, 'matchMedia'> | undefined): boolean {
  try {
    return win?.matchMedia?.('(prefers-reduced-motion: no-preference)')?.matches === true;
  } catch {
    return false;
  }
}

export type VtDocument = Document & {
  startViewTransition?: (cb: () => Promise<void> | void) => ViewTransitionLike;
};

export interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

export function supportsViewTransitions(doc: Document | undefined): boolean {
  return typeof (doc as VtDocument | undefined)?.startViewTransition === 'function';
}

const MAX_CARD_DEPTH = 4;

function firstImage(root: Element): HTMLImageElement | null {
  for (const img of Array.from(root.querySelectorAll('img'))) {
    if (img.getAttribute('aria-hidden') !== 'true') return img;
  }
  return null;
}

/**
 * Zdjęcie i tytuł karty, w której jest kliknięty link. Karta = najbliższy przodek
 * (najwyżej 4 poziomy) z jednym linkiem i zdjęciem; link w tekście bez zdjęcia
 * (akapit, menu) daje `null` = zwykła nawigacja.
 */
export function findCardParts(
  a: HTMLAnchorElement,
): { image: HTMLElement; title: HTMLElement | null } | null {
  let image = firstImage(a);
  let node: Element = a;
  for (let depth = 0; !image && depth < MAX_CARD_DEPTH && node.parentElement; depth++) {
    node = node.parentElement;
    if (node.querySelectorAll('a[href]').length !== 1) break;
    image = firstImage(node);
  }
  if (!image) return null;
  const title =
    (a.closest('h1, h2, h3, h4') as HTMLElement | null) ??
    (a.querySelector('h2, h3, h4') as HTMLElement | null);
  return { image, title };
}
