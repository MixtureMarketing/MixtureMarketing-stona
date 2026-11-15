import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { installBackInterceptor, noteLocation } from '@/utils/caseStudyBackBrowser';
import { BACK_CARD_MAX_MS, BACK_CONFIRM_MS } from '@/utils/caseStudyBackTransition';
import { BACK_RELEASE_MAX_MS, BACK_SETTLE_MS } from '@/utils/caseStudyBackOptions';
import { recordScroll, resetPositions, savedPosition } from '@/utils/caseStudyBack';
import { startRestore } from '@/utils/caseStudyRestore';
import {
  armSource,
  backOwned,
  backTicket,
  listenUserInput,
  resetBackState,
} from '@/utils/caseStudyGeneration';
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
    await vi.advanceTimersByTimeAsync(300);
    expect(router).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
    expect(document.querySelector('.card img')?.getAttribute('style')).toContain(
      'realizacja-zdjecie',
    );
    expect(document.documentElement.getAttribute(VT_ATTR)).toBe('realizacja-powrot');
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
    await vi.advanceTimersByTimeAsync(300);
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
    await vi.advanceTimersByTimeAsync(300);
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

  it('MIX-1699: a second back to "/" during our transition skips it before the router renders "/"', async () => {
    page(true);
    // the list is not tall enough yet: the transition is still waiting for it when the second back comes
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 1000,
      configurable: true,
    });
    pop();
    await vi.advanceTimersByTimeAsync(20);
    expect(router).toHaveBeenCalledTimes(1);
    expect(document.documentElement.getAttribute(VT_ATTR)).toBe('realizacja-powrot');
    expect(skip).not.toHaveBeenCalled();
    const firstSkip = skip;
    let atRouter: unknown = null;
    router.mockImplementationOnce(() => {
      atRouter = [
        firstSkip.mock.calls.length > 0,
        document.documentElement.hasAttribute(VT_ATTR),
        document.querySelector('[style*="view-transition-name"]') !== null,
      ];
    });
    window.history.pushState({}, '', '/');
    pop();
    // MIX-1707 r2: the router gets the second back only after the skipped callback ended
    expect(atRouter).toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    // skipped, attribute and every name gone, all before the router sees the second back
    expect(atRouter).toEqual([true, false, false]);
    await vi.advanceTimersByTimeAsync(400);
    expect(router).toHaveBeenCalledTimes(2);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('MIX-1699: allowed twin: a finished transition is not skipped again by a later back we do not take', async () => {
    page(true);
    pop();
    await vi.advanceTimersByTimeAsync(400);
    release();
    await vi.advanceTimersByTimeAsync(10);
    const done = skip;
    expect(done).not.toHaveBeenCalled();
    window.history.pushState({}, '', '/');
    pop();
    expect(done).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledTimes(2);
  });

  // MIX-1707 r2 (lead decision): a newer popstate while our back is pending ends the transition at once and
  // the router gets it only after the paint hold is released (update callback settled, at most
  // BACK_RELEASE_MAX_MS); a newer popstate meanwhile = our hand-over is dropped; no transition = router at once
  describe('MIX-1707 r2: second back waits for the released paint hold', () => {
    let endCb: (ok: boolean) => void = () => undefined;
    // the update callback runs as usual, but its end (updateCallbackDone) is under the test's control
    function heldVT(settles = true) {
      startVT.mockImplementation((cb: () => Promise<void>) => {
        void Promise.resolve().then(cb);
        skip = vi.fn();
        const finished = new Promise<void>((r) => (release = r));
        const updateCallbackDone = new Promise<void>((resolve, reject) => {
          endCb = (ok) => (settles ? (ok ? resolve() : reject(new Error('cb'))) : undefined);
        });
        updateCallbackDone.catch(() => undefined);
        return { ready: Promise.resolve(), finished, updateCallbackDone, skipTransition: skip };
      });
    }
    function toRoot() {
      window.history.pushState({}, '', '/');
      pop();
    }

    it('refusal: the router does not get the second back while the skipped callback still holds paint', async () => {
      expect(BACK_RELEASE_MAX_MS).toBe(100);
      heldVT();
      page(true);
      pop();
      await vi.advanceTimersByTimeAsync(20);
      expect(router).toHaveBeenCalledTimes(1);
      toRoot();
      expect(skip).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(50);
      expect(router).toHaveBeenCalledTimes(1);
      endCb(true);
      await vi.advanceTimersByTimeAsync(1);
      expect(router).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(500);
      expect(router).toHaveBeenCalledTimes(2);
      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('refusal: a callback that never ends does not stop the navigation (router at 100 ms, not before)', async () => {
      heldVT(false);
      page(true);
      pop();
      await vi.advanceTimersByTimeAsync(20);
      toRoot();
      await vi.advanceTimersByTimeAsync(BACK_RELEASE_MAX_MS - 5);
      expect(router).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(10);
      expect(router).toHaveBeenCalledTimes(2);
    });

    it('refusal: a callback that fails releases the second back at once (no wait to the limit)', async () => {
      heldVT();
      page(true);
      pop();
      await vi.advanceTimersByTimeAsync(20);
      toRoot();
      endCb(false);
      await vi.advanceTimersByTimeAsync(1);
      expect(router).toHaveBeenCalledTimes(2);
    });

    it('refusal: a newer popstate during the wait drops our hand-over (router gets only the newer one)', async () => {
      heldVT(false);
      page(true);
      pop();
      await vi.advanceTimersByTimeAsync(20);
      toRoot();
      window.history.pushState({}, '', '/kontakt/');
      pop(); // no transition of ours any more: straight to the router
      expect(router).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(500);
      expect(router).toHaveBeenCalledTimes(2);
    });

    it('allowed twin: no transition of ours in progress = the router gets the popstate synchronously', () => {
      page(true);
      window.history.pushState({}, '', '/');
      pop();
      expect(startVT).not.toHaveBeenCalled();
      expect(router).toHaveBeenCalledTimes(1);
    });
  });

  // MIX-1711 (verdict MIX-1707, A12/A13): a transition object whose updateCallbackDone is missing, not a promise,
  // or throws on read, or whose skipTransition throws, never holds the second back: the router always gets it
  describe('MIX-1711: a broken transition object never stops the held second back (A12, A13)', () => {
    type Shape = 'missing' | 'not-a-promise' | 'getter-throws' | 'then-throws' | 'skip-throws';
    function brokenVT(shape: Shape) {
      startVT.mockImplementation((cb: () => Promise<void>) => {
        // the callback calls skipTransition itself (newer navigation): a throwing one rejects it, as in a browser
        Promise.resolve()
          .then(cb)
          .catch(() => undefined);
        skip = vi.fn(() => {
          if (shape === 'skip-throws') throw new Error('skip');
        });
        const finished = new Promise<void>((r) => (release = r));
        const t: Record<string, unknown> = {
          ready: Promise.resolve(),
          finished,
          skipTransition: skip,
        };
        if (shape === 'not-a-promise') t.updateCallbackDone = 42;
        if (shape === 'getter-throws')
          Object.defineProperty(t, 'updateCallbackDone', {
            get() {
              throw new Error('getter');
            },
          });
        if (shape === 'then-throws')
          t.updateCallbackDone = {
            then() {
              throw new Error('then');
            },
          };
        // skip-throws: the callback never ends, so only the 100 ms cap releases the second back
        if (shape === 'skip-throws') t.updateCallbackDone = new Promise<void>(() => undefined);
        return t;
      });
    }
    function toRoot() {
      window.history.pushState({}, '', '/');
      pop();
    }

    for (const shape of ['missing', 'not-a-promise', 'getter-throws', 'then-throws'] as const)
      it(`refusal to hold: updateCallbackDone ${shape} = the router gets the second back at once, once`, async () => {
        brokenVT(shape);
        page(true);
        pop();
        await vi.advanceTimersByTimeAsync(20);
        expect(router).toHaveBeenCalledTimes(1);
        toRoot();
        expect(skip).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1);
        expect(router).toHaveBeenCalledTimes(2);
        expect(router.mock.calls[1][0].type).toBe('popstate');
        await vi.advanceTimersByTimeAsync(500);
        expect(router).toHaveBeenCalledTimes(2);
        expect(document.documentElement.hasAttribute(VT_ATTR)).toBe(false);
      });

    it('refusal to hold: skipTransition throws = names cleared and the router gets the second back by the cap', async () => {
      brokenVT('skip-throws');
      page(true);
      pop();
      await vi.advanceTimersByTimeAsync(20);
      toRoot();
      expect(skip).toHaveBeenCalledTimes(1);
      expect(document.documentElement.hasAttribute(VT_ATTR)).toBe(false);
      await vi.advanceTimersByTimeAsync(BACK_RELEASE_MAX_MS - 5);
      expect(router).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(10);
      expect(router).toHaveBeenCalledTimes(2);
    });

    it('allowed twin: a proper updateCallbackDone still holds the second back until the callback ends', async () => {
      let end: () => void = () => undefined;
      startVT.mockImplementation((cb: () => Promise<void>) => {
        void Promise.resolve().then(cb);
        skip = vi.fn();
        const finished = new Promise<void>((r) => (release = r));
        const updateCallbackDone = new Promise<void>((r) => (end = r));
        return { ready: Promise.resolve(), finished, updateCallbackDone, skipTransition: skip };
      });
      page(true);
      pop();
      await vi.advanceTimersByTimeAsync(20);
      toRoot();
      await vi.advanceTimersByTimeAsync(30);
      expect(router).toHaveBeenCalledTimes(1);
      end();
      await vi.advanceTimersByTimeAsync(1);
      expect(router).toHaveBeenCalledTimes(2);
    });
  });

  describe('MIX-1699 r2 / MIX-1707: fast second back', () => {
    let y = 0;
    const setY = (v: unknown) =>
      Object.defineProperty(window, 'scrollY', { value: v, configurable: true, writable: true });
    const instantTo = (top: number) => ({ top, left: 0, behavior: 'instant' });
    beforeEach(() => {
      y = 0;
      setY(0);
      // the page really moves on our scrollTo (window.scrollY follows), like a browser
      scrollTo.mockImplementation(((a: ScrollToOptions) => {
        y = Number(a.top);
        setY(y);
      }) as never);
    });
    afterEach(() => setY(0));
    function secondBack() {
      let atRouter: unknown[] = [];
      router.mockImplementationOnce(() => {
        atRouter = scrollTo.mock.calls.map((c: unknown[]) => c[0]);
      });
      window.history.pushState({}, '', '/');
      pop();
      return () => atRouter;
    }

    it('refusal: no restore of ours yet (second back while waiting for the list): no scroll at all', async () => {
      page(true);
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        configurable: true,
      });
      pop();
      await vi.advanceTimersByTimeAsync(20);
      expect(scrollTo).not.toHaveBeenCalled();
      secondBack();
      await vi.advanceTimersByTimeAsync(400);
      expect(scrollTo).not.toHaveBeenCalled();
    });

    // MIX-1707: our code scrolls the list only after the back is confirmed single (BACK_CONFIRM_MS, no newer
    // popstate); a second back before that = no scroll of ours at all (no restore, no compensating scroll)
    it('refusal: a second back to "/" inside the window: no scroll of ours, ever', async () => {
      page(true);
      pop();
      await vi.advanceTimersByTimeAsync(60);
      expect(router).toHaveBeenCalledTimes(1);
      const atRouter = secondBack();
      expect(atRouter()).toEqual([]);
      await vi.advanceTimersByTimeAsync(2000);
      expect(scrollTo).not.toHaveBeenCalled();
      expect(skip).toHaveBeenCalled();
      expect(router).toHaveBeenCalledTimes(2);
    });

    it('refusal: a second back just inside the window (85 ms): no scroll', async () => {
      page(true);
      pop();
      await vi.advanceTimersByTimeAsync(85);
      secondBack();
      await vi.advanceTimersByTimeAsync(2000);
      expect(scrollTo).not.toHaveBeenCalled();
    });

    // MIX-1711: the window is 90 ms from the accepted back (was 250: +190 ms of frozen screen before frame 1)
    it('allowed twin: a single back is restored once, right after the 90 ms window', async () => {
      expect(BACK_CONFIRM_MS).toBe(90);
      expect(BACK_SETTLE_MS).toBe(32);
      page(true);
      pop();
      await vi.advanceTimersByTimeAsync(85);
      expect(scrollTo).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(10);
      expect(scrollTo).toHaveBeenCalledTimes(1);
      expect(scrollTo).toHaveBeenCalledWith(instantTo(1500));
    });

    it('the transition owns the restore of the accepted back (ScrollToTop does not scroll)', async () => {
      page(true);
      expect(backOwned()).toBe(false);
      pop();
      expect(backOwned()).toBe(true);
      secondBack();
      expect(backOwned()).toBe(false);
    });

    it('allowed twin: no transition (reduced motion): the restore is not taken', () => {
      page(true);
      motion(false);
      pop();
      expect(backOwned()).toBe(false);
    });

    it('list still short after the card wait: waits for height with the same ticket, scrolls at the limit', async () => {
      page(true);
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        configurable: true,
      });
      pop();
      await vi.advanceTimersByTimeAsync(330);
      // not clamped to the short page: nothing yet
      expect(scrollTo).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1600);
      expect(scrollTo).toHaveBeenCalledWith(instantTo(1500));
    });

    it.each(['wheel', 'keydown'])(
      'refusal: %s while that restore waits for height: nothing scrolls at the limit',
      async (type) => {
        page(true);
        Object.defineProperty(document.documentElement, 'scrollHeight', {
          value: 1000,
          configurable: true,
        });
        const unlisten = listenUserInput(window);
        pop();
        await vi.advanceTimersByTimeAsync(330);
        window.dispatchEvent(new Event(type));
        await vi.advanceTimersByTimeAsync(1600);
        expect(scrollTo).not.toHaveBeenCalled();
        unlisten();
      },
    );

    it('the second back ends the update callback at once (no 16 ms tick behind the new page)', async () => {
      page(true);
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        configurable: true,
      });
      pop();
      await vi.advanceTimersByTimeAsync(20);
      const t = startVT.mock.results[0].value as { updateCallbackDone: Promise<void> };
      let done = false;
      void t.updateCallbackDone.then(() => (done = true));
      secondBack();
      for (let i = 0; i < 10; i += 1) await Promise.resolve();
      expect(done).toBe(true);
    });

    it('allowed twin: without a second back the update callback still waits for the list', async () => {
      page(true);
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        configurable: true,
      });
      pop();
      await vi.advanceTimersByTimeAsync(20);
      const t = startVT.mock.results[0].value as { updateCallbackDone: Promise<void> };
      let done = false;
      void t.updateCallbackDone.then(() => (done = true));
      for (let i = 0; i < 10; i += 1) await Promise.resolve();
      expect(done).toBe(false);
    });
  });

  it.each([
    ['mousedown', false],
    ['touchstart', false],
    ['keydown', false],
    ['click', true],
  ])(
    'MIX-1699: %s in the manual window ends it on the list entry at once (before a link can push)',
    (type, claimKept) => {
      page(true);
      motion(false);
      window.history.scrollRestoration = 'auto';
      const unlisten = listenUserInput(window);
      pop();
      expect(window.history.scrollRestoration).toBe('manual');
      window.dispatchEvent(new Event(type));
      expect(window.history.scrollRestoration).toBe('auto');
      // a click only ends the window; the accepted back stays (wheel, touch, key, mouse button drop it)
      expect(backTicket(() => window.location)()).toBe(claimKept);
      unlisten();
    },
  );

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

