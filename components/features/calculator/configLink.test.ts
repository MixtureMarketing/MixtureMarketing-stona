// MIX-1791 (Z7, SPEC-MIX-1320 U5/A13): link do konfiguracji `?k=`.
// K1: zapis -> odczyt oddaje te same odpowiedzi dla każdego typu pytania (test własności, 400
// losowych zestawów z ziarnem). K2/K6: złośliwy albo zepsuty link = pusty formularz z linią
// powodu; każda odmowa ma dozwolonego bliźniaka.
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { PublicQuestion } from '../../../services/calculatorService';
import type { Answers } from '../../../lib/estimation/types';
import {
  CONFIG_LINK_MAX,
  LINK_REFUSAL,
  buildConfigLinkUrl,
  cleanLinkAnswer,
  decodeConfigLink,
  encodeConfigLink,
  readConfigLink,
} from './configLink';
import { PUBLIC_TEXT_MAX } from '../../../lib/estimation/publicLimits';

const q = (
  code: string,
  answer_type: string,
  options: string[] | null = null,
  sort_order = 0,
): PublicQuestion => ({
  code,
  text: code,
  help_text: null,
  answer_type,
  options: options ? options.map((v) => ({ value: v, label: v })) : null,
  visible_if: null,
  group: 'projekt',
  sort_order,
});

const QUESTIONS: PublicQuestion[] = [
  q('project_goal', 'select', ['sklep', 'wizytowka', 'portal'], 1),
  q('languages', 'number', null, 2),
  q('views_count', 'number', null, 3),
  q('sensitive_data', 'bool', null, 4),
  q('modules', 'multiselect', ['blog', 'newsletter', 'faq', 'mapa'], 5),
  q('notes', 'text', null, 6),
];

