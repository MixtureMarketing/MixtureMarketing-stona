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

// MIX-1651/1722/1724: the portfolio card and the hero photo are 16/9 on every width, with the switch ON
// and OFF (no phone square, no fixed card height, no natural-ratio hero).
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

// MIX-1724: the frame and image checkers are a fail-closed ALLOWLIST (Z3). Every class token of a frame
// must be exactly one of the listed tokens; ANY other token (flex-1, grow, [block-size:..], absolute,
// self-stretch, row-span-2, py-[28%], any variant or important prefix) is a refusal with the token named.
// A legitimate new class means a deliberate edit of the list here, after a browser measurement.
const CARD_FRAME = ['relative', 'aspect-[16/9]', 'overflow-hidden', 'bg-gray-100'];
const HERO_FRAME_ON = [
  'max-w-[1600px]',
  'mx-auto',
  'rounded-3xl',
  'md:rounded-[2.5rem]',
  'overflow-hidden',
  'shadow-2xl',
  'border-4',
  'border-white',
  'bg-gray-100',
  'aspect-[16/9]',
  'max-h-[75vh]',
  'mb-12',
];
const HERO_FRAME_OFF = [
  'max-w-[1600px]',
  'mx-auto',
  'rounded-[2.5rem]',
  'overflow-hidden',
  'shadow-2xl',
  'border-4',
  'border-white',
  'bg-gray-100',
  'aspect-[16/9]',
  'max-h-[75vh]',
];
const SKELETON_FRAME = ['aspect-[16/9]', 'bg-gray-200', 'w-full'];
const CARD_IMG = [
  'w-full',
  'h-full',
  'object-cover',
  'transition-transform',
  'duration-700',
  'group-hover:scale-110',
];
const HERO_IMG = ['w-full', 'h-full', 'object-cover'];

/** Throws on a token outside the allowlist or on an empty class (fail closed). */
function assertAllowlist(className: string | null | undefined, allowed: string[]): string[] {
  const tokens = (className ?? '').split(/\s+/).filter(Boolean);
  if (!tokens.length) throw new Error('class outside the allowlist: empty class (refused)');
  const stray = tokens.filter((t) => !allowed.includes(t));
  if (stray.length) throw new Error(`class outside the allowlist: ${stray.join(' ')}`);
  return tokens;
}

/**
 * MIX-1732: the frame carries no inline style except viewTransitionName (U4: style={{ height: 240 }} on the
 * card frame passed the className allowlist). Fail closed: any other property is a refusal naming it.
 * `extra`: the entrance animation of the OFF hero frame (framer-motion writes opacity and transform).
 */
function assertFrameStyle(el: Element, extra: string[] = []): void {
  const attr = el.getAttribute('style') ?? '';
  const props = attr
    .split(';')
    .map((d) => d.split(':')[0].trim().toLowerCase())
    .filter(Boolean);
  const stray = props.filter((p) => p !== 'view-transition-name' && !extra.includes(p));
  if (stray.length) throw new Error(`inline style outside the allowlist: ${stray.join(' ')}`);
}

/** Returns the aspect class; throws on a token outside the allowlist or a missing/doubled aspect. */
function uniformAspect(className: string, allowed: string[] = CARD_FRAME): string {
  const tokens = assertAllowlist(className, allowed);
  const aspects = tokens.filter((t) => t === 'aspect-[16/9]');
  if (aspects.length !== 1)
    throw new Error(`expected exactly one aspect-[16/9], got: ${className}`);
  return aspects[0];
}

afterEach(() => vi.unstubAllEnvs());

const OUT = /class outside the allowlist/;

describe('MIX-1732: whole-token matching of the checker (prefix, suffix, case, variants)', () => {
  const base = 'relative aspect-[16/9] overflow-hidden bg-gray-100';
  // Each refused form is a near-miss of an allowed token or of a forbidden one; the checker compares
  // the WHOLE token (startsWith / endsWith / includes mutants accept some of them). Twin = allowed token.
  it.each([
    ['relative-x', 'prefix of an allowed token', 'relative'],
    ['xrelative', 'suffix of an allowed token', 'relative'],
    ['xrelativex', 'allowed token inside', 'relative'],
    ['relative-', 'allowed token plus a dash', 'relative'],
    ['aspect-[16/9]x', 'allowed aspect plus a suffix', 'overflow-hidden'],
    ['xaspect-[16/9]', 'allowed aspect with a prefix', 'overflow-hidden'],
    ['bg-gray-100x', 'allowed colour plus a suffix', 'bg-gray-100'],
    ['Relative', 'case differs', 'relative'],
    ['xflex-1', 'prefix on a forbidden token', 'bg-gray-100'],
    ['flex-1x', 'suffix on a forbidden token', 'bg-gray-100'],
    ['md:flex-1/2', 'variant and a fraction', 'relative'],
    ['flex-1/2', 'fraction', 'relative'],
  ])('refuses the whole token %s (%s), the twin %s passes', (token, _why, twin) => {
    expect(() => uniformAspect(`${base} ${token}`)).toThrow(OUT);
    expect(() => uniformAspect(`${base} ${token}`)).toThrow(token);
    expect(uniformAspect(`${base} ${twin}`)).toBe('aspect-[16/9]');
  });
  it('a token that is only a prefix of the allowed list entry is refused (no startsWith)', () => {
    expect(() => assertAllowlist('rel', ['relative'])).toThrow(/outside the allowlist: rel$/);
    expect(() => assertAllowlist('tive', ['relative'])).toThrow(/outside the allowlist: tive$/);
    expect(assertAllowlist('relative', ['relative'])).toEqual(['relative']);
  });
});

