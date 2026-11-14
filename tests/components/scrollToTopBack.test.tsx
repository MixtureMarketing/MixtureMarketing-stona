import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import ScrollToTop from '@/components/common/ScrollToTop';
import { INSTANT_TOP } from '@/utils/caseStudyTransition';
import { recordScroll, resetPositions, savedPosition } from '@/utils/caseStudyBack';
import { resetBackState } from '@/utils/caseStudyGeneration';

function Nav() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate(-1)}>back</button>
      <button onClick={() => navigate(-2)}>back2</button>
      <button onClick={() => navigate('/portfolio/alfa/?r=1', { replace: true })}>replace</button>
      <button onClick={() => navigate('/portfolio/', { replace: true })}>replace-list</button>
      <Link to="/portfolio/alfa/">card</Link>
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

/** Lista, potem link do realizacji (PUSH): lista staje się listą źródłową (MIX-1675 r6). */
function enterCase(entries = ['/', '/portfolio/']) {
  render(<Tree entries={entries} index={entries.length - 1} />);
  fireEvent.click(screen.getByText('card'));
}

/** Cofnięcie jak w przeglądarce: popstate na `url` (nasz nasłuch, faza capture), potem router. */
function popTo(url: string) {
  window.history.replaceState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
}
function browserBack(url: string, button = 'back') {
  popTo(url);
  fireEvent.click(screen.getByText(button));
}

beforeEach(() => {
  resetPositions();
  resetBackState();
  // the click listener records the position of window.location: keep it off the list while entering
  window.history.replaceState(null, '', '/neutral/');
  // jsdom has no layout: report a tall document so the restore is possible at once
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 10000,
    configurable: true,
  });
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});
afterEach(() => {
  window.history.replaceState(null, '', '/');
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
    enterCase();
    scrollTo.mockClear();
    browserBack('/portfolio/');
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
    enterCase();
    scrollTo.mockClear();
    browserBack('/portfolio/');
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(INSTANT(1800));
    vi.unstubAllGlobals();
  });

  it('V6: back (POP) to a list entry with a hash does not restore the saved position', () => {
    recordScroll('/portfolio/', 1800);
    enterCase(['/', '/portfolio/#x']);
    scrollTo.mockClear();
    // the popstate itself is accepted (same list); only the router location carries the hash
    browserBack('/portfolio/');
    expect(scrollTo).not.toHaveBeenCalledWith(INSTANT(1800));
  });

  it('F2: rapid double back: a restore still waiting for the list never scrolls the page left to', () => {
    vi.useFakeTimers();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 100,
      configurable: true,
    });
    recordScroll('/portfolio/', 1800);
    enterCase();
    scrollTo.mockClear();
    browserBack('/portfolio/'); // to the list: restore waits for its height
    browserBack('/'); // to "/" before the list grew
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
    enterCase();
    scrollTo.mockClear();
    browserBack('/portfolio/');
    vi.advanceTimersByTime(3000);
    expect(scrollTo).toHaveBeenCalledWith(INSTANT(1800));
    vi.useRealTimers();
  });

  it('G8: a link click (PUSH or REPLACE) to the same list while the restore waits: new generation, no restore', () => {
    vi.useFakeTimers();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 100,
      configurable: true,
    });
    recordScroll('/portfolio/', 1800);
    enterCase();
    browserBack('/portfolio/'); // to the list: restore waits for its height
    scrollTo.mockClear();
    // same path and query: only the generation tells the restore that the visitor moved on
    fireEvent.click(screen.getByText('menu-list'));
    vi.advanceTimersByTime(3000);
    expect(scrollTo).not.toHaveBeenCalledWith(INSTANT(1800));
    vi.useRealTimers();
  });

  it('G8b: a REPLACE onto the same list while the restore waits: new generation, no restore', () => {
    vi.useFakeTimers();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 100,
      configurable: true,
    });
    recordScroll('/portfolio/', 1800);
    enterCase();
    browserBack('/portfolio/');
    scrollTo.mockClear();
    fireEvent.click(screen.getByText('replace-list'));
    vi.advanceTimersByTime(3000);
    expect(scrollTo).not.toHaveBeenCalledWith(INSTANT(1800));
    vi.useRealTimers();
  });

  it('R6: double back that lands on "/" (pre-scrolled, saved 300): our code does nothing there, as switch off', () => {
    recordScroll('/', 300);
    enterCase();
    scrollTo.mockClear();
    popTo('/portfolio/'); // first popstate: accepted, the transition would hold it
    popTo('/'); // second popstate: not the source list
    // r6b: the browser itself puts "/" back at 300 (as with the switch off); the click below only drives
    // the router, and our click recorder (window.location = "/") must read that real position, not jsdom's 0
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(300);
    fireEvent.click(screen.getByText('back2')); // the router sees only the jump to "/"
    expect(savedPosition('/')).toBe(300);
    expect(scrollTo.mock.calls).toEqual([[0, 0]]);
  });

  it('R6: only the FIRST popstate after leaving the list counts (a later one onto the list does nothing)', () => {
    recordScroll('/portfolio/', 1800);
    enterCase();
    scrollTo.mockClear();
    popTo('/'); // e.g. history jumped elsewhere first: uses up the source
    browserBack('/portfolio/');
    expect(scrollTo.mock.calls).toEqual([[0, 0]]);
  });

  it('R6: no link from the list (direct entry on the case study): back to the list does nothing', () => {
    recordScroll('/portfolio/', 1800);
    render(<Tree entries={['/portfolio/', '/portfolio/alfa/']} index={1} />);
    scrollTo.mockClear();
    browserBack('/portfolio/');
    expect(scrollTo.mock.calls).toEqual([[0, 0]]);
  });

  it('R6: a REPLACE on the case study (address redirect) keeps the source list: back still restores', () => {
    recordScroll('/portfolio/', 1800);
    enterCase();
    fireEvent.click(screen.getByText('replace'));
    scrollTo.mockClear();
    browserBack('/portfolio/');
    expect(scrollTo).toHaveBeenCalledWith(INSTANT(1800));
  });

  it.each(['wheel', 'keydown', 'touchstart', 'mousedown'])(
    'R6: user input (%s) after the back cancels a restore still waiting for the list',
    (type) => {
      vi.useFakeTimers();
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 100,
        configurable: true,
      });
      recordScroll('/portfolio/', 1800);
      enterCase();
      scrollTo.mockClear();
      browserBack('/portfolio/');
      window.dispatchEvent(new Event(type));
      vi.advanceTimersByTime(3000);
      expect(scrollTo).not.toHaveBeenCalledWith(INSTANT(1800));
      vi.useRealTimers();
    },
  );

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
