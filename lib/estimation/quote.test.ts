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
  costItemTypes: [],
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
    // D23 (NOWA formuła, engine 1.1/1.2): widoczne-nieodpowiedziane liczą jak „nie wiem".
    //   Tu wszystkie 3 pytania widoczne; odpowiedziane project_goal + deadline_hard (2),
    //   sensitive_data = „nie wiem" (1 unknown). unknowns=[sensitive_data] → 100 − 8×1 = 92.
    //   kompletność 2/3 ≈ 0.67 ≥ 0.60 → NIE belowCompleteness, band zielony.
    expect(r.confidence.score).toBe(92);
    expect(r.confidence.band).toBe('green');
    expect(r.confidence.belowCompleteness).toBe(false);
  });

  it('S2: konfigurator bez spisanej macierzy → kara Confidence (nie da się mieć 100% pewności)', () => {
    // Walidacja rynkowa S2: brak macierzy zależności opcji nie robił NIC — projekt konfiguratora
    // z nieokreślonym zakresem mógł pokazać 100% pewności, gdy klient odpowiedział na resztę.
    // Ręcznie: 2 pytania widoczne, oba odpowiedziane → 0 kar za niewiadome;
    //          config_matrix=false → −15 (wartość wprost z docs/05) ⇒ 85.
    const libCfg: LibraryData = {
      ...LIB,
      questions: [
        { code: 'modules', unknownWeight: 1, visibleIf: null, label: 'Moduły?' },
        {
          code: 'config_matrix',
          unknownWeight: 1,
          visibleIf: '{"q":"modules","op":"contains","val":"configurator_options"}',
          label: 'Macierz zależności?',
        },
      ],
      modules: [
        {
          code: 'configurator_options',
          name: 'Konfigurator',
          hoursMin: 32,
          hoursMax: 80,
          risk: 'low',
        },
      ],
    };
    const bez = computeQuote({
      answers: { modules: ['configurator_options'], config_matrix: false },
      library: libCfg,
    });
    expect(bez.confidence.score).toBe(85); // 100 − 15 (docs/05)
    expect(bez.confidence.breakdown.map((b) => b.reason)).toContain(
      'Konfigurator bez spisanej macierzy zależności',
    );

    // Kontrola: macierz spisana → brak kary (100).
    const zMacierza = computeQuote({
      answers: { modules: ['configurator_options'], config_matrix: true },
      library: libCfg,
    });
    expect(zMacierza.confidence.score).toBe(100);
  });

  it('D27: odpowiedź na pytanie NIEWIDOCZNE nie istnieje dla obliczeń (payments: sklep → portal)', () => {
    // Scenariusz z retro: prowadzący odpowiada „payments=[stripe]" przy celu SKLEP, potem zmienia
    // cel na PORTAL TREŚCI. Pytanie znika z wizarda → jego odpowiedź NIE MOŻE dalej wyceniać
    // integracji (wcześniej zostawała w answers i po cichu wchodziła do wyceny).
    const libPay: LibraryData = {
      ...LIB,
      integrations: [
        {
          code: 'stripe',
          name: 'Stripe',
          platformMin: 8,
          platformMax: 16,
          customMin: 16,
          customMax: 30,
          risk: 'low',
        },
      ],
      questions: [
        { code: 'project_goal', unknownWeight: 1, visibleIf: null, label: 'Cel?' },
        {
          code: 'payments',
          unknownWeight: 1,
          visibleIf: '{"q":"project_goal","op":"in","val":["sklep","b2b"]}',
          label: 'Płatności?',
        },
      ],
    };
    const answersPay: Answers = { project_goal: 'sklep', payments: ['stripe'] };

    // SKLEP → pytanie widoczne → integracja wchodzi
    const shop = computeQuote({ answers: answersPay, library: libPay });
    expect(shop.activeIntegrations).toContain('stripe');
    expect(shop.items.some((i) => i.type === 'integration' && i.code === 'stripe')).toBe(true);

    // PORTAL → pytanie ukryte → ta sama (nieusunięta) odpowiedź NIE liczy się
    const portal = computeQuote({
      answers: { ...answersPay, project_goal: 'portal_tresci' },
      library: libPay,
    });
    expect(portal.activeIntegrations).not.toContain('stripe');
    expect(portal.items.some((i) => i.type === 'integration')).toBe(false);
  });

  it('D27: wartość multiselecta spoza biblioteki nie istnieje — 0 kar (konfigurator: sklep → portal)', () => {
    // Scenariusz z retro #2: przy celu SKLEP zaznaczono konfigurator; po przełączeniu na PORTAL
    // moduł wypada z biblioteki (filtr celu, D24). Jego kod ZOSTAJE w answers.modules, więc
    // pytania konfiguratorowe (visible_if: modules contains configurator_options) dalej się
    // pokazywały i karały Confidence −36, mimo że moduł nigdzie nie był wyceniany.
    const libCfg: LibraryData = {
      ...LIB,
      // biblioteka JUŻ przefiltrowana per cel: konfiguratora tu nie ma
      modules: [{ code: 'blog_kb', name: 'Blog', hoursMin: 8, hoursMax: 24, risk: 'low' }],
      questions: [
        { code: 'project_goal', unknownWeight: 1, visibleIf: null, label: 'Cel?' },
        { code: 'modules', unknownWeight: 1, visibleIf: null, label: 'Moduły?' },
        {
          code: 'config_matrix',
          unknownWeight: 1.5,
          visibleIf: '{"q":"modules","op":"contains","val":"configurator_options"}',
          label: 'Macierz zależności opcji?',
        },
        {
          code: 'config_output',
          unknownWeight: 1,
          visibleIf: '{"q":"modules","op":"contains","val":"configurator_options"}',
          label: 'Co z konfiguracją?',
        },
      ],
    };
    const r2 = computeQuote({
      answers: { project_goal: 'portal_tresci', modules: ['blog_kb', 'configurator_options'] },
      library: libCfg,
    });
    // configurator_options nie istnieje → pytania kaskadowe ukryte → ZERO kar z ich tytułu
    expect(r2.confidence.score).toBe(100);
    expect(r2.confidence.breakdown).toEqual([]);
    // …i nie wisi na liście aktywnych ani w pozycjach
    expect(r2.activeModules).toEqual(['blog_kb']);
    expect(r2.items.map((i) => i.code)).toEqual(['blog_kb']);
  });

  it('D27: kaskada — ukrycie pytania ukrywa też pytania zależne od jego odpowiedzi', () => {
    // sla_value widoczne tylko gdy sla_formal=konkretny; sla_formal widoczne tylko gdy downtime≠nic.
    // Gdy downtime='nic' → sla_formal znika → sla_value też musi zniknąć (punkt stały),
    // mimo że w answers wciąż jest sla_formal='konkretny'.
    const libSla: LibraryData = {
      ...LIB,
      questions: [
        { code: 'downtime', unknownWeight: 1, visibleIf: null, label: 'Przestój?' },
        {
          code: 'sla_formal',
          unknownWeight: 1,
          visibleIf: '{"q":"downtime","op":"neq","val":"nic"}',
          label: 'SLA formalne?',
        },
        {
          code: 'sla_value',
          unknownWeight: 3,
          visibleIf: '{"q":"sla_formal","op":"eq","val":"konkretny"}',
          label: 'Jaki % SLA?',
        },
      ],
    };
    const r2 = computeQuote({
      answers: { downtime: 'nic', sla_formal: 'konkretny', sla_value: 99.9 },
      library: libSla,
    });
    // Widoczne jest tylko `downtime` (odpowiedziane) → zero kar, zero „nie wiem".
    // Gdyby kaskada nie działała, sla_value (waga 3) byłoby liczone jako widoczne.
    expect(r2.confidence.score).toBe(100);
    expect(r2.confidence.breakdown).toEqual([]);
  });

  it('breakdown rozróżnia „nie wiem" od braku odpowiedzi (kara identyczna, powód uczciwy)', () => {
    // sensitive_data = „nie wiem" (jawna deklaracja), project_goal/deadline_hard bez odpowiedzi.
    // Kara każdego: 8 × waga 1 → score 100 − 24 = 76; różni się WYŁĄCZNIE treść powodu.
    const r2 = computeQuote({ answers: { sensitive_data: { unknown: true } }, library: LIB });
    const reasons = r2.confidence.breakdown.map((b) => b.reason);
    expect(reasons).toContain('Odpowiedź „nie wiem": Dane wrażliwe?');
    expect(reasons).toContain('Brak odpowiedzi: Cel projektu?');
    expect(r2.confidence.score).toBe(76);
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

  it('D26 „nie dotyczy" = odpowiedź: ZERO kary Confidence (inaczej niż „nie wiem")', () => {
    // Ręcznie: 3 widoczne pytania. project_goal + deadline_hard odpowiedziane,
    //   sensitive_data = „nie dotyczy" → to ODPOWIEDŹ, więc unknowns = [] → 100 − 0 = 100.
    //   kompletność 3/3 = 1.0 ≥ 0.60 → belowCompleteness = false.
    // Kontrast: ten sam układ z „nie wiem" daje 92 (test wyżej) — różnica 8 = 8 × unknown_weight 1.
    const na = computeQuote({
      answers: {
        project_goal: 'sklep',
        deadline_hard: true,
        sensitive_data: { not_applicable: true },
      },
      library: LIB,
    });
    expect(na.confidence.score).toBe(100);
    expect(na.confidence.belowCompleteness).toBe(false);
    expect(na.confidence.breakdown).toEqual([]); // nic nie obniżyło pewności
  });

  it('scenariusz kontrolny „aplikacja": ukryte pytania sklepowe NIE karzą Confidence (fix2)', () => {
    // Ręcznie: 3 pytania. project_goal (zawsze) + deadline_hard (zawsze) + products_count
    //   z visible_if SHOP. Dla project_goal='aplikacja' products_count jest NIEWIDOCZNE,
    //   więc NIE wchodzi do unknowns ani do kompletności.
    //   widoczne = [project_goal, deadline_hard], oba odpowiedziane → 100 − 0 = 100;
    //   kompletność 2/2 = 1.0 → belowCompleteness = false.
    // Gdyby widoczność nie działała, products_count bez odpowiedzi dałoby 100 − 8×1.5 = 88.
    const libShop: LibraryData = {
      ...LIB,
      questions: [
        { code: 'project_goal', unknownWeight: 1, visibleIf: null, label: 'Cel?' },
        { code: 'deadline_hard', unknownWeight: 1, visibleIf: null, label: 'Deadline?' },
        {
          code: 'products_count',
          unknownWeight: 1.5,
          visibleIf: '{"q":"project_goal","op":"in","val":["sklep","b2b"]}',
          label: 'Ile produktów?',
        },
      ],
    };
    const app = computeQuote({
      answers: { project_goal: 'aplikacja', deadline_hard: false },
      library: libShop,
    });
    expect(app.confidence.score).toBe(100);
    expect(app.confidence.belowCompleteness).toBe(false);

    // Kontrola odwrotna: dla sklepu to samo pytanie JEST widoczne i bez odpowiedzi karze.
    const shop = computeQuote({
      answers: { project_goal: 'sklep', deadline_hard: false },
      library: libShop,
    });
    expect(shop.confidence.score).toBe(88); // 100 − 8 × 1.5
  });

  it('fix1: dojazd z reguły cost_item wyceniony — 150 km → 300 km × 1,15 zł = 345 zł', () => {
    // Ręcznie: km w jedną stronę 150 × 2 (tam i z powrotem) = 300 km; 300 × 1,15 zł = 345 zł.
    // Koszty są POZA godzinami: totals.costs = 345, a widełki godzinowe bez zmian.
    const libTravel = {
      ...LIB,
      rules: [
        {
          id: 90,
          name: 'Warsztaty stacjonarne',
          priority: 0,
          condition: { q: 'workshops', op: 'eq' as const, val: 'stacjonarne' },
          actions: [
            { type: 'cost_item' as const, code: 'travel', qty_from: 'workshops_travel_km' },
          ],
          reasonTemplate: 'Warsztaty u klienta',
        },
      ],
      costItemTypes: [
        { code: 'travel', name: 'Dojazd na spotkanie/warsztat', unit: 'km', unitPrice: 1.15 },
      ],
    };
    const r2 = computeQuote({
      answers: { workshops: 'stacjonarne', workshops_travel_km: 150 },
      library: libTravel,
    });
    const travel = r2.items.find((i) => i.type === 'cost' && i.code === 'travel')!;
    expect(travel).toMatchObject({ qty: 300, unit: 'km', unitPrice: 1.15, amountPln: 345 });
    expect(r2.totals.costs).toBe(345);
  });

  it('fix1: bez km (brak odpowiedzi) → pozycja widoczna z kwotą 0 „do wyceny ręcznej"', () => {
    const libTravel = {
      ...LIB,
      rules: [
        {
          id: 90,
          name: 'Warsztaty',
          priority: 0,
          condition: { q: 'workshops', op: 'eq' as const, val: 'stacjonarne' },
          actions: [
            { type: 'cost_item' as const, code: 'travel', qty_from: 'workshops_travel_km' },
          ],
          reasonTemplate: 'x',
        },
      ],
      costItemTypes: [
        { code: 'travel', name: 'Dojazd na spotkanie/warsztat', unit: 'km', unitPrice: 1.15 },
      ],
    };
    const r2 = computeQuote({ answers: { workshops: 'stacjonarne' }, library: libTravel });
    const travel = r2.items.find((i) => i.type === 'cost')!;
    expect(travel).toMatchObject({ amountPln: 0, note: 'kwota do wyceny ręcznej' });
    expect(r2.totals.costs).toBe(0);
  });

  it('D26 „nie dotyczy" nie spełnia warunku reguły (poza operatorem not_applicable)', () => {
    // Reguła min_level backend_logic→2 wymaga project_goal=sklep. Gdy project_goal = „nie dotyczy",
    // reguła NIE strzela (tak samo jak przy „nie wiem") — mimo że to pełnoprawna odpowiedź.
    // Poziom zostaje na domyślnym archetypu (1), NIE podniesiony przez regułę do 2.
    const na = computeQuote({
      answers: { project_goal: { not_applicable: true } },
      library: LIB,
    });
    const be = na.aspects.find((a) => a.code === 'backend_logic')!;
    expect(be.reasons).toEqual([]); // brak uzasadnienia = reguła nie zadziałała
    expect(be.suggestedLevel).toBe(1); // default archetypu, nie 2 z reguły
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
