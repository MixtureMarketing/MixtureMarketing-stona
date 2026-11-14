import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { installBackInterceptor, noteLocation } from '@/utils/caseStudyBackBrowser';
import { BACK_CARD_MAX_MS } from '@/utils/caseStudyBackTransition';
import { recordScroll, resetPositions, savedPosition } from '@/utils/caseStudyBack';
import { VT_ATTR } from '@/utils/viewTransitions';

let uninstall: () => void;
let router: Mock<(e: PopStateEvent) => void>;
let startVT: ReturnType<typeof vi.fn>;
let scrollTo: ReturnType<typeof vi.spyOn>;
let release: () => void = () => undefined;

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
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  startVT = vi.fn((cb: () => Promise<void>) => {
    const done = Promise.resolve().then(cb);
    release = () => undefined;
    const finished = new Promise<void>((r) => (release = r));
    return {
      ready: Promise.resolve(),
      finished,
      updateCallbackDone: done,
      skipTransition: vi.fn(),
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
afterEach(() => {
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
    const skip = startVT.mock.results[0].value.skipTransition as Mock;
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
    const skip = startVT.mock.results[0].value.skipTransition as Mock;
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
