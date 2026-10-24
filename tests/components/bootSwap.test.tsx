import React, { Suspense } from 'react';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { lazyWithPreload } from '../../components/common/lazyWithPreload';
import LazyHydrate from '../../components/common/LazyHydrate';
import ScrollToTop from '../../components/common/ScrollToTop';
import { endPrerenderBoot, isPrerenderBoot, markPrerenderBoot } from '../../utils/bootState';

// Start z prerenderowanego HTML: pierwszy render ma dać tę samą treść co zrzut —
// bez fallbacku Suspense, bez zwijania LazyHydrate, bez przewinięcia na górę.

afterEach(() => {
  endPrerenderBoot();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('lazyWithPreload', () => {
  it('po preload() renderuje synchronicznie — Suspense NIE pokazuje fallbacku', async () => {
    const Comp = lazyWithPreload(async () => ({ default: () => <p>treść trasy</p> }));
    await Comp.preload();
    render(
      <Suspense fallback={<p>spinner</p>}>
        <Comp />
      </Suspense>,
    );
    expect(screen.getByText('treść trasy')).toBeInTheDocument();
    expect(screen.queryByText('spinner')).not.toBeInTheDocument();
  });

  it('bez preloadu działa jak lazy(): fallback, potem komponent; import tylko raz', async () => {
    const factory = vi.fn(async () => ({ default: () => <p>później</p> }));
    const Comp = lazyWithPreload(factory);
    render(
      <Suspense fallback={<p>spinner</p>}>
        <Comp />
      </Suspense>,
    );
    expect(screen.getByText('spinner')).toBeInTheDocument();
    expect(await screen.findByText('później')).toBeInTheDocument();
    await Comp.preload();
    expect(factory).toHaveBeenCalledTimes(1);
  });
});

describe('LazyHydrate przy starcie z prerenderu', () => {
  it('przepuszcza dzieci (bez placeholdera i bez IntersectionObservera)', () => {
    const created = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor() {
          created();
        }
        observe() {}
        disconnect() {}
      },
    );
    markPrerenderBoot();
    expect(isPrerenderBoot()).toBe(true);
    render(
      <LazyHydrate minHeight="400px">
        <p>sekcja</p>
      </LazyHydrate>,
    );
    expect(screen.getByText('sekcja')).toBeInTheDocument();
    expect(created).not.toHaveBeenCalled();
  });

  it('poza startem z prerenderu zostaje leniwy (placeholder do wejścia w viewport)', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    render(
      <LazyHydrate minHeight="400px">
        <p>sekcja</p>
      </LazyHydrate>,
    );
    expect(screen.queryByText('sekcja')).not.toBeInTheDocument();
  });
});

describe('ScrollToTop', () => {
  it('pomija pierwsze montowanie, przewija po nawigacji SPA i kończy tryb startowy', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    markPrerenderBoot();
    const Nav = () => {
      const navigate = useNavigate();
      return <button onClick={() => navigate('/wycena/')}>dalej</button>;
    };
    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
        <Nav />
      </MemoryRouter>,
    );
    expect(scrollTo).not.toHaveBeenCalled();
    expect(isPrerenderBoot()).toBe(true);

    act(() => screen.getByText('dalej').click());
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(isPrerenderBoot()).toBe(false);
  });
});
