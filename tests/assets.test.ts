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
        if (!fs.existsSync(path.join(root, 'public', m[1]))) {
          missing.push(`${path.relative(root, file)} → ${m[1]}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
