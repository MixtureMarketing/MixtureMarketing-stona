import { describe, it, expect } from 'vitest';
import { buildLibraryData, type RawLibrary } from './toLibraryData';
import { computeQuote } from './quote';
import type { Answers, ValidationOverrides } from './types';

// Parytet UI↔serwer (f1c #2) + snapshot-first (f1c #3), na poziomie CZYSTEGO silnika.
// Obie ścieżki (podgląd w UI, finalize na serwerze) używają buildLibraryData + computeQuote —
// ten sam wynik z konstrukcji. Test dowodzi to na PEŁNEJ wycenie: odpowiedzi + „nie wiem" +
// overrides + odznaczona sugestia + moduł + koszt.

const rawLib = (): RawLibrary => ({
  aspects: [
    { code: 'frontend', name: 'Frontend', category: 'A', description: null },
    { code: 'qa', name: 'QA', category: 'G', description: null },
  ],
  levels: [
    { aspect_code: 'frontend', level: 2, hours_min: 40, hours_max: 100 },
    { aspect_code: 'frontend', level: 4, hours_min: 200, hours_max: 300 },
    { aspect_code: 'qa', level: 2, hours_min: 20, hours_max: 40 },
  ],
  archetypes: [
    { code: 'woocommerce', name: 'WooCommerce', description: null, integration_mode: 'platform' },
  ],
  archetypeDefaults: [
    { archetype_code: 'woocommerce', aspect_code: 'frontend', default_level: 2, is_locked: 0 },
    { archetype_code: 'woocommerce', aspect_code: 'qa', default_level: 2, is_locked: 0 },
  ],
  questions: [
    { code: 'sensitive_data', text: 'Dane wrażliwe?', unknown_weight: 1, visible_if_json: null },
    { code: 'deadline_hard', text: 'Deadline?', unknown_weight: 1, visible_if_json: null },
  ],
  rules: [
    {
      id: 1,
      name: 'wishlist',
      condition_json: '{"q":"wants_wishlist","op":"eq","val":true}',
      actions_json: '[{"type":"suggest_module","code":"wishlist"}]',
      reason_template: 'x',
      priority: 0,
    },
    {
      id: 2,
      name: 'newtech',
      condition_json: '{"q":"deadline_hard","op":"eq","val":true}',
      actions_json: '[{"type":"multiplier","code":"hard_deadline"}]',
      reason_template: 'x',
      priority: 0,
    },
  ],
  modules: [
    {
      code: 'wishlist',
      name: 'Wishlist',
      hours_min: 8,
      hours_max: 16,
      risk: 'low',
      archetypes_json: null,
      goals_json: '["sklep","b2b"]', // moduł sklepowy — poza sklepem wypada z wyceny (D24)
    },
  ],
  integrations: [
    {
      code: 'inpost',
      name: 'InPost',
      hours_platform_min: 6,
      hours_platform_max: 12,
      hours_custom_min: 16,
      hours_custom_max: 30,
      risk: 'medium',
    },
  ],
  multipliers: [{ code: 'hard_deadline', name: 'Deadline', value: 0.1 }],
  params: [
    { key: 'hourly_rate', value: '50' },
    { key: 'buffer', value: '0.10' },
    { key: 'multiplier_cap', value: '0.40' },
    { key: 'offer_low_k', value: '0.20' },
    { key: 'offer_high_k', value: '0.30' },
    { key: 'rounding_pln', value: '100' },
    { key: 'confidence_completeness', value: '0.60' },
  ],
});

// Pełna wycena: odpowiedzi + „nie wiem" + moduł (wants_wishlist) + integracja + mnożnik (deadline).
const answers: Answers = {
  archetype: 'woocommerce',
  project_goal: 'sklep', // cel — współfiltruje checklistę modułów (D24)
  sensitive_data: false,
  deadline_hard: true, // → mnożnik hard_deadline
  wants_wishlist: true, // → sugeruje moduł wishlist
  shipping: ['inpost'], // → integracja
  // brak odpowiedzi na nic więcej; „nie wiem" poniżej
};
/** Cel czytany z odpowiedzi — DOKŁADNIE tak samo w UI (useQuoteState) i na serwerze (finalize). */
const goalOf = (a: Answers) => (typeof a.project_goal === 'string' ? a.project_goal : undefined);
const overrides: ValidationOverrides = {
  chosenLevels: { frontend: 4 }, // zmiana poziomu 2→4
  overrideHours: {},
  levelReasons: { frontend: 'Klient chce zaawansowany front' }, // powód wymagany
  disabledModules: [], // wishlist zostaje
  disabledIntegrations: [],
  disabledMultipliers: [],
  extraCostItems: [{ code: 'travel', name: 'Dojazd', amountPln: 400 }],
  costAmounts: {}, // koszt
};

