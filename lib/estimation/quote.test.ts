// TDD: test PRZED implementacją computeQuote (pełny pipeline podglądu/finalize).
// Przypadek kontrolny liczony RĘCZNIE. Ten sam kod zasili UI (f1b) i serwer finalize (f1c).
import { describe, it, expect } from 'vitest';
import { computeQuote } from './quote';
import type { Answers, LibraryData, EngineParams, Rule } from './types';

const PARAMS: EngineParams = {
  hourlyRate: 50,
  multiplierCap: 0.4,
  buffer: 0.1,
  offerLowK: 0.2,
  offerHighK: 0.3,
  roundingPln: 100,
  confidenceGreen: 80,
  confidenceYellow: 60,
  completenessThreshold: 0.6,
};

const rules: Rule[] = [
  {
    id: 1,
    name: 'Sklep',
    priority: 5,
    condition: { q: 'project_goal', op: 'eq', val: 'sklep' },
    actions: [{ type: 'min_level', aspect: 'backend_logic', level: 2 }],
    reasonTemplate: 'Sklep wymaga logiki.',
  },
  {
    id: 2,
    name: 'Dane wrazliwe',
    priority: 0,
    condition: { q: 'sensitive_data', op: 'eq', val: true },
    actions: [{ type: 'min_level', aspect: 'rls', level: 2 }], // rls locked → ignorowane
    reasonTemplate: 'x',
  },
  {
    id: 3,
    name: 'Deadline',
    priority: 0,
    condition: { q: 'deadline_hard', op: 'eq', val: true },
    actions: [{ type: 'multiplier', code: 'hard_deadline' }],
    reasonTemplate: 'x',
  },
];

const LIB: LibraryData = {
  aspects: [
    { code: 'frontend', category: 'A', name: 'Frontend' },
    { code: 'backend_logic', category: 'B', name: 'Backend' },
    { code: 'rls', category: 'C', name: 'RLS' },
  ],
  levels: [
    { aspectCode: 'frontend', level: 1, hoursMin: 10, hoursMax: 25 },
    { aspectCode: 'frontend', level: 2, hoursMin: 40, hoursMax: 100 },
    { aspectCode: 'backend_logic', level: 1, hoursMin: 20, hoursMax: 40 },
    { aspectCode: 'backend_logic', level: 2, hoursMin: 60, hoursMax: 120 },
    { aspectCode: 'rls', level: 0, hoursMin: 0, hoursMax: 0 },
    { aspectCode: 'rls', level: 2, hoursMin: 16, hoursMax: 32 },
  ],
  archetypeDefaults: [
    { aspect: 'frontend', defaultLevel: 2, isLocked: false },
    { aspect: 'backend_logic', defaultLevel: 1, isLocked: false },
    { aspect: 'rls', defaultLevel: 0, isLocked: true },
  ],
  rules,
  modules: [],
  integrations: [],
  multipliers: [{ code: 'hard_deadline', name: 'Deadline', value: 0.1 }],
  questions: [
    { code: 'sensitive_data', unknownWeight: 1, visibleIf: null, label: 'Dane wrażliwe?' },
    { code: 'deadline_hard', unknownWeight: 1, visibleIf: null, label: 'Sztywny deadline?' },
    { code: 'project_goal', unknownWeight: 1, visibleIf: null, label: 'Cel projektu?' },
  ],
  params: PARAMS,
  integrationMode: 'platform',
};

// PRZYPADEK KONTROLNY:
//   frontend L2 40–100, backend_logic max(default1, reguła2)=L2 60–120, rls locked → wykluczony.
//   baza 100–220. mnożnik hard_deadline 0.10 → ×1.10; bufor 0.10 → ×1.10 (factor 1.21).
//   afterBuffer 121–266.2 → cena 6050–13310.
//   oferta: mid 9680, span 7260; min=ceil(8228)→8300; max=ceil(11858)→11900.
//   Confidence: sensitive_data „nie wiem" → 100 − 8×1 = 92 (zielony).
const answers: Answers = {
  project_goal: 'sklep',
  deadline_hard: true,
  sensitive_data: { unknown: true },
};

