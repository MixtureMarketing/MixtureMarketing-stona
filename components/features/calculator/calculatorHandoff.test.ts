// MIX-1815 (Z11): tekst konfiguracji dla /contact/ i odczyt stanu historii jako allowlista.
import { describe, it, expect } from 'vitest';
import type { PublicQuestion } from '../../../services/calculatorService';
import {
  answerLabel,
  buildHandoff,
  buildHandoffText,
  handoffState,
  HANDOFF_EMAIL_MAX,
  HANDOFF_KEY,
  HANDOFF_TEXT_MAX,
  HANDOFF_VERSION,
  P4_TEXTS,
  readHandoff,
  withP4Texts,
} from './calculatorHandoff';

const q = (code: string, answer_type: string, options?: [string, string][]): PublicQuestion => ({
  code,
  text: `Pytanie ${code}?`,
  help_text: null,
  answer_type,
  options: options ? options.map(([value, label]) => ({ value, label })) : null,
  visible_if: null,
  group: 'g',
  sort_order: 0,
});

const GOAL = q('project_goal', 'select', [
  ['sklep', 'Sklep internetowy'],
  ['portal', 'Portal'],
]);
const LANGS = q('languages', 'multiselect', [
  ['pl', 'Polski'],
  ['en', 'Angielski'],
]);
const BLOG = q('blog', 'bool');
const VIEWS = q('views_count', 'number');
const NOTE = q('note', 'text');
const RANGE = { min: 27500, max: 53000 };
const NB = ' ';

describe('answerLabel: odpowiedź słowami', () => {
  it('select i multiselect = etykiety, nie kody', () => {
    expect(answerLabel(GOAL, 'portal')).toBe('Portal');
    expect(answerLabel(LANGS, ['pl', 'en'])).toBe('Polski, Angielski');
  });
  it('bool, number, text', () => {
    expect(answerLabel(BLOG, true)).toBe('Tak');
    expect(answerLabel(BLOG, false)).toBe('Nie');
    expect(answerLabel(VIEWS, 6)).toBe('6');
    expect(answerLabel(VIEWS, 0)).toBe('0');
    expect(answerLabel(NOTE, '  Rzeszów ')).toBe('Rzeszów');
  });
  it('nieznana opcja, zły typ, puste = null', () => {
    expect(answerLabel(GOAL, 'inne')).toBeNull();
    expect(answerLabel(GOAL, 1)).toBeNull();
    expect(answerLabel(LANGS, ['pl', 'xx'])).toBeNull();
    expect(answerLabel(LANGS, [])).toBeNull();
    expect(answerLabel(LANGS, 'pl')).toBeNull();
    expect(answerLabel(BLOG, 'true')).toBeNull();
    expect(answerLabel(VIEWS, '6')).toBeNull();
    expect(answerLabel(VIEWS, Number.NaN)).toBeNull();
    expect(answerLabel(NOTE, '   ')).toBeNull();
    expect(answerLabel(q('x', 'date'), '2026')).toBeNull();
  });
});

describe('buildHandoffText', () => {
  const QS = [GOAL, LANGS, BLOG, VIEWS];
  it('nagłówek, widełki netto, odpowiedzi w kolejności pytań, link', () => {
    const t = buildHandoffText(
      QS,
      { views_count: 6, project_goal: 'portal', blog: false },
      RANGE,
      'https://x/wycena/?k=abc',
    );
    expect(t.split('\n')).toEqual([
      'Konfiguracja z kalkulatora wyceny (/wycena/):',
      `Widełki: 27${NB}500 – 53${NB}000 zł netto`,
      '- Pytanie project_goal? Portal',
      '- Pytanie blog? Nie',
      '- Pytanie views_count? 6',
      'Link do konfiguracji: https://x/wycena/?k=abc',
    ]);
  });
  it('bez linku i bez odpowiedzi spoza pytań', () => {
    const t = buildHandoffText(QS, { project_goal: 'portal', obce: 'x' }, RANGE, null);
    expect(t).not.toContain('Link');
    expect(t).not.toContain('obce');
    expect(t.split('\n')).toHaveLength(3);
  });
  it('za długi: najpierw wypada link, potem ostatnie odpowiedzi; nagłówek zostaje', () => {
    const long = q('long', 'text');
    long.text = 'D'.repeat(700);
    const qs = [GOAL, { ...long, code: 'a' }, { ...long, code: 'b' }];
    const ans = { project_goal: 'portal', a: 'x', b: 'y' };
    const t = buildHandoffText(qs, ans, RANGE, 'https://x/?k=' + 'k'.repeat(100));
    expect(t.length).toBeLessThanOrEqual(HANDOFF_TEXT_MAX);
    expect(t).not.toContain('Link do konfiguracji');
    expect(t).toContain('- Pytanie project_goal? Portal');
    expect(t).toContain(' x');
    expect(t).not.toContain(' y');
    // Krótki tekst z długim linkiem mieszczącym się w limicie: link zostaje.
    const ok = buildHandoffText([GOAL], { project_goal: 'portal' }, RANGE, 'https://x/?k=abc');
    expect(ok).toContain('Link do konfiguracji: https://x/?k=abc');
  });
  it('tekst dokładnie na limicie zostaje z linkiem', () => {
    const base = buildHandoffText([GOAL], { project_goal: 'portal' }, RANGE, 'L');
    const pad = HANDOFF_TEXT_MAX - base.length;
    const t = buildHandoffText([GOAL], { project_goal: 'portal' }, RANGE, 'L' + 'z'.repeat(pad));
    expect(t.length).toBe(HANDOFF_TEXT_MAX);
    expect(t.endsWith('z')).toBe(true);
    const over = buildHandoffText(
      [GOAL],
      { project_goal: 'portal' },
      RANGE,
      'L' + 'z'.repeat(pad + 1),
    );
    expect(over).not.toContain('Link');
    // Wystarczy zdjąć link: odpowiedzi zostają wszystkie.
    expect(over).toContain('- Pytanie project_goal? Portal');
  });
  it('nawet sam nagłówek nie przekracza limitu', () => {
    const t = buildHandoffText([], {}, { min: 1e300, max: 1e300 }, null);
    expect(t.length).toBeLessThanOrEqual(HANDOFF_TEXT_MAX);
  });
});

