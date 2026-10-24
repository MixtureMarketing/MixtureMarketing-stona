import { describe, it, expect } from 'vitest';
import {
  normalizePhone,
  isValidPhoneE164,
  isValidNipChecksum,
  validateNip,
  isNipTakenError,
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
