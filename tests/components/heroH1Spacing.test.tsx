import type React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Hero from '../../components/sections/Hero';
import StandardHero from '../../components/common/StandardHero';
import WebDevHeroTitle from '../../components/features/web-development/WebDevHeroTitle';
import { HeroTitle } from '../../components/common/HeroSubComponents';
import { CORPORATE_WEBSITE_CONTENT } from '../../data/content/services/web-development/corporate';
import { ANALYTICS_CONTENT } from '../../data/content/services/marketing/analytics';
import { VISUAL_AUDIT_CONTENT } from '../../data/content/services/design/visual-audit';

/**
 * MIX-921 (audyt MIX-897 P11): textContent H1 (czyta go Google i czytnik ekranu) sklejał
 * zdania z sąsiednich blokowych spanów, np. „wykonawców.Wybierz”. Pięć stron z audytu:
 * /, /web-development/, /web-development/corporate/, /marketing/analytics/,
 * /design/visual-audit/.
 */
const SKLEJONE = /[.!?,][\p{Lu}\p{Ll}]/u;

const h1Text = (ui: React.ReactElement) => {
  const { container, unmount } = render(<MemoryRouter>{ui}</MemoryRouter>);
  const h1 = container.querySelectorAll('h1');
  expect(h1).toHaveLength(1);
  const text = (h1[0].textContent ?? '').replace(/\s+/g, ' ').trim();
  unmount();
  return text;
};

const noop = () => {};

describe('H1 bez sklejonych zdań — 5 stron z audytu MIX-897', () => {
  it('/ (Hero strony głównej)', () => {
    const t = h1Text(<Hero />);
    expect(t).toBe('Nie szukaj wykonawców. Wybierz Partnera.');
    expect(t).not.toMatch(SKLEJONE);
  });

  it('/web-development/ (WebDevHeroTitle)', () => {
    const t = h1Text(<WebDevHeroTitle />);
    expect(t).toBe('Tworzenie stron WWW i systemów webowych. Bez szablonu, bez długu technicznego.');
    expect(t).not.toMatch(SKLEJONE);
  });

  it.each([
    [
      '/web-development/corporate/',
      CORPORATE_WEBSITE_CONTENT,
      'Korporacyjne serwisy WWW. Skala, bezpieczeństwo, prestiż.',
    ],
    ['/marketing/analytics/', ANALYTICS_CONTENT, 'Przestań zgadywać. Zacznij mierzyć.'],
    ['/design/visual-audit/', VISUAL_AUDIT_CONTENT, 'Twoja strona gubi klientów. Powiemy Ci gdzie.'],
  ])('%s (StandardHero, rejestr ciemny)', (_url, content, expected) => {
    const t = h1Text(
      <StandardHero
        tone="dark"
        title={{ line1: content.hero.title.line1, line2: content.hero.title.line2 }}
        description={content.hero.description}
        ctaPrimaryText="CTA"
        ctaPrimaryOnClick={noop}
      />,
    );
    expect(t).toBe(expected);
    expect(t).not.toMatch(SKLEJONE);
  });
});

describe('HeroTitle — spacja przed linią akcentu w obu rejestrach', () => {
  it.each(['dark', 'light'] as const)('rejestr %s', (tone) => {
    const { container } = render(
      <h1>
        <HeroTitle tone={tone} title={{ line1: 'Raz.', line2: 'Dwa.', accent: 'Trzy.' }} />
      </h1>,
    );
    const t = (container.textContent ?? '').replace(/\s+/g, ' ').trim();
    expect(t).toBe('Raz. Dwa. Trzy.');
  });
});
