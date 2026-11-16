// MIX-1808: nazwa / opis złożone z samych znaków niewidocznych (nie tylko bidi i C0/C1 z MIX-1799)
// jest pominięta (nazwa) albo null (opis), po stronie serwera (toPublicScope) i klienta (parseScope).
// Formy z testu ataku weryfikatora MIX-1799 (WER-1799, attack.test.tsx), skopiowane tu.
import { describe, it, expect } from 'vitest';
import { toPublicScope, cleanClientText, stripInvisible, SCOPE_NAME_MAX } from './publicScope';
import { parseScope } from '../../services/pricePreviewService';

const srv = (name: unknown, desc: unknown = 'Opis') =>
  toPublicScope([{ hoursMax: 5, clientName: name, levelClientDescription: desc } as never]);
const cli = (name: unknown, desc: unknown = 'Opis') =>
  parseScope([{ client_name: name, client_description: desc }]);
const both = (name: unknown) => [srv(name), cli(name)];

// [forma, odrzucony tekst, bliźniak z literą, oczekiwana nazwa bliźniaka]
const FORMS: Array<[string, string, string, string]> = [
  ['V1 U+202E', '‮', '‮A', 'A'],
  ['V2 U+2066..2069', '⁦⁩⁧⁨⁩', '⁦Sklep⁩', 'Sklep'],
  ['V3 NUL/BEL', '\u0000\u0007\u0000', '\u0000a\u0007', 'a'],
  ['V4 ZW + bidi + BOM', '​‮‍⁧﻿؜', '​‮x‍', 'x'],
  ['V5 sterujące + spacje', ' \u0001 \t \u0007\n \u001F\r ', ' \u0001 SEO \u0007 ', 'SEO'],
  ['V6 długi ciąg sterujących', '\u0000'.repeat(100000), `${'\u0000'.repeat(100000)}b`, 'b'],
  ['V7 C1 + DEL', '\u007F\u0085\u009F\u0080', '\u007FZ\u0085', 'Z'],
  ['V8 U+202A..202E', '‪‫‬‭‮', '‪q‬', 'q'],
  ['N1 samotny surogat U+D800', '\uD800', '\uD800Ł', 'Ł'],
  ['N2 samotny surogat niski U+DC00 + spacja', ' \uDC00 ', '\uDC00ż ', 'ż'],
  ['N3 U+206A..206F', '⁪⁫⁬⁭⁮⁯', '⁪a⁯', 'a'],
  ['N4 U+FE0F', '️', '️A', 'A'],
  ['N5 U+034F', '͏', '͏b', 'b'],
  ['N6 U+3164', 'ㅤ', 'ㅤc', 'c'],
  ['N7 U+115F, U+1160', 'ᅟᅠ', 'ᅟdᅠ', 'd'],
  ['N8 U+FFA0', 'ﾠ', 'ﾠe', 'e'],
  ['N9 U+180B..180F (180E)', '᠋᠌᠍᠎᠏', '᠎f', 'f'],
  ['N10 U+FFF9..FFFB', '￹￺￻', '￹g￻', 'g'],
  ['N11 tagi U+E0001, U+E0100', '\u{E0001}\u{E0100}\u{E0FFF}', '\u{E0001}h', 'h'],
  ['N12 mieszanka ze spacjami i NBSP', ' ㅤ  ️ \u{E0001}\uD800 ', 'ㅤ  i ', 'i'],
  ['N13 U+17B4, U+FFF0', '឴឵￰', '឴j', 'j'],
];

describe('MIX-1808: nazwa z samych niewidocznych znaków = pominięta (serwer + klient)', () => {
  for (const [nm, bad, twin, exp] of FORMS) {
    it(nm, () => {
      expect(both(bad)).toEqual([[], []]);
      expect(cleanClientText(bad, 500)).toBeNull();
      expect(both(twin)).toEqual([
        [{ client_name: exp, client_description: 'Opis' }],
        [{ client_name: exp, client_description: 'Opis' }],
      ]);
      expect(srv('SEO', bad)).toEqual([{ client_name: 'SEO', client_description: null }]);
      expect(cli('SEO', bad)).toEqual([{ client_name: 'SEO', client_description: null }]);
    });
  }

  it('bliźniaki dozwolone: jedna litera / emoji z U+FE0F / hangul / polskie / NBSP bez zmian', () => {
    const same = ['A', '❤️', '1️⃣', '😀', '한', 'Zażółć gęślą jaźń', 'dwa słowa', '👨💻'];
    for (const t of same)
      expect(both(t)).toEqual([
        [{ client_name: t, client_description: 'Opis' }],
        [{ client_name: t, client_description: 'Opis' }],
      ]);
    expect(stripInvisible('❤️')).toBe('❤️');
    expect(stripInvisible('A️')).toBe('A');
    expect(stripInvisible('️❤️')).toBe('❤️');
  });
  it('niewidoczny w środku nazwy znika, nazwa zostaje; nowa linia i tabulacja zostają', () => {
    expect(cleanClientText('Skㅤle\uD800p⁯', 120)).toBe('Sklep');
    expect(cleanClientText('a\nb\tc', 120)).toBe('a\nb\tc');
  });
  it(`za długa nazwa po oczyszczeniu = pominięta; w limicie = jest`, () => {
    expect(
      cleanClientText(`${'ㅤ'.repeat(5000)}${'a'.repeat(SCOPE_NAME_MAX)}`, SCOPE_NAME_MAX),
    ).toBe('a'.repeat(SCOPE_NAME_MAX));
    expect(cleanClientText('a'.repeat(SCOPE_NAME_MAX + 1), SCOPE_NAME_MAX)).toBeNull();
  });
  it('dane wejściowe nie są zmieniane; nie-tekst odrzucony', () => {
    const rec = { client_name: 'ㅤSEO', client_description: '\uD800x' };
    const snap = JSON.stringify(rec);
    parseScope([rec]);
    expect(JSON.stringify(rec)).toBe(snap);
    const a = { hoursMax: 5, clientName: 'ㅤSEO', levelClientDescription: '⁯d' };
    const snapA = JSON.stringify(a);
    toPublicScope([a as never]);
    expect(JSON.stringify(a)).toBe(snapA);
    for (const v of [1, null, undefined, {}, ['a']]) expect(both(v)).toEqual([[], []]);
  });
});
