import { describe, it, expect } from 'vitest';
import {
  buildExport,
  computeLibraryDiff,
  SCHEMA_VERSION,
  type LibraryPackTables,
} from './libraryPack';

// Eksport/import biblioteki (f2c-2b). Kryterium domykające F2: round-trip export→diff→pusto.
// Klucze dopasowania: code / (aspect_code,level) / (archetype_code,aspect_code) / key / id (reguły).

const TABLES: LibraryPackTables = {
  aspects: [
    { code: 'frontend', name: 'Frontend', category: 'A', client_name: null, is_active: 1 },
    { code: 'apis', name: 'API', category: 'B', client_name: null, is_active: 1 },
  ],
  levels: [
    { aspect_code: 'frontend', level: 1, name: 'Podst', hours_min: 10, hours_max: 25 },
    { aspect_code: 'frontend', level: 2, name: 'Std', hours_min: 40, hours_max: 100 },
  ],
  archetypes: [{ code: 'woocommerce', name: 'Woo', integration_mode: 'platform', is_active: 1 }],
  archetype_defaults: [
    { archetype_code: 'woocommerce', aspect_code: 'frontend', default_level: 2, is_locked: 0 },
  ],
  questions: [{ code: 'project_goal', text: 'Cel?', is_active: 1 }],
  rules: [
    {
      id: 1,
      name: 'R1',
      condition_json: '{"q":"project_goal","op":"eq","val":"sklep"}',
      actions_json: '[{"type":"min_level","aspect":"frontend","level":2}]',
      reason_template: 'x',
      priority: 0,
      is_active: 1,
    },
  ],
  modules: [
    { code: 'wishlist', name: 'Wishlist', hours_min: 8, hours_max: 16, risk: 'low', is_active: 1 },
  ],
  integrations: [
    {
      code: 'inpost',
      name: 'InPost',
      category: 'shipping',
      hours_custom_min: 16,
      hours_custom_max: 30,
      risk: 'low',
      is_active: 1,
    },
  ],
  multipliers: [{ code: 'hard_deadline', name: 'Deadline', value: 0.1, is_active: 1 }],
  cost_item_types: [{ code: 'travel', name: 'Dojazd', unit: 'km', unit_price: 1.15, is_active: 1 }],
  params: [{ key: 'hourly_rate', value: '50' }],
  category_rates: [],
};

describe('buildExport', () => {
  const pack = buildExport(TABLES);

  it('metadane: schema_version, exported_at, liczniki', () => {
    expect(pack.schema_version).toBe(SCHEMA_VERSION);
    expect(typeof pack.exported_at).toBe('string');
    expect(pack.counts.rules).toBe(1);
    expect(pack.counts.aspects).toBe(2);
  });

  it('deterministyczny (poza exported_at) i posortowany po kluczu', () => {
    const a = buildExport(TABLES);
    const b = buildExport({ ...TABLES, aspects: [...TABLES.aspects].reverse() });
    // pomijamy exported_at
    const strip = (p: ReturnType<typeof buildExport>) => ({ ...p, exported_at: 'X' });
    expect(strip(a)).toEqual(strip(b)); // kolejność wejścia bez znaczenia
    expect(a.aspects.map((x) => x.code)).toEqual(['apis', 'frontend']); // sort po code
  });

  it('zawiera wszystkie encje', () => {
    for (const k of [
      'aspects',
      'levels',
      'archetypes',
      'archetype_defaults',
      'questions',
      'rules',
      'modules',
      'integrations',
      'multipliers',
      'cost_item_types',
      'params',
    ]) {
      expect(pack).toHaveProperty(k);
    }
  });
});

describe('computeLibraryDiff — round-trip i różnice', () => {
  it('ROUND-TRIP: export tej samej bazy → wszystko unchanged, added/changed/removed puste', () => {
    const pack = buildExport(TABLES);
    const diff = computeLibraryDiff(TABLES, pack);
    for (const e of Object.keys(diff)) {
      expect(diff[e].added, `${e}.added`).toEqual([]);
      expect(diff[e].changed, `${e}.changed`).toEqual([]);
      expect(diff[e].removed, `${e}.removed`).toEqual([]);
    }
  });

  it('zmiana pola → changed=[klucz]', () => {
    const pack = buildExport(TABLES);
    // zmień godziny modułu wishlist w paczce
    pack.modules = pack.modules.map((m) => (m.code === 'wishlist' ? { ...m, hours_max: 20 } : m));
    const diff = computeLibraryDiff(TABLES, pack);
    expect(diff.modules.changed).toEqual(['wishlist']);
    expect(diff.modules.added).toEqual([]);
  });

  it('nowy wiersz w paczce → added; brak w paczce → removed (raportowane)', () => {
    const pack = buildExport(TABLES);
    pack.multipliers = [
      ...pack.multipliers,
      { code: 'new_tech', name: 'Nowa', value: 0.15, is_active: 1 },
    ];
    pack.aspects = pack.aspects.filter((a) => a.code !== 'apis'); // usuń z paczki
    const diff = computeLibraryDiff(TABLES, pack);
    expect(diff.multipliers.added).toEqual(['new_tech']);
    expect(diff.aspects.removed).toEqual(['apis']); // w DB, brak w paczce → removed
  });

  it('klucz złożony: level po (aspect_code,level)', () => {
    const pack = buildExport(TABLES);
    pack.levels = pack.levels.map((l) =>
      l.aspect_code === 'frontend' && l.level === 2 ? { ...l, hours_min: 45 } : l,
    );
    const diff = computeLibraryDiff(TABLES, pack);
    expect(diff.levels.changed).toEqual(['["frontend",2]']);
  });
});
