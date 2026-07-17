import { describe, it, expect } from 'vitest';
import { toPublicOffer, pickPublicArchetype } from './publicOffer';
import type { Totals, RuleEvaluation } from './types';

// Transform publiczny (kontrakt §4). Przypadki kontrolne policzone RĘCZNIE — test weryfikuje
// matematykę, nie implementację.

const totals = (min: number, max: number): Totals => ({ offer: { min, max } }) as unknown as Totals;

describe('toPublicOffer — poszerzenie + zaokrąglenie', () => {
  it('przypadek kontrolny z kontraktu: {32400,46000} ±15% → round 500 → {27500,53000}', () => {
    // wMin = 32400 × 0.85 = 27540 → floor(27540/500)=55 → 27500
    // wMax = 46000 × 1.15 = 52900 → ceil(52900/500)=106 → 53000
    expect(toPublicOffer(totals(32400, 46000), { widenK: 0.15, roundPln: 500 })).toEqual({
      min: 27500,
      max: 53000,
    });
  });

  it('min zaokrągla w DÓŁ, max w GÓRĘ', () => {
    // wMin = 10000 × 0.9 = 9000 → 9000; wMax = 20000 × 1.1 = 22000 → 22000 (oba wielokrotności 500)
    expect(toPublicOffer(totals(10000, 20000), { widenK: 0.1, roundPln: 500 })).toEqual({
      min: 9000,
      max: 22000,
    });
    // wartości niebędące wielokrotnością: {12345, 23456} ±0 → floor/ceil do 100
    // min floor(12345/100)*100=12300 ; max ceil(23456/100)*100=23500
    expect(toPublicOffer(totals(12345, 23456), { widenK: 0, roundPln: 100 })).toEqual({
      min: 12300,
      max: 23500,
    });
  });

  it('roundPln ≤ 0 → brak zaokrąglania do wielokrotności (krok 1, floor/ceil do liczby całkowitej)', () => {
    // wMin = 1000 × 0.9 = 900 ; wMax = 2000 × 1.1 = 2200
    expect(toPublicOffer(totals(1000, 2000), { widenK: 0.1, roundPln: 0 })).toEqual({
      min: 900,
      max: 2200,
    });
  });

  it('widenK 0 + wielokrotności kroku → identyczność (idempotencja zaokrąglenia)', () => {
    expect(toPublicOffer(totals(15000, 25000), { widenK: 0, roundPln: 500 })).toEqual({
      min: 15000,
      max: 25000,
    });
  });
});

const rec = (
  arr: RuleEvaluation['recommendedArchetypes'],
): RuleEvaluation['recommendedArchetypes'] => arr;
const FALLBACK = {
  sklep: 'woocommerce',
  wizytowka: 'wordpress',
  portal_tresci: 'wordpress',
  aplikacja: 'laravel',
  b2b: 'laravel',
};

describe('pickPublicArchetype — top-pick reguł, fallback per-cel, globalny', () => {
  it('primary: top-pick z recommend_archetype (element [0], deterministyczny)', () => {
    const r = pickPublicArchetype(
      rec([
        { code: 'medusa', reason: 'Headless-first' },
        { code: 'woocommerce', reason: 'Standardowy sklep' },
      ]),
      'sklep',
      FALLBACK,
      'laravel',
    );
    expect(r.code).toBe('medusa');
    expect(r.reason).toContain('Headless-first');
  });

  it('fallback: brak rekomendacji + cel w mapie → archetyp z mapy', () => {
    const r = pickPublicArchetype(rec([]), 'sklep', FALLBACK, 'laravel');
    expect(r.code).toBe('woocommerce');
    expect(r.reason).toContain('sklep');
  });

  it('fallback globalny: brak rekomendacji + cel spoza mapy → globalny', () => {
    expect(pickPublicArchetype(rec([]), 'inne', FALLBACK, 'laravel').code).toBe('laravel');
    expect(pickPublicArchetype(rec([]), undefined, FALLBACK, 'laravel').code).toBe('laravel');
  });
});
