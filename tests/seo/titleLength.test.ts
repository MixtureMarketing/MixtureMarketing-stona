import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { cutAtSegment, caseStudyTitle, fitTitle, TITLE_MAX } from '../../utils/seo/title';
import { titleProblems, auditDist } from '../../scripts/lib/seo-checks.js';
import prodTitles from './fixtures/prod-titles-mix489.json';

// MIX-781 (S6/M11): <title> <= 60 znaków na wszystkich 82 stronach. Fixture = tytuły z
// produkcji z audytu MIX-489 (57 z 82 miało 61–101 znaków).
const BRAND = 'Mixture Marketing';
const SUFFIX = ` | ${BRAND}`;

/** Odtwarza to, co dla danej strony składa kod: wejście do Seo → wynik fitTitle. */
function composed(route: string, prodTitle: string): string {
  const cs = prodTitle.match(/^(.*) - Case Study Mixture Marketing$/);
  if (cs) return caseStudyTitle(cs[1], BRAND);
  const base = prodTitle.endsWith(SUFFIX) ? prodTitle.slice(0, -SUFFIX.length) : prodTitle;
  if (route.startsWith('branza/')) {
    return fitTitle([base, base.replace('Marketing i Strony WWW', 'Marketing i WWW')], BRAND);
  }
  return fitTitle(base, BRAND);
}

describe('fitTitle — limit 60 znaków', () => {
  it('fixture obejmuje 82 strony i zawiera tytuły dłuższe niż 60 (test ma co łapać)', () => {
    expect(prodTitles.length).toBe(82);
    expect(prodTitles.filter(([, t]) => t.length > TITLE_MAX).length).toBeGreaterThan(50);
  });

  it.each(prodTitles)('%s mieści się w 60 znakach', (route, title) => {
    const out = composed(route, title);
    expect(out.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(out.length).toBeGreaterThan(0);
  });

  it('tytuł mieszczący się w limicie dostaje markę (bez zmiany zachowania)', () => {
    expect(fitTitle('Kontakt', BRAND)).toBe('Kontakt | Mixture Marketing');
    expect(fitTitle('O nas — Zespół Mixture Marketing', BRAND)).toBe(
      'O nas — Zespół Mixture Marketing',
    );
  });

  it('za długi tytuł traci markę, ale zachowuje frazę (nie ucina w pół słowa)', () => {
    const t = 'Strona w abonamencie dla małej firmy od 179 zł/mc';
    expect(fitTitle(t, BRAND)).toBe(t);
  });

  it('za długi tytuł z segmentami: ucina na granicy zdania i zostawia markę, gdy się mieści', () => {
    expect(
      fitTitle('PostgreSQL: Król Baz Danych. Dlaczego giganci wybierają Open Source?', BRAND),
    ).toBe('PostgreSQL: Król Baz Danych. | Mixture Marketing');
    expect(
      fitTitle(
        'Python (Django): Framework do zadań specjalnych. Dlaczego Fintechy go kochają?',
        BRAND,
      ),
    ).toBe('Python (Django): Framework do zadań specjalnych.');
  });

  it('ostateczność: brak separatorów → ucięcie na granicy słowa z „…”', () => {
    const out = fitTitle(
      'Bardzo długi tytuł strony bez żadnych separatorów który nie mieści się w limicie znaków',
      BRAND,
    );
    expect(out.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });

  it('warianty: bierze pierwszy mieszczący się (z marką), potem bez marki', () => {
    expect(fitTitle(['Marketing i Strony WWW dla branży E-commerce', 'Marketing i WWW'], BRAND)).toBe(
      'Marketing i WWW | Mixture Marketing',
    );
    expect(
      fitTitle(
        [
          'Marketing i Strony WWW dla branży Edukacja i Szkolenia (EdTech)',
          'Marketing i WWW dla branży Edukacja i Szkolenia (EdTech)',
        ],
        BRAND,
      ),
    ).toBe('Marketing i WWW dla branży Edukacja i Szkolenia (EdTech)');
  });

  it('pusty tytuł → sama marka (nigdy pusty <title>)', () => {
    expect(fitTitle('', BRAND)).toBe(BRAND);
    expect(fitTitle([], BRAND)).toBe(BRAND);
  });
});

describe('cutAtSegment / caseStudyTitle', () => {
  it('zwraca prefiks kończący się na granicy segmentu albo null', () => {
    expect(cutAtSegment('Alfa beta gamma. Delta epsilon zeta eta.', 25)).toBe('Alfa beta gamma.');
    expect(cutAtSegment('Jedno długie słowo bez separatorów wcale', 10)).toBeNull();
    expect(cutAtSegment('krótki', 40)).toBe('krótki');
  });

  it('studium przypadku: długa nazwa projektu → człon przed myślnikiem + końcówka', () => {
    expect(
      caseStudyTitle(
        'Driftmark Marine – E-commerce z Konfiguratorem Łodzi i Rebranding',
        BRAND,
      ),
    ).toBe('Driftmark Marine - Case Study Mixture Marketing');
    expect(caseStudyTitle('GlamSpace  ', BRAND)).toBe('GlamSpace - Case Study Mixture Marketing');
  });
});

describe('bramka tytułów (scripts/lib/seo-checks.js) — nogi ujemne', () => {
  it('pada, gdy tytuł ma 61 znaków, i podaje trasę, długość i tytuł', () => {
    const long = 'a'.repeat(61);
    const problems = titleProblems([{ route: '/x/', title: long }]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('/x/');
    expect(problems[0]).toContain('61 znaków (> 60)');
    expect(problems[0]).toContain(long);
  });

  it('przepuszcza dokładnie 60 znaków', () => {
    expect(titleProblems([{ route: '/x/', title: 'a'.repeat(60) }])).toEqual([]);
  });

  it('pada na pustym tytule', () => {
    expect(titleProblems([{ route: '/x/', title: '  ' }])).toEqual(['/x/: brak <title>']);
  });

  it('auditDist: dist z jednym za długim tytułem daje problem z trasą', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-dist-'));
    try {
      fs.mkdirSync(path.join(dir, 'dobra'));
      fs.mkdirSync(path.join(dir, 'zla'));
      const page = (t: string) =>
        `<html><head><title>${t}</title></head><body><img src="/a.png" alt=""></body></html>`;
      fs.writeFileSync(path.join(dir, 'dobra/index.html'), page('Dobry tytuł'));
      fs.writeFileSync(path.join(dir, 'zla/index.html'), page('z'.repeat(70)));
      fs.writeFileSync(
        path.join(dir, 'sitemap.xml'),
        '<urlset><url><loc>https://x/</loc><lastmod>2026-10-01</lastmod></url></urlset>',
      );
      const { pages, problems } = auditDist(dir, new Date('2026-10-31'));
      expect(pages).toBe(2);
      expect(problems).toHaveLength(1);
      expect(problems[0]).toMatch(/^\/zla\/: <title> ma 70 znaków/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
