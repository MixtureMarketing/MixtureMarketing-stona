import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  BACK_CONFIRM_MS,
  VT_BACK_VALUE,
  runCaseStudyBackTransition,
  type BackRunOptions,
} from '@/utils/caseStudyBackTransition';
import { armSource, backOwned, claimBack, resetBackState } from '@/utils/caseStudyGeneration';
import { setBackSkip, skipBackTransition } from '@/utils/caseStudyBackSkip';
import { BACK_SETTLE_MS } from '@/utils/caseStudyBackOptions';
import { isTransitionActive } from '@/utils/caseStudyTransition';
import { VT_ATTR } from '@/utils/viewTransitions';

const names = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[style]'))
    .map((el) => el.style.getPropertyValue('view-transition-name'))
    .filter(Boolean);

/** The update callback runs in a later task; `finished` stays open until release() is called. */
let release: () => void = () => undefined;
function installVT(opts: { throws?: boolean; cbDone?: 'missing' | 'getter-throws' } = {}) {
  const skip = vi.fn();
  const spy = vi.fn((cb: () => Promise<void>) => {
    if (opts.throws) throw new Error('boom');
    let done!: () => void;
    const finished = new Promise<void>((r) => (done = r));
    release = done;
    // like the browser: skipTransition() makes `ready` reject (it never resolves after a skip)
    let rejectReady!: (e: unknown) => void;
    let resolveReady!: () => void;
    const ready = new Promise<void>((res, rej) => {
      resolveReady = res;
      rejectReady = rej;
    });
    ready.catch(() => undefined);
    let skipped = false;
    skip.mockImplementation(() => {
      skipped = true;
      rejectReady(new DOMException('Skipped', 'AbortError'));
    });
    const updateCallbackDone = new Promise<void>((resolve) =>
      setTimeout(
        () =>
          resolve(
            cb().then(() => {
              if (!skipped) resolveReady();
            }),
          ),
        0,
      ),
    );
    // MIX-1711 (A12, A13): the callback still runs, but the object has no usable updateCallbackDone
    if (opts.cbDone === 'missing') return { ready, finished, skipTransition: skip };
    if (opts.cbDone === 'getter-throws')
      return Object.defineProperty(
        { ready, finished, skipTransition: skip },
        'updateCallbackDone',
        {
          get() {
            throw new Error('getter');
          },
        },
      );
    return { ready, finished, updateCallbackDone, skipTransition: skip };
  });
  (document as unknown as Record<string, unknown>).startViewTransition = spy;
  return { spy, skip };
}

let heroImg: HTMLElement;
let heroTitle: HTMLElement;
let cardImg: HTMLElement;
let cardTitle: HTMLElement;

function options(over: Partial<BackRunOptions> = {}): BackRunOptions {
  return {
    y: 1500,
    hero: { image: heroImg, title: heroTitle },
    redispatch: vi.fn(),
    listReady: () => true,
    findCard: () => ({ image: cardImg, title: cardTitle }),
    live: () => true,
    restore: vi.fn(),
    doc: document,
    cardMs: 50,
    // MIX-1707: the confirmation wait has its own tests below; the older ones run without it
    confirmMs: 0,
    settleMs: 0,
    ...over,
  };
}

const flush = () => new Promise((r) => setTimeout(r, 80));

const setScrollY = (y: number) =>
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });

beforeEach(() => {
  setScrollY(1500);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
  document.body.innerHTML =
    '<nav aria-label="Główna nawigacja">m</nav><div id="h"><h1 id="ht">T</h1></div><div id="ci"></div><h3 id="ct"></h3>';
  heroImg = document.getElementById('h') as HTMLElement;
  heroTitle = document.getElementById('ht') as HTMLElement;
  cardImg = document.getElementById('ci') as HTMLElement;
  cardTitle = document.getElementById('ct') as HTMLElement;
});
afterEach(() => {
  vi.restoreAllMocks();
  delete (document as unknown as Record<string, unknown>).startViewTransition;
});

