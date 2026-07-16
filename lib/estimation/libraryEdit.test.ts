import { describe, it, expect } from 'vitest';
import { validateLibraryPatch, ENTITY_FIELDS, type PatchContext } from './libraryEdit';

// TWARDE GRANICE edytora biblioteki (f2c-1, ruling #2 + inwariant „kod = kontrakt danych").
// Walidator jest CZYSTY: dostaje encję, patch, bieżący wiersz (i rodzeństwo poziomów dla
// monotoniczności) — zwraca listę błędów. Endpoint go woła i dopiero przy [] robi UPDATE.
// Reguła monotoniczności (poprawiona przez architekta): hours_min ŚCIŚLE rosnące po poziomach
// ORAZ hours_max ŚCIŚLE rosnące; NAKŁADANIE pasm (min[L+1] < max[L]) jest LEGALNE.

const base = (over: Partial<PatchContext>): PatchContext => ({
  entity: 'aspect',
  patch: {},
  current: {},
  ...over,
});

describe('validateLibraryPatch — twarde granice: kod/klucz/value niezmienne', () => {
  it('próba zmiany code obszaru → odrzucona (pole spoza whitelisty)', () => {
    const errs = validateLibraryPatch(
      base({ entity: 'aspect', patch: { code: 'nowy' }, current: { code: 'frontend' } }),
    );
    expect(errs.length).toBeGreaterThan(0);
    expect(errs.join(' ')).toMatch(/code/);
  });

  it('próba zmiany key parametru → odrzucona', () => {
    const errs = validateLibraryPatch(
      base({
        entity: 'param',
        patch: { key: 'inny' },
        current: { key: 'hourly_rate', value: '50' },
      }),
    );
    expect(errs.length).toBeGreaterThan(0);
  });

  it('aspect: code NIE ma prawa być na whiteliście edytowalnych pól', () => {
    expect(ENTITY_FIELDS.aspect).not.toContain('code');
    expect(ENTITY_FIELDS.module).not.toContain('code');
    expect(ENTITY_FIELDS.question).not.toContain('code');
    expect(ENTITY_FIELDS.question).not.toContain('answer_type');
    expect(ENTITY_FIELDS.param).not.toContain('key');
    expect(ENTITY_FIELDS.level).not.toContain('level');
    expect(ENTITY_FIELDS.level).not.toContain('aspect_code');
  });

  it('pusty patch → błąd (nie ma czego zapisać)', () => {
    expect(validateLibraryPatch(base({ entity: 'aspect', patch: {} })).length).toBeGreaterThan(0);
  });
});

describe('validateLibraryPatch — aspekty', () => {
  it('edycja name + client_name → OK', () => {
    const errs = validateLibraryPatch(
      base({
        entity: 'aspect',
        patch: { name: 'Frontend', client_name: 'Strona i wygląd' },
        current: { code: 'frontend', name: 'Frontend' },
      }),
    );
    expect(errs).toEqual([]);
  });

  it('client_name = null (kasowanie nadpisania klienckiego) → OK', () => {
    expect(validateLibraryPatch(base({ entity: 'aspect', patch: { client_name: null } }))).toEqual(
      [],
    );
  });

  it('pusta nazwa → błąd', () => {
    expect(
      validateLibraryPatch(base({ entity: 'aspect', patch: { name: '   ' } })).length,
    ).toBeGreaterThan(0);
  });

  it('kategoria spoza A..G → błąd', () => {
    expect(
      validateLibraryPatch(base({ entity: 'aspect', patch: { category: 'Z' } })).length,
    ).toBeGreaterThan(0);
    expect(validateLibraryPatch(base({ entity: 'aspect', patch: { category: 'C' } }))).toEqual([]);
  });
});

describe('validateLibraryPatch — poziomy: min≤max + ściśle-rosnące z nakładaniem', () => {
  // Pełny obszar frontend z seedów (fallback dla pól nieujętych w patchu).
  const frontendLevels = [
    { level: 0, hours_min: 0, hours_max: 0 },
    { level: 1, hours_min: 10, hours_max: 25 },
    { level: 2, hours_min: 40, hours_max: 100 },
    { level: 3, hours_min: 100, hours_max: 250 },
    { level: 4, hours_min: 250, hours_max: 375 },
  ];
  // Rodzeństwo Z ZASTOSOWANYM patchem na docelowym poziomie (buduje endpoint).
  const withPatched = (level: number, min: number, max: number) =>
    frontendLevels.map((l) => (l.level === level ? { ...l, hours_min: min, hours_max: max } : l));

  it('edycja widełek w granicach → OK (nakładanie z sąsiadem legalne)', () => {
    // L2 → (50,110): min 10<50<100 ✓, max 25<110<250 ✓; 110 nachodzi na L3(min 100) — legalne.
    const errs = validateLibraryPatch(
      base({
        entity: 'level',
        patch: { hours_min: 50, hours_max: 110 },
        current: { level: 2, hours_min: 40, hours_max: 100 },
        siblingLevels: withPatched(2, 50, 110),
      }),
    );
    expect(errs).toEqual([]);
  });

  it('min > max → błąd', () => {
    const errs = validateLibraryPatch(
      base({
        entity: 'level',
        patch: { hours_min: 120, hours_max: 100 },
        current: { level: 2, hours_min: 40, hours_max: 100 },
        siblingLevels: withPatched(2, 120, 100),
      }),
    );
    expect(errs.join(' ')).toMatch(/min|maks|max/i);
  });

  it('hours_min NIE rośnie ściśle względem sąsiada → błąd', () => {
    // L2 min → 100 = L3 min 100: L3 nie jest już ściśle > L2.
    const errs = validateLibraryPatch(
      base({
        entity: 'level',
        patch: { hours_min: 100 },
        current: { level: 2, hours_min: 40, hours_max: 100 },
        siblingLevels: withPatched(2, 100, 100),
      }),
    );
    expect(errs.length).toBeGreaterThan(0);
  });

  it('NAKŁADANIE pasm samo w sobie NIE jest błędem', () => {
    // L3 → (80,250): nachodzi na L2 max 100, ale min 40<80<250 ✓ i max 100<250 ✓.
    const errs = validateLibraryPatch(
      base({
        entity: 'level',
        patch: { hours_min: 80 },
        current: { level: 3, hours_min: 100, hours_max: 250 },
        siblingLevels: withPatched(3, 80, 250),
      }),
    );
    expect(errs).toEqual([]);
  });

  it('client_description poziomu edytowalne', () => {
    expect(ENTITY_FIELDS.level).toContain('client_description');
    expect(
      validateLibraryPatch(
        base({
          entity: 'level',
          patch: { client_description: 'Opis dla klienta.' },
          current: { level: 2, hours_min: 40, hours_max: 100 },
          siblingLevels: frontendLevels,
        }),
      ),
    ).toEqual([]);
  });
});

