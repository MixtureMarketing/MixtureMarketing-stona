import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

vi.mock('@/config/routes', () => ({ preloadRoute: vi.fn(() => Promise.resolve()) }));
vi.mock('@/services/cmsService', () => {
  const chain: Record<string, unknown> = {};
  for (const k of ['width', 'height', 'fit', 'crop', 'auto']) chain[k] = () => chain;
  chain.url = () => 'https://cdn.example/x.jpg';
  return { urlFor: () => chain };
});

import { CaseStudyTransitionsGate } from '@/components/common/CaseStudyTransitions';
import PortfolioGrid from '@/components/features/portfolio/PortfolioGrid';
import CaseStudyHero from '@/components/templates/case-study/CaseStudyHero';
import { VT_ATTR } from '@/utils/viewTransitions';
import { getArrivalPath } from '@/utils/caseStudyArrival';
import type { SanityCaseStudy } from '@/types';

const IMG = { _type: 'image', asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' } };
const project = (slug: string, title: string) =>
  ({
    _id: `id-${slug}`,
    title,
    slug,
    category: 'web',
    excerpt: 'opis',
    mainImage: IMG,
  }) as unknown as SanityCaseStudy;
const PROJECTS = [project('alfa', 'Alfa'), project('beta', 'Beta')];

/** Każdy element z `view-transition-name` w inline style, zebrany przez cały test. */
let seen: string[] = [];
let observer: MutationObserver | null = null;
function vtNamesNow(): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[style]'))
    .map((el) => el.style.getPropertyValue('view-transition-name'))
    .filter(Boolean);
}

function Where() {
  return <span data-testid="where">{useLocation().pathname}</span>;
}

function Tree() {
  return (
    <MemoryRouter initialEntries={['/portfolio/']}>
      <nav aria-label="Główna nawigacja">menu</nav>
      <CaseStudyTransitionsGate />
      <Where />
      <Routes>
        <Route path="/portfolio/" element={<PortfolioGrid projects={PROJECTS} loading={false} />} />
        <Route path="/portfolio/:slug/" element={<CaseStudyHero project={PROJECTS[0]} />} />
      </Routes>
    </MemoryRouter>
  );
}

function stubMotion(noPreference: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((q: string) => ({
      matches: q === '(prefers-reduced-motion: no-preference)' ? noPreference : !noPreference,
      media: q,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function installVT() {
  const spy = vi.fn((cb: () => Promise<void>) => {
    let done!: () => void;
    const finished = new Promise<void>((r) => (done = r));
    const updateCallbackDone = Promise.resolve()
      .then(cb)
      .then(() => done());
    return { ready: Promise.resolve(), finished, updateCallbackDone, skipTransition: vi.fn() };
  });
  (document as unknown as Record<string, unknown>).startViewTransition = spy;
  return spy;
}

beforeEach(() => {
  seen = [];
  observer = new MutationObserver((records) => {
    for (const r of records) {
      const el = r.target as HTMLElement;
      const n = el.style?.getPropertyValue('view-transition-name');
      if (n) seen.push(n);
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style'],
    subtree: true,
  });
});

afterEach(() => {
  observer?.disconnect();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  delete (document as unknown as Record<string, unknown>).startViewTransition;
});

async function clickCard(title: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole('link', { name: title }));
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 30));
  });
}

describe('MIX-1308 kryterium 1: przełącznik wyłączony = jak dziś', () => {
  it.each([undefined, '', '0', 'false'])(
    'VITE_MM_VIEW_TRANSITIONS=%s: zwykła nawigacja, 0 view-transition-name w DOM',
    async (value) => {
      if (value !== undefined) vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', value);
      stubMotion(true);
      const spy = installVT();
      render(<Tree />);
      expect(vtNamesNow()).toEqual([]);
      await clickCard('Alfa');
      expect(screen.getByTestId('where').textContent).toBe('/portfolio/alfa/');
      expect(spy).not.toHaveBeenCalled();
      expect(seen).toEqual([]);
      expect(vtNamesNow()).toEqual([]);
      expect(document.documentElement.hasAttribute(VT_ATTR)).toBe(false);
      expect(getArrivalPath()).toBeNull();
      // Nagłówek realizacji bez inline style z nazwą (h1 bez atrybutu style).
      expect(screen.getByRole('heading', { level: 1 }).hasAttribute('style')).toBe(false);
    },
  );
});

describe('MIX-1308: przełącznik włączony', () => {
  beforeEach(() => vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1'));

  it('A1: klik w kartę → jedno przejście, nazwy na źródle i celu, po końcu 0 nazw', async () => {
    stubMotion(true);
    const spy = installVT();
    render(<Tree />);
    await clickCard('Alfa');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('where').textContent).toBe('/portfolio/alfa/');
    // Widziane w trakcie: źródło (zdjęcie+tytuł), nagłówek strony, cel (zdjęcie+tytuł).
    expect(new Set(seen)).toEqual(
      new Set(['realizacja-zdjecie', 'realizacja-tytul', 'vt-naglowek']),
    );
    await act(async () => {
      await (spy.mock.results[0].value as { finished: Promise<void> }).finished;
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(vtNamesNow()).toEqual([]);
    expect(getArrivalPath()).toBeNull();
  });

  it('ogranicz ruch (reduce) = bez startViewTransition, zwykła nawigacja', async () => {
    stubMotion(false);
    const spy = installVT();
    render(<Tree />);
    await clickCard('Beta');
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByTestId('where').textContent).toBe('/portfolio/beta/');
    expect(seen).toEqual([]);
  });

  it('przeglądarka bez API = zwykła nawigacja, bez błędu', async () => {
    stubMotion(true);
    render(<Tree />);
    await clickCard('Beta');
    expect(screen.getByTestId('where').textContent).toBe('/portfolio/beta/');
    expect(seen).toEqual([]);
  });

  it('klik z Ctrl (nowa karta) = przeglądarce, bez przejścia', async () => {
    stubMotion(true);
    const spy = installVT();
    render(<Tree />);
    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'Alfa' }), { ctrlKey: true });
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('prerender (disabled) = nic się nie montuje', async () => {
    stubMotion(true);
    const spy = installVT();
    render(
      <MemoryRouter initialEntries={['/portfolio/']}>
        <CaseStudyTransitionsGate disabled />
        <Where />
        <Routes>
          <Route
            path="/portfolio/"
            element={<PortfolioGrid projects={PROJECTS} loading={false} />}
          />
          <Route path="/portfolio/:slug/" element={<CaseStudyHero project={PROJECTS[0]} />} />
        </Routes>
      </MemoryRouter>,
    );
    await clickCard('Alfa');
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByTestId('where').textContent).toBe('/portfolio/alfa/');
  });
});
