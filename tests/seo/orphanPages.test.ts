/**
 * Strażnik stron osieroconych: strony z sitemapy, które crawl produkcji (2026-10-24)
 * znalazł BEZ żadnego linku wewnętrznego, muszą mieć link z innego miejsca w kodzie
 * (stopka, hub, sekcja kontekstowa). Google znał je wyłącznie z sitemapy.
 *
 * Test statyczny: szuka literału ścieżki (ze slashem na końcu) w components/, data/
 * i services/cms/legacyArticles.ts (lista bazy wiedzy) — poza plikiem samej strony.
 * Strony /branza/<slug>/ linkuje hub /branza/ (lista z CMS) — tu pilnujemy huba.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** ścieżka → plik(i) samej strony (link z własnej strony się nie liczy) */
const MUST_BE_LINKED: Record<string, string[]> = {
  '/offers/': ['components/sections/Offers.tsx'],
  '/branza/': ['components/pages/IndustryHub.tsx'],
  '/abonament/professional/': ['components/pages/abonament/Professional.tsx'],
  '/abonament/vs-wix/': ['components/pages/abonament/VsWix.tsx'],
  '/abonament/vs-orange-klikai/': ['components/pages/abonament/VsOrange.tsx'],
  '/baza-wiedzy/ile-kosztuje-strona-internetowa-rzeszow-2026/': [
    'components/articles/IleKosztujeStronaRzeszowArticle.tsx',
  ],
};

const listFiles = (dir: string): string[] => {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) return e.name === 'portal' ? [] : listFiles(rel);
    return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [rel] : [];
  });
};

const files = [...listFiles('components'), ...listFiles('data'), 'services/cms/legacyArticles.ts'];
const sources = new Map(files.map((f) => [f, fs.readFileSync(path.join(ROOT, f), 'utf8')]));

describe('strony z sitemapy mają link wewnętrzny', () => {
  it.each(Object.entries(MUST_BE_LINKED))('%s', (route, ownFiles) => {
    const bare = route.replace(/\/$/, '');
    const linkedFrom = [...sources]
      .filter(([file]) => !ownFiles.includes(file))
      .filter(
        ([, src]) =>
          src.includes(`'${route}'`) || src.includes(`'${bare}'`) || src.includes(`"${route}"`),
      )
      .map(([file]) => file);
    expect(linkedFrom.length, `${route} nie ma linku z innej strony`).toBeGreaterThan(0);
  });
});
