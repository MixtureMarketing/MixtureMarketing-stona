import { describe, it, expect } from 'vitest';
import { validateImport, computeImportWarnings } from './libraryPack';
import type { LibraryPackTables } from './libraryPack';

// Walidacja importu (f2c-2b) + DOPIĘCIE WS2: cichy no-op przez plik = ta sama choroba co w edytorze.
//   BŁĄD (blokuje apply): reguła wskazuje kod NIEOBECNY w stanie docelowym (current ⊕ incoming).
//   OSTRZEŻENIE (nie blokuje): żywa reguła wskazuje kod OBECNY, ale is_active=0 (gaszony).

const base = (): LibraryPackTables => ({
  aspects: [{ code: 'frontend', name: 'F', category: 'A', is_active: 1 }],
  levels: [
    { aspect_code: 'frontend', level: 0, name: '0', hours_min: 0, hours_max: 0 },
    { aspect_code: 'frontend', level: 1, name: '1', hours_min: 10, hours_max: 25 },
    { aspect_code: 'frontend', level: 2, name: '2', hours_min: 40, hours_max: 100 },
  ],
  archetypes: [{ code: 'woocommerce', name: 'Woo', integration_mode: 'platform', is_active: 1 }],
  archetype_defaults: [],
  questions: [{ code: 'project_goal', text: 'Cel?', is_active: 1 }],
  rules: [
    {
      id: 1,
      name: 'R suguje wishlist',
      condition_json: '{"q":"project_goal","op":"eq","val":"sklep"}',
      actions_json: '[{"type":"suggest_module","code":"wishlist"}]',
      reason_template: 'x',
      priority: 0,
      is_active: 1,
    },
  ],
  modules: [
    { code: 'wishlist', name: 'Wishlist', hours_min: 8, hours_max: 16, risk: 'low', is_active: 1 },
  ],
  integrations: [],
  multipliers: [],
  cost_item_types: [],
  params: [],
  category_rates: [],
});

describe('validateImport — błędy blokujące', () => {
  it('czysty pełny pack (import samego siebie) → brak błędów', () => {
    const t = base();
    expect(validateImport(t, t)).toEqual([]);
  });

  it('moduł min>max → błąd', () => {
    const inc = base();
    inc.modules = [
      { code: 'wishlist', name: 'W', hours_min: 20, hours_max: 10, risk: 'low', is_active: 1 },
    ];
    expect(validateImport(inc, base()).length).toBeGreaterThan(0);
  });

  it('reguła wskazuje kod NIEOBECNY w stanie docelowym → błąd', () => {
    const inc = base();
    // usuń wishlist z paczki I z bazy docelowej (no-delete nie pomoże, bo nigdzie go nie ma)
    inc.modules = [];
    const cur = base();
    cur.modules = [];
    const errs = validateImport(inc, cur);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs.join(' ')).toMatch(/wishlist/);
  });

  it('moduł OBECNY w bazie (no-delete), pominięty w paczce → reguła NIE jest błędem', () => {
    const inc = base();
    inc.modules = []; // pominięty w imporcie
    // ale w bazie (current) wishlist ISTNIEJE i jest aktywny → przeżywa (no-delete)
    expect(validateImport(inc, base())).toEqual([]);
  });
});

describe('computeImportWarnings — gaszony kod (dopięcie WS2)', () => {
  it('round-trip (import samego siebie) → brak ostrzeżeń', () => {
    const t = base();
    expect(computeImportWarnings(t, t)).toEqual([]);
  });

  it('plik GASI moduł (is_active=0), a żywa reguła go sugeruje → OSTRZEŻENIE (nie błąd)', () => {
    const inc = base();
    inc.modules = [
      { code: 'wishlist', name: 'W', hours_min: 8, hours_max: 16, risk: 'low', is_active: 0 },
    ];
    // błąd? NIE — kod istnieje (is_active=0), więc apply dozwolony
    expect(validateImport(inc, base())).toEqual([]);
    // ostrzeżenie? TAK
    const warns = computeImportWarnings(inc, base());
    expect(warns.length).toBeGreaterThan(0);
    expect(warns.join(' ')).toMatch(/wishlist/);
    expect(warns.join(' ')).toMatch(/regu/i);
  });

  it('reguła NIEAKTYWNA wskazująca gaszony kod → brak ostrzeżenia (martwa reguła nie no-opuje)', () => {
    const inc = base();
    inc.modules = [
      { code: 'wishlist', name: 'W', hours_min: 8, hours_max: 16, risk: 'low', is_active: 0 },
    ];
    inc.rules = inc.rules.map((r) => ({ ...r, is_active: 0 }));
    expect(computeImportWarnings(inc, base())).toEqual([]);
  });
});
