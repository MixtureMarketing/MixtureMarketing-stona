import { describe, it, expect } from 'vitest';
import { escapeHtml, escapeHtmlMultiline, safeHttpUrl, sha256Hex } from './security';

describe('escapeHtml', () => {
  it('escapuje znaki HTML i cudzysłowy', () => {
    expect(escapeHtml(`<a href="x">'y'&</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;y&#39;&amp;&lt;/a&gt;',
    );
  });
  it('null/undefined → pusty string', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
  it('wersja wieloliniowa zamienia nowe linie na <br> po escapowaniu', () => {
    expect(escapeHtmlMultiline('a<b>\nc\r\nd')).toBe('a&lt;b&gt;<br>c<br>d');
  });
});

describe('safeHttpUrl', () => {
  it('przepuszcza http/https', () => {
    expect(safeHttpUrl('https://firma.pl/a?b=1')).toBe('https://firma.pl/a?b=1');
    expect(safeHttpUrl('http://firma.pl')).toBe('http://firma.pl/');
  });
  it('dokłada https do adresu bez schematu', () => {
    expect(safeHttpUrl('firma.pl')).toBe('https://firma.pl/');
  });
  it('odrzuca inne schematy, dane logowania i śmieci', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('data:text/html,x')).toBeNull();
    expect(safeHttpUrl('ftp://firma.pl')).toBeNull();
    expect(safeHttpUrl('https://user:pass@firma.pl')).toBeNull();
    expect(safeHttpUrl('')).toBeNull();
    expect(safeHttpUrl('https://' + 'a'.repeat(3000))).toBeNull();
  });
  it('wynik nie zawiera surowych znaków HTML (bezpieczny w href po escapowaniu)', () => {
    const u = safeHttpUrl('https://firma.pl/"><img src=x>');
    expect(u).not.toBeNull();
    expect(u).not.toContain('"');
    expect(u).not.toContain('<');
  });
});

describe('sha256Hex', () => {
  it('daje stabilny skrót hex', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});
