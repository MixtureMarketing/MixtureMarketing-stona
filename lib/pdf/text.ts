// Sanityzacja tekstu przed renderem do PDF. Wspólna dla WSZYSTKICH naszych dokumentów.
//
// Dlaczego to istnieje (bug produkcyjny, oferta #4):
// `(16800).toLocaleString('pl-PL')` zwraca "16<NBSP>800" — separatorem tysięcy jest TWARDA
// SPACJA. Nie było jej w subsecie fontu, a jsPDF dla znaków z zakresu 0x80–0xFF spoza fontu
// **ucina resztę linii**. Pas ceny w ofercie zredukował się do "11". Cicho, bez błędu.
// (Znaki powyżej 0xFF zachowują się inaczej: gubią glif, ale tekst leci dalej.)
//
// Obrona jest dwuwarstwowa i obie warstwy są potrzebne:
//   1. TU: zamieniamy twarde/wąskie spacje na zwykłe, zanim ktokolwiek je narysuje.
//   2. W subsecie fontu (scripts/fonts/build-pdf-font.py): te znaki i tak muszą tam być,
//      bo sanityzacja nie obejmie tekstu wpisanego ręcznie do seedów czy nazwy klienta.

// Kody, NIE dosłowne znaki. Dosłowny NBSP w źródle jest niewidoczny i nie do zrecenzowania —
// dokładnie tak powstał ten bug. Liczba w tablicy jest widoczna w code review; znak nie jest.
// (ESLint `no-irregular-whitespace` słusznie odrzuca wariant z dosłownymi znakami w regexie.)

/** Twarda, wąska twarda, cyfrowa, cienka, włosowa — wyglądają jak spacja, a nią nie są. */
const KODY_SPACJI = [0x00a0, 0x202f, 0x2007, 0x2009, 0x200a];
/** Zerowej szerokości: ZWSP, ZWNJ, ZWJ, BOM — niewidoczne, potrafią zepsuć kodowanie. */
const KODY_ZEROWE = [0x200b, 0x200c, 0x200d, 0xfeff];

const klasa = (kody: number[]) =>
  new RegExp(`[${kody.map((k) => String.fromCodePoint(k)).join('')}]`, 'g');

/**
 * Zamienia znaki, które psują render, na bezpieczne odpowiedniki.
 * Idempotentne. Stosowane automatycznie przez `registerPlFont` — patrz `fontPl.ts`.
 */
export function sanitizePdfText(text: string): string {
  return text.replace(klasa(KODY_SPACJI), ' ').replace(klasa(KODY_ZEROWE), '');
}

/**
 * Liczba po polsku, BEZ twardej spacji i BEZ waluty.
 *
 * Dwa powody, żeby nie wołać `toLocaleString` wprost w rendererze:
 *  1. `toLocaleString('pl-PL')` wstawia NBSP jako separator tysięcy (to on zjadł cenę).
 *  2. `toLocaleString()` BEZ argumentu bierze locale przeglądarki — polski dokument
 *     pokazywałby wtedy „11,400" Amerykaninowi i „11.400" Niemcowi. Format dokumentu
 *     ma zależeć od dokumentu, nie od tego, kto klika.
 */
export function formatujLiczbe(n: number): string {
  return sanitizePdfText(Math.round(n).toLocaleString('pl-PL'));
}

/** Kwota w złotych — `formatujLiczbe` + „zł". */
export function pln(kwota: number): string {
  return `${formatujLiczbe(kwota)} zł`;
}
