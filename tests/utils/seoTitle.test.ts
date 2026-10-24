import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { joinTitleLines, withBrandSuffix, withDla } from '../../utils/seo/title';
import { MARKETING_CONTENT } from '../../data/content/services/marketing/main';

const BRAND = 'Mixture Marketing';

describe('withBrandSuffix', () => {
  it('dokleja „| Mixture Marketing”', () => {
    expect(withBrandSuffix('Kontakt', BRAND)).toBe('Kontakt | Mixture Marketing');
  });

  it('jest idempotentny — nie dubluje sufiksu', () => {
    const once = withBrandSuffix('Baza Wiedzy', BRAND);
    expect(withBrandSuffix(once, BRAND)).toBe('Baza Wiedzy | Mixture Marketing');
    expect(withBrandSuffix('Polityka Prywatności | Mixture Marketing', BRAND)).toBe(
      'Polityka Prywatności | Mixture Marketing',
    );
  });

  it('nie dokleja, gdy tytuł kończy się marką z innym separatorem', () => {
    expect(withBrandSuffix('O nas — Zespół Mixture Marketing', BRAND)).toBe(
      'O nas — Zespół Mixture Marketing',
    );
    expect(withBrandSuffix('GlamSpace - Case Study Mixture Marketing', BRAND)).toBe(
      'GlamSpace - Case Study Mixture Marketing',
    );
  });

  it('marka na początku tytułu nie blokuje sufiksu', () => {
    expect(withBrandSuffix('Mixture vs Wix — porównanie', BRAND)).toBe(
      'Mixture vs Wix — porównanie | Mixture Marketing',
    );
  });
});

describe('joinTitleLines', () => {
  it('domyślnie łączy dwukropkiem', () => {
    expect(joinTitleLines('Backend', 'bez Tajemnic')).toBe('Backend: bez Tajemnic');
  });

  it('nie dubluje dwukropka, gdy line1 kończy się „:”', () => {
    expect(joinTitleLines('Core Web Vitals 2025:', 'Nowy standard jakości.')).toBe(
      'Core Web Vitals 2025: Nowy standard jakości.',
    );
  });

  it('nie skleja „.:” / „,:” / „?:”', () => {
    expect(joinTitleLines('Go (Golang): Język Chmury.', 'Uber i Twitch już tam są.')).toBe(
      'Go (Golang): Język Chmury. Uber i Twitch już tam są.',
    );
    expect(joinTitleLines('Laravel: PHP nie umarło,', 'ono dojrzało.')).toBe(
      'Laravel: PHP nie umarło, ono dojrzało.',
    );
    expect(joinTitleLines('Koniec Ery Cookies?', 'Server-Side Tracking.')).toBe(
      'Koniec Ery Cookies? Server-Side Tracking.',
    );
  });

  it('nie wstawia drugiego dwukropka, gdy line1 już go zawiera', () => {
    expect(joinTitleLines('DevOps: Fundament', 'Nowoczesnego Biznesu')).toBe(
      'DevOps: Fundament Nowoczesnego Biznesu',
    );
  });

  it('dokleja suffix spacją', () => {
    expect(joinTitleLines('Next.js: Dlaczego to', '"Złoty Standard"', 'w 2025?')).toBe(
      'Next.js: Dlaczego to "Złoty Standard" w 2025?',
    );
  });

  it('wynik nigdy nie zawiera sklejonych separatorów', () => {
    const samples: [string, string][] = [
      ['Headless WordPress:', 'Zachowaj CMS.'],
      ['CDN: Jak być "blisko" klienta,', 'nawet gdy jest w Australii?'],
      ['Frontend bez Tajemnic:', 'Kompendium CTO na 2025 rok.'],
    ];
    for (const [a, b] of samples) {
      expect(joinTitleLines(a, b)).not.toMatch(/[:.,?!;]:/);
    }
  });
});

describe('withDla', () => {
  it('nie dubluje „dla”', () => {
    expect(withDla('dla Psychologów i Terapeutów')).toBe('dla Psychologów i Terapeutów');
    expect(withDla('Dla branży SaaS & Startups')).toBe('dla branży SaaS & Startups');
    expect(withDla('Sklepów Internetowych')).toBe('dla Sklepów Internetowych');
  });
});

describe('dane statyczne', () => {
  it('tytuły nie kończą się skróconą marką „| Mixture” (Seo dokleja pełną)', () => {
    expect(MARKETING_CONTENT.seo.title).not.toMatch(/\|\s*Mixture\s*$/);

    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
      });
    const offenders = walk(path.resolve(__dirname, '../../data/content')).filter((f) =>
      /title:\s*['"`][^'"`]*\|\s*Mixture['"`]/.test(fs.readFileSync(f, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});