describe('runCaseStudyBackTransition (MIX-1675)', () => {
  it('one transition: hero named before, card named after, restore then all names gone', async () => {
    const { spy } = installVT();
    const o = options();
    const order: string[] = [];
    o.redispatch = vi.fn(() => order.push(`redispatch:${names().length}`));
    o.restore = vi.fn(() => order.push('restore'));
    expect(await runCaseStudyBackTransition(o)).toBe('transition');
    // before the snapshot: hero image + title + nav carry names
    expect(names().sort()).toEqual(['realizacja-tytul', 'realizacja-zdjecie', 'vt-naglowek']);
    expect(document.documentElement.getAttribute(VT_ATTR)).toBe(VT_BACK_VALUE);
    expect(isTransitionActive()).toBe(true);
    await flush();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(o.redispatch).toHaveBeenCalledTimes(1);
    expect(o.restore).toHaveBeenCalledWith(1500);
    // hero gave its names up before the router got the event; restore came after it
    expect(order).toEqual(['redispatch:1', 'restore']);
    expect(cardImg.style.getPropertyValue('view-transition-name')).toBe('realizacja-zdjecie');
    expect(cardTitle.style.getPropertyValue('view-transition-name')).toBe('realizacja-tytul');
    expect(heroImg.style.getPropertyValue('view-transition-name')).toBe('');
    // each shared name exactly once at any time
    expect(names().filter((n) => n === 'realizacja-zdjecie')).toHaveLength(1);
  });

  it('browser drift before the first frame is corrected once, instantly', async () => {
    installVT();
    const o = options();
    await runCaseStudyBackTransition(o);
    setScrollY(1365);
    await flush();
    expect(o.restore).toHaveBeenCalledTimes(2);
    expect(o.restore).toHaveBeenLastCalledWith(1500);
  });

  it('no drift (within 4 px): no second restore', async () => {
    installVT();
    const o = options();
    await runCaseStudyBackTransition(o);
    setScrollY(1503);
    await flush();
    expect(o.restore).toHaveBeenCalledTimes(1);
  });

  it('card not found (transition skipped, ready rejects): drift before the first frame is still corrected', async () => {
    const { skip } = installVT();
    const o = options({ findCard: () => null });
    await runCaseStudyBackTransition(o);
    setScrollY(1324);
    await flush();
    expect(skip).toHaveBeenCalledTimes(1);
    expect(o.restore).toHaveBeenCalledTimes(2);
    expect(o.restore).toHaveBeenLastCalledWith(1500);
  });

  it('list not ready (skipped): drift is corrected, and no drift means no second restore', async () => {
    installVT();
    const drifted = options({ listReady: () => false });
    await runCaseStudyBackTransition(drifted);
    setScrollY(6349);
    await flush();
    expect(drifted.restore).toHaveBeenCalledTimes(2);
    release();
    await flush();
    setScrollY(1500);
    installVT();
    const still = options({ findCard: () => null });
    await runCaseStudyBackTransition(still);
    await flush();
    expect(still.restore).toHaveBeenCalledTimes(1);
  });

  it('G1: a newer navigation before the callback: no hand-over to the router, nothing restored, skipped', async () => {
    const { skip } = installVT();
    const o = options({ live: () => false });
    await runCaseStudyBackTransition(o);
    setScrollY(1335);
    await flush();
    expect(skip).toHaveBeenCalledTimes(1);
    expect(o.restore).not.toHaveBeenCalled();
    expect(cardImg.style.getPropertyValue('view-transition-name')).toBe('');
    // the newer popstate already reached the router: the stale one is not handed over again
    expect(o.redispatch).not.toHaveBeenCalled();
    release();
    await flush();
    expect(names()).toEqual([]);
    expect(isTransitionActive()).toBe(false);
  });

  it('G2: a newer navigation while waiting for the list ends the wait at once: skipped, nothing restored', async () => {
    const { skip } = installVT();
    let alive = true;
    const o = options({ listReady: () => false, live: () => alive, cardMs: 300 });
    await runCaseStudyBackTransition(o);
    await new Promise((r) => setTimeout(r, 20));
    expect(o.redispatch).toHaveBeenCalledTimes(1);
    alive = false; // second back: new generation
    await new Promise((r) => setTimeout(r, 60));
    // well before the 300 ms limit: rendering is not held back by a wait for a list that is gone
    expect(skip).toHaveBeenCalledTimes(1);
    expect(o.restore).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 300));
    expect(o.restore).not.toHaveBeenCalled();
    expect(o.redispatch).toHaveBeenCalledTimes(1);
  });

  it('G2: same wait without a newer navigation runs to the limit and restores (allowed twin)', async () => {
    const { skip } = installVT();
    const o = options({ listReady: () => false, cardMs: 300 });
    await runCaseStudyBackTransition(o);
    await new Promise((r) => setTimeout(r, 80));
    expect(skip).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 300));
    expect(skip).toHaveBeenCalledTimes(1);
    expect(o.restore).toHaveBeenCalledWith(1500);
  });

  it('the list is left after the restore: the drift correction does not run on another page', async () => {
    installVT();
    let onList = true;
    const o = options({ live: () => onList });
    await runCaseStudyBackTransition(o);
    await new Promise((r) => setTimeout(r, 30));
    expect(o.restore).toHaveBeenCalledTimes(1);
    onList = false;
    setScrollY(1335);
    await flush();
    expect(o.restore).toHaveBeenCalledTimes(1);
  });

  // MIX-1711: BACK = ENTER played backwards: the reversed curve is keyed on this attribute, only while running
  it('the back attribute is set for the transition only, and the CSS reverses the ENTER curve under it', async () => {
    installVT();
    await runCaseStudyBackTransition(options());
    expect(document.documentElement.getAttribute(VT_ATTR)).toBe('realizacja-powrot');
    await flush();
    release();
    await flush();
    expect(document.documentElement.hasAttribute(VT_ATTR)).toBe(false);
    const css = fs.readFileSync(
      path.resolve(__dirname, '../../components/common/caseStudyTransitions.css'),
      'utf8',
    );
    const rule = css.match(
      /html\[data-vt='realizacja-powrot'\]::view-transition-group\(realizacja-zdjecie\)[^{]*\{([^}]*)\}/,
    );
    expect(rule?.[1]).toMatch(
      /animation-timing-function:\s*cubic-bezier\(0\.82,\s*0,\s*0\.68,\s*0\.28\)/,
    );
  });

  it('names disappear and the flag clears when the transition finishes', async () => {
    installVT();
    await runCaseStudyBackTransition(options());
    await flush();
    release();
    await flush();
    expect(names()).toEqual([]);
    expect(document.documentElement.hasAttribute(VT_ATTR)).toBe(false);
    expect(isTransitionActive()).toBe(false);
  });

  it('card without a title: only the image is matched on the new side', async () => {
    installVT();
    await runCaseStudyBackTransition(
      options({ findCard: () => ({ image: cardImg, title: null }) }),
    );
    await flush();
    expect(cardTitle.style.getPropertyValue('view-transition-name')).toBe('');
  });

  it('list not ready within the limit: transition skipped, position still restored', async () => {
    const { skip } = installVT();
    const o = options({ listReady: () => false });
    await runCaseStudyBackTransition(o);
    await flush();
    expect(skip).toHaveBeenCalledTimes(1);
    expect(o.restore).toHaveBeenCalledWith(1500);
    expect(o.redispatch).toHaveBeenCalledTimes(1);
    expect(cardImg.style.getPropertyValue('view-transition-name')).toBe('');
    release();
    await flush();
    expect(names()).toEqual([]);
    expect(isTransitionActive()).toBe(false);
  });

  it('card not found: transition skipped, position still restored', async () => {
    const { skip } = installVT();
    const o = options({ findCard: () => null });
    await runCaseStudyBackTransition(o);
    await flush();
    expect(skip).toHaveBeenCalledTimes(1);
    expect(o.restore).toHaveBeenCalledWith(1500);
    release();
    await flush();
    expect(names()).toEqual([]);
  });

  it('no API: plain, the router still gets the event once, nothing is named', async () => {
    const o = options();
    expect(await runCaseStudyBackTransition(o)).toBe('plain');
    expect(o.redispatch).toHaveBeenCalledTimes(1);
    expect(names()).toEqual([]);
    expect(document.documentElement.hasAttribute(VT_ATTR)).toBe(false);
    expect(isTransitionActive()).toBe(false);
  });

  it('startViewTransition throws: plain, event handed over once, names cleaned, no stuck flag', async () => {
    installVT({ throws: true });
    const o = options();
    expect(await runCaseStudyBackTransition(o)).toBe('plain');
    expect(o.redispatch).toHaveBeenCalledTimes(1);
    expect(names()).toEqual([]);
    expect(isTransitionActive()).toBe(false);
  });

  // MIX-1711 (A12, A13): no usable updateCallbackDone = the run does not throw, the drift is still corrected
  // and the names and the flag go at the end (before: `updateCallbackDone.catch` threw, cleanup was never hooked)
  for (const cbDone of ['missing', 'getter-throws'] as const)
    it(`updateCallbackDone ${cbDone}: transition runs, drift corrected, names and flag cleared at the end`, async () => {
      installVT({ cbDone });
      const o = options();
      await expect(runCaseStudyBackTransition(o)).resolves.toBe('transition');
      setScrollY(1700);
      await flush();
      expect(o.redispatch).toHaveBeenCalledTimes(1);
      // the restore in the callback plus the drift correction before the first frame
      expect(o.restore).toHaveBeenCalledTimes(2);
      release();
      await flush();
      expect(names()).toEqual([]);
      expect(isTransitionActive()).toBe(false);
    });
});