describe('MIX-1745: BACK starts from the case-study header at the top of the page', () => {
  const caseY = (v: number) =>
    Object.defineProperty(window, 'scrollY', { value: v, configurable: true, writable: true });
  afterEach(() => caseY(0));

  it('case study read further down: to the top, instantly, BEFORE the old snapshot (startViewTransition)', async () => {
    page(true);
    caseY(1200);
    pop();
    expect(startVT).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
    // the browser takes the old snapshot after startViewTransition: the page is already at the top
    expect(scrollTo.mock.invocationCallOrder[0]).toBeLessThan(startVT.mock.invocationCallOrder[0]);
    caseY(0);
    await vi.advanceTimersByTimeAsync(300);
    // then the list goes to its saved position as before
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 1500, left: 0, behavior: 'instant' });
  });

  it('allowed twin: case study already at the top = no scroll of ours before the snapshot', () => {
    page(true);
    caseY(0);
    pop();
    expect(startVT).toHaveBeenCalledTimes(1);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('no transition (reduced motion, plain restore plan): the case study is not moved to the top', () => {
    page(true);
    motion(false);
    caseY(1200);
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  });

  it('no hero (no transition): the case study is not moved to the top', () => {
    page(false);
    caseY(1200);
    pop();
    expect(startVT).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  });
});
