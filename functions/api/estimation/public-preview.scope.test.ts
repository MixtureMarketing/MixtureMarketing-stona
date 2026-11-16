// MIX-1790 K1: public-preview, kontrakt v2. Odpowiedź niesie „Twój zakres" tylko dla obszarów
// wybranych, a każda pozycja ma DOKŁADNIE {client_name, client_description}. Noga negatywna:
// dodatkowe pola w wierszach D1 (godziny, nazwy i opisy wewnętrzne, kolumna spoza schematu) nie
// wychodzą z API. Biblioteka z atrapy D1 (jak public-preview.test), Turnstile z atrapy fetch.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handlePreview } from './public-preview';

const ASPECTS = [
  // wybrany, z treścią kliencką i z dodatkową kolumną spoza schematu
  {
    code: 'frontend',
    name: 'WEWN-Frontend',
    category: 'A',
    description: 'WEWN-opis-obszaru',
    client_name: 'Strona dopasowana do telefonu',
    secret_note: 'WEWN-tajne',
  },
  // wybrany, BEZ nazwy klienckiej: nie może wyjść ani on, ani jego nazwa wewnętrzna
  { code: 'backend', name: 'WEWN-Backend', category: 'A', client_name: null },
  // niewybrany (poziom 0 = 0 godzin): nie wychodzi mimo nazwy klienckiej
  { code: 'seo', name: 'WEWN-SEO', category: 'A', client_name: 'Pozycjonowanie' },
];
const LEVELS = [
  { aspect_code: 'frontend', level: 0, hours_min: 0, hours_max: 0 },
  {
    aspect_code: 'frontend',
    level: 1,
    hours_min: 37,
    hours_max: 41,
    name: 'WEWN-poziom',
    description: 'WEWN-opis-poziomu',
    client_description: 'Projekt <img src=x onerror=alert(1)> i <script>alert(2)</script>',
    rate_pln: 9999,
  },
  { aspect_code: 'backend', level: 1, hours_min: 43, hours_max: 47, name: 'WEWN-b' },
  { aspect_code: 'seo', level: 0, hours_min: 0, hours_max: 0, client_description: 'x' },
];

let aspects: unknown[] = ASPECTS;
let levels: unknown[] = LEVELS;

function route(sql: string): unknown[] {
  if (sql.includes('FROM est_levels')) return levels;
  if (sql.includes('FROM est_archetype_defaults'))
    return [
      { archetype_code: 'x', aspect_code: 'frontend', default_level: 1, is_locked: 0 },
      { archetype_code: 'x', aspect_code: 'backend', default_level: 1, is_locked: 0 },
      { archetype_code: 'x', aspect_code: 'seo', default_level: 0, is_locked: 0 },
    ];
  if (sql.includes('FROM est_archetypes'))
    return [{ code: 'x', name: 'X', integration_mode: 'platform' }];
  if (sql.includes("visibility = 'public'"))
    return [{ code: 'project_goal', answer_type: 'select', options_json: '[{"value":"x"}]' }];
  if (sql.includes('FROM est_questions'))
    return [{ code: 'project_goal', text: 'Cel?', unknown_weight: 1, visible_if_json: null }];
  if (sql.includes('FROM est_rules'))
    return [
      {
        id: 1,
        name: 'rec X',
        condition_json: '{"q":"project_goal","op":"eq","val":"x"}',
        actions_json: '[{"type":"recommend_archetype","code":"x","reason":"bo x"}]',
        reason_template: '',
        priority: 0,
      },
    ];
  if (sql.includes('FROM est_params'))
    return [
      { key: 'hourly_rate', value: '50' },
      { key: 'buffer', value: '0' },
      { key: 'multiplier_cap', value: '0.4' },
      { key: 'offer_low_k', value: '0.2' },
      { key: 'offer_high_k', value: '0.3' },
      { key: 'rounding_pln', value: '100' },
      { key: 'confidence_completeness', value: '0.6' },
      { key: 'public_widen_k', value: '0.15' },
      { key: 'public_round_pln', value: '500' },
    ];
  if (sql.includes('FROM est_aspects')) return aspects;
  return [];
}

