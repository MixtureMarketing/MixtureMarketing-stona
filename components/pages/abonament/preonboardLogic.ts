// Czysta logika modala preonboard (abonament): telefon, NIP, draft, mapowanie błędów huba.
// Osobny moduł, żeby dało się ją testować bez renderu i współdzielić z AbonamentSuccess
// (czyszczenie draftu dopiero po potwierdzonej płatności).

// ---------------------------------------------------------------------------
// Telefon
// ---------------------------------------------------------------------------

/**
 * Normalizuje numer do E.164. Polski numer zawsze jako +48 + 9 cyfr.
 * "600 100 200" / "0600 100 200" / "+48 600-100-200" / "0048 600 100 200" → "+48600100200".
 * Wiodące „0" (nawyk z numeracji międzymiastowej) jest obcinane — wcześniej
 * „0600100200" wychodziło jako „+0600100200", co nie jest numerem E.164.
 */
export const normalizePhone = (raw: string): string => {
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  // Jawny prefiks międzynarodowy: "+" albo "00".
  const international = trimmed.startsWith('+') || digits.startsWith('00');
  if (!trimmed.startsWith('+') && digits.startsWith('00')) digits = digits.slice(2);

  if (international) {
    if (digits.startsWith('48')) return '+48' + digits.slice(2).replace(/^0+/, '');
    return '+' + digits;
  }

  digits = digits.replace(/^0+/, '');
  if (digits.length === 9) return '+48' + digits;
  // 48 + 9 cyfr wpisane bez plusa.
  if (digits.startsWith('48') && digits.length === 11) return '+' + digits;
  // Dłuższe — numer zagraniczny wpisany bez plusa.
  if (digits.length > 9) return '+' + digits;
  // Krótsze — zostawiamy +48, walidacja i tak to odrzuci.
  return '+48' + digits;
};

/** E.164; dla Polski (+48) dokładnie 9 cyfr numeru krajowego, bez wiodącego zera. */
export const isValidPhoneE164 = (v: string): boolean => {
  if (!/^\+[1-9]\d{7,14}$/.test(v)) return false;
  if (v.startsWith('+48')) return /^\+48[1-9]\d{8}$/.test(v);
  return true;
};

// ---------------------------------------------------------------------------
// NIP
// ---------------------------------------------------------------------------

const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

/** Suma kontrolna NIP: Σ(cyfra_i × waga_i) mod 11 == cyfra 10 (wynik 10 = NIP nieważny). */
export const isValidNipChecksum = (nip: string): boolean => {
  if (!/^\d{10}$/.test(nip)) return false;
  const sum = NIP_WEIGHTS.reduce((acc, w, i) => acc + w * Number(nip[i]), 0);
  const control = sum % 11;
  return control !== 10 && control === Number(nip[9]);
};

export const validateNip = (v: string): string | null => {
  if (v.length === 0) return 'Wpisz NIP firmy — potrzebny do faktury VAT.';
  if (v.length < 10) return `${v.length}/10 cyfr — w PL NIP ma 10 cyfr.`;
  if (!/^\d{10}$/.test(v)) return 'NIP to 10 cyfr (bez myślników).';
  if (!isValidNipChecksum(v)) return 'Ten NIP jest nieprawidłowy — sprawdź, czy nie ma literówki.';
  return null;
};

// ---------------------------------------------------------------------------
// Błędy huba
// ---------------------------------------------------------------------------

/** Kody, którymi hub może zgłosić zajęty NIP / istniejącego klienta. */
const NIP_TAKEN_CODES = new Set([
  'NIP_TAKEN',
  'NIP_EXISTS',
  'NIP_ALREADY_EXISTS',
  'NIP_ALREADY_REGISTERED',
  'DUPLICATE_NIP',
  'CLIENT_EXISTS',
  'CLIENT_ALREADY_EXISTS',
  'ALREADY_EXISTS',
  'ALREADY_REGISTERED',
]);
const DUPLICATE_WORDS =
  /already|exists|taken|registered|duplicate|in use|zarejestrowan|istnieje|zaj[eę]ty|użyciu/i;

/**
 * Czy błąd huba oznacza, że NIP jest już zarejestrowany (→ CTA „zaloguj się do panelu").
 * Tylko jawny kod duplikatu, HTTP 409 albo komunikat o duplikacie NIP-u. Samo słowo
 * „nip" nie wystarczy — „Invalid NIP checksum" to błąd walidacji, nie istniejące konto,
 * a odsyłanie kogoś, kto jeszcze nie zapłacił, do logowania to ślepy zaułek.
 */
export const isNipTakenError = (code: string | undefined, status: number, message: string) => {
  if (code && NIP_TAKEN_CODES.has(code.toUpperCase())) return true;
  const mentionsNip = /\bnip\b/i.test(message);
  if (status === 409) return mentionsNip || !message;
  return mentionsNip && DUPLICATE_WORDS.test(message);
};

// ---------------------------------------------------------------------------
// Draft (sessionStorage)
// ---------------------------------------------------------------------------

// Draft przeżywa błędy sieci, anulowanie płatności w Stripe i przypadkowe zamknięcie modala.
// Czyszczony DOPIERO po potwierdzonej płatności (AbonamentSuccess z `sid`), nigdy przed
// przekierowaniem — inaczej powrót z `?stripe=canceled` zastaje pusty formularz.
export const DRAFT_KEY = 'mm_preonboard_draft';

export type DraftTier = 'starter' | 'standard' | 'premium' | 'professional';
export interface DraftShape {
  businessName: string;
  email: string;
  phone: string;
  nip: string;
  consentMarketing: boolean;
  selectedTier: DraftTier | null;
}

export const readDraft = (): Partial<DraftShape> => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<DraftShape>;
  } catch {
    return {};
  }
};

export const writeDraft = (d: Partial<DraftShape>) => {
  try {
    const current = readDraft();
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...current, ...d }));
  } catch {
    /* ignore quota / private mode */
  }
};

export const clearDraft = () => {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

/** Przekierowanie do Stripe Checkout. Osobna funkcja, żeby testy mogły ją podmienić (jsdom nie nawiguje). */
export const redirectToCheckout = (url: string) => {
  window.location.href = url;
};
