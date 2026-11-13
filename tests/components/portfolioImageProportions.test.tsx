import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/services/cmsService', () => {
  const chain: Record<string, unknown> = {};
  for (const k of ['width', 'height', 'fit', 'crop', 'auto']) chain[k] = () => chain;
  chain.url = () => 'https://cdn.example/x.jpg';
  return { urlFor: () => chain };
});

import CaseStudyHero from '@/components/templates/case-study/CaseStudyHero';
import PortfolioGrid from '@/components/features/portfolio/PortfolioGrid';
import type { SanityCaseStudy } from '@/types';

// MIX-1651: the portfolio images keep the desktop proportion on every width (no phone square,
// no fixed card height). Tailwind classes with a breakpoint prefix would change the ratio.
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

const BREAKPOINT_ASPECT = /(^|\s)(sm|md|lg|xl|2xl|max-[a-z0-9]+|min-[a-z0-9]+):(aspect-|h-|max-h-)/;

/** Returns the single base aspect class, throws on any breakpoint-specific aspect/height class. */
function uniformAspect(className: string): string {
  if (BREAKPOINT_ASPECT.test(className)) throw new Error(`breakpoint-specific ratio: ${className}`);
  const aspects = className.split(/\s+/).filter((c) => c.startsWith('aspect-'));
  if (aspects.length !== 1) throw new Error(`expected one aspect class, got: ${className}`);
  return aspects[0];
}

afterEach(() => vi.unstubAllEnvs());

describe('MIX-1651: the checker itself (negative leg)', () => {
  it('rejects a breakpoint-specific aspect class', () => {
    expect(() => uniformAspect('aspect-square sm:aspect-[4/3] md:aspect-[16/9]')).toThrow(
      /breakpoint-specific/,
    );
    expect(() => uniformAspect('aspect-[16/9] md:aspect-[4/3]')).toThrow(/breakpoint-specific/);
  });
  it('rejects a missing or doubled aspect class and a breakpoint height', () => {
    expect(() => uniformAspect('h-72')).toThrow(/expected one aspect/);
    expect(() => uniformAspect('aspect-square aspect-[16/9]')).toThrow(/expected one aspect/);
    expect(() => uniformAspect('aspect-[4/3] md:h-96')).toThrow(/breakpoint-specific/);
  });
  it('accepts a single base class', () => {
    expect(uniformAspect('rounded aspect-[16/9] max-h-[75vh]')).toBe('aspect-[16/9]');
  });
});

describe('MIX-1651: hero (photo at the top) has 16/9 on every width', () => {
  it.each(['1', 'true'])('VITE_MM_VIEW_TRANSITIONS=%s', (v) => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', v);
    render(
      <MemoryRouter initialEntries={['/portfolio/alfa/']}>
        <CaseStudyHero project={PROJECT} />
      </MemoryRouter>,
    );
    const photo = screen.getByRole('img', { name: 'Alfa' });
    const frame = photo.parentElement!;
    expect(uniformAspect(frame.className)).toBe('aspect-[16/9]');
    expect(frame.className).not.toMatch(/aspect-square/);
    // Reserved space intact: the intrinsic size is 16:9 as well.
    expect(photo.getAttribute('width')).toBe('1600');
    expect(photo.getAttribute('height')).toBe('900');
  });
});

describe('MIX-1651: list card image has one ratio (no fixed height) on every width', () => {
  it('4/3 frame, img keeps width/height 800x600', () => {
    render(
      <MemoryRouter>
        <PortfolioGrid projects={[PROJECT]} loading={false} />
      </MemoryRouter>,
    );
    const photo = screen.getByRole('img', { name: 'Alfa' });
    const frame = photo.parentElement!;
    expect(uniformAspect(frame.className)).toBe('aspect-[4/3]');
    expect(frame.className.split(/\s+/)).not.toContain('h-72');
    expect(photo.getAttribute('width')).toBe('800');
    expect(photo.getAttribute('height')).toBe('600');
  });
});
