// MIX-1810 (K2, K3): nazwa / opis zostaje tylko z co najmniej jednym znakiem widocznym
// (\p{L} | \p{N} | \p{P} | \p{S}, bez symboli o pustym glifie U+2800, U+FFFC, U+1D159) po usunięciu
// znaków niewidocznych. Ten sam helper po stronie serwera (toPublicScope) i klienta (parseScope).
// Każdy znak spoza ASCII budowany przez String.fromCodePoint, nigdy wpisany wprost.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { toPublicScope, cleanClientText, stripInvisible } from './publicScope';
import { parseScope } from '../../services/pricePreviewService';

const cp = (...c: number[]) => String.fromCodePoint(...c);
const srv = (n: unknown, d: unknown = 'Opis') =>
  toPublicScope([{ hoursMax: 5, clientName: n, levelClientDescription: d } as never]);
const cli = (n: unknown, d: unknown = 'Opis') =>
  parseScope([{ client_name: n, client_description: d }]);
const both = (n: unknown) => [srv(n), cli(n)];
const one = (t: string) => [{ client_name: t, client_description: 'Opis' }];

// [forma, tekst bez znaku widocznego, bliźniak z literą, oczekiwana nazwa bliźniaka]
const BLANK: Array<[string, string, string, string]> = [
  ['W1 U+2800 pusty brajl', cp(0x2800), `${cp(0x2800)}A`, `${cp(0x2800)}A`],
  [
    'W2 U+2800 ze spacjami',
    ` ${cp(0x2800)} ${cp(0x2800)} `,
    ` ${cp(0x2800)} B `,
    `${cp(0x2800)} B`,
  ],
  ['W3 U+2065 nieprzypisany', cp(0x2065), `C${cp(0x2065)}`, `C${cp(0x2065)}`],
  ['W4 U+FFFC zastępczy obiekt', cp(0xfffc), `${cp(0xfffc)}D`, `${cp(0xfffc)}D`],
  ['W5 U+16FE4 wypełniacz', cp(0x16fe4), `E${cp(0x16fe4)}`, `E${cp(0x16fe4)}`],
  ['W6 U+1D159 pusta nuta', cp(0x1d159), `F${cp(0x1d159)}`, `F${cp(0x1d159)}`],
  ['W7 samotny znak łączący U+0301', cp(0x301), `e${cp(0x301)}`, `e${cp(0x301)}`],
  ['W8 U+3164 + U+0301', cp(0x3164, 0x301), `${cp(0x3164)}G${cp(0x301)}`, `G${cp(0x301)}`],
  ['W9 prywatny U+E000', cp(0xe000), `H${cp(0xe000)}`, `H${cp(0xe000)}`],
  ['W10 nieznak U+FFFE', cp(0xfffe), `I${cp(0xfffe)}`, `I${cp(0xfffe)}`],
  [
    'W11 U+3164 + U+2800 (surowy tekst ma literę Lo)',
    cp(0x3164, 0x2800),
    `${cp(0x3164, 0x2800)}J`,
    `${cp(0x2800)}J`,
  ],
  [
    'W12 mieszanka W1-W6 z NBSP i spacjami',
    ` ${cp(0x2800, 0xa0, 0x2065, 0xfffc, 0x16fe4, 0x1d159)} `,
    ` ${cp(0x2800)}K${cp(0xfffc)} `,
    `${cp(0x2800)}K${cp(0xfffc)}`,
  ],
  [
    'W13 ciąg znaków łączących U+0300..036F',
    cp(...Array.from({ length: 112 }, (_, i) => 0x300 + i)),
    `L${cp(0x300)}`,
    `L${cp(0x300)}`,
  ],
  ['W14 samotny U+20E3 (keycap bez podstawy)', cp(0x20e3), `1${cp(0x20e3)}`, `1${cp(0x20e3)}`],
  [
    'W15 U+2800 x 1000 + U+FE0F',
    `${cp(0x2800).repeat(1000)}${cp(0xfe0f)}`,
    `${cp(0x2800).repeat(3)}M`,
    `${cp(0x2800).repeat(3)}M`,
  ],
];

describe('MIX-1810: bez znaku widocznego = pominięta nazwa / opis null (serwer + klient)', () => {
  for (const [nm, bad, twin, exp] of BLANK)
    it(nm, () => {
      expect(both(bad)).toEqual([[], []]);
      expect(cleanClientText(bad, 5000)).toBeNull();
      expect(srv('SEO', bad)).toEqual([{ client_name: 'SEO', client_description: null }]);
      expect(cli('SEO', bad)).toEqual([{ client_name: 'SEO', client_description: null }]);
      expect(both(twin)).toEqual([one(exp), one(exp)]);
    });
});

// Każda klasa znaku widocznego osobno wystarcza (zabija mutanty usuwające jedną klasę).
const VISIBLE_ALONE: Array<[string, string]> = [
  ['V-L litera', cp(0x141)],
  ['V-L hangul', cp(0xd55c)],
  ['V-N cyfry', '2026'],
  ['V-N ułamek No', cp(0xbd)],
  ['V-N rzymska Nl', cp(0x216b)],
  ['V-P interpunkcja', '?!'],
  ['V-P myślnik', cp(0x2014)],
  ['V-S plus Sm', '+'],
  ['V-S euro Sc', cp(0x20ac)],
  ['V-S emoji So', cp(0x1f600)],
  ['V-S serce + FE0F', cp(0x2764, 0xfe0f)],
  ['V-S odcień skóry Sk', cp(0x1f3fb)],
];
describe('MIX-1810: jedna klasa znaku widocznego wystarcza, tekst bez zmian', () => {
  for (const [nm, t] of VISIBLE_ALONE)
    it(nm, () => {
      expect(both(t)).toEqual([one(t), one(t)]);
      expect(srv('SEO', t)).toEqual([{ client_name: 'SEO', client_description: t }]);
    });

  it('piktogramy emoji spoza \\p{S} zachowują U+FE0F (‼ ⁉ ℹ 〰 〽)', () => {
    for (const c of [0x203c, 0x2049, 0x2139, 0x3030, 0x303d]) {
      const t = cp(c, 0xfe0f);
      expect(stripInvisible(t)).toBe(t);
      expect(both(t)).toEqual([one(t), one(t)]);
    }
    expect(stripInvisible(cp(0x41, 0xfe0f))).toBe('A');
  });

  it('wynik nie zależy od poprzedniego wywołania (brak stanu lastIndex)', () => {
    for (let i = 0; i < 4; i++) {
      expect(cleanClientText('Ab', 120)).toBe('Ab');
      expect(cleanClientText('A', 120)).toBe('A');
      expect(cleanClientText(cp(0x2800), 120)).toBeNull();
    }
  });
});

describe('MIX-1810 K3: wyrażenia helpera działają w najstarszym celu budowy', () => {
  const src = readFileSync(resolve(__dirname, 'publicScope.ts'), 'utf8');
  it('tylko kategorie ogólne w \\p{...}, bez lookbehind i bez flagi v', () => {
    const props = [...src.matchAll(/\\p\{([^}]+)\}/g)].map((m) => m[1]);
    expect(props.length).toBeGreaterThan(0);
    for (const p of props) expect(['L', 'N', 'P', 'S', 'Cc', 'Cf', 'Cs']).toContain(p);
    expect(src).not.toMatch(/\(\?<[=!]/);
    expect(src).not.toMatch(/\/[dgimsuy]*v[dgimsuy]*;/);
  });
});
