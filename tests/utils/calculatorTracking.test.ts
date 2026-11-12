import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import {
  CALCULATOR_EVENTS,
  trackCalculatorBookingOpen,
  trackCalculatorPreview,
  trackCalculatorShare,
  trackCalculatorStep,
} from '@/utils/calculatorTracking';
import { REFUSED, sanitizeGa4Event } from '@/utils/ga4Events';

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
  delete window.dataLayer;
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

  it('krok poza zakresem albo ulamek -> parametr "(odrzucone)", zdarzenie idzie', () => {
    trackCalculatorStep({ stepNumber: 0, stepCount: 2.5, group: 'projekt', direction: 'next' });
    expect(track.mock.calls[0][1]).toEqual({
      step_number: REFUSED,
      step_count: REFUSED,
      step_group: 'projekt',
      direction: 'next',
    });
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

describe('allowlista kalkulatora (fail-closed, jedna brama sanitizeGa4Event)', () => {
  const params = (event: string, p: Record<string, unknown>) => {
    const r = sanitizeGa4Event(event, p);
    return r.ok ? r.params : null;
  };

  it('nieznane zdarzenie -> null (nic nie idzie)', () => {
    expect(params('calculator_hack', { a: 1 })).toBeNull();
    expect(params('__proto__', {})).toBeNull();
    expect(params('', {})).toBeNull();
  });

  it('nieznany parametr odpada (takze z e-mailem / telefonem), zdarzenie zostaje', () => {
    expect(
      params('calculator_booking_open', {
        source: 'wycena',
        variant: 'b',
        label: 'cta',
        email: 'jan@firma.pl',
        phone: '+48 600 100 200',
        __proto__: { x: 1 },
      }),
    ).toEqual({ source: 'wycena', variant: 'b' });
  });

  it('wartosc z e-mailem albo telefonem w dozwolonym kluczu -> "(odrzucone)"', () => {
    expect(params('calculator_share', { source: 'jan@firma.pl' })).toEqual({ source: REFUSED });
    expect(params('calculator_share', { method: '600100200' })).toEqual({ method: REFUSED });
  });

  it('wartosc spoza listy -> "(odrzucone)", z listy przechodzi (blizniak)', () => {
    expect(params('calculator_share', { method: 'sms' })).toEqual({ method: REFUSED });
    expect(params('calculator_share', { method: 'native' })).toEqual({ method: 'native' });
  });

  it('typ niezgodny: tekst zamiast liczby i liczba zamiast tekstu -> "(odrzucone)"', () => {
    expect(params('calculator_preview', { answered_count: '5' })).toEqual({
      answered_count: REFUSED,
    });
    expect(params('calculator_preview', { source: 5 })).toEqual({ source: REFUSED });
    expect(params('calculator_preview', { source: 'wycena', answered_count: 5 })).toEqual({
      source: 'wycena',
      answered_count: 5,
    });
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
