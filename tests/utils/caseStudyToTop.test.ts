import { describe, it, expect, vi } from 'vitest';
import { caseStudyToTop } from '@/utils/caseStudyRootScroll';

/** A window stand-in: only the fields caseStudyToTop reads. */
const win = (scrollY: number, scrollTo = vi.fn()) =>
  ({ scrollY, scrollX: 7, scrollTo }) as unknown as Window & { scrollTo: typeof scrollTo };

describe('caseStudyToTop (MIX-1745)', () => {
  it('scrolled case study: one instant scroll to the top, horizontal position kept', () => {
    const w = win(1200);
    caseStudyToTop(w);
    expect(w.scrollTo).toHaveBeenCalledTimes(1);
    expect(w.scrollTo).toHaveBeenCalledWith({ top: 0, left: 7, behavior: 'instant' });
  });

  it('1 px down is already "scrolled" (the header must start at its top position)', () => {
    const w = win(1);
    caseStudyToTop(w);
    expect(w.scrollTo).toHaveBeenCalledWith({ top: 0, left: 7, behavior: 'instant' });
  });

  it.each([0, -5, Number.NaN])('scrollY %s: nothing to do, no scroll', (y) => {
    const w = win(y);
    caseStudyToTop(w);
    expect(w.scrollTo).not.toHaveBeenCalled();
  });

  it('no window: nothing, no throw', () => {
    expect(() => caseStudyToTop(null)).not.toThrow();
  });

  it('a throwing scrollTo does not escape (the transition still starts)', () => {
    const w = win(
      900,
      vi.fn(() => {
        throw new Error('no scroll');
      }),
    );
    expect(() => caseStudyToTop(w)).not.toThrow();
    expect(w.scrollTo).toHaveBeenCalledTimes(1);
  });
});
