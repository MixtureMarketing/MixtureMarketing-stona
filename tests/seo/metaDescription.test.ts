import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { toMetaDescription, META_DESCRIPTION_MAX } from '../../utils/seo/metaDescription';

describe('toMetaDescription', () => {
  it('krótki opis zostaje bez zmian', () => {
    expect(toMetaDescription('Krótki opis strony.')).toBe('Krótki opis strony.');
  });

  it('usuwa HTML (podtytuły artykułów z linkami) i zbija spacje', () => {
    expect(toMetaDescription('Masz <a href="/x/" class="y">budżet</a>\n  i  plan &amp; cel')).toBe(
      'Masz budżet i plan & cel',
    );
  });

  it('przycina do ≤160 znaków na granicy słowa, z wielokropkiem', () => {
    const long = 'Słowo '.repeat(60);
    const out = toMetaDescription(long);
    expect(out.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(out.endsWith('Słowo…')).toBe(true);
  });

  it('null/undefined → pusty string', () => {
    expect(toMetaDescription(undefined)).toBe('');
    expect(toMetaDescription(null)).toBe('');
  });
});

// Opisy pisane ręcznie mają się mieścić same (bezpiecznik w Seo.tsx jest dla CMS-u —
// ucięcie z „…" w ręcznie pisanym tekście to błąd redakcyjny, nie rozwiązanie).
describe('ręcznie pisane meta description ≤ 160 znaków', () => {
  const root = path.resolve(__dirname, '../..');
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === 'portal' ? [] : walk(p);
      return /\.tsx?$/.test(e.name) ? [p] : [];
    });

  it('<Seo description="…"> i seo: { description } w data/content', () => {
    const tooLong: string[] = [];
    let checked = 0;
    for (const file of [...walk(path.join(root, 'components')), ...walk(path.join(root, 'data'))]) {
      const src = fs.readFileSync(file, 'utf8');
      const rel = path.relative(root, file);
      // <Seo … description="…">
      for (const m of src.matchAll(/<Seo\b[^>]*?\bdescription="([^"]*)"/gs)) {
        checked += 1;
        if (m[1].length > META_DESCRIPTION_MAX) tooLong.push(`${rel}: ${m[1].length}`);
      }
      // seo: { title: '…', description: '…' }
      for (const m of src.matchAll(/\bseo:\s*\{[^}]*?\bdescription:\s*'((?:\\'|[^'])*)'/gs)) {
        checked += 1;
        if (m[1].length > META_DESCRIPTION_MAX) tooLong.push(`${rel}: ${m[1].length}`);
      }
      // nagłówki artykułów: seoDescription: '…'
      for (const m of src.matchAll(/\bseoDescription:\s*'((?:\\'|[^'])*)'/g)) {
        checked += 1;
        if (m[1].length > META_DESCRIPTION_MAX) tooLong.push(`${rel}: ${m[1].length}`);
      }
    }
    expect(checked).toBeGreaterThan(20);
    expect(tooLong).toEqual([]);
  });
});
