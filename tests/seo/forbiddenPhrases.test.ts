import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Strażnik PRODUCT.md: „Brak twardych liczb/KPI… Wymyślone liczby są usuwane, nie
 * zastępowane innymi" oraz „Zakres technologiczny publikujemy wyłącznie potwierdzony"
 * (odrzucone wprost: Shopify, Svelte, Go, Magento, Shoper/IdoSell…).
 *
 * Skanuje treść (components/, data/, public/llms.txt) z pominięciem komentarzy —
 * komentarze dokumentują, CO i DLACZEGO usunięto, i mogą cytować usunięte frazy.
 */
const root = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['components', 'data'];
const SCAN_FILES = ['public/llms.txt'];
// Panel (portal) to narzędzie wewnętrzne, nie treść publiczna — poza zakresem.
const SKIP_DIRS = new Set(['portal', 'node_modules']);
const EXT = /\.(tsx?|txt)$/;

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : walk(p);
    return EXT.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : [];
  });

const stripComments = (src: string, file: string): string =>
  file.endsWith('.txt')
    ? src
    : src
        .replace(/\/\*[\s\S]*?\*\//g, '') // /* … */ oraz {/* … */}
        .replace(/^\s*\/\/.*$/gm, ''); // linie zaczynające się od //

/** Zmyślone metryki i liczniki (znalezione w serwisie, usunięte). */
const FORBIDDEN: { re: RegExp; why: string }[] = [
  { re: /\+\s?127\s?%/, why: 'zmyślone „+127% ruchu organicznego"' },
  { re: /[−–-]\s?47\s?%/, why: 'zmyślone „−47% CPA"' },
  { re: /3[.,]2\s?(×|x(?![a-z0-9]))/i, why: 'zmyślone „3.2× leadów"' },
  { re: /4[.,]2\s?[×x]/, why: 'zmyślony „ROAS 4.2×"' },
  { re: /ROAS\s+średni/i, why: 'zmyślony średni ROAS' },
  { re: /120\s?\+\s*projekt/i, why: 'niepotwierdzony licznik „120+ projektów"' },
  {
    re: /value:\s*120\s*,\s*suffix:\s*['"]\+['"]/,
    why: 'animowany licznik „120+" (CountUp)',
  },
  { re: /\|\|\s*['"]20\d\d['"]/, why: "fallback daty na sztywny rok (np. `|| '2024'`)" },
  { re: /Notable results/i, why: 'zmyślone wyniki w llms.txt (EN)' },
];

/**
 * Shoper wolno wymieniać WYŁĄCZNIE jako platformę, z której klient migruje / którą
 * porównujemy (ecommerce.ts — decyzja właściciela; formularz kontaktowy „Migracja z…").
 */
const SHOPER_ALLOWED = new Set([
  'data/content/services/web-development/ecommerce.ts',
  'components/features/contact/configs/web.ts',
]);

const files = [
  ...SCAN_DIRS.flatMap((d) => walk(path.join(root, d))),
  ...SCAN_FILES.map((f) => path.join(root, f)),
];

const scan = (test: (rel: string, src: string) => string[]): string[] =>
  files.flatMap((file) => {
    const rel = path.relative(root, file).split(path.sep).join('/');
    return test(rel, stripComments(fs.readFileSync(file, 'utf8'), file));
  });

describe('zakazane frazy (PRODUCT.md)', () => {
  it('skanuje realne pliki', () => {
    expect(files.length).toBeGreaterThan(50);
    expect(files.some((f) => f.endsWith('llms.txt'))).toBe(true);
  });

  it('brak zmyślonych metryk i liczników', () => {
    const hits = scan((rel, src) =>
      FORBIDDEN.filter(({ re }) => re.test(src)).map(({ why }) => `${rel}: ${why}`),
    );
    expect(hits).toEqual([]);
  });

  it('Shoper nie występuje jako oferowana technologia', () => {
    const hits = scan((rel, src) => (!SHOPER_ALLOWED.has(rel) && /Shoper/i.test(src) ? [rel] : []));
    expect(hits).toEqual([]);
  });

  it('Go/AWS nie są wystawiane jako stack (odrzucone wprost)', () => {
    const hits = scan((rel, src) => {
      const out: string[] = [];
      if (/Backend:[^'"`\n]*\bGo\b/.test(src)) out.push(`${rel}: „Backend: … Go"`);
      if (rel === 'data/content/offers.ts' && /['"](Go|AWS)['"]/.test(src)) {
        out.push(`${rel}: Go/AWS w techStack`);
      }
      return out;
    });
    expect(hits).toEqual([]);
  });

  it('llms.txt nie obiecuje „biura" (model pracy mobilnej)', () => {
    const llms = fs.readFileSync(path.join(root, 'public/llms.txt'), 'utf8');
    expect(llms).not.toMatch(/w biurze|\boffice\b/i);
  });
});
