import { describe, it, expect } from 'vitest';
import { buildLibraryData, type RawLibrary } from './toLibraryData';

// Współdzielony transformat surowych wierszy biblioteki → LibraryData (parytet UI↔serwer, f1c).
// Kluczowy test: FILTR MODUŁÓW per archetyp po archetypes_json (decyzja architekta, f1c #4).

const base: RawLibrary = {
  aspects: [{ code: 'frontend', name: 'Frontend', category: 'A', description: null }],
  levels: [{ aspect_code: 'frontend', level: 2, hours_min: 40, hours_max: 100 }],
  archetypes: [
    { code: 'woocommerce', name: 'WooCommerce', description: null, integration_mode: 'platform' },
    { code: 'laravel', name: 'Laravel', description: null, integration_mode: 'custom' },
  ],
  archetypeDefaults: [
    { archetype_code: 'woocommerce', aspect_code: 'frontend', default_level: 2, is_locked: 0 },
  ],
  questions: [
    {
      code: 'sensitive_data',
      text: 'Dane wrażliwe?',
      unknown_weight: 1,
      visible_if_json: null,
    },
  ],
  rules: [
    {
      id: 1,
      name: 'r',
      condition_json: '{"q":"project_goal","op":"eq","val":"sklep"}',
      actions_json: '[{"type":"min_level","aspect":"frontend","level":2}]',
      reason_template: 'x',
      priority: 0,
    },
  ],
  modules: [
    // przypisany do WooCommerce → widoczny tylko dla woocommerce
    {
      code: 'woo_only',
      name: 'Woo panel',
      hours_min: 8,
      hours_max: 16,
      risk: 'low',
      archetypes_json: '["woocommerce"]',
    },
    // brak przypisania (null) → widoczny dla każdego archetypu i celu
    {
      code: 'wishlist',
      name: 'Wishlist',
      hours_min: 4,
      hours_max: 8,
      risk: 'low',
      archetypes_json: null,
    },
    // moduł sklepowy: tylko cele sklep/b2b (goals_json), każdy archetyp
    {
      code: 'gift_cards',
      name: 'Karty podarunkowe',
      hours_min: 8,
      hours_max: 16,
      risk: 'low',
      archetypes_json: null,
      goals_json: '["sklep","b2b"]',
    },
    // moduł ogólny: null goals → każdy cel
    {
      code: 'livechat',
      name: 'Live chat',
      hours_min: 3,
      hours_max: 8,
      risk: 'low',
      archetypes_json: null,
      goals_json: null,
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
      risk: 'low',
    },
  ],
  multipliers: [{ code: 'new_tech', name: 'Nowa tech', value: 0.15 }],
  params: [
    { key: 'hourly_rate', value: '50' },
    { key: 'confidence_completeness', value: '0.60' },
  ],
};

describe('buildLibraryData — filtr modułów per archetyp (f1c #4)', () => {
  it('moduł z archetypes_json=["woocommerce"] widoczny dla woocommerce', () => {
    const lib = buildLibraryData(base, 'woocommerce');
    expect(lib.modules.map((m) => m.code).sort()).toEqual([
      'gift_cards',
      'livechat',
      'wishlist',
      'woo_only',
    ]);
  });

  it('ten sam moduł UKRYTY dla laravel; moduł null pozostaje', () => {
    const lib = buildLibraryData(base, 'laravel');
    expect(lib.modules.map((m) => m.code).sort()).toEqual(['gift_cards', 'livechat', 'wishlist']);
  });

  it('integrationMode brany z wybranego archetypu', () => {
    expect(buildLibraryData(base, 'woocommerce').integrationMode).toBe('platform');
    expect(buildLibraryData(base, 'laravel').integrationMode).toBe('custom');
  });

  it('archetypeDefaults filtrowane do wybranego archetypu', () => {
    expect(buildLibraryData(base, 'woocommerce').archetypeDefaults).toHaveLength(1);
    expect(buildLibraryData(base, 'laravel').archetypeDefaults).toHaveLength(0);
  });

  it('params + pytania + reguły mapowane', () => {
    const lib = buildLibraryData(base, 'woocommerce');
    expect(lib.params.hourlyRate).toBe(50);
    expect(lib.params.completenessThreshold).toBe(0.6);
    expect(lib.questions[0]).toMatchObject({ code: 'sensitive_data', label: 'Dane wrażliwe?' });
    expect(lib.rules[0].actions[0]).toMatchObject({ type: 'min_level', aspect: 'frontend' });
  });
});

describe('buildLibraryData — checklista = PRZECIĘCIE archetyp ∩ cel (goals_json)', () => {
  it('cel „aplikacja": moduł sklepowy (goals sklep/b2b) odpada, ogólne zostają', () => {
    const lib = buildLibraryData(base, 'woocommerce', 'aplikacja');
    expect(lib.modules.map((m) => m.code).sort()).toEqual(['livechat', 'wishlist', 'woo_only']);
    expect(lib.modules.some((m) => m.code === 'gift_cards')).toBe(false);
  });

  it('cel „sklep": moduł sklepowy wraca', () => {
    const lib = buildLibraryData(base, 'woocommerce', 'sklep');
    expect(lib.modules.some((m) => m.code === 'gift_cards')).toBe(true);
  });

  it('PRZECIĘCIE: laravel + aplikacja → odpada i woo_only (archetyp), i gift_cards (cel)', () => {
    const lib = buildLibraryData(base, 'laravel', 'aplikacja');
    expect(lib.modules.map((m) => m.code).sort()).toEqual(['livechat', 'wishlist']);
  });

  it('cel nieznany (jeszcze nieodpowiedziany) → bez filtra celu (permisywnie)', () => {
    const lib = buildLibraryData(base, 'woocommerce', undefined);
    expect(lib.modules.some((m) => m.code === 'gift_cards')).toBe(true);
  });
});

describe('buildLibraryData — pozostałe mapowania', () => {
  it('params + pytania + reguły mapowane (kontrola)', () => {
    const lib = buildLibraryData(base, 'woocommerce');
    expect(lib.params.hourlyRate).toBe(50);
    expect(lib.params.completenessThreshold).toBe(0.6);
    expect(lib.questions[0]).toMatchObject({ code: 'sensitive_data', label: 'Dane wrażliwe?' });
    expect(lib.rules[0].actions[0]).toMatchObject({ type: 'min_level', aspect: 'frontend' });
  });
});
