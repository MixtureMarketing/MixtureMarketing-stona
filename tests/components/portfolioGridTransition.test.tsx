import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/services/cmsService', () => {
  const chain: Record<string, unknown> = {};
  for (const k of ['width', 'height', 'fit', 'crop', 'auto']) chain[k] = () => chain;
  chain.url = () => 'https://cdn.example/x.jpg';
  return { urlFor: () => chain };
});

import PortfolioGrid from '@/components/features/portfolio/PortfolioGrid';
import { setTransitionActive } from '@/utils/caseStudyTransition';
import type { SanityCaseStudy } from '@/types';

// MIX-1719: the two MIX-1711 mutants without a test (verdict W6, W7).
const IMG = { _type: 'image', asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' } };
const PROJECT = {
  _id: 'id-alfa',
  title: 'Alfa',
  slug: 'alfa',
  category: 'web',
  subcategory: ['Sklep'],
  excerpt: 'opis',
  client: 'Klient',
  date: '2025',
  mainImage: IMG,
} as unknown as SanityCaseStudy;

afterEach(() => setTransitionActive(false));

function cardStyle(): CSSStyleDeclaration {
  const { container } = render(
    <MemoryRouter>
      <PortfolioGrid projects={[PROJECT]} loading={false} />
    </MemoryRouter>,
  );
  const card = container.querySelector<HTMLElement>('.vt-lista > .group');
  if (!card) throw new Error('card wrapper not found');
  return card.style;
}

describe('W6: PortfolioGrid mounted during a transition shows the cards at once', () => {
  it('transition active: the card starts at full opacity, no 0.9 scale (no entrance)', () => {
    setTransitionActive(true);
    const s = cardStyle();
    expect(s.opacity).toBe('1');
    expect(s.transform).not.toContain('scale(0.9)');
  });

  it('allowed twin: no transition = the usual entrance (opacity 0, scale 0.9)', () => {
    setTransitionActive(false);
    const s = cardStyle();
    expect(s.opacity).toBe('0');
    expect(s.transform).toContain('scale(0.9)');
  });
});

describe('W7: content-visibility of the list during a transition', () => {
  const css = fs
    .readFileSync(path.join(process.cwd(), 'components/common/caseStudyTransitions.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  /** Value of `content-visibility` in the `html[data-vt] .vt-lista` rule inside the motion media block, or null. */
  function listRule(src: string): string | null {
    const media = src.indexOf('@media (prefers-reduced-motion: no-preference)');
    if (media < 0) return null;
    const m = /html\[data-vt\]\s+\.vt-lista\s*\{([^}]*)\}/.exec(src.slice(media));
    if (!m) return null;
    const v = /(?:^|;)\s*content-visibility\s*:\s*([a-z-]+)\s*(?:;|$)/.exec(m[1].trim());
    return v ? v[1] : null;
  }

  it('the checker refuses a rule set to auto, a missing rule and a rule outside the media block', () => {
    const ok =
      '@media (prefers-reduced-motion: no-preference) { html[data-vt] .vt-lista { content-visibility: visible; } }';
    expect(listRule(ok)).toBe('visible');
    expect(listRule(ok.replace('visible', 'auto'))).toBe('auto');
    expect(listRule('@media (prefers-reduced-motion: no-preference) { }')).toBeNull();
    expect(listRule('html[data-vt] .vt-lista { content-visibility: visible; }')).toBeNull();
  });

  it('during a transition the list is drawn whole (content-visibility: visible)', () => {
    expect(listRule(css)).toBe('visible');
  });

  it('outside a transition the list keeps content-visibility:auto and carries the vt-lista hook', () => {
    const { container } = render(
      <MemoryRouter>
        <PortfolioGrid projects={[PROJECT]} loading={false} />
      </MemoryRouter>,
    );
    const list = container.querySelector<HTMLElement>('.vt-lista');
    expect(list).not.toBeNull();
    expect(list!.className.split(/\s+/)).toContain('[content-visibility:auto]');
  });
});
