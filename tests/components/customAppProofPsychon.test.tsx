/**
 * MIX-1975: sekcja dowodu na /web-development/custom-app/ pokazuje PsychON zamiast KorepetytorAI
 * (StudentPI) tylko przy VITE_MM_CUSTOMAPP_PSYCHON=1. Wyłączony przełącznik = sekcja jak przed zmianą.
 * Włączony: zero „KorepetytorAI” / StudentPI, dwa lokalne zrzuty z width/height i alt, link tylko
 * do istniejącej trasy /portfolio/ (strony /portfolio/psychon/ nie ma w CMS).
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const CDN = 'https://cdn.example/studentpi.png';
vi.mock('../../services/cms/client', () => {
  const chain: Record<string, unknown> = {};
  for (const k of ['width', 'fit', 'rect']) chain[k] = () => chain;
  chain.url = () => CDN;
  return { urlFor: () => chain };
});
vi.mock('../../hooks/useSectionProgress', () => ({
  useSectionProgress: () => ({ current: null }),
}));

import CustomAppProof from '../../components/features/web-development/CustomAppProof';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../data/content';
import { appRoutes } from '../../config/routes';

const root = path.resolve(__dirname, '../..');
const pokaz = () =>
  render(
    <MemoryRouter initialEntries={['/web-development/custom-app/']}>
      <CustomAppProof />
    </MemoryRouter>,
  );

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('MIX-1975: przełącznik wyłączony = sekcja KorepetytorAI jak dotąd', () => {
  for (const wartosc of [undefined, '', '0', 'true']) {
    it(`VITE_MM_CUSTOMAPP_PSYCHON=${String(wartosc)}`, () => {
      vi.stubEnv('VITE_MM_CUSTOMAPP_PSYCHON', wartosc as string);
      const { container } = pokaz();
      expect(container.querySelector('h2')!.textContent).toBe(CONTENT.proof.title);
      expect(container.querySelector('p')!.textContent).toBe(CONTENT.proof.description);
      expect(CONTENT.proof.description).toContain('KorepetytorAI (StudentPI)');
      const obrazy = [...container.querySelectorAll('img')];
      expect(obrazy.map((i) => i.getAttribute('src'))).toEqual([CDN, CDN]);
      expect(obrazy.map((i) => i.getAttribute('alt'))).toEqual(
        CONTENT.proof.figures.map((f) => f.alt),
      );
      expect(obrazy.every((i) => !i.hasAttribute('width') && !i.hasAttribute('height'))).toBe(true);
      expect([...container.querySelectorAll('figcaption')].map((f) => f.textContent)).toEqual(
        CONTENT.proof.figures.map((f) => f.caption),
      );
      const linki = [...container.querySelectorAll('a')];
      expect(linki).toHaveLength(3);
      expect(linki.every((a) => a.getAttribute('href') === '/portfolio/studentpi/')).toBe(true);
      expect(linki[2].textContent).toBe('Zobacz case study: KorepetytorAI');
      expect(container.innerHTML).not.toContain('PsychON');
    });
  }
});

describe('MIX-1975: przełącznik włączony = PsychON', () => {
  const wlacz = () => {
    vi.stubEnv('VITE_MM_CUSTOMAPP_PSYCHON', '1');
    return pokaz().container;
  };

  it('tytuł bez zmian, opis o PsychON, zero KorepetytorAI i StudentPI w HTML', () => {
    const c = wlacz();
    expect(c.querySelector('h2')!.textContent).toBe('Prawdziwa aplikacja, nie makieta.');
    const opis = c.querySelector('p')!.textContent!;
    expect(opis).toContain('PsychON');
    expect(opis).toContain('Fundacji Niepodzielni');
    expect(c.innerHTML.match(/KorepetytorAI/g) ?? []).toHaveLength(0);
    expect(c.innerHTML).not.toMatch(/studentpi/i);
    expect(c.innerHTML).not.toContain(CDN);
  });

  it('dwa lokalne zrzuty webp: width/height, opisowy alt, podpis, plik w public/ ≤ 120 kB', () => {
    const c = wlacz();
    const obrazy = [...c.querySelectorAll('img')];
    expect(obrazy).toHaveLength(2);
    expect([...c.querySelectorAll('figcaption')].map((f) => f.textContent)).toEqual(
      CONTENT.proofPsychon.figures.map((f) => f.caption),
    );
    for (const img of obrazy) {
      const src = img.getAttribute('src')!;
      expect(src).toMatch(/^\/assets\/custom-app\/psychon-[a-z-]+\.webp$/);
      expect(img.getAttribute('width')).toBe('1440');
      expect(img.getAttribute('height')).toBe('900');
      expect(img.getAttribute('alt')!).toMatch(/PsychON/);
      expect(img.getAttribute('alt')!.length).toBeGreaterThan(40);
      const plik = path.join(root, 'public', src);
      expect(fs.existsSync(plik)).toBe(true);
      const bufor = fs.readFileSync(plik);
      expect(bufor.length).toBeLessThanOrEqual(120 * 1024);
      // Nagłówek RIFF/WEBP i wymiary ramki VP8 zgodne z width/height w kodzie.
      expect(bufor.subarray(0, 4).toString('latin1')).toBe('RIFF');
      expect(bufor.subarray(8, 12).toString('latin1')).toBe('WEBP');
      expect(bufor.subarray(12, 16).toString('latin1')).toBe('VP8 ');
      expect(bufor.readUInt16LE(26) & 0x3fff).toBe(1440);
      expect(bufor.readUInt16LE(28) & 0x3fff).toBe(900);
    }
  });

  it('każdy link prowadzi do /portfolio/ (istniejąca trasa), nigdy do /portfolio/psychon/', () => {
    const c = wlacz();
    const linki = [...c.querySelectorAll('a')];
    expect(linki).toHaveLength(3);
    expect(linki.map((a) => a.getAttribute('href'))).toEqual([
      '/portfolio/',
      '/portfolio/',
      '/portfolio/',
    ]);
    expect(linki[2].textContent).toBe('Zobacz nasze realizacje');
    expect(c.innerHTML).not.toContain('/portfolio/psychon');
    expect(appRoutes.map((r) => r.path)).toContain('/portfolio');
  });

  it('treść PsychON: bez cyfr (żadnych liczb z danych Fundacji) i bez nazw osób ze zrzutów', () => {
    const p = CONTENT.proofPsychon;
    const teksty = [
      p.title,
      p.description,
      p.linkLabel,
      ...p.figures.flatMap((f) => [f.alt, f.caption]),
    ];
    for (const t of teksty) {
      expect(t).not.toMatch(/\d/);
      expect(t).not.toMatch(/Testow|Demo|Próbn|Wzorcow|Przykładow|Pokazow|Ćwiczebn/);
    }
  });
});
