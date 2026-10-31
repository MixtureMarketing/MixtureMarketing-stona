import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, it, expect } from 'vitest';
import { imgsWithoutAlt } from '../../scripts/lib/seo-checks.js';

// MIX-781 (M11): każdy <img>/<Image> ma atrybut alt (0 obrazów bez atrybutu); obrazy
// treściowe opisane, dekoracyjne alt="" — i tylko w jawnie wskazanych miejscach.
const ROOT = path.resolve(__dirname, '../..');
const SRC_DIRS = ['components', 'config', 'App.tsx'];

function tsxFiles(entry: string): string[] {
  const abs = path.join(ROOT, entry);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return [abs];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const rel = path.join(entry, e.name);
    return e.isDirectory() ? tsxFiles(rel) : e.name.endsWith('.tsx') ? [path.join(ROOT, rel)] : [];
  });
}

type Finding = { line: number; tag: string; alt: 'brak' | 'pusty' | 'opis' };

/** Elementy JSX `<img>` i `<Image>` (komponent z components/common/Image) wraz ze stanem alt. */
export function scanImages(source: string, fileName = 'x.tsx'): Finding[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out: Finding[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tag = node.tagName.getText(sf);
      if (tag === 'img' || tag === 'Image') {
        const attrs = node.attributes.properties;
        const alt = attrs.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === 'alt') as
          | ts.JsxAttribute
          | undefined;
        const spread = attrs.some((a) => ts.isJsxSpreadAttribute(a));
        let state: Finding['alt'] = 'brak';
        if (alt) {
          const init = alt.initializer;
          const isEmpty =
            (init && ts.isStringLiteral(init) && init.text === '') ||
            (init &&
              ts.isJsxExpression(init) &&
              init.expression &&
              ts.isStringLiteralLike(init.expression) &&
              init.expression.text === '');
          state = isEmpty ? 'pusty' : 'opis';
        } else if (spread) {
          state = 'opis'; // alt może przyjść ze spreadu — pilnuje go Image.tsx (alt wymagany w typach)
        }
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        out.push({ line: line + 1, tag, alt: state });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

// Obrazy dekoracyjne (alt=""): miniatura w linku, który ma tytuł tekstem; tło za nagłówkiem;
// obraz aria-hidden. Nowe alt="" poza tą listą = świadoma decyzja (dopisz tu z uzasadnieniem).
const DECORATIVE_ALLOWLIST: Record<string, { count: number; why: string }> = {
  'components/layout/DesktopMenu.tsx': {
    count: 1,
    why: 'miniatura artykułu w linku, który ma tytuł tekstem (menu Baza Wiedzy)',
  },
  'components/templates/case-study/CaseStudyNavigation.tsx': {
    count: 1,
    why: 'tło 20% krycia za nagłówkiem „Następny projekt” (nazwa projektu jest tekstem)',
  },
  'components/features/web-development/WebDevWpCustom.tsx': {
    count: 1,
    why: 'halftone aria-hidden, nakładka na opisany zrzut interfejsu',
  },
};

describe('obrazy: atrybut alt', () => {
  const files = SRC_DIRS.flatMap(tsxFiles);

  it('skan źródeł obejmuje komponenty z <img>/<Image> (test ma co sprawdzać)', () => {
    const total = files.flatMap((f) => scanImages(fs.readFileSync(f, 'utf8'), f));
    expect(total.length).toBeGreaterThan(20);
  });

  it('żaden <img>/<Image> w components/ nie jest bez atrybutu alt', () => {
    const missing = files.flatMap((f) =>
      scanImages(fs.readFileSync(f, 'utf8'), f)
        .filter((i) => i.alt === 'brak')
        .map((i) => `${path.relative(ROOT, f)}:${i.line} <${i.tag}> bez alt`),
    );
    expect(missing).toEqual([]);
  });

  it('alt="" tylko w jawnie dozwolonych miejscach dekoracyjnych (reszta ma opis)', () => {
    const found: Record<string, number> = {};
    for (const f of files) {
      const empties = scanImages(fs.readFileSync(f, 'utf8'), f).filter((i) => i.alt === 'pusty');
      if (empties.length) found[path.relative(ROOT, f)] = empties.length;
    }
    const expected = Object.fromEntries(
      Object.entries(DECORATIVE_ALLOWLIST).map(([k, v]) => [k, v.count]),
    );
    expect(found).toEqual(expected);
  });

  it('miniatury artykułów na stronie głównej (treściowe) mają opis z tytułem artykułu', () => {
    const src = fs.readFileSync(
      path.join(ROOT, 'components/sections/KnowledgeBaseTeaser.tsx'),
      'utf8',
    );
    expect(src).toMatch(/alt=\{`Okładka artykułu: \$\{article\.title\}`\}/);
  });
});

describe('skaner alt — nogi ujemne (fixtures)', () => {
  it('wykrywa <img> bez alt', () => {
    expect(scanImages('const a = <img src="/x.png" />;')).toEqual([
      { line: 1, tag: 'img', alt: 'brak' },
    ]);
  });

  it('wykrywa <Image> bez alt, także gdy w atrybutach jest funkcja z „>”', () => {
    const found = scanImages('const a = <Image src={s} onError={() => hide()} width={1} />;');
    expect(found.map((f) => f.alt)).toEqual(['brak']);
  });

  it('rozróżnia pusty alt, opis i brak', () => {
    const src = `
      const a = <img alt="" src="/a" />;
      const b = <Image alt={''} src="/b" />;
      const c = <img alt="Opis" src="/c" />;
      const d = <Image alt={\`Okładka: \${t}\`} src="/d" />;
    `;
    expect(scanImages(src).map((f) => f.alt)).toEqual(['pusty', 'pusty', 'opis', 'opis']);
  });
});

describe('prerenderowany HTML: imgsWithoutAlt', () => {
  it('pada na <img> bez atrybutu alt i podaje trasę oraz src', () => {
    const html = '<html><body><img src="/a.png"><img src="/b.png" alt=""></body></html>';
    expect(imgsWithoutAlt(html, '/strona/')).toEqual([
      '/strona/: <img> bez atrybutu alt (src="/a.png")',
    ]);
  });

  it('alt="" (dekoracja) i opisany alt przechodzą', () => {
    const html = '<img src="/a.png" alt=""><img src="/b.png" alt="Opis">';
    expect(imgsWithoutAlt(html, '/')).toEqual([]);
  });

  it('zserializowany pusty alt (bare `alt`) liczy się jako obecny atrybut', () => {
    expect(imgsWithoutAlt('<img src="/a.png" alt class="x">', '/')).toEqual([]);
  });
});
