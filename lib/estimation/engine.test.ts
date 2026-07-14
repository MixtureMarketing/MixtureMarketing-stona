// TDD: testy napisane PRZED implementacją engine.ts (ZASADY-PRACY §1).
// Przypadki kontrolne agregacji policzone RĘCZNIE w komentarzach — test weryfikuje matematykę,
// nie implementację. Pokrycie wymagane przez docs/07 (F0) + docs/03 (inwarianty) + SKILL.md.
import { describe, it, expect } from 'vitest';
import {
  ENGINE_VERSION,
  matchCondition,
  evaluateRules,
  aggregate,
  computeConfidence,
  validateForFinalize,
  roundUpTo,
} from './engine';
import type { Answers, Rule, ArchetypeDefault, AggregateInput, EngineParams } from './types';

const PARAMS: EngineParams = {
  hourlyRate: 50,
  multiplierCap: 0.4,
  buffer: 0.1,
  offerLowK: 0.2,
  offerHighK: 0.3,
  roundingPln: 100,
  confidenceGreen: 80,
  confidenceYellow: 60,
};

// ─────────────────────────────────────────────────────────────────────────────
describe('matchCondition — operatory (docs/05)', () => {
  const a: Answers = {
    downtime: 'critical_247',
    users: 500,
    langs: 2,
    variants: 'masowe',
    stock: ['feedy', 'erp'],
    ads: ['google'],
    dunno: { unknown: true },
    flag: true,
  };

  it('eq / neq', () => {
    expect(matchCondition({ q: 'downtime', op: 'eq', val: 'critical_247' }, a)).toBe(true);
    expect(matchCondition({ q: 'downtime', op: 'eq', val: 'nic' }, a)).toBe(false);
    expect(matchCondition({ q: 'downtime', op: 'neq', val: 'nic' }, a)).toBe(true);
  });

  it('gt / gte / lt / lte (liczby)', () => {
    expect(matchCondition({ q: 'users', op: 'gte', val: 500 }, a)).toBe(true);
    expect(matchCondition({ q: 'users', op: 'gt', val: 500 }, a)).toBe(false);
    expect(matchCondition({ q: 'users', op: 'lt', val: 1000 }, a)).toBe(true);
    expect(matchCondition({ q: 'langs', op: 'lte', val: 2 }, a)).toBe(true);
  });

  it('in / contains', () => {
    expect(matchCondition({ q: 'variants', op: 'in', val: ['masowe', 'konfigurowalne'] }, a)).toBe(
      true,
    );
    expect(matchCondition({ q: 'variants', op: 'in', val: ['proste'] }, a)).toBe(false);
    expect(matchCondition({ q: 'stock', op: 'contains', val: 'feedy' }, a)).toBe(true);
    expect(matchCondition({ q: 'stock', op: 'contains', val: 'dropshipping' }, a)).toBe(false);
  });

  it('answered / unknown', () => {
    expect(matchCondition({ q: 'ads', op: 'answered' }, a)).toBe(true);
    expect(matchCondition({ q: 'dunno', op: 'answered' }, a)).toBe(false);
    expect(matchCondition({ q: 'dunno', op: 'unknown' }, a)).toBe(true);
    expect(matchCondition({ q: 'downtime', op: 'unknown' }, a)).toBe(false);
  });

  it('„nie wiem" nie spełnia żadnego operatora poza unknown', () => {
    expect(matchCondition({ q: 'dunno', op: 'eq', val: 'critical_247' }, a)).toBe(false);
    expect(matchCondition({ q: 'dunno', op: 'neq', val: 'x' }, a)).toBe(false);
    expect(matchCondition({ q: 'dunno', op: 'gte', val: 0 }, a)).toBe(false);
    expect(matchCondition({ q: 'dunno', op: 'answered' }, a)).toBe(false);
  });

  it('brak odpowiedzi = fałsz dla wszystkiego, w tym unknown', () => {
    expect(matchCondition({ q: 'missing', op: 'eq', val: 'x' }, a)).toBe(false);
    expect(matchCondition({ q: 'missing', op: 'unknown' }, a)).toBe(false);
    expect(matchCondition({ q: 'missing', op: 'answered' }, a)).toBe(false);
  });

  it('drzewo all / any', () => {
    expect(
      matchCondition(
        {
          all: [
            { q: 'downtime', op: 'eq', val: 'critical_247' },
            { q: 'users', op: 'gte', val: 500 },
          ],
        },
        a,
      ),
    ).toBe(true);
    expect(
      matchCondition(
        {
          all: [
            { q: 'downtime', op: 'eq', val: 'critical_247' },
            { q: 'users', op: 'gt', val: 500 },
          ],
        },
        a,
      ),
    ).toBe(false);
    expect(
      matchCondition(
        {
          any: [
            { q: 'users', op: 'gt', val: 9999 },
            { q: 'flag', op: 'eq', val: true },
          ],
        },
        a,
      ),
    ).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('evaluateRules — ewaluacja (docs/05)', () => {
  const defaults: ArchetypeDefault[] = [
    { aspect: 'frontend', defaultLevel: 2, isLocked: false },
    { aspect: 'rls', defaultLevel: 0, isLocked: true },
    { aspect: 'seo', defaultLevel: 1, isLocked: false },
  ];
  const known = ['frontend', 'rls', 'seo', 'high_availability', 'observability', 'infrastructure'];

  const rules: Rule[] = [
    {
      id: 1,
      name: 'krytycznosc',
      priority: 10,
      condition: { q: 'downtime', op: 'eq', val: 'critical_247' },
      actions: [
        { type: 'min_level', aspect: 'high_availability', level: 2 },
        { type: 'multiplier', code: 'hard_deadline' },
      ],
      reasonTemplate: 'Krytycznosc przy {users} uzytk.',
    },
    {
      id: 2,
      name: 'seo-up',
      priority: 0,
      condition: { q: 'langs', op: 'gte', val: 3 },
      actions: [{ type: 'min_level', aspect: 'seo', level: 3 }],
      reasonTemplate: 'Wiele jezykow',
    },
  ];

  it('inicjuje poziomy z archetypu (locked → 0, ukryty)', () => {
    const r = evaluateRules({
      answers: {},
      archetypeDefaults: defaults,
      rules: [],
      knownAspectCodes: known,
    });
    expect(r.levels.frontend.level).toBe(2);
    expect(r.levels.rls).toMatchObject({ level: 0, locked: true });
    expect(r.levels.seo.level).toBe(1);
  });

  it('min_level podnosi i renderuje uzasadnienie', () => {
    const r = evaluateRules({
      answers: { downtime: 'critical_247', users: 500, langs: 4 },
      archetypeDefaults: defaults,
      rules,
      knownAspectCodes: known,
    });
    expect(r.levels.high_availability.level).toBe(2);
    expect(r.levels.high_availability.reasons[0]).toBe('Krytycznosc przy 500 uzytk.');
    expect(r.levels.seo.level).toBe(3); // podniesione z 1 do 3
    expect(r.multipliers).toContain('hard_deadline');
  });

  it('min_level jest monotoniczny (max) i niezależny od kolejności reguł', () => {
    const twoRaise: Rule[] = [
      {
        id: 1,
        name: 'a',
        priority: 0,
        condition: { q: 'x', op: 'answered' },
        actions: [{ type: 'min_level', aspect: 'seo', level: 2 }],
        reasonTemplate: 'a',
      },
      {
        id: 2,
        name: 'b',
        priority: 5,
        condition: { q: 'x', op: 'answered' },
        actions: [{ type: 'min_level', aspect: 'seo', level: 4 }],
        reasonTemplate: 'b',
      },
    ];
    const forward = evaluateRules({
      answers: { x: 1 },
      archetypeDefaults: defaults,
      rules: twoRaise,
      knownAspectCodes: known,
    });
    const reversed = evaluateRules({
      answers: { x: 1 },
      archetypeDefaults: defaults,
      rules: [...twoRaise].reverse(),
      knownAspectCodes: known,
    });
    expect(forward.levels.seo.level).toBe(4);
    expect(reversed.levels.seo.level).toBe(4); // kolejność bez znaczenia
  });

  it('reguła nie obniża poniżej domyślnego poziomu archetypu', () => {
    const lower: Rule[] = [
      {
        id: 1,
        name: 'x',
        priority: 0,
        condition: { q: 'x', op: 'answered' },
        actions: [{ type: 'min_level', aspect: 'frontend', level: 1 }],
        reasonTemplate: 'x',
      },
    ];
    const r = evaluateRules({
      answers: { x: 1 },
      archetypeDefaults: defaults,
      rules: lower,
      knownAspectCodes: known,
    });
    expect(r.levels.frontend.level).toBe(2); // default 2 > reguła 1
  });

  it('obszar zablokowany ignoruje min_level', () => {
    const onLocked: Rule[] = [
      {
        id: 1,
        name: 'x',
        priority: 0,
        condition: { q: 'x', op: 'answered' },
        actions: [{ type: 'min_level', aspect: 'rls', level: 3 }],
        reasonTemplate: 'x',
      },
    ];
    const r = evaluateRules({
      answers: { x: 1 },
      archetypeDefaults: defaults,
      rules: onLocked,
      knownAspectCodes: known,
    });
    expect(r.levels.rls).toMatchObject({ level: 0, locked: true });
  });

  it('błędny kod obszaru → warning, pominięcie, brak crasha', () => {
    const bad: Rule[] = [
      {
        id: 1,
        name: 'zły',
        priority: 0,
        condition: { q: 'x', op: 'answered' },
        actions: [{ type: 'min_level', aspect: 'nieistnieje', level: 2 }],
        reasonTemplate: 'x',
      },
    ];
    const r = evaluateRules({
      answers: { x: 1 },
      archetypeDefaults: defaults,
      rules: bad,
      knownAspectCodes: known,
    });
    expect(r.levels.nieistnieje).toBeUndefined();
    expect(r.warnings.some((w) => w.includes('nieistnieje'))).toBe(true);
  });

  it('sugestie modułów/integracji/kosztów deduplikowane', () => {
    const sug: Rule[] = [
      {
        id: 1,
        name: 'a',
        priority: 0,
        condition: { q: 'x', op: 'answered' },
        actions: [
          { type: 'suggest_module', code: 'rma' },
          { type: 'suggest_integration', code: 'inpost' },
        ],
        reasonTemplate: 'a',
      },
      {
        id: 2,
        name: 'b',
        priority: 0,
        condition: { q: 'x', op: 'answered' },
        actions: [{ type: 'suggest_module', code: 'rma' }],
        reasonTemplate: 'b',
      },
    ];
    const r = evaluateRules({
      answers: { x: 1 },
      archetypeDefaults: defaults,
      rules: sug,
      knownAspectCodes: known,
    });
    expect(r.suggestedModules).toEqual(['rma']);
    expect(r.suggestedIntegrations).toEqual(['inpost']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('roundUpTo', () => {
  it('zaokrągla w górę do kroku', () => {
    expect(roundUpTo(6340.4, 100)).toBe(6400);
    expect(roundUpTo(9244.4, 100)).toBe(9300);
    expect(roundUpTo(6400, 100)).toBe(6400); // bez zmian gdy na granicy
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('aggregate — kolejność obliczeń (docs/03)', () => {
  // PRZYPADEK KONTROLNY (ręcznie):
  //   Obszary: frontend(A) 40–100, backend_logic(B) 20–40 → baza 60–140.
  //   Itemy: wishlist 8–16, inpost 8–16 → itemy 16–32; afterItems 76–172.
  //   Mnożnik hard_deadline 0.10 (≤ cap) → ×1.10: 83.6–189.2.
  //   Bufor 0.10 → ×1.10: 91.96–208.12.
  //   Cena (stawka 50): P_min 4598, P_max 10406.
  //   Oferta: mid 7502, span 5808; min=ceil(7502−0.2·5808)=ceil(6340.4)→6400;
  //           max=ceil(7502+0.3·5808)=ceil(9244.4)→9300.
  const base: AggregateInput = {
    aspects: [
      { code: 'frontend', category: 'A', hoursMin: 40, hoursMax: 100 },
      { code: 'backend_logic', category: 'B', hoursMin: 20, hoursMax: 40 },
    ],
    items: [
      {
        type: 'module',
        code: 'wishlist',
        name: 'Wishlist',
        hoursMin: 8,
        hoursMax: 16,
        risk: 'low',
      },
      {
        type: 'integration',
        code: 'inpost',
        name: 'InPost',
        hoursMin: 8,
        hoursMax: 16,
        risk: 'low',
      },
    ],
    multipliers: [{ code: 'hard_deadline', value: 0.1 }],
    params: PARAMS,
  };

  it('baza, itemy, mnożnik, bufor, cena, oferta', () => {
    const t = aggregate(base);
    expect(t.base).toMatchObject({ hoursMin: 60, hoursMax: 140 });
    expect(t.afterItems).toMatchObject({ hoursMin: 76, hoursMax: 172 });
    expect(t.multiplierSum).toBeCloseTo(0.1, 10);
    expect(t.afterMultipliers.hoursMin).toBeCloseTo(83.6, 6);
    expect(t.afterBuffer.hoursMin).toBeCloseTo(91.96, 6);
    expect(t.price.min).toBeCloseTo(4598, 6);
    expect(t.price.max).toBeCloseTo(10406, 6);
    expect(t.offer.min).toBe(6400);
    expect(t.offer.max).toBe(9300);
    expect(t.engineVersion).toBe(ENGINE_VERSION);
  });

  it('inwarianty oferty: Oferta_min ≥ P_min oraz Oferta_max ≤ P_max', () => {
    const t = aggregate(base);
    expect(t.offer.min).toBeGreaterThanOrEqual(t.price.min);
    expect(t.offer.max).toBeLessThanOrEqual(t.price.max);
  });

  it('mnożniki sumują się addytywnie i są przycinane do cap (0.40)', () => {
    // 0.15 + 0.15 + 0.15 = 0.45 → cap 0.40
    const t = aggregate({
      ...base,
      multipliers: [
        { code: 'a', value: 0.15 },
        { code: 'b', value: 0.15 },
        { code: 'c', value: 0.15 },
      ],
    });
    expect(t.multiplierSum).toBeCloseTo(0.4, 10);
    // afterItems 76 × 1.40 × 1.10 (bufor) = 117.04
    expect(t.afterBuffer.hoursMin).toBeCloseTo(76 * 1.4 * 1.1, 6);
  });

  it('poziom 0 (obszar 0h) nie wnosi godzin', () => {
    const t = aggregate({
      ...base,
      aspects: [
        { code: 'frontend', category: 'A', hoursMin: 40, hoursMax: 100 },
        { code: 'rls', category: 'C', hoursMin: 0, hoursMax: 0 },
      ],
      items: [],
      multipliers: [],
    });
    expect(t.base).toMatchObject({ hoursMin: 40, hoursMax: 100 });
  });

  it('pozycje kosztowe liczone osobno, bez mnożników i bufora', () => {
    const t = aggregate({
      ...base,
      items: [
        { type: 'cost', code: 'travel', name: 'Dojazd', qty: 800, unitPrice: 1.15 }, // 920
        { type: 'cost', code: 'license', name: 'Licencja', amountPln: 500 },
      ],
      multipliers: [{ code: 'x', value: 0.4 }],
    });
    expect(t.costs).toBeCloseTo(920 + 500, 6);
    // koszty NIE wpływają na godziny/cenę: baza tylko obszary (bez itemów module/integration)
    expect(t.afterItems).toMatchObject({ hoursMin: 60, hoursMax: 140 });
  });

  it('stawki per kategoria nadpisują globalną', () => {
    const t = aggregate({
      aspects: [{ code: 'frontend', category: 'A', hoursMin: 10, hoursMax: 10 }],
      items: [],
      multipliers: [],
      params: PARAMS,
      categoryRates: { A: 100 },
    });
    // 10h × (1) × 1.10 bufor = 11h × 100 zł = 1100
    expect(t.price.min).toBeCloseTo(11 * 100, 6);
  });

  it('poziom 4 „X+" (D22: hours_max = 1.5 × hours_min) przechodzi agregację', () => {
    // PRZYPADEK KONTROLNY: frontend L4 250–375 (250 × 1.5), sam, bufor 0.10, stawka 50.
    //   afterBuffer 275 / 412.5 → cena 13750 / 20625.
    //   oferta: mid 17187.5, span 6875; min=ceil(15812.5)→15900; max=ceil(19250)→19300.
    const t = aggregate({
      aspects: [{ code: 'frontend', category: 'A', hoursMin: 250, hoursMax: 375 }],
      items: [],
      multipliers: [],
      params: PARAMS,
    });
    expect(t.base).toMatchObject({ hoursMin: 250, hoursMax: 375 });
    expect(t.afterBuffer.hoursMax).toBeCloseTo(412.5, 6);
    expect(t.price.min).toBeCloseTo(13750, 6);
    expect(t.price.max).toBeCloseTo(20625, 6);
    expect(t.offer.min).toBe(15900);
    expect(t.offer.max).toBe(19300);
    expect(t.offer.min).toBeGreaterThanOrEqual(t.price.min);
    expect(t.offer.max).toBeLessThanOrEqual(t.price.max);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('computeConfidence (docs/03)', () => {
  const thr = { green: 80, yellow: 60 };

  it('pełna pewność = 100 (zielony)', () => {
    const c = computeConfidence(
      {
        unknowns: [],
        itemRisks: [],
        dataMigrationWithoutSample: false,
        customArchetypeWithoutDiscovery: false,
      },
      thr,
    );
    expect(c.score).toBe(100);
    expect(c.band).toBe('green');
  });

  it('odejmuje 8×waga za „nie wiem", 6/2 za ryzyko, 8 migracja, 6 custom bez discovery', () => {
    // 100 − 8×1 − 8×1.5 − 6 − 2 − 8 − 6 = 100 − 8 − 12 − 6 − 2 − 8 − 6 = 58 (czerwony)
    const c = computeConfidence(
      {
        unknowns: [
          { code: 'a', weight: 1 },
          { code: 'b', weight: 1.5 },
        ],
        itemRisks: ['high', 'medium'],
        dataMigrationWithoutSample: true,
        customArchetypeWithoutDiscovery: true,
      },
      thr,
    );
    expect(c.score).toBe(58);
    expect(c.band).toBe('red');
    expect(c.breakdown.length).toBeGreaterThan(0);
  });

  it('clamp do 0 i progi pasm', () => {
    const zero = computeConfidence(
      {
        unknowns: Array.from({ length: 20 }, (_, i) => ({ code: `q${i}`, weight: 1 })),
        itemRisks: [],
        dataMigrationWithoutSample: false,
        customArchetypeWithoutDiscovery: false,
      },
      thr,
    );
    expect(zero.score).toBe(0);
    const yellow = computeConfidence(
      {
        unknowns: [
          { code: 'a', weight: 1 },
          { code: 'b', weight: 1 },
          { code: 'c', weight: 1 },
        ],
        itemRisks: [],
        dataMigrationWithoutSample: false,
        customArchetypeWithoutDiscovery: false,
      },
      thr,
    );
    expect(yellow.score).toBe(76); // 100 − 24
    expect(yellow.band).toBe('yellow');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('validateForFinalize (docs/03 inwarianty 3–4)', () => {
  it('pusta wycena (0 godzin, brak itemów) → błąd', () => {
    const errs = validateForFinalize({ aspects: [], totalHoursMax: 0 });
    expect(errs.some((e) => e.toLowerCase().includes('pusta'))).toBe(true);
  });

  it('override min > max → błąd', () => {
    const errs = validateForFinalize({
      aspects: [
        {
          code: 'frontend',
          suggestedLevel: 2,
          chosenLevel: 2,
          overrideHoursMin: 50,
          overrideHoursMax: 30,
          overrideReason: 'x',
        },
      ],
      totalHoursMax: 50,
    });
    expect(errs.some((e) => e.includes('frontend'))).toBe(true);
  });

  it('zmiana poziomu bez powodu → błąd; z powodem → ok', () => {
    const bad = validateForFinalize({
      aspects: [{ code: 'seo', suggestedLevel: 1, chosenLevel: 3 }],
      totalHoursMax: 30,
    });
    expect(bad.some((e) => e.includes('seo'))).toBe(true);
    const ok = validateForFinalize({
      aspects: [
        { code: 'seo', suggestedLevel: 1, chosenLevel: 3, overrideReason: 'klient wymaga' },
      ],
      totalHoursMax: 30,
    });
    expect(ok).toEqual([]);
  });

  it('override godzin bez powodu → błąd', () => {
    const errs = validateForFinalize({
      aspects: [
        {
          code: 'frontend',
          suggestedLevel: 2,
          chosenLevel: 2,
          overrideHoursMin: 30,
          overrideHoursMax: 60,
        },
      ],
      totalHoursMax: 60,
    });
    expect(errs.some((e) => e.includes('frontend'))).toBe(true);
  });

  it('poprawna wycena → brak błędów', () => {
    const errs = validateForFinalize({
      aspects: [{ code: 'frontend', suggestedLevel: 2, chosenLevel: 2 }],
      totalHoursMax: 100,
    });
    expect(errs).toEqual([]);
  });
});
