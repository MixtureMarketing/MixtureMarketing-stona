// MIX-1813 (Z10): przełącznik, telefon, etykiety, link i plan w details leada (czyste funkcje).
import { describe, it, expect } from 'vitest';
import {
  buildConfigLink,
  buildLabels,
  buildLeadDetails,
  CONFIG_LINK_BASE,
  leadConfigSwitch,
  normalizePhone,
  PHONE_REFUSAL,
} from './_leadConfig';

const DEFS = [
  {
    code: 'project_goal',
    answer_type: 'select',
    options_json: '[{"value":"x","label":"Strona firmowa"},{"value":"y","label":""}]',
  },
  {
    code: 'features',
    answer_type: 'multiselect',
    options_json: '[{"value":"blog","label":"Blog"},{"value":"shop","label":"Sklep"}]',
  },
  { code: 'has_cms', answer_type: 'bool', options_json: null },
  { code: 'odd', answer_type: 'rating', options_json: null },
];
const TEXTS = [
  { code: 'project_goal', text: 'Cel?' },
  { code: 'features', text: '' },
];

describe('leadConfigSwitch (allowlista, fail-closed)', () => {
  it("tylko '1' włącza; brak, '' i '0' wyłączają bez powodu; reszta wyłącza z powodem", () => {
    expect(leadConfigSwitch('1')).toEqual({ on: true, reason: null });
    for (const v of [undefined, null, '', '0'])
      expect(leadConfigSwitch(v)).toEqual({ on: false, reason: null });
    for (const v of ['true', 'yes', ' 1', '1 ', 1, true, {}, '01'])
      expect(leadConfigSwitch(v)).toEqual({ on: false, reason: 'konfiguracja: LEAD_CONFIG_CRM' });
  });
});

describe('normalizePhone', () => {
  it('opcjonalny: brak, null, pusty i same spacje = null', () => {
    for (const v of [undefined, null, '', '   '])
      expect(normalizePhone(v)).toEqual({ ok: true, phone: null });
  });
  it('normalizuje do E.164 (+48 dla 9 cyfr)', () => {
    const cases: [string, string][] = [
      ['600700800', '+48600700800'],
      ['+48 600 700 800', '+48600700800'],
      ['48600700800', '+48600700800'],
      ['0048-600-700-800', '+48600700800'],
      ['+1 (212) 555.0100', '+12125550100'],
      ['+12345678', '+12345678'],
      ['+123456789012345', '+123456789012345'],
    ];
    for (const [i, o] of cases) expect(normalizePhone(i)).toEqual({ ok: true, phone: o });
  });
  it('odmowy ze stałą linią powodu', () => {
    expect(normalizePhone(600700800)).toEqual({ ok: false, reason: PHONE_REFUSAL.type });
    expect(normalizePhone(['600700800'])).toEqual({ ok: false, reason: PHONE_REFUSAL.type });
    expect(normalizePhone('1'.repeat(33))).toEqual({ ok: false, reason: PHONE_REFUSAL.tooLong });
    expect(normalizePhone(' '.repeat(33))).toEqual({ ok: false, reason: PHONE_REFUSAL.tooLong });
    for (const v of [
      '600a700800',
      '+48+600700800',
      '600_700_800',
      '600\n700800',
      '٦٠٠٧٠٠٨٠٠',
      '+',
      'tel:600700800',
    ])
      expect(normalizePhone(v)).toEqual({ ok: false, reason: PHONE_REFUSAL.charset });
    for (const v of [
      '12345678',
      '+1234567',
      '+1234567890123456',
      '0600700800',
      '+0600700800',
      '00',
      '()',
    ])
      expect(normalizePhone(v)).toEqual({ ok: false, reason: PHONE_REFUSAL.length });
  });
  it('MIX-1877: polski numer od 0 to odmowa (nie +48060070080); bliźniaki bez 0 przechodzą', () => {
    for (const v of [
      '060070080',
      '060 070 080',
      '+48 060 070 080',
      '48060070080',
      '0048 060 070 080',
      '+480600700800',
      '022 123 456',
      '+48 012 345 678',
    ])
      expect(normalizePhone(v)).toEqual({ ok: false, reason: PHONE_REFUSAL.plZero });
    const ok: [string, string][] = [
      ['600700800', '+48600700800'],
      ['+48 600 700 800', '+48600700800'],
      ['48600700800', '+48600700800'],
      ['0048 600 700 800', '+48600700800'],
      ['+49 30 1234567', '+49301234567'],
      ['+420 601 702 803', '+420601702803'],
    ];
    for (const [i, o] of ok) expect(normalizePhone(i)).toEqual({ ok: true, phone: o });
  });
});

describe('buildLabels', () => {
  it('etykiety tylko z serwera; pusta etykieta = wartość; brak tekstu pytania = kod', () => {
    const l = buildLabels(
      { project_goal: 'y', features: ['shop', 'blog'], has_cms: false },
      DEFS,
      TEXTS,
    );
    expect(l).toEqual([
      { code: 'project_goal', question: 'Cel?', answer: 'y' },
      { code: 'features', question: 'features', answer: 'Sklep, Blog' },
      { code: 'has_cms', question: 'has_cms', answer: 'Nie' },
    ]);
  });
  it('wartość spoza opcji, zły typ albo nieznany typ pytania: pominięte (nie zgadujemy)', () => {
    const l = buildLabels(
      { project_goal: 'zzz', features: ['blog', 'obce'], has_cms: 'tak', odd: 5, extra: 'x' },
      DEFS,
      TEXTS,
    );
    expect(l).toEqual([]);
  });
  it('zły JSON opcji = brak etykiety', () => {
    const l = buildLabels({ project_goal: 'x' }, [{ ...DEFS[0], options_json: '{zly' }], TEXTS);
    expect(l).toEqual([]);
  });
});

describe('buildConfigLink i buildLeadDetails', () => {
  it('link na stałym adresie; brak znanych odpowiedzi = brak linku', () => {
    expect(buildConfigLink({ project_goal: 'x' }, DEFS)).toMatch(
      new RegExp(`^${CONFIG_LINK_BASE.replace(/[.?/]/g, '\\$&')}\\?k=[A-Za-z0-9_-]+$`),
    );
    expect(buildConfigLink({}, DEFS)).toBeNull();
  });
  it('plan, gdy serwer go podał; pusty plan i brak telefonu = brak kluczy', () => {
    const base = {
      answers: { project_goal: 'x' },
      priceRange: { min: 1000, max: 2000 },
      defs: DEFS,
      questionTexts: TEXTS,
    };
    const d = buildLeadDetails({
      ...base,
      plan: { start: '2027-01-11', weeks: 6 },
      phone: '+48600700800',
    });
    expect(d.plan).toEqual({ start: '2027-01-11', weeks: 6 });
    expect(d.phone).toBe('+48600700800');
    const e = buildLeadDetails({ ...base, plan: {}, phone: null });
    expect(Object.keys(e)).toEqual(['answers', 'priceRange', 'labels', 'config_link']);
    const f = buildLeadDetails({ ...base, answers: {}, phone: null });
    expect(Object.keys(f)).toEqual(['answers', 'priceRange', 'labels']);
  });
});
