// Konfiguracja edytora biblioteki (f2c-1) — CO jest edytowalne per encja i JAK renderować pole.
// Sterowanie danymi (inwariant 2): pola i słowniki tu, EntityTable tylko rysuje. Whitelista pól
// MUSI być podzbiorem ENTITY_FIELDS z lib/estimation/libraryEdit (serwer to i tak egzekwuje).
import type { LibraryEntity } from '@/lib/estimation/libraryEdit';
import type { EstimationLibrary } from '../useEstimationLibrary';

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'flag'
  | 'options'
  | 'visibleif';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  /** dla 'select' */
  options?: { value: string; label: string }[];
  /** liczba może być pusta (null) — integracje bez taryfy platform */
  nullable?: boolean;
  hint?: string;
}

export type LibRow = Record<string, unknown>;

export interface EntityConfig {
  entity: LibraryEntity;
  /** etykieta zakładki */
  tab: string;
  /** czytelny identyfikator wiersza (kod/klucz — READ-ONLY, kontrakt danych) */
  rowId: (row: LibRow) => string;
  /** naturalny klucz do PATCH */
  keyOf: (row: LibRow) => Record<string, unknown>;
  /** wiersze z biblioteki */
  rowsFrom: (lib: EstimationLibrary) => LibRow[];
  fields: FieldDef[];
}

const RISK_OPTS = [
  { value: 'low', label: 'niskie' },
  { value: 'medium', label: 'średnie' },
  { value: 'high', label: 'wysokie' },
];
const CATEGORY_OPTS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((c) => ({ value: c, label: c }));
const VISIBILITY_OPTS = [
  { value: 'internal', label: 'wewnętrzne (spotkanie/PM)' },
  { value: 'public', label: 'publiczne (kalkulator)' },
  { value: 'portal', label: 'portal klienta' },
];

export const ENTITY_CONFIGS: EntityConfig[] = [
  {
    entity: 'aspect',
    tab: 'Obszary',
    rowId: (r) => String(r.code),
    keyOf: (r) => ({ code: r.code }),
    rowsFrom: (lib) => lib.aspects,
    fields: [
      { key: 'name', label: 'Nazwa (wewnętrzna)', kind: 'text' },
      {
        key: 'client_name',
        label: 'Nazwa kliencka (do oferty)',
        kind: 'text',
        hint: 'Puste = w ofercie użyta zostanie nazwa wewnętrzna.',
      },
      { key: 'category', label: 'Kategoria', kind: 'select', options: CATEGORY_OPTS },
      { key: 'description', label: 'Opis (granice obszaru)', kind: 'textarea' },
      { key: 'sort_order', label: 'Kolejność', kind: 'number' },
    ],
  },
  {
    entity: 'level',
    tab: 'Poziomy',
    rowId: (r) => `${String(r.aspect_code)} · poziom ${String(r.level)}`,
    keyOf: (r) => ({ aspect_code: r.aspect_code, level: r.level }),
    rowsFrom: (lib) => lib.levels,
    fields: [
      { key: 'name', label: 'Nazwa poziomu', kind: 'text' },
      {
        key: 'client_description',
        label: 'Opis kliencki (do oferty)',
        kind: 'textarea',
        hint: 'Puste = w ofercie użyty zostanie opis wewnętrzny.',
      },
      { key: 'description', label: 'Opis techniczny (Karta decyzji)', kind: 'textarea' },
      { key: 'hours_min', label: 'Godziny min', kind: 'number' },
      { key: 'hours_max', label: 'Godziny maks', kind: 'number' },
    ],
  },
  {
    entity: 'module',
    tab: 'Moduły',
    rowId: (r) => String(r.code),
    keyOf: (r) => ({ code: r.code }),
    rowsFrom: (lib) => lib.modules,
    fields: [
      { key: 'name', label: 'Nazwa', kind: 'text' },
      { key: 'hours_min', label: 'Godziny min', kind: 'number' },
      { key: 'hours_max', label: 'Godziny maks', kind: 'number' },
      { key: 'risk', label: 'Ryzyko', kind: 'select', options: RISK_OPTS },
    ],
  },
  {
    entity: 'integration',
    tab: 'Integracje',
    rowId: (r) => String(r.code),
    keyOf: (r) => ({ code: r.code }),
    rowsFrom: (lib) => lib.integrations,
    fields: [
      { key: 'name', label: 'Nazwa', kind: 'text' },
      { key: 'hours_platform_min', label: 'Platform min', kind: 'number', nullable: true },
      { key: 'hours_platform_max', label: 'Platform maks', kind: 'number', nullable: true },
      { key: 'hours_custom_min', label: 'Custom min', kind: 'number' },
      { key: 'hours_custom_max', label: 'Custom maks', kind: 'number' },
      { key: 'risk', label: 'Ryzyko', kind: 'select', options: RISK_OPTS },
    ],
  },
  {
    entity: 'question',
    tab: 'Pytania',
    rowId: (r) => String(r.code),
    keyOf: (r) => ({ code: r.code }),
    // LibQuestion to nazwany interfejs — bez sygnatury indeksu nie jest wprost przypisywalny
    // do Record<string, unknown> (znana kwestia TS); pozostałe kolekcje mają typy anonimowe.
    rowsFrom: (lib) => lib.questions as unknown as LibRow[],
    fields: [
      { key: 'text', label: 'Treść pytania', kind: 'textarea' },
      { key: 'help_text', label: 'Podpowiedź dla prowadzącego', kind: 'textarea' },
      { key: 'options_json', label: 'Opcje odpowiedzi (etykiety)', kind: 'options' },
      { key: 'visibility', label: 'Widoczność', kind: 'select', options: VISIBILITY_OPTS },
      { key: 'visible_if_json', label: 'Warunek widoczności', kind: 'visibleif' },
    ],
  },
  {
    entity: 'param',
    tab: 'Parametry',
    rowId: (r) => String(r.key),
    keyOf: (r) => ({ key: r.key }),
    rowsFrom: (lib) => lib.params,
    fields: [{ key: 'value', label: 'Wartość', kind: 'text' }],
  },
];