describe('buildHandoff i readHandoff', () => {
  it('zapis -> odczyt oddaje to samo; e-mail przycięty', () => {
    const h = buildHandoff([GOAL], { project_goal: 'portal' }, RANGE, '  jan@firma.pl ', null);
    expect(h.v).toBe(HANDOFF_VERSION);
    expect(h.email).toBe('jan@firma.pl');
    expect(readHandoff(handoffState(h))).toEqual(h);
    expect(Object.keys(handoffState(h))).toEqual([HANDOFF_KEY]);
  });
  it('za długi e-mail nie jest przenoszony', () => {
    const long = 'a'.repeat(HANDOFF_EMAIL_MAX) + '@x.pl';
    expect(buildHandoff([GOAL], {}, RANGE, long, null).email).toBe('');
    const max = 'a'.repeat(HANDOFF_EMAIL_MAX);
    expect(buildHandoff([GOAL], {}, RANGE, max, null).email).toBe(max);
  });
  const good = { v: HANDOFF_VERSION, text: 'Konfiguracja', email: '' };
  it('formy ataku i złe kształty = null', () => {
    const bad: unknown[] = [
      null,
      undefined,
      'calculatorConfig',
      42,
      [],
      [good],
      {},
      { inne: good },
      { [HANDOFF_KEY]: null },
      { [HANDOFF_KEY]: 'tekst' },
      { [HANDOFF_KEY]: [good] },
      // Tablica z polami v/text/email (klon strukturalny zachowuje własne pola tablicy).
      { [HANDOFF_KEY]: Object.assign([], good) },
      { [HANDOFF_KEY]: { ...good, v: 2 } },
      { [HANDOFF_KEY]: { ...good, v: '1' } },
      { [HANDOFF_KEY]: { ...good, text: '' } },
      { [HANDOFF_KEY]: { ...good, text: '   ' } },
      { [HANDOFF_KEY]: { ...good, text: 5 } },
      { [HANDOFF_KEY]: { ...good, text: 'x'.repeat(HANDOFF_TEXT_MAX + 1) } },
      { [HANDOFF_KEY]: { ...good, email: undefined } },
      { [HANDOFF_KEY]: { ...good, email: 7 } },
      { [HANDOFF_KEY]: { ...good, email: 'a'.repeat(HANDOFF_EMAIL_MAX + 1) } },
      Object.create({ [HANDOFF_KEY]: good }),
    ];
    for (const s of bad) expect(readHandoff(s)).toBeNull();
  });
  it('na granicach i bez pól dodatkowych', () => {
    const edge = { v: HANDOFF_VERSION, text: 'x'.repeat(HANDOFF_TEXT_MAX), email: 'a'.repeat(254) };
    expect(readHandoff({ [HANDOFF_KEY]: edge })).toEqual(edge);
    const r = readHandoff({ [HANDOFF_KEY]: { ...good, html: '<img onerror=1>', isAdmin: true } });
    expect(r).toEqual(good);
    expect(Object.keys(r!).sort()).toEqual(['email', 'text', 'v']);
  });
});

describe('withP4Texts', () => {
  it('podmienia tylko pytania z P4, nie zmienia wejścia', () => {
    const qs = [VIEWS, GOAL, q('sensitive_data', 'bool')];
    const out = withP4Texts(qs);
    expect(out[0].text).toBe(P4_TEXTS.views_count);
    expect(out[1]).toBe(GOAL);
    expect(out[2].text).toBe(P4_TEXTS.sensitive_data);
    expect(VIEWS.text).toBe('Pytanie views_count?');
  });
  it('treść P4 = decyzja Jakuba (SPEC-MIX-1320 P4 A)', () => {
    expect(P4_TEXTS).toEqual({
      views_count: 'Ile mniej więcej podstron? (Start, O nas, Oferta, Kontakt = 4)',
      sensitive_data:
        'Czy strona przyjmie płatności albo dane medyczne/finansowe inaczej niż przez operatora płatności?',
    });
    expect(withP4Texts([q('__proto__', 'bool')])[0].text).toBe('Pytanie __proto__?');
  });
});