/** Surowe `k` z dowolnej wartości JSON (do budowy złośliwych linków). */
const rawK = (json: string): string => {
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const kOf = (v: unknown) => rawK(JSON.stringify(v));
const decode = (k: string | null) => decodeConfigLink(k, QUESTIONS);
const refused = (k: string | null, reason: string) => {
  const r = decode(k);
  expect(r).toEqual({ ok: false, reason });
};
const accepted = (k: string, answers: Answers, skipped = 0) => {
  expect(decode(k)).toEqual({ ok: true, answers, skipped });
};

// --- K1: test własności ---------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const TEXT_CHARS = 'aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄĘŁŻ0123456789 .,;:!?()\'"%&+-/@#*_';

function randomAnswers(rnd: () => number): Answers {
  const out: Answers = {};
  const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
  for (const question of QUESTIONS) {
    if (rnd() < 0.3) continue;
    const opts = (question.options ?? []).map((o) => o.value);
    switch (question.answer_type) {
      case 'select':
        out[question.code] = opts[int(0, opts.length - 1)];
        break;
      case 'multiselect': {
        const pick = opts.filter(() => rnd() < 0.5);
        out[question.code] = pick.length ? pick : [opts[0]];
        break;
      }
      case 'number':
        out[question.code] = question.code === 'languages' ? int(1, 20) : int(1, 500);
        break;
      case 'bool':
        out[question.code] = rnd() < 0.5;
        break;
      case 'text': {
        const n = int(1, PUBLIC_TEXT_MAX);
        let s = '';
        for (let i = 0; i < n; i++) s += TEXT_CHARS[int(0, TEXT_CHARS.length - 1)];
        out[question.code] = s;
        break;
      }
    }
  }
  if (Object.keys(out).length === 0) out.project_goal = 'sklep';
  return out;
}

describe('K1 zapis -> odczyt (każdy typ pytania)', () => {
  it('400 losowych zestawów: te same odpowiedzi, 0 pominiętych, link ≤ limit', () => {
    const rnd = mulberry32(1791);
    const seenTypes = new Set<string>();
    let longest = 0;
    for (let i = 0; i < 400; i++) {
      const answers = randomAnswers(rnd);
      for (const code of Object.keys(answers))
        seenTypes.add(QUESTIONS.find((x) => x.code === code)!.answer_type);
      const k = encodeConfigLink(QUESTIONS, answers);
      expect(k).not.toBeNull();
      longest = Math.max(longest, k!.length);
      expect(decodeConfigLink(k, QUESTIONS)).toEqual({ ok: true, answers, skipped: 0 });
    }
    expect([...seenTypes].sort()).toEqual(['bool', 'multiselect', 'number', 'select', 'text']);
    expect(longest).toBeLessThanOrEqual(CONFIG_LINK_MAX);
  });

  it('granice: liczby na końcach zakresu, tekst 200 znaków, wszystkie opcje', () => {
    const answers: Answers = {
      project_goal: 'portal',
      languages: 20,
      views_count: 1,
      sensitive_data: false,
      modules: ['blog', 'newsletter', 'faq', 'mapa'],
      notes: 'ż'.repeat(PUBLIC_TEXT_MAX),
    };
    const k = encodeConfigLink(QUESTIONS, answers)!;
    expect(decodeConfigLink(k, QUESTIONS)).toEqual({ ok: true, answers, skipped: 0 });
  });

  it('zapis pomija odpowiedzi spoza allowlisty i kody spoza pytań; pusto = null', () => {
    expect(encodeConfigLink(QUESTIONS, {})).toBeNull();
    expect(encodeConfigLink(QUESTIONS, { obce: 'x', languages: 99 })).toBeNull();
    const k = encodeConfigLink(QUESTIONS, { project_goal: 'sklep', obce: 'x', languages: 99 })!;
    accepted(k, { project_goal: 'sklep' });
  });

  it('adres: tylko strona kalkulatora + ?k=, bez innych parametrów i kotwicy', () => {
    expect(buildConfigLinkUrl('https://mixturemarketing.pl/wycena/?utm_source=x#top', 'abc')).toBe(
      'https://mixturemarketing.pl/wycena/?k=abc',
    );
  });
});

// --- K2 / K6: formy ataku -------------------------------------------------------------------
describe('K2 całość odrzucona (pusty formularz, linia powodu), z bliźniakami', () => {
  afterEach(() => vi.restoreAllMocks());

  it('F1 brak parametru albo pusty k; bliźniak: poprawny k', () => {
    refused(null, LINK_REFUSAL.missing);
    refused('', LINK_REFUSAL.missing);
    expect(readConfigLink('?x=1', QUESTIONS)).toEqual({ ok: false, reason: LINK_REFUSAL.missing });
    accepted(kOf({ project_goal: 'sklep' }), { project_goal: 'sklep' });
  });

  it(`F2 k dłuższy niż ${CONFIG_LINK_MAX} znaków: odmowa BEZ dekodowania; bliźniak: ${CONFIG_LINK_MAX} znaków przechodzi bramkę długości`, () => {
    const atob = vi.spyOn(globalThis, 'atob');
    const parse = vi.spyOn(JSON, 'parse');
    const valid = kOf({ project_goal: 'sklep' });
    refused(valid + 'A'.repeat(CONFIG_LINK_MAX + 1 - valid.length), LINK_REFUSAL.tooLong);
    refused('A'.repeat(1_000_000), LINK_REFUSAL.tooLong);
    expect(atob).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
    // Bliźniak: dokładnie limit = bramka długości przepuszcza (dalej odmowa innego rodzaju).
    const atLimit = decode('A'.repeat(CONFIG_LINK_MAX));
    expect(atLimit.ok).toBe(false);
    expect((atLimit as { reason: string }).reason).not.toBe(LINK_REFUSAL.tooLong);
    expect(atob).toHaveBeenCalled();
    // Bliźniak: długi, ale poprawny link (tekst 200 znaków) jest przyjmowany.
    const notes = 'ą'.repeat(PUBLIC_TEXT_MAX);
    accepted(kOf({ project_goal: 'sklep', notes }), { project_goal: 'sklep', notes });
  });

  it('F3 znaki spoza base64url (padding =, +, /, %, spacja, znak niewidoczny); bliźniak: base64url', () => {
    const good = kOf({ project_goal: 'sklep' });
    for (const bad of [
      good + '==',
      good.replace(/.$/, '+'),
      good.replace(/.$/, '/'),
      '%3Cscript%3E',
      good + ' ',
      good + '​',
      good.slice(0, 4) + 'а' + good.slice(5),
    ])
      refused(bad, LINK_REFUSAL.charset);
    accepted(good, { project_goal: 'sklep' });
  });

  it('F4 zły zapis base64url albo UTF-8; bliźniak: ten sam tekst poprawnie', () => {
    refused('A', LINK_REFUSAL.encoding); // długość ≡ 1 (mod 4): atob rzuca
    const badUtf8 = btoa('\xff\xfe{}').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    refused(badUtf8, LINK_REFUSAL.encoding); // zły UTF-8 (fatal TextDecoder)
    accepted(rawK('{"project_goal":"sklep"}'), { project_goal: 'sklep' });
  });

  it('F5 zły JSON (ucięty, HTML zamiast JSON, NaN); bliźniak: poprawny JSON', () => {
    refused(rawK('{"project_goal":"sklep"'), LINK_REFUSAL.json);
    refused(rawK('<script>alert(1)</script>'), LINK_REFUSAL.json);
    refused(rawK('{"languages":NaN}'), LINK_REFUSAL.json);
    accepted(rawK('{"languages":3}'), { languages: 3 });
  });

  it('F6 JSON nie jest obiektem (tablica, liczba, napis, null, true); bliźniak: obiekt', () => {
    for (const v of [[['project_goal', 'sklep']], 1, 'sklep', null, true])
      refused(kOf(v), LINK_REFUSAL.notObject);
    accepted(kOf({ project_goal: 'sklep' }), { project_goal: 'sklep' });
  });

  it('F7 klucze __proto__ / constructor / prototype: odmowa całości, prototyp nietknięty; bliźniak bez nich', () => {
    for (const key of ['__proto__', 'constructor', 'prototype']) {
      const k = rawK(`{"project_goal":"sklep","${key}":{"polluted":true,"project_goal":"portal"}}`);
      refused(k, LINK_REFUSAL.forbiddenKey);
    }
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.prototype).not.toHaveProperty('polluted');
    accepted(
      rawK('{"project_goal":"sklep","proto":{"polluted":true}}'),
      { project_goal: 'sklep' },
      1,
    );
  });

  it('F8 dwa parametry k (zanieczyszczenie parametrów); bliźniak: jeden k', () => {
    const a = kOf({ project_goal: 'sklep' });
    const b = kOf({ project_goal: 'portal' });
    expect(readConfigLink(`?k=${a}&k=${b}`, QUESTIONS)).toEqual({
      ok: false,
      reason: LINK_REFUSAL.duplicated,
    });
    expect(readConfigLink(`?utm=1&k=${a}`, QUESTIONS)).toEqual({
      ok: true,
      answers: { project_goal: 'sklep' },
      skipped: 0,
    });
  });

  it('F9 same nieznane kody / same złe wartości = pusty formularz; bliźniak: jeden znany', () => {
    refused(kOf({ obce: 'x', toString: 'y', hasOwnProperty: 1 }), LINK_REFUSAL.empty);
    refused(kOf({ project_goal: '<script>alert(1)</script>' }), LINK_REFUSAL.empty);
    accepted(kOf({ obce: 'x', project_goal: 'sklep' }), { project_goal: 'sklep' }, 1);
  });
});