describe('MIX-1707: the list is scrolled only after the back is confirmed single', () => {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  it('MIX-1711: the confirmation window is 90 ms from the accepted back, 32 ms after the list is ready', () => {
    expect(BACK_CONFIRM_MS).toBe(90);
    expect(BACK_SETTLE_MS).toBe(32);
  });

  it('list ready at once: no restore before the window ends, one restore after it', async () => {
    installVT();
    const o = options({ confirmMs: 120 });
    await runCaseStudyBackTransition(o);
    await wait(60);
    expect(o.redispatch).toHaveBeenCalledTimes(1);
    expect(o.restore).not.toHaveBeenCalled();
    await wait(140);
    expect(o.restore).toHaveBeenCalledTimes(1);
    expect(o.restore).toHaveBeenCalledWith(1500);
  });

  it('refusal: a newer navigation inside the window = nothing restored, transition skipped', async () => {
    const { skip } = installVT();
    let alive = true;
    const o = options({ confirmMs: 120, live: () => alive });
    await runCaseStudyBackTransition(o);
    await wait(60);
    alive = false;
    await wait(200);
    expect(o.restore).not.toHaveBeenCalled();
    expect(skip).toHaveBeenCalled();
  });

  it('refusal: a second back inside the window wakes the callback at once (no wait to the end)', async () => {
    installVT();
    let alive = true;
    const o = options({ confirmMs: 400, live: () => alive });
    await runCaseStudyBackTransition(o);
    await wait(40);
    const t = (document as unknown as { startViewTransition: ReturnType<typeof vi.fn> })
      .startViewTransition.mock.results[0].value as { updateCallbackDone: Promise<void> };
    let done = false;
    void t.updateCallbackDone.then(() => (done = true));
    alive = false;
    skipBackTransition();
    await wait(30);
    expect(done).toBe(true);
    expect(o.restore).not.toHaveBeenCalled();
  });

  // MIX-1711: a second back queued behind the list render gets settleMs after the list is ready
  it('the list ready later than the window = restore settleMs after it is ready, not at once', async () => {
    installVT();
    let ready = false;
    const o = options({ confirmMs: 40, settleMs: 60, cardMs: 400, listReady: () => ready });
    await runCaseStudyBackTransition(o);
    await wait(100);
    ready = true;
    await wait(40);
    expect(o.restore).not.toHaveBeenCalled();
    await wait(80);
    expect(o.restore).toHaveBeenCalledTimes(1);
  });

  it('refusal: a second back during the settle wait after the list is ready = nothing restored', async () => {
    const { skip } = installVT();
    let alive = true;
    let ready = false;
    const o = options({
      confirmMs: 40,
      settleMs: 300,
      cardMs: 400,
      listReady: () => ready,
      live: () => alive,
    });
    await runCaseStudyBackTransition(o);
    await wait(80);
    ready = true;
    await wait(40);
    alive = false;
    skipBackTransition();
    await wait(60);
    expect(o.restore).not.toHaveBeenCalled();
    expect(skip).toHaveBeenCalled();
  });

  it('allowed twin: the window from acceptance still holds when the list is ready at once', async () => {
    installVT();
    const o = options({ confirmMs: 150, settleMs: 20 });
    await runCaseStudyBackTransition(o);
    await wait(100);
    expect(o.restore).not.toHaveBeenCalled();
    await wait(110);
    expect(o.restore).toHaveBeenCalledTimes(1);
  });

  it('allowed twin: the list ready later than the window = restore right when it is ready', async () => {
    installVT();
    let ready = false;
    const o = options({ confirmMs: 40, cardMs: 400, listReady: () => ready });
    await runCaseStudyBackTransition(o);
    await wait(100);
    expect(o.restore).not.toHaveBeenCalled();
    ready = true;
    await wait(60);
    expect(o.restore).toHaveBeenCalledTimes(1);
  });

  // the accepted back (claimBack) is what the transition takes over (caseStudyGeneration.ownBack)
  function acceptedBack() {
    resetBackState();
    const list = { pathname: '/portfolio/', search: '' };
    armSource(list);
    expect(claimBack(list)).toBe(true);
    expect(backOwned()).toBe(false);
  }

  it('the transition takes the restore before the router gets the event and keeps it on success', async () => {
    acceptedBack();
    const { spy } = installVT();
    const o = options();
    const atRouter: boolean[] = [];
    o.redispatch = vi.fn(() => atRouter.push(backOwned()));
    await runCaseStudyBackTransition(o);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(backOwned()).toBe(true);
    await flush();
    expect(atRouter).toEqual([true]);
    expect(backOwned()).toBe(true);
  });

  it('start throws: the restore is given back before the router gets the event', async () => {
    acceptedBack();
    installVT({ throws: true });
    const o = options();
    const atRouter: boolean[] = [];
    o.redispatch = vi.fn(() => atRouter.push(backOwned()));
    expect(await runCaseStudyBackTransition(o)).toBe('plain');
    expect(atRouter).toEqual([false]);
  });

  it('no API: the restore is never taken', async () => {
    acceptedBack();
    expect(await runCaseStudyBackTransition(options())).toBe('plain');
    expect(backOwned()).toBe(false);
  });
});

