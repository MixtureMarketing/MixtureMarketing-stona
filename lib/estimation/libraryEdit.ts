// Walidacja edycji biblioteki wiedzy (f2c-1) — CZYSTY TS, bez D1/React. Endpoint woła
// validateLibraryPatch przed UPDATE i buduje zapytanie tylko z pól z ENTITY_FIELDS.
//
// TWARDE GRANICE (inwariant „kod = kontrakt danych"): kody obszarów/modułów/integracji/pytań,
// klucze parametrów i VALUE opcji są NIEEDYTOWALNE — nie ma ich na whiteliście, a value opcji
// pilnuje osobny check. Edytowalne są etykiety i liczby.
//
// MONOTONICZNOŚĆ POZIOMÓW (poprawka architekta, zweryfikowana na 155 seedach = 0 wyjątków):
// hours_min ŚCIŚLE rosnące po poziomach ORAZ hours_max ŚCIŚLE rosnące; NAKŁADANIE pasm
// (min[L+1] < max[L], np. frontend L2 40–100 vs L3 80–160) jest LEGALNE.

export type LibraryEntity = 'aspect' | 'level' | 'module' | 'integration' | 'question' | 'param';

/** Pola edytowalne per encja. Wszystko poza tą listą (w tym code/key/value opcji/answer_type)
 *  odrzucane jako „nieedytowalne". Kolejność bez znaczenia. */
export const ENTITY_FIELDS: Record<LibraryEntity, readonly string[]> = {
  aspect: ['name', 'description', 'category', 'client_name', 'sort_order', 'is_active'],
  level: ['name', 'description', 'client_description', 'hours_min', 'hours_max'],
  module: [
    'name',
    'description',
    'includes',
    'excludes',
    'hours_min',
    'hours_max',
    'risk',
    'archetypes_json',
    'goals_json',
    'is_active',
  ],
  integration: [
    'name',
    'hours_platform_min',
    'hours_platform_max',
    'hours_custom_min',
    'hours_custom_max',
    'risk',
    'requirements',
    'is_active',
  ],
  question: [
    'text',
    'help_text',
    'options_json',
    'allow_unknown',
    'visibility',
    'unknown_weight',
    'is_active',
  ],
  param: ['value'],
};

const RISK = new Set(['low', 'medium', 'high']);
const CATEGORY = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
const VISIBILITY = new Set(['internal', 'public', 'portal']);

export interface PatchContext {
  entity: LibraryEntity;
  patch: Record<string, unknown>;
  current: Record<string, unknown>;
  /** Wszystkie poziomy obszaru Z ZASTOSOWANYM patchem na docelowym poziomie — buduje endpoint.
   *  Wymagane do sprawdzenia monotoniczności przy edycji hours_min/hours_max. */
  siblingLevels?: { level: number; hours_min: number; hours_max: number }[];
}

const nonNegNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;

