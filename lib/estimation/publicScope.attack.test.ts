// MIX-1810 (K1): formy ataku weryfikatora MIX-1808 (runda Opus, WERDYKT-MIX-1808), skopiowane do repo:
// 29 form odmowy (serwer + klient + opis, każda z bliźniakiem z literą Q), 15 bliźniaków dozwolonych,
// fail-closed, niezmienność wejścia, czas liniowy, zbłąkane U+FE0F (kolejność kroków). Zabija mutanty,
// które przeżyły testy kodera MIX-1808: U+FE00–FE0E, CR w środku, kolejność kroków, keycap # i *.
// Każdy znak niewidoczny budowany przez String.fromCodePoint, nigdy wpisany wprost.
import { describe, it, expect } from 'vitest';
import { toPublicScope, cleanClientText, stripInvisible } from './publicScope';
import { parseScope } from '../../services/pricePreviewService';

const cp = (...c: number[]) => String.fromCodePoint(...c);
const range = (a: number, b: number) => {
  const o: number[] = [];
  for (let i = a; i <= b; i++) o.push(i);
  return o;
};
const srv = (n: unknown, d: unknown = 'Opis') =>
  toPublicScope([{ hoursMax: 5, clientName: n, levelClientDescription: d } as never]);
const cli = (n: unknown, d: unknown = 'Opis') =>
  parseScope([{ client_name: n, client_description: d }]);
const both = (n: unknown) => [srv(n), cli(n)];
const one = (t: string) => [{ client_name: t, client_description: 'Opis' }];
const withQ = (bad: string) => {
  const a = Array.from(bad);
  const k = Math.floor(a.length / 2);
  return [...a.slice(0, k), 'Q', ...a.slice(k)].join('');
};

const MIXALL = cp(
  0xd800,
  0x206a,
  0xfe0f,
  0x034f,
  0x3164,
  0x115f,
  0x180e,
  0xfff9,
  0xe0001,
  0x200b,
  0x00ad,
  0x0007,
  0x0085,
  0xfe00,
  0x1160,
  0xffa0,
  0x17b4,
  0xe0100,
);
const REFUSE: Array<[string, string]> = [
  ['R1 lone U+D800', '\uD800'],
  ['R2 U+206A..206F', cp(...range(0x206a, 0x206f))],
  ['R3 U+FE0F alone', cp(0xfe0f)],
  ['R4 U+034F', cp(0x034f)],
  ['R5 U+3164', cp(0x3164)],
  ['R6 U+115F', cp(0x115f)],
  ['R7 U+180E', cp(0x180e)],
  ['R8 U+FFF9..FFFB', cp(0xfff9, 0xfffa, 0xfffb)],
  ['R9 U+E0001', cp(0xe0001)],
  ['R10 U+200B+U+FE0F mix x50', cp(0x200b, 0xfe0f).repeat(50)],
  ['R11 100k invisible run (all classes)', MIXALL.repeat(Math.ceil(100000 / MIXALL.length))],
  ['R12 U+FE01 alone', cp(0xfe01)],
  ['R13 U+FE0E alone', cp(0xfe0e)],
  [
    'R14 FE00..FE0E each, spaced',
    range(0xfe00, 0xfe0e)
      .map((c) => cp(c))
      .join(' '),
  ],
  ['R15 NBSP + FE0F (non-pictographic base)', cp(0x00a0, 0xfe0f)],
  ['R16 ZWJ x3', cp(0x200d, 0x200d, 0x200d)],
  ['R17 U+2061..2064 invisible operators', cp(...range(0x2061, 0x2064))],
  ['R18 U+1D173..1D17A musical format', cp(...range(0x1d173, 0x1d17a))],
  ['R19 U+1BCA0..1BCA3 shorthand format', cp(...range(0x1bca0, 0x1bca3))],
  ['R20 BOM x10 + spaces', ` ${cp(0xfeff).repeat(10)} `],
  ['R21 U+3000 ideographic space', cp(0x3000, 0x3000)],
  ['R22 U+E0100 + U+E01EF', cp(0xe0100, 0xe01ef)],
  ['R23 U+3164 + U+FE0F (filler is no base)', cp(0x3164, 0xfe0f)],
  ['R24 U+00AD + U+061C', cp(0x00ad, 0x061c)],
  ['R25 tab LF CR only', '\t\n\r \r\n\t'],
  ['R26 U+2028 U+2029 U+0085', cp(0x2028, 0x2029, 0x0085)],
  ['R27 unassigned in set U+FFF0 U+E0080 U+E0FFF', cp(0xfff0, 0xe0080, 0xe0fff)],
  ['R28 lone low U+DC00 + ZWSP + NBSP', `\uDC00${cp(0x200b, 0x00a0)}`],
  ['R29 VT FF + C1', cp(0x000b, 0x000c, 0x0080, 0x009f)],
];