describe('MIX-1732: frame inline style (viewTransitionName only), negative leg and twins', () => {
  const frame = (style?: string) => {
    const el = document.createElement('div');
    if (style !== undefined) el.setAttribute('style', style);
    return el;
  };
  it.each([
    ['height: 240px', /inline style outside the allowlist: height/],
    ['height:240px', /: height$/],
    ['aspect-ratio: 4 / 3', /: aspect-ratio/],
    ['min-height: 200px', /min-height/],
    ['view-transition-name: x; height: 10px', /: height$/],
    ['HEIGHT: 240px', /: height$/],
    ['flex: 1', /: flex/],
  ])('refuses the style %s', (style, text) => {
    expect(() => assertFrameStyle(frame(style))).toThrow(text);
  });
  it('the animation allowance is only opacity and transform (a size still refused)', () => {
    const ok = ['opacity', 'transform'];
    expect(() => assertFrameStyle(frame('opacity: 0; transform: none'), ok)).not.toThrow();
    expect(() => assertFrameStyle(frame('opacity: 0; height: 240px'), ok)).toThrow(/: height$/);
    expect(() => assertFrameStyle(frame('transform: none; aspect-ratio: 4 / 3'), ok)).toThrow(
      /aspect-ratio/,
    );
    expect(() => assertFrameStyle(frame('opacity: 0'))).toThrow(/: opacity$/);
  });
  it.each([undefined, '', '  ', 'view-transition-name: vt-image', 'view-transition-name:x;'])(
    'accepts the style %j (twin)',
    (style) => {
      expect(() => assertFrameStyle(frame(style))).not.toThrow();
    },
  );
});

describe('MIX-1724: the checker itself (negative leg, allowlist, refusal text)', () => {
  // The 10 forms that passed the old shape-token checker, each with an allowed twin (an allowed token of
  // the same kind) that must pass.
  it.each([
    ['flex-1', 'relative'],
    ['grow', 'overflow-hidden'],
    ['md:flex-1', 'bg-gray-100'],
    ['[block-size:240px]', 'relative'],
    ['md:[block-size:240px]', 'relative'],
    ['[max-block-size:200px]', 'overflow-hidden'],
    ['absolute inset-0', 'relative'],
    ['py-[28%]', 'bg-gray-100'],
    ['self-stretch', 'relative'],
    ['row-span-2', 'overflow-hidden'],
  ])('refuses %s (names it) while the allowed twin %s passes', (form, twin) => {
    const base = 'relative aspect-[16/9] overflow-hidden bg-gray-100';
    expect(() => uniformAspect(`${base} ${form}`)).toThrow(OUT);
    for (const t of form.split(' ')) expect(() => uniformAspect(`${base} ${form}`)).toThrow(t);
    expect(uniformAspect(`${base} ${twin}`)).toBe('aspect-[16/9]');
  });

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
    'aspect-[16/9] basis-1/2',
    'aspect-[16/9] w-1/2',
    'aspect-[16/9] p-4',
    'aspect-[16/9] [writing-mode:vertical-rl]',
    'aspect-[4/3]',
    'aspect-video',
  ])('refuses a class outside the allowlist: %s', (cls) => {
    expect(() => uniformAspect(cls)).toThrow(/class outside the allowlist|expected exactly one/);
  });

  it('refusal text names the stray token', () => {
    expect(() => uniformAspect('aspect-[16/9] md:h-96')).toThrow(/md:h-96/);
    expect(() => uniformAspect('aspect-[16/9] max-h-[75vh]')).toThrow(/max-h-\[75vh\]/);
    expect(() => uniformAspect('aspect-[16/9] flex-1')).toThrow(/outside the allowlist: flex-1/);
  });
  it('fails closed on empty, whitespace-only or missing class (refusal line)', () => {
    for (const c of ['', '   ', null, undefined]) {
      expect(() => assertAllowlist(c as string, CARD_FRAME)).toThrow(/empty class \(refused\)/);
    }
  });
  it('rejects a missing or doubled aspect class', () => {
    expect(() => uniformAspect('relative bg-gray-100')).toThrow(/expected exactly one/);
    expect(() => uniformAspect('aspect-[16/9] aspect-[16/9]')).toThrow(/expected exactly one/);
  });
  it('hero allowlist: the viewport cap is allowed, a variant cap or height is not', () => {
    expect(uniformAspect('rounded-3xl aspect-[16/9] max-h-[75vh] mb-12', HERO_FRAME_ON)).toBe(
      'aspect-[16/9]',
    );
    expect(() =>
      uniformAspect('aspect-[16/9] max-h-[75vh] md:max-h-[50vh]', HERO_FRAME_ON),
    ).toThrow(OUT);
    expect(() => uniformAspect('aspect-[16/9] md:h-96', HERO_FRAME_ON)).toThrow(OUT);
    expect(() => uniformAspect('aspect-[16/9] h-auto', HERO_FRAME_OFF)).toThrow(/h-auto/);
  });
  it('accepts exactly the allowed tokens', () => {
    expect(uniformAspect('relative aspect-[16/9] overflow-hidden bg-gray-100')).toBe(
      'aspect-[16/9]',
    );
    expect(uniformAspect('bg-gray-100 aspect-[16/9] relative')).toBe('aspect-[16/9]');
  });
});