describe('K2 pojedyncze odpowiedzi pomijane (allowlista typu i opcji), z bliźniakami', () => {
  const only = (code: string, val: unknown) =>
    cleanLinkAnswer(
      QUESTIONS.find((x) => x.code === code)!,
      val,
    );

  it('F10 HTML i skrypt w tekście, nowa linia, NUL, < > \\; bliźniak: zwykły tekst', () => {
    for (const bad of [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      'a\nb',
      'a\u0000b',
      'a\\b',
      'javascript:alert(1)>',
    ])
      expect(only('notes', bad)).toBeUndefined();
    expect(only('notes', 'Sklep z kawą, 3 języki (PL/EN/DE) & płatności: 100%')).toBe(
      'Sklep z kawą, 3 języki (PL/EN/DE) & płatności: 100%',
    );
  });

  it('F11 tekst dłuższy niż 200 i pusty; bliźniak: 200 znaków', () => {
    expect(only('notes', 'a'.repeat(PUBLIC_TEXT_MAX + 1))).toBeUndefined();
    expect(only('notes', '')).toBeUndefined();
    expect(only('notes', 'a'.repeat(PUBLIC_TEXT_MAX))).toBe('a'.repeat(PUBLIC_TEXT_MAX));
  });

  it('F12 opcja spoza listy (wielkość liter, homoglif cyrylicy, toString, spacja); bliźniak: opcja z listy', () => {
    for (const bad of ['Sklep', 'sklеp', 'toString', ' sklep', 'sklep ', '__proto__'])
      expect(only('project_goal', bad)).toBeUndefined();
    expect(only('project_goal', 'sklep')).toBe('sklep');
  });

  it('F13 zły typ: bool jako 1 / "true", liczba jako napis / ułamek / poza zakresem / cyfry arabskie; bliźniaki', () => {
    expect(only('sensitive_data', 1)).toBeUndefined();
    expect(only('sensitive_data', 'true')).toBeUndefined();
    expect(only('sensitive_data', true)).toBe(true);
    for (const bad of ['3', 2.5, 0, 21, -1, '٣', null, [3], { v: 3 }])
      expect(only('languages', bad)).toBeUndefined();
    expect(only('languages', 3)).toBe(3);
    expect(only('views_count', 500)).toBe(500);
    expect(only('views_count', 501)).toBeUndefined();
  });

  it('F14 liczba bez zakresu A10 = pominięta (fail-closed); bliźniak: pole z zakresem', () => {
    const noRange = q('workshops_travel_km', 'number');
    expect(cleanLinkAnswer(noRange, 10)).toBeUndefined();
    expect(cleanLinkAnswer(q('constructor', 'number'), 3)).toBeUndefined();
    expect(only('languages', 10)).toBe(10);
  });

  it('F15 wielokrotny wybór: duplikaty, pusta lista, nie-napis, obiekt zamiast listy, opcja obca; bliźniak', () => {
    for (const bad of [
      ['blog', 'blog'],
      [],
      ['blog', 1],
      { 0: 'blog', length: 1 },
      ['blog', '<b>x</b>'],
      'blog',
      ['blog', 'newsletter', 'faq', 'mapa', 'blog'],
    ])
      expect(only('modules', bad)).toBeUndefined();
    expect(only('modules', ['faq', 'blog'])).toEqual(['faq', 'blog']);
  });

  it('F16 obiekt zagnieżdżony z __proto__ jako wartość; nieznany typ pytania; bliźniak', () => {
    const nested = JSON.parse('{"__proto__":{"polluted":true}}');
    expect(only('project_goal', nested)).toBeUndefined();
    expect(cleanLinkAnswer(q('x', 'file'), 'a')).toBeUndefined();
    expect(cleanLinkAnswer(q('x', 'select', ['a']), 'a')).toBe('a');
    expect(Object.prototype).not.toHaveProperty('polluted');
  });

  it('F17 link mieszany: dobre odpowiedzi zostają, złe pominięte i policzone', () => {
    accepted(
      kOf({
        project_goal: 'sklep',
        languages: '3',
        sensitive_data: true,
        modules: ['blog', 'obca'],
        notes: '<b>x</b>',
        obce: 1,
      }),
      { project_goal: 'sklep', sensitive_data: true },
      4,
    );
  });
});
