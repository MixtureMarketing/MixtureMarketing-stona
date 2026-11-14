import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { installBackInterceptor, noteLocation } from '@/utils/caseStudyBackBrowser';
import { BACK_CARD_MAX_MS } from '@/utils/caseStudyBackTransition';
import { recordScroll, resetPositions, savedPosition } from '@/utils/caseStudyBack';
import { startRestore } from '@/utils/caseStudyRestore';
import { armSource, listenUserInput, resetBackState } from '@/utils/caseStudyGeneration';
import { VT_ATTR } from '@/utils/viewTransitions';

let uninstall: () => void;
let router: Mock<(e: PopStateEvent) => void>;
let startVT: ReturnType<typeof vi.fn>;
let scrollTo: ReturnType<typeof vi.spyOn>;
let release: () => void = () => undefined;
let skip: Mock = vi.fn();

const rect = (top: number) =>
  ({ top, bottom: top + 200, width: 300, height: 200, left: 0, right: 300 }) as DOMRect;

function page(withHero: boolean) {
  document.body.innerHTML =
    '<nav aria-label="Główna nawigacja">m</nav><main>' +
    (withHero
      ? '<header data-hero-layout="photo-top"><div id="frame"><img fetchpriority="high" src="x"></div><h1>T</h1></header>'
      : '') +
    '<div class="card"><img src="c" alt="a"><h3><a href="/portfolio/alfa/">Alfa</a></h3></div></main>';
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 5000,
    configurable: true,
  });
  const cardImg = document.querySelector('.card img') as HTMLElement;
  cardImg.getBoundingClientRect = () => rect(100);
}

function motion(v: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((q: string) => ({
      matches: q === '(prefers-reduced-motion: no-preference)' ? v : !v,
      media: q,
    })),
  );
}

function pop() {
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
}

beforeEach(() => {
  vi.useFakeTimers();
  resetPositions();
  window.history.pushState({}, '', '/portfolio/');
  recordScroll('/portfolio/', 1500);
  noteLocation('/portfolio/alfa/');
  // the visitor came to the case study by a link from the list (PUSH): the list is the source
  resetBackState();
  armSource({ pathname: '/portfolio/', search: '' });
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  startVT = vi.fn((cb: () => Promise<void>) => {
    const done = Promise.resolve().then(cb);
    release = () => undefined;
    skip = vi.fn();
    const finished = new Promise<void>((r) => (release = r));
    return {
      ready: Promise.resolve(),
      finished,
      updateCallbackDone: done,
      skipTransition: skip,
    };
  });
  (document as unknown as Record<string, unknown>).startViewTransition = startVT;
  motion(true);
  vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '1');
  uninstall = installBackInterceptor();
  // the router listens in the bubbling phase, registered AFTER ours
  router = vi.fn<(e: PopStateEvent) => void>();
  window.addEventListener('popstate', router);
});
afterEach(async () => {
  // end a transition left open by the test (otherwise the "active" flag leaks into the next test)
  release();
  await vi.advanceTimersByTimeAsync(10);
  window.removeEventListener('popstate', router);
  uninstall();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete (document as unknown as Record<string, unknown>).startViewTransition;
  window.history.pushState({}, '', '/');
  resetPositions();
});

