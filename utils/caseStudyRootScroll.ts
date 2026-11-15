// Przewinięcie korzenia przy nieprzyjętym (drugim) cofnięciu w trakcie przejścia wstecz (MIX-1719); wydzielone z
// utils/caseStudyBackSkip.ts.
import { BACK_INSTANT_HOLD_MS, SCROLL_TOLERANCE_PX } from './caseStudyBackOptions';

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

let instantHold: { root: HTMLElement; prev: string; timer: ReturnType<typeof setTimeout> } | null =
  null;

/**
 * MIX-1719 r3: przez `ms` korzeń przewija się bez animacji (inline `scroll-behavior: auto`), potem wraca poprzednia
 * wartość inline (zwykle brak = `html { scroll-behavior: smooth }` z index.css). Przywrócenie pozycji przez
 * przeglądarkę po nieprzyjętym cofnięciu jest wtedy jednym skokiem na cel, którego nie da się przerwać w połowie.
 * Kolejne wywołanie w tym czasie przedłuża okno i zachowuje pierwotną wartość. Brak korzenia albo stylu = nic;
 * błąd stylu = nic (nigdy nie rzuca: nawigacja nie stoi).
 */
export function holdInstantScroll(
  root: HTMLElement | null,
  ms: number = BACK_INSTANT_HOLD_MS,
): void {
  try {
    const style = root?.style;
    if (!root || !style) return;
    const held = instantHold;
    const now = style.getPropertyValue('scroll-behavior');
    // nasze okno nadal trwa (ten sam korzeń, nadal auto): pierwotna wartość jest w nim, nie w stylu
    const prev = held && held.root === root && now === 'auto' ? held.prev : now;
    if (held) clearTimeout(held.timer);
    style.setProperty('scroll-behavior', 'auto');
    const timer = setTimeout(() => {
      if (instantHold?.timer !== timer) return;
      instantHold = null;
      // ktoś inny zmienił wartość w tym czasie: zostaje jego
      if (style.getPropertyValue('scroll-behavior') !== 'auto') return;
      if (prev) style.setProperty('scroll-behavior', prev);
      else style.removeProperty('scroll-behavior');
    }, ms);
    instantHold = { root, prev, timer };
  } catch {
    /* korzeń bez stylu albo styl rzuca: przewijanie zostaje, jakie było */
  }
}
