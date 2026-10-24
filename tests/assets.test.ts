import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// Regresja: `bg-[url('/assets/images/grid.svg')]` wskazywał na plik, którego nigdy
// nie było w public/ → 404 na produkcji. Każde `url(/assets/...)` w kodzie/CSS
// musi istnieć fizycznie w public/.
const root = path.resolve(__dirname, '..');
const SCAN_DIRS = ['components', 'config', 'data'];
const SCAN_FILES = ['index.css', 'App.tsx'];
const EXT = /\.(tsx?|css)$/;

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return EXT.test(e.name) ? [p] : [];
  });

const exists = (assetPath: string) => fs.existsSync(path.join(root, 'public', assetPath));

describe('statyczne zasoby /assets/ użyte w url()', () => {
  it('każdy url(/assets/...) istnieje w public/', () => {
    const files = [
      ...SCAN_DIRS.flatMap((d) => walk(path.join(root, d))),
      ...SCAN_FILES.map((f) => path.join(root, f)),
    ];
    const missing: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      for (const m of src.matchAll(/url\(\s*['"]?(\/assets\/[^'")\s]+)/g)) {
        if (!exists(m[1])) {
          missing.push(`${path.relative(root, file)} → ${m[1]}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

// Regresja: TypeScriptArticle miał fallback `image={… || '/assets/images/typescript.png'}`
// do pliku, którego nie ma w public/ (og:image → 404). Pilnujemy KAŻDEGO literału
// '/assets/…' w kodzie — src=, image:, fallbacki `||`, tablice danych — nie tylko url().
// Literały z interpolacją (`/assets/images/${name}-480.avif`) pomijamy: warianty
// responsywne pilnuje tests/responsiveImages.test.ts.
describe('statyczne zasoby /assets/ jako literały (src=, image:, fallbacki)', () => {
  const LITERAL_DIRS = ['components', 'config', 'data', 'services', 'utils', 'hooks'];
  const LITERAL_FILES = ['App.tsx', 'index.tsx'];
  const ASSET_LITERAL = /(['"`])(\/assets\/[^'"`\s)]+?)\1/g;

  const files = [
    ...LITERAL_DIRS.filter((d) => fs.existsSync(path.join(root, d))).flatMap((d) =>
      walk(path.join(root, d)),
    ),
    ...LITERAL_FILES.map((f) => path.join(root, f)).filter((f) => fs.existsSync(f)),
  ].filter((f) => !/\.test\.tsx?$/.test(f));

  it('skanuje realne odwołania (src=, image:)', () => {
    const all = files.flatMap((f) => [...fs.readFileSync(f, 'utf8').matchAll(ASSET_LITERAL)]);
    expect(all.length).toBeGreaterThan(30);
  });

  it('każdy literał /assets/... wskazuje na istniejący plik w public/', () => {
    const missing: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      for (const m of src.matchAll(ASSET_LITERAL)) {
        const assetPath = m[2].split(/[?#]/)[0];
        if (assetPath.includes('${')) continue;
        if (!exists(assetPath)) missing.push(`${path.relative(root, file)} → ${assetPath}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