describe('computeQuote — pipeline podglądu (docs/03)', () => {
  const r = computeQuote({ answers, library: LIB });

  it('obszary: suggested/chosen level + godziny, locked wykluczony', () => {
    const codes = r.aspects.map((a) => a.code);
    expect(codes).toEqual(['frontend', 'backend_logic']); // rls (locked) poza listą
    const be = r.aspects.find((a) => a.code === 'backend_logic')!;
    expect(be.suggestedLevel).toBe(2);
    expect(be.chosenLevel).toBe(2);
    expect(be).toMatchObject({ hoursMin: 60, hoursMax: 120 });
    expect(be.reasons).toContain('Sklep wymaga logiki.');
  });

  it('mnożniki i totals policzone przez agregację', () => {
    expect(r.activeMultipliers).toEqual([{ code: 'hard_deadline', name: 'Deadline', value: 0.1 }]);
    expect(r.totals.base).toMatchObject({ hoursMin: 100, hoursMax: 220 });
    expect(r.totals.price.min).toBeCloseTo(6050, 6);
    expect(r.totals.price.max).toBeCloseTo(13310, 6);
    expect(r.totals.offer).toEqual({ min: 8300, max: 11900 });
  });

  it('Confidence D23: 3 widoczne pytania, 2 odpowiedziane, sensitive_data „nie wiem"', () => {
    // D23 (NOWA formuła, engine 1.1): widoczne-nieodpowiedziane liczą jak „nie wiem".
    //   Tu wszystkie 3 pytania widoczne; odpowiedziane project_goal + deadline_hard (2),
    //   sensitive_data = „nie wiem" (1 unknown). unknowns=[sensitive_data] → 100 − 8×1 = 92.
    //   kompletność 2/3 ≈ 0.67 ≥ 0.60 → NIE belowCompleteness, band zielony.
    expect(r.confidence.score).toBe(92);
    expect(r.confidence.band).toBe('green');
    expect(r.confidence.belowCompleteness).toBe(false);
  });

  it('D23 pusty formularz → niski Confidence + belowCompleteness', () => {
    // 3 widoczne pytania, 0 odpowiedzianych → 3 unknown → 100 − 3×8 = 76; kompletność 0 < 0.60.
    const empty = computeQuote({ answers: {}, library: LIB });
    expect(empty.confidence.score).toBe(76);
    expect(empty.confidence.belowCompleteness).toBe(true);
  });

  it('D23 komplet bez „nie wiem" → 100, nie belowCompleteness', () => {
    const full = computeQuote({
      answers: { project_goal: 'sklep', deadline_hard: true, sensitive_data: false },
      library: LIB,
    });
    expect(full.confidence.score).toBe(100);
    expect(full.confidence.belowCompleteness).toBe(false);
  });

  it('override poziomu (chosen < suggested) przelicza godziny i totals', () => {
    const r2 = computeQuote({
      answers,
      library: LIB,
      overrides: {
        chosenLevels: { backend_logic: 1 },
        levelReasons: { backend_logic: 'klient tnie zakres' },
      },
    });
    const be = r2.aspects.find((a) => a.code === 'backend_logic')!;
    expect(be.chosenLevel).toBe(1);
    expect(be).toMatchObject({ hoursMin: 20, hoursMax: 40 });
    // baza teraz 40–100 (frontend) + 20–40 (backend L1) = 60–140 < poprzednio 100–220
    expect(r2.totals.base).toMatchObject({ hoursMin: 60, hoursMax: 140 });
  });

  it('odznaczenie mnożnika zeruje M', () => {
    const r3 = computeQuote({
      answers,
      library: LIB,
      overrides: { disabledMultipliers: ['hard_deadline'] },
    });
    expect(r3.activeMultipliers).toEqual([]);
    expect(r3.totals.multiplierSum).toBe(0);
  });
});
