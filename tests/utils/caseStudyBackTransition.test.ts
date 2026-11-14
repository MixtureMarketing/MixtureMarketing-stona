import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BACK_CONFIRM_MS,
  runCaseStudyBackTransition,
  type BackRunOptions,
} from '@/utils/caseStudyBackTransition';
import { armSource, backOwned, claimBack, resetBackState } from '@/utils/caseStudyGeneration';
import { skipBackTransition } from '@/utils/caseStudyBackSkip';
import { isTransitionActive } from '@/utils/caseStudyTransition';
import { VT_ATTR } from '@/utils/viewTransitions';

const names = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[style]'))
    .map((el) => el.style.getPropertyValue('view-transition-name'))
    .filter(Boolean);

/** The update callback runs in a later task; `finished` stays open until release() is called. */
let release: () => void = () => undefined;
function installVT(opts: { throws?: boolean } = {}) {
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
    expect(document.documentElement.getAttribute(VT_ATTR)).toBe('realizacja');
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
});

describe('MIX-1707: the list is scrolled only after the back is confirmed single', () => {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  it('the confirmation window is 250 ms', () => expect(BACK_CONFIRM_MS).toBe(250));

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
