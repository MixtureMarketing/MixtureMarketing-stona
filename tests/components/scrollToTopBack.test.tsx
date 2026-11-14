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
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  resetPositions();
});

describe.each([
  ['switch on', '1'],
  ['switch off', ''],
])('MIX-1675 ScrollToTop back navigation (%s)', (_n, flag) => {
  beforeEach(() => vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', flag));

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

describe('position is recorded from scroll events of the current page', () => {
  it('records on the list, ignores a case-study page', async () => {
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