describe('validateLibraryPatch — moduły i integracje', () => {
  it('moduł: min>max → błąd; poprawne → OK; risk spoza słownika → błąd', () => {
    expect(
      validateLibraryPatch(
        base({
          entity: 'module',
          patch: { hours_min: 20, hours_max: 10 },
          current: { code: 'wishlist', hours_min: 8, hours_max: 16 },
        }),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      validateLibraryPatch(
        base({
          entity: 'module',
          patch: { hours_min: 8, hours_max: 16, risk: 'medium' },
          current: { code: 'wishlist', hours_min: 8, hours_max: 16 },
        }),
      ),
    ).toEqual([]);
    expect(
      validateLibraryPatch(
        base({ entity: 'module', patch: { risk: 'krytyczne' }, current: { code: 'x' } }),
      ).length,
    ).toBeGreaterThan(0);
  });

  it('integracja: taryfa custom min>max → błąd; platform obie null → OK', () => {
    expect(
      validateLibraryPatch(
        base({
          entity: 'integration',
          patch: { hours_custom_min: 30, hours_custom_max: 16 },
          current: { code: 'inpost', hours_custom_min: 16, hours_custom_max: 30 },
        }),
      ).length,
    ).toBeGreaterThan(0);
    // platform NULL (integracja bez pluginu) — nie walidujemy pary, gdy któraś strona null
    expect(
      validateLibraryPatch(
        base({
          entity: 'integration',
          patch: { hours_platform_min: null, hours_platform_max: null },
          current: { code: 'x', hours_custom_min: 10, hours_custom_max: 20 },
        }),
      ),
    ).toEqual([]);
  });
});

describe('validateLibraryPatch — pytania: etykiety opcji tak, value NIE', () => {
  const current = {
    code: 'sales_model',
    options_json: JSON.stringify([
      { value: 'b2c', label: 'B2C' },
      { value: 'b2b', label: 'B2B' },
    ]),
  };

  it('zmiana samych etykiet (value bez zmian) → OK', () => {
    const errs = validateLibraryPatch(
      base({
        entity: 'question',
        patch: {
          options_json: JSON.stringify([
            { value: 'b2c', label: 'Sprzedaż konsumencka (B2C)' },
            { value: 'b2b', label: 'Sprzedaż firmowa (B2B)' },
          ]),
        },
        current,
      }),
    );
    expect(errs).toEqual([]);
  });

  it('zmiana value opcji → błąd (kontrakt danych)', () => {
    const errs = validateLibraryPatch(
      base({
        entity: 'question',
        patch: {
          options_json: JSON.stringify([
            { value: 'consumer', label: 'B2C' }, // value zmienione!
            { value: 'b2b', label: 'B2B' },
          ]),
        },
        current,
      }),
    );
    expect(errs.length).toBeGreaterThan(0);
  });

  it('dodanie/usunięcie opcji → błąd (zmiana przestrzeni odpowiedzi)', () => {
    const errs = validateLibraryPatch(
      base({
        entity: 'question',
        patch: {
          options_json: JSON.stringify([{ value: 'b2c', label: 'B2C' }]), // usunięto b2b
        },
        current,
      }),
    );
    expect(errs.length).toBeGreaterThan(0);
  });

  it('visibility spoza słownika → błąd; poprawna → OK', () => {
    expect(
      validateLibraryPatch(
        base({ entity: 'question', patch: { visibility: 'sekret' }, current: { code: 'x' } }),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      validateLibraryPatch(
        base({ entity: 'question', patch: { visibility: 'portal' }, current: { code: 'x' } }),
      ),
    ).toEqual([]);
  });
});

describe('validateLibraryPatch — parametry: zachowanie TYPU (bez hardkodu domeny)', () => {
  it('parametr liczbowy: wartość nieliczbowa → błąd', () => {
    const errs = validateLibraryPatch(
      base({
        entity: 'param',
        patch: { value: 'abc' },
        current: { key: 'hourly_rate', value: '50' },
      }),
    );
    expect(errs.length).toBeGreaterThan(0);
  });

  it('parametr liczbowy: liczba → OK', () => {
    expect(
      validateLibraryPatch(
        base({
          entity: 'param',
          patch: { value: '65' },
          current: { key: 'hourly_rate', value: '50' },
        }),
      ),
    ).toEqual([]);
  });

  it('parametr tekstowy (offer_terms): dowolny string → OK', () => {
    expect(
      validateLibraryPatch(
        base({
          entity: 'param',
          patch: { value: 'Wsparcie 6 mies.|Ceny netto' },
          current: { key: 'offer_terms', value: 'Ceny netto' },
        }),
      ),
    ).toEqual([]);
  });
});
