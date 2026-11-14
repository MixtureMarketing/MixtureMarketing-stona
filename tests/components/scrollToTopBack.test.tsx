import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import ScrollToTop from '@/components/common/ScrollToTop';
import { INSTANT_TOP } from '@/utils/caseStudyTransition';
import { recordScroll, resetPositions, savedPosition } from '@/utils/caseStudyBack';

function Nav() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate(-1)}>back</button>
      <Link to="/portfolio/">menu-list</Link>
      <Link to="/abonament/#pricing">pricing</Link>
    </>
  );
}

function Tree({ entries, index }: { entries: string[]; index: number }) {
  return (
    <MemoryRouter initialEntries={entries} initialIndex={index}>
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>
  );
}

const INSTANT = (y: number) => ({ top: y, left: 0, behavior: 'instant' });
let scrollTo: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  resetPositions();
  // jsdom has no layout: report a tall document so the restore is possible at once
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 10000,
    configurable: true,
  });
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  resetPositions();
});

describe.each([
  ['switch on', '1'],
  ['switch off', ''],
])('MIX-1675 ScrollToTop back navigation (%s)', (_n, flag) => {
  beforeEach(() => vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', flag));

  it('back with no saved position (direct entry) falls through to the old behaviour', () => {
    render(<Tree entries={['/portfolio/', '/portfolio/alfa/']} index={1} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('back'));
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('a plain link to the list (PUSH) still goes to the top, saved position unused', () => {
    recordScroll('/portfolio/', 1800);
    render(<Tree entries={['/portfolio/alfa/']} index={0} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('menu-list'));
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('hash navigation keeps its behaviour (scroll to 0 then to the element)', () => {
    recordScroll('/abonament/', 900);
    render(<Tree entries={['/portfolio/alfa/']} index={0} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('pricing'));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(scrollTo).not.toHaveBeenCalledWith(INSTANT(900));
  });

  it('back between two non-case-study pages is not touched', () => {
    recordScroll('/kontakt/', 700);
    render(<Tree entries={['/kontakt/', '/o-nas/']} index={1} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('back'));
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});

describe('MIX-1675 switch on: restore without animation', () => {
  beforeEach(() => vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1'));

  it('back (POP) from a case study restores the saved list position, instantly, no scroll to top', () => {
    recordScroll('/portfolio/', 1800);
    render(<Tree entries={['/portfolio/', '/portfolio/alfa/']} index={1} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('back'));
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(INSTANT(1800));
    expect(scrollTo).not.toHaveBeenCalledWith(0, 0);
    expect(scrollTo).not.toHaveBeenCalledWith(INSTANT_TOP);
    for (const call of scrollTo.mock.calls) {
      expect((call[0] as ScrollToOptions).behavior).not.toBe('smooth');
    }
  });

  it('switch on + reduced motion: the saved position is still restored instantly', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((q: string) => ({
        matches: q !== '(prefers-reduced-motion: no-preference)',
        media: q,
      })),
    );
    recordScroll('/portfolio/', 1800);
    render(<Tree entries={['/portfolio/', '/portfolio/alfa/']} index={1} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('back'));
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(INSTANT(1800));
    vi.unstubAllGlobals();
  });

  it('V6: back (POP) to a list entry with a hash does not restore the saved position', () => {
    recordScroll('/portfolio/', 1800);
    render(<Tree entries={['/portfolio/#x', '/portfolio/alfa/']} index={1} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('back'));
    expect(scrollTo).not.toHaveBeenCalledWith(INSTANT(1800));
  });

  it('F2: rapid double back: a restore still waiting for the list never scrolls the page left to', () => {
    vi.useFakeTimers();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 100,
      configurable: true,
    });
    recordScroll('/portfolio/', 1800);
    render(<Tree entries={['/', '/portfolio/', '/portfolio/alfa/']} index={2} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('back')); // to the list: restore waits for its height
    fireEvent.click(screen.getByText('back')); // to "/" before the list grew
    vi.advanceTimersByTime(3000);
    expect(scrollTo).not.toHaveBeenCalledWith(INSTANT(1800));
    vi.useRealTimers();
  });

  it('F2: same without the second back: the waiting restore does scroll the list at the limit', () => {
    vi.useFakeTimers();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 100,
      configurable: true,
    });
    recordScroll('/portfolio/', 1800);
    render(<Tree entries={['/', '/portfolio/', '/portfolio/alfa/']} index={2} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('back'));
    vi.advanceTimersByTime(3000);
    expect(scrollTo).toHaveBeenCalledWith(INSTANT(1800));
    vi.useRealTimers();
  });

  it('installs the scroll, click and popstate listeners', () => {
    const add = vi.spyOn(window, 'addEventListener');
    render(<Tree entries={['/portfolio/']} index={0} />);
    const names = add.mock.calls.map((c) => c[0]);
    expect(names).toEqual(expect.arrayContaining(['scroll', 'click', 'popstate']));
  });
});

describe('MIX-1675 switch off: identical to the behaviour before the change', () => {
  beforeEach(() => vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', ''));

  it('back (POP) from a case study does NOT restore the saved position: scrolls to the top as before', () => {
    recordScroll('/portfolio/', 1800);
    render(<Tree entries={['/portfolio/', '/portfolio/alfa/']} index={1} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('back'));
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(scrollTo).not.toHaveBeenCalledWith(INSTANT(1800));
  });

  it('switch off + reduced motion: still no restore (the fallback exists only with the switch on)', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((q: string) => ({
        matches: q !== '(prefers-reduced-motion: no-preference)',
        media: q,
      })),
    );
    recordScroll('/portfolio/', 1800);
    render(<Tree entries={['/portfolio/', '/portfolio/alfa/']} index={1} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('back'));
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    vi.unstubAllGlobals();
  });

  it('adds no scroll, click or popstate listeners and does not touch scrollRestoration', () => {
    window.history.scrollRestoration = 'auto';
    const add = vi.spyOn(window, 'addEventListener');
    render(<Tree entries={['/portfolio/alfa/']} index={0} />);
    const names = add.mock.calls.map((c) => c[0]);
    for (const n of ['scroll', 'click', 'popstate']) expect(names).not.toContain(n);
    expect(window.history.scrollRestoration).toBe('auto');
  });

  it('scrolling is not recorded', () => {
    window.history.pushState({}, '', '/portfolio/');
    render(<Tree entries={['/portfolio/']} index={0} />);
    Object.defineProperty(window, 'scrollY', { value: 640, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(savedPosition('/portfolio/')).toBeNull();
    window.history.pushState({}, '', '/');
  });
});

describe('position is recorded from scroll events of the current page', () => {
  it('records on the list, ignores a case-study page', async () => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1');
    window.history.pushState({}, '', '/portfolio/');
    render(<Tree entries={['/portfolio/']} index={0} />);
    Object.defineProperty(window, 'scrollY', { value: 640, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(savedPosition('/portfolio/')).toBe(640);
    window.history.pushState({}, '', '/portfolio/alfa/');
    Object.defineProperty(window, 'scrollY', { value: 5, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(savedPosition('/portfolio/')).toBe(640);
    window.history.pushState({}, '', '/');
  });
});