describe('MIX-1810 (WER-1808) refuse forms (server + client + description) with Q twin', () => {
  for (const [n, bad] of REFUSE)
    it(n, () => {
      expect(both(bad)).toEqual([[], []]);
      expect(cleanClientText(bad, 500)).toBeNull();
      expect(srv('SEO', bad)).toEqual([{ client_name: 'SEO', client_description: null }]);
      expect(cli('SEO', bad)).toEqual([{ client_name: 'SEO', client_description: null }]);
      const twin = withQ(bad);
      expect(both(twin)).toEqual([one('Q'), one('Q')]);
    });
});

const TWINS: Array<[string, string]> = [
  ['T1 letter', 'A'],
  ['T2 heart+FE0F alone', cp(0x2764, 0xfe0f)],
  ['T3 keycap 1', cp(0x31, 0xfe0f, 0x20e3)],
  ['T4 keycap #', cp(0x23, 0xfe0f, 0x20e3)],
  ['T5 keycap *', cp(0x2a, 0xfe0f, 0x20e3)],
  ['T6 smiley+FE0E text style', cp(0x263a, 0xfe0e)],
  ['T7 copyright+FE0F', cp(0xa9, 0xfe0f)],
  ['T8 Hangul syllable', cp(0xd55c, 0xae00)],
  ['T9 Polish', 'Zażółć gęślą jaźń'],
  ['T10 NBSP-separated words', `dwa${cp(0xa0)}słowa${cp(0xa0)}trzy`],
  ['T11 CRLF inside', 'a\r\nb'],
  ['T12 tab inside', 'a\tb'],
  ['T13 decomposed e+U+0301', `e${cp(0x301)}`],
  ['T14 astral emoji', cp(0x1f600)],
  ['T15 thin/narrow spaces inside', `a${cp(0x2009)}b${cp(0x202f)}c`],
];
describe('MIX-1810 (WER-1808) allowed twins pass unchanged', () => {
  for (const [n, t] of TWINS)
    it(n, () => {
      expect(both(t)).toEqual([one(t), one(t)]);
      expect(srv('SEO', t)).toEqual([{ client_name: 'SEO', client_description: t }]);
    });
});

describe('MIX-1810 (WER-1808) fail-closed, immutability, ReDoS', () => {
  it('non-string and empty inputs are skipped', () => {
    for (const v of [
      undefined,
      null,
      0,
      1,
      NaN,
      true,
      {},
      [],
      ['A'],
      '',
      '   ',
      { toString: () => 'A' },
    ])
      expect(both(v)).toEqual([[], []]);
  });
  it('frozen input records are not mutated (strict mode would throw)', () => {
    const r = Object.freeze({ client_name: `${cp(0x3164)}A`, client_description: '\uD800x' });
    const s = JSON.stringify(r);
    expect(parseScope(Object.freeze([r]))).toEqual([{ client_name: 'A', client_description: 'x' }]);
    expect(JSON.stringify(r)).toBe(s);
    const a = Object.freeze({
      hoursMax: 5,
      clientName: `A${cp(0xfe0f)}`,
      levelClientDescription: cp(0x206f),
    });
    expect(toPublicScope([a as never])).toEqual([{ client_name: 'A', client_description: null }]);
  });
  it('linear time on adversarial 1M inputs', () => {
    const ins = [
      cp(0xfe0f).repeat(1_000_000),
      cp(0x2764, 0xfe0f).repeat(500_000),
      cp(0x31, 0xfe0f).repeat(500_000),
      cp(0x2764).repeat(1_000_000) + cp(0xfe0f),
      cp(0x200b, 0xfe0f).repeat(500_000),
      MIXALL.repeat(60_000),
      '\uD800'.repeat(1_000_000),
      `${' '.repeat(1_000_000)}x${' '.repeat(1_000_000)}`,
    ];
    const t0 = Date.now();
    for (const i of ins) cleanClientText(i, 500);
    const ms = Date.now() - t0;
    expect(ms).toBeLessThan(5000);
  });
  it('stray FE0F around a kept emoji', () => {
    expect(stripInvisible(cp(0xfe0f, 0x2764, 0xfe0f, 0xfe0f))).toBe(cp(0x2764, 0xfe0f));
    expect(stripInvisible(cp(0x2764, 0x200b, 0xfe0f))).toBe(cp(0x2764, 0xfe0f));
  });
});
