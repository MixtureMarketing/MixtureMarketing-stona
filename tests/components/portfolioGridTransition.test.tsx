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

describe('MIX-1741: a skipped list keeps its height (back from a case study never lands on the footer)', () => {
  /**
   * Block-axis value of `contain-intrinsic-size` in a Tailwind arbitrary class of the list, or null when the list has
   * no content-visibility:auto (nothing to guard). Allowlist: with content-visibility:auto the block axis must start
   * with `auto` (last remembered size); one class, two axes; anything else (missing, one value, no `auto`) = refusal.
   */
  function blockAxis(className: string): { ok: boolean; why: string } {
    const cls = className.split(/\s+/);
    if (!cls.includes('[content-visibility:auto]'))
      return { ok: true, why: 'no content-visibility:auto' };
    const cis = cls.filter((c) => c.startsWith('[contain-intrinsic-size:'));
    if (cis.length !== 1)
      return { ok: false, why: `contain-intrinsic-size classes: ${cis.length}` };
    const words = cis[0].slice('[contain-intrinsic-size:'.length, -1).split('_');
    // axes: each `[auto] <length>`; exactly two axes (inline, block), block = the second one
    const axes: { auto: boolean; len: string }[] = [];
    for (let i = 0; i < words.length; i++) {
      const auto = words[i] === 'auto';
      const len = auto ? words[++i] : words[i];
      if (!len || !/^\d+(\.\d+)?px$/.test(len)) return { ok: false, why: `unreadable: ${cis[0]}` };
      axes.push({ auto, len });
    }
    if (axes.length !== 2) return { ok: false, why: `axes: ${axes.length} in ${cis[0]}` };
    if (!axes[1].auto) return { ok: false, why: `block axis without auto: ${cis[0]}` };
    return { ok: true, why: `block axis auto ${axes[1].len}` };
  }

  it('the checker refuses a block axis without auto, a missing size and two size classes; allows auto', () => {
    const cv = '[content-visibility:auto]';
    expect(blockAxis(`${cv} [contain-intrinsic-size:1px_1500px]`)).toEqual({
      ok: false,
      why: 'block axis without auto: [contain-intrinsic-size:1px_1500px]',
    });
    // one axis only (both axes 1500 px, block axis read as missing), auto on the inline axis only
    expect(blockAxis(`${cv} [contain-intrinsic-size:auto_1500px]`).why).toBe(
      'axes: 1 in [contain-intrinsic-size:auto_1500px]',
    );
    expect(blockAxis(`${cv} [contain-intrinsic-size:auto_1px_1500px]`).why).toBe(
      'block axis without auto: [contain-intrinsic-size:auto_1px_1500px]',
    );
    expect(blockAxis(`${cv} [contain-intrinsic-size:auto_auto]`).why).toBe(
      'unreadable: [contain-intrinsic-size:auto_auto]',
    );
    expect(blockAxis(`${cv} [contain-intrinsic-size:1px_1500px_9px]`).ok).toBe(false);
    expect(blockAxis(cv)).toEqual({ ok: false, why: 'contain-intrinsic-size classes: 0' });
    expect(
      blockAxis(
        `${cv} [contain-intrinsic-size:auto_1px_auto_1500px] [contain-intrinsic-size:1px_1500px]`,
      ).ok,
    ).toBe(false);
    // allowed twins: auto on the block axis (with or without auto on the inline axis), no content-visibility at all
    expect(blockAxis(`${cv} [contain-intrinsic-size:auto_1px_auto_1500px]`)).toEqual({
      ok: true,
      why: 'block axis auto 1500px',
    });
    expect(blockAxis(`${cv} [contain-intrinsic-size:1px_auto_1500px]`).ok).toBe(true);
    expect(blockAxis('grid gap-8').ok).toBe(true);
  });

  it('the list with content-visibility:auto remembers its last size on both axes (contain-intrinsic-size auto)', () => {
    const { container } = render(
      <MemoryRouter>
        <PortfolioGrid projects={[PROJECT]} loading={false} />
      </MemoryRouter>,
    );
    const list = container.querySelector<HTMLElement>('.vt-lista');
    expect(list).not.toBeNull();
    expect(blockAxis(list!.className)).toEqual({ ok: true, why: 'block axis auto 1500px' });
  });
});
