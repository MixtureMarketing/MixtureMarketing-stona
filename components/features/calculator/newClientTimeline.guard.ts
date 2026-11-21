// MIX-1816 (Z13): kontrola treści osi czasu (allowlista wyniku: pusta lista naruszeń albo odmowa).
// Używana przez testy treści; nie jest ładowana przez aplikację. Zakazane: obietnica wyniku
// (gwarant*, „wzrost o", „zwrot z inwestycji", znak procentu, „pewn*") i ceny (kwoty, waluty, słowa
// o cenie i koszcie). Cyfry w nagłówkach okresów („Tydzień 1", „90 dni") są dozwolone: kwotą jest
// dopiero liczba z walutą albo liczba z co najmniej trzema cyframi.

export const FORBIDDEN: ReadonlyArray<readonly [string, RegExp]> = [
  ['gwarant', /gwaran[tc]/i],
  ['wzrost o', /wzrost\s+o\b/i],
  ['zwrot z inwestycji', /zwrot\s+z\s+inwestycji/i],
  ['procent', /%/],
  ['pewn', /pewn/i],
  ['waluta', /(?<![\p{L}])(?:zł|zl|pln|eur)(?![\p{L}])|[€$£]/iu],
  ['cena', /\bcen[aąęyieo]/i],
  ['koszt', /koszt/i],
  ['kwota', /\d{3,}/],
];

/** Nazwy naruszonych reguł dla jednego tekstu; pusta tablica = tekst czysty. */
export function forbiddenIn(text: string): string[] {
  return FORBIDDEN.filter(([, re]) => re.test(text)).map(([name]) => name);
}