describe('installBackInterceptor popstate handling (MIX-1675)', () => {
  it('all conditions: one transition, the router gets the event only inside it, once', async () => {
    page(true);
    pop();
    expect(startVT).toHaveBeenCalledTimes(1);
    expect(router).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    expect(router).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
    expect(document.querySelector('.card img')?.getAttribute('style')).toContain(
      'realizacja-zdjecie',
    );
    expect(document.documentElement.getAttribute(VT_ATTR)).toBe('realizacja');
    release();
    await vi.advanceTimersByTimeAsync(10);
    expect(document.querySelector('[style*="view-transition-name"]')).toBeNull();
    expect(document.documentElement.hasAttribute(VT_ATTR)).toBe(false);
  });

  it.each([
    ['reduced motion', () => motion(false)],
    [
      'no API',
      () => {
        delete (document as unknown as Record<string, unknown>).startViewTransition;
      },
    ],
  ])('%s: router handles it directly, no transition', (_n, setup) => {
    page(true);
    setup();
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(1);
  });

  it('switch off: popstate is left alone (router handles it, no hold, no manual restoration)', () => {
    page(true);
    vi.stubEnv('VITE_MM_VIEW_TRANSITIONS', '');
    window.history.scrollRestoration = 'auto';
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(1);
    expect(window.history.scrollRestoration).toBe('auto');
    recordScroll('/portfolio/', 0);
    expect(savedPosition('/portfolio/')).toBe(0);
  });

  it('scroll events caused by the browser during the back navigation do not overwrite the saved position', () => {
    page(true);
    motion(false); // switch on, reduced motion: plain restore plan
    pop();
    recordScroll('/portfolio/', 0);
    expect(savedPosition('/portfolio/')).toBe(1500);
  });

  it('scrollRestoration is manual only during the back navigation, then restored', () => {
    page(true);
    motion(false); // switch on, reduced motion: plain restore plan
    window.history.scrollRestoration = 'auto';
    pop();
    expect(window.history.scrollRestoration).toBe('manual');
    vi.advanceTimersByTime(1300);
    expect(window.history.scrollRestoration).toBe('auto');
  });

  it('no saved position: scrollRestoration untouched', () => {
    page(true);
    resetPositions();
    window.history.scrollRestoration = 'auto';
    pop();
    expect(window.history.scrollRestoration).toBe('auto');
  });

  it('F2: the next popstate cancels a restore still waiting for the list (it never scrolls another page)', () => {
    page(false);
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 100,
      configurable: true,
    });
    startRestore(1500, { maxMs: 1500 });
    scrollTo.mockClear();
    pop();
    vi.advanceTimersByTime(2500);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('F2: without a following popstate the same waiting restore does scroll at the limit', () => {
    page(false);
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 100,
      configurable: true,
    });
    startRestore(1500, { maxMs: 1500 });
    scrollTo.mockClear();
    vi.advanceTimersByTime(1600);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
  });

  it('F2: a popstate handed to the router by our own transition does not cancel its restore', async () => {
    page(true);
    pop();
    await vi.advanceTimersByTimeAsync(100);
    expect(router).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
  });

  it('hero not in the DOM: plain handling', () => {
    page(false);
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(1);
  });

  it('direct entry (no saved position): browser default, no transition', () => {
    page(true);
    resetPositions();
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(1);
  });

  it('not coming from a case study: untouched', () => {
    page(true);
    noteLocation('/kontakt/');
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(1);
  });

  it('card not on the list within 300 ms: skipped, router still got the event, position restored', async () => {
    page(true);
    document.querySelector('.card')?.remove();
    pop();
    await vi.advanceTimersByTimeAsync(400);
    expect(router).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
    expect(document.querySelector('.card')).toBeNull();
  });

  it('V5: the card is awaited for 300 ms, not shorter and not longer', async () => {
    page(true);
    document.querySelector('.card')?.remove();
    pop();
    await vi.advanceTimersByTimeAsync(250);
    expect(skip).not.toHaveBeenCalled();
    expect(BACK_CARD_MAX_MS).toBe(300);
    await vi.advanceTimersByTimeAsync(150);
    expect(skip).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['above the viewport', { top: -500, bottom: -300, width: 300 }],
    ['below the viewport', { top: 5000, bottom: 5200, width: 300 }],
    ['zero width', { top: 100, bottom: 300, width: 0 }],
  ])('V9: a card %s is not matched: transition skipped, position still restored', async (_n, r) => {
    page(true);
    const img = document.querySelector('.card img') as HTMLElement;
    img.getBoundingClientRect = () => ({ ...r, height: 200, left: 0, right: 300 }) as DOMRect;
    pop();
    await vi.advanceTimersByTimeAsync(100);
    expect(skip).toHaveBeenCalledTimes(1);
    expect(img.getAttribute('style') ?? '').not.toContain('realizacja-zdjecie');
    expect(scrollTo).toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
    expect(router).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['another path', '/'],
    ['same path, other query', '/portfolio/?q=1'],
  ])('rapid second back (%s): the saved list position is not restored there', async (_n, url) => {
    page(true);
    pop();
    window.history.pushState({}, '', url);
    await vi.advanceTimersByTimeAsync(400);
    expect(scrollTo).not.toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('G6: a second back before our transition callback (hash popstate, same list): the old back does nothing', async () => {
    page(true);
    pop();
    // same path and query, only a new generation: the location check alone would let it through
    window.history.pushState({}, '', '/portfolio/#x');
    pop();
    await vi.advanceTimersByTimeAsync(400);
    expect(skip).toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
    // only the second popstate reached the router; the stale first one is not handed over
    expect(router).toHaveBeenCalledTimes(1);
  });

  it('G6: allowed twin: a single back runs the transition and restores the list', async () => {
    page(true);
    pop();
    await vi.advanceTimersByTimeAsync(400);
    expect(router).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
  });

  it('G7: the second back does not set manual restoration on the page it lands on', async () => {
    page(true);
    pop();
    await vi.advanceTimersByTimeAsync(10);
    window.history.pushState({}, '', '/');
    window.history.scrollRestoration = 'auto';
    pop();
    expect(window.history.scrollRestoration).toBe('auto');
  });

  it('R6: popstate onto a page other than the source list: no transition, no hold, restoration untouched', async () => {
    page(true);
    window.history.pushState({}, '', '/');
    recordScroll('/', 900);
    window.history.scrollRestoration = 'auto';
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(1);
    expect(window.history.scrollRestoration).toBe('auto');
    recordScroll('/', 40); // not held: the browser's own scroll events are recorded as before
    expect(savedPosition('/')).toBe(40);
    await vi.advanceTimersByTimeAsync(400);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('R6: popstate onto the list with a hash (#x): browser behaviour, nothing of ours', () => {
    page(true);
    window.history.pushState({}, '', '/portfolio/#x');
    window.history.scrollRestoration = 'auto';
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(1);
    expect(window.history.scrollRestoration).toBe('auto');
  });

  it('R6: no source list (direct entry, missing state): first popstate onto the list does nothing', () => {
    page(true);
    resetBackState();
    window.history.scrollRestoration = 'auto';
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(1);
    expect(window.history.scrollRestoration).toBe('auto');
  });

  it('R6: a second popstate onto the same list during the transition: skipped, plain navigation', async () => {
    page(true);
    pop();
    pop(); // same location again (e.g. back + forward + back): not the first popstate any more
    expect(startVT).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(400);
    expect(skip).toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(1);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it.each(['wheel', 'keydown', 'touchstart', 'mousedown'])(
    'R6: user input (%s) right after the back: the transition does not restore',
    async (type) => {
      page(true);
      const unlisten = listenUserInput(window); // ScrollToTop installs it next to the interceptor
      pop();
      window.dispatchEvent(new Event(type));
      unlisten();
      await vi.advanceTimersByTimeAsync(400);
      expect(skip).toHaveBeenCalled();
      expect(scrollTo).not.toHaveBeenCalled();
    },
  );

  it('R6: a popstate we do not take ends our manual restoration at once (browser restores that page)', () => {
    page(true);
    motion(false);
    window.history.scrollRestoration = 'auto';
    pop();
    expect(window.history.scrollRestoration).toBe('manual');
    vi.advanceTimersByTime(1000);
    expect(window.history.scrollRestoration).toBe('manual');
    window.history.replaceState(null, '', '/'); // same entry: only our revert can change it
    pop();
    expect(window.history.scrollRestoration).toBe('auto');
  });

  it('a click records the exact position even when the last scroll event has not fired yet', () => {
    page(true);
    window.history.pushState({}, '', '/portfolio/');
    resetPositions();
    Object.defineProperty(window, 'scrollY', { value: 1365, configurable: true });
    document.body.click();
    expect(savedPosition('/portfolio/')).toBe(1365);
    window.history.pushState({}, '', '/portfolio/alfa/');
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    document.body.click();
    expect(savedPosition('/portfolio/')).toBe(1365);
  });

  it('uninstall removes the listeners', () => {
    page(true);
    uninstall();
    pop();
    expect(startVT).not.toHaveBeenCalled();
    uninstall = installBackInterceptor();
  });
});