describe('MIX-1719: a late second back (after our list scroll) gives the root its position back', () => {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  /** Root at 0 before the list scroll; restore() really moves it (as startRestore does). */
  function late(over: Partial<BackRunOptions> = {}) {
    setScrollY(0);
    const calls: unknown[] = [];
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(((a: ScrollToOptions) => {
      calls.push(a);
      setScrollY(Number(a.top));
    }) as typeof window.scrollTo);
    const o = options({ restore: vi.fn((y: number) => setScrollY(y)), ...over });
    return { o, calls, scrollTo };
  }
  const INSTANT_0 = { top: 0, left: window.scrollX, behavior: 'instant' };

  it('second back after the restore: one instant scroll to the old position, before skipTransition', async () => {
    const { skip } = installVT();
    const { o, calls, scrollTo } = late();
    const order: string[] = [];
    scrollTo.mockImplementation(((a: ScrollToOptions) => {
      order.push(`scrollTo:${a.top}`);
      calls.push(a);
      setScrollY(Number(a.top));
    }) as typeof window.scrollTo);
    skip.mockImplementationOnce(() => order.push('skip'));
    await runCaseStudyBackTransition(o);
    await flush();
    expect(o.restore).toHaveBeenCalledWith(1500);
    expect(window.scrollY).toBe(1500);
    expect(skipBackTransition()).not.toBeNull();
    expect(calls).toEqual([INSTANT_0]);
    expect(window.scrollY).toBe(0);
    expect(order).toEqual(['scrollTo:0', 'skip']);
  });

  it('only once: a later skip of the same transition does not scroll again', async () => {
    installVT();
    const { o, calls } = late();
    await runCaseStudyBackTransition(o);
    await flush();
    skipBackTransition();
    expect(skipBackTransition()).toBeNull();
    expect(calls).toHaveLength(1);
  });

  it('refusal: second back inside the window (before the restore) = no scroll at all', async () => {
    installVT();
    let alive = true;
    const { o, calls } = late({ confirmMs: 300, live: () => alive });
    await runCaseStudyBackTransition(o);
    await wait(40);
    alive = false;
    skipBackTransition();
    await wait(60);
    expect(o.restore).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
    expect(window.scrollY).toBe(0);
  });

  it('refusal: the root moved away from our position (user, browser) = left where it is', async () => {
    installVT();
    const { o, calls } = late();
    await runCaseStudyBackTransition(o);
    await flush();
    setScrollY(1500 + 5);
    skipBackTransition();
    expect(calls).toEqual([]);
    expect(window.scrollY).toBe(1505);
  });

  it('allowed twin: drift within 4 px of our position still gives the old position back', async () => {
    installVT();
    const { o, calls } = late();
    await runCaseStudyBackTransition(o);
    await flush();
    setScrollY(1500 + 4);
    skipBackTransition();
    expect(calls).toEqual([INSTANT_0]);
  });

  it('refusal: the old position equals ours (list was already there) = no scroll', async () => {
    installVT();
    const { o, calls } = late();
    setScrollY(1497);
    await runCaseStudyBackTransition(o);
    await flush();
    skipBackTransition();
    expect(calls).toEqual([]);
  });

  it('refusal: the old position is not a number = no scroll', async () => {
    installVT();
    const { o, calls } = late();
    setScrollY(Number.NaN);
    await runCaseStudyBackTransition(o);
    await flush();
    skipBackTransition();
    expect(calls).toEqual([]);
  });

  it('refusal: the transition already finished = nothing to skip, no scroll', async () => {
    installVT();
    const { o, calls } = late();
    await runCaseStudyBackTransition(o);
    await flush();
    release();
    await wait(0);
    expect(skipBackTransition()).toBeNull();
    expect(calls).toEqual([]);
  });

  it('scrollTo throws: the transition is still skipped and the back still handed over', async () => {
    const { skip } = installVT();
    const { o, scrollTo } = late();
    scrollTo.mockImplementation(() => {
      throw new Error('scroll');
    });
    await runCaseStudyBackTransition(o);
    await flush();
    const released = skipBackTransition();
    expect(released).not.toBeNull();
    expect(skip).toHaveBeenCalled();
    await expect(released).resolves.toBeUndefined();
    expect(isTransitionActive()).toBe(false);
  });
});

