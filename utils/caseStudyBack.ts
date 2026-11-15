// Powrót z realizacji na listę jako odwrotność przejścia (MIX-1675).
// Czysta logika: pamięć pozycji przewinięcia (klucz = ścieżka listy), decyzja „przejście, samo
// przywrócenie czy nic” (allowlista, fail-closed) i przywrócenie pozycji bez animacji.
// Przywrócenie pozycji: utils/caseStudyRestore.ts, przebieg przejścia:
// utils/caseStudyBackTransition.ts, podpięcie do przeglądarki: utils/caseStudyBackBrowser.ts.

const CASE_STUDY_ROUTE = /^\/portfolio\/[^/]+\/?$/;

/** Strona realizacji: /portfolio/<slug>/ (z ukośnikiem na końcu albo bez). */
export function isCaseStudyRoute(pathname: string | null | undefined): boolean {
  return typeof pathname === 'string' && CASE_STUDY_ROUTE.test(pathname);
}

/** Klucz listy: `/portfolio/` i `/portfolio` to ta sama lista. */
export function listKey(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') || '/' : pathname;
}

/** Jak długo przeglądarka nie przywraca pozycji sama podczas powrotu. */
const MANUAL_RESTORATION_MS = 1200;
const MAX_ENTRIES = 50;
const positions = new Map<string, number>();
let holding = false;
let holdTimer: ReturnType<typeof setTimeout> | undefined;
let revertPending: (() => void) | null = null;

/** Ile najdłużej czekamy, aż lista urośnie do zapisanej pozycji. */
export const RESTORE_MAX_MS = 1500;

/**
 * Zapamiętuje pozycję strony (nie realizacji). Podczas powrotu zapis jest wstrzymany:
 * zdarzenia przewinięcia wywołane przez samą przeglądarkę nie nadpisują zapisanej pozycji.
 */
export function recordScroll(pathname: string | null | undefined, y: number): void {
  if (holding || !pathname || isCaseStudyRoute(pathname)) return;
  if (!Number.isFinite(y) || y < 0) return;
  const key = listKey(pathname);
  positions.delete(key);
  positions.set(key, Math.round(y));
  if (positions.size > MAX_ENTRIES) {
    const oldest = positions.keys().next().value;
    if (oldest !== undefined) positions.delete(oldest);
  }
}

export function savedPosition(pathname: string): number | null {
  return positions.get(listKey(pathname)) ?? null;
}

export function resetPositions(): void {
  positions.clear();
  holding = false;
  revertPending = null;
  if (holdTimer) clearTimeout(holdTimer);
}

/** Wstrzymuje zapis pozycji na czas powrotu (z bezpiecznikiem czasu). */
export function holdRecording(ms: number = RESTORE_MAX_MS + 500): void {
  holding = true;
  if (holdTimer) clearTimeout(holdTimer);
  holdTimer = setTimeout(() => {
    holding = false;
  }, ms);
}

/** Wznawia zapis pozycji (koniec powrotu). */
export function releaseRecording(): void {
  holding = false;
  if (holdTimer) clearTimeout(holdTimer);
}

/**
 * Na chwilę powrotu wpis historii ma `scrollRestoration = 'manual'`: pozycję ustawiamy sami
 * (bez animacji, od pierwszej klatki), a przeglądarka nie dosuwa jej po nas do własnej wartości.
 * Potem wraca poprzedni tryb (przeładowanie strony działa jak dotąd).
 */
export function manualRestorationFor(win: Window, ms = MANUAL_RESTORATION_MS): void {
  revertManualRestoration();
  try {
    // r6b (allowlista): zmieniamy tylko 'auto' na 'manual'; każdy inny tryb (już 'manual', nieznany) = nic naszego
    if (win.history.scrollRestoration !== 'auto') return;
    win.history.scrollRestoration = 'manual';
    const timer = win.setTimeout(revertManualRestoration, ms);
    revertPending = () => {
      win.clearTimeout(timer);
      try {
        // tylko gdy nasza zmiana ('manual') jest widoczna na bieżącym wpisie; inny tryb: nic nie zapisujemy
        if (win.history.scrollRestoration === 'manual') win.history.scrollRestoration = 'auto';
      } catch {
        /* wpis już nieaktualny */
      }
    };
  } catch {
    /* brak obsługi: zostaje zachowanie przeglądarki */
  }
}

/** Koniec okna `manual` teraz (MIX-1675 r6: cofnięcie, którego nie przyjęliśmy, ma tryb przeglądarki). */
export function revertManualRestoration(): void {
  const revert = revertPending;
  revertPending = null;
  revert?.();
}

export function isRecordingHeld(): boolean {
  return holding;
}

interface BackInput {
  from: string;
  to: string;
  navType: string;
  saved: number | null;
}

/**
 * Pozycja do przywrócenia po zmianie trasy albo `null`. Tylko wstecz (POP) z realizacji na
 * inną stronę, dla której jest zapisana pozycja; wejście bez zapisu = domyślne zachowanie.
 */
export function backRestoreTarget({ from, to, navType, saved }: BackInput): number | null {
  if (navType !== 'POP') return null;
  if (!isCaseStudyRoute(from) || isCaseStudyRoute(to)) return null;
  return saved;
}

export type BackPlan =
  { kind: 'none' } | { kind: 'restore'; y: number } | { kind: 'transition'; y: number };

interface PlanInput extends Omit<BackInput, 'navType'> {
  enabled: boolean;
  supported: boolean;
  motion: boolean;
  active: boolean;
  hero: boolean;
  /** MIX-1759: przeglądarka sama pokazała już przejście wstecz (np. gest od lewej krawędzi w Chrome Android). */
  uaTransition: boolean;
}

/**
 * Decyzja przy cofnięciu. Przełącznik wyłączony = `none` (nowe zachowanie jest ukryte, powrót
 * jak przed MIX-1675). Włączony: `transition` tylko, gdy KAŻDY warunek jest spełniony; zapis
 * jest, a coś zawodzi = samo przywrócenie bez animacji (`restore`); brak zapisu = `none`.
 */
export function planBack(i: PlanInput): BackPlan {
  if (!i.enabled) return { kind: 'none' };
  const y = backRestoreTarget({ from: i.from, to: i.to, navType: 'POP', saved: i.saved });
  if (y === null) return { kind: 'none' };
  // MIX-1759: własne przejście przeglądarki (hasUAVisualTransition) = bez naszego, inaczej dwie animacje po sobie
  const ok = i.supported && i.motion && !i.active && i.hero && !i.uaTransition;
  return ok ? { kind: 'transition', y } : { kind: 'restore', y };
}