describe('Parytet UI↔serwer (f1c #2): identyczny input ⇒ identyczny output', () => {
  it('pełna wycena — dwie ścieżki (ten sam builder + computeQuote) dają identyczne totals', () => {
    // Obie ścieżki wołają buildLibraryData z tymi samymi argumentami (archetyp + cel z odpowiedzi).
    const libA = buildLibraryData(rawLib(), 'woocommerce', goalOf(answers)); // „UI"
    const libB = buildLibraryData(rawLib(), 'woocommerce', goalOf(answers)); // „serwer"
    const a = computeQuote({ answers, library: libA, overrides });
    const b = computeQuote({ answers, library: libB, overrides });
    expect(b.totals).toEqual(a.totals);
    expect(b.confidence).toEqual(a.confidence);
    expect(b.items).toEqual(a.items);
    // wycena faktycznie „pełna": moduł + integracja + koszt + mnożnik obecne
    expect(a.items.some((i) => i.type === 'module' && i.code === 'wishlist')).toBe(true);
    expect(a.items.some((i) => i.type === 'integration' && i.code === 'inpost')).toBe(true);
    expect(a.items.some((i) => i.type === 'cost')).toBe(true);
    expect(a.activeMultipliers.some((m) => m.code === 'hard_deadline')).toBe(true);
  });

  it('D24: filtr archetyp ∩ cel działa IDENTYCZNIE na obu ścieżkach (brak dryfu UI↔serwer)', () => {
    // Cel „aplikacja": moduł sklepowy (goals=["sklep","b2b"]) wypada — mimo że reguła go sugeruje
    // (wants_wishlist=true). Gdyby serwer nie dostał celu, finalize wyceniłby moduł, którego
    // użytkownik NIE widział w podglądzie → dryf. Tu obie ścieżki liczą tak samo.
    const appAnswers: Answers = { ...answers, project_goal: 'aplikacja' };
    const libUi = buildLibraryData(rawLib(), 'woocommerce', goalOf(appAnswers));
    const libServer = buildLibraryData(rawLib(), 'woocommerce', goalOf(appAnswers));
    const ui = computeQuote({ answers: appAnswers, library: libUi, overrides });
    const server = computeQuote({ answers: appAnswers, library: libServer, overrides });

    expect(server.totals).toEqual(ui.totals);
    expect(server.items).toEqual(ui.items);
    // moduł sklepowy nie wchodzi do wyceny ani nie wisi na liście aktywnych jako goły kod
    expect(ui.items.some((i) => i.type === 'module' && i.code === 'wishlist')).toBe(false);
    expect(ui.activeModules).not.toContain('wishlist');
    // …a dla celu „sklep" ten sam input daje moduł w wycenie (kontrola odwrotna)
    const shopLib = buildLibraryData(rawLib(), 'woocommerce', 'sklep');
    const shop = computeQuote({ answers, library: shopLib, overrides });
    expect(shop.items.some((i) => i.type === 'module' && i.code === 'wishlist')).toBe(true);
  });
});

describe('Snapshot-first (f1c #3): edycja biblioteki po finalize nie rusza zapisanej wyceny', () => {
  it('zmiana widełek poziomu → nowa wycena liczy inaczej; snapshot totals bez zmian', () => {
    const lib1 = buildLibraryData(rawLib(), 'woocommerce');
    const finalized = computeQuote({ answers, library: lib1, overrides });
    // „Snapshot" = zserializowany wynik (jak totals_json w D1).
    const totalsJson = JSON.stringify(finalized.totals);

    // Redakcja biblioteki: frontend poz. 4 200–300 → 500–600.
    const edited = rawLib();
    const l4 = edited.levels.find((l) => l.aspect_code === 'frontend' && l.level === 4)!;
    l4.hours_min = 500;
    l4.hours_max = 600;
    const lib2 = buildLibraryData(edited, 'woocommerce');
    const newQuote = computeQuote({ answers, library: lib2, overrides });

    // Nowa wycena liczy PO NOWEMU…
    expect(newQuote.totals.base.hoursMax).toBeGreaterThan(finalized.totals.base.hoursMax);
    // …a snapshot sfinalizowanej wyceny jest NIENARUSZONY (wartość niezależna od biblioteki).
    expect(JSON.parse(totalsJson)).toEqual(finalized.totals);
    // base = frontend poz.4 (200–300) + qa poz.2 (20–40) = 340; po edycji byłoby 640.
    expect(JSON.parse(totalsJson).base.hoursMax).toBe(340);
  });
});