describe('MIX-1719: BackSkip.restoring keeps the position from before the FIRST list scroll', () => {
  it('a second restoring call (e.g. a drift fix) does not overwrite the old position', () => {
    const calls: unknown[] = [];
    vi.spyOn(window, 'scrollTo').mockImplementation(((a: ScrollToOptions) => {
      calls.push(a);
      setScrollY(Number(a.top));
    }) as typeof window.scrollTo);
    const s = setBackSkip({ skipTransition: vi.fn() }, vi.fn());
    setScrollY(0);
    s.restoring(window, 1500, (y) => setScrollY(y));
    setScrollY(1502);
    s.restoring(window, 1500, (y) => setScrollY(y));
    expect(skipBackTransition()).not.toBeNull();
    expect(calls).toEqual([{ top: 0, left: window.scrollX, behavior: 'instant' }]);
  });

  it('no window: the scroll still runs and a later skip scrolls nothing', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const run = vi.fn();
    const s = setBackSkip({ skipTransition: vi.fn() }, vi.fn());
    s.restoring(null, 1500, run);
    expect(run).toHaveBeenCalledWith(1500);
    skipBackTransition();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('MIX-1729: a history traverse during our back transition gets no browser scroll restore', () => {
  const setNav = (nav: unknown) =>
    Object.defineProperty(window, 'navigation', { value: nav, configurable: true });
  const fakeNav = () => {
    const nav = new EventTarget();
    setNav(nav);
    return nav;
  };
  /** A `navigate` event as Chrome sends it for history.back() within the same document. */
  const navEvent = (over: Record<string, unknown> = {}) => {
    const e = new Event('navigate', { cancelable: true });
    const intercept = vi.fn();
    const props = {
      navigationType: 'traverse',
      canIntercept: true,
      hashChange: false,
      intercept,
      ...over,
    };
    for (const [k, v] of Object.entries(props)) Object.defineProperty(e, k, { value: v });
    return { e, intercept };
  };
  const MANUAL = { scroll: 'manual', focusReset: 'manual' };
  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).navigation;
    skipBackTransition();
  });

  it('the transition hands its window to the skip: the second back is intercepted with scroll manual', async () => {
    const nav = fakeNav();
    installVT();
    await runCaseStudyBackTransition(options());
    const { e, intercept } = navEvent();
    nav.dispatchEvent(e);
    expect(intercept).toHaveBeenCalledTimes(1);
    expect(intercept).toHaveBeenCalledWith(MANUAL);
    // the intercept is called on the event itself (Chrome throws "Illegal invocation" otherwise)
    expect(intercept.mock.instances[0]).toBe(e);
  });

  it('the skip (second back handled) ends the suppression: a later traverse keeps the browser restore', async () => {
    const nav = fakeNav();
    installVT();
    await runCaseStudyBackTransition(options());
    expect(skipBackTransition()).not.toBeNull();
    const { e, intercept } = navEvent();
    nav.dispatchEvent(e);
    expect(intercept).not.toHaveBeenCalled();
  });

  it('the end of the transition (finished) ends the suppression', async () => {
    const nav = fakeNav();
    installVT();
    await runCaseStudyBackTransition(options());
    await flush();
    release();
    await flush();
    const { e, intercept } = navEvent();
    nav.dispatchEvent(e);
    expect(intercept).not.toHaveBeenCalled();
  });

  it.each([
    ['push', { navigationType: 'push' }],
    ['replace', { navigationType: 'replace' }],
    ['reload', { navigationType: 'reload' }],
    ['no navigationType', { navigationType: undefined }],
    ['cross-document (canIntercept false)', { canIntercept: false }],
    ['canIntercept not a boolean', { canIntercept: 'true' }],
    ['fragment change', { hashChange: true }],
    ['hashChange unknown', { hashChange: undefined }],
  ])('refusal: %s = no intercept (browser restore stays)', (_name, over) => {
    const nav = fakeNav();
    setBackSkip({ skipTransition: vi.fn() }, vi.fn(), 100, window);
    const { e, intercept } = navEvent(over);
    nav.dispatchEvent(e);
    expect(intercept).not.toHaveBeenCalled();
    // allowed twin: the same skip intercepts a same-document traverse
    const twin = navEvent();
    nav.dispatchEvent(twin.e);
    expect(twin.intercept).toHaveBeenCalledWith(MANUAL);
  });

  it('refusal: an event already cancelled by another listener is left alone', () => {
    const nav = fakeNav();
    nav.addEventListener('navigate', (ev) => ev.preventDefault());
    setBackSkip({ skipTransition: vi.fn() }, vi.fn(), 100, window);
    const { e, intercept } = navEvent();
    nav.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    expect(intercept).not.toHaveBeenCalled();
  });

  it('refusal: intercept missing or throwing = no error, the skip still runs and hands over', () => {
    const nav = fakeNav();
    const skip = vi.fn();
    setBackSkip({ skipTransition: skip }, vi.fn(), 100, window);
    expect(() => nav.dispatchEvent(navEvent({ intercept: 'x' }).e)).not.toThrow();
    const thrower = vi.fn(() => {
      throw new DOMException('no', 'SecurityError');
    });
    const errors = vi.fn();
    window.addEventListener('error', errors);
    nav.dispatchEvent(navEvent({ intercept: thrower }).e);
    window.removeEventListener('error', errors);
    expect(thrower).toHaveBeenCalledTimes(1);
    expect(errors).not.toHaveBeenCalled();
    expect(skipBackTransition()).not.toBeNull();
    expect(skip).toHaveBeenCalledTimes(1);
  });

  it('refusal: no Navigation API (missing, null, no addEventListener, throwing getter) = no listener, skip works', () => {
    const navs: unknown[] = [undefined, null, {}, { addEventListener: 'x' }];
    for (const nav of navs) {
      setNav(nav);
      const skip = vi.fn();
      setBackSkip({ skipTransition: skip }, vi.fn(), 100, window);
      expect(skipBackTransition()).not.toBeNull();
      expect(skip).toHaveBeenCalledTimes(1);
    }
    Object.defineProperty(window, 'navigation', {
      get() {
        throw new Error('getter');
      },
      configurable: true,
    });
    const skip = vi.fn();
    expect(() => setBackSkip({ skipTransition: skip }, vi.fn(), 100, window)).not.toThrow();
    expect(skipBackTransition()).not.toBeNull();
    expect(skip).toHaveBeenCalledTimes(1);
  });

  it('no window given = nothing is listened to', () => {
    const nav = fakeNav();
    const add = vi.spyOn(nav, 'addEventListener');
    setBackSkip({ skipTransition: vi.fn() }, vi.fn());
    expect(add).not.toHaveBeenCalled();
  });

  it('release removes exactly its own listener, once; a newer skip keeps intercepting', () => {
    const nav = fakeNav();
    const remove = vi.spyOn(nav, 'removeEventListener');
    const older = setBackSkip({ skipTransition: vi.fn() }, vi.fn(), 100, window);
    setBackSkip({ skipTransition: vi.fn() }, vi.fn(), 100, window);
    older.release();
    older.release();
    expect(remove).toHaveBeenCalledTimes(1);
    const { e, intercept } = navEvent();
    nav.dispatchEvent(e);
    expect(intercept).toHaveBeenCalledTimes(1);
  });

  it('a throwing removeEventListener does not stop the release', () => {
    const nav = fakeNav();
    vi.spyOn(nav, 'removeEventListener').mockImplementation(() => {
      throw new Error('remove');
    });
    const s = setBackSkip({ skipTransition: vi.fn() }, vi.fn(), 100, window);
    expect(() => s.release()).not.toThrow();
    expect(skipBackTransition()).toBeNull();
  });
});
