import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalizePhone,
  isValidPhoneE164,
  isValidNipChecksum,
  validateNip,
  isNipTakenError,
  DRAFT_KEY,
  readDraft,
  writeDraft,
  clearDraft,
  redirectToCheckout,
} from '@/components/pages/abonament/preonboardLogic';

describe('normalizePhone → E.164', () => {
  it.each([
    ['600 100 200', '+48600100200'],
    ['600-100-200', '+48600100200'],
    ['0600 100 200', '+48600100200'], // wcześniej: "+0600100200"
    ['0600100200', '+48600100200'],
    ['+48 600 100 200', '+48600100200'],
    ['+48 0600 100 200', '+48600100200'],
    ['48600100200', '+48600100200'],
    ['0048 600 100 200', '+48600100200'],
    ['+49 151 23456789', '+4915123456789'],
  ])('%s → %s', (raw, expected) => {
    const n = normalizePhone(raw);
    expect(n).toBe(expected);
    expect(isValidPhoneE164(n)).toBe(true);
  });

  it('pusty → pusty', () => {
    expect(normalizePhone('')).toBe('');
    expect(normalizePhone('+48 ')).toBe('+48');
  });

  it('numer PL o złej długości albo z zerem na początku nie jest E.164', () => {
    expect(isValidPhoneE164('+0600100200')).toBe(false);
    expect(isValidPhoneE164('+4860010020')).toBe(false); // 8 cyfr
    expect(isValidPhoneE164('+486001002001')).toBe(false); // 10 cyfr
    expect(isValidPhoneE164('+48060010020')).toBe(false);
  });
});

describe('NIP — suma kontrolna (wagi 6,5,7,2,3,4,5,6,7; mod 11)', () => {
  it('poprawne NIP-y przechodzą', () => {
    expect(isValidNipChecksum('1234563218')).toBe(true);
    expect(isValidNipChecksum('5260250274')).toBe(true);
    expect(validateNip('1234563218')).toBeNull();
  });

  it('zła cyfra kontrolna / suma = 10 → błąd', () => {
    expect(isValidNipChecksum('1234563219')).toBe(false);
    expect(isValidNipChecksum('1234567890')).toBe(false); // mod 11 = 10
    expect(validateNip('1234567890')).toMatch(/nieprawidłowy/);
  });

  it('długość i format jak wcześniej', () => {
    expect(validateNip('')).toMatch(/Wpisz NIP/);
    expect(validateNip('12345')).toMatch(/5\/10/);
  });
});

describe('isNipTakenError — tylko faktyczny duplikat', () => {
  it('walidacja NIP-u to NIE „NIP zarejestrowany"', () => {
    expect(isNipTakenError('VALIDATION_ERROR', 422, 'Invalid NIP checksum')).toBe(false);
    expect(isNipTakenError(undefined, 400, 'nip is required')).toBe(false);
    expect(isNipTakenError(undefined, 500, 'Internal error while checking NIP')).toBe(false);
  });

  it('jawny kod duplikatu, 409 albo komunikat o zajętym NIP-ie → tak', () => {
    expect(isNipTakenError('NIP_TAKEN', 400, '')).toBe(true);
    expect(isNipTakenError('nip_already_exists', 400, '')).toBe(true);
    expect(isNipTakenError(undefined, 409, '')).toBe(true);
    expect(isNipTakenError('CONFLICT', 409, 'NIP already registered')).toBe(true);
    expect(isNipTakenError(undefined, 400, 'Client with this NIP already exists')).toBe(true);
    expect(isNipTakenError(undefined, 400, 'NIP jest już zarejestrowany')).toBe(true);
  });

  it('409 bez związku z NIP-em → nie', () => {
    expect(isNipTakenError(undefined, 409, 'Email already exists')).toBe(false);
  });
});

// --- Testy charakteryzacyjne (raport 9 §5.2) ---

describe('normalizePhone — przypadki brzegowe (obecne zachowanie)', () => {
  it.each([
    ['600 100 20', '+4860010020'], // za krótki → +48, walidacja odrzuca
    ['+1 202 555 0143', '+12025550143'],
    ['0044 20 7946 0958', '+442079460958'],
    ['44 20 7946 0958', '+442079460958'], // >9 cyfr bez plusa → zagraniczny
    ['abc', ''],
  ])('%s → %s', (raw, expected) => {
    expect(normalizePhone(raw)).toBe(expected);
  });

  it('za krótki numer PL nie przechodzi E.164, zagraniczny 8–15 cyfr przechodzi', () => {
    expect(isValidPhoneE164('+4860010020')).toBe(false);
    expect(isValidPhoneE164('+12025550143')).toBe(true);
    expect(isValidPhoneE164('+1234567')).toBe(false); // 7 cyfr — za mało
  });
});

describe('validateNip — komunikaty', () => {
  it.each([
    ['', 'Wpisz NIP firmy — potrzebny do faktury VAT.'],
    ['123', '3/10 cyfr — w PL NIP ma 10 cyfr.'],
    ['12345678AB', 'NIP to 10 cyfr (bez myślników).'],
    ['123-456-32-18', 'NIP to 10 cyfr (bez myślników).'],
    ['1234563219', 'Ten NIP jest nieprawidłowy — sprawdź, czy nie ma literówki.'],
  ])('%j → %s', (v, msg) => {
    expect(validateNip(v)).toBe(msg);
  });
});

describe('draft w sessionStorage', () => {
  beforeEach(() => sessionStorage.clear());

  it('klucz to mm_preonboard_draft (czyści go też AbonamentSuccess)', () => {
    expect(DRAFT_KEY).toBe('mm_preonboard_draft');
  });

  it('writeDraft scala z istniejącym draftem, readDraft zwraca całość', () => {
    writeDraft({ businessName: 'A', selectedTier: 'starter' });
    writeDraft({ email: 'a@b.pl' });
    expect(readDraft()).toEqual({ businessName: 'A', selectedTier: 'starter', email: 'a@b.pl' });
    expect(JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}')).toEqual(readDraft());
  });

  it('brak / uszkodzony draft → {}', () => {
    expect(readDraft()).toEqual({});
    sessionStorage.setItem(DRAFT_KEY, '{nie-json');
    expect(readDraft()).toEqual({});
  });

  it('clearDraft usuwa wpis', () => {
    writeDraft({ nip: '1234563218' });
    clearDraft();
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('niedostępny storage (tryb prywatny / quota) nie rzuca', () => {
    const spies = [
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      }),
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      }),
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('SecurityError');
      }),
    ];
    try {
      expect(readDraft()).toEqual({});
      expect(() => writeDraft({ email: 'a@b.pl' })).not.toThrow();
      expect(() => clearDraft()).not.toThrow();
    } finally {
      spies.forEach((s) => s.mockRestore());
    }
  });
});

describe('redirectToCheckout', () => {
  it('ustawia window.location.href', () => {
    // jsdom nie nawiguje między dokumentami — nawigacja w obrębie hasha jest obsługiwana.
    const target = `${window.location.href.split('#')[0]}#stripe-checkout`;
    redirectToCheckout(target);
    expect(window.location.href).toBe(target);
    window.location.hash = '';
  });
});
