import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const calls = vi.hoisted(() => [] as Array<[string, unknown]>);
vi.mock('@/services/cmsService', () => {
  const chain: Record<string, unknown> = {};
  for (const k of ['width', 'height', 'fit', 'crop', 'auto'])
    chain[k] = (v?: unknown) => {
      calls.push([k, v]);
      return chain;
    };
  chain.url = () => 'https://cdn.example/x.jpg';
  return { urlFor: () => chain };
});

import CaseStudyHero, { HERO_PHOTO } from '@/components/templates/case-study/CaseStudyHero';
import PortfolioGrid, { CARD_PHOTO } from '@/components/features/portfolio/PortfolioGrid';
import type { SanityCaseStudy } from '@/types';

// MIX-1651/1722: the portfolio card and the hero photo are 16/9 on every width (no phone square,
// no fixed card height).
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

// MIX-1722: the card and the hero frame are an ALLOWLIST. Every class that can change the frame's shape
// (aspect-*, h-*, min-h-*, max-h-*, size-*, aspect-ratio / height arbitrary properties, with or without a
// variant or important prefix) must be exactly one of the allowed tokens; anything else fails. The card
// allows only `aspect-[16/9]`; the hero also keeps its unprefixed `max-h-[75vh]` viewport cap.
const SHAPE_TOKEN =
  /(^|:|!)(aspect|h|min-h|max-h|size|basis)-|aspect-ratio|(^|\[)(min-|max-)?height/;
const CARD_ALLOWED = ['aspect-[16/9]'];
const HERO_ALLOWED = ['aspect-[16/9]', 'max-h-[75vh]'];

/** Returns the aspect class; throws on a shape token outside the allowlist or a missing/doubled aspect. */
function uniformAspect(className: string, allowed: string[] = CARD_ALLOWED): string {
  const tokens = className.split(/\s+/).filter(Boolean);
  const stray = tokens.filter((t) => SHAPE_TOKEN.test(t) && !allowed.includes(t));
  if (stray.length) throw new Error(`class outside the allowlist: ${stray.join(' ')}`);
  const aspects = tokens.filter((t) => t === 'aspect-[16/9]');
  if (aspects.length !== 1)
    throw new Error(`expected exactly one aspect-[16/9], got: ${className}`);
  return aspects[0];
}

afterEach(() => vi.unstubAllEnvs());

describe('MIX-1722: the checker itself (negative leg, allowlist)', () => {
  const OUT = /class outside the allowlist/;
  it.each([
    'aspect-square sm:aspect-[4/3] md:aspect-[16/9]',
    'aspect-[16/9] md:aspect-[4/3]',
    'aspect-[16/9] md:h-96',
    'aspect-[16/9] lg:min-h-[300px]',
    'aspect-[16/9] xl:max-h-72',
    'aspect-[16/9] max-md:h-40',
    'aspect-[16/9] sm:size-40',
    'aspect-[16/9] !h-72',
    'aspect-[16/9] [aspect-ratio:4/3]',
    'aspect-[16/9] h-72',
    'aspect-[16/9] max-h-[75vh]',
    'aspect-[4/3]',
    'aspect-video',
  ])('rejects a shape class outside the allowlist: %s', (cls) => {
    expect(() => uniformAspect(cls)).toThrow(/class outside the allowlist|expected exactly one/);
  });
  it('names the stray token in the refusal text', () => {
    expect(() => uniformAspect('aspect-[16/9] md:h-96')).toThrow(OUT);
    expect(() => uniformAspect('aspect-[16/9] md:h-96')).toThrow(/md:h-96/);
    expect(() => uniformAspect('aspect-[16/9] max-h-[75vh]')).toThrow(/max-h-\[75vh\]/);
  });
  it('rejects a missing or doubled aspect class', () => {
    expect(() => uniformAspect('relative bg-gray-100')).toThrow(/expected exactly one/);
    expect(() => uniformAspect('aspect-[16/9] aspect-[16/9]')).toThrow(/expected exactly one/);
  });
  it('hero allowlist: the viewport cap is allowed, a variant cap or height is not', () => {
    expect(uniformAspect('rounded aspect-[16/9] max-h-[75vh] mb-12', HERO_ALLOWED)).toBe(
      'aspect-[16/9]',
    );
    expect(() => uniformAspect('aspect-[16/9] max-h-[75vh] md:max-h-[50vh]', HERO_ALLOWED)).toThrow(
      OUT,
    );
    expect(() => uniformAspect('aspect-[16/9] md:h-96', HERO_ALLOWED)).toThrow(OUT);
  });
  it('accepts exactly the allowed token and unrelated classes', () => {
    expect(uniformAspect('relative aspect-[16/9] overflow-hidden bg-gray-100')).toBe(
      'aspect-[16/9]',
    );
    expect(uniformAspect('w-full aspect-[16/9]')).toBe('aspect-[16/9]');
  });
});

describe('MIX-1722: hero (photo at the top) has 16/9 on every width', () => {
  it.each(['1', 'true'])('VITE_MM_VIEW_TRANSITIONS=%s', (v) => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', v);
    render(
      <MemoryRouter initialEntries={['/portfolio/alfa/']}>
        <CaseStudyHero project={PROJECT} />
      </MemoryRouter>,
    );
    const photo = screen.getByRole('img', { name: 'Alfa' });
    const frame = photo.parentElement!;
    expect(uniformAspect(frame.className, HERO_ALLOWED)).toBe('aspect-[16/9]');
    // Reserved space intact: the intrinsic size is 16:9 as well.
    expect(photo.getAttribute('width')).toBe('1600');
    expect(photo.getAttribute('height')).toBe('900');
  });
});

describe('MIX-1722: list card image is 16/9 like the hero (same crop box, no fixed height)', () => {
  it('16/9 frame, img keeps width/height 800x450, crop fit', () => {
    render(
      <MemoryRouter>
        <PortfolioGrid projects={[PROJECT]} loading={false} />
      </MemoryRouter>,
    );
    const photo = screen.getByRole('img', { name: 'Alfa' });
    const frame = photo.parentElement!;
    expect(uniformAspect(frame.className)).toBe('aspect-[16/9]');
    expect(photo.getAttribute('width')).toBe('800');
    expect(photo.getAttribute('height')).toBe('450');
    // 800/450 = 1600/900: the card and the hero photo have the same ratio.
    expect(Number(photo.getAttribute('width')) / Number(photo.getAttribute('height'))).toBeCloseTo(
      HERO_PHOTO.width / HERO_PHOTO.height,
      5,
    );
  });

  it('asks the CMS for the same 16/9 crop as the hero (width, height, fit crop)', () => {
    calls.length = 0;
    render(
      <MemoryRouter>
        <PortfolioGrid projects={[PROJECT]} loading={false} />
      </MemoryRouter>,
    );
    expect(calls).toEqual([
      ['width', 800],
      ['height', 450],
      ['fit', 'crop'],
    ]);
    expect(CARD_PHOTO.width / CARD_PHOTO.height).toBeCloseTo(
      HERO_PHOTO.width / HERO_PHOTO.height,
      5,
    );
  });

  it('loading skeleton reserves a 16/9 image block, not a fixed card height', () => {
    const { container } = render(
      <MemoryRouter>
        <PortfolioGrid projects={[]} loading />
      </MemoryRouter>,
    );
    const block = container.querySelector('.animate-pulse > div > div')!;
    expect(uniformAspect(block.className.replace('bg-gray-200', ''))).toBe('aspect-[16/9]');
    expect(container.innerHTML).not.toMatch(/h-\[500px\]|h-2\/3/);
  });
});
