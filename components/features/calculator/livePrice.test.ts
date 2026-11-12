import { describe, it, expect } from 'vitest';
import {
  answersHash,
  isLivePriceBarEnabled,
  previewMessage,
  LIVE_PRICE_DEBOUNCE_MS,
} from './livePrice';

describe('livePrice', () => {
  it('zwłoka to 400 ms (kryterium MIX-1385)', () => {
    expect(LIVE_PRICE_DEBOUNCE_MS).toBe(400);
  });

  it('przełącznik: tylko "1" i "true" włączają', () => {
    expect(isLivePriceBarEnabled('1')).toBe(true);
    expect(isLivePriceBarEnabled('true')).toBe(true);
    for (const v of [undefined, null, '', '0', 'false', 'TRUE ', 'yes', 1, true]) {
      expect(isLivePriceBarEnabled(v)).toBe(false);
    }
  });

  it('klucz pamięci nie zależy od kolejności kluczy i pomija puste wartości', () => {
    expect(answersHash({ a: 1, b: 'x' })).toBe(answersHash({ b: 'x', a: 1 }));
    expect(answersHash({ a: 1, b: '', c: undefined })).toBe(answersHash({ a: 1 }));
    expect(answersHash({ a: 1 })).not.toBe(answersHash({ a: 2 }));
    expect(answersHash({ a: 1 })).not.toBe(answersHash({ b: 1 }));
    expect(answersHash({})).toBe('[]');
    expect(answersHash({ a: 0 })).not.toBe('[]');
    expect(answersHash({ a: false })).not.toBe('[]');
  });

  it('komunikaty: 429 inny niż reszta, żaden nie ma słów technicznych', () => {
    expect(previewMessage(429)).not.toBe(previewMessage(500));
    expect(previewMessage(500)).toBe(previewMessage(0));
    for (const s of [429, 500, 0, 403]) {
      expect(previewMessage(s)).not.toMatch(/\d{3}|HTTP|API|serwer|token|błąd/i);
    }
  });
});
