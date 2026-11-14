import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  backRestoreTarget,
  isCaseStudyRoute,
  isRecordingHeld,
  holdRecording,
  listKey,
  manualRestorationFor,
  planBack,
  recordScroll,
  resetPositions,
  revertManualRestoration,
  savedPosition,
} from '@/utils/caseStudyBack';
import { canReach, startRestore, waitUntil } from '@/utils/caseStudyRestore';
import {
  type BackLocation,
  armSource,
  backOwned,
  backTicket,
  bumpGeneration,
  claimBack,
  currentGeneration,
  dropClaim,
  listenUserInput,
  ownBack,
  resetBackState,
} from '@/utils/caseStudyGeneration';

beforeEach(() => {
  vi.useFakeTimers();
  resetPositions();
  resetBackState();
});
afterEach(() => {
  resetPositions();
  vi.useRealTimers();
});

describe('isCaseStudyRoute / listKey (MIX-1675)', () => {
  it('matches only /portfolio/<slug>/', () => {
    expect(isCaseStudyRoute('/portfolio/alfa/')).toBe(true);
    expect(isCaseStudyRoute('/portfolio/alfa')).toBe(true);
    expect(isCaseStudyRoute('/portfolio/')).toBe(false);
    expect(isCaseStudyRoute('/portfolio/alfa/beta/')).toBe(false);
    expect(isCaseStudyRoute('/uslugi/alfa/')).toBe(false);
    expect(isCaseStudyRoute('')).toBe(false);
    expect(isCaseStudyRoute(null)).toBe(false);
    expect(isCaseStudyRoute(undefined)).toBe(false);
  });
  it('trailing slash does not split a list key', () => {
    expect(listKey('/portfolio/')).toBe(listKey('/portfolio'));
    expect(listKey('/')).toBe('/');
  });
});

describe('recordScroll / savedPosition (keyed by list path)', () => {
  it('stores per path and reads it back with either slash form', () => {
    recordScroll('/portfolio/', 1234.4);
    recordScroll('/uslugi/', 80);
    expect(savedPosition('/portfolio')).toBe(1234);
    expect(savedPosition('/uslugi/')).toBe(80);
    expect(savedPosition('/kontakt/')).toBeNull();
  });
  it('the last value wins', () => {
    recordScroll('/portfolio/', 100);
    recordScroll('/portfolio/', 900);
    expect(savedPosition('/portfolio/')).toBe(900);
  });
  it.each([
    ['case-study path', '/portfolio/alfa/', 500],
    ['NaN', '/portfolio/', NaN],
    ['negative', '/portfolio/', -5],
    ['Infinity', '/portfolio/', Infinity],
    ['empty path', '', 10],
  ])('refuses %s', (_n, path, y) => {
    recordScroll(path, y);
    expect(savedPosition(path || '/portfolio/')).toBeNull();
  });
  it('is held while a back navigation restores (browser scroll events must not overwrite)', () => {
    recordScroll('/portfolio/', 900);
    holdRecording();
    expect(isRecordingHeld()).toBe(true);
    recordScroll('/portfolio/', 0);
    expect(savedPosition('/portfolio/')).toBe(900);
    vi.advanceTimersByTime(3000);
    expect(isRecordingHeld()).toBe(false);
    recordScroll('/portfolio/', 10);
    expect(savedPosition('/portfolio/')).toBe(10);
  });
  it('keeps at most 50 entries, dropping the oldest', () => {
    for (let i = 0; i < 60; i++) recordScroll(`/p${i}/`, i);
    expect(savedPosition('/p0/')).toBeNull();
    expect(savedPosition('/p59/')).toBe(59);
  });
});

describe('backRestoreTarget', () => {
  const base = { from: '/portfolio/alfa/', to: '/portfolio/', navType: 'POP', saved: 1500 };
  it('POP from a case study to a page with a saved position restores it', () => {
    expect(backRestoreTarget(base)).toBe(1500);
    expect(backRestoreTarget({ ...base, saved: 0 })).toBe(0);
  });
  it.each([
    ['PUSH (menu link)', { navType: 'PUSH' }],
    ['REPLACE', { navType: 'REPLACE' }],
    ['not from a case study', { from: '/kontakt/' }],
    ['to another case study', { to: '/portfolio/beta/' }],
    ['no saved position (direct entry)', { saved: null }],
  ])('%s = null (browser default)', (_n, over) => {
    expect(backRestoreTarget({ ...base, ...over })).toBeNull();
  });
});