describe('MIX-1722/1724: hero (photo at the top) has 16/9 on every width, switch ON and OFF', () => {
  it.each<[string, string | undefined, string[]]>([
    ['ON', '1', HERO_FRAME_ON],
    ['ON', 'true', HERO_FRAME_ON],
    ['OFF', undefined, HERO_FRAME_OFF],
    ['OFF', '0', HERO_FRAME_OFF],
    ['OFF', 'false', HERO_FRAME_OFF],
  ])('switch %s (VITE_MM_VIEW_TRANSITIONS=%s)', (_label, v, allowed) => {
    if (v !== undefined) vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', v);
    calls.length = 0;
    render(
      <MemoryRouter initialEntries={['/portfolio/alfa/']}>
        <CaseStudyHero project={PROJECT} />
      </MemoryRouter>,
    );
    const photo = screen.getByRole('img', { name: 'Alfa' });
    const frame = photo.parentElement!;
    expect(uniformAspect(frame.className, allowed)).toBe('aspect-[16/9]');
    expect(() => assertAllowlist(photo.className, HERO_IMG)).not.toThrow();
    // Reserved space intact: the intrinsic size is 16:9 as well.
    expect(photo.getAttribute('width')).toBe('1600');
    expect(photo.getAttribute('height')).toBe('900');
    // OFF: the frame is a motion.div, its entrance animation writes opacity + transform (never a size).
    expect(() =>
      assertFrameStyle(frame, _label === 'OFF' ? ['opacity', 'transform'] : []),
    ).not.toThrow();
    // Same crop request as the card, the WHOLE call list (MIX-1732): a deleted .fit('crop') and an extra
    // .crop('top') or .auto(..) both turn this red (U1, U6).
    expect(calls).toEqual([
      ['width', 1600],
      ['height', 900],
      ['fit', 'crop'],
    ]);
  });

  it('switch OFF keeps the production structure: header pt-32, text above the photo', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/portfolio/alfa/']}>
        <CaseStudyHero project={PROJECT} />
      </MemoryRouter>,
    );
    const header = container.querySelector('header')!;
    expect(header.getAttribute('data-hero-layout')).toBeNull();
    expect(header.className.split(' ')).toContain('pt-32');
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.compareDocumentPosition(screen.getByRole('img', { name: 'Alfa' }))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});

describe('MIX-1722/1724: list card image is 16/9 like the hero (same crop box, no fixed height)', () => {
  it('16/9 frame, img keeps width/height 800x450, crop fit', () => {
    render(
      <MemoryRouter>
        <PortfolioGrid projects={[PROJECT]} loading={false} />
      </MemoryRouter>,
    );
    const photo = screen.getByRole('img', { name: 'Alfa' });
    const frame = photo.parentElement!;
    expect(uniformAspect(frame.className)).toBe('aspect-[16/9]');
    expect(() => assertFrameStyle(frame)).not.toThrow();
    expect(() => assertAllowlist(photo.className, CARD_IMG)).not.toThrow();
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
    expect(uniformAspect(block.className, SKELETON_FRAME)).toBe('aspect-[16/9]');
    expect(() => assertFrameStyle(block)).not.toThrow();
    expect(container.innerHTML).not.toMatch(/h-\[500px\]|h-2\/3/);
  });
});
