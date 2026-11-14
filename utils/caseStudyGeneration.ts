// Pokolenie nawigacji i lista źródłowa powrotu z realizacji (MIX-1675 r4, r6). Decyzje: utils/caseStudyBack.ts.
import { listKey, revertManualRestoration } from './caseStudyBack';

/**
 * Pokolenie nawigacji (MIX-1675 r4). Każde cofnięcie (popstate) i każde przejście linkiem (PUSH,
 * REPLACE) zwiększa licznik. Każdy odroczony skutek powrotu (czekanie na listę, timer, rAF, korekta, ogon
 * przejścia) bierze bilet w chwili zaplanowania i działa tylko, gdy licznik się nie zmienił, a
 * lokalizacja (ścieżka + query) jest nadal lokalizacją listy. Nieznany albo błędny stan = nic.
 */
let generation = 0;

export function bumpGeneration(): void {
  generation += 1;
}

export function currentGeneration(): number {
  return generation;
}

export interface BackLocation {
  pathname: string;
  search: string;
  hash?: string;
}

function locationKey(read: () => BackLocation | null | undefined): string | null {
  try {
    const loc = read();
    if (!loc || typeof loc.pathname !== 'string' || typeof loc.search !== 'string') return null;
    if (!loc.pathname.startsWith('/')) return null;
    return `${listKey(loc.pathname)}\n${loc.search}`;
  } catch {
    return null;
  }
}

/**
 * MIX-1675 r6 (allowlista): przywracamy pozycję WYŁĄCZNIE po jednym cofnięciu dokładnie na listę, z której
 * weszliśmy na realizację. `source` = lokalizacja sprzed ostatniego PUSH (jedna, do pierwszego popstate);
 * `claim` = cofnięcie przyjęte w tym popstate (lista i jego pokolenie). Wszystko inne = przeglądarka.
 */
let source: string | null = null;
let claim: { key: string; gen: number; owned: boolean } | null = null;

/** Przejście linkiem (PUSH): cofnięcie z nowej strony wraca na `from`. */
export function armSource(from: BackLocation | null | undefined): void {
  source = locationKey(() => from);
}

/**
 * KAŻDY popstate (poza naszym oddaniem zdarzenia routerowi): nowe pokolenie, potem przyjęcie cofnięcia tylko,
 * gdy cel (ścieżka + query, bez kotwicy) to zapisana lista i to pierwsze cofnięcie od wyjścia z niej; każde
 * cofnięcie zużywa zapis. Nieprzyjęte = nasze okno `manual` kończy się od razu (tryb przeglądarki).
 */
export function claimBack(target: BackLocation | null | undefined): boolean {
  generation += 1;
  const at = locationKey(() => target);
  claim =
    at !== null && at === source && !target?.hash
      ? { key: at, gen: generation, owned: false }
      : null;
  source = null;
  if (claim === null) revertManualRestoration();
  return claim !== null;
}

/** Użytkownik sam przewija albo naciska klawisz: przyjęte cofnięcie już nic nie przewija. */
export function dropClaim(): void {
  claim = null;
}

/**
 * MIX-1707: przywrócenie przyjętego cofnięcia ma jednego właściciela. Przejście wstecz
 * (utils/caseStudyBackTransition.ts) bierze je przed oddaniem zdarzenia routerowi i przewija listę dopiero po
 * potwierdzeniu, że cofnięcie jest pojedyncze; ScrollToTop wtedy nie przewija. Przejście nieudane (brak API,
 * błąd startu) oddaje je z powrotem. Tylko bieżące przyjęte cofnięcie (każdy popstate tworzy nowe albo
 * żadne, ruch użytkownika je zdejmuje); brak = nic do wzięcia, ScrollToTop działa jak dotąd.
 */
export function ownBack(owned: boolean): void {
  if (claim !== null) claim.owned = owned;
}
export function backOwned(): boolean {
  return claim !== null && claim.owned;
}

/**
 * Ruch użytkownika po cofnięciu (kółko, dotyk, klawisz, przycisk myszy) = dropClaim i od razu koniec okna
 * `manual`. MIX-1699: PUSH (link) kopiuje tryb bieżącego wpisu na nowy wpis, a wycofanie z timera pisze już
 * tylko na nowy; okno kończymy więc na wpisie listy, zanim router zrobi PUSH (mousedown, touchstart, keydown
 * przed kliknięciem; `click` w fazie capture przed routerem, gdy przycisku nie było, np. czytnik ekranu).
 * `click` tylko kończy okno, przyjętego cofnięcia nie zdejmuje. Zwraca zdjęcie nasłuchu.
 */
const USER_INPUT = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
function onUserInput(): void {
  dropClaim();
  revertManualRestoration();
}
export function listenUserInput(win: Window): () => void {
  for (const t of USER_INPUT)
    win.addEventListener(t, onUserInput, { capture: true, passive: true });
  win.addEventListener('click', revertManualRestoration, true);
  return () => {
    for (const t of USER_INPUT) win.removeEventListener(t, onUserInput, true);
    win.removeEventListener('click', revertManualRestoration, true);
  };
}

/**
 * Bilet odroczonego skutku: `true` tylko dla przyjętego cofnięcia, w jego pokoleniu, na jego liście.
 * Brak przyjęcia (cel inny niż lista źródłowa, drugie cofnięcie, ruch użytkownika) = zawsze `false`.
 */
export function backTicket(read: () => BackLocation | null | undefined): () => boolean {
  const c = claim;
  if (c === null || c.gen !== generation || locationKey(read) !== c.key) return () => false;
  return () => claim === c && c.gen === generation && locationKey(read) === c.key;
}

/** Testy: czysty stan bez listy źródłowej i bez przyjętego cofnięcia. */
export function resetBackState(): void {
  source = null;
  claim = null;
}
