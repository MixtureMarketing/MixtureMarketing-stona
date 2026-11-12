import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import {
  CALCULATOR_EVENTS,
  sanitizeCalculatorParams,
  trackCalculatorBookingOpen,
  trackCalculatorPreview,
  trackCalculatorShare,
  trackCalculatorStep,
} from '@/utils/calculatorTracking';

/**
 * MIX-1384 (Z3): zdarzenia GA4 kalkulatora. Kazde zdarzenie: nazwa, allowlista parametrow,
 * brak danych osobowych, jedno wywolanie zaraz.track (ta sama droga co calculator_submit).
 */
let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
});
afterEach(() => {
  delete window.zaraz;
});

const PII_E = /[^\s@]+@[^\s@]+/;
const PII_PHONE = /\d{7,}/;
const noPii = (v: unknown) => {
  const s = JSON.stringify(v);
  expect(s).not.toMatch(PII_E);
  expect(s).not.toMatch(PII_PHONE);
};

describe('calculator_step', () => {
  it('nazwa i parametry z allowlisty', () => {
    trackCalculatorStep({ stepNumber: 2, stepCount: 4, group: 'platforma', direction: 'next' });
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('calculator_step', {
      step_number: 2,
      step_count: 4,
      step_group: 'platforma',
      direction: 'next',
    });
    expect(Object.keys(track.mock.calls[0][1] ?? {}).sort()).toEqual(
      Object.keys(CALCULATOR_EVENTS.calculator_step).sort(),
    );
    noPii(track.mock.calls[0][1]);
  });

  it('nieznana grupa z API -> "other" (nie przepuszcza dowolnego tekstu)', () => {
    trackCalculatorStep({
      stepNumber: 1,
      stepCount: 3,
      group: 'jan@firma.pl',
      direction: 'back',
    });
    expect(track.mock.calls[0][1]).toMatchObject({ step_group: 'other', direction: 'back' });
    noPii(track.mock.calls[0][1]);
  });

  it('krok poza zakresem albo ulamek -> parametr odrzucony', () => {
    trackCalculatorStep({ stepNumber: 0, stepCount: 2.5, group: 'projekt', direction: 'next' });
    const data = track.mock.calls[0][1] as Record<string, unknown>;
    expect(data).not.toHaveProperty('step_number');
    expect(data).not.toHaveProperty('step_count');
    expect(data).toMatchObject({ step_group: 'projekt', direction: 'next' });
  });
});

describe('calculator_preview', () => {
  it('nazwa i parametry z allowlisty', () => {
    trackCalculatorPreview({ answeredCount: 5 });
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('calculator_preview', {
      source: 'wycena',
      answered_count: 5,
    });
    noPii(track.mock.calls[0][1]);
  });
});

describe('calculator_share', () => {
  it('nazwa i parametry z allowlisty', () => {
    trackCalculatorShare({ method: 'copy' });
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('calculator_share', { source: 'wycena', method: 'copy' });
    noPii(track.mock.calls[0][1]);
  });
});

describe('calculator_booking_open', () => {
  it('nazwa i parametry z allowlisty, bez e-maila', () => {
    trackCalculatorBookingOpen({ variant: 'a' });
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('calculator_booking_open', {
      source: 'wycena',
      variant: 'a',
    });
    noPii(track.mock.calls[0][1]);
  });
});

describe('sanitizeCalculatorParams (fail-closed)', () => {
  it('nieznane zdarzenie -> null (nic nie idzie)', () => {
    expect(sanitizeCalculatorParams('calculator_hack', { a: 1 })).toBeNull();
    expect(sanitizeCalculatorParams('__proto__', {})).toBeNull();
    expect(sanitizeCalculatorParams('', {})).toBeNull();
  });

  it('nieznany parametr odpada, takze gdy niesie e-mail albo telefon', () => {
    const out = sanitizeCalculatorParams('calculator_booking_open', {
      source: 'wycena',
      variant: 'b',
      email: 'jan@firma.pl',
      phone: '+48 600 100 200',
      __proto__: { x: 1 },
    });
    expect(out).toEqual({ source: 'wycena', variant: 'b' });
  });

  it('wartosc z e-mailem albo telefonem w dozwolonym kluczu odpada', () => {
    const out = sanitizeCalculatorParams('calculator_share', {
      source: 'jan@firma.pl',
      method: '600100200',
    });
    expect(out).toEqual({});
  });

  it('wartosc spoza listy odpada, z listy przechodzi (blizniak)', () => {
    expect(sanitizeCalculatorParams('calculator_share', { method: 'sms' })).toEqual({});
    expect(sanitizeCalculatorParams('calculator_share', { method: 'native' })).toEqual({
      method: 'native',
    });
  });

  it('typ niezgodny: tekst zamiast liczby i liczba zamiast tekstu odpadaja', () => {
    expect(sanitizeCalculatorParams('calculator_preview', { answered_count: '5' })).toEqual({});
    expect(sanitizeCalculatorParams('calculator_preview', { source: 5 })).toEqual({});
  });
});

describe('zgoda i brak drugiej drogi', () => {
  it('idzie tylko przez zaraz.track: bez Zaraz nic nie rzuca i nic nie trafia do dataLayer', () => {
    delete window.zaraz;
    window.dataLayer = [];
    expect(() =>
      trackCalculatorStep({ stepNumber: 1, stepCount: 2, group: 'projekt', direction: 'next' }),
    ).not.toThrow();
    expect(window.dataLayer).toHaveLength(0);
  });
});