function makeEnv() {
  const store = new Map<string, string>();
  return {
    DB: { prepare: (sql: string) => ({ all: async () => ({ results: route(sql) }) }) },
    CACHE: {
      get: async (k: string) => store.get(k) ?? null,
      put: async (k: string, v: string) => void store.set(k, v),
    },
    TURNSTILE_SECRET: 'ts-secret',
    PREVIEW_TOKEN_SECRET: 's'.repeat(48),
  };
}

const T0 = 1_800_000_000_000;
const req = (body: unknown) =>
  new Request('https://x/api/estimation/public-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.7' },
    body: JSON.stringify(body),
  });
const FIRST = { answers: { project_goal: 'x' }, captcha_token: 'cf-turnstile-token' };

async function call(env: unknown, payload: unknown) {
  const res = await handlePreview(req(payload), env as never, T0);
  const body = (await res.json()) as Record<string, unknown>;
  // tekst odpowiedzi bez losowego tokenu podglądu (przypadkowy ciąg w base64 nie daje fałszu)
  return { status: res.status, text: JSON.stringify({ ...body, preview_token: undefined }), body };
}

beforeEach(() => {
  aspects = ASPECTS;
  levels = LEVELS;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            success: true,
            hostname: 'mixturemarketing.pl',
            action: 'public_quote',
          }),
        ),
    ),
  );
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('public-preview v2: scope (K1)', () => {
  it('pozycje mają dokładnie {client_name, client_description}; tylko obszary wybrane z nazwą kliencką', async () => {
    const r = await call(makeEnv(), FIRST);
    expect(r.status).toBe(200);
    expect(Object.keys(r.body).sort()).toEqual(['preview_token', 'priceRange', 'scope']);
    const scope = r.body.scope as Record<string, unknown>[];
    expect(scope).toHaveLength(1);
    for (const item of scope)
      expect(Object.keys(item).sort()).toEqual(['client_description', 'client_name']);
    expect(scope[0]).toEqual({
      client_name: 'Strona dopasowana do telefonu',
      client_description: 'Projekt <img src=x onerror=alert(1)> i <script>alert(2)</script>',
    });
  });

  it('noga negatywna: dodatkowe pola wierszy D1 i nazwy wewnętrzne nie wychodzą z API', async () => {
    const r = await call(makeEnv(), FIRST);
    expect(r.status).toBe(200);
    for (const leak of [
      'WEWN',
      'secret_note',
      'rate_pln',
      '9999',
      'hours',
      'level',
      'Backend',
      'Pozycjonowanie',
      'frontend',
      '"37"',
      '"41"',
    ])
      expect(r.text).not.toContain(leak);
  });

  it('ścieżka z tokenem podglądu też niesie scope (te same 2 pola)', async () => {
    const env = makeEnv();
    const first = await call(env, FIRST);
    const r = await call(env, { answers: FIRST.answers, preview_token: first.body.preview_token });
    expect(r.status).toBe(200);
    expect(Object.keys(r.body).sort()).toEqual(['priceRange', 'scope']);
    expect(Object.keys((r.body.scope as object[])[0]).sort()).toEqual([
      'client_description',
      'client_name',
    ]);
  });

  it('pusty zakres (brak nazw klienckich) = odpowiedź bez pola scope; z nazwą = jest', async () => {
    aspects = ASPECTS.map((a) => ({ ...a, client_name: null }));
    const r = await call(makeEnv(), FIRST);
    expect(r.status).toBe(200);
    expect(Object.keys(r.body).sort()).toEqual(['preview_token', 'priceRange']);
    expect(r.text).not.toContain('WEWN');
    aspects = ASPECTS;
    expect(Object.keys((await call(makeEnv(), FIRST)).body)).toContain('scope');
  });

  it('opis kliencki brak = null (bez opisu wewnętrznego poziomu)', async () => {
    levels = LEVELS.map((l) => ({ ...l, client_description: undefined }));
    const r = await call(makeEnv(), FIRST);
    expect(r.body.scope).toEqual([
      { client_name: 'Strona dopasowana do telefonu', client_description: null },
    ]);
    expect(r.text).not.toContain('WEWN');
  });
});
