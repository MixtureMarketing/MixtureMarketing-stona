/**
 * Pole `leads.details` (JSON) → lista „etykieta: wartość” do modala szczegółów leada.
 *
 * Kształty w bazie: formularz kontaktowy (płaskie pola), kalkulator
 * (`{answers: {...}, priceRange: {min, max}}`), Audyt 360 (`{score, pdf_key}`),
 * a w starych rekordach z ery PHP także niepoprawny JSON. Wcześniej
 * `JSON.parse` bez try wywracał cały panel do ErrorBoundary, a wartości
 * niebędące stringiem (odpowiedzi kalkulatora) były pomijane — sekcja pusta.
 */

export interface LeadDetailEntry {
  key: string;
  label: string;
  value: string;
}

const RAW_LIMIT = 500;

const humanize = (key: string) =>
  key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/^./, (s) => s.toUpperCase());

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

const primitive = (v: unknown): string | null => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'boolean') return v ? 'tak' : 'nie';
  if (typeof v === 'number') return Number.isFinite(v) ? v.toLocaleString('pl-PL') : null;
  if (typeof v === 'string') return v;
  return null;
};

const formatValue = (v: unknown): string | null => {
  const p = primitive(v);
  if (p !== null) return p;
  if (Array.isArray(v)) {
    const parts = v.map(
      (x) => primitive(x) ?? (x && typeof x === 'object' ? JSON.stringify(x) : null),
    );
    const joined = parts.filter(Boolean).join(', ');
    return joined || null;
  }
  if (isPlainObject(v)) {
    // Widełki ceny z kalkulatora: {min, max}
    if (typeof v.min === 'number' && typeof v.max === 'number') {
      return `${v.min.toLocaleString('pl-PL')} – ${v.max.toLocaleString('pl-PL')}`;
    }
    return JSON.stringify(v);
  }
  return null;
};

export function leadDetailsEntries(details: unknown): LeadDetailEntry[] {
  let data: unknown = details;
  if (typeof details === 'string') {
    if (!details.trim()) return [];
    try {
      data = JSON.parse(details);
    } catch {
      const raw = details.length > RAW_LIMIT ? `${details.slice(0, RAW_LIMIT)}…` : details;
      return [{ key: '_raw', label: 'Dane (nieczytelny format)', value: raw }];
    }
  }
  if (!isPlainObject(data)) {
    const v = formatValue(data);
    return v ? [{ key: '_value', label: 'Dane', value: v }] : [];
  }

  const out: LeadDetailEntry[] = [];
  for (const [key, val] of Object.entries(data)) {
    // Zagnieżdżony obiekt (np. answers z kalkulatora) — spłaszczamy o jeden poziom.
    if (isPlainObject(val) && !(typeof val.min === 'number' && typeof val.max === 'number')) {
      for (const [sub, subVal] of Object.entries(val)) {
        const v = formatValue(subVal);
        if (v)
          out.push({
            key: `${key}.${sub}`,
            label: `${humanize(key)} › ${humanize(sub)}`,
            value: v,
          });
      }
      continue;
    }
    const v = formatValue(val);
    if (v) out.push({ key, label: humanize(key), value: v });
  }
  return out;
}
