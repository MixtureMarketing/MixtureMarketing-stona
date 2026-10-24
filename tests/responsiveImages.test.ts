import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { RESPONSIVE_WIDTHS } from '../config/responsiveImages';

// Image.tsx podaje dla /assets/images/<plik>.png|jpg srcset z wariantów <nazwa>-<w>.avif|webp.
// Brakujący wariant = zepsuty obraz (przeglądarka NIE wraca do <img src>, gdy <source> da 404).
const root = path.resolve(__dirname, '..');
const SCAN_DIRS = ['components', 'data', 'services', 'config', 'hooks', 'utils'];
const EXT = /\.(tsx?|jsx?|css)$/;

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return EXT.test(e.name) ? [p] : [];
  });

describe('warianty szerokości obrazów (convert-images.js ↔ Image.tsx)', () => {
  it('lista szerokości w skrypcie = config/responsiveImages.ts', () => {
    const script = fs.readFileSync(path.join(root, 'scripts/convert-images.js'), 'utf8');
    const m = script.match(/const RESPONSIVE_WIDTHS = \[([^\]]+)\]/);
    expect(m).not.toBeNull();
    expect(m![1].split(',').map((x) => Number(x.trim()))).toEqual([...RESPONSIVE_WIDTHS]);
  });

  it('każdy obraz /assets/images/*.png|jpg użyty w kodzie ma komplet wariantów', () => {
    const refs = new Set<string>();
    for (const file of SCAN_DIRS.flatMap((d) => walk(path.join(root, d)))) {
      const src = fs.readFileSync(file, 'utf8');
      for (const m of src.matchAll(/\/assets\/images\/([A-Za-z0-9_.-]+)\.(png|jpe?g)/gi)) {
        // Odwołanie do nieistniejącego źródła łapie tests/assets.test.ts;
        // tu pilnujemy wariantów istniejących plików.
        if (fs.existsSync(path.join(root, 'public/assets/images', `${m[1]}.${m[2]}`)))
          refs.add(m[1]);
      }
    }
    expect(refs.size).toBeGreaterThan(0);
    const missing: string[] = [];
    for (const name of refs) {
      for (const w of RESPONSIVE_WIDTHS) {
        for (const ext of ['avif', 'webp']) {
          const f = `public/assets/images/${name}-${w}.${ext}`;
          if (!fs.existsSync(path.join(root, f))) missing.push(f);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