describe('planBack: allowlist, fail-closed', () => {
  const ok = {
    from: '/portfolio/alfa/',
    to: '/portfolio/',
    saved: 700,
    enabled: true,
    supported: true,
    motion: true,
    active: false,
    hero: true,
  };
  it('every condition met = transition', () => {
    expect(planBack(ok)).toEqual({ kind: 'transition', y: 700 });
  });
  it.each([
    ['no API support', { supported: false }],
    ['reduced motion', { motion: false }],
    ['another transition active', { active: true }],
    ['no hero in the DOM', { hero: false }],
  ])('%s = restore without animation', (_n, over) => {
    expect(planBack({ ...ok, ...over })).toEqual({ kind: 'restore', y: 700 });
  });
  it.each([
    ['switch off (new behaviour hidden, as before MIX-1675)', { enabled: false }],
    ['switch off, nothing else wrong, saved position present', { enabled: false, saved: 0 }],
    ['direct entry (no saved position)', { saved: null }],
    ['not from a case study', { from: '/kontakt/' }],
    ['to a case study', { to: '/portfolio/beta/' }],
  ])('%s = none', (_n, over) => {
    expect(planBack({ ...ok, ...over })).toEqual({ kind: 'none' });
  });
});

describe('startRestore: instant, waits for height', () => {
  const mk = (height: number) => {
    const doc = { documentElement: { scrollHeight: height } } as unknown as Document;
    const win = { innerHeight: 800, scrollTo: vi.fn() };
    let cb: () => void = () => undefined;
    const unwatch = vi.fn();
    const watch = (c: () => void) => {
      cb = c;
      return unwatch;
    };
    return { doc, win, watch, unwatch, tick: () => cb() };
  };

  it('canReach compares the document height with the target', () => {
    const { doc, win } = mk(2000);
    expect(canReach(1200, { doc, win })).toBe(true);
    expect(canReach(1300, { doc, win })).toBe(false);
  });

  it('scrolls at once with behavior instant (never smooth) when the page is tall enough', () => {
    const m = mk(3000);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
    expect(m.win.scrollTo).toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
    expect(m.unwatch).toHaveBeenCalled();
  });

  it('waits while the page is short and scrolls on the first layout that reaches the target', () => {
    const m = mk(900);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    expect(m.win.scrollTo).not.toHaveBeenCalled();
    (m.doc.documentElement as unknown as { scrollHeight: number }).scrollHeight = 3000;
    m.tick();
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
    m.tick();
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('gives up after maxMs: scrolls as far as it can, once, and stops watching', () => {
    const m = mk(900);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    vi.advanceTimersByTime(1499);
    expect(m.win.scrollTo).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
    expect(m.unwatch).toHaveBeenCalled();
    m.tick();
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('a newer restore cancels the previous one', () => {
    const a = mk(900);
    const b = mk(3000);
    startRestore(1500, { doc: a.doc, win: a.win, watch: a.watch, maxMs: 1500 });
    startRestore(400, { doc: b.doc, win: b.win, watch: b.watch, maxMs: 1500 });
    expect(a.unwatch).toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    expect(a.win.scrollTo).not.toHaveBeenCalled();
  });

  it('G3: a new generation stops a pending restore on the next layout, without scrolling', () => {
    const m = mk(900);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    bumpGeneration();
    (m.doc.documentElement as unknown as { scrollHeight: number }).scrollHeight = 3000;
    m.tick();
    expect(m.win.scrollTo).not.toHaveBeenCalled();
    expect(m.unwatch).toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    expect(m.win.scrollTo).not.toHaveBeenCalled();
  });

  it('G4: a new generation also stops the restore at the time limit (no layout in between)', () => {
    const t = mk(900);
    startRestore(1500, { doc: t.doc, win: t.win, watch: t.watch, maxMs: 1500 });
    vi.advanceTimersByTime(1000);
    bumpGeneration();
    vi.advanceTimersByTime(600);
    expect(t.win.scrollTo).not.toHaveBeenCalled();
  });

  it('F2: a failed guard stops the restore without scrolling (layout and timeout paths)', () => {
    const m = mk(900);
    let on = true;
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500, guard: () => on });
    on = false;
    (m.doc.documentElement as unknown as { scrollHeight: number }).scrollHeight = 3000;
    m.tick();
    expect(m.win.scrollTo).not.toHaveBeenCalled();
    expect(m.unwatch).toHaveBeenCalled();
    const t = mk(900);
    startRestore(1500, { doc: t.doc, win: t.win, watch: t.watch, maxMs: 1500, guard: () => false });
    vi.advanceTimersByTime(2000);
    expect(t.win.scrollTo).not.toHaveBeenCalled();
  });

  it('F2: the guard is checked again at the limit: a restore that lost its page does not scroll then', () => {
    const t = mk(900);
    let on = true;
    startRestore(1500, { doc: t.doc, win: t.win, watch: t.watch, maxMs: 1500, guard: () => on });
    vi.advanceTimersByTime(1000);
    on = false; // no layout tick in between: only the timeout can still scroll
    vi.advanceTimersByTime(600);
    expect(t.win.scrollTo).not.toHaveBeenCalled();
  });

  it('a passing guard does not stop the restore', () => {
    const m = mk(3000);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500, guard: () => true });
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
    const t = mk(900);
    startRestore(1500, { doc: t.doc, win: t.win, watch: t.watch, maxMs: 1500, guard: () => true });
    vi.advanceTimersByTime(1600);
    expect(t.win.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('lets recording resume after the restore ends', () => {
    const m = mk(3000);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    expect(isRecordingHeld()).toBe(true);
    vi.advanceTimersByTime(200);
    expect(isRecordingHeld()).toBe(false);
  });
});

describe('waitUntil', () => {
  it('resolves true as soon as the predicate holds', async () => {
    let n = 0;
    const p = waitUntil(() => ++n >= 3, 300);
    await vi.advanceTimersByTimeAsync(100);
    await expect(p).resolves.toBe(true);
  });
  it('resolves false after the time limit, also when the predicate throws', async () => {
    const p = waitUntil(() => {
      throw new Error('x');
    }, 300);
    await vi.advanceTimersByTimeAsync(400);
    await expect(p).resolves.toBe(false);
  });
  it('G5: ends at once with false when the navigation is no longer alive', async () => {
    let alive = true;
    let done: boolean | null = null;
    void waitUntil(
      () => false,
      300,
      () => alive,
    ).then((v) => (done = v));
    await vi.advanceTimersByTimeAsync(50);
    expect(done).toBeNull();
    alive = false;
    await vi.advanceTimersByTimeAsync(20);
    expect(done).toBe(false);
  });
});

describe('backTicket: one accepted back, one generation, one list location (fail-closed)', () => {
  const at = (pathname: unknown, search: unknown = '') => ({ pathname, search }) as BackLocation;
  /** PUSH from `loc` to a case study, then the popstate back onto `loc`. */
  const claimed = (loc: BackLocation) => {
    armSource(loc);
    bumpGeneration();
    return claimBack(loc);
  };

  it('alive while generation and path + query are unchanged (slash form ignored)', () => {
    let loc = at('/portfolio/', '?k=1');
    expect(claimed(loc)).toBe(true);
    const live = backTicket(() => loc);
    expect(live()).toBe(true);
    loc = at('/portfolio', '?k=1');
    expect(live()).toBe(true);
  });
  it('a popstate or link (new generation) ends it, also on the same location', () => {
    const loc = at('/portfolio/');
    claimed(loc);
    const live = backTicket(() => loc);
    bumpGeneration();
    expect(live()).toBe(false);
    expect(backTicket(() => loc)()).toBe(false);
  });
  it('another path or another query ends it', () => {
    let loc = at('/portfolio/');
    claimed(loc);
    const live = backTicket(() => loc);
    loc = at('/');
    expect(live()).toBe(false);
    loc = at('/portfolio/', '?q=x');
    expect(live()).toBe(false);
  });
  it('a ticket taken on another location than the accepted list is never alive', () => {
    claimed(at('/portfolio/'));
    expect(backTicket(() => at('/'))()).toBe(false);
    expect(backTicket(() => at('/portfolio/', '?q=1'))()).toBe(false);
  });
  it('unknown, missing or broken location = never alive', () => {
    claimed(at('/portfolio/'));
    expect(backTicket(() => null)()).toBe(false);
    expect(backTicket(() => undefined)()).toBe(false);
    expect(backTicket(() => at(42))()).toBe(false);
    expect(backTicket(() => at('/portfolio/', null))()).toBe(false);
    expect(backTicket(() => at('portfolio/'))()).toBe(false);
    expect(
      backTicket(() => {
        throw new Error('x');
      })(),
    ).toBe(false);
    let broken = false;
    const live = backTicket(() => {
      if (broken) throw new Error('x');
      return at('/portfolio/');
    });
    expect(live()).toBe(true);
    broken = true;
    expect(live()).toBe(false);
  });
  it('the generation only grows', () => {
    const g = currentGeneration();
    bumpGeneration();
    expect(currentGeneration()).toBe(g + 1);
  });
});

describe('claimBack: restore only on one exact back onto the source list (MIX-1675 r6)', () => {
  const at = (pathname: unknown, search: unknown = '', hash = '') =>
    ({ pathname, search, hash }) as BackLocation;
  const list = at('/portfolio/');

  it('allowed: first popstate onto the source list (slash form ignored)', () => {
    armSource(list);
    expect(claimBack(at('/portfolio'))).toBe(true);
    expect(backTicket(() => list)()).toBe(true);
  });
  it.each([
    ['another path', at('/')],
    ['same path, other query', at('/portfolio/', '?q=1')],
    ['same list with a hash', at('/portfolio/', '', '#x')],
    ['missing target', null],
    ['broken target', at(42)],
    ['relative path', at('portfolio/')],
  ])('refused: %s', (_n, target) => {
    armSource(list);
    expect(claimBack(target)).toBe(false);
    expect(backTicket(() => list)()).toBe(false);
  });
  it('MIX-1707: ownership: only the accepted back can be owned; a new popstate starts unowned', () => {
    // no accepted back: nothing to own, no error
    expect(() => ownBack(true)).not.toThrow();
    expect(backOwned()).toBe(false);
    armSource(list);
    expect(claimBack(list)).toBe(true);
    expect(backOwned()).toBe(false);
    ownBack(true);
    expect(backOwned()).toBe(true);
    ownBack(false);
    expect(backOwned()).toBe(false);
    ownBack(true);
    // the next popstate (refused) replaces the claim: not owned any more
    expect(claimBack(list)).toBe(false);
    expect(backOwned()).toBe(false);
    armSource(list);
    claimBack(list);
    ownBack(true);
    dropClaim();
    expect(backOwned()).toBe(false);
  });
  it('refused: no source list (direct entry) or a broken one', () => {
    expect(claimBack(list)).toBe(false);
    armSource(null);
    expect(claimBack(list)).toBe(false);
    armSource(at('portfolio/'));
    expect(claimBack(at('portfolio/'))).toBe(false);
  });
  it('refused: the second popstate, also onto the same list (the first one uses the source up)', () => {
    armSource(list);
    expect(claimBack(at('/'))).toBe(false);
    expect(claimBack(list)).toBe(false);
    armSource(list);
    expect(claimBack(list)).toBe(true);
    bumpGeneration();
    expect(claimBack(list)).toBe(false);
    expect(backTicket(() => list)()).toBe(false);
  });
  it('user input (dropClaim) ends an accepted back, also for tickets already taken', () => {
    armSource(list);
    claimBack(list);
    const live = backTicket(() => list);
    dropClaim();
    expect(live()).toBe(false);
    expect(backTicket(() => list)()).toBe(false);
  });
});

describe('manualRestorationFor / revertManualRestoration (MIX-1675 r6)', () => {
  /** History whose scrollRestoration counts writes; `entry()` simulates the browser moving to another entry. */
  function fakeWin() {
    const h = {
      value: 'auto' as ScrollRestoration,
      writes: 0,
      get scrollRestoration() {
        return this.value;
      },
      set scrollRestoration(v: ScrollRestoration) {
        this.writes += 1;
        this.value = v;
      },
    };
    const win = {
      history: h,
      setTimeout: (cb: () => void, ms: number) => setTimeout(cb, ms),
      clearTimeout: (t: ReturnType<typeof setTimeout>) => clearTimeout(t),
    } as unknown as Window;
    return { h, win };
  }

  it('manual for the window, then back to the previous mode (one write each way)', () => {
    const { h, win } = fakeWin();
    manualRestorationFor(win, 1200);
    expect(h.value).toBe('manual');
    vi.advanceTimersByTime(1300);
    expect(h.value).toBe('auto');
    expect(h.writes).toBe(2);
  });
  it('revert now: previous mode at once, the timer does not write again', () => {
    const { h, win } = fakeWin();
    manualRestorationFor(win, 1200);
    revertManualRestoration();
    expect(h.value).toBe('auto');
    vi.advanceTimersByTime(1300);
    expect(h.writes).toBe(2);
  });
  it('another entry already in the previous mode: nothing is written (no change for the browser)', () => {
    const { h, win } = fakeWin();
    manualRestorationFor(win, 1200);
    h.value = 'auto'; // browser moved to another entry, ours is not visible any more
    revertManualRestoration();
    vi.advanceTimersByTime(1300);
    expect(h.writes).toBe(1);
  });
  it('the timer of a window ended early does not end a newer window', () => {
    const { h, win } = fakeWin();
    manualRestorationFor(win, 1200);
    revertManualRestoration();
    vi.advanceTimersByTime(1000);
    manualRestorationFor(win, 1200);
    vi.advanceTimersByTime(300); // the first timer would have fired at 1200
    expect(h.value).toBe('manual');
    vi.advanceTimersByTime(1000);
    expect(h.value).toBe('auto');
  });
  it('r6b: an entry already in manual mode (not set by us) is never touched, not even by the revert', () => {
    const { h, win } = fakeWin();
    h.value = 'manual';
    manualRestorationFor(win, 1200);
    h.value = 'auto'; // the browser moved to another entry in auto mode
    revertManualRestoration();
    vi.advanceTimersByTime(1300);
    expect(h.value).toBe('auto');
    expect(h.writes).toBe(0);
  });
  it('r6b: allowed twin: from auto our window sets manual and the revert ends it on the same entry', () => {
    const { h, win } = fakeWin();
    manualRestorationFor(win, 1200);
    expect(h.value).toBe('manual');
    revertManualRestoration();
    expect(h.value).toBe('auto');
    expect(h.writes).toBe(2);
  });
  it('r6b: an unknown mode (not auto) is left alone', () => {
    const { h, win } = fakeWin();
    h.value = 'weird' as ScrollRestoration;
    manualRestorationFor(win, 1200);
    vi.advanceTimersByTime(1300);
    expect(h.value).toBe('weird');
    expect(h.writes).toBe(0);
  });
  it('a new window while one is open first ends the old one (never stuck on manual)', () => {
    const { h, win } = fakeWin();
    manualRestorationFor(win, 1200);
    manualRestorationFor(win, 1200);
    vi.advanceTimersByTime(1300);
    expect(h.value).toBe('auto');
  });
});

describe('MIX-1699: a link (PUSH) within the manual window after an accepted back', () => {
  /**
   * History with entries, as in the HTML spec: a push creates a new entry that copies the scroll
   * restoration mode of the current one; `scrollRestoration` reads and writes the current entry only.
   */
  function historyWithEntries() {
    const list = { mode: 'auto' as ScrollRestoration };
    const h = {
      cur: list,
      get scrollRestoration() {
        return this.cur.mode;
      },
      set scrollRestoration(v: ScrollRestoration) {
        this.cur.mode = v;
      },
      push() {
        this.cur = { mode: this.cur.mode };
        return this.cur;
      },
    };
    const win = {
      history: h,
      setTimeout: (cb: () => void, ms: number) => setTimeout(cb, ms),
      clearTimeout: (t: ReturnType<typeof setTimeout>) => clearTimeout(t),
    } as unknown as Window;
    return { h, list, win };
  }
  let unlisten: () => void = () => undefined;
  afterEach(() => {
    unlisten();
    revertManualRestoration();
  });

  it('measured residual: a push with no input first leaves the list entry in manual (timer writes only the new entry)', () => {
    const { h, list, win } = historyWithEntries();
    manualRestorationFor(win, 1200);
    const next = h.push();
    expect(next.mode).toBe('manual'); // copied from the list entry
    vi.advanceTimersByTime(1300);
    expect(next.mode).toBe('auto');
    expect(list.mode).toBe('manual');
  });

  it.each(['mousedown', 'touchstart', 'keydown', 'click'])(
    'input (%s) before the push ends the window on the list entry: both entries end in auto',
    (type) => {
      const { h, list, win } = historyWithEntries();
      unlisten = listenUserInput(window);
      manualRestorationFor(win, 1200);
      window.dispatchEvent(new Event(type));
      expect(list.mode).toBe('auto');
      const next = h.push();
      expect(next.mode).toBe('auto');
      vi.advanceTimersByTime(1300);
      expect(list.mode).toBe('auto');
      expect(next.mode).toBe('auto');
    },
  );

  it('allowed twin: without input the window stays manual on the list entry until its timer', () => {
    const { list, win } = historyWithEntries();
    unlisten = listenUserInput(window);
    manualRestorationFor(win, 1200);
    vi.advanceTimersByTime(1000);
    expect(list.mode).toBe('manual');
    vi.advanceTimersByTime(300);
    expect(list.mode).toBe('auto');
  });
});
