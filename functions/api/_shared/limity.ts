// Limity długości pól wejściowych publicznych endpointów leadów (formularz, audyt, kalkulator).
// Bez handlerów → nie tworzy trasy. Sprawdzenie po stronie serwera: przekroczenie = 400 z komunikatem
// po polsku, zanim cokolwiek trafi do D1, maila, CRM albo Lineara.
//
// Długość liczona w jednostkach UTF-16 (`String.length`), tak samo jak w `_shared/input.ts`.

/** Limit i nazwa pola widoczna w komunikacie dla człowieka. */
export interface LimitPola {
  max: number;
  etykieta: string;
}

/** Znane pola leadów (formularz, audyt, kalkulator). Pole spoza listy dostaje `LIMIT_INNEGO`. */
export const LIMITY_POL: Readonly<Record<string, LimitPola>> = {
  name: { max: 200, etykieta: 'Imię i nazwisko' },
  email: { max: 254, etykieta: 'E-mail' },
  phone: { max: 40, etykieta: 'Telefon' },
  service_interest: { max: 100, etykieta: 'Usługa' },
  package_name: { max: 100, etykieta: 'Pakiet' },
  company: { max: 200, etykieta: 'Firma' },
  companyName: { max: 200, etykieta: 'Nazwa firmy' },
  website: { max: 2048, etykieta: 'Adres strony' },
  url: { max: 2048, etykieta: 'Adres strony' },
  source_url: { max: 2048, etykieta: 'Adres źródłowy' },
  budget: { max: 100, etykieta: 'Budżet' },
  message: { max: 5000, etykieta: 'Wiadomość' },
  captcha_token: { max: 2048, etykieta: 'Token captcha' },
  score: { max: 20, etykieta: 'Wynik' },
  id: { max: 100, etykieta: 'Identyfikator' },
  type: { max: 40, etykieta: 'Typ' },
  edit_token: { max: 500, etykieta: 'Token leada' },
};

/** Pole nieznane (dodatkowe pola formularza trafiają do `details`). */
export const LIMIT_INNEGO = 1000;
/** Wartość złożona (obiekt, tablica) po serializacji do JSON. */
export const LIMIT_WARTOSCI_ZLOZONEJ = 5000;
/** Najwięcej pól w jednym obiekcie (lead, details). */
export const MAX_POL = 40;
/** Najdłuższa nazwa pola. */
export const MAX_NAZWA_POLA = 100;
/** Cały obiekt (lead, details) po serializacji do JSON. */
export const MAX_OBIEKT = 20_000;

const za = (etykieta: string, max: number) => `Pole „${etykieta}” może mieć maks. ${max} znaków.`;

/** Jedno pole tekstowe: komunikat błędu albo null. Brak (undefined/null) jest dozwolony. */
export function sprawdzTekst(wartosc: unknown, klucz: string): string | null {
  if (wartosc === undefined || wartosc === null) return null;
  const limit = LIMITY_POL[klucz];
  const max = limit?.max ?? LIMIT_INNEGO;
  const etykieta = limit?.etykieta ?? klucz;
  if (typeof wartosc === 'string') return wartosc.length > max ? za(etykieta, max) : null;
  if (typeof wartosc === 'number' || typeof wartosc === 'boolean') return null;
  let zapis: string;
  try {
    zapis = JSON.stringify(wartosc);
  } catch {
    return `Pole „${etykieta}” ma nieprawidłowy format.`;
  }
  return zapis.length > LIMIT_WARTOSCI_ZLOZONEJ ? za(etykieta, LIMIT_WARTOSCI_ZLOZONEJ) : null;
}

/** Wymagane pola tekstowe: musi to być string (nie liczba, nie obiekt). Komunikat albo null. */
export function sprawdzWymaganyTekst(wartosc: unknown, klucz: string): string | null {
  if (wartosc === undefined || wartosc === null) return null;
  if (typeof wartosc !== 'string') {
    return `Pole „${LIMITY_POL[klucz]?.etykieta ?? klucz}” ma nieprawidłowy format.`;
  }
  return sprawdzTekst(wartosc, klucz);
}

/**
 * Obiekt z polami formularza (lead, details): liczba pól, długość nazw, limit każdego pola
 * i łączny rozmiar. Pierwszy błąd jako komunikat po polsku, null gdy wszystko w normie.
 */
export function sprawdzObiekt(src: unknown, nazwa: string): string | null {
  if (src === undefined || src === null) return null;
  if (typeof src !== 'object' || Array.isArray(src)) {
    return `Pole „${nazwa}” ma nieprawidłowy format.`;
  }
  const wpisy = Object.entries(src as Record<string, unknown>);
  if (wpisy.length > MAX_POL) return `Za dużo pól w zgłoszeniu (maks. ${MAX_POL}).`;
  for (const [klucz, wartosc] of wpisy) {
    if (klucz.length > MAX_NAZWA_POLA) {
      return `Nazwa pola może mieć maks. ${MAX_NAZWA_POLA} znaków.`;
    }
    const blad = sprawdzTekst(wartosc, klucz);
    if (blad) return blad;
  }
  let zapis: string;
  try {
    zapis = JSON.stringify(src);
  } catch {
    return `Pole „${nazwa}” ma nieprawidłowy format.`;
  }
  return zapis.length > MAX_OBIEKT ? `Zgłoszenie jest za duże (maks. ${MAX_OBIEKT} znaków).` : null;
}
