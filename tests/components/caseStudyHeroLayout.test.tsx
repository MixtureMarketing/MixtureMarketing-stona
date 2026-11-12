import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/services/cmsService', () => {
  const chain: Record<string, unknown> = {};
  for (const k of ['width', 'height', 'fit', 'crop', 'auto']) chain[k] = () => chain;
  chain.url = () => 'https://cdn.example/x.jpg';
  return { urlFor: () => chain };
});

import CaseStudyHero from '@/components/templates/case-study/CaseStudyHero';
import type { SanityCaseStudy } from '@/types';
import { VT_NAMES } from '@/utils/viewTransitions';
import { setArrivalPath } from '@/utils/caseStudyArrival';

const IMG = { _type: 'image', asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' } };
const PROJECT = {
  _id: 'id-alfa',
  title: 'Alfa',
  slug: 'alfa',
  category: 'web',
  subcategory: ['Sklep'],
  excerpt: 'opis realizacji',
  client: 'Klient',
  date: '2025',
  mainImage: IMG,
} as unknown as SanityCaseStudy;

function renderHero(project: SanityCaseStudy = PROJECT) {
  return render(
    <MemoryRouter initialEntries={['/portfolio/alfa/']}>
      <CaseStudyHero project={project} />
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllEnvs());

describe('MIX-1471: switch OFF = production layout unchanged', () => {
  it.each([undefined, '', '0', 'false'])(
    'VITE_MM_VIEW_TRANSITIONS=%s: markup identical to the production hero',
    (value) => {
      if (value !== undefined) vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', value);
      const { container } = renderHero();
      // Snapshot recorded on the unchanged production component (base 4953c82).
      expect(container.innerHTML).toMatchSnapshot();
    },
  );
});

describe('MIX-1471: switch ON = photo at the very top, text below', () => {
  it('photo comes first, then category, one H1 with the same text, lead, client/date', () => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1');
    const { container } = renderHero();
    const header = container.querySelector('header')!;
    expect(header.getAttribute('data-hero-layout')).toBe('photo-top');
    // Nav is fixed h-20 and breadcrumbs (52 px) sit above: a small top padding, not pt-32.
    expect(header.className.split(' ')).toContain('pt-10');
    expect(header.className.split(' ')).not.toContain('pt-32');

    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toBe('Alfa');

    const photo = screen.getByRole('img', { name: 'Alfa' });
    const order = (a: Node, b: Node) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
    const pill = screen.getByText(/web \/ Sklep/);
    expect(order(photo, pill)).toBeTruthy();
    expect(order(pill, h1s[0])).toBeTruthy();
    expect(order(h1s[0], screen.getByText('opis realizacji'))).toBeTruthy();
    expect(order(screen.getByText('opis realizacji'), screen.getByText('Klient'))).toBeTruthy();
    // The photo is the first element of the header content.
    const first = header.querySelector('.container')!.firstElementChild!;
    expect(first.contains(photo)).toBe(true);
  });

  it('photo stays the LCP element: alt, width/height, fetchpriority high, never lazy, no entrance fade', () => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', 'true');
    renderHero();
    const photo = screen.getByRole('img', { name: 'Alfa' });
    expect(photo.getAttribute('alt')).toBe('Alfa');
    expect(photo.getAttribute('width')).toBe('1600');
    expect(photo.getAttribute('height')).toBe('900');
    expect(photo.getAttribute('fetchpriority')).toBe('high');
    expect(photo.hasAttribute('loading')).toBe(false);
    // Fixed frame (no layout shift when the image arrives) and no opacity-0 wrapper.
    const frame = photo.parentElement!;
    expect(frame.className).toMatch(/aspect-\[4\/3\]/);
    expect(frame.getAttribute('style') ?? '').not.toMatch(/opacity/);
  });

  it('missing image: no photo, one H1, text keeps the production top padding', () => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1');
    const { container } = renderHero({ ...PROJECT, mainImage: undefined } as SanityCaseStudy);
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const header = container.querySelector('header')!;
    expect(header.className.split(' ')).toContain('pt-32');
    expect(header.className.split(' ')).not.toContain('pt-10');
  });

  it('no view-transition-name at rest (names only during the transition)', () => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1');
    const { container } = renderHero();
    expect(container.innerHTML).not.toMatch(/view-transition-name/);
  });
});

describe('MIX-1471: shared element on the photo-top hero', () => {
  afterEach(() => act(() => setArrivalPath(null)));

  function namesNow(root: ParentNode): string[] {
    return Array.from(root.querySelectorAll<HTMLElement>('[style]'))
      .map((el) => el.style.getPropertyValue('view-transition-name'))
      .filter(Boolean);
  }

  it('arrival on this page: photo frame and H1 carry the transition names, each once', () => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1');
    act(() => setArrivalPath('/portfolio/alfa/'));
    const { container } = renderHero();
    expect(namesNow(container).sort()).toEqual([VT_NAMES.image, VT_NAMES.title].sort());
    const photo = screen.getByRole('img', { name: 'Alfa' });
    expect(photo.parentElement!.style.getPropertyValue('view-transition-name')).toBe(
      VT_NAMES.image,
    );
  });

  it('arrival for another page: no names on this hero', () => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1');
    act(() => setArrivalPath('/portfolio/beta/'));
    const { container } = renderHero();
    expect(namesNow(container)).toEqual([]);
  });
});
