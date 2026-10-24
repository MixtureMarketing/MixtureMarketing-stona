import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Regresja (audyt renderowania 2026-10-24): treści artykułów w data/content/articles mają
 * inline HTML (<strong>, <a href>). Wstawione jako dziecko JSX — `<p>{CONTENT.x.text}</p>` —
 * renderowały się jako surowy tekst „<strong>Warstwa Cache</strong>" (redis, elasticsearch,
 * audyt UX, google-ads, tailwind). Taki tekst musi iść przez dangerouslySetInnerHTML.
 */
const ROOT = path.resolve(__dirname, '../..');
const ARTICLES = path.join(ROOT, 'components/articles');
const IMPORT_RE =
  /import \{ (\w+)(?: as (\w+))? \} from '\.\.\/\.\.\/data\/content\/articles\/([\w-]+)'/g;
const HTML_RE = /<\/?[a-z][^>]*>/i;

const MODULES = import.meta.glob<Record<string, unknown>>('/data/content/articles/*.ts', {
  eager: true,
});

const resolve = (obj: unknown, accessor: string): unknown =>
  accessor
    .split(/\.|\[(\d+)\]/)
    .filter(Boolean)
    .reduce<unknown>((o, key) => (o as Record<string, unknown> | undefined)?.[key], obj);

describe('artykuły — treść z inline HTML nie jest wstawiana jako tekst JSX', () => {
  it('żadne {CONTENT…} z tagami HTML nie jest dzieckiem tekstowym', () => {
    const offenders: string[] = [];
    for (const file of fs.readdirSync(ARTICLES).filter((f) => f.endsWith('.tsx'))) {
      const src = fs.readFileSync(path.join(ARTICLES, file), 'utf8');
      for (const [, name, alias, mod] of src.matchAll(IMPORT_RE)) {
        const data = MODULES[`/data/content/articles/${mod}.ts`];
        expect(data, `${file}: brak modułu ${mod}`).toBeTruthy();
        const local = alias ?? name;
        const childRe = new RegExp(`>\\s*\\{${local}((?:\\.\\w+|\\[\\d+\\])+)\\}\\s*<`, 'g');
        for (const [, accessor] of src.matchAll(childRe)) {
          const value = resolve(data[name], accessor.slice(1));
          if (typeof value === 'string' && HTML_RE.test(value)) {
            offenders.push(`${file}: {${local}${accessor}}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
