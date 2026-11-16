// Limity odpowiedzi publicznych (SPEC-MIX-1320 §6 A9/A10) w osobnym, lekkim module: używa ich
// serwer (publicQuote.ts, sanitizePublicAnswers) i klient (MIX-1791: odczyt linku `?k=`), więc
// klient nie wciąga silnika wyceny. Jedno źródło prawdy dla obu stron.

/** Limit długości odpowiedzi tekstowej (SPEC-MIX-1320 §6 A9). */
export const PUBLIC_TEXT_MAX = 200;

/** Zakresy pól liczbowych (SPEC-MIX-1320 §6 A10): tylko liczby całkowite w przedziale [min, max].
 *  Pole liczbowe spoza tej listy = odmowa (fail-closed), nie domyślny zakres. */
export const PUBLIC_NUMBER_RANGES: Readonly<Record<string, readonly [number, number]>> = {
  views_count: [1, 500],
  languages: [1, 20],
};

/** Allowlista znaków tekstu: litery, cyfry, spacja i zwykła interpunkcja; bez `<`, `>`, `\`,
 *  znaków sterujących i nowych linii (A9: zero HTML w leadzie, panelu i mailach). */
export const PUBLIC_TEXT_ALLOWED = /^[\p{L}\p{N} .,;:!?()'"%&+\-/@#*_]*$/u;
