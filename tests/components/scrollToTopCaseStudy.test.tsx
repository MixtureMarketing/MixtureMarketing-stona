import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Link, Routes, Route } from 'react-router-dom';
import { fireEvent } from '@testing-library/react';
import ScrollToTop from '@/components/common/ScrollToTop';
import { INSTANT_TOP, topScrollArgs } from '@/utils/caseStudyTransition';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('topScrollArgs (MIX-1471)', () => {
  it('case-study route with the switch on scrolls instantly', () => {
    expect(topScrollArgs('/portfolio/alfa/', true)).toEqual([INSTANT_TOP]);
    expect(topScrollArgs('/portfolio/alfa', true)).toEqual([INSTANT_TOP]);
  });

  it('switch off keeps the production call', () => {
    expect(topScrollArgs('/portfolio/alfa/', false)).toEqual([0, 0]);
  });

  it('other routes keep the production call', () => {
    expect(topScrollArgs('/portfolio/', true)).toEqual([0, 0]);
    expect(topScrollArgs('/uslugi/alfa/', true)).toEqual([0, 0]);
    expect(topScrollArgs('/portfolio/alfa/beta/', true)).toEqual([0, 0]);
    expect(topScrollArgs('', true)).toEqual([0, 0]);
  });
});

function navigateTo(href: string) {
  const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  const { getByText } = render(
    <MemoryRouter initialEntries={['/portfolio/']}>
      <ScrollToTop />
      <Link to={href}>go</Link>
      <Routes>
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(getByText('go'));
  return spy;
}

describe('ScrollToTop on a case-study route (MIX-1471)', () => {
  it('switch on: plain navigation to a case study scrolls to the top without animation', () => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1');
    const spy = navigateTo('/portfolio/alfa/');
    expect(spy).toHaveBeenCalledWith(INSTANT_TOP);
  });

  it('switch off: unchanged scrollTo(0, 0)', () => {
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '');
    const spy = navigateTo('/portfolio/alfa/');
    expect(spy).toHaveBeenCalledWith(0, 0);
    expect(spy).not.toHaveBeenCalledWith(INSTANT_TOP);
  });
});
