import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// MIX-1397: Tailwind 4 generuje klase text-<nazwa> tylko z tokenu --text-<nazwa> w @theme.
// Token --font-size-xxxs nie tworzyl klasy text-xxxs (ok. 30 uzyc bez efektu).
const css = fs.readFileSync(path.resolve(__dirname, '../../index.css'), 'utf8');
const theme = css.slice(css.indexOf('@theme'));

describe('index.css: token rozmiaru czcionki text-xxxs (MIX-1397)', () => {
  it('@theme definiuje --text-xxxs: 0.5rem', () => {
    expect(theme).toMatch(/--text-xxxs:\s*0\.5rem;/);
  });
  it('nie ma starej nazwy --font-size-xxxs (nie tworzy klasy)', () => {
    expect(css).not.toMatch(/--font-size-xxxs/);
  });
  it('tokeny text-xxs i text-xxxs maja rozne wartosci (xxxs < xxs)', () => {
    const rem = (n: string) =>
      parseFloat(theme.match(new RegExp(`--text-${n}:\\s*([\\d.]+)rem;`))![1]);
    expect(rem('xxxs')).toBeLessThan(rem('xxs'));
  });
});