function parseOptions(raw: unknown): { value: unknown; label: unknown }[] | null {
  if (typeof raw !== 'string') return null;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export function validateLibraryPatch(c: PatchContext): string[] {
  const errors: string[] = [];
  const allowed = ENTITY_FIELDS[c.entity];
  const keys = Object.keys(c.patch);

  if (keys.length === 0) errors.push('Brak pól do zapisu.');
  for (const k of keys) {
    if (!allowed.includes(k)) {
      errors.push(`Pole „${k}" nie jest edytowalne (kod/klucz/typ to kontrakt danych).`);
    }
  }

  const has = (k: string) => keys.includes(k) && allowed.includes(k);
  const val = (k: string) => c.patch[k];
  const merged = (k: string) => (has(k) ? val(k) : c.current[k]);

  // name/text niepuste
  for (const nameField of ['name', 'text'] as const) {
    if (has(nameField)) {
      const v = val(nameField);
      if (typeof v !== 'string' || v.trim() === '')
        errors.push(`Pole „${nameField}" nie może być puste.`);
    }
  }

  // flagi 0/1
  for (const flag of ['is_active', 'allow_unknown'] as const) {
    if (has(flag) && val(flag) !== 0 && val(flag) !== 1)
      errors.push(`Pole „${flag}" musi być 0 lub 1.`);
  }

  // enumy strukturalne (kategoria A..G dotyczy WYŁĄCZNIE obszarów; integracje mają własny słownik)
  if (c.entity === 'aspect' && has('category') && !CATEGORY.has(String(val('category'))))
    errors.push('Kategoria musi być z zakresu A..G.');
  if (has('risk') && !RISK.has(String(val('risk'))))
    errors.push('Ryzyko musi być: low, medium lub high.');
  if (has('visibility') && !VISIBILITY.has(String(val('visibility'))))
    errors.push('Widoczność musi być: internal, public lub portal.');

  if (has('unknown_weight') && !nonNegNum(val('unknown_weight')))
    errors.push('Waga „nie wiem" musi być liczbą ≥ 0.');
  if (
    has('sort_order') &&
    !(typeof val('sort_order') === 'number' && Number.isInteger(val('sort_order')))
  )
    errors.push('Pole „sort_order" musi być liczbą całkowitą.');

  // widełki min≤max (nullable = para integracji platform)
  const checkPair = (minK: string, maxK: string, label: string, nullable: boolean) => {
    if (!has(minK) && !has(maxK)) return;
    for (const k of [minK, maxK]) {
      if (has(k)) {
        const v = val(k);
        if (nullable && v === null) continue;
        if (!nonNegNum(v))
          errors.push(`Pole „${k}" musi być liczbą ≥ 0${nullable ? ' albo null' : ''}.`);
      }
    }
    const mn = merged(minK);
    const mx = merged(maxK);
    if (typeof mn === 'number' && typeof mx === 'number' && mn > mx)
      errors.push(`${label}: min (${mn}) > maks (${mx}).`);
  };

  if (c.entity === 'level' || c.entity === 'module') {
    checkPair('hours_min', 'hours_max', 'Widełki godzin', false);
  }
  if (c.entity === 'integration') {
    checkPair('hours_platform_min', 'hours_platform_max', 'Taryfa platform', true);
    checkPair('hours_custom_min', 'hours_custom_max', 'Taryfa custom', false);
  }

  // monotoniczność poziomów (ściśle rosnące min I max; nakładanie legalne)
  if (c.entity === 'level' && c.siblingLevels && (has('hours_min') || has('hours_max'))) {
    const sorted = [...c.siblingLevels].sort((a, b) => a.level - b.level);
    for (let i = 1; i < sorted.length; i++) {
      const p = sorted[i - 1];
      const q = sorted[i];
      if (!(q.hours_min > p.hours_min))
        errors.push(`Poziomy: hours_min nie rośnie ściśle (poziom ${p.level} → ${q.level}).`);
      if (!(q.hours_max > p.hours_max))
        errors.push(`Poziomy: hours_max nie rośnie ściśle (poziom ${p.level} → ${q.level}).`);
    }
  }

  // opcje pytania: etykiety TAK, value NIE (kontrakt danych)
  if (c.entity === 'question' && has('options_json')) {
    const next = parseOptions(val('options_json'));
    if (!next) {
      errors.push('options_json musi być tablicą JSON [{value,label}].');
    } else {
      let shapeOk = true;
      for (const o of next) {
        if (o == null || typeof o !== 'object' || !('value' in o) || !('label' in o)) {
          errors.push('Każda opcja wymaga pól „value" i „label".');
          shapeOk = false;
          break;
        }
        if (typeof o.label !== 'string' || o.label.trim() === '') {
          errors.push('Etykieta opcji nie może być pusta.');
          shapeOk = false;
          break;
        }
      }
      const prev = parseOptions(c.current.options_json);
      if (shapeOk && prev) {
        const pv = prev.map((o) => o.value);
        const nv = next.map((o) => o.value);
        const same = pv.length === nv.length && pv.every((v, i) => v === nv[i]);
        if (!same)
          errors.push(
            'Nie wolno zmieniać, dodawać ani usuwać value opcji — edytowalne są tylko etykiety.',
          );
      }
    }
  }

  // parametr: zachowaj TYP wartości bez hardkodu domeny — jeśli obecna jest liczbą, nowa też musi być
  if (c.entity === 'param' && has('value')) {
    const nv = val('value');
    if (typeof nv !== 'string') {
      errors.push('Wartość parametru musi być tekstem.');
    } else {
      const cur = String(c.current.value ?? '');
      const curNumeric = cur.trim() !== '' && Number.isFinite(Number(cur));
      if (curNumeric && !(nv.trim() !== '' && Number.isFinite(Number(nv))))
        errors.push('Ten parametr jest liczbowy — podaj liczbę.');
    }
  }

  return errors;
}
