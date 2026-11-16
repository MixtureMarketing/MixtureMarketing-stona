// „Twój zakres" w podglądzie wyceny (MIX-1790, Z6 z MIX-1377; spec MIX-1320 U4, decyzja P5 = A).
// CZYSTY TS. Z wyniku silnika wybiera obszary, które realnie wchodzą do projektu (godziny > 0, jak
// zakres oferty w documents.ts), i zwraca dla nich WYŁĄCZNIE treść kliencką z migracji 0007:
// `client_name` (nazwa obszaru) i `client_description` (opis wybranego poziomu).
// Lista dozwolona i fail-closed: nowy obiekt z dwoma polami (nic z wiersza nie przechodzi
// „przy okazji"), brak albo pusta nazwa kliencka = obszar pominięty (BEZ fallbacku na nazwę
// wewnętrzną), nie-tekst, sam biały znak, za długi tekst = pominięty albo opis = null.
import type { AspectComputation } from './types';

export interface PublicScopeItem {
  client_name: string;
  client_description: string | null;
}

/** Najdłuższa nazwa obszaru, którą pokażemy (znaki). Dłuższa = obszar pominięty. */
export const SCOPE_NAME_MAX = 120;
/** Najdłuższy opis (znaki). Dłuższy = opis pominięty (null), nazwa zostaje. */
export const SCOPE_DESCRIPTION_MAX = 500;
/** Najwięcej pozycji listy w jednej odpowiedzi. */
export const SCOPE_MAX_ITEMS = 30;

// Znaki niewidoczne (MIX-1799, MIX-1808): ścisły, opisany zbiór, jedna kopia dla serwera
// (toPublicScope) i klienta (parseScope w pricePreviewService używa tej samej cleanClientText).
//  - \p{Cf} (formatujące: miękki dywiz, ZWSP/ZWJ, znaczniki kierunku, bidi, BOM, U+E0001 i znaczniki),
//  - \p{Cc} (sterujące C0/C1, DEL) OPRÓCZ tabulacji i nowej linii (U+0009, U+000A, U+000D: brzegi
//    czyści `trim()`, a wielolinijkowy opis nie skleja słów),
//  - \p{Cs} (samotny surogat; poprawna para, np. emoji, to jeden znak i zostaje),
//  - Default_Ignorable_Code_Point spoza Cf: U+034F, U+115F, U+1160, U+17B4–U+17B5, U+3164, U+FFA0,
//    U+180B–U+180F, U+FFF0–U+FFF8, U+E0000–U+E0FFF; do tego U+206A–U+206F i U+FFF9–U+FFFB.
// Selektory wariantów U+FE00–U+FE0F osobno (VARIATION_SELECTOR): zostają tylko za symbolem
// (\p{S}: emoji „❤️”, „©️”), za U+203C, U+2049, U+2139, U+3030, U+303D (piktogramy emoji spoza \p{S})
// albo za cyfrą/#/* (keycap „1️⃣”), poza tym są niewidoczne. Same kategorie ogólne zamiast własności
// Extended_Pictographic (MIX-1810): kategorie ogólne działają od Safari 11.1, a domyślny cel
// budowy Vite 7 to safari16/chrome107/firefox104.
// Zapis przez sekwencje \uXXXX / \u{XXXXX}, nie przez same znaki: plik ma być czytelny w przeglądzie.
// Bez lookbehind (starsze Safari nie wczyta modułu z lookbehind).
const INVISIBLE =
  // eslint-disable-next-line no-misleading-character-class -- zbiór pojedynczych znaków, nie sekwencje
  /(?![\t\n\r])\p{Cc}|[\p{Cf}\p{Cs}\u034F\u115F\u1160\u17B4\u17B5\u180B-\u180F\u206A-\u206F\u3164\uFFA0\uFFF0-\uFFFB\u{E0000}-\u{E0FFF}]/gu;
const VARIATION_SELECTOR = /(\p{S}|[\u203C\u2049\u2139\u3030\u303D]|[0-9#*])?[\uFE00-\uFE0F]/gu;
// Znak widoczny (MIX-1810), lista dozwolona: litera, cyfra, interpunkcja albo symbol (emoji to \p{S}),
// OPRÓCZ symboli o pustym glifie: U+2800 (pusty wzór brajla), U+FFFC (zastępczy obiekt),
// U+1D159 (pusta główka nuty). Tekst bez żadnego takiego znaku po oczyszczeniu = pominięty; dzięki
// temu znak spoza zbioru INVISIBLE (np. nieprzypisany U+2065, samotny znak łączący, U+16FE4,
// prywatny U+E000) nie zrobi pustej nazwy. Bez flagi g: test() nie trzyma lastIndex.
const VISIBLE = /(?![\u2800\uFFFC\u{1D159}])[\p{L}\p{N}\p{P}\p{S}]/u;

/** Tekst bez znaków niewidocznych (zbiór wyżej) i bez białych znaków na brzegach. */
export function stripInvisible(raw: string): string {
  return raw
    .replace(INVISIBLE, '')
    .replace(VARIATION_SELECTOR, (m, base: string | undefined) => (base ? m : ''))
    .trim();
}

/** Tekst do pokazania albo null: tylko string, bez znaków niewidocznych, z ≥ 1 znakiem widocznym, ≤ max. */
export function cleanClientText(raw: unknown, max: number): string | null {
  if (typeof raw !== 'string') return null;
  const t = stripInvisible(raw);
  if (t === '' || t.length > max || !VISIBLE.test(t)) return null;
  return t;
}

/** Obszary wybrane (godziny > 0) → lista „Twój zakres" (najwyżej SCOPE_MAX_ITEMS pozycji). */
export function toPublicScope(aspects: readonly AspectComputation[]): PublicScopeItem[] {
  const out: PublicScopeItem[] = [];
  for (const a of aspects) {
    if (out.length >= SCOPE_MAX_ITEMS) break;
    if (!(a.hoursMax > 0)) continue;
    const name = cleanClientText(a.clientName, SCOPE_NAME_MAX);
    if (name === null) continue;
    out.push({
      client_name: name,
      client_description: cleanClientText(a.levelClientDescription, SCOPE_DESCRIPTION_MAX),
    });
  }
  return out;
}
